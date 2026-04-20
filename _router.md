# Skill Router (v2 — 14-Category Architecture)

Deterministic decision tree. All 14 skills are always loaded — each contains submodules for specific capabilities.

**LOADING POLICY: All 14 categories are always active. Submodule .md files within each category folder provide specialized reference when needed.**

## The 14 Categories (always loaded)

| # | Category | Submodules | Purpose |
|---|----------|-----------|---------|
| 01 | Operating System | ai-native-coding, autonomous-orchestrator | Policy, autonomy, parallelization |
| 02 | Goal and Brief | — | Product thesis, domain inference |
| 03 | Planning and Research | competitive-analysis | Research, decomposition, task graphs |
| 04 | Preference and Memory | wisdom-and-human-psychology | VoC model, preferences, Omi integration |
| 05 | Architecture and Stack | api-design, shared-api-pool, drizzle-orm, coolify-docker-proxmox, mcp-integrations, ai-technology | Stack decisions, CF architecture, infra |
| 06 | Build and Slice Loop | easter-eggs, domain-provisioning, web-manifest, error-pages, contact-forms, blog-engine, onboarding, site-search, i18n, ai-chat, webhooks, admin, cmd-k, empty-states, notifications | Feature building, vertical slices |
| 07 | Quality and Verification | accessibility, performance, security, computer-use, browser-workflows, completeness | Testing, a11y, security, visual QA |
| 08 | Deploy and Runtime | launch-day, ci-cd, uptime-health, changelog, backup-recovery, gh-fix-ci | Deploy, verify, monitor, recover |
| 09 | Brand and Content | email-templates, social-automation, seo-keywords, documentation-hygiene | Copy, SEO, brand, docs |
| 10 | Experience and Design | — | Typography, color, layout, components |
| 11 | Motion and Interaction | — | Animation, transitions, scroll effects |
| 12 | Media Orchestration | — | Image/video generation, compression |
| 13 | Observability and Growth | stripe-billing, analytics-config, user-feedback | Analytics, payments, growth |
| 14 | Independent Idea Engine | — | Autonomous research, improvement proposals |

**Total: 14 skills + CONVENTIONS.md + STYLE_GUIDES.md**

## By Task Type (submodules to reference)

| Task | Key Submodules to Load |
|------|----------------------|
| New project | 05/coolify-docker-proxmox, 06/domain-provisioning, 06/web-manifest, 09/seo-keywords |
| Build feature | 06/*, 05/api-design, 05/drizzle-orm |
| Fix / debug | 08/gh-fix-ci |
| Deploy | 08/launch-day, 08/ci-cd, 08/uptime-health |
| Full project | ALL submodules across all 14 categories |
| Design / visual | 10, 11, 06/easter-eggs, 06/custom-error-pages |
| SEO / content | 09/seo-keywords, 09/documentation-hygiene, 06/blog-engine, 06/i18n |
| Billing / payments | 13/stripe-billing, 06/webhook-system |
| Infrastructure | 05/coolify-docker-proxmox, 05/shared-api-pool, 05/mcp-integrations |
| Testing / QA | 07/accessibility, 07/performance, 07/security, 07/completeness |

## By File Being Edited

| File Pattern | Relevant Submodule |
|-------------|-------------------|
| *.spec.ts, *.test.ts | 07 (core) |
| wrangler.toml | 05 (core), 08 (core) |
| drizzle/*, schema.ts | 05/drizzle-orm |
| *.css, *.scss | 10, 11 |
| /blog/*, /posts/* | 06/blog-engine |
| /admin/* | 06/admin-dashboard |
| /api/webhooks/* | 06/webhook-system |
| /api/stripe* | 13/stripe-billing, 06/webhook-system |
| .github/workflows/* | 08/ci-cd, 08/gh-fix-ci |

## Parallel Agent Skill Distribution

| Agent | Role | Categories |
|-------|------|-----------|
| Frontend | UI, design, motion | 01, 06, 09, 10, 11, 12 |
| Backend | API, DB, auth, webhooks | 01, 05, 06, 07, 13 |
| Content | Copy, SEO, blog, media | 01, 09, 12 |
| Quality | Testing, a11y, visual QA | 01, 07, 08 |
| Deploy | Ship, launch, social | 01, 08, 09 |

## Computer Use & Browser Automation

Submodules: 07/computer-use-automation, 07/chrome-and-browser-workflows

Tool priority:
1. **Dedicated MCP** (Slack, Gmail, Stripe, GitHub) → Use first
2. **Playwright MCP** → Web testing, forms, screenshots
3. **Chrome MCP** → Web app interaction
4. **Computer Use** → ONLY native macOS apps

## Custom Agents (in ~/.claude/agents/)

| Agent | Model | Use For |
|-------|-------|---------|
| deploy-verifier | sonnet | Post-deploy smoke tests at 6 breakpoints |
| security-reviewer | opus | OWASP audit of code changes (read-only) |
| test-writer | sonnet | Generate Vitest + Playwright tests |
| seo-auditor | haiku | SEO compliance check per page |
| visual-qa | opus | Screenshot-based visual defect detection |
| computer-use-operator | sonnet | Native macOS app automation |

## Prompt-to-Path Decision Tree

```
All 14 categories always loaded.
├── Full project? → Load ALL submodules. Spawn parallel agents.
├── New project? → Reference 05/coolify, 06/domain-provisioning, 06/web-manifest
├── Bug/error? → Reference 08/gh-fix-ci
├── Design? → Reference 10, 11, 06/easter-eggs
└── Default → 14 categories sufficient for most tasks
```
