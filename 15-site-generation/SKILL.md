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
  - local-seo.md
---

# 15 -- Site Generation

Submodules: research-pipeline.md (API-driven business research, scraping, enrichment), media-acquisition.md (image/video/logo sourcing from 12+ APIs), build-prompts.md (master prompt + enhancement phases), quality-gates.md (tiered visual inspection, SEO audit, accessibility), domain-features.md (category-specific features for 18+ business types), template-system.md (Vite+React+Tailwind+shadcn/ui starter, customization patterns), local-seo.md (citation building, GBP sync, review generation, trust badges, local conversion tracking).

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

Never waste API credits on speculative builds. If error: reduce to simplest reproducible state first. Fix issues as separate minimal tests. Only trigger full builds when pipeline proven working.

**Two separate budgets — don't confuse them:**
1. **GPT-4o vision QA: ***$1 HARD CAP.*** ** Image profiling FREE (Workers AI) + hero pick ~$0.02 (GPT-4o), logo pick ~$0.02, inspect.js draft rounds FREE (Workers AI) + final homepage ~$0.02, post-deploy homepage QA ~$0.02. Homepage/ATF gets GPT-4o priority. Total ~$0.08-0.15 typical.
2. **Media generation/acquisition: $0.50-2.00 (GOOD spend).** Ideogram logos ~$0.05, GPT Image 1.5 originals ~$0.04/each (5-10 per site), Stability textures ~$0.03/each, stock APIs (free tiers). This spend CREATES the content that makes sites convert — never cap it below what's needed for 30-50 images + 3-5 videos per site.

## Unit Economics at Scale (***1M+ SITES***)

### Per-Site Cost Model (current → optimized)

| Component | Current | At Scale | Notes |
|-----------|---------|----------|-------|
| **Code generation** | $0.50-2.00 (Claude Code) | $0.02-0.05 (Workers AI) | Llama 3.3 70B for template fill, Claude only for complex/custom |
| **Research APIs** | ~$0.01 (Google Places) | ~$0.005 | Batch + cache nearby businesses, reuse geo data |
| **Web scraping** | ~$0 (fetch) | ~$0 | CF Workers fetch, zero cost |
| **Image profiling** | ~$0.02 (Workers AI bulk + GPT-4o hero) | ~$0.01 (Workers AI) | Llama Vision for all, GPT-4o hero pick only |
| **Logo generation** | ~$0.05 (Ideogram) | ~$0.05 | No cheap alternative for quality logos |
| **AI images** | ~$0.30 (5-8 GPT Image) | ~$0.10 (Workers AI SDXL) | Edge inference, bulk pricing, category caching |
| **Stock images** | ~$0 (free tiers) | ~$0 | Unsplash/Pexels/Pixabay unlimited for most uses |
| **Video discovery** | ~$0 (YouTube embed) | ~$0 | YouTube/Pexels embeds, no storage |
| **Vision QA** | ~$0.06 (Workers AI bulk + GPT-4o homepage) | ~$0.02 (Workers AI) | Workers AI all pages, GPT-4o homepage ATF only |
| **In-container inspect** | ~$0.02 (Workers AI draft + GPT-4o final) | ~$0.005 (Workers AI) | Workers AI drafts, GPT-4o final homepage only |
| **R2 storage** | ~$0 (free egress) | ~$0.001/site/mo | ~5MB/site × 1M = 5TB, $0.015/GB/mo |
| **D1 database** | ~$0 | ~$0.001/site/mo | Row storage minimal |
| **Container compute** | ~$0.10 (CF Container) | ~$0.02 | Pre-warm pools, shorter runs with template engine |
| **DNS/routing** | ~$0 | ~$0 | Wildcard *.projectsites.dev |
| **TOTAL** | **$1.00-3.50** | **$0.25-0.40** | 80-90% cost reduction at scale |

### Scale Optimization Strategies

**Tier 1: Template Engine (80% of sites, $0.10-0.20/site)**
Most local businesses (restaurant, salon, medical, legal) are structurally identical. Pre-build 18 category templates as complete React apps. Worker fills data slots (business name, hours, phone, colors, images) via string replacement — NO LLM needed. Workers AI Llama 3.3 70B generates copy (about text, service descriptions, FAQs) at $0.001/1K tokens. Reserve Claude Code for custom/complex sites only.

**Tier 2: Workers AI First (15% of sites, $0.20-0.40/site)**
Sites needing layout customization beyond templates. Workers AI generates component JSX (not full site). Llama Vision replaces GPT-4o for image profiling and QA. Edge inference = zero network latency, included in Workers Paid plan.

**Tier 3: Claude Code (5% of sites, $1.50-4.00/site)**
Complex multi-page sites, custom designs, SaaS, portfolios with unique layouts. Full container build. Worth the cost — these are premium-priced sites.

### Media Caching (***MASSIVE SAVINGS***)

**Category media pools:** Pre-generate and cache 500+ stock-quality images per business category (restaurant interiors, salon styling, dental offices, law offices, etc.). Store in R2 `media-pools/{category}/`. Each new site draws from pool + adds discovered originals. Amortized cost: $0.00/site for stock imagery after pool is built.

**Logo template caching:** For businesses without logos, pre-generate 50 logo templates per category (text-based with industry icons). Workers AI picks best match → Ideogram refines with business name. Cost drops from $0.05 to ~$0.02/logo.

**Texture/pattern library:** Pre-generate 200 abstract backgrounds, gradients, geometric patterns in brand-neutral colors. Apply CSS color filter per site. Cost: $0 after initial generation.

### API Rate Limit Strategy at Scale

| API | Free Tier | Paid | Strategy |
|-----|-----------|------|----------|
| Google Places | 0 (pay per req) | $17/1K requests | Cache aggressively, batch nearby |
| Unsplash | 50/hr | Unlimited (apply) | Apply for production API, cache by query |
| Pexels | 200/hr | 200/hr | Pool across Workers, queue system |
| Pixabay | 100/hr | 100/hr | Same pooling |
| Ideogram | pay per gen | Volume pricing | Batch logo generation via Queues |
| GPT Image | pay per gen | Batch API (50% off) | Use Batch API for all image gen |
| Workers AI | 10K neurons free | Included in paid | DEFAULT for all inference at scale |

### Batch Processing Architecture

```
CF Queue → Fan-Out Workers → Parallel Phases:
  Phase 0: Research Worker (Google Places + scrape) → _research.json to R2
  Phase 1: Media Worker (stock APIs + AI gen + profiling) → assets/ to R2  
  Phase 2: Build Worker (template fill OR Workers AI OR Container)
  Phase 3: QA Worker (a11y tree + optional vision) → score to D1
  Phase 4: Publish Worker (DNS + CDN purge + D1 status)
```

Queue-based: 1000 concurrent builds, auto-retry on failure, dead letter queue for manual review. Each phase independent → massive parallelism. Target: 10K sites/hour sustained, 100K sites/day burst.

### Break-Even Analysis

| Volume | Cost/Site | Total | Revenue @ $50/site | Margin |
|--------|-----------|-------|---------------------|--------|
| 1K | $2.50 | $2,500 | $50,000 | 95% |
| 10K | $1.00 | $10,000 | $500,000 | 98% |
| 100K | $0.40 | $40,000 | $5,000,000 | 99.2% |
| 1M | $0.30 | $300,000 | $50,000,000 | 99.4% |

At 1M sites, infrastructure + API costs are <1% of revenue. The bottleneck is customer acquisition, not unit economics.
