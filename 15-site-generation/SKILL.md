---
name: "site-generation"
description: "End-to-end AI website generation pipeline. Single Claude Code prompt builds complete Vite+React+Tailwind sites from business data. Pre-research via APIs, media acquisition, brand extraction, visual inspection via GPT-4o, R2 upload, D1 status updates. Supports all business types: SaaS, portfolio, non-profit, restaurant, salon, medical, legal, retail, tech."
metadata:
  version: "1.0.0"
  updated: "2026-04-24"
  effort: "xhigh"
  model: "opus"
  context: "fork"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - research-pipeline.md
  - media-acquisition.md
  - build-prompts.md
  - quality-gates.md
  - domain-features.md
  - template-system.md
---

# 15 -- Site Generation

Submodules: research-pipeline.md (API-driven business research, scraping, enrichment), media-acquisition.md (image/video/logo sourcing from 12+ APIs), build-prompts.md (master prompt + enhancement phases), quality-gates.md (GPT-4o visual inspection, SEO audit, accessibility), domain-features.md (category-specific features for 15+ business types), template-system.md (Vite+React+Tailwind+shadcn/ui starter, customization patterns).

## Philosophy

A perfect website CANNOT be created with a single LLM call. It requires a Principal SE-level prompt that orchestrates research→build→inspect→fix loops. The system front-loads ALL research and assets BEFORE Claude Code touches code, then gives it one comprehensive prompt with everything pre-digested. Claude Code starts from a pre-installed template and customizes it — never generates from scratch.

**Quality bar:** Stripe/Linear/Vercel-level polish. Every site must be so good the business owner prefers it over their original. We don't copy — we take any website and make it dramatically better. Information-dense sites get condensed into gorgeous, well-organized modern designs with MORE useful information in FEWER, better-designed pages.

## Pipeline Overview

```
Phase 0: Pre-Research (Worker, no Claude Code)
  → Google Places, website scraping, social verification, brand extraction, media discovery
  → Output: _research.json, _scraped_content.json, _assets/ folder with all images

Phase 1: Single Claude Code Prompt (Container)
  → Reads all _ prefixed context files
  → Customizes pre-installed Vite+React+Tailwind+shadcn/ui template
  → Builds 4-8 page site with real content, real images, real brand
  → Runs npm run build → node inspect.js → fixes issues → rebuilds
  → Uploads all files to R2 via bundled upload script

Phase 2: Post-Build Verification (Worker)
  → Screenshot via microlink.io → GPT-4o vision scoring
  → D1 status update → email notification
```

## Single-Prompt Architecture

The container receives ONE prompt that encompasses all build phases. The prompt references `~/.agentskills/15-site-generation/` for methodology. Context files written to the build directory before Claude Code runs:

`_research.json`→business profile+hours+phone+address+reviews+geo (Google Places+Workers AI) | `_brand.json`→colors+fonts+personality+logo URL+color_source (brand extraction) | `_scraped_content.json`→all pages from existing website by URL (scraper) | `_assets.json`→image manifest with metadata (discovery pipeline) | `_image_profiles.json`→GPT-4o analysis per image: quality+placement+colors (profiling) | `_videos.json`→YouTube/Pexels embed URLs+metadata | `_places.json`→Google Places enrichment: photos+reviews+rating | `_form_data.json`→user-submitted form data from /create | `_domain_features.json`→category-specific feature requirements (template cache)

## Build Rules (NON-NEGOTIABLE)

**Images:** USE ALL images in assets/. Never use external URLs (hotlinking blocked). Hero: assets/hero-*. Gallery: full-width slider with ALL images. Service cards: relevant images. No image in assets/ left unused. ***Minimum 30 unique images per site*** (discovered + AI-generated originals + stock). 3-5 AI-generated originals per site (hero backgrounds, service illustrations, textures). The site must feel media-rich from first scroll — no sparse pages.

**Design:** Dark theme preferred (#0a0a1a base). 10+ @keyframes animations. Glassmorphism cards (bg-white/5 backdrop-blur-md border-white/10). Gradient text on key headings. Parallax-style depth on hero. 25+ inline SVG decorative elements. Every interactive element has hover+active+focus states. Smooth scroll for ALL same-page nav (scrollIntoView, never #href jumps).

**Content:** 5000+ words real content. About page 2000+ words. Every claim factually accurate from research. Addresses → Google Maps links. Phone → tel: links. Email → mailto: links. NO lorem ipsum, NO placeholder text, NO TODO stubs.

**SEO:** JSON-LD LocalBusiness with ALL structured data. OG tags with hero image. Twitter cards. Canonical URL. robots.txt + sitemap.xml. Primary keyword in H1+title+meta+first paragraph. FAQ section with FAQPage schema. Breadcrumbs with BreadcrumbList schema.

**Brand:** Extract colors from LOGO first → website → signage in photos. Never guess from category. Use ALL original content from scraped site. Logo must appear in every header. Brand fonts influence entire design.

**Tech:** Vite+React+Tailwind+shadcn/ui. React Router for multi-page nav. IntersectionObserver for scroll animations. Lucide React icons (verified names only). `npm run build` must compile zero errors.

## Container Architecture

Container is a stateless Claude Code executor on CF Workers Containers. Pre-bakes: `@anthropic-ai/claude-code`, `~/.agentskills` (this repo), `~/template` (starter project), `~/upload-to-r2.mjs` (R2 upload script). Runs as non-root `cuser` with `--dangerously-skip-permissions`.

The container entrypoint: HTTP server on 8080. POST /build → copy template → write context files → write CLAUDE.md → run single `claude -p` → on completion, run `npm run build` → run `node ~/upload-to-r2.mjs` → return status. GET /status → poll job. GET /result → return metadata.

**R2 upload script** runs inside the container after build. Uses CF REST API (`api.cloudflare.com/client/v4/accounts/{acctId}/r2/buckets/{bucket}/objects/{key}`). Detects Vite projects via dist/ prefix. dist/ files → `sites/{slug}/{version}/`. Source → `sites/{slug}/{version}/_src/`. Writes `_manifest.json`. Credentials passed as env vars.

## Env Vars Available in Container

API keys passed from Worker → container: ANTHROPIC_API_KEY, OPENAI_API_KEY, UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, PIXABAY_API_KEY, YOUTUBE_API_KEY, LOGODEV_TOKEN, BRANDFETCH_API_KEY, FOURSQUARE_API_KEY, YELP_API_KEY, GOOGLE_PLACES_API_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX, IDEOGRAM_API_KEY, REPLICATE_API_TOKEN, STABILITY_API_KEY, GOOGLE_MAPS_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MAPBOX_TOKEN.

R2 credentials: CF_API_TOKEN, CF_ACCOUNT_ID, R2_BUCKET_NAME, SITE_SLUG, SITE_VERSION.

## Site Types Supported

**Local business:** Restaurant, salon, medical, legal, fitness, automotive, construction, photography, real estate, education, financial, cafe, retail. Category-specific features loaded from domain-features.md.

**SaaS:** Feature comparison tables, pricing tiers (3-column), integrations grid, API documentation page, changelog, status page link, trust badges (SOC2, GDPR), free trial CTA, demo video hero.

**Portfolio:** Masonry project grid, case study pages, client logos, testimonials carousel, skills/tech stack, resume/CV page, contact form with project brief fields.

**Non-profit:** Donation CTA (prominent, multiple placements), impact counters (animated), volunteer signup, event calendar, newsletter signup, partner logos, annual report highlights, mission statement hero.

**Government/institutional:** Clean navigation for dense content, accessibility-first, multi-language support, document library, news/press section, org chart, service finder.

## Credit Discipline (***NON-NEGOTIABLE***)

Never waste API credits on speculative builds. If error: reduce to simplest reproducible state first. Fix issues as separate minimal tests. Only trigger full builds when pipeline proven working. Each Claude Code prompt ~$0.50-2.00. Each full build ~$3-8. Treat credits as scarce.

**Two separate budgets — don't confuse them:**
1. **GPT-4o vision QA: ***$1 HARD CAP.*** ** Image profiling ~$0.15, logo pick ~$0.05, inspect.js ~$0.03/round, post-deploy QA ~$0.10-0.20. Homepage/ATF gets vision priority. Total ~$0.35-0.45 typical.
2. **Media generation/acquisition: $0.50-2.00 (GOOD spend).** Ideogram logos ~$0.05, GPT Image 1.5 originals ~$0.04/each (5-10 per site), Stability textures ~$0.03/each, stock APIs (free tiers). This spend CREATES the content that makes sites convert — never cap it below what's needed for 30-50 images + 3-5 videos per site.
