---
name: "Testing Matrices"
description: "Auto-generated test templates for payment flows, Stripe webhooks, email, graceful degradation, form validation, breakpoint coverage, and content integrity."
updated: "2026-04-23"
---
# Testing Matrices
## Payment Flow Testing Matrix (auto-generate for every Stripe integration)
For EVERY payment/donation flow, generate these tests:

1. **Successful payment** — complete checkout with Stripe test card `4242424242424242`, verify success page + thank-you email sent
2. **Declined card** — use `4000000000000002`, verify user sees clear error message (not a crash)
3. **Webhook idempotency** — send the same webhook event twice, verify only one record created
4. **Webhook signature** — send a webhook with invalid signature, verify 401 rejection
5. **Partial amount** — verify amount displayed matches amount charged (no rounding errors)
6. **Refund flow** — if refunds exist, verify refund processes and user is notified
7. **Third-party script failure** — block `js.stripe.com` in test, verify page still loads with helpful fallback message

## Email Deliverability Smoke Test
After any feature that sends transactional email:
1. **Send test email** — trigger the flow with test data, verify Resend API returns 200
2. **Check email content** — verify subject line, body, and any dynamic fields render correctly (no `{undefined}` or `{null}`)
3. **Verify unsubscribe link** — if present, confirm it works and is CAN-SPAM compliant

## Graceful Degradation Tests
For every third-party dependency (Stripe, Turnstile, analytics, maps):
1. **Script blocked** — block the CDN URL, verify page loads without JS errors and shows fallback
2. **Slow load** — throttle to 3G, verify the page is usable before third-party scripts finish
3. **API timeout** — mock a 10s timeout on the API call, verify the UI shows a timeout message (not infinite spinner)

## Form Testing Matrix (auto-generate for every form)
For EVERY `<form>` element found on the page, generate these 8 tests:

1. **Empty submission** — submit with all fields empty, verify error messages
2. **Invalid email** — submit with "notanemail", verify email validation
3. **XSS injection** — submit `<script>alert(1)</script>` in text fields, verify sanitization
4. **Max-length boundary** — submit 5001-char message, verify truncation/rejection
5. **Success path** — submit valid data, verify success message + form reset
6. **Error display** — verify errors appear inline near the field, not just alert()
7. **Loading state** — verify button shows "Sending..." and is disabled during submission
8. **Double-submit** — click submit twice rapidly, verify only one submission processes

## Breakpoint Test Matrix
Every visual test runs at ALL 6 widths:
```typescript
const BREAKPOINTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
```

## Stripe Webhook Event Testing Matrix
For every Stripe integration, verify these webhook events are handled correctly (no mocks — use Stripe CLI `stripe trigger`):

| Event | Expected behavior | Test |
|-------|-------------------|------|
| `checkout.session.completed` | Create subscription record, send welcome email | `stripe trigger checkout.session.completed` |
| `invoice.payment_succeeded` | Renew access, update `renewedAt` | `stripe trigger invoice.payment_succeeded` |
| `invoice.payment_failed` | Send dunning email, flag account | `stripe trigger invoice.payment_failed` |
| `customer.subscription.deleted` | Revoke access, send cancellation email | `stripe trigger customer.subscription.deleted` |
| `customer.subscription.updated` | Update plan tier, adjust features | `stripe trigger customer.subscription.updated` |
| `charge.refunded` | Revoke access if full refund, partial note | `stripe trigger charge.refunded` |
| `payment_intent.payment_failed` | Show card decline UI, clear pending state | `stripe trigger payment_intent.payment_failed` |

```typescript
// tests/stripe-webhooks.spec.ts — idempotency test (send same event twice)
test('webhook idempotency — duplicate event creates no duplicate record', async () => {
  const event = await stripe.events.retrieve('evt_test_xxxx'); // real test event
  await fetch(`${PROD_URL}/api/webhooks/stripe`, { method:'POST', headers:{'stripe-signature': sig}, body: JSON.stringify(event) });
  const count1 = await db.select({ count: sql`count(*)` }).from(subscriptions).where(eq(subscriptions.stripeEventId, event.id));
  await fetch(`${PROD_URL}/api/webhooks/stripe`, { method:'POST', headers:{'stripe-signature': sig}, body: JSON.stringify(event) }); // duplicate
  const count2 = await db.select({ count: sql`count(*)` }).from(subscriptions).where(eq(subscriptions.stripeEventId, event.id));
  expect(count1[0].count).toBe(count2[0].count); // idempotent
});
```

## Content Integrity Checks
- No text containing: "Lorem", "ipsum", "TBD", "TODO", "placeholder", "coming soon"
- No images with naturalWidth === 0 (broken)
- No empty sections (sections with no visible text content)
- No orphaned grid items (last row should be centered if incomplete)
