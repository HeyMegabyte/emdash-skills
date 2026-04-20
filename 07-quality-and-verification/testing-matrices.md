---
name: "Testing Matrices"
description: "Auto-generated test templates for payment flows, email deliverability, graceful degradation, form validation, breakpoint coverage, and content integrity checks."
---

# Testing Matrices

> **Purpose**: Standardized test templates that are auto-generated for every form, payment flow, email feature, and visual test. Copy and customize rather than writing from scratch.

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

## Content Integrity Checks

- No text containing: "Lorem", "ipsum", "TBD", "TODO", "placeholder", "coming soon"
- No images with naturalWidth === 0 (broken)
- No empty sections (sections with no visible text content)
- No orphaned grid items (last row should be centered if incomplete)
