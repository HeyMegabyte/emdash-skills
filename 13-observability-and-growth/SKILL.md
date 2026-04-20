---
name: "Observability and Growth"
description: "Full instrumentation from day one. GA4 via GTM (14-step automation), PostHog (product analytics, feature flags, A/B tests), Sentry (error tracking), Stripe (payment flows with branded checkout), Listmonk (newsletters on CF Containers), growth surfaces, event-driven funnels, and operational telemetry with health endpoints."
---

# 13 — Observability and Growth

> Instrument everything. Measure what matters. Grow with evidence.

---

## Core Principle

**You can't improve what you can't measure.** Every product ships with analytics, error tracking, and event instrumentation from day one. Growth is not an afterthought — it's engineered into the product.

---

## Default Instrumentation Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Product analytics | PostHog | User behavior, funnels, feature flags |
| Web analytics | GA4 via GTM | Traffic, acquisition, engagement |
| Error tracking | Sentry | Runtime errors, performance |
| Tag management | GTM | Event management without deploys |
| Email marketing | Listmonk | Newsletters, campaigns |
| Notifications | OneSignal | Push notifications (when needed) |

---

## GA4 + GTM Setup

### Full Automation Flow
1. Authenticate with GCP service account (`/Users/apple/.config/emdash/gcp-service-account.json`)
2. Get or create GA4 account for the domain
3. Create GA4 property
4. Create web data stream (get Measurement ID: G-XXXXXXX)
5. Get or create GTM account
6. Create GTM container
7. Create GA4 Configuration tag
8. Create custom event triggers (click, scroll, form submission)
9. Create GA4 event tags for each trigger
10. Publish GTM container version
11. Inject GTM snippet into HTML `<head>`
12. Add dataLayer events to interactive elements
13. Update CSP headers to allow GTM/GA4 domains
14. Deploy and verify events fire

### GTM Snippet
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

### CSP Headers for Analytics
```
script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://*.posthog.com;
img-src 'self' https://www.google-analytics.com https://*.posthog.com;
connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.posthog.com https://*.sentry.io;
```

---

## PostHog Setup

### Integration
```typescript
// In Worker or frontend
import posthog from 'posthog-js';

posthog.init(env.POSTHOG_API_KEY, {
  api_host: 'https://us.i.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});
```

### Key Events to Track
| Event | When | Properties |
|-------|------|-----------|
| `page_view` | Every page load | `path`, `title`, `referrer` |
| `cta_click` | CTA button clicked | `cta_text`, `cta_location` |
| `form_submit` | Form submitted | `form_name`, `success` |
| `signup_start` | Auth flow started | `method` |
| `signup_complete` | Account created | `method`, `plan` |
| `feature_used` | Feature activated | `feature_name` |
| `upgrade_click` | Pricing CTA clicked | `plan`, `source` |
| `error_displayed` | Error shown to user | `error_type`, `page` |

### Feature Flags
```typescript
if (posthog.isFeatureEnabled('new-pricing-page')) {
  // Show new pricing
} else {
  // Show old pricing
}
```

---

## Sentry Setup

### Integration
```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1, // 10% of transactions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
});
```

### Worker-Side Error Reporting
```typescript
app.onError((err, c) => {
  // Report to Sentry
  console.error(`[${c.req.method}] ${c.req.path}:`, err.message);
  // Sentry integration via toucan-js for Workers
  return c.json({ error: 'Internal server error' }, 500);
});
```

### Sentry Monitoring Queries
```bash
# List recent issues
uv run python scripts/sentry_api.py list-issues --org megabyte --project domain-name

# Get issue detail
uv run python scripts/sentry_api.py issue-detail --issue-id 12345
```

---

## Stripe Integration

### Payment Flow Setup
1. Get API key from `.env.local`
2. Extract brand identity for checkout customization
3. Configure Stripe account branding (logo, colors, icon)
4. Create products and prices (multiple tiers)
5. Create payment links
6. Embed in project (buttons, pricing page)
7. Verify test mode works
8. Switch to live when ready

### Stripe Branding
```typescript
const stripe = new Stripe(env.STRIPE_API_KEY);

// Set branding
await stripe.accounts.update('acct_...', {
  settings: {
    branding: {
      icon: 'https://domain.com/favicon-32x32.png',
      logo: 'https://domain.com/logo.png',
      primary_color: '#00E5FF',
      secondary_color: '#060610',
    }
  }
});
```

### Pricing Page Pattern
```
3 tiers: Free / Pro / Enterprise
Highlight Pro as "Most Popular"
Annual billing default with monthly option
Each tier: name, price, feature list, CTA
Feature comparison table below tiers
FAQ about billing below comparison
```

---

## Email Marketing (Listmonk)

### Architecture
```
Cloudflare Worker (proxy) → Cloudflare Container (Listmonk) → Neon PostgreSQL
```

### Key API Endpoints
| Action | Method | Endpoint |
|--------|--------|----------|
| Add subscriber | POST | `/api/subscribers` |
| List subscribers | GET | `/api/subscribers` |
| Create campaign | POST | `/api/campaigns` |
| Send campaign | PUT | `/api/campaigns/{id}/status` |
| Create list | POST | `/api/lists` |

### Website Integration
```html
<form id="newsletter" data-action="subscribe">
  <input type="email" name="email" placeholder="you@example.com" required>
  <button type="submit">Subscribe</button>
</form>
```

---

## Growth Surfaces

### Built Into Every Product
| Surface | Implementation |
|---------|---------------|
| Newsletter signup | Footer + dedicated section |
| Social sharing | OG tags + share buttons |
| SEO | Structured data + sitemap + robots.txt |
| Social proof | Testimonials, stats, logos |
| CTA optimization | Above fold + end of page + after value demos |
| Referral | Share links with tracking params |
| Content marketing | Blog with RSS feed |

### Event-Driven Growth
```
User visits → page_view event
User clicks CTA → cta_click event → track source
User signs up → signup_complete event → trigger welcome email
User uses feature → feature_used event → track engagement
User hits limit → upgrade_prompt event → show pricing
User upgrades → purchase_complete event → trigger onboarding
```

---

## Experimentation (A/B Testing)

### PostHog Experiments
```typescript
// Feature flag for experiment
const variant = posthog.getFeatureFlag('pricing-experiment');

if (variant === 'control') {
  // Show current pricing
} else if (variant === 'test-a') {
  // Show new pricing layout
}

// Track conversion
posthog.capture('pricing_conversion', { variant });
```

### Experiment Rules
- One experiment per page at a time
- Minimum 100 conversions before concluding
- Track both primary and secondary metrics
- Document hypothesis before starting
- Clean up losing variants promptly

---

## Operational Telemetry

### Health Monitoring
```typescript
// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: env.VERSION || 'unknown',
    timestamp: new Date().toISOString(),
    uptime: process.uptime?.() || 'N/A',
  });
});
```

### Key Operational Metrics
| Metric | Source | Alert When |
|--------|--------|-----------|
| Error rate | Sentry | > 1% of requests |
| P95 latency | PostHog/CF Analytics | > 500ms |
| Uptime | CF Health Checks | < 99.9% |
| Cache hit rate | CF Analytics | < 80% |
| Worker CPU time | CF Analytics | > 10ms avg |

---

## Trigger Conditions
- New project (set up full instrumentation)
- New feature (add event tracking)
- Payment integration needed
- Newsletter/email needed
- Growth audit requested

## Stop Conditions
- All instrumentation verified firing in production
- Analytics dashboard configured
- Error tracking active

## Cross-Skill Dependencies
- **Reads from:** 02-goal-and-brief (what to measure), 05-architecture-and-stack (services to integrate), 09-brand-and-content (branding for Stripe)
- **Feeds into:** 08-deploy-and-runtime (verify instrumentation), 14-independent-idea-engine (data for decisions)

---

## Autonomous Monitoring (Feed Back to Idea Engine)

After a project has been live for 1+ day, the idea engine (skill 14) should check:
- **Sentry:** Are there recurring errors? → auto-fix if pattern is clear
- **PostHog:** Which pages have high bounce rate? → suggest UX improvements
- **PostHog:** Which CTAs have low click-through? → suggest copy/placement changes
- **GA4:** What search queries are driving traffic? → suggest keyword optimization
- **Lighthouse:** Has performance degraded since launch? → investigate and fix

These checks feed directly into skill 14's idea queue as research-backed proposals.

## Delightful Integration Checklist (ALL must be present)

Every product ships with these integrations working harmoniously:

| Integration | Implementation | Verification |
|-------------|---------------|--------------|
| **Google Tag Manager** | Single GTM container script in `<head>`. ALL other scripts loaded via GTM (never hardcoded). | Check: only 1 script tag in HTML, everything else via GTM |
| **Google Analytics 4** | Via GTM. Enhanced measurement ON. Custom events for: page_view, sign_up, purchase, form_submit, cta_click, scroll_depth, video_play | Check: GA4 debug view shows events firing |
| **PostHog** | Via GTM OR direct SDK. Session recording ON. Feature flags configured. Funnels for: signup → activation → retention | Check: PostHog dashboard shows live sessions |
| **Sentry** | SDK in app code (not GTM). Source maps uploaded on deploy. Performance tracing ON. Release tracking with commit SHA | Check: Sentry shows 0 unresolved errors after deploy |
| **Stripe** | Checkout session events tracked in PostHog. Revenue attribution. Webhook → analytics pipeline | Check: purchase events appear in both PostHog and GA4 |
| **Listmonk** | Newsletter signup in footer. Welcome flow automated. Segment by source | Check: test subscribe → receive welcome email |

### Integration Harmony Rules
- GTM is the ONLY script loader (except Sentry SDK which needs early initialization)
- PostHog and GA4 must NOT double-count events — use GTM to deduplicate
- Sentry captures errors that PostHog session replay can correlate with
- Every user action that matters has: GA4 event + PostHog event + Sentry breadcrumb
- Feature flags in PostHog control A/B tests reported to GA4
- Stripe webhook → PostHog `purchase` event → GA4 `purchase` event → Sentry transaction

## What This Skill Owns
- Analytics setup and configuration (GA4, GTM, PostHog)
- Error tracking (Sentry)
- Payment integration (Stripe)
- Email marketing (Listmonk, Resend)
- Growth surfaces and strategies
- Experimentation framework
- Operational telemetry
- Feeding observability data to the idea engine

## What This Skill Must Never Own
- Product features (→ 06)
- Visual design (→ 10)
- Deployment (→ 08)
- Architecture (→ 05)

---

## Self-Hosted Observability (Coolify)

### Self-Hosted URLs
| Tool | Self-Hosted URL | Free Tier |
|------|-----------------|-----------|
| **Sentry** | sentry.megabyte.space | 5K events/mo |
| **PostHog** | posthog.megabyte.space | 1M events/mo |

### Cookie-Free Analytics (No Consent Banner Needed)
PostHog self-hosted at posthog.megabyte.space is first-party data collection.
No cookies cross domain boundaries → no GDPR cookie consent banner required.
This eliminates the need for OpenSaaS-style cookie consent modals entirely.
Plausible is another cookie-free option but PostHog provides more features.

### PostHog (Self-Hosted Configuration)
```javascript
posthog.init('PROJECT_KEY', {
  api_host: 'https://posthog.megabyte.space',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  session_recording: { maskAllInputs: true },
});
```

### Sentry (Self-Hosted Configuration)
```javascript
Sentry.init({
  dsn: 'https://KEY@sentry.megabyte.space/PROJECT_ID',
  environment: 'production',
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Lighthouse CI
```bash
npx lighthouse "$PROD_URL" --output=json --chrome-flags="--headless --no-sandbox" | \
  jq '{perf: .categories.performance.score, a11y: .categories.accessibility.score}'
```
For multimedia-heavy pages, scores < 90 are EXPECTED. Report but don't block.

## Additional Custom Events

```javascript
// Engagement events
posthog.capture('donate_click', { amount, method });
posthog.capture('newsletter_signup', { source });
posthog.capture('scroll_depth', { percent }); // 25, 50, 75, 100
posthog.capture('video_play', { video_id, duration });
posthog.capture('external_link_click', { url });
posthog.capture('pdf_download', { filename });
```

### Scroll Depth Tracking
```javascript
const depths = [25, 50, 75, 100];
const tracked = new Set();
window.addEventListener('scroll', () => {
  const pct = Math.round((scrollY / (document.body.scrollHeight - innerHeight)) * 100);
  depths.filter(d => pct >= d && !tracked.has(d)).forEach(d => {
    tracked.add(d);
    posthog.capture('scroll_depth', { percent: d });
  });
});
```

## API Key Discovery Order
1. Project `.env.local`
2. Shared pool: `rare-chefs-film-8op/.env.local`
3. Coolify env vars via API
4. `~/.config/emdash/`
5. Prompt user ONCE, store permanently

## Coolify / Postiz
See skill 26 (Shared API Pool) and skill 27 (Social Automation).
