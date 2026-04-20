---
name: "Quality and Verification"
description: "5-level verification pyramid: static analysis, unit/integration tests, Playwright E2E (homepage-first at 6 breakpoints), AI-powered visual inspection, and post-deploy checks. 7-check quality gate, form testing matrix, security audits (CSP, OWASP), accessibility (WCAG AA), and GitHub CI/PR integration."
layer: "product-compiler"
canonical-owner-of:
  - "zero-recommendations-gate"
  - "quality-gate-7-checks"
  - "verification-pyramid"
  - "form-testing-matrix"
  - "visual-inspection-protocol"
context: "fork"
allowed-tools: "Bash Read Glob Grep mcp__playwright__*"
---

# 07 — Quality and Verification

> Test everything. Verify visually. Never ship what you haven't proven works.

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
Console warnings should also be minimized — flag any new warnings introduced by changes.

### "Zero Recommendations" Convergence Test
After all tests pass, ask: "How can I improve this app more?"
If the AI produces ANY reasonable recommendation → implement it → re-test.
The project is DONE only when the AI genuinely has no more suggestions.
This is the ultimate quality gate — not a checklist, but a convergence test.

---

## Level 1: Static Analysis

### Required Tools
| Tool | Scope | Command |
|------|-------|---------|
| TypeScript | Type safety | `npx tsc --noEmit` |
| ESLint | Code quality | `npx eslint .` |
| Stylelint | CSS quality | `npx stylelint "**/*.css"` |
| HTMLHint | HTML quality | `npx htmlhint "**/*.html"` |
| Prettier | Formatting | `npx prettier --check .` |

### Rules
- Fix all errors before committing
- Warnings are acceptable temporarily but should trend to zero
- Never disable lint rules project-wide to suppress warnings
- Suppress individual lines only with a comment explaining why

---

## Level 2: Unit and Integration Tests

### Vitest for Units
```typescript
// Test naming: describe what, not how
describe('PricingCalculator', () => {
  it('applies 20% discount for annual billing', () => {
    expect(calculate({ plan: 'pro', billing: 'annual' })).toBe(960);
  });

  it('rejects negative quantities', () => {
    expect(() => calculate({ quantity: -1 })).toThrow(ValidationError);
  });
});
```

### Test Coverage Defaults
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
The first E2E test is always the homepage:
```typescript
import { test, expect } from '@playwright/test';

test('homepage loads and displays key content', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Expected Title/);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('nav')).toBeVisible();
  await expect(page.locator('footer')).toBeVisible();
});
```

### E2E Test Rules
- **No sleeps** — use `waitFor`, `expect().toBeVisible()`, `page.waitForResponse()`
- **Stable selectors** — prefer `data-testid`, `role`, or visible text over CSS classes
- **Parallel-safe** — tests must not depend on each other's state
- **Deterministic** — same result every run
- **Real URLs** — test against deployed production URL after deploy

### E2E Test Structure
```
e2e/
├── tests/
│   ├── homepage.spec.ts       # Always first
│   ├── navigation.spec.ts
│   ├── forms.spec.ts
│   ├── auth.spec.ts           # If auth exists
│   ├── [feature].spec.ts
│   └── visual.spec.ts         # Screenshot comparisons
├── fixtures/
│   └── test-data.ts
├── playwright.config.ts
└── FEATURES.md                # Feature inventory
```

### When to Run E2E
- Every code change (against local or staging)
- Every deployment (against production URL)
- Every feature completion
- Every PR

### Production E2E Template
```typescript
const PROD_URL = process.env.PROD_URL || 'https://domain.com';

test.describe('Production Verification', () => {
  test('all pages return 200', async ({ page }) => {
    const pages = ['/', '/about', '/pricing', '/contact'];
    for (const path of pages) {
      const response = await page.goto(`${PROD_URL}${path}`);
      expect(response?.status()).toBe(200);
    }
  });

  test('images load correctly', async ({ page }) => {
    await page.goto(PROD_URL);
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveJSProperty('complete', true);
      await expect(images.nth(i)).not.toHaveJSProperty('naturalWidth', 0);
    }
  });

  test('no console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.goto(PROD_URL);
    expect(errors).toEqual([]);
  });
});
```

---

## Level 4: Visual Inspection

### Automated Visual Checks
```typescript
// Take screenshots at key breakpoints
await page.setViewportSize({ width: 1280, height: 800 });
await page.screenshot({ path: 'screenshots/desktop.png', fullPage: true });

await page.setViewportSize({ width: 375, height: 812 });
await page.screenshot({ path: 'screenshots/mobile.png', fullPage: true });
```

### Visual Inspection Checklist
```
[ ] No horizontal overflow at any breakpoint
[ ] Text is readable (min 16px body, 4.5:1 contrast)
[ ] Images load and are properly sized
[ ] No layout shifts visible
[ ] Footer is at page bottom (not floating mid-page)
[ ] Navigation works and is properly styled
[ ] Interactive elements have cursor:pointer
[ ] Focus rings visible on keyboard navigation
[ ] Hover states present on all interactive elements
[ ] Cards and sections properly spaced
[ ] No orphaned headings or widows
[ ] Brand colors consistent throughout
[ ] Typography hierarchy clear
[ ] Mobile: no text cut off, no overlapping elements
```

### AI Visual Analysis
When GPT-4o Vision is available, submit screenshots for analysis against:
- Layout quality and alignment
- Typography and readability
- Color harmony and brand consistency
- Interaction affordances
- Content completeness
- Mobile responsiveness
- Overall professional quality

---

## Security Checks

### Always-On Security Rules
1. **CSP headers** — set Content-Security-Policy on every response
2. **Input validation** — Zod on all external input at the boundary
3. **No eval/innerHTML** — never use `eval()`, `innerHTML`, or `document.write()`
4. **Auth verification** — middleware checks JWT on every protected route
5. **Rate limiting** — KV-based counters on all public endpoints
6. **Secrets management** — `wrangler secret put`, never in code or .env in repo
7. **CORS** — explicit origins, never `*` in production
8. **SQL injection** — parameterized queries only
9. **XSS** — escape all user content in HTML output

### Security Audit Quick Command
```bash
grep -rn 'eval\|innerHTML\|document\.write\|password.*=.*["\x27]' src/ --include="*.ts" --include="*.js"
```

---

## Accessibility Checks

### Required
- Skip-to-content link
- All images have meaningful `alt` text
- ARIA landmarks (header, nav, main, footer)
- Focus rings on all interactive elements (3px solid cyan)
- Color contrast 4.5:1 minimum for body text
- Heading hierarchy (h1 → h2 → h3, no skipping)
- Form labels associated with inputs
- Keyboard navigation works for all interactions
- `prefers-reduced-motion` respected

### Testing
```bash
npx pa11y https://domain.com
npx axe https://domain.com
```

---

## Performance Checks

### Targets
| Metric | Target |
|--------|--------|
| Lighthouse Performance | >= 90 |
| LCP | < 2.5s |
| FID/INP | < 100ms |
| CLS | < 0.1 |
| TTI | < 3s |
| Bundle size (Worker) | < 1MB |
| Image sizes | < 200KB each (WebP) |

### Testing
```bash
npx lighthouse https://domain.com --output=json --output-path=lighthouse.json
```

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
| 8 | Web Property Completeness (skill 24) | Manifest has screenshots (wide+narrow form_factor), shortcuts have 96px icons, all infrastructure files exist (humans.txt, security.txt, browserconfig.xml, opensearch.xml), 4+ JSON-LD blocks validate (Organization, WebSite w/ SearchAction, WebPage, domain-specific), OG images exist at 1200x630, cross-site rel="alternate" links present |

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

## Payment Flow Testing Matrix (auto-generate for every Stripe integration)

For EVERY payment/donation flow, generate these tests:

1. **Successful payment** — complete checkout with Stripe test card `4242424242424242`, verify success page + thank-you email sent
2. **Declined card** — use `4000000000000002`, verify user sees clear error message (not a crash)
3. **Webhook idempotency** — send the same webhook event twice, verify only one record created
4. **Webhook signature** — send a webhook with invalid signature, verify 401 rejection
5. **Partial amount** — verify amount displayed matches amount charged (no rounding errors)
6. **Refund flow** — if refunds exist, verify refund processes and user is notified
7. **Third-party script failure** — block `js.stripe.com` in test, verify page still loads with helpful fallback message

## Email Deliverability Smoke Test

After any feature that sends transactional email:
1. **Send test email** — trigger the flow with test data, verify Resend API returns 200
2. **Check email content** — verify subject line, body, and any dynamic fields render correctly (no `{undefined}` or `{null}`)
3. **Verify unsubscribe link** — if present, confirm it works and is CAN-SPAM compliant

## Graceful Degradation Tests

For every third-party dependency (Stripe, Turnstile, analytics, maps):
1. **Script blocked** — block the CDN URL, verify page loads without JS errors and shows fallback
2. **Slow load** — throttle to 3G, verify the page is usable before third-party scripts finish
3. **API timeout** — mock a 10s timeout on the API call, verify the UI shows a timeout message (not infinite spinner)

## Form Testing Matrix (auto-generate for every form)

For EVERY `<form>` element found on the page, generate these 8 tests:

1. **Empty submission** — submit with all fields empty, verify error messages
2. **Invalid email** — submit with "notanemail", verify email validation
3. **XSS injection** — submit `<script>alert(1)</script>` in text fields, verify sanitization
4. **Max-length boundary** — submit 5001-char message, verify truncation/rejection
5. **Success path** — submit valid data, verify success message + form reset
6. **Error display** — verify errors appear inline near the field, not just alert()
7. **Loading state** — verify button shows "Sending..." and is disabled during submission
8. **Double-submit** — click submit twice rapidly, verify only one submission processes

## Breakpoint Test Matrix

Every visual test runs at ALL 6 widths:
```typescript
const BREAKPOINTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
```

## Content Integrity Checks
- No text containing: "Lorem", "ipsum", "TBD", "TODO", "placeholder", "coming soon"
- No images with naturalWidth === 0 (broken)
- No empty sections (sections with no visible text content)
- No orphaned grid items (last row should be centered if incomplete)

## Lighthouse (Report, Don't Block)
Run Lighthouse and report score. For multimedia-heavy pages (video backgrounds,
multiple maps, high-res images), scores below 90 are EXPECTED and acceptable.
The priority order is: multimedia richness > Lighthouse score.
Report the score for tracking but never block a deploy for it.

## SEO Audit (MANDATORY — skill 28)
Run on every deploy alongside the quality gate:
```typescript
test('SEO audit', async ({ page }) => {
  await page.goto(PROD_URL);
  // Title: 50-60 chars, contains primary keyword
  const title = await page.title();
  expect(title.length).toBeGreaterThanOrEqual(30);
  expect(title.length).toBeLessThanOrEqual(65);
  // Meta description: 120-160 chars
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc!.length).toBeGreaterThanOrEqual(120);
  expect(desc!.length).toBeLessThanOrEqual(160);
  // Exactly one H1
  expect(await page.locator('h1').count()).toBe(1);
  // Canonical URL set
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBeTruthy();
  // OG tags present
  expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy();
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBeTruthy();
  // JSON-LD structured data
  expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(1);
  // Internal links (2+ minimum)
  expect(await page.locator('a[href^="/"]').count()).toBeGreaterThanOrEqual(2);
  // Images have alt text
  const imgs = await page.locator('img').count();
  const alts = await page.locator('img[alt]:not([alt=""])').count();
  // Allow decorative images with alt="" but flag completely missing alt
  const noAlt = await page.locator('img:not([alt])').count();
  expect(noAlt).toBe(0);
});
```

## Readability Check (Flesch >= 60)
After deploy, check all user-facing text:
```typescript
test('readability check', async ({ page }) => {
  await page.goto(PROD_URL);
  const text = await page.locator('main').textContent();
  // Quick heuristic: avg words per sentence
  const sentences = text!.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const words = text!.split(/\s+/).filter(w => w.length > 0);
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  // Avg sentence length should be under 20 words (Flesch 60+ territory)
  expect(avgSentenceLength).toBeLessThan(22);
});
```

## Documentation Sync Check (skill 29)
After code changes, verify docs are current:
- CLAUDE.md references no deleted files
- README.md features list matches actual features
- No stale TODO comments without issue links
- Code comments match current behavior

---

## Enhancement: Core Web Vitals 2026 Targets (Source: web.dev)

### Updated Performance Thresholds
| Metric | Good | Needs Improvement | Poor |
|--------|------|--------------------|------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 |

**INP replaced FID as a Core Web Vital.** Every Emdash project must now test INP, not just FID.

### INP Verification Test
```typescript
test('INP - interaction responsiveness', async ({ page }) => {
  await page.goto(PROD_URL);
  // Click primary CTA and measure response time
  const startTime = Date.now();
  await page.locator('[data-cta-primary]').first().click();
  await page.waitForFunction(() => {
    // Wait for visual update (next paint)
    return new Promise(resolve => requestAnimationFrame(resolve));
  });
  const elapsed = Date.now() - startTime;
  expect(elapsed).toBeLessThan(200); // Good INP threshold
});
```

### Performance Test (Add to Every Quality Gate)
```typescript
test('Core Web Vitals pass', async ({ page }) => {
  await page.goto(PROD_URL);
  const metrics = await page.evaluate(() => {
    return new Promise(resolve => {
      new PerformanceObserver(list => {
        const lcp = list.getEntries().find(e => e.entryType === 'largest-contentful-paint');
        resolve({ lcp: lcp?.startTime });
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
  });
  expect((metrics as any).lcp).toBeLessThan(2500);
});
```

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

Save the full 7-check gate for feature completions and deployments. This reduces verification time from ~10 minutes to ~2 minutes for trivial fixes.

## Test Generation Shortcuts

For common patterns, generate tests from templates instead of writing from scratch:

| Pattern | Template |
|---------|----------|
| New page | Homepage test adapted with new URL + title + H1 |
| New form | 8-point form matrix from above (copy + customize) |
| New API endpoint | POST valid data → 200, POST invalid → 400, GET missing → 404 |
| Visual regression | Screenshot at BREAKPOINTS (see CONVENTIONS.md) + compare |
| Auth-protected route | Unauthenticated → 401, wrong role → 403, valid → 200 |

## Note on Shared Constants
Breakpoints, CSP headers, and other shared values are defined in CONVENTIONS.md. Reference them there instead of duplicating in test files.

---

## AI Visual Inspection Loop (MANDATORY on Every Deploy)

### The Loop: Screenshot → AI Critique → Fix → Re-Screenshot → Verify

Every deployment triggers this loop until the AI has zero remaining critiques:

```
1. Deploy to production
2. Take Playwright screenshots at all 6 breakpoints
3. AI reads each screenshot (using Read tool on the image file)
4. AI critiques: layout, typography, spacing, color, broken elements, alignment
5. If issues found → fix them → re-deploy → goto step 2
6. If no issues → proceed to TDD verification
```

### Screenshot Capture Template
```typescript
const BREAKPOINTS = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'iPhone-14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad-Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

// Capture ALL pages at ALL breakpoints
async function captureAllScreenshots(page: Page, pages: string[], outputDir: string) {
  for (const route of pages) {
    await page.goto(`${PROD_URL}${route}`);
    await page.waitForLoadState('networkidle');
    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(300); // Let animations settle
      await page.screenshot({
        path: `${outputDir}/${route.replace(/\//g, '_')}_${bp.name}.png`,
        fullPage: true,
      });
    }
  }
}
```

### AI Critique Protocol
For each screenshot, the AI inspects for:

**Layout Issues:**
- Horizontal overflow (elements wider than viewport)
- Overlapping text or elements
- Broken grid alignment
- Footer not at page bottom
- Content cut off at viewport edges
- Uneven spacing between sections

**Typography Issues:**
- Text too small to read (< 14px on mobile)
- Line length too long (> 75 characters)
- Poor contrast (text blending with background)
- Inconsistent font usage
- Orphaned words or widows in headings

**Visual Quality:**
- Broken or missing images
- Blurry or pixelated images
- Inconsistent padding/margins
- Missing hover/focus states (check interactive elements)
- Brand color inconsistency
- Generic/AI-slop appearance

**Functional Issues:**
- Missing navigation elements
- Missing footer
- Missing CTA buttons
- Forms without labels
- Buttons without visible text

### AI Browser Interaction Testing (Stagehand)
For AI-driven browser interaction testing, use Stagehand (22K+ stars, browserbase/stagehand) alongside Playwright MCP. Stagehand adds three AI primitives -- `act()`, `extract()`, `observe()` -- on top of a standard Playwright page object. It uses accessibility trees (not screenshots) for 10-100x faster, 4x cheaper testing than vision-based approaches. Use Playwright for the 80% of predictable steps and Stagehand for the 20% requiring AI understanding (dynamic content, layout changes, natural-language assertions).

### Critique → Fix → Verify Cycle
```
MAX_CRITIQUE_ROUNDS = 3

for round in 1..MAX_CRITIQUE_ROUNDS:
  screenshots = capture_all_screenshots()
  critiques = ai_inspect_each_screenshot(screenshots)

  if critiques.length == 0:
    break  # Perfect — move on

  for critique in critiques:
    implement_fix(critique)

  deploy()
  purge_cache()

# After 3 rounds, report remaining issues but don't block
```

---

## Multi-Pass Verification Protocol (5 sequential passes — ALL must pass)

After the AI visual inspection loop completes, run these 5 verification passes in order. A deployment is not "done" until all 5 pass. Each pass catches a different failure class.

### Pass 1: Functional Verification
- Every route returns 200 (or correct status code)
- Every form submits and shows success/error states
- Every interactive element responds to click/tap/keyboard
- Every API endpoint returns valid data with correct Zod-validated shape
- E2E test suite is green — zero failures, zero flaky tests

### Pass 2: Visual Verification
- AI screenshot critique at 1280px + 375px (minimum) finds zero layout issues
- No horizontal overflow, no overlapping elements, no orphaned content
- Typography hierarchy is clear; brand colors are consistent throughout
- The page passes the "agency test" — would a top-tier design firm ship this?

### Pass 3: Content Verification
- Zero placeholder text (Lorem, TBD, TODO, "coming soon", sample data)
- All copy is specific to this product — not generic marketing filler
- Microcopy is complete: button labels, empty states, error messages, tooltips
- Alt text on every image; meta descriptions on every page
- Reading level Flesch >= 60 on all user-facing text

### Pass 4: Technical Verification
- Lighthouse Performance >= 90 (report, don't block for multimedia-heavy)
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- SEO: title + meta desc + H1 + canonical + JSON-LD + OG tags on every page
- Accessibility: skip link, ARIA landmarks, focus rings, 4.5:1 contrast, axe-core clean
- Security: CSP headers, Zod on all inputs, no eval/innerHTML, secrets in wrangler secrets

### Pass 5: Business & Psychology Verification
- Does the product serve the user's actual need? (not just technically correct — genuinely useful)
- Is the conversion path clear? (CTA visible, value proposition above fold, friction removed)
- Peak-End Rule: is the last interaction as good as the first? (success page, confirmation email, next step)
- Social proof present where appropriate (testimonials, trust badges, usage stats)
- Ethical persuasion only — no dark patterns, no fake urgency, no manipulative copy

### Pass Failure Protocol
If any pass fails: fix the issues, re-deploy, re-run that pass and all subsequent passes. Do not skip ahead.

---

## Full-Application TDD Verification (Test User Simulation)

### The Test User
Every application has a synthetic "test user" that walks through the ENTIRE product:

```typescript
// e2e/full-journey.spec.ts — THE test that proves everything works
import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL;

test.describe('Full Application Journey (Test User)', () => {

  test('1. Homepage loads and looks correct', async ({ page }) => {
    await page.goto(PROD_URL!);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    // No console errors
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.waitForTimeout(1000);
    expect(errors).toEqual([]);
  });

  test('2. Navigation works — every link resolves', async ({ page }) => {
    await page.goto(PROD_URL!);
    const links = await page.locator('nav a[href]').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue;
      const url = href.startsWith('http') ? href : `${PROD_URL}${href}`;
      const res = await page.request.get(url);
      expect(res.status(), `Link ${href} returned ${res.status()}`).toBeLessThan(400);
    }
  });

  test('3. All images load', async ({ page }) => {
    await page.goto(PROD_URL!);
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const complete = await img.evaluate(el => (el as HTMLImageElement).complete);
      const natW = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
      const src = await img.getAttribute('src');
      expect(complete, `Image not loaded: ${src}`).toBe(true);
      expect(natW, `Broken image (0 width): ${src}`).toBeGreaterThan(0);
    }
  });

  test('4. Contact form submits successfully', async ({ page }) => {
    await page.goto(`${PROD_URL}/contact`);
    // Skip if no contact page
    if (page.url().includes('404')) return;
    await page.fill('input[name="name"], #name', 'Playwright Test User');
    await page.fill('input[type="email"], #email', 'test@playwright.dev');
    await page.fill('textarea, #message', 'Automated test submission — please ignore.');
    // Check for Turnstile and skip submit if present (can't solve in test)
    const hasTurnstile = await page.locator('.cf-turnstile').count();
    if (hasTurnstile === 0) {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
      // Verify success state or no error
      const error = page.locator('.error, [class*="error"]');
      expect(await error.count()).toBe(0);
    }
  });

  test('5. Mobile responsive — no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PROD_URL!);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test('6. Keyboard navigation reaches main CTA', async ({ page }) => {
    await page.goto(PROD_URL!);
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag === 'BUTTON' || tag === 'A') return; // Reached interactive element
    }
    throw new Error('Keyboard trap — could not reach any interactive element in 30 tabs');
  });

  test('7. SEO essentials present', async ({ page }) => {
    await page.goto(PROD_URL!);
    // Title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    // Meta description
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    // H1
    expect(await page.locator('h1').count()).toBe(1);
    // JSON-LD
    expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThanOrEqual(1);
    // OG image
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBeTruthy();
  });

  test('8. Performance — page loads under 3s', async ({ page }) => {
    const start = Date.now();
    await page.goto(PROD_URL!, { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test('9. No placeholder content', async ({ page }) => {
    await page.goto(PROD_URL!);
    const text = await page.locator('body').textContent();
    const banned = ['Lorem', 'ipsum', 'TODO', 'FIXME', 'placeholder', 'coming soon', 'TBD'];
    for (const word of banned) {
      expect(text!.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });

  test('10. Error pages are branded', async ({ page }) => {
    const res = await page.goto(`${PROD_URL}/this-page-absolutely-does-not-exist-xyz`);
    expect(res?.status()).toBe(404);
    // Should NOT be browser default — check for brand elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('a[href="/"]')).toBeVisible();
  });
});
```

### Completion-Driven Execution
Every prompt should drive toward this test suite passing 100%. The workflow is:

```
1. Build/modify code
2. Deploy to production
3. Run full-journey.spec.ts against PROD_URL
4. Any failures → fix the code → re-deploy → re-run
5. All pass → take screenshots at all breakpoints
6. AI visually inspect screenshots
7. Any critiques → fix → re-deploy → re-screenshot
8. Zero critiques + all tests green = DONE
```

This means every prompt ends with a verified, visually inspected, fully tested production site.

### Assumption Protocol (When Answers Are Needed)
When the AI needs information to proceed:
1. **Can it be inferred?** (from domain name, project type, existing code) → infer and proceed
2. **Is it a default?** (from CONVENTIONS.md, SKILL_PROFILES.md) → use the default
3. **Is it blocking?** (API key, domain name, billing decision) → ask casually, provide the default:
   ```
   Quick question — should this be a donation site or a SaaS product?
   I'm going with donation site based on the domain name.
   Let me know if that's wrong, otherwise I'll keep building.
   ```
4. **Never block on non-critical decisions.** Make the best assumption, document it, keep going.

---

## Adversarial Testing (Try to Break It)

After all standard tests pass, run adversarial tests that actively try to break the application. Think like a malicious user, a confused user, and a user on a terrible connection.

### Edge Case Generator
```typescript
test.describe('Adversarial Tests', () => {
  test('Rapid navigation — click every link within 2 seconds', async ({ page }) => {
    await page.goto(PROD_URL!);
    const links = await page.locator('a[href]').all();
    for (const link of links.slice(0, 10)) {
      await link.click({ timeout: 1000 }).catch(() => {}); // Don't wait
      await page.goBack().catch(() => {});
    }
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('Resize storm — rapidly change viewport', async ({ page }) => {
    await page.goto(PROD_URL!);
    for (const w of [375, 1920, 768, 320, 1280, 414]) {
      await page.setViewportSize({ width: w, height: 800 });
      await page.waitForTimeout(100);
    }
    // No JS errors after resize storm
    const errors: string[] = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });

  test('Network offline resilience', async ({ page, context }) => {
    await page.goto(PROD_URL!);
    await context.setOffline(true);
    // Click around — should show offline state, not crash
    await page.click('nav a').catch(() => {});
    await context.setOffline(false);
    await page.reload();
    await expect(page.locator('body')).toBeVisible();
  });

  test('Unicode bomb in all inputs', async ({ page }) => {
    await page.goto(PROD_URL!);
    const inputs = await page.locator('input[type="text"], textarea').all();
    for (const input of inputs) {
      await input.fill('𝕳𝖊𝖑𝖑𝖔 🎭 <script>alert(1)</script> \x00\x01\x02 émojis 中文 العربية');
      // Should not crash
    }
  });

  test('Back button after form submit', async ({ page }) => {
    await page.goto(PROD_URL!);
    // Navigate to a form page
    const formLink = page.locator('a[href*="contact"], a[href*="donate"]').first();
    if (await formLink.count() > 0) {
      await formLink.click();
      await page.goBack();
      await page.goForward();
      // Should not show resubmit warning or break
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
```

### Chaos Testing Checklist
```
[ ] What happens with JavaScript disabled? (content still readable?)
[ ] What happens at 2G speed? (anything useful within 10 seconds?)
[ ] What happens with 200% font scaling? (nothing overflows?)
[ ] What happens if every image fails to load? (alt text visible? Layout intact?)
[ ] What happens if third-party scripts fail? (YouTube, Maps, Stripe, GTM)
[ ] What happens at 320px viewport? (the smallest real phone)
[ ] What if the user triple-clicks text? (selection doesn't break layout?)
[ ] What if cookies/localStorage are blocked? (graceful fallback?)
```

---

## AI Visual Critique via GPT-4o Vision

For design critique beyond layout checking, use GPT-4o Vision to evaluate screenshots with a structured prompt:

### Visual Critique Prompt Template
```
Analyze this website screenshot. Score 1-10 on each:

1. VISUAL HIERARCHY: Is the most important element immediately obvious?
2. TYPOGRAPHY: Is text readable, consistent, and well-spaced?
3. COLOR HARMONY: Do colors work together and match the brand?
4. SPACING RHYTHM: Is whitespace consistent and intentional?
5. INTERACTION SIGNALS: Can you tell what's clickable?
6. MOBILE READINESS: Would this work on a phone?
7. TRUST SIGNALS: Does this feel professional and trustworthy?
8. ANTI-SLOP: Does this look AI-generated or human-crafted?

For any score below 8, provide a specific CSS fix.
Return as JSON: { scores: { ... }, fixes: [ { issue, css } ] }
```

### Integration Pattern
```typescript
async function aiVisualCritique(screenshotPath: string): Promise<CritiqueResult> {
  const imageData = fs.readFileSync(screenshotPath, { encoding: 'base64' });
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getSecret('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: VISUAL_CRITIQUE_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageData}` } },
        ],
      }],
      response_format: { type: 'json_object' },
    }),
  });
  return response.json();
}
```

### When to Use Vision vs Accessibility Tree
| Check | Use Vision (GPT-4o) | Use Accessibility Tree (Stagehand/MCP) |
|-------|---------------------|---------------------------------------|
| Does it look good? | ✅ | ❌ |
| Is the layout broken? | ✅ | ❌ |
| Does the button work? | ❌ | ✅ |
| Is the color on-brand? | ✅ | ❌ |
| Can a screen reader use it? | ❌ | ✅ |
| Is there visual hierarchy? | ✅ | ❌ |
| Does the form submit? | ❌ | ✅ |
| Would Apple approve this? | ✅ | ❌ |

**Use both.** Stagehand for functional verification (fast, cheap). GPT-4o Vision for aesthetic critique (slower, costs ~$0.01/screenshot).
