---
name: "Square Payments"
description: "Default payment processor for nonprofits, donations, one-time charges, in-person POS, and small-business e-commerce. Square Web Payments SDK (card + Apple Pay + Cash App Pay), Payments API for server-side charges, idempotency-keyed REST. Cheaper effective rates than Stripe for sub-$100 donations and nonprofit-discount accounts. Use Stripe instead when SaaS subscriptions / metered usage / Entitlements / Connect marketplaces are involved."
updated: "2026-05-10"
---

# Square Payments

## When Square is the Default (***FIRST DECISION — EVERY PAYMENT FEATURE***)
**Square defaults:** nonprofits + donations (one-time OR recurring via Square Subscriptions) | small-business e-commerce | restaurant / retail / salon / medical with in-person POS need | event ticketing | sub-$100 average ticket where Stripe's $0.30 fixed is punishing | any client already on Square POS (single source of truth for in-person + online) | NJ/NY local-business rebuilds where Square Retail penetration is high.
**Stripe overrides:** SaaS subscriptions with seat-based / tiered / usage-based billing | metered billing (Stripe Billing Meters API) | Entitlements feature gating | Stripe Connect (marketplaces, split payments) | Stripe Tax (40+ country auto-collection) | Stripe Atlas formation flows | embedded checkout for agentic commerce (ACP launch partners) | enterprise contracts requiring net-30 invoicing. If ANY of these apply → Stripe; else → Square.
Hybrid is allowed: Square for donations + Stripe for SaaS subscription on the same site. Each integration owns its own webhook + DB tables — never cross-pollinate idempotency keys.

## Default Pricing Models
### Nonprofit / Donation (Square default)
| Preset | Display |
|--------|---------|
| $10 | "Feeds a family for a day" |
| $25 | "Covers supplies for a week" |
| $50 | "Powers the hotline for a month" |
| $100 | "Sponsors a full program" |
| $250 | "Transforms a life" |
| $500 | "Makes a lasting impact" |
| Custom | "Choose your amount" |

- One-time as default frequency for small orgs (Square Subscriptions adds setup complexity)
- Monthly recurring opt-in via Square Subscriptions API + Plans (only when client has staff to manage)
- Impact labels mandatory — specific + concrete, never vague
- Progress bar showing goal achievement (optional, requires Durable Object aggregation)

### Square Nonprofit Discount
501(c)(3) organizations qualify for reduced processing: 2.2% + $0.30 vs standard 2.6% + $0.10. Apply at squareup.com/help/us/en/article/6358 with EIN + IRS determination letter. For $25 average donation: standard fee = $0.95, nonprofit fee = $0.85 — ~10% per-transaction savings vs Stripe (2.9% + $0.30 = $1.03).

## Web Payments SDK (Browser — Tokenize Card Client-Side)
```html
<!-- production -->
<script src="https://web.squarecdn.com/v1/square.js"></script>
<!-- sandbox -->
<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
```
```typescript
const payments = window.Square.payments(applicationId, locationId);
const card = await payments.card();
await card.attach('#square-card-container');
// On submit:
const { token, status } = await card.tokenize();
if (status !== 'OK') throw new Error('Tokenization failed');
// POST token + amount to your worker — NEVER charge from the browser
await fetch('/api/donate', { method: 'POST', body: JSON.stringify({ sourceId: token, amountCents: 5000 }) });
```
Optional payment methods: `payments.applePay(paymentRequest)` | `payments.cashAppPay(paymentRequest, { redirectURL })` | `payments.googlePay(paymentRequest)` | `payments.ach({ accountHolderName, plaidLinkToken })`.

## Server-Side Charge (Cloudflare Worker — vanilla fetch)
```typescript
const SQUARE_API_VERSION = '2024-12-18';
function squareApiBase(env: Env) {
  return env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

async function chargeOnce(env: Env, sourceId: string, amountCents: number, email: string, note: string) {
  const res = await fetch(`${squareApiBase(env)}/v2/payments`, {
    method: 'POST',
    headers: {
      'Square-Version': SQUARE_API_VERSION,
      'Authorization': `Bearer ${env.SQUARE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_id: sourceId,
      idempotency_key: crypto.randomUUID(),
      amount_money: { amount: amountCents, currency: 'USD' },
      location_id: env.SQUARE_LOCATION_ID,
      autocomplete: true,
      buyer_email_address: email,
      note,
      reference_id: `donation-${Date.now()}`,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.errors?.[0]?.detail ?? 'Square charge failed');
  return { paymentId: body.payment.id, receiptUrl: body.payment.receipt_url };
}
```
**Idempotency** is mandatory: every charge request MUST include a unique `idempotency_key` (UUID). Retrying with the same key returns the original payment, never double-charges.

## Webhook Handler (Cloudflare Worker)
```typescript
// Verify signature via X-Square-HmacSha256-Signature header
async function verifySquareSignature(req: Request, env: Env): Promise<boolean> {
  const sig = req.headers.get('x-square-hmacsha256-signature');
  if (!sig) return false;
  const body = await req.text();
  const url = new URL(req.url).toString();
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SQUARE_WEBHOOK_SIGNATURE_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const computed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(url + body));
  const computedB64 = btoa(String.fromCharCode(...new Uint8Array(computed)));
  return computedB64 === sig;
}

app.post('/api/webhooks/square', async (req, env) => {
  if (!(await verifySquareSignature(req, env))) return new Response('Forbidden', { status: 403 });
  const event = await req.json();
  switch (event.type) {
    case 'payment.created':       /* record + send receipt via Resend */ break;
    case 'payment.updated':       /* status changed APPROVED → COMPLETED */ break;
    case 'refund.created':        /* notify donor + update DB */ break;
    case 'subscription.created':  /* recurring donor activated */ break;
    case 'subscription.canceled': /* retention email */ break;
  }
  return new Response('OK');
});
```

## Subscriptions (Recurring Donations)
Square Subscriptions requires a Plan + Plan Variation FIRST. Two-step setup:
```typescript
// 1. Create catalog plan (once, via wrangler or admin tool)
await fetch(`${apiBase}/v2/catalog/object`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    idempotency_key: crypto.randomUUID(),
    object: {
      type: 'SUBSCRIPTION_PLAN',
      id: '#monthly-25',
      subscription_plan_data: { name: 'Monthly $25 Donor' },
    },
  }),
});
// 2. Create subscription (per donor)
await fetch(`${apiBase}/v2/subscriptions`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    idempotency_key: crypto.randomUUID(),
    location_id: env.SQUARE_LOCATION_ID,
    plan_variation_id: 'plan_variation_id_from_step_1',
    customer_id,        // create via /v2/customers first
    card_id,            // saved card token from cards.create
  }),
});
```
For most small nonprofits without staff to manage Plans, default to one-time charges + "donate again" CTA in receipt email. Don't add subscription complexity until the client explicitly asks.

## Environment Toggle
```
SQUARE_ACCESS_TOKEN       # secret — sandbox or production
SQUARE_LOCATION_ID        # secret — receiving location
SQUARE_APPLICATION_ID     # secret — Web Payments SDK app ID (public-ish, kept as secret for env parity)
SQUARE_ENVIRONMENT        # "sandbox" (default) or "production"
SQUARE_WEBHOOK_SIGNATURE_KEY # secret — for webhook HMAC verification
```
Sandbox + production accounts are separate dashboards. Get sandbox creds at developer.squareup.com → Sandbox; production creds at developer.squareup.com → Production (requires verified business). Test card in sandbox: `4111 1111 1111 1111` / any future date / any CVV / any ZIP.

## CSP Allowances (every site using Square Web Payments SDK)
```
script-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com 'unsafe-inline'
style-src 'self' https://web.squarecdn.com https://sandbox.web.squarecdn.com 'unsafe-inline'
frame-src https://*.squarecdn.com https://*.squareup.com
connect-src 'self' https://*.squarecdn.com https://*.squareup.com https://*.squareupsandbox.com https://pci-connect.squareup.com https://pci-connect.squareupsandbox.com
img-src 'self' https://*.squarecdn.com https://*.squareup.com data:
```

## Donation Page Design (givedirectly.org energy)
### Layout
- Hero with cause story + impact stat counter (rAF roll-in, IntersectionObserver-gated)
- Amount selector grid (6 presets + custom input)
- Frequency toggle (one-time | monthly) — default one-time unless client has subscription infrastructure
- Donor form (name, email, optional address for tax receipt)
- Tribute-gift section (optional collapsed accordion: "in honor of" / "in memory of")
- Square card container `<div id="square-card-container">`
- Apple Pay / Cash App Pay buttons above card form (when enabled)
- Trust badge: "Square Secured · PCI-DSS Level 1 · 256-bit TLS"
- Turnstile invisible widget

### Post-Donation Flow
1. Success page with confetti (06/easter-eggs) + animated impact statement
2. Receipt email via Resend: thank you + tax-deductible language + Square receipt URL + "donate again" CTA
3. PostHog event: `donation_complete` with `{ amountCents, frequency, paymentMethod }`
4. Sentry breadcrumb: `donation.completed` with `paymentId` tag
5. GA4 event: `purchase` with full e-commerce schema

## Auto-Detect Square Account
When provisioning a new site, check if client has existing Square: `GET /v2/locations` returns all locations on account. If single location → auto-use as `SQUARE_LOCATION_ID`. If multi-location → ask which is the receiving location. If no Square account → prompt user to sign up at squareup.com/signup with /agentskills referral link (no affiliate, just direct).

## Square API Coverage
| API | Path | Use |
|-----|------|-----|
| Payments | `/v2/payments` | One-time charges |
| Customers | `/v2/customers` | Donor records, repeat-donor lookup |
| Cards (on file) | `/v2/cards` | Save card for recurring without storing CC |
| Subscriptions | `/v2/subscriptions` | Recurring donations (requires Plans) |
| Catalog | `/v2/catalog/object` | Plan + Plan Variation setup |
| Refunds | `/v2/refunds` | Donor-requested refund within 60 days |
| Disputes | `/v2/disputes` | Chargeback handling |
| Locations | `/v2/locations` | Multi-location accounts |
| Orders | `/v2/orders` | E-commerce line items (when not donation) |
| Inventory | `/v2/inventory` | Retail-tier sites only |
| Loyalty | `/v2/loyalty` | Repeat-donor rewards (rare for nonprofits) |
| Gift Cards | `/v2/gift-cards` | Holiday gift-of-meals campaigns |

## Square vs Stripe Decision Cheat Sheet
| Need | Pick |
|------|------|
| Nonprofit donation page | **Square** (nonprofit-rate discount, simpler UX) |
| Small biz one-time checkout | **Square** (cheaper for sub-$100 tickets) |
| Restaurant / salon / retail with POS | **Square** (single source of truth for in-person + online) |
| SaaS subscriptions with seats/tiers | **Stripe** (Billing API, Entitlements, prorations) |
| Metered/usage-based AI billing | **Stripe** (Billing Meters API, Metronome) |
| Marketplace with split payments | **Stripe Connect** |
| Embedded checkout for AI agents | **Stripe** (ACP launch partner with OpenAI/Perplexity) |
| Multi-country tax automation | **Stripe Tax** |
| Net-30 enterprise invoicing | **Stripe** (Invoicing API) |
| Donor wants to use Cash App | **Square** (native Cash App Pay) |
| Recurring donations, no subscription complexity | **Square** one-time + "donate again" email |
| Recurring donations, full retention machine | Either — Stripe Customer Portal is more polished, Square Subscriptions is cheaper |

## Conversion Optimization (Research-Backed)
### Donation Page Best Practices (Source: NextAfter, M+R Benchmarks 2025)
- Donation page conversion rate median: 17% (NextAfter 2024). Top 10%: 30%+.
- Suggested amount with social proof: "$25 — most common gift this month" lifts AOV 12%
- One-time as default for new donors converts higher than monthly default (lowers commitment friction)
- Cash App Pay adds 8-15% to total donations on Gen Z / Millennial audiences (Cash App user base)
- Apple Pay reduces mobile abandonment 30-40% (Source: Apple Pay merchant data)

### Checkout Optimization (Source: Baymard Institute)
- Inline card form (Square Web Payments SDK) converts higher than redirect (Square Checkout)
- Show security badges + "Powered by Square" near payment form
- Progress indicator for multi-step donation forms (amount → details → payment)
- Guest checkout default (never force account creation for donations)
- Show total prominently before final submit

## Receipt Email Template (Resend)
```
Subject: Thank you, {{firstName}} — your donation to {{orgName}} confirmed

Hi {{firstName}},

We received your gift of {{amountFormatted}} on {{date}}.

{{#if tribute}}
This gift was made in {{tributeType}} of {{tributeName}}.
{{/if}}

Your contribution is tax-deductible. {{orgName}} is a 501(c)(3) nonprofit organization, EIN {{ein}}.

Official Square receipt: {{squareReceiptUrl}}
Print-friendly version: {{printableReceiptUrl}}

{{#if recurring}}
Manage your recurring donation: {{donorPortalUrl}}
{{else}}
Make another gift: {{donatePageUrl}}
{{/if}}

With gratitude,
{{orgName}} Team
{{orgAddress}}
```

## Ownership
**Owns:** Square Web Payments SDK integration, Payments API (server-side charge), Subscriptions for recurring donations, webhook signature verification, idempotency-key patterns, nonprofit-rate enrollment, Square POS sync for hybrid online+in-person clients, Cash App Pay + Apple Pay enablement.
**Never owns:** SaaS subscriptions / metered billing / Entitlements (→13/stripe-billing), email send (→09/email-templates), donor analytics (→13/analytics-configuration), goal-progress aggregation (→05/heartbeat-polling + Durable Objects).
