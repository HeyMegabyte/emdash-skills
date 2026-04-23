# Skill Profiles

`01-operating-system` is always the base. Pull the smallest profile matching repo/prompt. Never preload every reference doc.

## Domain → Profile

| Pattern | Profile |
|---------|---------|
| `*-foundation`, `*-mission`, `*-charity`, `donate-*`, `give-*` | Nonprofit |
| `*-api`, `api.*`, `*-service`, `*-sdk` | API Service |
| `*-cli`, `*-tool`, `*-lib`, `*-plugin` | Developer Tool |
| `*-app`, `*-dashboard`, `*-portal`, `*-hub` | SaaS |
| `*-ops`, `*-admin`, `*-internal`, `*-backoffice` | Internal Tool |
| `*-micro`, `*-nano`, one-feature repos | Micro-SaaS |
| everything else | Marketing Site |

Ambiguous: Angular+auth+billing=SaaS | `wrangler.toml`+minimal routes=Marketing or API | DB schema+background jobs=SaaS | single Hono route file=API Service | internal-only auth=Internal Tool.

## Marketing Site

`02`, `03`, `06/contact-forms-and-endpoints`, `custom-error-pages`, `domain-provisioning`, `easter-eggs`, `internationalization`, `web-manifest-system`, `09/seo-and-keywords`, `email-templates`, `10`, `11`, `12`

## SaaS Application

Core + refs (load first): `05/api-design-and-documentation`, `auth-and-session-management`, `background-jobs-and-workflows`, `drizzle-orm-and-migrations`, `mcp-and-cloud-integrations` | `06/admin-dashboard`, `ai-chat-widget`, `data-tables`, `empty-states-and-loading`, `file-uploads-and-storage`, `keyboard-shortcuts-and-command-palette`, `notification-center`, `onboarding-and-first-run`, `realtime-and-websockets`, `rich-text-editor`, `site-search`, `webhook-system` | `07/accessibility-gate`, `performance-optimization`, `security-hardening` | `08/ci-cd-pipeline`, `backup-and-disaster-recovery`, `uptime-and-health` | `09/documentation-and-codebase-hygiene`, `seo-and-keywords` | `13/analytics-configuration`, `feature-flags-and-experiments`, `stripe-billing`, `user-feedback-collection`

## Micro-SaaS

Trimmed SaaS: `05/api-design-and-documentation`, `auth-and-session-management`, `drizzle-orm-and-migrations` | `06/contact-forms-and-endpoints`, `custom-error-pages`, `file-uploads-and-storage`, `notification-center`, `site-search`, `webhook-system` | `07/performance-optimization`, `security-hardening` | `09/seo-and-keywords` | `13/email-marketing-and-listmonk`, `feature-flags-and-experiments`, `stripe-billing`

## Nonprofit

`02`, `03`, `06/blog-and-content-engine`, `contact-forms-and-endpoints`, `domain-provisioning`, `easter-eggs`, `internationalization`, `web-manifest-system` | `09/email-templates`, `seo-and-keywords`, `social-automation` | `13/stripe-billing`, `user-feedback-collection`

## API Service

`03`, `05/api-design-and-documentation`, `auth-and-session-management`, `background-jobs-and-workflows`, `cf-auto-provision`, `drizzle-orm-and-migrations`, `mcp-and-cloud-integrations`, `openapi-generation`, `shared-api-pool` | `06/realtime-and-websockets`, `webhook-system` | `07/contract-testing`, `performance-optimization`, `security-hardening` | `08/backup-and-disaster-recovery`, `changelog-and-releases`, `ci-cd-pipeline`, `uptime-and-health` | `13/feature-flags-and-experiments`, `sentry-alert-rules`

## Developer Tool

`03`, `05/api-design-and-documentation`, `mcp-and-cloud-integrations` | `07/security-hardening`, `semgrep-codebase-rules` | `08/changelog-and-releases`, `ci-cd-pipeline` | `09/documentation-and-codebase-hygiene`, `seo-and-keywords` | `12`

## Internal Tool

`05/api-design-and-documentation`, `auth-and-session-management`, `drizzle-orm-and-migrations` | `06/admin-dashboard`, `chat-native-dashboard`, `data-tables`, `keyboard-shortcuts-and-command-palette`, `notification-center`, `site-search` | `07/accessibility-gate`, `security-hardening` | `08/uptime-and-health` | `13/analytics-configuration`, `feature-flags-and-experiments`
