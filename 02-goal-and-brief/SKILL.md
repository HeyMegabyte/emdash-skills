---
name: "goal-and-brief"
description: "Establish project thesis before first code. Infer product type from domain/folder/README. Identify users, business model, pSEO strategy, AI-native dev approach. Maintain PROJECT_BRIEF.md as source of truth."
version: "2.0.0"
updated: "2026-04-23"
effort: medium
model: sonnet
---

# 02 — Goal and Brief

## Brief Structure

1. **Product Thesis** — what + why (1-2 sentences)
2. **Target Users** — primary, secondary, anti-persona
3. **Product Category** — SaaS|marketing|dev-tool|e-commerce|community|content|portfolio|internal|API|mobile|OSS|AI-agent
4. **Business Model** — free/donation|freemium|subscription|one-time|usage-based|marketplace|ad-supported|OSS+paid
5. **Revenue Target** — micro-SaaS $10K-$100K/mo | solo-SaaS $50K-$3M/yr | launch timeline 4-12 weeks
6. **Success Criteria** — primary metric, secondary metrics, quality bar
7. **Non-Goals** — explicit exclusions preventing scope creep
8. **Programmatic SEO Plan** — page templates: integration|comparison|use-case|tutorial|template-library
9. **AI-Native Dev Approach** — spec-driven|eval-driven|agentic; SPEC.md + failing tests before code
10. **Permanent Constraints** — tech, business, brand, user constraints
11. **Current Truth** — living snapshot updated every session

## Establishment Process

**New projects:** Parse domain/folder → infer category+users+model → set non-goals → apply constraints → write `PROJECT_BRIEF.md` → build.
**Existing:** Read PROJECT_BRIEF.md+CLAUDE.md+README → scan codebase → reconcile → update if changed → proceed.
**Subsequent prompts:** Load brief → detect direction change → update if changed (announce it) → always update "Current Truth".

## Domain/Signal Inference

`*.megabyte.space`→internal Megabyte Labs tool | `*link/*l.ink`→URL shortener | `install.*`→software distribution | `editor.*`→online editor | `fund*/give*/donate*`→fundraising | `*dash/*admin/*portal`→dashboard SaaS | `*api/*service`→API platform | `*blog/*news`→content | `*chat/*msg`→messaging | `*meet/*cal/*book`→scheduling | `*learn/*course/*edu`→EdTech | `portfolio/*folio`→portfolio | Generic .com/.dev/.space→check README/package.json

## Domain-to-Feature Auto-Select

| Domain Signal | Product Type | Auto-Include ACs |
|---------------|-------------|-----------------|
| `*l.ink, *link, shorten*` | Link shortener | Analytics dashboard, custom slugs, QR codes, UTM builder, click tracking, bulk import, API |
| `fund*, give*, donate*` | Fundraising | Stripe donations ($10-$500 presets), donor wall, impact counter, recurring gifts, tax receipts, campaign pages |
| `*docs, *wiki, *kb` | Knowledge base | Search (CF AI Search), versioning, sidebar nav, breadcrumbs, feedback widget, PDF export |
| `*shop, *store, buy*` | E-commerce | Stripe Checkout, product catalog, cart, inventory, order tracking, reviews |
| `*dash, *admin, *portal` | Dashboard SaaS | Clerk auth, RBAC, ag-grid tables, charts, export, audit log, notifications |
| `*api, *service` | API platform | OpenAPI docs, rate limiting, API keys, usage metering, webhooks, SDK gen |
| `*blog, *news, *journal` | Content | Editor.js, categories/tags, RSS, comments, social sharing, reading time |
| `*chat, *msg, *talk` | Messaging | WebSocket, message history, typing indicators, file upload, notifications |
| `*meet, *cal, *book` | Scheduling | Calendar integration, availability, timezone, reminders, video links |
| `*learn, *course, *edu` | EdTech | Progress tracking, quizzes, certificates, video hosting, discussion |
| `portfolio, *folio` | Portfolio | Project gallery, case studies, contact form, resume/CV, testimonials |
| `*.space (Megabyte)` | Internal tool | Coolify deploy, Authentik SSO, PostHog analytics, Sentry errors |

Ambiguous: existing code → README → package.json → ask with default.

## Business Model Patterns (2026 Data)

**Micro-SaaS ($10K-$100K/mo):** Single workflow pain point, solo or 1-2 person team, $29-$299/mo tiers, 4-12 week launch, operating cost $3K-$12K/yr.
**Growth levers:** Programmatic SEO (Zapier: 16.2M organic/mo from templates) | integration pages `{App} + {Tool}` | comparison pages `{App} vs {Competitor}` | use-case pages `{App} for {Industry}` | template libraries.
**Pricing:** Free trial → freemium → paid. Tiered: usage metric + seat count. Usage-based: metered API calls, credit burndown. Hybrid: base + overage.
**Distribution > technology.** Ship in 4 weeks, iterate from real users. SEO + word-of-mouth > ads at <$10K MRR.

## Programmatic SEO Planning (Spec in Brief)

Every SaaS brief must include a pSEO plan: seed terms → page type → template → data source → internal link hub.
Page types: `{App}+{Integration}` | `{App} vs {Competitor}` | `{App} for {Industry}` | `How to {Action} in {App}` | `{Task} templates`.
Quality gate: unique value per page, conversion-aligned CTA, keyphrase 0.5-3%, title 50-60 chars, meta 120-156 chars, 4+ JSON-LD, 2+ internal links.

## AI-Native Development Approach

**Spec-driven:** SPEC.md with acceptance criteria + success metrics before any code. Each AC = testable behavior, not implementation detail.
**Eval-driven:** Failing Playwright test FIRST → implement → pass. Test account: test@megabyte.space. No screenshot = not verified.
**Agentic:** Decompose into parallel vertical slices. Phase 1 architect (single). Phase 2 build (3-5 parallel: frontend|backend|content|media|tests). Phase 3 verify (parallel: deploy-verifier+seo-auditor+visual-qa).
**Context hygiene:** SPEC.md+progress.md survive compaction. Subagents summarize in ≤200 words. Main thread orchestrates only.

## Brief Evolution Rules

**Change without asking:** Current Truth, success criteria refinement, non-goals additions, pSEO page additions.
**Requires confirmation:** Category change, target user change, business model change, primary metric change, removing constraints.
**Cannot change:** Tech constraints from CLAUDE.md, quality bar (only up), security requirements (only strengthen).

## Goal-Alignment Check

Before major decisions: Aligned with thesis? Target users? Business model? Success criteria? Not in non-goals? Within constraints? Any fail → adjust implementation or escalate.

## Storage & Format

`PROJECT_BRIEF.md` in project root. Markdown. Never delete — archive old sections if direction changes. Auto-update "Current Truth" every session. Import with `@PROJECT_BRIEF.md` in CLAUDE.md for always-loaded context.

## PROJECT_BRIEF.md Template

```markdown
# Project Brief — {name}

## Thesis
{1-2 sentence product thesis}

## Users
- Primary: {who, job-to-be-done}
- Secondary: {who}
- Anti-persona: {who this is NOT for}

## Category & Model
Category: {SaaS|marketing|...}
Model: {freemium|subscription|...} | Target: {$X/mo MRR in Y months}

## Success Criteria
- Primary: {metric}
- Secondary: {metric, metric}
- Quality bar: Lighthouse Perf≥75 | A11y≥95 | Yoast GREEN | E2E 6bp GREEN

## Non-Goals
- {explicit exclusion}

## Programmatic SEO Plan
- Template type: {integration|comparison|use-case|...}
- Seed terms: {term1, term2}
- Data source: {DB table|CMS|API}
- Hub page: {/integrations|/compare|/use-cases}

## AI-Native Dev Approach
- Spec: SPEC.md with ACs
- Tests: Playwright E2E, test@megabyte.space
- Parallelization: {workstreams}

## Permanent Constraints
- Tech: CF Workers+Hono, Angular 20+, Drizzle v1+D1, Clerk, Stripe
- Brand: #060610 bg | #00E5FF cyan | Sora/Space Grotesk | dark-first
- Quality: Zero stubs/TODOs | Zero errors | deployed+purged before done

## Current Truth
Last updated: {date}
{living snapshot of what's built, what's next, what changed}
```
