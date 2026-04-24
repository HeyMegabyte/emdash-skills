---
name: "Webhook System"
version: "2.0.0"
updated: "2026-04-23"
description: "Consolidated webhook handling for Stripe, Clerk, GitHub, and custom events. Signature verification, event routing, idempotency via D1 dedup table (batch API, no BEGIN), retry-safe handlers, Drizzle v1 + RQBv2, and outbound webhook dispatch with HMAC signing, retry with exponential backoff, delivery logging, and customer-facing event catalog."
---

# Webhook System
## Universal Webhook Handler Pattern
```typescript
// src/routes/webhooks.ts
import { Hono } from 'hono';

const webhooks = new Hono();

// Stripe webhooks
webhooks.post('/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')!;
  const body = await c.req.text();

  // 1. Verify signature
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  // 2. Deduplicate (idempotency)
  const already = await c.env.DB.prepare(
    'SELECT 1 FROM webhook_events WHERE event_id = ?'
  ).bind(event.id).first();
  if (already) return c.json({ received: true }); // Already processed

  // 3. Route to handler
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object, c.env);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object, c.env);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object, c.env);
      break;
  }

  // 4. Record as processed
  await c.env.DB.prepare(
    'INSERT INTO webhook_events (event_id, source, type, processed_at) VALUES (?, ?, ?, ?)'
  ).bind(event.id, 'stripe', event.type, new Date().toISOString()).run();

  return c.json({ received: true });
});

// Clerk webhooks
webhooks.post('/clerk', async (c) => {
  const body = await c.req.text();
  // Clerk uses Svix for webhook signing
  // Verify with svix library or manually check headers
  const svixId = c.req.header('svix-id');
  const svixTimestamp = c.req.header('svix-timestamp');
  const svixSignature = c.req.header('svix-signature');

  // Verify signature (use @clerk/backend or svix package)
  const event = JSON.parse(body);

  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data, c.env);
      break;
    case 'user.deleted':
      await handleUserDeleted(event.data, c.env);
      break;
    case 'session.created':
      await handleSessionCreated(event.data, c.env);
      break;
  }

  return c.json({ received: true });
});

export { webhooks };
```

## Idempotency Table (D1)
```sql
CREATE TABLE webhook_events (
  event_id TEXT PRIMARY KEY,
  source TEXT NOT NULL,       -- 'stripe', 'clerk', 'github'
  type TEXT NOT NULL,         -- 'checkout.session.completed'
  processed_at TEXT NOT NULL,
  payload TEXT                -- optional: store full payload for debugging
);

-- Auto-cleanup: delete events older than 30 days
-- Run via cron trigger
DELETE FROM webhook_events WHERE processed_at < datetime('now', '-30 days');
```

## Event Handlers
### Stripe: Checkout Complete
```typescript
async function handleCheckoutComplete(session: Stripe.Checkout.Session, env: Env) {
  const db = drizzle(env.DB);
  // Activate subscription or record donation
  if (session.mode === 'subscription') {
    await db.update(users)
      .set({ plan: 'pro', stripeCustomerId: session.customer as string })
      .where(eq(users.email, session.customer_email!));
  } else if (session.mode === 'payment') {
    await db.insert(donations).values({
      id: ulid(),
      amount: session.amount_total!,
      email: session.customer_email!,
      stripeSessionId: session.id,
    });
  }
  // Send confirmation email (09/email-templates)
  await sendReceiptEmail(session, env);
  // Track in PostHog
  // posthog.capture('purchase_complete', { amount: session.amount_total });
}
```

### Clerk: User Created
```typescript
async function handleUserCreated(user: ClerkUser, env: Env) {
  const db = drizzle(env.DB);
  await db.insert(users).values({
    id: ulid(),
    clerkId: user.id,
    email: user.email_addresses[0].email_address,
    name: `${user.first_name} ${user.last_name}`.trim(),
  });
  // Send welcome email (09/email-templates)
  // Start onboarding tracking (06/onboarding-and-first-run)
}
```

## Registering Webhooks
### Stripe
```bash
# Via Stripe CLI (development)
stripe listen --forward-to https://domain.com/webhooks/stripe

# Via Dashboard (production)
# Stripe Dashboard → Developers → Webhooks → Add endpoint
# URL: https://domain.com/webhooks/stripe
# Events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed
```

### Clerk
```
# Clerk Dashboard → Webhooks → Add endpoint
# URL: https://domain.com/webhooks/clerk
# Events: user.created, user.deleted, session.created
```

## Outbound Webhooks (Customer-Facing)
For API/platform products: let customers register webhook endpoints to receive events from your app.

### Architecture
```
App event → Inngest/Queue → sign + deliver → retry on failure → log delivery
Customer dashboard: manage endpoints, view delivery history, retry failed
```

### Webhook Dispatch Pattern
```typescript
// src/services/webhooks.ts
import { createHmac } from 'node:crypto';

interface WebhookEndpoint {
  id: string;
  orgId: string;
  url: string;
  secret: string;       // per-endpoint HMAC key
  events: string[];      // subscribed event types
  active: boolean;
}

async function dispatchWebhook(
  env: Env, event: { type: string; data: unknown; orgId: string }
): Promise<void> {
  const db = drizzle(env.DB);
  const endpoints = await db.select().from(webhookEndpoints)
    .where(and(eq(webhookEndpoints.orgId, event.orgId), eq(webhookEndpoints.active, true)));

  for (const ep of endpoints) {
    if (!ep.events.includes(event.type) && !ep.events.includes('*')) continue;
    const payload = JSON.stringify({ id: crypto.randomUUID(), type: event.type, data: event.data, timestamp: new Date().toISOString() });
    const signature = createHmac('sha256', ep.secret).update(payload).digest('hex');

    // Queue for reliable delivery (Inngest or CF Queue)
    await env.WEBHOOK_QUEUE.send({
      endpointId: ep.id, url: ep.url, payload, signature,
      attempt: 1, maxAttempts: 5,
    });
  }
}
```

### Delivery Worker (retry with backoff)
```typescript
// Consumer: exponential backoff (1s, 5s, 30s, 2m, 15m)
const BACKOFF = [1, 5, 30, 120, 900];

export default {
  queue: async (batch: MessageBatch, env: Env) => {
    for (const msg of batch.messages) {
      const { url, payload, signature, attempt, maxAttempts, endpointId } = msg.body;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': `sha256=${signature}`,
            'X-Webhook-Id': JSON.parse(payload).id,
            'X-Webhook-Timestamp': JSON.parse(payload).timestamp,
          },
          body: payload,
          signal: AbortSignal.timeout(10000),
        });
        await logDelivery(env, endpointId, JSON.parse(payload).id, res.status, attempt);
        if (res.status >= 200 && res.status < 300) { msg.ack(); continue; }
        if (attempt < maxAttempts) { msg.retry({ delaySeconds: BACKOFF[attempt - 1] }); }
        else { msg.ack(); await markFailed(env, endpointId, JSON.parse(payload).id); }
      } catch {
        if (attempt < maxAttempts) msg.retry({ delaySeconds: BACKOFF[attempt - 1] });
        else msg.ack();
      }
    }
  },
};
```

### D1 Schema
```sql
CREATE TABLE webhook_endpoints (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  events TEXT NOT NULL DEFAULT '["*"]',  -- JSON array
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE webhook_deliveries (
  id TEXT PRIMARY KEY,
  endpoint_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  status INTEGER,
  attempt INTEGER NOT NULL DEFAULT 1,
  delivered_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (endpoint_id) REFERENCES webhook_endpoints(id)
);
CREATE INDEX idx_deliveries_endpoint ON webhook_deliveries(endpoint_id);
```

### Event Catalog (document all outbound events)
```typescript
const EVENT_CATALOG = {
  'user.created': { description: 'New user registered', schema: userSchema },
  'user.deleted': { description: 'User account deleted', schema: userIdSchema },
  'subscription.activated': { description: 'Subscription started or resumed', schema: subscriptionSchema },
  'subscription.canceled': { description: 'Subscription canceled', schema: subscriptionSchema },
  'invoice.paid': { description: 'Invoice payment succeeded', schema: invoiceSchema },
} as const;
// Expose at GET /api/webhooks/events for self-service discovery
```

## Wrangler.toml
```toml
# Register webhook routes + outbound queue
[[queues.producers]]
queue = "outbound-webhooks"
binding = "WEBHOOK_QUEUE"

[[queues.consumers]]
queue = "outbound-webhooks"
max_batch_size = 10
max_retries = 5
```

## Testing Webhooks
```typescript
test('Stripe webhook processes checkout', async ({ request }) => {
  const payload = JSON.stringify({ id: 'evt_test', type: 'checkout.session.completed', data: { object: { /* ... */ } } });
  const sig = stripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET });
  const res = await request.post('/webhooks/stripe', {
    data: payload,
    headers: { 'stripe-signature': sig, 'content-type': 'application/json' },
  });
  expect(res.status()).toBe(200);
});
```
