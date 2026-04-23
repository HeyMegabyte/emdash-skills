---
name: "spec-driven-development"
description: "Spec-first autonomous development loop. Every feature starts with acceptance criteria that become tests. Progress persists across context compaction. AI cannot stop until all criteria pass on production."
updated: "2026-04-23"
---

# Spec-Driven Development

## The Problem
AI builds the happy path and stops. Features ship incomplete. Recommendations get listed but not implemented.

## The Fix: Spec → Test → Build → Verify Loop

### Phase 1: Generate Spec (BEFORE any code)
For every feature/project, generate `SPEC.md`:
```markdown
# Feature: [name]
## Acceptance Criteria
- [ ] AC1: [specific, testable criterion]
- [ ] AC2: ...
- [ ] ACN: ...
## E2E Tests (auto-generated from criteria)
- test_ac1.spec.ts: [what it verifies]
- test_ac2.spec.ts: ...
## Pages Affected
- /path1: [what changes]
## Recommendations Queue
- [ ] R1: [improvement discovered during build]
- [ ] R2: ...
```

Each acceptance criterion MUST be:
- Observable on production (not just in code)
- Testable via Playwright against PROD_URL
- Completable in under 1 minute of test execution

### Phase 2: Write Failing Tests FIRST
For every acceptance criterion, write the Playwright test BEFORE implementing.
Test must fail (red). Then implement until it passes (green). Then refactor.

```typescript
// test_ac1.spec.ts — written BEFORE implementation
test('AC1: donation form accepts Stripe payment', async ({ page }) => {
  await page.goto(`${PROD_URL}/donate`);
  await page.fill('[data-testid="amount"]', '25');
  await page.click('[data-testid="donate-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

### Phase 3: Build in Slices
Each acceptance criterion = one vertical slice.
Implement → deploy → run that test → pass → next criterion.
Never implement AC2 before AC1's test passes on production.

### Phase 4: Recommendations Loop
After all ACs pass, ask: "What else can I improve?"
Every recommendation → new AC → new test → implement → verify.
Loop until zero recommendations.

### Phase 5: Progress Persistence
Write progress to `progress.md` in project root:
```markdown
# Progress
## Completed
- [x] AC1: donation form (test: PASS, deployed: 2026-04-20)
- [x] AC2: email receipt (test: PASS, deployed: 2026-04-20)
## In Progress
- [ ] AC3: mobile responsive (test: FAIL, blocking: viewport overflow at 375px)
## Recommendations Queue
- [ ] R1: add loading skeleton during Stripe checkout
## Blocked
- (none)
```

This file survives context compaction. Any new session reads it and picks up where the last left off.

## The Ralph Loop (Autonomous Execution)

For full-app builds, use the autonomous loop:
```
1. Generate feature-requirements.md with ALL features as acceptance criteria
2. Generate progress.md (all unchecked)
3. Loop:
   a. Read progress.md → find next unchecked AC
   b. Write failing test for that AC
   c. Implement until test passes on production
   d. Screenshot → GPT-4o critique → fix if needed
   e. Mark AC complete in progress.md
   f. Git commit with AC reference
   g. If context getting full → save progress → spawn fresh agent to continue
   h. Repeat until all ACs checked
4. Run recommendations loop (skill 14)
5. Done when: all ACs pass + all recommendations implemented or rejected + GPT-4o says zero issues
```

## Context Exhaustion Prevention

When context exceeds 60%:
1. Save current progress to progress.md
2. Commit all work
3. Spawn a new agent with: "Read progress.md and SPEC.md. Continue from where the last agent left off. Implement the next unchecked acceptance criterion."

This gives infinite effective context — each agent gets a fresh window but continues the same spec.

## Test Organization

```
tests/
├── e2e/
│   ├── homepage.spec.ts        (~1 min, runs first always)
│   ├── navigation.spec.ts      (~1 min)
│   ├── contact-form.spec.ts    (~1 min)
│   ├── donation-flow.spec.ts   (~1 min)
│   ├── auth-flow.spec.ts       (~1 min)
│   ├── search.spec.ts          (~1 min)
│   └── visual-regression.spec.ts (~1 min, screenshots + GPT-4o)
├── unit/
│   └── (vitest files)
└── playwright.config.ts
```

Each E2E file: ~1 minute, tests one feature, runs against PROD_URL, parallel-safe.
Total test suite: should complete in under 5 minutes with parallelization.

## Stagehand Integration

Use raw Playwright for predictable elements (data-testid, role, text).
Use Stagehand `act()/extract()/observe()` for:
- Dynamic content that changes between deploys
- Natural language assertions ("verify the page looks professional")
- Complex multi-step flows where selectors are fragile

```typescript
import { Stagehand } from '@browserbasehq/stagehand';

// Prefer raw Playwright
await page.click('[data-testid="submit"]');

// Fallback to Stagehand for dynamic content
const stagehand = new Stagehand({ page });
await stagehand.act('click the primary call-to-action button');
const price = await stagehand.extract('the displayed price');
```
