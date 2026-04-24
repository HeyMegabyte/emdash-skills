---
name: "Wisdom and Human Psychology"
description: "Foundational skill encoding timeless principles from behavioral psychology, philosophy, holy books, and self-help classics — applied to product building. Cialdini's persuasion, Fogg's behavior model, Kahneman's biases, biblical servant leadership, stoic craftsmanship, kaizen improvement. Every product should embody the spirit of what the greats taught. Ethical persuasion only — never dark patterns."
version: "2.0.0"
updated: "2026-04-23"
---

# Wisdom and Human Psychology

## Universal Principles

### 1. Serve Others First
Give value before asking. "How can we help?" not "Contact sales." Error messages help, not blame. Free tier genuinely generous. Brian's 99% wealth donation ethos: maximize impact, not extraction.

### 2. Simplicity Is Mastery
One CTA per page. Miller's Law: max 7 options. Hick's Law: fewer choices = faster action. Paradox of Choice: 3 pricing tiers > 5. Best interface is invisible.

### 3. Truth Builds Trust
No fake testimonials/urgency/scarcity. Show real numbers ("127 donors" not "hundreds"). Transparent pricing. Plain English legal pages. Admit when broken.

### 4. Excellence as Habit
Apple Test: would Apple's design team approve? No placeholders, no "good enough." Every pixel intentional. After every deploy: what's 5% better? Kaizen compounds.

### 5. Know Thy User
VoC (04-preference-and-memory) is empathy. Accessibility (07/accessibility-gate) = loving your blind/deaf/motor-impaired neighbor. i18n = loving your Spanish-speaking neighbor. Error messages for frustrated users, not developers.

### 6. Give More Than Expected
Easter eggs (06/easter-eggs). Over-deliver on free tier. Blog content that teaches, not just markets. Docs anticipate questions. Idea engine (14-independent-idea-engine) gives users more than asked.

## Behavioral Psychology

### Cialdini's 7 Principles (Ethical Only)
1. **Reciprocity** — free value first (tools, content, generous tier)
2. **Commitment** — free trial -> paid, newsletter -> product, micro-conversions
3. **Social Proof** — testimonials near CTAs, user counts, logo bars
4. **Authority** — credentials, press mentions, expert content
5. **Liking** — brand personality, photos, casual tone, shared values
6. **Scarcity** — ONLY when genuine. Never fake.
7. **Unity** — "We" language, community, shared mission

### Fogg Behavior Model
`Behavior = Motivation + Ability + Trigger` (at same moment)
- Don't ask push permissions on page load (no motivation yet)
- Ask after first success moment (high motivation + demonstrated ability)
- CTAs appear after value demonstrated, not before

### Kahneman's Key Biases
| Bias | Application |
|------|-------------|
| Anchoring | Show annual price first, monthly feels reasonable |
| Loss Aversion | "Don't lose your progress" > "Keep your progress" |
| Peak-End Rule | Make checkout confirmation + last impression amazing |
| Endowment Effect | "Your dashboard" not "A dashboard" |
| Status Quo Bias | Default to best option (annual billing, recommended plan) |

### Zeigarnik Effect
Incomplete tasks create tension to complete. Use: onboarding progress bars ("3 of 5 steps"), profile completion %, "You started but didn't finish..." emails.

### Flow State (Csikszentmihalyi)
Challenge matches skill, clear immediate feedback, sense of control, no distractions. Progressive disclosure, instant feedback, keyboard shortcuts for power users, minimize interruptions.

## Design Psychology

### Golden Ratio Spacing
```css
:root {
  --space-xs: 0.382rem; --space-sm: 0.618rem; --space-md: 1rem;
  --space-lg: 1.618rem; --space-xl: 2.618rem; --space-2xl: 4.236rem;
}
```

### Color Psychology
Blue=trust/security, Cyan=innovation (#00E5FF), Green=success, Red=urgency/error, Orange=warning, White space=premium

### Gestalt Principles
Proximity (close=grouped), Similarity (consistent styles), Closure (progress bars), Figure/Ground (CTAs contrast), Continuity (visual flow hero->features->CTA)

## Ethical Line

**DO:** Genuine social proof, real scarcity only, default to best for USER, give before asking, respect "no," accessibility as moral imperative, transparent pricing/data/AI.

**NEVER:** Fake urgency timers, hidden costs, confirmshaming, forced continuity, misdirection, disguised ads, roach motels, trick questions, bait-and-switch.

### Brian's Higher Pursuits
1. Employing disabled/paraplegic people at premium rates
2. 99% wealth donation — maximize impact
3. Spiritual investigation through technology
4. Same tech reshaping Wall Street, pointed at helping people

## Checklists

**Servant:** Serves user before business? Generous free tier? Helpful errors? Cancel easy as signup?
**Simplicity:** One CTA/section? <7 options? 3 tiers? 5-second comprehension?
**Trust:** Real numbers? Transparent pricing? Genuine social proof? Plain English legal?
**Excellence:** Apple-approved? Every pixel intentional? Beautiful loading? Delightful errors?
**Psychology:** Value before conversion? Social proof near CTAs? Progress bars? Annual first? Great last impression?
**Ethics:** No fake urgency? No confirmshaming? No hidden costs? Easy unsubscribe/cancel/delete?

## Copy Patterns
- Headlines: "Your clean driveway feeds a family" (service), "One number. No hold music." (simplicity)
- CTAs: "Start helping today" > "Sign up now", "Join 1,200 builders" > "Create account"
- Errors: "Something broke on our end. We're on it." (honesty + service)

## Hard Numbers from Studies
| Finding | Data | Source |
|---------|------|--------|
| Removing one form field | +4-8% conversion | BJ Fogg |
| "No credit card required" | 2x trial signups | Fogg |
| Loss framing vs gain | +32% conversion | Kahneman & Tversky |
| Free trials vs discounts | 15x conversion | Monetizely |
| Multi-step forms with progress | +86% vs single page | Formstack |
| 11->4 form fields | +120% conversion | Imagescape |
| Social proof with photo+name | +15-30% vs anonymous | CXL |
| Trust badges at checkout | +42% | Baymard |
| 6 jam vs 24 | 10x purchase (30% vs 3%) | Iyengar & Lepper |
| Endowed progress | 34% vs 19% completion | Nunes & Dreze |
| 1s page load delay | -7% conversion | Amazon |

### Fitts's Law
Primary buttons: large and near focus. Mobile: min 44x44px. Group related actions.

### Meta-Filter (Every Decision)
1. Does this genuinely serve the user? 2. Am I being honest? 3. Does this respect their autonomy?
All yes -> ship it.

## Laws of UX (30 evidence-based)

**Perception:** Aesthetic-Usability (polish=perceived usability), Cognitive Load (progressive disclosure), Miller's Law (7+/-2), Selective Attention (CTAs unmissable)
**Decision:** Hick's Law (reduce choices), Choice Overload (defaults, curation), Fitts's Law (big close CTAs), Goal-Gradient (progress bars past 50%), Zeigarnik (onboarding checklists)
**Memory:** Peak-End Rule (nail first+last), Serial Position (key items first/last), Von Restorff (CTAs visually distinct)
**Gestalt:** Proximity, Similarity, Common Region (cards/containers), Uniform Connectedness, Pragnanz (clean layouts)
**System:** Jakob's Law (follow conventions), Doherty Threshold (<400ms=instant), Tesler's Law (move complexity to system), Postel's Law (accept broadly, send conservatively), Occam's Razor, Pareto (80/20), Parkinson's (tight deadlines)

## COM-B Diagnosis
When users aren't converting: Capability (can they?), Opportunity (does environment allow?), Motivation (do they want?). Fix the actual bottleneck.

## 2026 Research
- **Handmade Designs** (NNGroup): AI-fatigued users prefer human-crafted. Anti-slop = trust signal.
- **AI Agents as Users** (NNGroup): Design for both humans and AI. Semantic HTML + structured data serve both.
- **Less Chat, More Answer** (NNGroup): Direct scannable answers, not conversations. Lead with answer.
- **YC Philosophy**: Code is cheap, insight is rare. AI-native is baseline. Focus on workflows, not features.
