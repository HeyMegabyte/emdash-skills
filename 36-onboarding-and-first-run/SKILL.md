---
name: "Onboarding and First-Run"
description: "SaaS onboarding flows: welcome modal, guided tour with tooltips, progress checklist, welcome email, activation tracking via PostHog. Reduces time-to-value for new users. Targets 20-40% activation rate. Use when building SaaS products with user accounts."
layer: "capability-pack"
canonical-owner-of:
  - "onboarding-flows"
  - "guided-tour"
  - "activation-tracking"
---

# Onboarding and First-Run

> Get users to their "aha moment" in under 60 seconds.

---

## When to Include
- Any SaaS product with user accounts
- Any product where users need to configure or learn something
- NOT needed for: simple marketing sites, blogs, donation pages

## Onboarding Checklist (In-App)

```html
<div class="onboarding-checklist" data-show-until="complete">
  <h3>Get started</h3>
  <div class="progress-bar"><div class="fill" style="width: 33%"></div></div>
  <ul>
    <li class="done">✅ Create your account</li>
    <li class="current">⬜ Set up your first [thing]</li>
    <li>⬜ Invite a team member</li>
  </ul>
</div>
```

### Checklist Logic
```typescript
// Track onboarding steps in D1 or KV
interface OnboardingState {
  accountCreated: boolean;     // true after signup
  firstThingCreated: boolean;  // true after key action
  teamMemberInvited: boolean;  // true after invite
  onboardingComplete: boolean; // true when all done
}

// PostHog tracking
posthog.capture('onboarding_step_completed', { step: 'first_thing_created' });
posthog.capture('onboarding_complete', { time_to_complete_ms: elapsed });
```

## Welcome Email (skill 19)
Sent immediately after signup via Resend:
```
Subject: "Welcome to [Product] 🎉"

Hey [name],

You're in. Here's how to get the most out of [Product]:

1. [First key action] — takes 30 seconds
2. [Second key action] — unlock the full experience
3. [Third key action] — for power users

If you need anything, just reply to this email.

— Brian
```

## Activation Metrics (Source: SaaS benchmarks)
| Metric | Target | Track Via |
|--------|--------|-----------|
| Signup → first action | < 60 seconds | PostHog |
| Day 1 retention | > 40% | PostHog |
| Day 7 retention | > 20% | PostHog |
| Onboarding completion | > 60% | PostHog |
| Time to "aha moment" | < 5 minutes | PostHog |

## Gamification (Source: Aetherio PLG Research)
- Progress bar showing completion percentage
- Celebratory animation on checklist completion (confetti)
- "3-day streak" badge for daily active use
- Subtle reward for completing each step

## Psychology of Onboarding (skill 51 — Wisdom Applied)

### Zeigarnik Effect
Incomplete tasks stay in memory and create tension. A progress bar showing "3 of 5 steps complete" drives users to finish. Never show 100% until they actually complete everything.

### Fogg Behavior Model
```
Behavior = Motivation × Ability × Trigger
```
At onboarding, motivation is at its peak (they just signed up). Make the first action extremely easy (high ability). Trigger immediately with a clear first step.

### Flow State (Csikszentmihalyi)
Match challenge to skill level. Start trivially easy, add complexity as users grow. Immediate feedback on every action. Minimize distractions during setup.

### Give More Than Expected (Matthew 5:41)
The welcome email should feel like a gift — useful tips, not marketing. The first experience should over-deliver on the promise that got them to sign up.

### Peak-End Rule
The end of onboarding should be the most delightful moment. Confetti, a warm message, a clear next step. This becomes the memory that defines their impression.

---

## Enhancement: 2026 Onboarding Best Practices (Source: NNGroup, Smashing Magazine, YC)

### "Paradox of the Active User" (lawsofux.com)
Users never read manuals — they start using software immediately. Design onboarding for hands-on discovery, not documentation. Tooltips and guided actions beat tutorial videos.

### Goal-Gradient Effect Applied
Motivation intensifies near the goal. Structure onboarding so users feel progress early:
- Start at "1 of 3 complete" (account creation counts as step 1)
- Make step 2 trivially easy (< 10 seconds)
- Step 3 delivers the "aha moment"
- Never show more than 5 total steps

### COM-B Diagnosis for Onboarding Drop-Off
When users abandon onboarding, diagnose:
- **Capability:** Is the step too complex? (simplify the UI)
- **Opportunity:** Is the environment blocking them? (mobile-unfriendly, slow load)
- **Motivation:** Do they see the value? (show the outcome before asking for effort)

### AI-Native Onboarding (YC 2026)
- Use AI to personalize the first-run experience based on signup context
- Pre-fill forms with intelligent defaults (industry, use case, team size)
- AI-powered "what would you like to do first?" replaces static checklists
- Chatbot assistant available during setup for instant help (but direct answers, not conversation — per NNGroup)

### Anti-Pattern: The "Grand Tour"
Showing users every feature before they need it is the #1 onboarding mistake. Instead:
- Show only what's needed for the first task
- Reveal features progressively as users demonstrate competence
- "Did you know?" tooltips after users complete their first workflow
