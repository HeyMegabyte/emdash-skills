---
name: "TDD Verification"
description: "Full-application test user simulation. 10-point journey test that proves everything works. Completion-driven execution workflow and assumption protocol for blocking decisions."
---

# TDD Verification (Test User Simulation)

> **Purpose**: Every application has a synthetic "test user" that walks through the ENTIRE product, proving everything works end-to-end against production.

## The Test User

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

## Completion-Driven Execution

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

## Assumption Protocol (When Answers Are Needed)

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
