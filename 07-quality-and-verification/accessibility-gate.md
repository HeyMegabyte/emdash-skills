---
name: "Accessibility Gate"
description: "Automated WCAG AA accessibility audit via axe-core + Playwright on every deployment. Beautiful focus styling (2px solid cyan, 3px offset). Checks: skip-to-content link, alt text, input labels, 4.5:1 contrast, keyboard navigation, ARIA landmarks, lang attribute, prefers-reduced-motion, and screen reader compatibility."---

# Accessibility Gate

> Accessibility is not a feature — it's a requirement. WCAG AA minimum on every project.

---

## Why This Matters

- **1 in 4 US adults** has a disability (Source: CDC)
- **71% of disabled users** leave websites that aren't accessible (Source: Click-Away Pound)
- **Legal risk:** ADA lawsuits increased 320% from 2018-2023 (Source: UsableNet)
- **SEO benefit:** accessible sites rank higher (semantic HTML, alt text, headings)
- **Brian's ethos:** employing disabled/paraplegic people is a higher pursuit — our sites must be usable by everyone

## Automated Audit (EVERY Deploy)

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

for (const bp of BREAKPOINTS) {
  test(`a11y audit at ${bp.name} (${bp.width}px)`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Report violations with details
    if (results.violations.length > 0) {
      console.log('A11y violations:');
      results.violations.forEach(v => {
        console.log(`  [${v.impact}] ${v.id}: ${v.description}`);
        v.nodes.forEach(n => console.log(`    → ${n.html.substring(0, 80)}`));
      });
    }

    expect(results.violations).toHaveLength(0);
  });
}
```

## Focus Styling (MUST Be Beautiful)

```css
/* Skip-to-content link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent-cyan, #00E5FF);
  color: #060610;
  padding: 0.75rem 1.5rem;
  border-radius: 0 0 8px 8px;
  font-weight: 600;
  z-index: 10000;
  transition: top 0.2s ease;
}

.skip-link:focus {
  top: 0;
}

/* Focus rings — beautiful, not just functional */
*:focus-visible {
  outline: 2px solid var(--accent-cyan, #00E5FF);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Remove default outline only when focus-visible is supported */
*:focus:not(:focus-visible) {
  outline: none;
}

/* High-contrast focus for dark backgrounds */
.dark-bg *:focus-visible {
  outline-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.3);
}
```

## HTML Requirements

```html
<!-- Language -->
<html lang="en">

<!-- Skip link (first element in body) -->
<a href="#main" class="skip-link">Skip to content</a>

<!-- Landmarks -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">...</nav>
</header>
<main id="main" role="main">...</main>
<footer role="contentinfo">...</footer>

<!-- Images -->
<img src="hero.webp" alt="Volunteers serving meals at St. John's Soup Kitchen" width="1200" height="630">
<!-- Decorative images -->
<img src="divider.svg" alt="" role="presentation">

<!-- Forms -->
<label for="email">Your email</label>
<input id="email" type="email" required aria-describedby="email-help">
<span id="email-help">We'll never share your email.</span>

<!-- Headings (never skip levels) -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
```

## Keyboard Navigation Test

```typescript
test('keyboard navigation works', async ({ page }) => {
  await page.goto('/');

  // Tab through all interactive elements
  const focusableSelector = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const elements = await page.locator(focusableSelector).all();

  for (const el of elements) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    // Verify something is focused (not stuck)
    expect(focused).not.toBe('BODY');
  }
});

test('escape closes modals and overlays', async ({ page }) => {
  await page.goto('/');
  // If there's a modal trigger, test ESC behavior
  const modalTrigger = page.locator('[data-modal]').first();
  if (await modalTrigger.count() > 0) {
    await modalTrigger.click();
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  }
});
```

## Color Contrast Verification

```typescript
test('text has sufficient contrast', async ({ page }) => {
  await page.goto('/');

  // Check all text elements for WCAG AA contrast (4.5:1 for normal, 3:1 for large)
  const lowContrast = await page.evaluate(() => {
    const issues: string[] = [];
    document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, li, td, th, label, button').forEach(el => {
      const style = getComputedStyle(el);
      const text = el.textContent?.trim();
      if (!text) return;
      // Check if text is visible
      if (style.opacity === '0' || style.display === 'none' || style.visibility === 'hidden') return;
      // Flag if color is too close to background (basic check)
      if (style.color === style.backgroundColor) {
        issues.push(`${el.tagName}: same fg/bg color`);
      }
    });
    return issues;
  });

  expect(lowContrast).toHaveLength(0);
});
```

## Reduced Motion

```typescript
test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  // Verify no CSS animations are running
  const runningAnimations = await page.evaluate(() =>
    document.getAnimations().filter(a => a.playState === 'running').length
  );
  expect(runningAnimations).toBe(0);

  // Verify scroll reveals are pre-visible (not hidden waiting for animation)
  const hiddenReveals = await page.evaluate(() =>
    [...document.querySelectorAll('[data-animate]')].filter(
      el => getComputedStyle(el).opacity === '0'
    ).length
  );
  expect(hiddenReveals).toBe(0);
});
```

## Screen Reader Checklist
```
[ ] All interactive elements have accessible names
[ ] Form errors are announced via aria-live="polite"
[ ] Dynamic content changes use aria-live regions
[ ] Images have descriptive alt text (not "image" or filename)
[ ] Decorative images have alt="" and role="presentation"
[ ] Tables have scope attributes on headers
[ ] Links describe their destination (not "click here")
[ ] Buttons describe their action (not "submit")
[ ] Page title includes current page name + brand
[ ] Heading hierarchy is logical (h1 → h2 → h3)
```

## Full Checklist (EVERY Deploy)
```
[ ] Skip-to-content link present and functional
[ ] All images have meaningful alt text
[ ] All form inputs have associated labels (label element or aria-label)
[ ] Color contrast >= 4.5:1 (body text) and >= 3:1 (large text)
[ ] All interactive elements keyboard-accessible
[ ] Focus rings visible and beautiful (not browser default)
[ ] ARIA landmarks present (header/aside, nav, main, footer)
[ ] lang attribute on <html>
[ ] prefers-reduced-motion respected
[ ] axe-core audit passes with 0 violations
[ ] Tab order is logical (follows visual layout)
[ ] No keyboard traps (user can always Tab out)
[ ] Touch targets >= 44x44px on mobile
[ ] All iframes have title attributes
[ ] Buttons with icons have aria-label
[ ] Toggle/radio buttons use aria-checked or aria-pressed
[ ] Decorative elements use aria-hidden="true"
```

## ENFORCEMENT: Automated Playwright Tests (MANDATORY)

**Every website deployed through Emdash MUST include a Playwright accessibility test file.**
This is NOT optional. If the test file doesn't exist, create it during the build step.

The test file MUST verify at minimum:
1. `lang` attribute on `<html>`
2. Skip link exists and is focusable
3. Semantic landmarks (`<main>`, `<nav>`, `<header>`/`<aside>`, `<footer>`)
4. All interactive elements reachable via keyboard (Tab)
5. `focus-visible` CSS styles are defined
6. `prefers-reduced-motion` media query exists
7. All visible iframes have `title` attributes
8. Form inputs have accessible labels
9. Buttons have accessible names (text content or `aria-label`)
10. No identical `fg`/`bg` colors on text

**Why this is mandatory:** Accessibility regressions have happened multiple times across
mission.megabyte.space and donate.megabyte.space — each time requiring manual re-audit.
Automated tests catch regressions at deploy time, not after users hit them.

### Template (copy into `e2e/a11y.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

const SITE_URL = 'https://YOUR_SITE.megabyte.space';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => { await page.goto(SITE_URL); });

  test('html has lang', async ({ page }) => {
    expect(await page.locator('html').getAttribute('lang')).toBe('en');
  });

  test('skip link exists', async ({ page }) => {
    await expect(page.locator('.skip-link')).toBeAttached();
  });

  test('main landmark', async ({ page }) => {
    await expect(page.locator('main')).toHaveCount(1);
  });

  test('focus-visible defined', async ({ page }) => {
    const has = await page.evaluate(() => {
      for (const s of document.styleSheets) {
        try { for (const r of s.cssRules) if (r.cssText?.includes('focus-visible')) return true; } catch {}
      }
      return false;
    });
    expect(has).toBe(true);
  });

  test('reduced motion defined', async ({ page }) => {
    const has = await page.evaluate(() => {
      for (const s of document.styleSheets) {
        try { for (const r of s.cssRules) if (r.cssText?.includes('prefers-reduced-motion')) return true; } catch {}
      }
      return false;
    });
    expect(has).toBe(true);
  });

  test('keyboard reaches main CTA', async ({ page }) => {
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag === 'BUTTON' || tag === 'A') return; // reached an interactive element
    }
    expect(false).toBe(true); // keyboard trap
  });
});
```

---

## Enhancement: 2026 Accessibility Landscape (Source: WebAIM, UsableNet, web.dev)

### Legal Compliance Deadline (CRITICAL)
**April 24, 2026:** US local governments with population 50,000+ must ensure web content and mobile apps meet accessibility requirements. This is driving a wave of enterprise accessibility audits and vendor requirements. Every Emdash site being WCAG AA compliant is now a legal and business advantage.

### Key 2026 Statistics
- 68% of web developers have received accessibility training (up from ~40% in 2022)
- 90% of UX teams plan to make accessibility a key focus by 2026
- ADA web accessibility lawsuits continue to increase year over year
- Accessibility is increasingly viewed as an indicator of overall system quality

### Design for AI Agents (Source: NNGroup, April 2026)
AI agents now interact with digital interfaces alongside humans. Accessibility best practices serve BOTH audiences:
- **Semantic HTML** = screen readers AND AI agents can parse content
- **ARIA landmarks** = assistive tech AND agent navigation
- **Structured data (JSON-LD)** = SEO AND agent comprehension
- **API-first architecture** = programmatic AND human access
- **Alt text on images** = blind users AND multimodal AI understanding

**New checklist item for every project:**
```
[ ] Site is navigable by AI agents (semantic HTML, structured data, no CAPTCHA-only gates)
[ ] API endpoints return structured data (not just rendered HTML)
```

### Font Optimization for Accessibility (Source: Enepsters, 2026)
- Use `font-display: swap` to prevent invisible text during load
- Subset fonts to reduce payload (Latin subset typically sufficient)
- Ensure minimum 16px body text (our `--text-base` clamp already handles this)
- Test with browser zoom at 200% — layout must not break
- `prefers-contrast: more` media query for high-contrast mode support
