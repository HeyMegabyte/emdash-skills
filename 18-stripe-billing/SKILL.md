---
name: "Stripe Billing"
description: "Stripe payments with sensible defaults: free tier + $50/mo pro for SaaS, or donation presets ($10/$25/$50/$100/$250/$500) for nonprofits styled like givedirectly.org. Auto-creates Stripe Products, Prices, and checkout endpoints. Brand-matched checkout with Stripe Link for one-click payments. Donation goals with real-time progress bars via Durable Objects."
layer: "capability-pack"
canonical-owner-of:
  - "stripe-product-creation"
  - "checkout-flow"
  - "donation-presets"
  - "subscription-management"
---

# Stripe Billing

> Payments should be frictionless, branded, and conversion-optimized.

---

## Default Pricing Models

### SaaS Products
| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0/mo | Limited features, no payment required |
| **Pro** | $50/mo | All features, priority support, cancel anytime |
| **Enterprise** | Custom | SSO, SLA, dedicated support, volume pricing |

- Annual billing default (20% discount): $480/year vs $600
- Stripe Link enabled for one-click checkout (Source: Stripe reports 7%+ conversion lift)
- Show monthly price on annual plan: "$40/mo billed annually"

### Nonprofit / Donation
| Preset | Display |
|--------|---------|
| $10 | "Feeds a family for a day" |
| $25 | "Covers supplies for a week" |
| $50 | "Powers the hotline for a month" |
| $100 | "Sponsors a full program" |
| $250 | "Transforms a life" |
| $500 | "Makes a lasting impact" |
| Custom | "Choose your amount" |

- Monthly recurring as default, one-time as option
- Impact labels on every amount (specific, concrete, not vague)
- Progress bar showing goal achievement

## Auto-Setup Workflow

### 1. Create Stripe Product + Prices
```typescript
const stripe = new Stripe(env.STRIPE_SECRET_KEY);

// Create product
const product = await stripe.products.create({
  name: 'Project Name Pro',
  description: 'All features, priority support',
  metadata: { project: 'domain.com' },
});

// Create prices
const monthlyPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 5000, // $50.00
  currency: 'usd',
  recurring: { interval: 'month' },
});

const annualPrice = await stripe.prices.create({
  product: product.id,
  unit_amount: 48000, // $480.00 (20% off)
  currency: 'usd',
  recurring: { interval: 'year' },
});
```

### 2. Create Checkout Endpoint
```typescript
app.post('/api/checkout', async (c) => {
  const { priceId, successUrl, cancelUrl } = await c.req.json();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', // or 'payment' for one-time
    payment_method_types: ['card', 'link'], // Stripe Link for one-click
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl || `${c.req.url.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl || `${c.req.url.origin}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    customer_creation: 'always',
  });

  return c.json({ url: session.url });
});
```

### 3. Brand the Checkout
```typescript
// Set Stripe account branding to match site
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

### 4. Webhook Handler
```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')!;
  const body = await c.req.text();
  const event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      // Activate subscription, send welcome email via Resend
      break;
    case 'customer.subscription.deleted':
      // Deactivate subscription, send retention email
      break;
    case 'invoice.payment_failed':
      // Notify user, retry logic
      break;
  }
  return c.json({ received: true });
});
```

## Donation Page Design (givedirectly.org style)

### Layout
Full-screen split:
- **Left (60%):** Cause imagery, impact story, real numbers
- **Right (40%):** Amount selector, checkout form, progress bar

### Donation Goal + Progress Bar
```typescript
// Real-time via Durable Objects + Stripe webhooks
app.get('/api/donation-progress', async (c) => {
  const goal = 10000; // $10,000 goal
  const raised = await getDonationTotal(c.env.DO); // from Durable Object
  return c.json({ goal, raised, percentage: Math.min(100, (raised / goal) * 100) });
});
```

### Post-Donation Flow
1. Success page with confetti animation (skill 15 Easter egg energy)
2. Auto-email via Resend: thank you + tax receipt + ask to share
3. Auto-email all participants when goal is met
4. PostHog event: `donation_complete` with amount and method

## Conversion Optimization (Research-Backed)

### Pricing Page Best Practices (Source: ProfitWell, Stripe)
- 3 tiers maximum (paradox of choice — 3 converts better than 5)
- Highlight the middle tier as "Most Popular" (anchoring effect)
- Show annual savings prominently ("Save $120/year")
- Include a brief FAQ below pricing (addresses objections)
- Feature comparison table for detailed comparison
- Show trust signals near CTA: "Trusted by X users", security badge

### Checkout Optimization (Source: Baymard Institute)
- Stripe Link reduces checkout time by 7x (one-click for returning users)
- Show security badges and "Powered by Stripe" near payment form
- Progress indicator for multi-step checkout
- Guest checkout default (don't force account creation)
- Show total prominently before final submit

## Psychology of Pricing (skill 51 — Wisdom Applied)

### Anchoring (Kahneman)
Show annual price first. $480/year makes $50/month feel reasonable. The first number anchors expectations.

### Loss Aversion (Kahneman & Tversky)
"Don't lose your progress" converts better than "Keep your progress." Frame around what they'd lose by not acting.

### Reciprocity (Cialdini)
Generous free tier creates obligation. Users who get real value for free feel an internal drive to give back — through payment or word-of-mouth.

### Social Proof (Cialdini)
Near every pricing CTA: "Join 1,200 supporters" or "Trusted by X organizations." People follow the crowd, especially for financial decisions.

### Peak-End Rule (Kahneman)
The post-purchase experience matters as much as the purchase. Confetti animation on success, a warm thank-you email, and an impact update later create a memory of joy — not just a transaction.

### The Ethical Line
- REAL scarcity only (actual limited spots, actual deadline)
- No confirmshaming ("No, I don't want to help" is a dark pattern)
- Easy cancellation — as easy as signup
- No hidden fees revealed at checkout

## Key Locations
- Stripe API key: shared key pool (skill 26)
- Webhook secret: wrangler secret per project
- Test mode: always test with `sk_test_` before going live

---

## Enhancement: SaaS Business Strategy (Source: Stripe Atlas Guides + YC 2026)

### Two Core SaaS Models (Know Which You're Building)

**Low-Touch SaaS** (Basecamp, Atlassian model):
- Self-serve signup, no sales team needed
- Optimize for: onboarding speed, activation rate, self-service support
- Key metric: Monthly churn < 5%, ideally < 3%
- Growth: content marketing, SEO, product-led growth (PLG)

**High-Touch SaaS** (Enterprise model):
- Human-intensive sales process: SDRs find prospects, AEs close deals, AMs retain
- Optimize for: demo experience, integration support, customer success
- Key metric: Net Revenue Retention > 120%
- Growth: outbound sales, conferences, partnerships

### Critical SaaS Metrics (Monitor From Day 1)
| Metric | Target | Why |
|--------|--------|-----|
| **MRR** (Monthly Recurring Revenue) | Growing month-over-month | Primary health indicator |
| **Churn Rate** | < 5% monthly for SMB, < 1% for enterprise | Revenue leak |
| **LTV:CAC Ratio** | > 3:1 | Spending efficiency |
| **Time to Value** | < 60 seconds for free tier | Activation driver |
| **Activation Rate** | 20-40% of signups | Product-market fit signal |

### Pricing Strategy (YC + Stripe Consensus)
1. **Generous free tier creates reciprocity** — users who get real value for free convert at higher rates
2. **Annual billing default** with 20% discount — reduces churn, improves cash flow
3. **Price anchoring** — show enterprise/annual first, making pro feel reasonable
4. **Three tiers maximum** — Hick's Law applies to pricing decisions too
5. **AI-native is the baseline** — every SaaS product in 2026 should use AI to deliver more value than static software could

### YC's 2026 Advice for SaaS Founders
- "Code is cheap; insight is rare" — spend more time on user research than coding
- Build for human-AI collaboration, not full automation
- AI-native companies can now launch faster and operate leaner than ever before
- The way you define "what to build" matters more than how you build it
