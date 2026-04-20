---
name: "Performance Optimization"
layer: product-compiler
description: "Canonical owner of Core Web Vitals, JS/CSS budgets, image optimization, lazy loading, font loading strategy, preconnect/prefetch, code splitting, tree shaking, and compression. Ensures every deploy meets performance thresholds before shipping."
triggers:
  task-types: [build, fix, deploy]
  file-patterns: ["src/**/*.ts", "src/**/*.css", "wrangler.toml", "vite.config.*", "angular.json"]
always-load: false
canonical-owner-of:
  - Core Web Vitals (LCP, INP, CLS)
  - JavaScript and CSS bundle budgets
  - Image optimization pipeline
  - Lazy loading strategy
  - Font loading and FOIT/FOUT prevention
  - Resource hints (preconnect, prefetch, preload)
  - Code splitting and dynamic imports
  - Tree shaking verification
  - Compression (Brotli, gzip)
  - Worker CPU time budgets
---

# 21 — Performance Optimization

> Fast is a feature. Every millisecond of delay costs conversions.

---

## Core Principle

**Performance is not an optimization pass — it is a constraint applied to every line of code.** A fast site that looks mediocre beats a gorgeous site that loads in 5 seconds. Ship under budget every time. Measure in production, not just dev tools.

---

## Canonical Definitions

### Core Web Vitals Targets (2026)

| Metric | Good | Needs Work | Poor | Our Target |
|--------|------|------------|------|------------|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5-4.0s | > 4.0s | < 2.0s |
| **INP** (Interaction to Next Paint) | < 200ms | 200-500ms | > 500ms | < 100ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1-0.25 | > 0.25 | < 0.05 |

INP replaced FID as a Core Web Vital. Every project tests INP, not FID.

### Bundle Budgets

| Asset Type | Budget | Hard Limit |
|-----------|--------|------------|
| Worker script (total) | 500KB | 1MB (free), 10MB (paid) |
| Initial JS (frontend) | 150KB gzipped | 250KB gzipped |
| Initial CSS | 50KB gzipped | 80KB gzipped |
| Per-route lazy chunk | 50KB gzipped | 100KB gzipped |
| Total page weight | 800KB | 1.5MB |
| Hero image | 100KB | 200KB |
| Any single image | 150KB | 200KB |
| Web font (per family) | 50KB | 80KB |

### Image Optimization Targets

| Format | Quality | Max Size | Use Case |
|--------|---------|----------|----------|
| WebP (photo) | 80% | 200KB | All photographs |
| WebP (illustration) | 90% | 150KB | Graphics, diagrams |
| AVIF (photo) | 65% | 150KB | Modern browsers (with WebP fallback) |
| PNG (logo/icon) | Lossless | 50KB | Logos, icons with transparency |
| SVG | Optimized (SVGO) | 10KB | Vector graphics, icons |
| MP4 (hero video) | CRF 28 | 2MB | Background videos |
| OG image | 1200x630 | 100KB | Social preview |

---

## Rules

1. **Measure before optimizing.** Run Lighthouse and Web Vitals before making changes. Optimize the actual bottleneck, not assumptions.
2. **Images are the #1 performance killer.** Every image must be: WebP/AVIF, correctly sized (not scaled in browser), lazy-loaded (except above-fold), and served from R2/CDN with cache headers.
3. **Fonts must not block render.** Use `font-display: swap` on all custom fonts. Preload the critical font file. Self-host from R2 (never Google Fonts CDN in production).
4. **JavaScript that is not needed on first paint must be deferred or lazy-loaded.** Use dynamic `import()` for below-fold components. Third-party scripts load via GTM (async, non-blocking).
5. **CSS that is not needed above-fold must be deferred.** Critical CSS inlined in `<head>`, remainder loaded asynchronously.
6. **Every image element must have explicit `width` and `height` attributes** (or CSS aspect-ratio) to prevent CLS.
7. **Preconnect to origins you will fetch from.** Add `<link rel="preconnect">` for API, CDN, analytics, and font origins.
8. **Worker CPU time budget: 10ms average, 50ms p99.** Profile with `wrangler dev --inspect` and Miniflare.
9. **Tree shaking must be verified.** After build, inspect the output bundle. If dead code from libraries appears, configure sideEffects or switch to ESM-only imports.
10. **Compression is automatic on Cloudflare** (Brotli for supported clients, gzip fallback). Do not double-compress assets.
11. **Cache everything possible.** Static assets: `Cache-Control: public, max-age=31536000, immutable`. HTML: `Cache-Control: public, max-age=60, s-maxage=3600`. API: `Cache-Control: private, no-store` (or short TTL for public endpoints).
12. **No render-blocking third-party scripts.** GTM is the only script in `<head>` (with async). Everything else loads via GTM or deferred `<script>`.

---

## Patterns

### Font Loading Strategy

```html
<!-- Preload critical font (above-fold heading font only) -->
<link rel="preload" href="/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin>

<style>
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/fonts/space-grotesk-700.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
    unicode-range: U+0000-00FF; /* Latin subset for faster load */
  }
</style>
```

### Image Component Pattern

```html
<!-- Responsive image with AVIF/WebP/fallback, lazy loaded, explicit dimensions -->
<picture>
  <source srcset="/img/hero.avif" type="image/avif">
  <source srcset="/img/hero.webp" type="image/webp">
  <img
    src="/img/hero.jpg"
    alt="Descriptive alt text"
    width="1200"
    height="630"
    loading="lazy"
    decoding="async"
    fetchpriority="low"
  >
</picture>

<!-- Above-fold hero: eager load, high priority -->
<img
  src="/img/hero.webp"
  alt="Hero image"
  width="1200"
  height="630"
  loading="eager"
  fetchpriority="high"
>
```

### Resource Hints

```html
<head>
  <!-- Preconnect to critical third-party origins -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://us.i.posthog.com">

  <!-- DNS prefetch for less-critical origins -->
  <link rel="dns-prefetch" href="https://images.unsplash.com">
  <link rel="dns-prefetch" href="https://js.stripe.com">

  <!-- Prefetch next likely navigation -->
  <link rel="prefetch" href="/pricing">
</head>
```

### Code Splitting (Angular)

```typescript
// Lazy-load routes (Angular 19 standalone)
export const routes: Routes = [
  { path: '', loadComponent: () => import('./home.component').then(m => m.HomeComponent) },
  { path: 'pricing', loadComponent: () => import('./pricing.component').then(m => m.PricingComponent) },
  { path: 'blog', loadChildren: () => import('./blog/blog.routes').then(m => m.BLOG_ROUTES) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
];
```

### Worker Performance Monitoring

```typescript
// Measure and report Worker execution time
app.use('*', async (c, next) => {
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  c.header('Server-Timing', `worker;dur=${duration.toFixed(1)}`);
  if (duration > 50) {
    console.warn(`[SLOW] ${c.req.method} ${c.req.path}: ${duration.toFixed(1)}ms`);
  }
});
```

### Lazy Loading Below-Fold Sections

```typescript
// IntersectionObserver pattern for deferred loading
function lazyLoadSection(selector: string, loadFn: () => Promise<void>) {
  const el = document.querySelector(selector);
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        loadFn();
        observer.disconnect();
      }
    },
    { rootMargin: '200px' } // Load 200px before visible
  );
  observer.observe(el);
}
```

### Cache Headers Pattern (Hono)

```typescript
// Static assets with content hash in filename
app.get('/assets/*', async (c, next) => {
  await next();
  c.header('Cache-Control', 'public, max-age=31536000, immutable');
});

// HTML pages - short cache, revalidate
app.get('*', async (c, next) => {
  await next();
  if (c.res.headers.get('content-type')?.includes('text/html')) {
    c.header('Cache-Control', 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400');
  }
});
```

### Performance Testing (Playwright)

```typescript
test('Core Web Vitals meet targets', async ({ page }) => {
  await page.goto(PROD_URL);

  const metrics = await page.evaluate(() => {
    return new Promise<{ lcp: number; cls: number }>(resolve => {
      let lcp = 0;
      let cls = 0;
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        lcp = entries[entries.length - 1].startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) cls += (entry as any).value;
        }
      }).observe({ type: 'layout-shift', buffered: true });

      setTimeout(() => resolve({ lcp, cls }), 3000);
    });
  });

  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.cls).toBeLessThan(0.1);
});

test('No oversized images', async ({ page }) => {
  await page.goto(PROD_URL);
  const oversized = await page.evaluate(() => {
    return Array.from(document.images)
      .filter(img => img.naturalWidth > img.clientWidth * 2)
      .map(img => ({ src: img.src, natural: img.naturalWidth, displayed: img.clientWidth }));
  });
  expect(oversized).toEqual([]);
});
```

---

## Performance Audit Checklist

```
[ ] Lighthouse Performance >= 90 (report, don't block for multimedia-heavy)
[ ] LCP < 2.5s on 4G connection
[ ] INP < 200ms on all interactive elements
[ ] CLS < 0.1 (explicit dimensions on all images/embeds)
[ ] No render-blocking resources (check DevTools Coverage tab)
[ ] Fonts use font-display: swap
[ ] Images: WebP/AVIF, lazy-loaded below fold, explicit dimensions
[ ] JS bundle < 150KB gzipped initial load
[ ] CSS < 50KB gzipped
[ ] Preconnect to critical origins
[ ] Cache headers set correctly (immutable for hashed assets)
[ ] Worker CPU time < 50ms p99
[ ] No layout shifts from dynamic content (skeleton/placeholder sizing)
[ ] Third-party scripts loaded async via GTM
[ ] Server-Timing header present for monitoring
```

---

## Integration Points

| Skill | Interaction |
|-------|------------|
| 07 Quality | Performance is one of 7 quality gate checks |
| 08 Deploy | Cache purge after deploy, verify performance post-deploy |
| 10 Design | Image formats, font loading strategy |
| 12 Media | Image compression targets, video encoding |
| 13 Observability | Lighthouse CI reporting, RUM data |
| 28 SEO | Core Web Vitals affect search ranking |
| 43 AI Chat | Widget must not degrade page performance |

---

## What This Skill Owns

- Core Web Vitals measurement and enforcement
- Bundle size budgets (JS, CSS, total page weight)
- Image optimization pipeline and format selection
- Lazy loading strategy (images, routes, components)
- Font loading strategy (preload, swap, subsetting)
- Resource hints (preconnect, prefetch, preload, dns-prefetch)
- Code splitting decisions and dynamic import patterns
- Tree shaking verification
- Cache-Control header strategy
- Worker CPU time monitoring
- Compression configuration
- Performance regression detection

## What This Skill Must Never Own

- Visual design decisions (which images to use) (-> 10)
- Testing framework setup (-> 07)
- Deployment execution (-> 08)
- Analytics implementation (-> 23)
- SEO strategy (-> 28)
- Image generation or selection (-> 12)
