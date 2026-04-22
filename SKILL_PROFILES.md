# Skill Profiles (14-Category Architecture)

All 14 categories always loaded. Profiles indicate which submodules to reference.

## Domain → Profile

| Pattern | Profile |
|---------|---------|
| *-foundation, *-mission, *-charity, donate-*, give-* | Nonprofit |
| *-api, *-service, api.*, *-sdk | API Service |
| *-cli, *-tool, *-lib, *-plugin | Developer Tool |
| *-app, *-dashboard, *-portal, *-hub | SaaS |
| Everything else | Marketing Site |

Ambiguous? Has Angular → SaaS/DevTool. Only wrangler.toml → Marketing/API. Has schema/Drizzle → SaaS. Empty → Marketing (default).

## Marketing Site
06/easter-eggs, 06/web-manifest, 06/contact-forms, 06/custom-error-pages, 06/i18n, 09/seo-keywords, 09/email-templates

## SaaS Application
ALL submodules. Especially: 05/api-design, 05/drizzle-orm, 05/mcp-integrations, 05/clerk-auth, 05/inngest-jobs, 06/onboarding, 06/webhook-system, 06/admin-dashboard, 06/site-search, 06/ai-chat, 06/keyboard-shortcuts, 06/empty-states, 06/notifications, 06/file-uploads-and-storage, 06/rich-text-editor, 06/data-tables, 06/realtime-and-websockets, 06/copilot-and-ai-features, 06/notification-center, 07/accessibility, 07/security, 07/performance, 08/ci-cd, 08/backup-recovery, 09/seo-keywords, 09/documentation-hygiene, 13/stripe-billing, 13/analytics-config, 13/user-feedback, 13/feature-flags-and-experiments, 13/email-marketing-and-listmonk

## Nonprofit
06/contact-forms, 06/easter-eggs, 06/web-manifest, 06/blog-engine, 06/i18n, 06/ai-chat, 09/seo-keywords, 09/email-templates, 09/social-automation, 13/stripe-billing (donations), 13/user-feedback

## API Service
05/api-design, 05/drizzle-orm, 05/coolify, 05/shared-api-pool, 05/clerk-auth, 05/inngest-jobs, 06/webhook-system, 06/realtime-and-websockets, 07/security, 07/performance, 08/uptime-health, 08/backup-recovery, 08/ci-cd, 08/changelog-releases, 13/feature-flags-and-experiments

## Developer Tool
05/api-design, 07/security, 08/ci-cd, 08/changelog-releases, 09/documentation-hygiene, 09/seo-keywords, 06/blog-engine, 06/keyboard-shortcuts

## Micro-SaaS
05/api-design, 05/drizzle-orm, 05/clerk-auth, 05/inngest-jobs, 06/contact-forms, 06/custom-error-pages, 06/webhook-system, 06/file-uploads-and-storage, 06/notification-center, 07/security, 07/performance, 09/seo-keywords, 13/stripe-billing, 13/feature-flags-and-experiments, 13/email-marketing-and-listmonk
