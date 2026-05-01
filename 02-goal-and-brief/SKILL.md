---
name: "goal-and-brief"
description: "Establish project thesis before first code. Infer product type from domain/folder/README. Identify users, business model, pSEO strategy, AI-native dev approach. Maintain PROJECT_BRIEF.md as source of truth."
metadata:
  version: "2.0.0"
  updated: "2026-04-23"
  effort: "medium"
  model: "sonnet"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
---

# 02 — Goal and Brief

## Brief Structure

1. **Product Thesis** — what + why (1-2 sentences)
2. **Target Users** — primary, secondary, anti-persona
3. **Product Category** — SaaS|marketing|dev-tool|e-commerce|community|content|portfolio|internal|API|mobile|OSS|AI-agent
4. **Business Model** — free/donation|freemium|subscription|one-time|usage-based|marketplace|ad-supported|OSS+paid
5. **Revenue Target** — micro-SaaS $10K-$100K/mo | solo-SaaS $50K-$3M/yr | launch timeline 4-12 weeks | operating cost $3K-$12K/yr
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

`*.megabyte.space`→internal Megabyte Labs tool | `*link/*l.ink`→URL shortener | `install.*`→software distribution | `editor.*`→online editor | `fund*/give*/donate*`→fundraising | `*dash/*admin/*portal`→dashboard SaaS | `*api/*service`→API platform | `*blog/*news`→content | `*chat/*msg`→messaging | `*meet/*cal/*book`→scheduling | `*learn/*course/*edu`→EdTech | `portfolio/*folio`→portfolio | Generic .com/.dev/.space→check README/package.json. SKILL_PROFILES.md maps domain patterns to skill profiles.

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
**Solo SaaS ($50K-$3M/yr):** One person, AI-accelerated build, distribution-first, real users in week 1, SEO+word-of-mouth before ads at <$10K MRR.
**Growth levers:** Programmatic SEO (Zapier: 16.2M organic/mo from templates) | integration pages `{App} + {Tool}` | comparison pages `{App} vs {Competitor}` | use-case pages `{App} for {Industry}` | template libraries.
**Pricing:** Free trial → freemium → paid. Tiered: usage metric + seat count. Usage-based: metered API calls, credit burndown. Hybrid: base + overage.
**Distribution > technology.** Ship in 4 weeks, iterate from real users.

## Programmatic SEO Planning (Spec in Brief)

Every SaaS brief must include a pSEO plan: seed terms → page type → template → data source → internal link hub.
Page types: `{App}+{Integration}` | `{App} vs {Competitor}` | `{App} for {Industry}` | `How to {Action} in {App}` | `{Task} templates`.
Quality gate: unique value per page, conversion-aligned CTA, keyphrase 0.5-3%, title 50-60 chars, meta 120-156 chars, 4+ JSON-LD, 2+ internal links.
GEO layer: quotable answer blocks 40-60 words, FAQPage+HowTo schema → AI citation rate 16%→54%, structured data for ChatGPT/Perplexity/Google AI Overviews.

## AI-Native Development Approach

**Spec-driven:** SPEC.md with acceptance criteria + success metrics before any code. Each AC = testable behavior, not implementation detail.
**Eval-driven:** Failing Playwright test FIRST → implement → pass. Test account: test@megabyte.space. No screenshot = not verified.
**Agentic:** Decompose into parallel vertical slices. Phase 1 architect (single, claude-opus-4-6). Phase 2 build (3-5 parallel: frontend|backend|content|media|tests, claude-sonnet-4-6). Phase 3 verify (parallel: deploy-verifier+seo-auditor+visual-qa).
**Context hygiene:** SPEC.md+progress.md survive compaction. Subagents summarize in ≤200 words. Main thread orchestrates only — never implements.

## Brief Evolution Rules

**Change without asking:** Current Truth, success criteria refinement, non-goals additions, pSEO page additions.
**Requires confirmation:** Category change, target user change, business model change, primary metric change, removing constraints.
**Cannot change:** Tech constraints from CLAUDE.md, quality bar (only up), security requirements (only strengthen).

## Goal-Alignment Check

Before major decisions: Aligned with thesis? Target users? Business model? Success criteria? Not in non-goals? Within constraints? Any fail → adjust implementation or escalate.

## One-Line Prompt Mode Inference (***FIRST DECISION — every brief***)

Every one-line prompt routes to ONE primary mode. The prompt CAN handle anything; mode just biases defaults — copy length, page count, feature defaults, expected detail in the prompt itself.

| Mode | Trigger signals | Detail expected in prompt | Default page count | Auto-features |
|------|-----------------|---------------------------|--------------------|--------------|
| `portfolio` | `${firstname}.dev`/`${name}.com` personal domain, "redo my website", "rebuild ${url}", short prompt with no product noun | Minimal — domain + maybe a hint | 4 (`/`, `/about`, `/work`, `/contact`) +`/blog` if posts exist | Headshot, bio, work grid, contact form, social links |
| `saas` | Product/app/platform noun, pricing mentioned, target market named, integrations cited, auth/billing implied | Richer — features, tiers, ICP, competitors often in-prompt | 6-12 (`/`, `/features`, `/pricing`, `/integrations`, `/docs`, `/blog`, `/changelog`, `/about`, `/contact`, legal) | Pricing table, feature comparison, Stripe checkout stub, Clerk auth stub, free-trial CTA, demo video, status page link |
| `local-business` | Restaurant/salon/medical/legal/etc. category, physical address, phone#, "near me" intent | Moderate — biz name + location + category | 4-8 (`/`, `/services`, `/about`, `/contact`, `/menu`/`/team`/`/gallery` per category) | Google Places enrichment, NAP footer, map embed, hours block, sticky phone CTA, review surface |
| `non-profit` | Donation/fundraise/give nouns, mission language, 501(c)(3), volunteer mentions | Moderate — mission + cause | 5-9 (`/`, `/mission`, `/programs`, `/volunteer`, `/donate`, `/events`, `/blog`, `/contact`) | Donation CTA prominent, impact counters, volunteer signup, partner logos |
| `other` | Anything ambiguous, dev tool, OSS project, marketing site, documentation, blog | Variable — AI judgment | 4-6 default, scale to source-site mirror if rebuilding | AI picks features per scan |

**Mode inference rules:**
1. Read the prompt verbatim — note nouns, verbs, domain hints, brand mentions, URL references.
2. If domain matches `~portfolio$|^${firstname}\.(dev|com|me)$|^${firstname}-${lastname}\..*` or prompt is "redo ${url}" with no product framing → `portfolio`.
3. If prompt names a product + features OR pricing OR auth OR billing OR integrations → `saas`.
4. If category fits Google Places taxonomy + has address → `local-business`.
5. If donation/mission/501c3/volunteer keywords → `non-profit`.
6. Otherwise → `other` and let AI pick from category-specific defaults in skill 15.
7. Mode is biased default, not lock-in — AI overrides with judgment if signals are mixed (record decision in `PROJECT_BRIEF.md § Mode`).

## Optional SaaS↔Portfolio Pairing (***RECOMMENDED — never blind***)

When mode=`saas` AND a founder identity is reliably inferable AND no polished founder portfolio exists, the AI SHOULD propose a sibling portfolio build on a separate domain. Same applies in reverse: when mode=`portfolio` AND the founder has a flagship SaaS in flight, the portfolio MUST link to it. Pairing is a recommendation surface — apply judgment every time.

**Founder identity inference (in priority order):**
1. Explicit prompt mention (`built by X`, `for founder Y`, `${name} is making`)
2. `~/emdash-projects/PORTFOLIO.md` (Brian's master profile)
3. `git config user.name` + `git config user.email` (then Gravatar+GitHub lookup)
4. Existing portfolio at `${firstname}.dev` / `${name}.megabyte.space` (200 OK = exists, prefer linking over rebuilding)
5. Default: Brian Zalewski / brian@megabyte.space / Megabyte Labs

**When to PROPOSE pairing (not all four required, judgment call):**
- Confidence in founder identity ≥0.7 (explicit mention or polished GitHub profile resolves)
- No existing portfolio at `${firstname}.dev` or polished one already linked from SaaS
- SaaS is external-facing (consumer or B2B sold), not internal-only
- Budget/scope allows a second build (one extra Bolt artifact ≈$5-7 Tier 3, ≈$0.40 Tier 1 templated)
- Founder has at least 2 flagship works to populate `/work` (SaaS + 1 prior) — single-flagship portfolios feel thin

**When to SKIP pairing (any one suffices):**
- Prompt explicitly forbids (`--no-portfolio`, "just the SaaS")
- Founder identity = Anonymous/Generic with no signal
- SaaS is internal-only (intranet, employee tool, no external founder narrative)
- Polished founder portfolio already exists and is linked
- Source-rebuild ("redo ${url}") with no product framing — that's pure portfolio mode, not pairing

**Founder Portfolio brief auto-fields (Section `## Founder` in PROJECT_BRIEF.md when paired):**
- `founder.name` | `founder.role` | `founder.bio_short` (≤140ch) | `founder.bio_long` (≤500w)
- `founder.email` | `founder.location` | `founder.timezone`
- `founder.links[]`: github, linkedin, x, mastodon, bluesky, youtube, other
- `founder.portfolio_domain`: `${firstname}.dev` → `${firstname}-${lastname}.dev` → `${firstname}.megabyte.space` fallback chain
- `founder.flagship_works[]`: { name, url, summary, year } — paired SaaS auto-prepended as flagship #1
- `founder.skills[]` | `founder.testimonials[]` (if available) | `founder.headshot_url` (Gravatar+GitHub+DALL-E fallback chain — see skill 15)

**Pairing cross-link contract (when paired):**
- SaaS `/about` MUST include "Built by {founder.name}" with headshot + portfolio link
- SaaS footer MUST credit "Built by {founder.name} · {portfolio_url}"
- Portfolio `/work` MUST list paired SaaS as flagship #1 with link
- Both sites share `founder.headshot_url` + `founder.bio_short` (visual+voice consistency)
- D1 `sites` table: shared `pair_group_id` UUID + `pair_role` ∈ ('saas','portfolio')

**Pairing decision documented:** `PROJECT_BRIEF.md` MUST contain `## Pairing Decision` section with: (1) mode detected, (2) pairing proposed yes/no, (3) reason, (4) sibling URL if spawned. Auditable trail.

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
Solo SaaS economics: {$10K-$100K/mo micro | $50K-$3M/yr solo} | Launch: {4-12 weeks}

## Success Criteria
- Primary: {metric}
- Secondary: {metric, metric}
- Quality bar: Lighthouse Perf≥75 | A11y≥95 | Yoast GREEN | E2E 6bp GREEN | WCAG 2.2 AA

## Non-Goals
- {explicit exclusion}

## Programmatic SEO Plan
- Template type: {integration|comparison|use-case|...}
- Seed terms: {term1, term2}
- Data source: {DB table|CMS|API}
- Hub page: {/integrations|/compare|/use-cases}
- GEO: FAQPage+HowTo schema, quotable 40-60 word blocks

## AI-Native Dev Approach
- Spec: SPEC.md with ACs (AC1→AC2→ACN)
- Tests: Playwright v1.59+ E2E, test@megabyte.space
- Parallelization: {workstreams} via worktree isolation
- Models: opus-4-6 (arch) | sonnet-4-6 (build) | haiku-4-5-20251001 (content)

## Permanent Constraints
- Tech: CF Workers+Hono v4.12+, Angular 21+, Drizzle v1+D1, Clerk, Stripe
- Brand: #060610 bg | #00E5FF cyan | Sora/Space Grotesk | dark-first
- Quality: Zero stubs/TODOs | Zero errors | deployed+purged before done | OWASP 2025

## Current Truth
Last updated: {date}
{living snapshot of what's built, what's next, what changed}
```
