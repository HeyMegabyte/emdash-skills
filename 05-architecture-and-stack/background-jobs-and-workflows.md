---
name: "Background Jobs and Workflows"
description: "Inngest v4 for durable background jobs on CF Workers. CF Workflows v2 (rearchitected control plane, higher concurrency). Event-driven architecture, scheduled tasks, retry logic, fan-out patterns, and step functions. Covers Stripe webhook processing, email sequences, data sync, D1→R2 backups, long-running workflows, step.ai.infer(), and built-in realtime. Also: CF Cron Triggers (250 paid), CF Queues for high-throughput."
updated: "2026-04-24"
---

# Background Jobs and Workflows

## Decision Tree
Simple schedule (health check, cache warm) → CF Cron Triggers (5 free, 250 paid). High-throughput fire-and-forget (analytics, logs) → CF Queues. Durable multi-step (onboarding, billing sync, email drip) → Inngest. Stateful long-running (AI agent, workflow builder) → CF Workflows v2 or DO. D1→R2 daily backup → CF Workflows + Cron Trigger. Agent orchestration → CF Agents SDK (Project Think, Fibers for crash-survivable execution).

## CF Workflows v2 (Apr 15, 2026 — Rearchitected)
Concurrency: 50K concurrent (up from 10K), 300/sec creation rate (up from 30/sec), 2M queued. Steps can return `ReadableStream` for >1MiB payloads (no more serialization limit). Control plane fully rearchitected — lower latency, better observability. Use for: multi-step pipelines, long-running AI agent tasks, data processing fan-out. Inngest still preferred for event-driven durable functions with built-in step.ai.infer().

## Inngest v4 on CF Workers (GA Mar 16, 2026 — BREAKING)

### v3→v4 Breaking Changes
- Default mode→cloud (was dev). Requires `INNGEST_SIGNING_KEY` or set `isDev: true`/`INNGEST_DEV=1` for local
- `EventSchemas` removed → use `eventType("name", { schema: z.object({...}) })` per-event
- Standard Schema support: schema field accepts Zod, Valibot, ArkType, or any Standard Schema lib
- Triggers moved into options object (1st arg of `createFunction`)
- Serve options (signingKey, baseUrl) moved to client constructor
- `step.invoke()` no longer accepts string function IDs
- `connect()` API: `rewriteGatewayEndpoint` → `gatewayUrl`
- Middleware completely rewritten — check migration guide
- Parallel step optimization + checkpointing default-on (~50% fewer HTTP requests)

### Setup (v4)
```typescript
// src/inngest/client.ts
import { Inngest, eventType } from 'inngest';
import { z } from 'zod';

// v4: per-event type definitions (replaces EventSchemas)
const userCreated = eventType('user/created', {
  schema: z.object({ userId: z.string(), email: z.string() }),
});
const invoicePaid = eventType('stripe/invoice.paid', {
  schema: z.object({ customerId: z.string(), amount: z.number() }),
});

export const inngest = new Inngest({
  id: 'my-app',
  eventTypes: [userCreated, invoicePaid],
  // v4: serve options moved here
  // signingKey: env.INNGEST_SIGNING_KEY,
});

// src/inngest/serve.ts — Hono route (v4: use inngest/cloudflare adapter)
import { serve } from 'inngest/cloudflare';
import { inngest } from './client';
import { functions } from './functions';

app.on(['GET', 'PUT', 'POST'], '/api/inngest', (c) => {
  inngest.setEnvVars(c.env); // v4: runtime bindings for CF Workers
  return serve({ client: inngest, functions })(c.req.raw);
});
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

**5. AI Inference (step.ai.infer — v4)**
```typescript
export const analyzeContent = inngest.createFunction(
  { id: 'analyze-content' },
  { event: 'content/submitted' },
  async ({ event, step }) => {
    // Offloads inference to Inngest infra — pauses function, no serverless compute charges
    const [sentiment, summary] = await Promise.all([
      step.ai.infer('sentiment', { model: 'openai/gpt-4o-mini', body: {
        messages: [{ role: 'user', content: `Classify sentiment: ${event.data.text}` }],
      }}),
      step.ai.infer('summary', { model: 'anthropic/claude-haiku', body: {
        messages: [{ role: 'user', content: `Summarize in 1 sentence: ${event.data.text}` }],
      }}),
    ]);
    await step.run('save', () => db.update(content).set({ sentiment, summary }));
  }
);
```

**6. Realtime (built-in v4)**
```typescript
export const processOrder = inngest.createFunction(
  { id: 'process-order' },
  { event: 'order/placed' },
  async ({ event, step }) => {
    // Durable publish — survives retries
    await step.realtime.publish(`order:${event.data.orderId}`, { status: 'processing' });
    await step.run('charge', () => stripe.charges.create({ amount: event.data.total }));
    await step.realtime.publish(`order:${event.data.orderId}`, { status: 'charged' });
  }
);
// Client: import { useRealtime } from '@inngest/realtime/react';
// const { messages } = useRealtime(`order:${orderId}`);
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

v4 step.ai.infer(): offloads AI inference to Inngest infrastructure — function pauses while inference runs, zero serverless compute charges during wait. Parallelizable via `Promise.all()`. Supports OpenAI, Anthropic, and custom models.

v4 Realtime: `step.realtime.publish(channel, data)` for durable pub/sub (survives retries). `inngest.realtime.publish()` for non-durable fire-and-forget. Client: `@inngest/realtime` React hook `useRealtime(channel)`. Replaces deprecated `@inngest/realtime` package.

Testing: `inngest/test` SDK for local step-through. `npx inngest-cli dev` for local dev server with event replay. v4: set `isDev: true` or `INNGEST_DEV=1` for local mode.
