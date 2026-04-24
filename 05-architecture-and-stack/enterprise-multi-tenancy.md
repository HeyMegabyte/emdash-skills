---
name: "Enterprise Multi-Tenancy"
description: "DB-per-tenant D1, RBAC/ABAC authorization (Cerbos/OPA), audit logging (R2 WORM), SSO/SCIM (Clerk Enterprise Connections), data residency (D1 jurisdiction), per-tenant rate limiting (CF RateLimit binding), white-labeling (CF for SaaS), admin impersonation, data portability (EU Data Act)."
updated: "2026-04-23"
---

# Enterprise Multi-Tenancy

## Tenant Isolation (D1-per-Tenant)
Each tenant gets its own D1 database. Create on signup: `wrangler d1 create tenant-${orgId} --jurisdiction eu`. Bind dynamically via `env.DB_${orgId}` or D1 binding per request using org lookup table in shared D1. Benefits: data isolation by default, per-tenant backup/restore, jurisdiction compliance, no row-level security bugs. Shared D1 for cross-tenant data (plans, features, billing).

Migration strategy: run `drizzle-kit push` against each tenant DB on deploy. Track schema version in shared DB. Batch migrate with `wrangler d1 execute --batch`. Rollback: D1 Time Travel per-tenant PIT recovery.

## Authorization (RBAC + ABAC)
Clerk Organizations: built-in org membership, roles (admin/member/viewer), permissions. `auth().orgRole` in middleware. For complex policies: Cerbos (policy-as-code, sidecar on CF Container) or OPA (Rego policies, compile to WASM for Workers). Pattern: Clerk authenticates → org context → Cerbos/OPA authorizes per-resource.

Default roles: `owner` (full CRUD + billing + member mgmt), `admin` (CRUD + member mgmt), `member` (CRUD own resources), `viewer` (read-only), `billing` (billing-only). Custom roles via Clerk Dashboard or API.

ABAC attributes: `org.plan`, `resource.owner`, `user.role`, `request.ip`, `time.hour`. Example: "members can edit documents they own, admins can edit all, viewers can only read, free-tier orgs limited to 10 documents."

## Audit Logging (R2 WORM)
Every mutating API call: `{ timestamp, actor, orgId, action, resource, before, after, ip, userAgent }`. Write to R2 with WORM (Write Once Read Many) lifecycle policy — immutable for compliance. Batch via `ctx.waitUntil()` to avoid latency. Query via R2 SQL (when GA) or export to BigQuery/ClickHouse.

Retention: 7 years financial (SOX), 6 years GDPR, configurable per-tenant. R2 lifecycle rules for auto-archival. Sentry breadcrumbs for real-time error context.

## SSO/SCIM (Clerk Enterprise Connections)
Clerk Enterprise Connections: SAML/OIDC SSO, SCIM provisioning. Per-org SSO config via dashboard or API. SCIM endpoints auto-sync: user create/update/deactivate from IdP (Okta/Azure AD/OneLogin). JIT provisioning: first SSO login auto-creates Clerk user + org membership.

Enterprise plan gate: SSO/SCIM features behind `enterprise` plan check via Stripe Entitlements API. Show "Contact Sales" on pricing page.

## Data Residency (D1 Jurisdiction)
`--jurisdiction eu` restricts D1 to EU data centers (GDPR Art. 44). `--jurisdiction fedramp` for US government. Per-tenant jurisdiction stored in shared config DB. Workers route to correct D1 binding based on org jurisdiction. Display data location in tenant settings.

## Per-Tenant Rate Limiting
CF Rate Limiting binding: `env.RATE_LIMITER.limit({ key: orgId })`. Tier-based limits: free=100 req/min, pro=1000 req/min, enterprise=custom. Return `429` with `Retry-After` header. Track in PostHog: `rate_limit_hit` event with orgId.

## White-Labeling (CF for SaaS)
Cloudflare for SaaS: tenants bring custom domains. `PUT /zones/{zone_id}/custom_hostnames` to register. SSL auto-provisioned. Workers routes match custom hostname → resolve tenant → serve branded experience. Per-tenant: logo, colors, favicon, email templates (Resend per-domain).

## Admin Impersonation
Clerk `impersonate()`: admin logs in as any user within their org. Audit-logged (impersonator ID stored). Visual indicator: persistent banner "Acting as [user]". Auto-expire after 1hr. Requires `org:admin` permission. Disable for billing/payment actions.

## Data Portability (EU Data Act 2025)
Export endpoint: `GET /api/org/{orgId}/export` returns ZIP of all tenant data (JSON + media). Include: users, content, settings, billing history, audit logs. Exclude: system internals, other tenants. GDPR Art. 20 right to portability. EU Data Act (Sept 2025): mandatory machine-readable export for all SaaS. Deletion endpoint: `DELETE /api/org/{orgId}` with 30-day grace period.

## IP Allowlisting
Enterprise customers: restrict API access to approved IP ranges. Store per-org in D1 (`org_ip_allowlist` table). Check in auth middleware after Clerk JWT verification. `CF-Connecting-IP` header for real client IP (CF proxied). Return 403 for non-allowlisted IPs. Admin UI: org settings → Security → IP Allowlist (add/remove CIDR ranges). Bypass for Clerk webhook IPs and health endpoints.

## Compliance Certification Display
SOC 2 Type II / HIPAA / GDPR badges on pricing page + footer. Trust page at `/trust` with: certifications, data processing agreements (DPA), subprocessor list, security practices, uptime history. Auto-generate from Vanta/Drata API if available, otherwise static markdown. Link DPA download (PDF in R2).

## Zero-Human-Loop Automation
Tenant creation: Clerk org webhook → D1 create → Stripe customer create → welcome email (Resend) → PostHog identify. All automated. Tenant deletion: grace period webhook → data export to R2 → D1 delete → Stripe cancel → purge confirmation. Plan upgrades: Stripe webhook → Entitlements check → feature unlock → notification. No manual provisioning at any step.
