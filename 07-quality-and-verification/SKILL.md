---
name: "quality-and-verification"
description: "5-level verification pyramid: static analysis, unit/integration tests, Playwright E2E (homepage-first at 6 breakpoints), AI-powered visual inspection, and post-deploy checks. 7-check quality gate, form testing matrix, security audits (CSP, OWASP), accessibility (WCAG AA), and GitHub CI/PR integration."
submodules:
  - accessibility-gate.md
  - performance-optimization.md
  - security-hardening.md
  - computer-use-automation.md
  - chrome-and-browser-workflows.md
  - completeness-verification.md
  - visual-inspection-loop.md
  - tdd-verification.md
  - testing-matrices.md
  - adversarial-testing.md
---

# 07 — Quality and Verification

> Test everything. Verify visually. Never ship what you haven't proven works.

## Submodules

- **accessibility-gate.md** — Automated WCAG AA accessibility audit via axe-core + Playwright on every deployment. Beautiful focus styling (2px solid cyan, 3px offset).
- **performance-optimization.md** — Canonical owner of Core Web Vitals, JS/CSS budgets, image optimization, lazy loading, font loading strategy, preconnect/prefetch, code splitting, tree shaking, and compression.
- **security-hardening.md** — Canonical owner of CSP headers, OWASP Top 10 prevention, Zod validation at all boundaries, Turnstile CAPTCHA integration, KV-based rate limiting, secret rotation, dependency scanning, and XSS/CSRF/injection prevention.
- **computer-use-automation.md** — Desktop automation via Anthropic Computer Use MCP. Native macOS app control, visual QA workflows, screenshot-verify loops, cross-app orchestration.
- **chrome-and-browser-workflows.md** — Browser automation for web app interaction, form filling, visual testing, and web scraping via Chrome MCP and Playwright MCP.
- **completeness-verification.md** — Continuously loop through AI-powered visual inspection of every page, every breakpoint, every interaction state until zero remaining issues. Includes the 5-pass multi-pass verification protocol.
- **visual-inspection-loop.md** — Screenshot capture, AI critique protocol, GPT-4o vision integration, Stagehand browser testing, and the critique-fix-verify cycle.
- **tdd-verification.md** — Full-application test user simulation (10-point journey test), completion-driven execution workflow, and assumption protocol.
- **testing-matrices.md** — Auto-generated test templates for payment flows, email deliverability, graceful degradation, form validation, breakpoint coverage, and content integrity.
- **adversarial-testing.md** — Stress tests: rapid navigation, resize storms, network offline, Unicode bombs, back-button edge cases, and chaos testing checklist.

---

## Core Principle

**Quality is not a phase — it's a property of every slice.** Tests are written before or alongside code, not after. Visual verification is mandatory, not optional. Security and accessibility are defaults, not extras.

---

## Verification Pyramid

```
Level 5: Post-Deploy Verification (→ 08)
Level 4: Visual Inspection (screenshots + AI analysis)
Level 3: E2E Tests (Playwright, homepage-first)
Level 2: Integration Tests (API routes, database queries)
Level 1: Static Analysis (lint, typecheck, format)
```

Every code change must pass Levels 1-3 minimum. Levels 4-5 run on every deployment.

### Continuous Self-Healing Loop (MANDATORY)
When ANY test fails — unit, integration, or E2E:
1. Read the full error output including stack trace
2. Classify the failure: code bug, test bug, environment issue, flaky test
3. Fix the root cause (not a workaround)
4. Re-run the failing test
5. If still failing: re-diagnose with fresh eyes
6. Loop until green — max 5 attempts before escalating to user
7. NEVER: mark tests as .skip, add .only, use test.fixme(), or comment out assertions
8. NEVER: increase timeouts to mask slow code
9. After fix: run the FULL test suite to check for regressions

### "Zero Console Errors" Requirement
Every Playwright E2E test MUST assert zero console errors:
```typescript
const errors: string[] = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
// ... run test ...
expect(errors).toEqual([]);
```

### "Zero Recommendations" Convergence Test
After all tests pass, ask: "How can I improve this app more?"
If the AI produces ANY reasonable recommendation → implement it → re-test.
The project is DONE only when the AI genuinely has no more suggestions.

---

## Level 1: Static Analysis

| Tool | Scope | Command |
|------|-------|---------|
| TypeScript | Type safety | `npx tsc --noEmit` |
| ESLint | Code quality | `npx eslint .` |
| Stylelint | CSS quality | `npx stylelint "**/*.css"` |
| HTMLHint | HTML quality | `npx htmlhint "**/*.html"` |
| Prettier | Formatting | `npx prettier --check .` |

Fix all errors before committing. Never disable lint rules project-wide. Suppress individual lines only with an explaining comment.

---

## Level 2: Unit and Integration Tests

### Vitest Rules
- **New code:** 100% line coverage on new functions
- **Happy path:** At least 1 test for the expected flow
- **Error path:** At least 1 test for each error condition
- **Edge cases:** At least 1 test for boundary values
- **Auth paths:** At least 1 test for each permission level

### What NOT to Test
- Framework internals (Angular, Hono, Cloudflare)
- Third-party library behavior
- CSS rendering (use visual QA instead)
- Simple getters/setters with no logic

---

## Level 3: E2E Tests (Playwright)

### Homepage-First Rule
The first E2E test is always the homepage. Test title, H1, nav, footer visibility.

### E2E Test Rules
- **No sleeps** — use `waitFor`, `expect().toBeVisible()`, `page.waitForResponse()`
- **Stable selectors** — prefer `data-testid`, `role`, or visible text over CSS classes
- **Parallel-safe** — tests must not depend on each other's state
- **Deterministic** — same result every run
- **Real URLs** — test against deployed production URL after deploy

### When to Run E2E
- Every code change (against local or staging)
- Every deployment (against production URL)
- Every feature completion
- Every PR

---

## Level 4: Visual Inspection

See **visual-inspection-loop.md** for the full screenshot → AI critique → fix → verify cycle.

See **completeness-verification.md** for the multi-pass verification protocol and convergence criteria.

---

## Security, Accessibility, Performance

See submodules for full details:
- **security-hardening.md** — CSP, Zod, CORS, rate limiting, secrets, XSS/injection prevention
- **accessibility-gate.md** — axe-core, focus rings, ARIA, contrast, keyboard nav, reduced-motion
- **performance-optimization.md** — Core Web Vitals, bundle budgets, image compression, lazy loading

---

## 7-Check Quality Gate

Before any deployment is considered complete:

| # | Check | Pass Criteria |
|---|-------|--------------|
| 1 | E2E tests | 0 failures |
| 2 | Visual inspection | No layout breaks at 1280px and 375px |
| 3 | Link verification | All links return 200 |
| 4 | SEO/structured data | JSON-LD present, OG tags set, sitemap exists |
| 5 | Performance | Lighthouse >= 90 |
| 6 | Accessibility | Skip link, ARIA, focus rings, 4.5:1 contrast |
| 7 | Security | CSP set, no exposed secrets, Zod validation |
| 8 | Web Property Completeness (06/web-manifest) | Manifest has screenshots (wide+narrow form_factor), shortcuts have 96px icons, all infrastructure files exist (humans.txt, security.txt, browserconfig.xml, opensearch.xml), 4+ JSON-LD blocks validate (Organization, WebSite w/ SearchAction, WebPage, domain-specific), OG images exist at 1200x630, cross-site rel="alternate" links present |

---

## GitHub Integration

### PR Check Debugging (gh-fix-ci)
```bash
gh pr checks <PR_NUMBER>
gh run view <RUN_ID> --log-failed
```
1. Identify failing checks
2. Read failure logs
3. Diagnose root cause (not just symptoms)
4. Fix and push
5. Verify checks pass

### PR Review Comments (gh-address-comments)
1. Fetch all comments: `gh api repos/{owner}/{repo}/pulls/{pr}/comments`
2. Categorize: blocking / suggestion / nitpick / question
3. Address blocking comments first
4. Apply suggestions where aligned
5. Respond to questions
6. Push fixes and reply in thread

---

## Trigger Conditions
- Every code change (static analysis, tests)
- Every deployment (full quality gate)
- Every feature completion (E2E + visual)
- PR creation (full quality gate)
- User requests quality audit

## Stop Conditions
- All 7 quality gate checks pass
- No test failures
- No visual regressions

## Cross-Skill Dependencies
- **Reads from:** 06-build-and-slice-loop (code to test), 08-deploy-and-runtime (production URL)
- **Feeds into:** 08-deploy-and-runtime (go/no-go), 06-build-and-slice-loop (bugs to fix)

---

## What This Skill Owns
- Static analysis and linting
- Unit, integration, and E2E testing
- Visual inspection and AI analysis
- Security auditing
- Accessibility checking
- Performance measurement
- Quality gate enforcement
- GitHub CI/PR integration

## What This Skill Must Never Own
- Deployment execution (→ 08)
- Implementation (→ 06)
- Design decisions (→ 10)
- Media quality (→ 12)

---

## Lighthouse (Report, Don't Block)
Run Lighthouse and report score. For multimedia-heavy pages (video backgrounds,
multiple maps, high-res images), scores below 90 are EXPECTED and acceptable.
Priority order: multimedia richness > Lighthouse score.
Report the score for tracking but never block a deploy for it.

## SEO Audit (MANDATORY — 09/seo-keywords)
Run on every deploy alongside the quality gate. Verify: title 50-60 chars with keyword, meta desc 120-160 chars, one H1, canonical URL, OG tags, JSON-LD, 2+ internal links, alt text on all images.

## Readability Check (Flesch >= 60)
After deploy, check all user-facing text. Average sentence length should be under 22 words (Flesch 60+ territory).

## Documentation Sync Check (09/documentation)
After code changes: CLAUDE.md references no deleted files, README.md features match actual features, no stale TODO comments, code comments match current behavior.

---

## Enhancement: Core Web Vitals 2026 Targets (Source: web.dev)

| Metric | Good | Needs Improvement | Poor |
|--------|------|--------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

**INP replaced FID as a Core Web Vital.** Every Emdash project must now test INP, not just FID.

### 2026 Accessibility Compliance Deadline
As of April 24, 2026, local governments with population 50,000+ must meet ADA web accessibility requirements. This is driving enterprise clients to demand WCAG AA compliance from all vendors. Our accessibility-first approach is now a competitive advantage and legal requirement.

---

## Quick Quality Check (for bug fixes and small changes)

Not every change needs the full 7-check gate. Use this lightweight check for small fixes:

```
[ ] TypeScript compiles (npx tsc --noEmit)
[ ] Relevant E2E test passes
[ ] Visual spot-check at 1280px + 375px
[ ] No new console errors
[ ] Deploy + purge + verify 200 OK
```

## Test Generation Shortcuts

| Pattern | Template |
|---------|----------|
| New page | Homepage test adapted with new URL + title + H1 |
| New form | 8-point form matrix (see testing-matrices.md) |
| New API endpoint | POST valid data → 200, POST invalid → 400, GET missing → 404 |
| Visual regression | Screenshot at BREAKPOINTS + compare |
| Auth-protected route | Unauthenticated → 401, wrong role → 403, valid → 200 |

## Note on Shared Constants
Breakpoints, CSP headers, and other shared values are defined in CONVENTIONS.md. Reference them there instead of duplicating in test files.
