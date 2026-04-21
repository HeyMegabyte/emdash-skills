---
name: "observability-and-growth"
description: "Full instrumentation from day one. GA4 via GTM (14-step automation), PostHog (product analytics, feature flags, A/B tests), Sentry (error tracking), Stripe (payment flows with branded checkout), Listmonk (newsletters on CF Containers), growth surfaces, event-driven funnels, and operational telemetry with health endpoints."
submodules:
  - stripe-billing.md
  - analytics-configuration.md
  - user-feedback-collection.md
---

# 13 — Observability and Growth

Submodules: stripe-billing (free+$50/mo, donation presets, auto Products/Prices), analytics-configuration (GA4 14-step, GTM, PostHog, flags, A/B, funnels), user-feedback-collection (5-star widget, /admin/feedback, NPS, testimonials).

## Stack
PostHog (posthog.megabyte.space, self-hosted, cookie-free) | GA4 via GTM | Sentry (sentry.megabyte.space) | GTM (ONLY script loader except Sentry) | Listmonk on Coolify | OneSignal

## GA4+GTM (14-step)
Auth GCP, create GA4 account+property+stream, create GTM account+container, GA4 config tag, event triggers, event tags, publish, inject snippet, add dataLayer, update CSP, deploy+verify.

CSP: script-src googletagmanager.com google-analytics.com *.posthog.com. connect-src analytics.google.com *.posthog.com *.sentry.io.

## PostHog
```typescript
posthog.init(key, { api_host: 'https://posthog.megabyte.space', capture_pageview: true, capture_pageleave: true, autocapture: true, session_recording: { maskAllInputs: true } });
```
Events: page_view, cta_click, form_submit, signup_start/complete, feature_used, upgrade_click, error_displayed. Flags: `posthog.isFeatureEnabled('flag')`.

## Sentry
```typescript
Sentry.init({ dsn: 'https://KEY@sentry.megabyte.space/ID', environment: 'production', tracesSampleRate: 0.1, replaysOnErrorSampleRate: 1.0 });
```
Worker: app.onError() + toucan-js. Queries: scripts/sentry_api.py.

## Stripe
Get key, extract brand, configure branding (logo/colors), create products/prices, payment links, embed, verify test, switch live. Pricing: 3 tiers (Free/Pro/Enterprise), highlight Pro, annual default.

## Listmonk
CF Worker proxy, CF Container (Listmonk), Neon PostgreSQL. API: POST /api/subscribers, /api/campaigns. Newsletter in footer.

## Growth (every product — distribution > technology)
Newsletter, social sharing (OG+buttons), SEO, social proof, CTA optimization, referral links, blog+RSS.
Event flow: visit/page_view, CTA/cta_click, signup/welcome email, feature/feature_used, limit/upgrade_prompt, upgrade/onboarding.

### Viral Loops (K≥0.20)
Brand in every output (shared links, exports, collab). 100→124 users across 2 referral cycles, zero paid.

### Programmatic SEO
Bottom-of-funnel keyword pages (5-10x conversion vs top). Topic clusters. AI: keywords→pages→metadata→internal links. Compounds 3-5yr.

### Pricing
Outcome-first ("Save 10hrs/week">features, +34% conversion). 3 tiers max (+31% vs 4+). Highlight recommended. Decoy middle→+35-50% premium. Anchor highest first. Hybrid base+usage (38% higher revenue growth).

### PLG Loop
Self-serve onboard→AI monitors usage→expansion intent (team growth, ceiling, API spikes)→auto upgrade rec+ROI calculator. 2x growth, 50% lower CAC.

### Launch Day
PH+HN+X+LinkedIn simultaneous. PH: engagement signals>upvotes, first 3hrs critical. Pre-launch: 5-email waitlist (problem→solution→proof→access→launch). Target: 500-1000 signups day one.

## A/B Testing
`posthog.getFeatureFlag('exp')` then track conversion. One per page, min 100 conversions, document hypothesis.

## Health
```typescript
app.get('/health', (c) => c.json({ status:'ok', version: env.VERSION, timestamp: new Date().toISOString() }));
```
Alerts: errors >1%, P95 >500ms, uptime <99.9%, cache <80%, CPU >10ms.

## Integration Harmony
GTM = only loader (except Sentry). No double-counting (GTM dedup). Every action: GA4+PostHog+Sentry breadcrumb. Stripe webhook to PostHog+GA4+Sentry.

## Autonomous Monitoring (to Idea Engine)
After 1+ day: Sentry errors (auto-fix), PostHog bounce (suggest UX), low CTR (suggest copy), GA4 queries (keywords), Lighthouse (investigate).

## Custom Events
donate_click, newsletter_signup, scroll_depth (25/50/75/100), video_play, external_link_click. Scroll: track thresholds once.

## Key Discovery
1. Project .env.local 2. Shared pool 3. Coolify env 4. ~/.config/emdash/ 5. Prompt once, store permanently.
