---
name: "Font Subsetting"
version: "1.1.0"
updated: "2026-04-23"
description: "glyphhanger → WOFF2 → R2 self-host. Sora, Space Grotesk, JetBrains Mono subset to Latin+common. Preload critical, font-display:swap. Budget ≤100KB."
---

# Font Subsetting

## glyphhanger Subset Command
```bash
# Install
npm install -g glyphhanger
pip install fonttools brotli zopfli

# Subset to Latin + common symbols (covers 99%+ of English content)
glyphhanger --whitelist=US_ASCII --formats=woff2 --subset=Sora-Regular.ttf
glyphhanger --whitelist=US_ASCII --formats=woff2 --subset=Sora-Medium.ttf
glyphhanger --whitelist=US_ASCII --formats=woff2 --subset=SpaceGrotesk-SemiBold.ttf
glyphhanger --whitelist=US_ASCII --formats=woff2 --subset=SpaceGrotesk-Bold.ttf
glyphhanger --whitelist=US_ASCII --formats=woff2 --subset=JetBrainsMono-Regular.ttf

# Output: *-subset.woff2 files (typically 60-80% smaller)

# For sites with specific character needs, crawl first:
glyphhanger https://example.com --formats=woff2 --subset=*.ttf
```

## @font-face Declarations
```css
/* src/styles/fonts.css — self-hosted from R2 */
@font-face {
  font-family: 'Sora';
  src: url('/fonts/Sora-Regular-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF, U+2000-206F, U+2190-21FF, U+2200-22FF;
}

@font-face {
  font-family: 'Sora';
  src: url('/fonts/Sora-Medium-subset.woff2') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF, U+2000-206F;
}

@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-SemiBold-subset.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF;
}

@font-face {
  font-family: 'Space Grotesk';
  src: url('/fonts/SpaceGrotesk-Bold-subset.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono-Regular-subset.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-007F, U+00A0-00FF;
}
```

## Preload Critical Fonts (HTML head)
```html
<!-- Preload only above-fold fonts (body + heading) — max 2-3 -->
<link rel="preload" href="/fonts/Sora-Regular-subset.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/SpaceGrotesk-Bold-subset.woff2" as="font" type="font/woff2" crossorigin>
```

crossorigin attribute required even for same-origin fonts (CORS fetch mode). Only preload fonts used above the fold — preloading all fonts wastes bandwidth and delays LCP.

## @fontsource Alternative (pre-subset, tree-shakeable)
```bash
pnpm add @fontsource-variable/sora @fontsource-variable/space-grotesk @fontsource/jetbrains-mono
```
```typescript
// In Angular styles.css or main.ts
import '@fontsource-variable/sora/wght.css';           // Variable font, all weights
import '@fontsource-variable/space-grotesk/wght.css';
import '@fontsource/jetbrains-mono/400.css';            // Single weight
```

@fontsource ships WOFF2-only, pre-subset to Latin by default. Faster setup than manual glyphhanger. Trade-off: less control over exact subset, slightly larger than custom subset.

## R2 Upload + Cache Headers
```bash
# Upload subset fonts to R2 with immutable caching
for f in fonts/*-subset.woff2; do
  wrangler r2 object put "assets/fonts/$(basename $f)" --file "$f" \
    --content-type "font/woff2" \
    --cache-control "public, max-age=31536000, immutable"
done
```

## Worker Font Serving (if not using R2 public bucket)
```typescript
app.get('/fonts/:filename', async (c) => {
  const object = await c.env.R2.get(`fonts/${c.req.param('filename')}`);
  if (!object) return c.notFound();
  return new Response(object.body, {
    headers: {
      'Content-Type': 'font/woff2',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
});
```

## Size Budget
Target per font file: 15-25KB (subset WOFF2). Total all fonts: ≤100KB. Typical breakdown: Sora 400 (~18KB) + Sora 500 (~18KB) + Space Grotesk 600 (~16KB) + Space Grotesk 700 (~16KB) + JetBrains Mono 400 (~20KB) = ~88KB. If over budget: drop least-used weight, use `font-synthesis: weight` for minor weight differences.

Never use Google Fonts CDN (privacy, extra DNS lookup, no HTTP/3 multiplexing with your origin). Self-host always.
