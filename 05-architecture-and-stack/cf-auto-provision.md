---
name: "CF Auto-Provision"
description: "Single-function project bootstrap via Cloudflare MCP + cf CLI (~3000 API ops). One call provisions D1 database (global read replication), KV namespaces (cache + rate limit), R2 bucket, DNS records, Worker routes, Flagship project, and generates wrangler.jsonc with all bindings. Integrates Clerk, Stripe, PostHog, and Sentry project creation."
---

# CF Auto-Provision

One function bootstraps an entire project on Cloudflare. No manual dashboard clicking. Provisions all primitives, generates config, integrates third-party services. Use `cf` CLI (unified, ~3000 API ops) or CF MCP (Code Mode, 2 tools + <1K tokens).

## Function Signature

```typescript
interface ProvisionResult {
  d1DatabaseId: string;
  kvCacheId: string;
  kvRateLimitId: string;
  r2BucketName: string;
  workerName: string;
  domain: string;
  wranglerToml: string;
  integrations: {
    clerkAppId?: string;
    stripeProductId?: string;
    posthogProjectId?: string;
    sentryProjectSlug?: string;
  };
}

async function bootstrapProject(
  domain: string,
  type: 'marketing' | 'saas' | 'api'
): Promise<ProvisionResult>
```

## Provision Sequence

### 1. D1 Database

```
MCP: d1_database_create
Name: {project}-db (e.g. "megabyte-space-db")
```

After creation, run initial Drizzle migration with base schema:

```typescript
// Base schema varies by type:
// marketing: contacts, form_submissions, page_views
// saas: users, subscriptions, teams, invites, audit_log
// api: api_keys, request_log, rate_limits
```

Push schema: `npx drizzle-kit push:sqlite --config=drizzle.config.ts`

### 2. KV Namespaces

```
MCP: kv_namespace_create × 2
1. {project}-cache   → binding: CACHE (page cache, API responses, TTL-based)
2. {project}-ratelimit → binding: RATE_LIMIT (per-IP counters, sliding window)
```

### 3. R2 Bucket

```
MCP: r2_bucket_create
Name: {project}-storage
Binding: STORAGE
```

CORS config (set via API after creation):

```json
{
  "cors_rules": [{
    "allowed_origins": ["https://{domain}", "https://*.{domain}"],
    "allowed_methods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "allowed_headers": ["*"],
    "max_age_seconds": 3600
  }]
}
```

### 4. DNS Records

```
MCP: CF API — POST /zones/{zoneId}/dns_records

For root domain:
  Type: CNAME, Name: {subdomain}, Content: {worker}.workers.dev, Proxied: true

For wildcard (saas type):
  Type: CNAME, Name: *.{subdomain}, Content: {worker}.workers.dev, Proxied: true
```

Zone ID lookup: `GET /zones?name={baseDomain}` → extract zone ID.

### 5. Worker Route

```
MCP: CF API — POST /zones/{zoneId}/workers/routes

Pattern: {domain}/*
Script: {project}-worker

For saas type, add: *.{domain}/*
```

### 6. Wrangler.toml Generation

```jsonc
// wrangler.jsonc (preferred over .toml since 2025)
{
  "name": "{project}-worker",
  "main": "src/index.ts",
  "compatibility_date": "2026-04-23",
  "compatibility_flags": ["nodejs_compat"],
  "vars": { "ENVIRONMENT": "production", "VERSION": "0.1.0" },
  "d1_databases": [{ "binding": "DB", "database_name": "{project}-db", "database_id": "{d1-id}" }],
  "kv_namespaces": [
    { "binding": "CACHE", "id": "{cache-kv-id}" },
    { "binding": "RATE_LIMIT", "id": "{ratelimit-kv-id}" }
  ],
  "r2_buckets": [{ "binding": "STORAGE", "bucket_name": "{project}-storage" }],
  "ai": { "binding": "AI" },
  "triggers": { "crons": ["0 */6 * * *"] },
  "assets": { "directory": "./public" }
  // SaaS type adds: durable_objects, queues, vectorize bindings
  // Agent type adds: agents SDK + Agent Memory bindings
}
```

## Third-Party Integration

### Clerk (saas type only)

```bash
# Via Clerk Dashboard API or CLI
curl -X POST https://api.clerk.com/v1/applications \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -d '{"name": "{project}", "allowed_origins": ["https://{domain}"]}'
```

Extract `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` from response. Add to wrangler secrets:

```bash
echo "$CLERK_SECRET_KEY" | wrangler secret put CLERK_SECRET_KEY
echo "$CLERK_PUBLISHABLE_KEY" | wrangler secret put CLERK_PUBLISHABLE_KEY
```

### Stripe

```bash
# Via Stripe MCP: create_product
# Product name: {project title}
# Then create_price for each tier

# Free tier: $0 (metadata only, no Stripe price)
# Pro tier: $50/month
# Enterprise: custom
```

Store `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET` as wrangler secrets.

### PostHog

```bash
# Via PostHog API
curl -X POST https://posthog.megabyte.space/api/projects/ \
  -H "Authorization: Bearer $POSTHOG_PERSONAL_API_KEY" \
  -d '{"name": "{project}", "timezone": "America/New_York"}'
```

Extract project API key. Add to wrangler vars (not secret — it's public):

```toml
[vars]
POSTHOG_API_KEY = "{key}"
POSTHOG_HOST = "https://posthog.megabyte.space"
```

### Sentry

```bash
# Via Sentry API
curl -X POST https://sentry.megabyte.space/api/0/teams/{org}/{team}/projects/ \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -d '{"name": "{project}", "platform": "javascript"}'
```

Extract DSN. Add to wrangler vars:

```toml
[vars]
SENTRY_DSN = "{dsn}"
```

## Orchestration

```typescript
async function bootstrapProject(
  domain: string,
  type: 'marketing' | 'saas' | 'api'
): Promise<ProvisionResult> {
  const project = domain.replace(/\./g, '-');

  // Phase 1: Parallel CF provisioning (all independent)
  const [d1, kvCache, kvRate, r2] = await Promise.all([
    cfMcp.d1_database_create({ name: `${project}-db` }),
    cfMcp.kv_namespace_create({ name: `${project}-cache` }),
    cfMcp.kv_namespace_create({ name: `${project}-ratelimit` }),
    cfMcp.r2_bucket_create({ name: `${project}-storage` }),
  ]);

  // Phase 2: DNS + routes (depend on zone lookup)
  const zone = await cfApi.getZone(extractBaseDomain(domain));
  await Promise.all([
    cfApi.createDnsRecord(zone.id, { type: 'CNAME', name: domain, content: `${project}-worker.workers.dev`, proxied: true }),
    cfApi.createWorkerRoute(zone.id, { pattern: `${domain}/*`, script: `${project}-worker` }),
  ]);

  // Phase 3: Third-party integrations (parallel, type-dependent)
  const integrations: ProvisionResult['integrations'] = {};
  const tasks: Promise<void>[] = [
    createPosthogProject(project).then((id) => { integrations.posthogProjectId = id; }),
    createSentryProject(project).then((slug) => { integrations.sentryProjectSlug = slug; }),
  ];
  if (type === 'saas') {
    tasks.push(
      createClerkApp(project, domain).then((id) => { integrations.clerkAppId = id; }),
      createStripeProduct(project).then((id) => { integrations.stripeProductId = id; }),
    );
  }
  await Promise.all(tasks);

  // Phase 4: Generate wrangler.toml
  const wranglerToml = generateWranglerToml({ project, type, d1, kvCache, kvRate, r2, domain });

  // Phase 5: Initial Drizzle migration
  await runInitialMigration(type, d1.database_id);

  return { d1DatabaseId: d1.database_id, kvCacheId: kvCache.id, kvRateLimitId: kvRate.id, r2BucketName: r2.name, workerName: `${project}-worker`, domain, wranglerToml, integrations };
}
```

## Type-Specific Defaults

| Resource | marketing | saas | api |
|----------|-----------|------|-----|
| D1 tables | contacts, forms, pages | users, subs, teams, audit | api_keys, requests, limits |
| KV cache | Page HTML, meta | Sessions, feature flags | Response cache |
| R2 | Images, PDFs | User uploads, exports | Generated files |
| Durable Objects | No | Realtime rooms | No |
| Queues | No | Email, webhooks | Webhook processing |
| Clerk | No | Yes | No |
| Stripe | No | Yes (3 tiers) | Optional (usage-based) |
| Cron | Sitemap regen | Usage alerts, cleanup | Key rotation |
