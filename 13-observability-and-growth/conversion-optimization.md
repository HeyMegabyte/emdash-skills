---
name: "Conversion Optimization"
description: "CRO patterns for SaaS signup flows, pricing pages, paywalls, and churn prevention"
version: "2.0.0"
updated: "2026-04-23"
---

# Conversion Optimization

## Core Loop
Measure→hypothesis→test→analyze→iterate. Never skip baseline measurement. A/B test ONE variable at a time via PostHog feature flags. Statistical significance: min 1000 visitors/variant, 95% confidence, 2-week minimum duration.

## Key Metrics
| Metric | Formula | Target |
|--------|---------|--------|
| Conversion Rate | signups / visitors | >3% SaaS, >5% free tier |
| Trial-to-Paid | paid / trial starts | >25% |
| Monthly Churn | churned / start MRR | <5% |
| LTV | ARPU / churn rate | >3x CAC |
| CAC | total spend / new customers | <LTV/3 |
| Activation | users hitting aha moment / signups | >40% |

## Pricing Page Patterns
3-tier layout (Free|Pro $50/mo|Enterprise custom). Highlight recommended tier with brand cyan `#00E5FF` border. Annual toggle prominent (20% discount = $480/yr vs $600). Show savings amount, not just percentage. Feature comparison table with checkmarks. Social proof: "Join 2,000+ teams" with real numbers. FAQ section below tiers addressing objections. Mobile: stack vertically, recommended first.

## Signup Flow
Reduce fields to email+password (name optional, collect later). Social auth (Google, GitHub) above form. Progress indicator for multi-step. Inline validation on blur. Smart defaults for settings. Skip onboarding option. Time-to-value: user sees core feature within 60 seconds of signup.

## Paywall Patterns
Soft paywall: show feature, blur/lock result, explain what Pro unlocks. Usage-based triggers: "You've used 8 of 10 free reports. Upgrade for unlimited." Trial: 14-day default, no credit card required upfront, email sequence (day 1 welcome, day 7 value, day 12 urgency). Never hard-lock features without showing value first.

## Churn Prevention
Cancellation flow: survey (too expensive|missing feature|switching|other) → offer alternatives (pause, downgrade, discount) → confirm. Win-back: automated email at 7/30/90 days via Resend. Usage decline: PostHog event tracking, alert when weekly active drops 50%. Dunning: 3 retries over 7 days, Stripe Smart Retries enabled.

## Form Optimization
Inline validation (not on submit). Autofill attributes on all fields. Smart defaults reduce decisions. Error messages: specific+actionable ("Email already registered. Sign in?" not "Error 409"). Success: brief+next ("Account created. Let's set up your first project →"). Loading: contextual ("Creating your workspace..." not "Loading...").

## Anti-Patterns
Never: dark patterns (hidden costs, forced continuity, misdirection) | fake urgency | guilt-tripping cancel copy | hiding unsubscribe | pre-checked upsells | bait-and-switch pricing. ADA/WCAG: all conversion elements keyboard accessible, screen reader compatible, sufficient contrast.

## Tools
PostHog: funnel analysis + feature flags + session replay. Stripe: billing portal, proration, Smart Retries, revenue recovery. Resend: transactional + win-back emails. Inngest: automated lifecycle workflows (trial→paid→churn sequences).
