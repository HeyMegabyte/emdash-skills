# Skill Router (v2 — 14-Category Architecture)

All 14 categories always loaded. Submodules provide specialized reference.

## The 14 Categories

| # | Category | Submodules |
|---|----------|-----------|
| 01 | Operating System | ai-native-coding, autonomous-orchestrator, one-line-saas |
| 02 | Goal and Brief | — |
| 03 | Planning and Research | competitive-analysis |
| 04 | Preference and Memory | wisdom-and-human-psychology |
| 05 | Architecture and Stack | api-design, shared-api-pool, drizzle-orm, coolify-docker-proxmox, mcp-integrations, ai-technology, clerk-auth, inngest-jobs |
| 06 | Build and Slice Loop | easter-eggs, domain-provisioning, web-manifest, error-pages, contact-forms, blog-engine, onboarding, site-search, i18n, ai-chat, webhooks, admin, cmd-k, empty-states, notifications, file-uploads, rich-text-editor, data-tables, realtime-websockets, copilot-ai, notification-center |
| 07 | Quality and Verification | accessibility, performance, security, computer-use, browser-workflows, completeness, visual-inspection, tdd, testing-matrices, adversarial, visual-regression, contract-testing, slop-detection, eval-driven-dev |
| 08 | Deploy and Runtime | launch-day, ci-cd, uptime-health, changelog, backup-recovery, gh-fix-ci |
| 09 | Brand and Content | email-templates, social-automation, seo-keywords, documentation-hygiene |
| 10 | Experience and Design | — |
| 11 | Motion and Interaction | — |
| 12 | Media Orchestration | media-prompts, compression-pipeline |
| 13 | Observability and Growth | stripe-billing, analytics-config, user-feedback, feature-flags, email-listmonk |
| 14 | Independent Idea Engine | — |

## By Task Type

| Task | Key Submodules |
|------|---------------|
| New project | 05/coolify, 05/clerk-auth, 05/inngest-jobs, 06/domain-provisioning, 06/web-manifest, 09/seo-keywords |
| Build feature | 06/*, 05/api-design, 05/drizzle-orm, 05/clerk-auth |
| Fix/debug | 08/gh-fix-ci |
| Deploy | 08/launch-day, 08/ci-cd, 08/uptime-health |
| Full project | ALL submodules |
| Design/visual | 10, 11, 06/easter-eggs, 06/custom-error-pages |
| SEO/content | 09/seo-keywords, 09/documentation-hygiene, 06/blog-engine, 06/i18n |
| Billing | 13/stripe-billing, 06/webhook-system, 05/inngest-jobs |
| File uploads | 06/file-uploads-and-storage, 05/api-design |
| Rich text | 06/rich-text-editor, 06/blog-engine |
| Data grids | 06/data-tables, 05/api-design, 05/drizzle-orm |
| Realtime | 06/realtime-and-websockets, 05/architecture |
| AI features | 06/copilot-and-ai-features, 06/ai-chat |
| Notifications | 06/notification-center, 06/notification-system |
| Feature flags | 13/feature-flags-and-experiments |
| Email marketing | 13/email-marketing-and-listmonk, 09/email-templates |
| Infrastructure | 05/coolify, 05/shared-api-pool, 05/mcp-integrations |
| Testing/QA | 07/accessibility, 07/performance, 07/security, 07/completeness, 07/visual-regression, 07/contract-testing, 07/slop-detection, 07/eval-driven-dev |

## By File Pattern

| Pattern | Submodule |
|---------|-----------|
| *.spec.ts, *.test.ts | 07 |
| wrangler.toml | 05, 08 |
| drizzle/*, schema.ts | 05/drizzle-orm |
| *.css, *.scss | 10, 11 |
| /blog/*, /posts/* | 06/blog-engine |
| /admin/* | 06/admin-dashboard |
| /api/webhooks/* | 06/webhook-system, 05/clerk-auth |
| /api/inngest | 05/inngest-jobs |
| **/middleware/auth* | 05/clerk-auth |
| /api/stripe* | 13/stripe-billing |
| /api/uploads/* | 06/file-uploads-and-storage |
| /api/realtime/* | 06/realtime-and-websockets |
| /api/copilot/* | 06/copilot-and-ai-features |
| /api/notifications/* | 06/notification-center |
| /api/newsletter/* | 13/email-marketing-and-listmonk |
| .github/workflows/* | 08/ci-cd, 08/gh-fix-ci |

## Parallel Agent Distribution

| Agent | Categories |
|-------|-----------|
| Frontend | 01, 06, 09, 10, 11, 12 |
| Backend | 01, 05, 06, 07, 13 |
| Content | 01, 09, 12 |
| Quality | 01, 07, 08 |
| Deploy | 01, 08, 09 |

## Computer Use & Browser Automation

Tool priority: 1. Dedicated MCP → 2. Playwright MCP → 3. Chrome MCP → 4. Computer Use (native macOS only)

## Custom Agents (~/.claude/agents/)

architect (opus), code-simplifier (sonnet), completeness-checker (opus), deploy-verifier (sonnet), security-reviewer (opus), test-writer (sonnet), seo-auditor (haiku), visual-qa (opus), computer-use-operator (sonnet), dependency-auditor (sonnet), meta-orchestrator (opus), migration-agent (sonnet), content-writer (haiku), performance-profiler (sonnet), incident-responder (sonnet)
