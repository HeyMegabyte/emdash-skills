# Skill Profiles (v2 — 14-Category Architecture)

All 14 categories are always loaded. Profiles indicate which **submodules** to reference for specific project types.

## Quick-Match: Domain Name to Profile

| Domain Pattern | Profile |
|---------------|---------|
| *-foundation, *-mission, *-charity, donate-*, give-* | Nonprofit / Donation |
| *-api, *-service, api.*, *-sdk | API Service |
| *-cli, *-tool, *-lib, *-plugin | Developer Tool / OSS |
| *-app, *-dashboard, *-portal, *-hub | SaaS Application |
| Everything else (landing pages, portfolios, info sites) | Marketing Site |

When ambiguous, check folder contents:
- Has `package.json` with Angular/React → SaaS or Dev Tool
- Has only `wrangler.toml` → Marketing Site or API Service
- Has `schema.sql` or Drizzle config → SaaS Application
- Is empty → Marketing Site (default)

---

## Marketing Site

Simple landing page, no auth, no database.

**Key submodules:** 06/easter-eggs, 06/web-manifest, 06/contact-forms, 06/custom-error-pages, 06/i18n, 09/seo-keywords, 09/email-templates

---

## SaaS Application

Full product with auth, database, payments, onboarding.

**Key submodules:** ALL — every submodule is relevant for a full SaaS build. Especially:
05/api-design, 05/drizzle-orm, 05/mcp-integrations, 06/onboarding, 06/webhook-system, 06/admin-dashboard, 06/site-search, 06/ai-chat, 06/keyboard-shortcuts, 06/empty-states, 06/notification-system, 07/accessibility, 07/security, 07/performance, 08/ci-cd, 08/backup-recovery, 09/seo-keywords, 09/documentation-hygiene, 13/stripe-billing, 13/analytics-config, 13/user-feedback

---

## Nonprofit / Donation

Cause-driven site with donation flows and community content.

**Key submodules:** 06/contact-forms, 06/easter-eggs, 06/web-manifest, 06/blog-engine, 06/i18n, 06/ai-chat, 09/seo-keywords, 09/email-templates, 09/social-automation, 13/stripe-billing (donation presets), 13/user-feedback

---

## API Service

Backend-only or API-first product.

**Key submodules:** 05/api-design, 05/drizzle-orm, 05/coolify-docker-proxmox, 05/shared-api-pool, 06/webhook-system, 07/security, 07/performance, 08/uptime-health, 08/backup-recovery, 08/ci-cd, 08/changelog-releases

---

## Developer Tool / OSS

CLI tool, library, or open-source project.

**Key submodules:** 05/api-design, 07/security, 08/ci-cd, 08/changelog-releases, 09/documentation-hygiene, 09/seo-keywords, 06/blog-engine, 06/keyboard-shortcuts

---

## Micro-SaaS

Lightweight product with billing but minimal complexity.

**Key submodules:** 05/api-design, 05/drizzle-orm, 06/contact-forms, 06/custom-error-pages, 06/webhook-system, 07/security, 07/performance, 09/seo-keywords, 13/stripe-billing
