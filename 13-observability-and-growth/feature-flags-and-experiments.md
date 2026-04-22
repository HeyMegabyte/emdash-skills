---
name: "Feature Flags and Experiments"
description: "PostHog feature flags and A/B testing. Server-side flag evaluation in Hono middleware, Angular directive for client-side flags, experiment setup with control/variants and statistical significance, gradual rollout patterns, and kill switches."---

# Feature Flags and Experiments
## PostHog Server-Side Flags (Hono Middleware)
```typescript
// src/middleware/feature-flags.ts
import { PostHog } from 'posthog-node';
import type { Context, Next } from 'hono';

function createPostHog(env: Env): PostHog {
  return new PostHog(env.POSTHOG_API_KEY, { host: 'https://posthog.megabyte.space', flushAt: 1, flushInterval: 0 });
}

// Middleware: evaluate flags for authenticated user
async function featureFlagMiddleware(c: Context<{ Bindings: Env }>, next: Next): Promise<void> {
  const userId = c.get('userId');
  if (!userId) { await next(); return; }

  const posthog = createPostHog(c.env);
  const flags = await posthog.getAllFlags(userId, {
    personProperties: { email: c.get('userEmail'), plan: c.get('userPlan') },
  });

  c.set('featureFlags', flags);
  await posthog.shutdown();
  await next();
}

// Route-level flag check
async function requireFlag(flagName: string, c: Context): Promise<boolean> {
  const flags = c.get('featureFlags') as Record<string, boolean | string>;
  return !!flags[flagName];
}

// Usage in route
app.get('/api/new-feature', featureFlagMiddleware, async (c) => {
  if (!await requireFlag('new-dashboard', c)) {
    return c.json({ error: 'Feature not available' }, 404);
  }
  // Feature implementation
  return c.json({ data: 'new feature response' });
});
```

## Angular Feature Flag Directive
```typescript
// feature-flag.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, DestroyRef, inject } from '@angular/core';
import { FeatureFlagService } from './feature-flag.service';

@Directive({ selector: '[appFeatureFlag]', standalone: true })
export class FeatureFlagDirective implements OnInit {
  @Input('appFeatureFlag') flagName = '';
  @Input('appFeatureFlagElse') elseTemplate?: TemplateRef<unknown>;

  private destroyRef = inject(DestroyRef);

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private flagService: FeatureFlagService,
  ) {}

  ngOnInit(): void {
    this.flagService.isEnabled(this.flagName).subscribe((enabled) => {
      this.viewContainer.clear();
      if (enabled) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else if (this.elseTemplate) {
        this.viewContainer.createEmbeddedView(this.elseTemplate);
      }
    });
  }
}

// feature-flag.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import posthog from 'posthog-js';

@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private cache = new Map<string, Observable<boolean>>();

  isEnabled(flag: string): Observable<boolean> {
    if (!this.cache.has(flag)) {
      this.cache.set(flag, of(posthog.isFeatureEnabled(flag) ?? false).pipe(shareReplay(1)));
    }
    return this.cache.get(flag)!;
  }

  getVariant(flag: string): string | boolean | undefined {
    return posthog.getFeatureFlag(flag);
  }

  /** Force reload all flags (after login/plan change) */
  reload(): void {
    posthog.reloadFeatureFlags();
    this.cache.clear();
  }
}

// Template usage:
// <div *appFeatureFlag="'new-dashboard'; else oldDashboard">New UI</div>
// <ng-template #oldDashboard>Old UI</ng-template>
```

## A/B Experiment Setup
```typescript
// PostHog Dashboard: Experiments → New Experiment
// 1. Name: "pricing-page-redesign"
// 2. Feature flag key: "pricing-page-variant"
// 3. Variants: control (50%), test-a (25%), test-b (25%)
// 4. Goal metric: "upgrade_click" event
// 5. Secondary: "time_on_page" property
// 6. Minimum sample: 1000 per variant
// 7. Significance threshold: 95%

// Client implementation
const variant = posthog.getFeatureFlag('pricing-page-variant');
// variant: 'control' | 'test-a' | 'test-b'

switch (variant) {
  case 'test-a':
    showRedesignedPricing();
    break;
  case 'test-b':
    showMinimalPricing();
    break;
  default:
    showOriginalPricing();
}

// Track conversion (automatically attributed to variant)
posthog.capture('upgrade_click', { plan: 'pro', source: 'pricing-page' });
```

## Gradual Rollout Pattern
```typescript
// PostHog Dashboard: Feature Flags → New Flag
// Release conditions:
// 1. Start: 5% of users → monitor errors/feedback
// 2. Day 2: 25% → check metrics
// 3. Day 5: 50% → validate at scale
// 4. Day 7: 100% → full release
//
// Targeting:
// - By property: plan = 'pro' (beta users first)
// - By cohort: "internal-team" → 100%, everyone else → rollout %
// - By email: *@megabyte.space → always on (internal testing)

// Rollout automation via API
async function updateRollout(flagKey: string, percentage: number, env: Env): Promise<void> {
  await fetch(`https://posthog.megabyte.space/api/projects/${env.POSTHOG_PROJECT_ID}/feature_flags`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      key: flagKey,
      filters: { groups: [{ rollout_percentage: percentage }] },
    }),
  });
}
```

## Kill Switch Pattern
```typescript
// Critical flags that disable features instantly
// Name convention: kill-{feature} (inverted logic)
// kill-payments → true = payments DISABLED
// kill-signups → true = signups DISABLED

async function checkKillSwitch(feature: string, c: Context): Promise<boolean> {
  const flags = c.get('featureFlags') as Record<string, boolean>;
  return flags[`kill-${feature}`] === true;
}

// In route
app.post('/api/checkout', async (c) => {
  if (await checkKillSwitch('payments', c)) {
    return c.json({ error: 'Payments temporarily unavailable', code: 'MAINTENANCE' }, 503);
  }
  // Normal checkout flow
});

// PostHog: toggle kill-payments to true → instant disable
// No deploy needed. Rolls back in <1 second.
```

## Experiment Analysis Checklist
```
1. Minimum 100 conversions per variant (not just impressions)
2. Run for full week minimum (captures day-of-week effects)
3. Check for novelty effect (flat after initial spike = novelty)
4. Statistical significance ≥ 95% before calling winner
5. Check segments: does variant win across all plans/devices?
6. Document: hypothesis, variants, metric, result, decision
7. Archive losing variant code. Ship winner. Clean up flag.
```
