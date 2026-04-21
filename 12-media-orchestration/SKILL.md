---
name: "media-orchestration"
description: "Section-by-section media planning and generation. Image generation (built-in + DALL-E fallback), logo/icon generation (Ideogram → favicon set), video generation (Sora), social preview images (OG 1200x630), stock photo curation (Unsplash, Pexels), critique/remix loops (max 3 rounds), asset compression pipeline, and media performance budgets."
submodules:
  - media-prompts.md
  - compression-pipeline.md
---

# 12 — Media Orchestration

Submodules: media-prompts.md (prompt templates, Ideogram v3 API), compression-pipeline.md (Python code, format tables, CF Image Transforms, CLS, broken image detection).

## Strategy by Section
Hero: imagegen/Sora. Features: imagegen/SVG. How It Works: imagegen. Testimonials: stock. About: stock/real. Blog: imagegen. Social: imagegen OG 1200x630. Icons: Ideogram+processing.

Pre-gen: communication goal? Brand style? Dimensions? Format? Budget? Stock or generated?

## Visual Inspection (MANDATORY)
Read every image before deploy. Check: blur, artifacts, watermarks, wrong colors, AI hallucinations. Failed: regenerate improved prompt. Quality: 2x retina, no artifacts, no gibberish text, brand palette, consistent style, no uncanny valley.

## Brian's Style
Space/cosmic: #00E5FF + #7C3AED, deep black. Connections/dots: quantum, neural, constellation. "Ultra realistic" scenes. Transparent logos. Simpler always. Motifs: squirrels, turtles.

## Image Generation
Built-in preferred. Fallback: scripts/image_gen.py. Be specific, include colors, specify avoidances. Product screenshots: browser rendering.

## Logo (NON-NEGOTIABLE)
**Discovery:** Logo.dev, Brandfetch, scrape header, Google Images, favicon, social. High quality: use. Low: AI-enhance. Favicon only: upscale.

**Generation (if none):** 4-6 Ideogram variants (2 lockup, 2 icon, 1 wordmark, 1 creative). A/B via GPT-4o (rate 1-10). Best <7: regenerate (max 3 rounds).

**Assets:** favicon.ico (16+32+48), 16/32/180/192/512 PNGs, logo-header, logo-mark, og-image 1200x630.

**Gates:** legible 32px+512px, transparent bg, brand palette, no artifacts, dark+light, GPT-4o >=7/10.

## Video (Sora)
Hero bg (4-8s muted autoplay loop), explainer (15-30s), demo (5-10s). Model: sora-2/sora-2-pro. 1280x720. Delivery: autoplay muted loop playsinline poster. <2MB hero. Lazy below fold.

**DALL-E deprecated May 12, 2026.** Use gpt-image-1.5/1/1-mini. Sora deprecates Sept 24, 2026.

## Social Previews
PWA screenshots: Playwright on live URL (never mockups). Wide 1920x1080 + narrow 390x844. OG: 1200x630 per page (MANDATORY).

## Stock
Unsplash (UNSPLASH_ACCESS_KEY), Pexels (PEXELS_API_KEY). Review 5+, prefer candid/diverse/mood-matching. WebP, alt text.

## Critique Loop (max 3)
Communicates? Brand-matching? Strong composition? Consistent palette? Legible? Premium? No artifacts? Issues: adjust prompt, regenerate.

## Performance Budget
Total images <500KB, largest <200KB, hero LCP <2.5s, total media <3MB, requests <15. Hero: eager+preload. Others: lazy. All: decoding=async. WebP+fallback. srcset. Inline SVGs <2KB. 1s LCP delay = 7% conversion loss.

## Fallback Chain
1. Ideogram (logos/icons) 2. GPT Image 1.5 (scenes/hero/OG) 3. Pexels (200/hr) 4. Unsplash (50/hr) 5. Pixabay (100/hr) 6. Replicate (specialty).
All keys: /Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local
