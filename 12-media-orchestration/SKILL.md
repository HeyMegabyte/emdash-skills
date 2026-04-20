---
name: "Media Orchestration"
description: "Section-by-section media planning and generation. Image generation (built-in + DALL-E fallback), logo/icon generation (Ideogram → favicon set), video generation (Sora), social preview images (OG 1200x630), stock photo curation (Unsplash, Pexels), critique/remix loops (max 3 rounds), asset compression pipeline, and media performance budgets."
layer: "product-compiler"
canonical-owner-of:
  - "image-generation-pipeline"
  - "video-generation-pipeline"
  - "logo-and-icon-systems"
  - "social-preview-images"
  - "media-critique-loops"
---

# 12 — Media Orchestration

> Plan every image. Generate with intent. Critique and refine. Compress and deliver fast.

---

## Core Principle

**Media is not filler — it's a product feature.** Every image, video, logo, and icon must serve the product's goals. Plan media by section, generate with specific intent, critique ruthlessly, and deliver at optimal quality and speed.

---

## Section-by-Section Media Strategy

For every page, plan media needs before generating:

| Section | Media Type | Purpose | Generation Method |
|---------|-----------|---------|-------------------|
| Hero | Large image or short video | Emotional impact, product context | Imagegen / Sora |
| Features | Icons or illustrations | Explain each feature visually | Imagegen / SVG |
| How It Works | Step illustrations | Process clarity | Imagegen |
| Testimonials | Headshots or logos | Trust and credibility | Stock (Unsplash/Pexels) |
| Pricing | Minimal | Clean comparison | CSS only |
| About/Team | Photos | Human connection | Stock or real photos |
| Blog posts | Header images | Visual interest, social sharing | Imagegen |
| Social preview | OG image | Link sharing appearance | Imagegen |
| App icons | Favicon set | Brand recognition | Ideogram + processing |

### Pre-Generation Checklist
```
For each section:
[ ] What is the communication goal of this image?
[ ] What style matches the brand?
[ ] What dimensions are needed?
[ ] What format (WebP, SVG, PNG)?
[ ] What is the performance budget?
[ ] Is stock or generated better here?
```

---

## Visual Quality Inspection (MANDATORY)

Every image used in a build MUST be visually inspected before deployment.

### Inspection Workflow
1. **Read every image** using the Read tool to visually verify quality
2. **Check for:** blurriness, artifacts, watermarks, wrong colors, misaligned text, AI hallucination artifacts
3. **Verify brand alignment:** colors match palette, style is consistent across the page
4. **If an image fails inspection:** regenerate with DALL-E using an improved prompt, then re-inspect
5. **Never ship an image you haven't looked at**

### DALL-E Augmentation Pipeline
When the stock photo or Ideogram catalog doesn't have what you need, use DALL-E to expand it:

1. **Generate 2-3 variants** with different prompts for the same concept
2. **Visually inspect all variants** — pick the best one
3. **If none pass:** adjust prompt (more specific, different angle, different style) and regenerate
4. **Maximum 3 rounds** of generation per image before falling back to stock
5. **Document the winning prompt** in a comment near the image reference for future regeneration

### Quality Criteria
- Resolution: at least 2x the display size (retina-ready)
- No visible compression artifacts at 100% zoom
- No AI text artifacts (gibberish text, misspelled words)
- Colors within the brand palette (cyan #00E5FF, blue #50AAE3, black #060610)
- Consistent lighting/style across all images on the same page
- Human faces: no uncanny valley, extra fingers, distorted features

---

## Brian's Visual Style (from 3,110 ChatGPT conversations)

Every image generated must reflect this aesthetic:
- **Space/cosmic themes**: cyan (#00E5FF) + purple (#7C3AED), deep black backgrounds
- **Connections and dots**: quantum-inspired, neural network visuals, constellation patterns
- **"Ultra realistic"** when generating scenes or product imagery
- **Transparent logos** that work on dark backgrounds
- **Refinement direction is ALWAYS "simpler"** — if in doubt, reduce visual complexity
- **Never generic**: no stock-photo-looking AI slop, no "diverse team at whiteboard"
- **Personal motifs**: squirrels, turtles (for easter eggs and brand personality)

### Prompt Style for Brian's Brand
```
Dark, atmospheric [subject]. Cyan (#00E5FF) light streaks and purple (#7C3AED) nebula effects
on deep black (#060610). Quantum-inspired dots and connections. Premium tech aesthetic.
Ultra-wide composition. Ultra realistic. No text.
```

---

## Image Generation (Imagegen)

### Built-In Mode (Default)
Use the built-in image generation capability. This is the preferred method.

### Fallback CLI Mode (when explicit)
Use `scripts/image_gen.py` with `OPENAI_API_KEY`:
```bash
# Generate
uv run python scripts/image_gen.py generate --prompt "..." --size 1792x1024 --output hero.png

# Edit
uv run python scripts/image_gen.py edit --image input.png --prompt "..." --output edited.png

# Batch
uv run python scripts/image_gen.py generate-batch --prompts prompts.json --output-dir output/
```

### Prompt Engineering for Images

#### Shared Prompt Schema
```
Subject: [main subject]
Style: [art style — digital illustration, photograph, 3D render, etc.]
Mood: [emotional tone — professional, energetic, calm, bold]
Color palette: [specific colors from brand]
Composition: [framing — centered, rule of thirds, wide angle]
Background: [specific background description]
Lighting: [lighting style — soft, dramatic, studio, natural]
Details: [specific details that matter]
Avoid: [what to exclude — text, watermarks, specific elements]
Aspect ratio: [dimensions]
```

#### Prompt Rules
- Be specific about style, not generic ("dark tech illustration with cyan accent glow" not "cool image")
- Include brand colors explicitly
- Specify what to AVOID (text in images, watermarks, specific unwanted elements)
- For product screenshots, use browser rendering instead of generation
- For people, specify diversity and professional context
- Never add detail the user didn't imply — augment generic prompts, preserve specific ones

---

## Logo and Icon Generation (NON-NEGOTIABLE — every project gets a premium logo)

> **A brand MUST always have a premium logo.** If the business has one, find it and enhance it.
> If they don't, create a gorgeous one with Ideogram using A/B selection from multiple generations.
> The logo is the #1 visual trust signal — it appears in the header, favicon, OG images, emails, and app icons.
> **If the user doesn't like it, regenerate using the same process.** Never settle for a mediocre logo.

### Step 1: Discovery — Find the Existing Logo (ALWAYS try this first)

Before generating anything, exhaustively search for the business's existing logo:

```
Priority order:
1. Logo.dev API (LOGODEV_TOKEN) — search by domain
2. Brandfetch API (BRANDFETCH_API_KEY) — full brand kit by domain
3. Scrape website header/footer — look for <img> tags in nav/header/footer
4. Google Image Search — "{business name} logo" with transparent filter
5. Favicon extraction — upscale favicon.ico to check quality
6. Merchandise/signage photos — scan Foursquare/Yelp/Google Places photos
7. Social media profiles — check Twitter/Facebook/LinkedIn for profile images
```

If a logo is found:
- **Visually inspect it** — Read the image file to check quality
- If high quality (clear, professional, >200px, no artifacts): **use it as-is**
- If low quality (blurry, <200px, jpeg artifacts): **AI-enhance it** with Replicate upscaling or DALL-E inpainting
- If only a small favicon exists: **upscale with Replicate** (Real-ESRGAN) then clean up edges
- **Extract brand colors** from the logo using AI vision for use across the site design

### Step 2: Generation — Create a Premium Logo with Ideogram A/B Selection

If no suitable logo exists (or enhancement fails), generate one:

```
1. Gather brand context:
   - Business name (EXACT spelling — text rendering is critical)
   - Industry/category
   - Brand personality (professional, playful, elegant, bold, minimal)
   - Brand colors (extracted from website, or from Skill 09 brand system)
   - Competitor logos (for differentiation)

2. Generate 4-6 variants via Ideogram v3 API:
   - 2x horizontal lockup (logo + business name text)
   - 2x icon-only (symbol/monogram, works at 32px)
   - 1x wordmark (text-only, premium typography)
   - 1x creative/abstract (unique shape + name)

3. A/B Selection — evaluate ALL variants with GPT-4o vision:
   Send all 4-6 images to GPT-4o with this prompt:
   "Rate each logo 1-10 on: text legibility, professionalism, scalability
    (works at both 512px and 16px), brand relevance, uniqueness, and
    aesthetic quality. Select the best overall logo and explain why."

4. Select the winner — use GPT-4o's recommendation
   - If the best score is < 7/10: regenerate with refined prompts and repeat
   - Maximum 3 rounds of generation before accepting the best available

5. Process the winner into the full asset set (see below)
```

### Ideogram Prompt Templates (for premium results)

**Horizontal lockup:**
```
a premium, clean, modern logo for "{BusinessName}", a {industry} business.
Minimal design with the text "{BusinessName}" in a bold sans-serif font.
{brand_color} accent color on dark transparent background. Professional,
scalable, no gradients, vector-style. PNG with transparency.
```

**Icon/monogram:**
```
a minimal icon logo using the letter "{FirstLetter}" for "{BusinessName}",
a {industry} business. Clean geometric shape, {brand_color} color,
transparent background, works at very small sizes. Modern, professional.
```

**Wordmark:**
```
a premium wordmark logo that spells "{BusinessName}" in elegant, custom
typography. {brand_color} on transparent background. Think Apple, Stripe,
or Linear level of typographic quality. No icons, text only.
```

### Ideogram v3 API Call (best text rendering)

```bash
curl -X POST "https://api.ideogram.ai/v1/ideogram-v3/generate" \
  -H "Api-Key: $IDEOGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a minimalist tech logo with the text \"BrandName\" in cyan #00E5FF, dark background, sans-serif",
    "aspect_ratio": "ASPECT_16_9",
    "rendering_speed": "DEFAULT"
  }'
```

### Step 3: Regeneration — When the User Asks for a New Logo

If the user says "I don't like the logo", "make a new logo", "try again", or "different style":
1. Ask what they don't like (optional — if they don't answer, just vary the style)
2. Regenerate using Step 2 with different style parameters:
   - Try different font styles (serif vs sans-serif vs display)
   - Try icon-first vs text-first layout
   - Try different color treatments (monochrome, gradient, multi-color)
   - Try different aesthetics (minimal, organic, geometric, vintage, futuristic)
3. A/B select again with GPT-4o vision
4. Process and deploy the new winner

### Step 4: Asset Processing — Full Favicon + Brand Set

Process the winning logo into all required formats:

```
public/
├── favicon.ico          (16x16 + 32x32 + 48x48 ICO)
├── favicon-16x16.png    (icon variant, simplified for small size)
├── favicon-32x32.png    (icon variant)
├── apple-touch-icon.png (180x180, icon variant with padding)
├── icon-192.png         (Android Chrome)
├── icon-512.png         (Android Chrome, PWA splash)
├── logo-header.png      (horizontal lockup for header)
├── logo-header-icon.png (icon-only for mobile header)
├── logo-mark.png        (transparent mark, for reuse)
├── logo-text.png        (text-only variant)
├── og-image.png         (1200x630 with logo centered on brand bg)
└── site.webmanifest     (references icon-192 and icon-512)
```

### HTML Tags
```html
<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
<link rel="icon" href="/icon-32.png" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="/icon-180.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#060610">
```

### Quality Gates for Logos

Every logo MUST pass these checks before deployment:
- [ ] Text is legible at 32px (favicon size)
- [ ] Text is legible at 512px (app icon size)
- [ ] Transparent background (no white/colored box behind it)
- [ ] Colors are within brand palette
- [ ] No AI artifacts (gibberish text, weird shapes, blurred edges)
- [ ] Works on both dark (#060610) and light (#ffffff) backgrounds
- [ ] GPT-4o rates it >= 7/10 for professionalism
- [ ] Consistent with the site's overall design language

---

## Video Generation (Sora)

### When to Use Video
- Hero background (muted autoplay loop, 4-8 seconds)
- Product explainer (15-30 seconds)
- Feature demo (5-10 seconds per feature)
- Social media preview
- App walkthrough

### Sora Workflow
1. Plan the shot (subject, action, duration, style)
2. Generate with descriptive prompt
3. Review output
4. Extend if needed (up to 120s total)
5. Edit for refinement if needed
6. Export and compress

### Sora Defaults
- Model: `sora-2` (or `sora-2-pro` for high fidelity)
- Size: 1280x720
- Duration: 4 seconds (can be 4, 8, 12, 16, 20)
- Max 2 character references per generation

### Video Prompt Template
```
[Opening shot/setup, 0-2s]: [describe initial frame]
[Main action, 2-6s]: [describe what happens]
[Closing/hold, 6-8s]: [describe ending state]

Style: [cinematic, documentary, animated, etc.]
Camera: [static, slow pan, tracking, drone]
Lighting: [natural, studio, dramatic, ambient]
Color: [brand-consistent palette]
Mood: [match product tone]
```

### Video Delivery
```html
<video autoplay muted loop playsinline poster="hero-poster.webp">
  <source src="hero.mp4" type="video/mp4">
</video>
```
- Always include `poster` image (first frame, WebP)
- Always `muted` for autoplay
- Always `playsinline` for iOS
- Compress to < 2MB for hero backgrounds
- Lazy-load videos below the fold

---

## Social Preview Images

### PWA Screenshots (skill 24 — install.doctor standard)
PWA manifest screenshots MUST be captured with Playwright against the live production URL — never use mockups or generated images. Two screenshots required:
- **Wide** (1920x1080): `form_factor: "wide"` — desktop install UI
- **Narrow** (390x844): `form_factor: "narrow"` — mobile install UI

Capture after deploy, visually inspect before adding to manifest. Re-capture on every significant UI change.

### OG Image Requirements
- Size: 1200x630px (MANDATORY per-page — not just homepage)
- Format: PNG or JPEG
- Include: product name, tagline, brand colors
- Readable at thumbnail size (small text is invisible)
- Visually inspect every OG image before deployment (Read tool)
- Test on Twitter Card Validator and Facebook Debugger

### OG Image Template Prompt
```
Create a social media preview image for [product name].
Dimensions: 1200x630 pixels.
Background: dark (#060610) with subtle gradient.
Text: "[Product Name]" in large, bold white text (Space Grotesk).
Subtitle: "[Tagline]" in smaller cyan (#00E5FF) text below.
Include a simple iconic element representing [product purpose].
No photographs, no busy backgrounds.
Clean, modern, tech-forward design.
```

---

## Stock Photo Integration

### Unsplash API
```bash
curl "https://api.unsplash.com/search/photos?query=team+meeting&per_page=5" \
  -H "Authorization: Client-ID $UNSPLASH_ACCESS_KEY"
```

### Pexels API
```bash
curl "https://api.pexels.com/v1/search?query=team+meeting&per_page=5" \
  -H "Authorization: $PEXELS_API_KEY"
```

### Stock Photo Rules
- Curate: don't use the first result, review 5+ options
- Prefer candid over staged
- Prefer diverse representation
- Prefer images that match the product's mood
- Always compress and convert to WebP
- Always include meaningful alt text

---

## Critique and Remix Loop

### Image Critique Checklist
```
[ ] Does it communicate the intended message?
[ ] Does it match the brand's visual style?
[ ] Is the composition strong?
[ ] Is the color palette consistent with the brand?
[ ] Is it legible at the intended display size?
[ ] Would it look good in a dark UI context?
[ ] Is it free of AI artifacts (weird hands, distorted text)?
[ ] Does it feel premium, not generic?
```

### Remix Process
1. Identify specific issues in the generated image
2. Adjust the prompt to address issues
3. Regenerate (don't edit if the composition needs changing)
4. Edit if only specific areas need refinement
5. Maximum 3 remix rounds per asset (diminishing returns)

### Video Critique Checklist
```
[ ] Motion is smooth (no jumps or stutters)?
[ ] Action is clear and purposeful?
[ ] Duration is appropriate?
[ ] Style matches the product?
[ ] No AI artifacts (morphing, flickering)?
[ ] Works as a loop (if hero background)?
[ ] Audio appropriate or intentionally silent?
```

---

## Asset Pipeline

### Compression Standards
| Format | Quality | Max Size | Tool |
|--------|---------|----------|------|
| WebP (photo) | 80% | 200KB | cwebp or sharp |
| WebP (illustration) | 90% | 150KB | cwebp or sharp |
| PNG (logo/icon) | Lossless | 50KB | pngquant |
| SVG | Optimized | 10KB | svgo |
| MP4 (hero video) | CRF 28 | 2MB | ffmpeg |
| MP4 (feature video) | CRF 26 | 5MB | ffmpeg |
| ICO | Multi-resolution | 15KB | ImageMagick |

### Image Dimensions
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

### Delivery via Cloudflare
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

## Media Performance Budget

### Per-Page Limits
| Metric | Budget |
|--------|--------|
| Total image weight | < 500KB |
| Largest single image | < 200KB |
| Hero image LCP | < 2.5s |
| Total media (images + video) | < 3MB |
| Number of image requests | < 15 |

### Performance Rules
- Hero image: `loading="eager"`, preload in `<link>`
- All other images: `loading="lazy"`
- All images: `decoding="async"`
- Serve WebP with PNG fallback
- Use `srcset` for responsive images
- Inline critical SVGs (< 2KB)

---

## Trigger Conditions
- New project (plan full media strategy)
- New page or section (plan section media)
- Branding task (logo, icons, social)
- Visual quality review (critique existing media)
- Performance audit (compress, optimize)

## Stop Conditions
- All sections have appropriate media
- All media passes critique checklist
- Performance budget met
- All formats optimized

## Cross-Skill Dependencies
- **Reads from:** 09-brand-and-content (brand identity, art direction), 10-experience-and-design (layout needs), 02-goal-and-brief (product context)
- **Feeds into:** 06-build-and-slice-loop (assets to integrate), 07-quality-and-verification (media quality), 08-deploy-and-runtime (assets to deploy)

---

## What This Skill Owns
- Image planning and generation
- Video planning and generation
- Logo and icon systems
- Social preview images
- Stock photo curation
- Critique and remix loops
- Asset compression and delivery
- Media performance budgets

## What This Skill Must Never Own
- Visual layout (→ 10)
- Animation/motion (→ 11)
- Copy/content (→ 09)
- Deployment (→ 08)

---

## CRITICAL API Updates (2026)

### DALL-E is DEPRECATED — Use GPT Image Models
**DALL-E 2 and DALL-E 3 stop working May 12, 2026.** (Source: OpenAI Docs)

Use instead:
- `gpt-image-1` — production quality
- `gpt-image-1.5` — latest, best text rendering and photorealism
- `gpt-image-1-mini` — cheaper for bulk generation

Resolutions: 1024x1024, 1536x1024 (landscape), 1024x1536 (portrait)
Supports transparent PNG when requested in prompt.

### Ideogram v3 — Best Logo Generation
Use v3 endpoint for 90-95% text rendering accuracy (Source: Ideogram API Docs):
```bash
curl -X POST "https://api.ideogram.ai/v1/ideogram-v3/generate" \
  -H "Api-Key: $IDEOGRAM_API_KEY" \
  -d '{
    "prompt": "a minimalist tech logo with the text \"BrandName\" in cyan #00E5FF, dark background, sans-serif",
    "rendering_speed": "TURBO",
    "aspect_ratio": "ASPECT_1_1",
    "style_type": "DESIGN"
  }'
```
- Put desired text in quotation marks within the prompt
- Upload up to 3 style reference images for consistency
- TURBO mode: ~4s generation at $0.03-0.05 per image

### Sora 2 — Deprecates September 24, 2026
Both `sora-2` and `sora-2-pro` deprecate Sept 24, 2026 (Source: OpenAI Docs).

Two-tier strategy:
- `sora-2` — fast iteration, 480p-720p, use for exploration
- `sora-2-pro` — production quality, 1080p, use for final renders

Use webhook events (`video.completed`, `video.failed`) for production.
Videos downloadable for 24 hours post-completion.

### Cloudflare Image Transforms (Source: CF Docs)
Store originals in R2, transform on-the-fly via URL params — no pre-generated variants:
```
https://domain.com/cdn-cgi/image/width=800,quality=75,format=auto/path/to/image.jpg
```
- `format=auto` serves AVIF/WebP based on browser support
- Each variant cached at the edge automatically
- Sub-50ms delivery globally

### Core Web Vitals Impact (Source: Google Web.dev, Amazon)
- 1s LCP delay = 7% conversion loss
- Every 100ms of latency costs ~1% in sales
- Hero image MUST be preloaded: `<link rel="preload" as="image" href="hero.webp">`
- Never lazy-load the LCP element
- Set explicit `width`/`height` on all images to prevent CLS

---

## API Fallback Chain

Try in order. If one fails (429, 500, or rate limited), try next:

| Priority | Service | Best For | API Key Env | Rate Limit |
|----------|---------|----------|-------------|------------|
| 1 | **Ideogram** | Logos, icons, design assets | `IDEOGRAM_API_KEY` | Pay per use |
| 2 | **GPT Image 1.5** | Scenes, hero images, OG | `OPENAI_API_KEY` | Pay per use |
| 3 | **Pexels** | Stock photography | `PEXELS_API_KEY` | 200 req/hr |
| 4 | **Unsplash** | Stock photography (fallback) | `UNSPLASH_ACCESS_KEY` | 50 req/hr |
| 5 | **Pixabay** | Stock photography (last resort) | `PIXABAY_API_KEY` | 100 req/hr |
| 6 | **Replicate** | Specialty models (upscaling, style) | `REPLICATE_API_TOKEN` | Pay per use |

All keys in shared pool: `/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`

---

## Image Compression Pipeline

### Compress
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

### Verify Size
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

## Visual Quality Inspection (MANDATORY)

Every image used in a build MUST be visually inspected before deployment.

### Inspection Workflow
1. **Read every image** using the Read tool to visually verify quality
2. **Check for:** blurriness, artifacts, watermarks, wrong colors, misaligned text, AI hallucination artifacts
3. **Verify brand alignment:** colors match palette, style is consistent across the page
4. **If an image fails inspection:** regenerate with improved prompt, then re-inspect
5. **Never ship an image you haven't looked at**

### Augmentation Pipeline
When the stock photo or Ideogram catalog doesn't have what you need:

1. **Generate 2-3 variants** with different prompts for the same concept
2. **Visually inspect all variants** — pick the best one
3. **If none pass:** adjust prompt (more specific, different angle, different style) and regenerate
4. **Maximum 3 rounds** of generation per image before falling back to stock
5. **Document the winning prompt** in a comment near the image reference for future regeneration

### Quality Criteria
- Resolution: at least 2x the display size (retina-ready)
- No visible compression artifacts at 100% zoom
- No AI text artifacts (gibberish text, misspelled words)
- Colors within deltaE < 10 of brand palette
- Consistent lighting/style across all images on the same page
- Human faces: no uncanny valley, extra fingers, distorted features

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
