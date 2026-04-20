---
name: "Webhook System"
description: "Consolidated webhook handling for Stripe, Clerk, GitHub, and custom events. Signature verification, event routing, idempotency via D1 dedup table, retry-safe handlers, and outbound webhook dispatch. Every integration uses webhooks — this skill standardizes the pattern."---

# Webhook System

> One pattern for all inbound webhooks. Verify, deduplicate, route, handle.

---

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
  // Send confirmation email (skill 19)
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
  // Send welcome email (skill 19)
  // Start onboarding tracking (skill 36)
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

## Wrangler.toml
```toml
# Register webhook routes
# No special config needed — just deploy the Worker with the routes
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
