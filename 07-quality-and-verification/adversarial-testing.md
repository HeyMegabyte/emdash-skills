---
name: "Adversarial Testing"
description: "Stress tests that actively try to break the application. Rapid navigation, resize storms, network offline resilience, Unicode bombs, back-button edge cases, and chaos testing checklist."
---

# Adversarial Testing

> **Purpose**: After all standard tests pass, run adversarial tests that actively try to break the application. Think like a malicious user, a confused user, and a user on a terrible connection.

## Edge Case Generator
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

## Chaos Testing Checklist
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
