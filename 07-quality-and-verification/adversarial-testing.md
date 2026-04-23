---
name: "Adversarial Testing"
description: "Stress tests that break apps: rapid nav, resize storms, offline resilience, Unicode bombs, back-button edge cases, chaos engineering patterns, D1/latency injection."
updated: "2026-04-23"
---
# Adversarial Testing
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

## Chaos Engineering Patterns

### Random Latency Injection (Workers/D1)
```typescript
// Simulate random 200-2000ms latency on any fetch — tests timeout handling
test('tolerates random latency spikes', async ({ page, context }) => {
  await context.route('**/api/**', async route => {
    const delay = Math.random() * 1800 + 200; // 200-2000ms random
    await new Promise(r => setTimeout(r, delay));
    await route.continue();
  });
  await page.goto(PROD_URL!);
  // UI must show loading state, not blank or crash
  await expect(page.locator('[data-testid="loading"], [aria-busy="true"], .skeleton')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('undefined');
});
```

### D1 Connection Drop Simulation
```typescript
// Simulate D1 returning 500 — verify graceful error state (not crash)
test('D1 connection failure shows error boundary', async ({ page, context }) => {
  await context.route('**/api/**', route => route.fulfill({ status: 503, body: JSON.stringify({ error: 'DB unavailable', code: 'D1_ERROR' }) }));
  await page.goto(PROD_URL!);
  // Should show error boundary, not white screen
  const errorState = page.locator('[data-testid="error-boundary"], .error-state, [role="alert"]');
  await expect(errorState).toBeVisible({ timeout: 5000 });
  // Retry button must exist
  await expect(page.locator('button:has-text("Retry"), button:has-text("Try again")')).toBeVisible();
});

// Simulate D1 partial failure — batch returns mixed results
test('partial D1 batch failure handled gracefully', async ({ page, context }) => {
  let callCount = 0;
  await context.route('**/api/**', async route => {
    callCount++;
    if (callCount % 3 === 0) { // Every 3rd call fails
      await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Batch stmt failed' }) });
    } else {
      await route.continue();
    }
  });
  await page.goto(PROD_URL!);
  // Page remains functional despite intermittent failures
  await expect(page.locator('h1')).toBeVisible();
});
```

### Stripe/Payment Chaos
```typescript
// Simulate Stripe.js failing to load
test('payment page usable when Stripe.js blocked', async ({ page, context }) => {
  await context.route('**/js.stripe.com/**', route => route.abort());
  await page.goto(`${PROD_URL}/checkout`);
  // Must show fallback message, not crash or blank form
  await expect(page.locator('body')).not.toContainText('Cannot read properties');
  await expect(page.locator('[data-testid="payment-unavailable"], .stripe-fallback')).toBeVisible();
});
```
