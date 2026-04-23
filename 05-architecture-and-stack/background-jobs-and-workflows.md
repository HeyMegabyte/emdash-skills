---
name: "Background Jobs and Workflows"
description: "Inngest for durable background jobs on CF Workers. CF Workflows v2 (rearchitected control plane, higher concurrency). Event-driven architecture, scheduled tasks, retry logic, fan-out patterns, and step functions. Covers Stripe webhook processing, email sequences, data sync, D1→R2 backups, and long-running workflows. Also: CF Cron Triggers (250 paid), CF Queues for high-throughput."
---

# Background Jobs and Workflows

## Decision Tree
Simple schedule (health check, cache warm) → CF Cron Triggers (5 free, 250 paid). High-throughput fire-and-forget (analytics, logs) → CF Queues. Durable multi-step (onboarding, billing sync, email drip) → Inngest. Stateful long-running (AI agent, workflow builder) → CF Workflows v2 (rearchitected control plane, higher concurrency+creation rate) or DO. D1→R2 daily backup → CF Workflows + Cron Trigger. Agent orchestration → CF Agents SDK (Project Think, Fibers for crash-survivable execution).

## Inngest on CF Workers

### Setup
```typescript
// src/inngest/client.ts
import { Inngest } from 'inngest';
export const inngest = new Inngest({ id: 'my-app' });

// src/inngest/serve.ts — Hono route
import { serve } from 'inngest/hono';
import { inngest } from './client';
import { functions } from './functions';

app.on(['GET', 'PUT', 'POST'], '/api/inngest', serve({ client: inngest, functions }));
```

### Event Schema (Zod-validated)
```typescript
type Events = {
  'user/created': { data: { userId: string; email: string } };
  'stripe/invoice.paid': { data: { customerId: string; amount: number } };
  'email/drip.send': { data: { userId: string; templateId: string; step: number } };
  'data/sync.requested': { data: { source: string; cursor?: string } };
};
```

### Core Patterns

**1. Webhook → Multi-Step Processing**
```typescript
export const handleStripeInvoice = inngest.createFunction(
  { id: 'stripe-invoice-paid', retries: 3 },
  { event: 'stripe/invoice.paid' },
  async ({ event, step }) => {
    const invoice = await step.run('fetch-invoice', () =>
      stripe.invoices.retrieve(event.data.invoiceId)
    );
    await step.run('update-db', () =>
      db.update(subscriptions).set({ status: 'active', paidAt: new Date().toISOString() })
        .where(eq(subscriptions.stripeCustomerId, invoice.customer))
    );
    await step.run('send-receipt', () =>
      resend.emails.send({ to: invoice.customer_email, template: 'receipt', data: invoice })
    );
    await step.run('track-analytics', () =>
      posthog.capture({ distinctId: event.data.userId, event: 'invoice_paid', properties: { amount: invoice.amount_paid } })
    );
  }
);
```

**2. Email Drip Sequence**
```typescript
export const onboardingDrip = inngest.createFunction(
  { id: 'onboarding-drip' },
  { event: 'user/created' },
  async ({ event, step }) => {
    await step.run('welcome-email', () => sendTemplate('welcome', event.data.email));
    await step.sleep('wait-1d', '1 day');
    await step.run('tips-email', () => sendTemplate('tips', event.data.email));
    await step.sleep('wait-3d', '3 days');
    const user = await step.run('check-activation', () => getUser(event.data.userId));
    if (!user.hasCompletedOnboarding) {
      await step.run('nudge-email', () => sendTemplate('nudge', event.data.email));
    }
  }
);
```

**3. Fan-Out (Parallel Steps)**
```typescript
export const bulkSync = inngest.createFunction(
  { id: 'bulk-sync', concurrency: { limit: 5 } },
  { event: 'data/sync.requested' },
  async ({ event, step }) => {
    const items = await step.run('fetch-items', () => fetchBatch(event.data.cursor));
    // Fan-out: send individual events for each item
    await step.sendEvent('fan-out', items.map(item => ({
      name: 'data/sync.item', data: { itemId: item.id }
    })));
  }
);
```

**4. Scheduled (Cron via Inngest)**
```typescript
export const dailyReport = inngest.createFunction(
  { id: 'daily-report' },
  { cron: '0 9 * * *' }, // 9am UTC daily
  async ({ step }) => {
    const stats = await step.run('gather-stats', () => getDailyStats());
    await step.run('send-report', () =>
      resend.emails.send({ to: 'hey@megabyte.space', subject: 'Daily Report', html: formatReport(stats) })
    );
  }
);
```

## CF Cron Triggers (Simple Schedules)
```toml
# wrangler.toml
[triggers]
crons = ["*/5 * * * *", "0 0 * * *"]
```
```typescript
// src/index.ts — scheduled handler
export default { fetch: app.fetch, scheduled: async (event, env, ctx) => {
  switch (event.cron) {
    case '*/5 * * * *': await healthCheck(env); break;
    case '0 0 * * *': await dailyCleanup(env); break;
  }
}};
```

## CF Queues (High-Throughput)
```toml
[[queues.producers]]
queue = "analytics-events"
binding = "ANALYTICS_QUEUE"

[[queues.consumers]]
queue = "analytics-events"
max_batch_size = 100
max_batch_timeout = 30
```
```typescript
// Producer: await c.env.ANALYTICS_QUEUE.send({ event: 'page_view', url: path });
// Consumer: export default { queue: async (batch, env) => { for (const msg of batch.messages) { ... } } };
```

## Patterns
Idempotency: every Inngest step is retried independently → each step must be idempotent. Use D1 dedup table (event_id UNIQUE) for external effects. Inngest auto-deduplicates by event ID within 24h.

Timeout: `step.sleep()` for delays, `step.waitForEvent()` for external triggers (e.g., wait for Stripe webhook before continuing onboarding). Max function duration: 2hrs (Inngest Cloud).

Error handling: `retries: 3` default, exponential backoff. Dead letter: Inngest dashboard. Alert: `onFailure` callback → Sentry + Slack.

Testing: `inngest/test` SDK for local step-through. `npx inngest-cli dev` for local dev server with event replay.
