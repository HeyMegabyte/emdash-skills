---
name: "Custom Error Pages"
version: "2.0.0"
updated: "2026-04-23"
description: "Beautiful branded error pages for every HTTP status: 404 (not found), 500 (server error), 503 (maintenance), and offline (PWA). Dark theme, brand colors, helpful navigation, Easter egg energy. Never show browser defaults. Auto-generated from site brand on every project."
---

# Custom Error Pages
## Required Error Pages (EVERY site)
### 404 — Not Found
The most common error. Must be helpful, not dead-end.

```typescript
app.notFound((c) => {
  return c.html(render404(c.req.path), 404);
});
```

**Design requirements:**
- Brand colors, logo, and typography
- Animated element (floating orbs, particle effect — reuse from domain provisioning)
- "This page doesn't exist" headline (friendly, not technical)
- Search box if site has search (06/site-search)
- 3-4 links to popular pages
- "Go home" CTA button
- Easter egg opportunity (06/easter-eggs)

### 500 — Server Error
```typescript
app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.path}:`, err);
  c.env.SENTRY?.captureException(err);
  return c.html(render500(), 500);
});
```

**Design requirements:**
- "Something broke on our end" (never blame the user)
- "We've been notified" (because Sentry captures it)
- Contact email link
- "Try again" button + "Go home" link
- No technical details exposed to user

### 503 — Maintenance
```typescript
// Optional: manual maintenance mode via KV flag
app.use('*', async (c, next) => {
  const maintenance = await c.env.KV.get('maintenance');
  if (maintenance === 'true') return c.html(render503(), 503);
  await next();
});
```

**Design requirements:**
- "We're upgrading" (not "site is down")
- Estimated return time if known
- Newsletter signup to get notified
- Social links

### Offline — PWA Fallback
```html
<!-- /offline.html — cached by service worker -->
<html>
<head><title>Offline — Brand</title></head>
<body>
  <h1>You're offline</h1>
  <p>Check your connection and try again.</p>
  <button onclick="location.reload()">Retry</button>
</body>
</html>
```

## HTML Template (404 Example)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Not Found — Brand</title>
  <meta name="robots" content="noindex">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Sora', -apple-system, sans-serif;
      background: #060610;
      color: #f0f0f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .container { max-width: 560px; }
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: clamp(2rem, 5vw, 3.5rem);
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #00E5FF, #50AAE3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { color: #a0a0b5; font-size: 1.125rem; line-height: 1.6; margin-bottom: 2rem; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #00E5FF, #50AAE3);
      color: #060610;
      font-weight: 600;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      transition: opacity 0.2s;
    }
    .btn:hover { opacity: 0.9; }
    .links { margin-top: 2rem; display: flex; gap: 1.5rem; justify-content: center; flex-wrap: wrap; }
    .links a { color: #50AAE3; text-decoration: none; }
    .links a:hover { text-decoration: underline; }
    .code { font-size: 8rem; font-weight: 700; opacity: 0.05; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }
  </style>
</head>
<body>
  <div class="code">404</div>
  <div class="container">
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="btn">Go Home</a>
    <div class="links">
      <a href="/about">About</a>
      <a href="/pricing">Pricing</a>
      <a href="/contact">Contact</a>
    </div>
  </div>
</body>
</html>
```

## Playwright Test
```typescript
test('404 page is branded', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist-abc123');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('a[href="/"]')).toBeVisible();
  // Not browser default
  const body = await page.locator('body').getAttribute('style');
  expect(await page.title()).not.toContain('Not Found');
});
```
