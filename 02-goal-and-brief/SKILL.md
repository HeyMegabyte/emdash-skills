---
name: "goal-and-brief"
description: "Establish the project thesis before the first line of code. Infers product type from domain name, identifies target users and business model, maintains PROJECT_BRIEF.md as single source of truth, and evolves the brief across prompts without losing alignment."
---

# 02 — Goal and Brief

> Establish the project thesis before the first line of code. Preserve and evolve it across prompts.

---

## Core Principle

**Every project must have a goal brief before the first build.** Without a goal, the system optimizes for nothing. The brief is the single source of truth for what the product is, who it serves, and what success looks like.

---

## Goal Brief Structure

Every project's goal brief contains:

### 1. Product Thesis (1-2 sentences)
What this product is and why it exists.

### 2. Target Users
- Primary persona (who uses this daily)
- Secondary persona (who uses this occasionally)
- Anti-persona (who this is NOT for)

### 3. Product Category
Inferred from domain name, folder context, and user description:
- SaaS tool
- Marketing site
- Developer tool
- E-commerce
- Community platform
- Content site / blog
- Portfolio / agency
- Internal tool
- API service
- Mobile app
- Open-source project site

### 4. Business Model
- Free / donation-supported
- Freemium
- Subscription SaaS
- One-time purchase
- Usage-based
- Marketplace / commission
- Ad-supported
- Open-source with paid support

### 5. Success Criteria
Concrete, measurable outcomes:
- Primary metric (what defines success)
- Secondary metrics (supporting indicators)
- Quality bar (what "done" looks like for this product)

### 6. Non-Goals
What this product explicitly will NOT do. Prevents scope creep and misaligned autonomous work.

### 7. Permanent Constraints
- Technology constraints (must use X, cannot use Y)
- Business constraints (budget, timeline, compliance)
- Brand constraints (existing identity, tone requirements)
- User constraints (accessibility, internationalization)

### 8. Current Truth
A living snapshot of what has been built, what's working, and what's next. Updated every session.

---

## Goal Establishment Process

### For New Projects (no existing code)
1. Parse the prompt and domain name
2. Infer product category from domain semantics
3. Infer target users from product category
4. Infer business model from product type
5. Infer success criteria from business model
6. Set reasonable non-goals
7. Apply permanent constraints from CLAUDE.md and user history
8. Write the goal brief to `PROJECT_BRIEF.md` in the project root
9. Proceed to build

### For Existing Projects (code already exists)
1. Read existing `PROJECT_BRIEF.md`, `CLAUDE.md`, `README.md`
2. Scan the codebase for product shape
3. Reconcile prompt intent with existing direction
4. Update the goal brief if direction has changed
5. Proceed with aligned execution

### For Subsequent Prompts (continuing work)
1. Load the existing goal brief
2. Detect whether the new prompt changes direction
3. If direction change: update brief, announce the change
4. If continuation: proceed with existing brief
5. Always update "Current Truth" section

---

## Domain Name Inference Rules

The folder name IS the domain. Use it aggressively:

| Domain Pattern | Likely Product |
|---------------|----------------|
| `*.megabyte.space` | Internal Megabyte Labs tool or service |
| `*link` / `*l.ink` | URL shortener, link management, or link-in-bio |
| `*blob*` | Media storage/sharing platform |
| `install.*` | Software installation or distribution |
| `editor.*` | Online editor tool |
| `fund*` | Fundraising or financial tool |
| `claim*` | Claim or registration service |
| `strict*` | Linting, validation, or enforcement tool |
| Generic `.com/.dev/.space` | Infer from README, package.json, or ask |

---

## Brief Evolution Rules

### What Can Change Without Asking
- Current Truth (always update)
- Success criteria refinement (more specific, not different)
- Non-goals additions (user's work implies them)

### What Requires User Confirmation
- Product category change
- Target user change
- Business model change
- Primary success metric change
- Removing permanent constraints

### What Cannot Change
- Technology constraints set by CLAUDE.md
- Quality bar (can only go up, never down)
- Security requirements (can only strengthen)

---

## Goal-Aligned Execution Check

Before every major implementation decision, verify alignment:

```
Is this implementation aligned with:
  [ ] Product thesis?
  [ ] Target users' needs?
  [ ] Business model?
  [ ] Success criteria?
  [ ] Not in non-goals?
  [ ] Within permanent constraints?
```

If any check fails, stop and either:
- Adjust the implementation to align
- Escalate to the user if alignment requires changing the goal

---

## Brief Storage

- **Location:** `PROJECT_BRIEF.md` in the project root
- **Format:** Markdown with the sections above
- **Updates:** End of every session that changes direction
- **Never delete:** Archive old briefs if direction changes fundamentally

---

## Trigger Conditions
- New project with no `PROJECT_BRIEF.md`
- First prompt in any session (load and verify brief)
- User changes product direction
- User introduces new constraints
- ***PROCESS THIS*** directive received

## Stop Conditions
- Brief is established and current prompt doesn't change direction
- Analysis-only tasks (no brief needed)

## Cross-Skill Dependencies
- **Reads from:** 01-operating-system (policy), 04-preference-and-memory (user preferences)
- **Feeds into:** 03-planning-and-research (research targets), 05-architecture-and-stack (constraints), 06-build-and-slice-loop (feature scope), 09-brand-and-content (product positioning), 14-independent-idea-engine (alignment check)

---

## What This Skill Owns
- Project thesis and product definition
- Target user identification
- Business model inference
- Success criteria definition
- Non-goals and constraints
- Brief evolution and versioning
- Goal-alignment verification

## What This Skill Must Never Own
- Implementation planning (→ 03, 06)
- Stack selection (→ 05)
- Design decisions (→ 10)
- Deployment (→ 08)
- Testing strategy (→ 07)
