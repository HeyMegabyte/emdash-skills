---
name: "observability-and-growth"
description: "Full instrumentation from day one. PostHog consolidates product analytics + feature flags + error tracking (one platform, one bill). GA4 via GTM (14-step automation, custom dimensions over events, server-side tagging). Sentry (deep error tracking + performance). Stripe (webhook-first with idempotent processing). Listmonk on Coolify (newsletters via Resend SMTP relay). PLG 7-layer framework. Programmatic SEO (5 page types). Incident auto-remediation via Sentry→Inngest pipeline. AI search (GEO) awareness."
metadata:
  version: "2.1.0"
  updated: "2026-04-23"
  context: "fork"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - stripe-billing.md
  - analytics-configuration.md
  - user-feedback-collection.md
  - feature-flags-and-experiments.md
  - email-marketing-and-listmonk.md
  - sentry-alert-rules.md
  - conversion-optimization.md
---

# 13 -- Observability and Growth

Submodules: stripe-billing (free+$50/mo, donation presets, auto Products/Prices, webhook best practices), analytics-configuration (GA4 14-step, GTM, PostHog, flags, A/B, funnels), user-feedback-collection (5-star widget, /admin/feedback, NPS, testimonials), feature-flags-and-experiments (PostHog flags, A/B tests, gradual rollout, kill switches, lifecycle management), email-marketing-and-listmonk (Listmonk on Coolify, Resend SMTP relay, campaigns, subscribers, Go templates, double opt-in), sentry-alert-rules (auto-configured alerts at first deploy, Slack integration, deploy silence).

## Stack (Consolidation Strategy — ***ALL AUTO-PROVISION***)
PostHog (posthog.megabyte.space, self-hosted, cookie-free) = product analytics + feature flags + A/B tests + session recording + error tracking (100K errors/mo free). Sentry (sentry.megabyte.space) = deep error tracking + performance + replays. GA4 via GTM = marketing analytics + server-side tagging. Listmonk on Coolify = newsletters. Resend = transactional email (React Email v6 components). OneSignal = push.

**Auto-provision mandate (***EVERY PROJECT***):** All three analytics layers (Sentry+PostHog+GA4/GTM) are non-negotiable from first deploy. Missing any one → install in same prompt. Sentry: mcp__sentry__create_project→DSN→wrangler secret put. PostHog: add snippet to HTML with `persistence:'memory'` (cookie-free), CSP script-src+connect-src for posthog domain. GA4/GTM: add GTM container snippet (head+noscript body), CSP for googletagmanager.com+google-analytics.com+analytics.google.com. Never ship a page without all three firing. PostHog consolidates 3-4 separate tools. Sentry adds depth (stack traces + user experience + business impact together). GTM is ONLY script loader except Sentry early init.

## GA4+GTM Best Practices (2026)
GTM-first: centralize measurement via GTM for no-code updates, version control, preview mode. Use Google Tag (replaces old GA4 Config Tag). Custom dimensions over separate events: add `form_type`, `user_type` context rather than `form_submit_contact` vs `form_submit_signup`. One data stream per property. Internal traffic filter by IP. Extend retention to 14 months (default 2mo). Enable Google Signals for cross-device. Quality>quantity: focused measurement plan, not 70+ events. Quarterly audits.

**Server-side tagging:** route measurement through your own server before 3rd parties. Recovers ~33% data lost to ad blockers. Standard for serious analytics in 2026.

CSP: script-src googletagmanager.com google-analytics.com *.posthog.com. connect-src analytics.google.com *.posthog.com *.sentry.io.

## PostHog
```typescript
posthog.init(key, { api_host: 'https://posthog.megabyte.space', capture_pageview: true, capture_pageleave: true, autocapture: true, session_recording: { maskAllInputs: true }, persistence: 'memory' });
```
Events: page_view, cta_click, form_submit, signup_start/complete, feature_used, upgrade_click, error_displayed. Naming: snake_case, present-tense verbs. Consistent IDs across platforms. Prefer server-side event logging. Reverse proxy to bypass ad blockers.

**PostHog AI (2026):** In-app AI chat connected to product data — queries data, creates insights, writes SQL, creates feature flags, edits filters via natural language. **LLM analytics** for AI-native teams: track token usage, model performance, prompt latency. **Data warehouse** with 36 managed sources (Stripe, HubSpot, Salesforce, etc.) — query across product + billing + CRM data in one place.

**Feature flags best practices:** phased rollout 1%→10%→50%→100% with cohorts. Positive booleans (`is_premium_user` not `is_not_premium_user`). Target <20-30 active flags per service (>50 = flag sprawl). Flag at 100% with no targeting = remove and hardcode. Sticky flags for experiment consistency. Integration with product analytics = see feature impact on conversion/retention/revenue directly.

## Sentry (***AUTO-PROVISION — EVERY PROJECT***)
```typescript
Sentry.init({ dsn: 'https://KEY@sentry.megabyte.space/ID', environment: 'production', tracesSampleRate: 0.1, replaysOnErrorSampleRate: 1.0 });
```
**Auto-provision mandate:** Any project missing @sentry/cloudflare (Workers) or @sentry/node (Node) → install SDK + wrap entry point + create Sentry project via `mcp__sentry__create_project` (org: megabyte-labs, team: megabyte-labs, platform: javascript) → set SENTRY_DSN via `wrangler secret put`. Never leave a project without Sentry. Full-stack traces: Sentry.init with tracesSampleRate, app.onError()→Sentry.captureException with route+userId tags, breadcrumbs before risky ops, SENTRY_RELEASE env for deploy tracking. Workers: withSentry() wrapper from @sentry/cloudflare. Node/Bun: @sentry/hono or @sentry/node instrument.ts. Transaction sampling 20% controls costs. Prioritize issues by endpoint failure count on core user journeys.

## Incident Auto-Remediation
Sentry alerts → webhook → Inngest function. Auto-classify severity (P1-P4). P1: auto-rollback + Slack alert + SMS to Brian. P2-P3: auto-create GitHub issue + Slack notification. P4: log and batch report. Post-incident: auto-generate timeline from Sentry + deploy logs.

## Stripe
Webhook-first architecture. Always verify signatures with official libraries. Idempotent processing: log event IDs, handle duplicates. Async queue processing at scale. Key events: checkout.session.completed→provision, customer.subscription.created→record, customer.subscription.updated→plan changes, customer.subscription.deleted→revoke, invoice.payment_succeeded→confirm, invoice.payment_failed→dunning, trial_will_end→notify. Stripe retries 3 days with exponential backoff. Pricing: 3 tiers (Free/Pro/Enterprise), highlight Pro, annual default (20% discount). Stripe Link for one-click (+7% conversion lift).

## Email (Resend + Listmonk)
**Resend:** React Email v6 components → Resend API → delivery. Server-side only (never expose API key). Use Row/Column/Section primitives (table-based for Outlook). Collaborative templates with versioning/rollback.

**Listmonk:** v6.1.0, Coolify deploy, Neon PostgreSQL backend. Use Resend as SMTP relay (best deliverability + self-hosted control). Double opt-in. CF Worker proxy for public subscribe/unsubscribe endpoints. Go templates with subscriber attributes.

**Patterns:** Transactional (Resend API) | Marketing (Listmonk campaigns) | Lifecycle (onboarding drips, re-engagement, churn prevention).

## Growth (distribution > technology)

### PLG 7-Layer Framework
L1-GTM: product-led channels, no-login entry points, product-led SEO/AEO/GEO. L2-Information: pricing pages, case studies, template galleries. L3-Conversion: strategic freemium, billing gates at friction points. L4-Activation: friction-reducing onboarding, in-product checklists. L5-Retention: habit loops, feature releases. L6-Monetization: pricing tiers aligned with segments. L7-Expansion: complementary features, land-and-expand. **Fix most broken layer + 1-2 below. Downstream without upstream = waste.** AI copilot features = core to PLG in 2026, not bolt-on.

### Viral Loops (K>=0.20)
Baked-in sharing: brand in every output (shared links, exports, collab, templates). Notion templates = every share is viral loop. Calendly links = every scheduling is exposure. K>1 = self-growing (rare; most PLG <1 but still reduces CAC). 3-6 months initial traction, 12-18 months sustainable growth. 100→124 users across 2 referral cycles, zero paid.

### Programmatic SEO (5 Proven Page Types)
1. Integration pages: "[Tool A] + [Tool B] integration" (Zapier: 16.2M monthly visitors)
2. Alternative/comparison: "[Competitor] alternatives" with feature comparisons
3. Use case/industry: vertical-specific variations (Jira for agile, Jira for incident mgmt)
4. Template/resource libraries: downloadable assets driving signups
5. Location/segment: geographic or customer-segment variations

Implementation: 90 days. Days 1-14 foundation, 15-30 build, 31-45 pilot (50 pages, 100% human review), 46-60 iterate, 61-90 scale. 300+ unique words/page, 30-40% content differentiation. Indexing 2-4 weeks, traffic 4-8 weeks, growth 3-6 months. ROI 6-12 months.

### AI Search Optimization (GEO)
Lead with concise quotable answers (40-60 words). Explicit entity definitions. FAQ sections. Statistics with sources. Structured data + comparison tables. JSON-LD accuracy: 16%→54% with structured data. ChatGPT favors Wikipedia/G2; Perplexity favors Reddit/YouTube; Google AI Overviews favor traditionally ranked.

### Launch Day
PH+HN+X+LinkedIn simultaneous. PH: engagement signals>upvotes, first 3hrs critical. Pre-launch: 5-email waitlist (problem→solution→proof→access→launch). Target: 500-1000 signups day one.

### Pricing Psychology
Outcome-first ("Save 10hrs/week">features, +34% conversion). 3 tiers max (+31% vs 4+). Decoy middle→+35-50% premium. Anchor highest first. Hybrid base+usage (38% higher revenue growth).

## A/B Testing
`posthog.getFeatureFlag('exp')` then track conversion. One per page, min 100 conversions per variant, full week minimum, document hypothesis. Check segments across plans/devices.

## Health
```typescript
app.get('/health', (c) => c.json({ status:'ok', version: env.VERSION, timestamp: new Date().toISOString() }));
```
Alerts: errors >1%, P95 >500ms, uptime <99.9%, cache <80%, CPU >10ms.

## Integration Harmony
GTM = only loader (except Sentry). No double-counting (GTM dedup). Every action: GA4+PostHog+Sentry breadcrumb. Stripe webhook to PostHog+GA4+Sentry.

## Autonomous Monitoring (to Idea Engine)
After 1+ day: Sentry errors (auto-fix via Inngest), PostHog bounce (suggest UX), low CTR (suggest copy), GA4 queries (keywords), Lighthouse (investigate).

## Custom Events
donate_click, newsletter_signup, scroll_depth (25/50/75/100), video_play, external_link_click. Scroll: track thresholds once with passive listener.

## Key Discovery
1. Project .env.local 2. Shared pool 3. Coolify env 4. ~/.config/emdash/ 5. Prompt once, store permanently.
