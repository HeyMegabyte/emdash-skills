---
name: "Critical CSS Extraction"
version: "1.1.0"
updated: "2026-04-23"
description: "Inline above-fold CSS via critters at build time. Angular CLI built-in (v13+), Hono SSR manual. Pairs with font preloading. LCP target ≤2.5s."
---

# Critical CSS Extraction

## Angular CLI (Built-in critters)
```jsonc
// angular.json — critters is bundled since Angular v13
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "options": {
            "optimization": {
              "styles": {
                "minify": true,
                "inlineCritical": true  // Enables critters (default true in production)
              }
            }
          }
        }
      }
    }
  }
}
```

Angular SSR (`@angular/ssr`) automatically runs critters during server-side rendering. For prerendered routes (`ng build --prerender`), critical CSS is inlined at build time into each static HTML file. No runtime cost.

## Standalone critters (Non-Angular)
```bash
pnpm add -D critters
```
```typescript
// scripts/inline-critical-css.ts — run as build post-process
import Critters from 'critters';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const critters = new Critters({
  path: 'dist/',                    // Where CSS files live
  preload: 'swap',                  // font-display: swap for deferred CSS
  inlineFonts: false,               // We handle fonts separately (font-subsetting skill)
  compress: true,                   // Minify inlined CSS
  pruneSource: false,               // Keep full CSS file for non-critical
  reduceInlineStyles: true,         // Remove unused inline styles
  mergeStylesheets: true,           // Combine multiple <style> into one
  additionalStylesheets: [],        // Extra CSS to consider
});

async function processHtmlFiles(dir: string): Promise<void> {
  const files = readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((f) => f.endsWith('.html'));

  for (const file of files) {
    const fullPath = join(dir, file);
    const html = readFileSync(fullPath, 'utf8');
    const inlined = await critters.process(html);
    writeFileSync(fullPath, inlined);
    console.log(`Inlined critical CSS: ${file}`);
  }
}

await processHtmlFiles('dist/browser');
```

## How critters Works
1. Parses HTML, finds all `<link rel="stylesheet">` references
2. Loads referenced CSS files from disk
3. Renders page layout using a minimal DOM parser (no headless browser)
4. Identifies CSS rules that affect above-fold elements (viewport height heuristic)
5. Inlines critical rules into `<style>` in `<head>`
6. Converts remaining `<link>` to `<link rel="preload" as="style" onload="this.rel='stylesheet'">` with `<noscript>` fallback

## Hono SSR Manual Critical CSS
```typescript
// For Hono-served HTML pages (non-Angular)
// Pre-extract critical CSS per route at build time, store as strings

import { criticalCssMap } from './critical-css-map'; // Generated at build

app.get('/', (c) => {
  const criticalCss = criticalCssMap['/'] ?? '';
  return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>${criticalCss}</style>
  <link rel="preload" href="/fonts/Sora-Regular-subset.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/styles/main.css" as="style">
  <link rel="stylesheet" href="/styles/main.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="/styles/main.css"></noscript>
</head>
<body><!-- ... --></body>
</html>`);
});
```

## Build Integration (package.json)
```jsonc
{
  "scripts": {
    "build": "ng build --configuration=production",
    "postbuild": "node scripts/inline-critical-css.ts",  // Only if not using Angular SSR
    "deploy": "pnpm build && wrangler deploy"
  }
}
```

## Optimal Load Sequence
1. Inline critical CSS in `<style>` (0ms — already in HTML)
2. Preload above-fold fonts (parallel with HTML parse)
3. Deferred full stylesheet via `<link rel="preload" as="style">` (non-blocking)
4. font-display: swap prevents invisible text during font load
5. Below-fold images: lazy load
6. Result: first meaningful paint with styled content + system font → swap to custom font

## Verification
```bash
# Measure before/after with Lighthouse
npx lighthouse https://example.com --only-categories=performance --output=json | jq '.audits["render-blocking-resources"]'

# Check that critical CSS is actually inlined
curl -s https://example.com | grep -c '<style>' # Should be >= 1
curl -s https://example.com | grep -c 'media="print" onload' # Deferred stylesheets
```

LCP target: ≤2.5s. CLS target: ≤0.1 (critical CSS prevents layout shift from late-loading styles). FCP target: ≤1.8s. Combined with font subsetting + preloading, typical FCP improvement: 300-800ms.
