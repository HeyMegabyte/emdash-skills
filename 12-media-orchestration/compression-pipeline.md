# Compression Pipeline

> Submodule of 12-media-orchestration. Contains image compression code, size verification, and delivery patterns.

---

## Python Compression

```python
from PIL import Image
import subprocess

def optimize_image(input_path, output_path, max_width=1200, quality=80):
    """Compress and convert to WebP."""
    img = Image.open(input_path)

    # Resize if wider than max_width
    if img.width > max_width:
        ratio = max_width / img.width
        img = img.resize((max_width, int(img.height * ratio)), Image.LANCZOS)

    # Save as WebP (best compression for web)
    img.save(output_path.replace('.png', '.webp'), 'WEBP', quality=quality, method=6)

    # Also save JPEG fallback
    if img.mode == 'RGBA':
        img = img.convert('RGB')
    img.save(output_path.replace('.png', '.jpg'), 'JPEG', quality=quality, optimize=True)
```

---

## Size Verification

```python
import os
MAX_SIZES = {
    'hero': 200_000,      # 200KB
    'feature': 100_000,   # 100KB
    'icon': 20_000,       # 20KB
    'og': 150_000,        # 150KB
    'thumbnail': 30_000,  # 30KB
}

def check_size(path, category='hero'):
    size = os.path.getsize(path)
    limit = MAX_SIZES.get(category, 200_000)
    if size > limit:
        print(f"WARNING: {path} is {size/1000:.0f}KB (limit: {limit/1000:.0f}KB)")
        return False
    return True
```

---

## Compression Standards

| Format | Quality | Max Size | Tool |
|--------|---------|----------|------|
| WebP (photo) | 80% | 200KB | cwebp or sharp |
| WebP (illustration) | 90% | 150KB | cwebp or sharp |
| PNG (logo/icon) | Lossless | 50KB | pngquant |
| SVG | Optimized | 10KB | svgo |
| MP4 (hero video) | CRF 28 | 2MB | ffmpeg |
| MP4 (feature video) | CRF 26 | 5MB | ffmpeg |
| ICO | Multi-resolution | 15KB | ImageMagick |

---

## Image Dimensions

| Use | Dimensions | Format |
|-----|-----------|--------|
| Hero (desktop) | 1920x1080 | WebP |
| Hero (mobile) | 750x1334 | WebP |
| Feature icon | 128x128 | SVG or WebP |
| Testimonial headshot | 96x96 | WebP |
| OG image | 1200x630 | PNG |
| Blog header | 1200x675 | WebP |
| Logo (horizontal) | 240xauto | SVG or PNG |
| Favicon | 16/32/48/180/192/512 | ICO/PNG |

---

## Delivery via Cloudflare

```html
<!-- Responsive images -->
<picture>
  <source media="(max-width: 768px)" srcset="/images/hero-mobile.webp">
  <source media="(min-width: 769px)" srcset="/images/hero-desktop.webp">
  <img src="/images/hero-desktop.webp" alt="..." loading="eager" decoding="async">
</picture>

<!-- Below-fold images -->
<img src="/images/feature.webp" alt="..." loading="lazy" decoding="async">
```

---

## Cloudflare Image Transforms

Store originals in R2, transform on-the-fly via URL params — no pre-generated variants:
```
https://domain.com/cdn-cgi/image/width=800,quality=75,format=auto/path/to/image.jpg
```
- `format=auto` serves AVIF/WebP based on browser support
- Each variant cached at the edge automatically
- Sub-50ms delivery globally

---

## Preventing CLS (Layout Shift)

Always include `width` and `height` attributes on `<img>` tags.
Use CSS `aspect-ratio` for responsive containers:
```css
.image-container {
  aspect-ratio: 16/9;
  overflow: hidden;
}
.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## Broken Image Detection (Playwright)

```typescript
test('no broken images', async ({ page }) => {
  await page.goto('/');
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const complete = await img.evaluate(el => (el as HTMLImageElement).complete);
    const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
    const src = await img.getAttribute('src');
    expect(complete, `Image not loaded: ${src}`).toBe(true);
    expect(naturalWidth, `Broken image: ${src}`).toBeGreaterThan(0);
  }
});
```
