---
name: "Analytics Configuration"
description: "Canonical owner of GA4 setup (14-step automation), GTM container configuration, PostHog SDK integration, feature flags, A/B tests, event taxonomy, funnel definitions, session recording config, and scroll/engagement tracking. The intelligence layer that powers data-driven decisions."
always-load: false---

# 23 — Analytics Configuration

> Measure everything that matters. Ignore everything that does not. Make decisions from data, not hunches.

---

## Core Principle

**Analytics is not about collecting data — it is about answering questions.** Every event tracks a decision-relevant metric. Every funnel maps to a business outcome. Every feature flag tests a hypothesis. Ship analytics on day one, not day thirty.

---

## Canonical Definitions

### Analytics Stack

| Layer | Tool | Purpose | Self-Hosted |
|-------|------|---------|-------------|
| Tag Management | GTM | Load all scripts, manage events | No (Google) |
| Web Analytics | GA4 | Traffic, acquisition, SEO | No (Google) |
| Product Analytics | PostHog | Behavior, funnels, retention | Yes (posthog.megabyte.space) |
| Feature Flags | PostHog | Gradual rollouts, kill switches | Yes |
| A/B Testing | PostHog Experiments | Hypothesis testing | Yes |
| Session Recording | PostHog | User replay on errors | Yes |
| Error Tracking | Sentry | Runtime errors (see skill 13) | Yes (sentry.megabyte.space) |

### Event Naming Convention

```
object_action (snake_case, past tense for completed actions)

Examples:
  page_viewed           (not "pageView" or "view_page")
  cta_clicked           (not "click_cta" or "ctaClick")
  form_submitted        (not "submit_form")
  signup_completed      (not "signupComplete")
  subscription_started  (not "start_subscription")
  feature_activated     (not "activateFeature")
  error_displayed       (not "displayError")
```

### Standard Event Taxonomy

| Category | Event | Properties | Trigger |
|----------|-------|-----------|---------|
| Navigation | `page_viewed` | `path`, `title`, `referrer` | Every page load |
| Navigation | `scroll_depth_reached` | `percent` (25/50/75/100) | Scroll milestones |
| Engagement | `cta_clicked` | `cta_text`, `cta_location`, `destination` | Any CTA click |
| Engagement | `external_link_clicked` | `url`, `text` | External link click |
| Engagement | `video_played` | `video_id`, `title`, `duration` | Video play |
| Conversion | `form_submitted` | `form_name`, `success`, `error_type` | Form submit |
| Conversion | `signup_started` | `method` (google/email) | Auth flow begins |
| Conversion | `signup_completed` | `method`, `plan` | Account created |
| Conversion | `purchase_completed` | `amount`, `currency`, `plan` | Checkout success |
| Product | `feature_activated` | `feature_name`, `context` | Feature first used |
| Product | `search_performed` | `query`, `results_count` | Site search |
| Product | `feedback_submitted` | `rating`, `page` | Feedback widget |
| Error | `error_displayed` | `error_type`, `page`, `message` | Error shown to user |

---

## Rules

1. **GTM is the ONLY script loader** (except Sentry SDK which needs early init for error capture). All analytics, pixels, and third-party scripts load through GTM.
2. **Never hardcode GA4 or PostHog directly in HTML.** They must load via GTM tags for centralized management.
3. **Self-hosted PostHog is preferred** (posthog.megabyte.space). No cookies cross domain boundaries, no GDPR consent banner needed. Use cloud PostHog only if self-hosted is unavailable.
4. **Every user action that matters gets THREE signals:** GA4 event (acquisition) + PostHog event (behavior) + Sentry breadcrumb (debugging).
5. **Feature flags before launch, not after.** Create the flag before building the feature. Ship behind flag. Enable gradually. Remove flag after 100% rollout.
6. **A/B tests require a hypothesis, minimum sample size, and defined success metric** before starting. Never test without knowing what "winning" means.
7. **Session recording masks all inputs by default.** PII never recorded. Opt-in recording only for debugging specific user issues.
8. **DataLayer pushes happen before the action completes** (optimistic tracking). If the action fails, push a correction event.
9. **Do NOT double-count events.** If both GA4 and PostHog track an event, use GTM to ensure exactly one fire per action per tool.
10. **Scroll depth tracks at 25/50/75/100% milestones only.** No continuous tracking (performance cost).

---

## Patterns

### GA4 + GTM 14-Step Automation

```typescript
// Step 1-4: Setup accounts and properties
async function setupGA4(domain: string, gcpKeyPath: string) {
  const auth = await authenticateGCP(gcpKeyPath);

  // 1. Get or create GA4 account
  const account = await getOrCreateGA4Account(auth, domain);
  // 2. Create GA4 property
  const property = await createGA4Property(auth, account.id, domain);
  // 3. Create web data stream (returns Measurement ID: G-XXXXXXX)
  const stream = await createWebDataStream(auth, property.id, `https://${domain}`);
  // 4. Extract Measurement ID
  const measurementId = stream.measurementId; // G-XXXXXXX

  return { account, property, stream, measurementId };
}

// Step 5-10: GTM container setup
async function setupGTM(domain: string, measurementId: string) {
  // 5. Get or create GTM account
  // 6. Create GTM container
  // 7. Create GA4 Configuration tag (fires on All Pages trigger)
  // 8. Create custom event triggers (cta_click, form_submit, scroll_depth)
  // 9. Create GA4 event tags for each custom trigger
  // 10. Publish container version
}

// Step 11-14: Integration
// 11. Inject GTM snippet into HTML <head>
// 12. Add dataLayer.push() calls to interactive elements
// 13. Update CSP headers to allow GTM/GA4 domains
// 14. Deploy and verify events fire in GA4 DebugView
```

### GTM Snippet (inject in every HTML response)

```html
<!-- Google Tag Manager (in <head>, as high as possible) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>

<!-- Google Tag Manager (noscript, immediately after <body>) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### PostHog SDK Integration

```typescript
import posthog from 'posthog-js';

// Initialize (self-hosted, cookie-free)
posthog.init('phc_PROJECT_KEY', {
  api_host: 'https://posthog.megabyte.space',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
  session_recording: {
    maskAllInputs: true,        // PII protection
    maskTextSelector: '.sensitive', // Mask specific elements
  },
  persistence: 'memory',        // No cookies, no localStorage
  disable_session_recording: false,
  loaded: (ph) => {
    if (import.meta.env.DEV) ph.opt_out_capturing();
  },
});

// Identify user after auth
posthog.identify(userId, {
  email: user.email,
  name: user.name,
  plan: user.plan,
  created_at: user.createdAt,
});
```

### Feature Flags Pattern

```typescript
// Check feature flag (with fallback)
function isFeatureEnabled(flag: string, defaultValue = false): boolean {
  if (typeof posthog === 'undefined') return defaultValue;
  return posthog.isFeatureEnabled(flag) ?? defaultValue;
}

// Usage in component
if (isFeatureEnabled('new-pricing-page')) {
  renderNewPricing();
} else {
  renderCurrentPricing();
}

// Feature flag with payload (dynamic config)
const config = posthog.getFeatureFlagPayload('hero-experiment');
// Returns: { headline: "Ship faster", cta: "Start free" }
```

### A/B Testing (PostHog Experiments)

```typescript
// Define experiment
const experiment = {
  name: 'pricing-page-layout',
  hypothesis: 'Horizontal pricing cards increase Pro plan selection by 15%',
  variants: ['control', 'horizontal-cards'],
  successMetric: 'subscription_started',
  minimumSampleSize: 200,
  duration: '14 days',
};

// Implement variant
const variant = posthog.getFeatureFlag('pricing-page-layout');

if (variant === 'horizontal-cards') {
  renderHorizontalPricing();
} else {
  renderVerticalPricing(); // control
}

// Track conversion (both variants)
function onPlanSelected(plan: string) {
  posthog.capture('subscription_started', {
    plan,
    experiment: 'pricing-page-layout',
    variant: posthog.getFeatureFlag('pricing-page-layout'),
  });
}
```

### Scroll Depth Tracking

```typescript
function initScrollDepthTracking() {
  const milestones = [25, 50, 75, 100];
  const tracked = new Set<number>();

  const handler = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const percent = Math.round((window.scrollY / scrollHeight) * 100);

    for (const milestone of milestones) {
      if (percent >= milestone && !tracked.has(milestone)) {
        tracked.add(milestone);
        window.dataLayer?.push({
          event: 'scroll_depth_reached',
          scroll_percent: milestone,
          page_path: window.location.pathname,
        });
        posthog.capture('scroll_depth_reached', { percent: milestone });
      }
    }
  };

  window.addEventListener('scroll', handler, { passive: true });
}
```

### DataLayer Event Pattern

```typescript
// Standard dataLayer push for GTM
function trackEvent(event: string, properties: Record<string, unknown> = {}) {
  // Push to GTM dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...properties });

  // Also send to PostHog (direct, not via GTM to avoid circular)
  posthog.capture(event, properties);
}

// Usage
trackEvent('cta_clicked', { cta_text: 'Start Free Trial', cta_location: 'hero' });
trackEvent('form_submitted', { form_name: 'contact', success: true });
trackEvent('purchase_completed', { amount: 5000, currency: 'usd', plan: 'pro' });
```

### Funnel Definitions

```typescript
// Define standard funnels in PostHog
const FUNNELS = {
  signupToActivation: {
    name: 'Signup to Activation',
    steps: [
      { event: 'page_viewed', properties: { path: '/signup' } },
      { event: 'signup_completed' },
      { event: 'feature_activated' },
    ],
    conversionWindow: '7 days',
  },
  visitToPurchase: {
    name: 'Visit to Purchase',
    steps: [
      { event: 'page_viewed', properties: { path: '/' } },
      { event: 'cta_clicked', properties: { cta_location: 'pricing' } },
      { event: 'purchase_completed' },
    ],
    conversionWindow: '30 days',
  },
};
```

### CSP Headers for Analytics

```
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://*.posthog.com;
img-src 'self' https://www.google-analytics.com https://*.posthog.com https://www.googletagmanager.com;
connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.posthog.com https://*.sentry.io https://region1.google-analytics.com;
```

---

## Verification Checklist

```
[ ] GTM container loads (check Network tab for gtm.js)
[ ] GA4 events fire (check GA4 DebugView)
[ ] PostHog captures page views (check PostHog Live Events)
[ ] Custom events fire on interactions (test each CTA, form, scroll)
[ ] Feature flags resolve correctly (check PostHog feature flags tab)
[ ] Session recording captures user flow (check PostHog Recordings)
[ ] No duplicate events (one fire per action per tool)
[ ] CSP allows all analytics domains (no ERR_BLOCKED_BY_CSP)
[ ] DataLayer pushes include all required properties
[ ] Scroll depth fires at 25/50/75/100 milestones
[ ] Self-hosted PostHog: no cookies set (check Application tab)
[ ] Sentry errors correlate with PostHog sessions
```

---

## Integration Points

| Skill | Interaction |
|-------|------------|
| 05 Architecture | Analytics stack selection |
| 07 Quality | Verify analytics fire in E2E tests |
| 08 Deploy | Verify instrumentation post-deploy |
| 13 Observability | Parent skill; analytics is one component of observability |
| 14 Idea Engine | Analytics data feeds improvement proposals |
| 18 Stripe | Purchase events tracked in GA4 + PostHog |
| 22 Security | CSP must allow analytics domains |
| 28 SEO | GA4 provides search query data |
| 34 Launch | Verify all analytics on launch day |
| 36 Onboarding | Track activation funnel |

---

## What This Skill Owns

- GA4 property creation and configuration
- GTM container setup, tags, triggers, and variables
- PostHog SDK integration and initialization
- Feature flag creation, management, and cleanup
- A/B test setup, monitoring, and conclusion
- Event taxonomy definition and enforcement
- Funnel definitions and conversion tracking
- Session recording configuration and PII masking
- Scroll depth and engagement tracking
- DataLayer architecture and event schema
- Cookie-free analytics (self-hosted PostHog)
- Analytics verification procedures

## What This Skill Must Never Own

- Error tracking configuration (-> 13 Observability, Sentry-specific)
- Payment integration (-> 18 Stripe)
- Email marketing (-> 13 Observability, Listmonk section)
- Growth strategy (-> 13 Observability, growth surfaces)
- Deployment of analytics scripts (-> 08 Deploy)
- SEO keyword decisions (-> 28 SEO)
