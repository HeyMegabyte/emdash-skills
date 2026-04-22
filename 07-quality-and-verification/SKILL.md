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
  - spec-driven-development.md
  - stagehand-ai-testing.md
  - visual-regression.md
  - contract-testing.md
  - slop-detection.md
  - eval-driven-development.md
---

# 07 — Quality and Verification

Submodules: accessibility-gate (axe-core, focus styling), performance-optimization (CWV, budgets, lazy loading), security-hardening (CSP, OWASP, Zod, Turnstile, rate limiting), computer-use-automation (native macOS), chrome-and-browser-workflows (Chrome/Playwright MCP), completeness-verification (multi-pass AI visual), visual-inspection-loop (screenshot/critique/fix), tdd-verification (10-point journey test), testing-matrices (payment/email/form templates), adversarial-testing (chaos/stress tests), stagehand-ai-testing (AI browser fallback, self-healing selectors), visual-regression (pixelmatch screenshot diffing), contract-testing (Zod validation against live APIs), slop-detection (AI filler/placeholder scanner), eval-driven-development (LLM-as-judge quality evals).

## Verification Pyramid

L5: Post-Deploy (08). L4: Visual (screenshots+AI). L3: E2E (Playwright). L2: Integration (API/DB). L1: Static (lint/typecheck).
Every code change: L1-L3. Every deploy: L4-L5.

### Self-Healing Loop
Test fails: read full error, classify (code/test/env/flaky), fix root cause, re-run, loop max 5. NEVER .skip/.only/.fixme()/comment assertions/increase timeouts. After fix: full suite.

### Zero Console Errors
```typescript
const errors: string[] = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
expect(errors).toEqual([]);
```

### Zero Recommendations Gate
After all tests pass: "How improve?" If ANY recommendation, implement+retest. Done when AI has zero suggestions.

## L1: Static
TypeScript (tsc --noEmit), ESLint, Stylelint, HTMLHint, Prettier. Fix all. Suppress lines only with comment.

## L2: Unit/Integration (Vitest)
100% on new functions. Happy+error+edge+auth paths. Don't test: framework internals, 3rd-party, CSS, simple getters.

## L3: E2E (Playwright)
Homepage-first. No sleeps (waitFor, toBeVisible, waitForResponse). Stable selectors (data-testid, role, text). Parallel-safe, deterministic, production URLs.

## L4: Visual
See visual-inspection-loop.md and completeness-verification.md.

## 8-Check Quality Gate

| # | Check | Pass |
|---|-------|------|
| 1 | E2E | 0 failures |
| 2 | Visual | No breaks 1280+375px |
| 3 | Links | All 200 |
| 4 | SEO | JSON-LD, OG, sitemap |
| 5 | Performance | Lighthouse >=90 |
| 6 | Accessibility | Skip link, ARIA, focus, 4.5:1 |
| 7 | Security | CSP, no secrets, Zod |
| 8 | Web Property | Manifest screenshots, shortcuts, infra files, 4+ JSON-LD, OG 1200x630, cross-site links |

## GitHub Integration
PR checks: `gh pr checks` then `gh run view --log-failed`, diagnose, fix, push, verify.
PR comments: fetch all, categorize (blocking/suggestion/nitpick/question), address blocking first, push.

## Lighthouse
Report score. Multimedia-heavy <90 expected. Richness > score. Never block deploy.

## SEO Audit (MANDATORY every deploy)
Title 50-60 w/keyword, meta 120-160, one H1, canonical, OG, JSON-LD, 2+ internal links, alt text.

## Readability: Flesch >=60, sentences <22 words avg.

## Doc Sync: CLAUDE.md refs valid, README matches, no stale TODOs, comments match code.

## CWV 2026: LCP <2.5s, INP <200ms, CLS <0.1. ADA deadline April 24, 2026.

## Quick Check (small fixes)
tsc --noEmit, relevant E2E, visual 1280+375, no console errors, deploy+purge+verify 200.

## Test Shortcuts
New page: adapted homepage test. New form: 8-point matrix. New API: valid 200, invalid 400, missing 404. Visual: screenshot at BREAKPOINTS. Auth: unauth 401, wrong 403, valid 200.

Shared values (breakpoints, CSP): CONVENTIONS.md.
