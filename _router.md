# Skill Router

Route prompts to smallest useful subset. Load `01-operating-system` FIRST always, then add categories and reference docs matching the task. On-demand > eager loading.

## Category Map

| # | Skill | Reference Docs |
|---|-------|----------------|
| 01 | Operating System | `ai-native-coding`, `architecture-thought-loop`, `autonomous-orchestrator`, `one-line-saas` |
| 02 | Goal and Brief | — |
| 03 | Planning and Research | `competitive-analysis` |
| 04 | Preference and Memory | `brian-decision-model`, `brian-voc-data`, `wisdom-and-human-psychology` |
| 05 | Architecture and Stack | `ai-technology-integration`, `api-design-and-documentation`, `auth-and-session-management`, `background-jobs-and-workflows`, `cf-auto-provision`, `coolify-docker-proxmox`, `drizzle-orm-and-migrations`, `mcp-and-cloud-integrations`, `openapi-generation`, `shared-api-pool` |
| 06 | Build and Slice Loop | `admin-dashboard`, `ai-chat-widget`, `blog-and-content-engine`, `chat-native-dashboard`, `contact-forms-and-endpoints`, `copilot-and-ai-features`, `custom-error-pages`, `data-tables`, `domain-provisioning`, `easter-eggs`, `empty-states-and-loading`, `file-uploads-and-storage`, `internationalization`, `keyboard-shortcuts-and-command-palette`, `microcopy-library`, `notification-center`, `notification-system`, `onboarding-and-first-run`, `realtime-and-websockets`, `rich-text-editor`, `site-search`, `web-manifest-system`, `webhook-system` |
| 07 | Quality and Verification | `accessibility-gate`, `adversarial-testing`, `chrome-and-browser-workflows`, `completeness-verification`, `computer-use-automation`, `contract-testing`, `e2e-accumulation`, `eval-driven-development`, `evidence-collection`, `performance-optimization`, `security-hardening`, `semgrep-codebase-rules`, `slop-detection`, `spec-driven-development`, `stagehand-ai-testing`, `tdd-verification`, `testing-matrices`, `ui-completeness-sweep`, `visual-inspection-loop`, `visual-regression` |
| 08 | Deploy and Runtime | `backup-and-disaster-recovery`, `changelog-and-releases`, `ci-cd-pipeline`, `critical-css`, `font-subsetting`, `gh-fix-ci`, `launch-day-sequence`, `service-worker`, `uptime-and-health` |
| 09 | Brand and Content | `documentation-and-codebase-hygiene`, `email-templates`, `seo-and-keywords`, `social-automation` |
| 10 | Experience and Design | `design-tokens` |
| 11 | Motion and Interaction | — |
| 12 | Media Orchestration | `compression-pipeline`, `image-optimization`, `media-prompts`, `og-image-generation` |
| 13 | Observability and Growth | `analytics-configuration`, `email-marketing-and-listmonk`, `feature-flags-and-experiments`, `sentry-alert-rules`, `stripe-billing`, `user-feedback-collection` |
| 14 | Independent Idea Engine | — |

## Task Routing

| Task | Load |
|------|------|
| New project | `02`, `03`, `05`, `06`, `09` |
| Build feature | `05`, `06`, `07` |
| Debug / CI failure | `07`, `08` — especially `gh-fix-ci`, `spec-driven-development` |
| Deploy / launch | `08` — add `09` if SEO/content changed |
| Design / frontend polish | `09`, `10`, `11`, `12` |
| SEO / copy | `09` — add `06/blog-and-content-engine` or `13/analytics-configuration` when relevant |
| Billing / auth | `05/auth-and-session-management`, `06/webhook-system`, `13/stripe-billing` |
| File uploads / admin / data grids | `06/file-uploads-and-storage`, `admin-dashboard`, `data-tables` |
| Realtime / AI features | `05/ai-technology-integration`, `06/realtime-and-websockets`, `ai-chat-widget`, `copilot-and-ai-features` |
| Growth / analytics | `13` — add `09/social-automation` when publishing |
| Brainstorm / ideas | `14`, `03` |
| Motion / animation | `11`, `10` |
| Chat / messaging UI | `06/chat-native-dashboard`, `06/realtime-and-websockets`, `06/notification-center` |
| Microcopy / UX writing | `06/microcopy-library`, `09` |
| Evidence / screenshots | `07/evidence-collection`, `07/visual-inspection-loop` |
| Infra / self-hosted | `05/coolify-docker-proxmox`, `05/cf-auto-provision`, `08/uptime-and-health` |

## File Hints

| File Pattern | Load |
|--------------|------|
| `wrangler.toml`, `wrangler.jsonc` | `05`, `08` |
| `schema.ts`, `drizzle/**` | `05/drizzle-orm-and-migrations` |
| `.github/workflows/**` | `08/ci-cd-pipeline`, `gh-fix-ci` |
| `*.spec.ts`, `*.test.ts` | `07` |
| `*.css`, `*.scss` | `10`, `11` |
| `blog/**`, `posts/**` | `06/blog-and-content-engine`, `09/seo-and-keywords` |
| `api/webhooks/**` | `06/webhook-system` |
| `api/stripe*` | `13/stripe-billing` |
| `api/uploads/**` | `06/file-uploads-and-storage` |
| `api/realtime/**` | `06/realtime-and-websockets` |
| `inngest/**`, `*workflow*` | `05/background-jobs-and-workflows` |
| `durable-objects/**`, `*do.ts` | `05` |
| `*.component.ts`, `*.angular.ts` | `06`, `10` |
| `og/**`, `og-image*` | `12/og-image-generation` |
| `fonts/**`, `*.woff2` | `08/font-subsetting` |
| `sw.ts`, `service-worker*` | `08/service-worker` |
| `semgrep/**`, `.semgrepignore` | `07/semgrep-codebase-rules` |
| `coolify/**`, `docker-compose*` | `05/coolify-docker-proxmox` |

## Agent Library

`~/.claude/agents/`: `architect`|`code-simplifier`|`completeness-checker`|`computer-use-operator`|`deploy-verifier`|`security-reviewer`|`seo-auditor`|`test-writer`|`visual-qa`|`dependency-auditor`|`meta-orchestrator`|`migration-agent`|`content-writer`|`performance-profiler`|`incident-responder`|`accessibility-auditor`|`cost-estimator`|`changelog-generator`
