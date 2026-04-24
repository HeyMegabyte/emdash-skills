---
name: "media-orchestration"
description: "Section-by-section media planning and generation. Image generation (GPT Image 1.5 primary, built-in fallback), logo/icon generation (Ideogram v3 → favicon set), video generation (Sora), social preview images (OG 1200x630 + AI search optimization), stock photo curation (Unsplash, Pexels), critique/remix loops (max 3 rounds), asset compression pipeline, and media performance budgets."
metadata:
  version: "2.1.0"
  updated: "2026-04-23"
  context: "fork"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - media-prompts.md
  - compression-pipeline.md
  - og-image-generation.md
  - image-optimization.md
  - technical-diagramming.md
---

# 12 -- Media Orchestration

Submodules: media-prompts.md (prompt templates, Ideogram v3 API), compression-pipeline.md (Python code, format tables, CF Image Transforms, CLS, broken image detection), og-image-generation.md (Satori edge-rendered OG images, KV/R2 cache, meta-tag helper), image-optimization.md (Sharp processing, responsive srcset, WebP/AVIF, blur placeholders, R2 pipeline).

## Strategy by Section
Hero: GPT Image 1.5/Sora. Features: GPT Image 1.5/SVG. How It Works: GPT Image 1.5. Testimonials: stock. About: stock/real. Blog: GPT Image 1.5. Social: Satori OG 1200x630. Icons: Ideogram v3+processing.

Pre-gen: communication goal? Brand style? Dimensions? Format? Budget? Stock or generated?

## Visual Inspection (MANDATORY)
Read every image before deploy. Check: blur, artifacts, watermarks, wrong colors, AI hallucinations, gibberish text. Failed: regenerate improved prompt. Quality: 2x retina, no artifacts, brand palette, consistent style, no uncanny valley.

## Brian's Style
Space/cosmic: #00E5FF + #7C3AED, deep black (#060610). Connections/dots: quantum, neural, constellation. "Ultra realistic" scenes. Transparent logos. Simpler always. Motifs: squirrels, turtles.

## Image Generation
GPT Image 1.5 preferred (best quality). GPT Image 1 for speed. GPT Image 1-mini for bulk/drafts. Fallback: scripts/image_gen.py. Be specific, include colors, specify avoidances. Product screenshots: browser rendering via Playwright on live URL.

**DALL-E deprecated May 12, 2026.** Never use DALL-E -- use gpt-image-1.5 (quality), gpt-image-1 (balanced), gpt-image-1-mini (fast/cheap). Sora video deprecates Sept 24, 2026.

## Logo (NON-NEGOTIABLE)
**Discovery:** Logo.dev, Brandfetch, scrape header, Google Images, favicon, social. High quality: use. Low: AI-enhance. Favicon only: upscale.

**Generation (if none):** 4-6 Ideogram v3 variants (2 lockup, 2 icon, 1 wordmark, 1 creative). A/B via GPT-4o (rate 1-10). Best <7: regenerate (max 3 rounds).

**Assets:** favicon.ico (16+32+48), 16/32/180/192/512 PNGs, logo-header, logo-mark, og-image 1200x630.

**Gates:** legible 32px+512px, transparent bg, brand palette, no artifacts, dark+light, GPT-4o >=7/10.

## Video (Sora)
Hero bg (4-8s muted autoplay loop), explainer (15-30s), demo (5-10s). Model: sora-2/sora-2-pro. 1280x720. Delivery: autoplay muted loop playsinline poster. <2MB hero. Lazy below fold. Sora deprecates Sept 24, 2026 -- evaluate alternatives before then.

## Social Previews + AI Search Optimization
PWA screenshots: Playwright on live URL (never mockups). Wide 1920x1080 + narrow 390x844. OG: 1200x630 per page (MANDATORY). Edge-rendered via Satori + resvg (see og-image-generation.md).

**AI Search (GEO):** OG images now consumed by ChatGPT, Perplexity, Google AI Overviews. Ensure: descriptive og:title (40-60 words quotable), structured JSON-LD on every page, FAQ sections for AI extraction, clear entity definitions. ChatGPT favors Wikipedia/G2; Perplexity favors Reddit/YouTube; Google AI Overviews favor traditionally ranked pages.

## Stock
Unsplash (UNSPLASH_ACCESS_KEY), Pexels (PEXELS_API_KEY). Review 5+, prefer candid/diverse/mood-matching. WebP, alt text.

## Critique Loop (max 3)
Communicates? Brand-matching? Strong composition? Consistent palette? Legible? Premium? No artifacts? Issues: adjust prompt, regenerate. Score 1-10 on 8 criteria (see templates/PROMPTS.md). Overall <7: regenerate.

## Performance Budget
Total images <500KB, largest <200KB, hero LCP <2.5s, total media <3MB, requests <15. Hero: eager+preload+fetchpriority=high. Others: lazy. All: decoding=async. WebP+AVIF via CF Image Transforms (format=auto). srcset 320/640/1280/1920w. Inline SVGs <2KB. 1s LCP delay = 7% conversion loss.

## Fallback Chain
1. GPT Image 1.5 (scenes/hero/OG -- best quality) 2. Ideogram v3 (logos/icons) 3. GPT Image 1-mini (bulk drafts) 4. Pexels (200/hr) 5. Unsplash (50/hr) 6. Pixabay (100/hr) 7. Replicate (specialty).
All keys: project .env.local or shared key pool.
