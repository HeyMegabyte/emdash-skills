---
name: "quality-and-verification"
description: "5-level verification pyramid: static→unit→Playwright E2E (homepage-first, 6bp)→AI visual→post-deploy. 8-check quality gate. Multi-agent testing (functional/security/a11y/performance). Playwright v1.59+ AI agents (Planner/Generator/Healer). WCAG 2.2 AA via axe-core v4.11. Percy+Chromatic visual regression. ADA Title II 2027/2028 deadlines."
metadata:
  version: "2.0.0"
  updated: "2026-04-23"
  token_budget: "5K"
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
  - ui-completeness-sweep.md
  - semgrep-codebase-rules.md
  - audio-video-sync.md
  - e2e-accumulation.md
  - evidence-collection.md
  - agentic-security.md
  - picovoice-eagle-biometric.md
  - stagehand-ai-fallback.md
---

# 07 — Quality and Verification

Submodules: accessibility-gate (axe-core v4.11, WCAG 2.2 AA, focus-not-obscured, target-size 24px, accessible-auth)|performance-optimization (CWV, INP 3-phase, budgets)|security-hardening (CSP nonce-based, OWASP 2025, supply-chain #3)|computer-use-automation (native macOS)|chrome-and-browser-workflows (Chrome/Playwright MCP)|completeness-verification (multi-pass AI visual)|visual-inspection-loop (screenshot/critique/fix)|tdd-verification (10-point journey)|testing-matrices (payment/email/form)|adversarial-testing (chaos/stress)|stagehand-ai-testing (AI browser fallback, a11y-tree selectors)|visual-regression (Percy AI+Chromatic+pixelmatch)|contract-testing (Zod vs live APIs)|slop-detection (AI filler scanner)|eval-driven-development (LLM-as-judge)|ui-completeness-sweep (***MANDATORY*** Playwright+GPT-4o, blocks done until >=8/10)|semgrep-codebase-rules (AST-level per-project rules)|e2e-accumulation (append-only parallel chunks)|evidence-collection (R2 video+screenshots).

## Verification Pyramid

L5: Post-Deploy (08). L4: Visual (screenshots+AI). L3: E2E (Playwright v1.59+). L2: Integration (API/DB). L1: Static (lint/typecheck).
Every code change: L1-L3. Every deploy: L4-L5.

### Playwright AI Agents (v1.59.1+)
Planner: explores app, designs test plans from natural language. Generator: creates executable test code. Healer: auto-fixes broken tests. Pattern: static specs for stable tests, AI agents for flaky/new. Run agents only on failed tests in second pass (70% token savings).

### Playwright v1.59.1 New APIs
`page.screencast({ path })` — video recording with action annotations and real-time frame capture (video receipts for CI). `browser.bind()` — connect to running browser instances. `page.consoleMessages()`/`page.pageErrors()`/`page.requests()` — snapshot-in-time accessors (no event listeners needed). `await using` async disposables for auto-cleanup. Trace CLI for agent-driven test analysis.

### MCP-Based Testing
Playwright MCP operates on accessibility tree, not screenshots. Returns structured snapshots: role hierarchy, names, states. Target "Role: button, Name: Checkout" — 10x more stable than CSS selectors. AOM-reasoning > DOM-scraping.

### Multi-Agent Testing Pattern
Functional agent: happy path clicks. Security agent: XSS probing, auth bypass. Accessibility agent: WCAG 2.2 compliance. Performance agent: CWV measurement. Run all four in parallel per deploy.

### Self-Healing Loop
Test fails→read full error→classify (code/test/env/flaky)→fix root cause→re-run→loop max 5. NEVER .skip/.only/.fixme()/comment assertions/increase timeouts. After fix: full suite.

### Zero Console Errors
```typescript
const errors: string[] = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
expect(errors).toEqual([]);
```

### Zero Recommendations Gate
After all tests pass: "How improve?" If ANY recommendation→implement+retest. Done when AI has zero suggestions.

## L1: Static
TypeScript (tsc --noEmit), ESLint flat config, Prettier. Fix all. Suppress lines only with comment.

## L2: Unit/Integration (Vitest)
100% on new functions. Happy+error+edge+auth paths. Don't test: framework internals, 3rd-party, CSS, simple getters.

## L3: E2E (Playwright v1.59+)
Homepage-first. No sleeps (waitFor, toBeVisible, waitForResponse). Stable selectors: data-testid→role→text→Stagehand AI fallback. Parallel-safe, deterministic, production URLs. 6bp: 375/390/768/1024/1280/1920.

## L4: Visual
Percy AI Visual Review Agent (3x review reduction, 40% false positive filtering, OCR text-shift elimination). Chromatic for component-level (Storybook+Playwright). pixelmatch for local CI. See visual-inspection-loop.md + completeness-verification.md.

## 8-Check Quality Gate

| # | Check | Pass |
|---|-------|------|
| 1 | E2E | 0 failures |
| 2 | Visual | No breaks 1280+375px, Percy/Chromatic clean |
| 3 | Links | All 200 |
| 4 | SEO | JSON-LD 4+, OG 1200x630, sitemap |
| 5 | Performance | LCP<2.5s, INP<200ms, CLS<0.1 |
| 6 | A11y | WCAG 2.2 AA, axe-core 0, focus-not-obscured, target>=24px |
| 7 | Security | CSP nonce-based, OWASP 2025, no secrets, Zod |
| 8 | Web Property | Manifest, shortcuts, 4+ JSON-LD, cross-site links |

## WCAG & ADA Landscape
WCAG 2.2 AA = baseline (9 new SC: focus-not-obscured, target-size-minimum 24px, accessible-auth, consistent-help, redundant-entry, dragging-movements, focus-appearance 2px/3:1). ADA Title II: large entities April 2027, smaller April 2028. WCAG 3.0 working draft (174 requirements, est. 2028-2030, no A/AA/AAA — assertions+scoring). axe-core v4.11.3 covers WCAG 2.0/2.1/2.2 at A/AA/AAA.

## GitHub Integration
PR checks: `gh pr checks`→`gh run view --log-failed`→diagnose→fix→push→verify.

## CWV Targets
LCP <2.5s (4-phase: TTFB→resource delay→load duration→render delay). INP <200ms (3-phase: input delay→processing→presentation). CLS <0.1 (explicit dimensions, aspect-ratio, font-display). 47% of sites pass all three. See performance-optimization.md.

## Quick Check (small fixes)
tsc --noEmit, relevant E2E, visual 1280+375, no console errors, deploy+purge+verify 200.

## Test Shortcuts
New page: adapted homepage test. New form: 8-point matrix. New API: valid 200, invalid 400, missing 404. Visual: screenshot at 6bp. Auth: unauth 401, wrong 403, valid 200.

Shared values (breakpoints, CSP): CONVENTIONS.md.
