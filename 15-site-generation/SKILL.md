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

## Dual-Template Architecture (***TWO REPOS — NEVER CONFUSE***)

| Template | Repo | Use Case | Stack |
|----------|------|----------|-------|
| **Local Business** | `megabytespace/template.projectsites.dev` | Restaurant, salon, medical, legal, fitness, contractor, retail, etc. | Vite+React+Tailwind+shadcn/ui, 15 local components, CSS var brand slots, conversion tracking |
| **SaaS** | `megabytespace/saas-starter` | SaaS products, APIs, dev tools, platforms | Hono+D1+Clerk+Stripe+Inngest+Resend on CF Workers, ESLint+Prettier |

**Template selection logic:** Container entrypoint checks `_form_data.json.category`. If category ∈ {restaurant,cafe,salon,spa,medical,dental,legal,fitness,automotive,construction,photography,real_estate,education,financial,retail,pet_services,wedding,church,nonprofit,government} → clone `template.projectsites.dev`. If category ∈ {saas,api,platform,devtool,marketplace} → clone `saas-starter`. Unknown → default to local business.

**Auto-sync workflow (***EVERY PROMPT***):** After ANY change to skills 05-15, evaluate: "Does this improve the template?" If yes → push to the appropriate template repo in the same prompt. Changes to: design patterns/components/CSS → `template.projectsites.dev` | API patterns/auth/billing/middleware → `saas-starter` | both → push to both. Template repos must always reflect current best practices from skills.

## Philosophy

A perfect website CANNOT be created with a single LLM call. It requires a Principal SE-level prompt that orchestrates research→build→inspect→fix loops. The system front-loads ALL research and assets BEFORE Claude Code touches code, then gives it one comprehensive prompt with everything pre-digested. Claude Code starts from a pre-installed template and customizes it — never generates from scratch.

**Quality bar:** Stripe/Linear/Vercel-level polish. Every site must be so good the business owner prefers it over their original. We don't copy — we take any website and make it dramatically better. Information-dense sites get condensed into gorgeous, well-organized modern designs with MORE useful information in FEWER, better-designed pages.

## Pipeline Overview

```
Phase 0: Pre-Research + Media Acquisition (***RUNS IN ALL BUILD MODES***)
  → Google Places, website scraping, social verification, brand extraction, media discovery
  → Download ALL images from original website (logo, photos, blog images)
  → Stock photos via Unsplash/Pexels/Pixabay APIs
  → AI-generated originals via GPT Image 1.5 / Stability AI
  → YouTube/Pexels video embeds
  → Output: _research.json, _scraped_content.json, _assets/ folder with all images
  → HARD GATE: <10 images in assets/ = build NOT complete

Phase 1: Single Claude Code Prompt (Container OR manual session)
  → Reads all _ prefixed context files (or performs Phase 0 inline if manual)
  → Customizes pre-installed Vite+React+Tailwind+shadcn/ui template
  → Builds 4-8 page site with real content, real images, real brand
  → Clean URL slugs (never copy CMS garbage like -1 suffixes)
  → Runs npm run build → node inspect.js → fixes issues → rebuilds
  → Uploads all files to R2 via bundled upload script

Phase 2: Post-Build Verification (Worker)
  → Screenshot via microlink.io → GPT-4o vision scoring
  → D1 status update → email notification
```

***CRITICAL: In manual/prompt-based builds (no container), Phase 0 runs INLINE as the first step of Claude Code's work. The agent MUST: (1) WebFetch original site pages and extract all image URLs, (2) curl/download images to public/, (3) search for stock photos and download, (4) generate AI images if API keys available — ALL BEFORE writing any React code. A text-only site is a failed build. See build-prompts.md "Media Acquisition" section.***

## Single-Prompt Architecture

The container receives ONE prompt that encompasses all build phases. The prompt references `~/.agentskills/15-site-generation/` for methodology. Context files written to the build directory before Claude Code runs:

`_research.json`→business profile+hours+phone+address+reviews+geo (Google Places+Workers AI) | `_brand.json`→colors+fonts+personality+logo URL+color_source (brand extraction) | `_citations.json`→APA 7th ed bibliography keyed by refId for every quantitative claim (rules/citations.md) | `_scraped_content.json`→all pages from existing website by URL (scraper) | `_assets.json`→image manifest with metadata (discovery pipeline) | `_image_profiles.json`→GPT-4o analysis per image: quality+placement+colors (profiling) | `_videos.json`→YouTube/Pexels embed URLs+metadata | `_places.json`→Google Places enrichment: photos+reviews+rating | `_form_data.json`→user-submitted form data from /create | `_domain_features.json`→category-specific feature requirements (template cache)

## Build Rules (NON-NEGOTIABLE)

**Images:** USE ALL images in assets/. Never use external URLs (hotlinking blocked). Hero: assets/hero-*. Gallery: full-width slider with ALL images. Service cards: relevant images. No image in assets/ left unused. ***Minimum 30 unique images per site*** (discovered + AI-generated originals + stock). 3-5 AI-generated originals per site (hero backgrounds, service illustrations, textures). The site must feel media-rich from first scroll — no sparse pages. All images processed through optimization pipeline (skill 12 image-optimization.md): WebP+AVIF at 320/640/1280/1920w, blur placeholders, dominant color extraction. Use <ResponsiveImage> component — never raw <img> with PNG/JPG src. **Dedupe via 301, not deletion:** when md5-hashed twins exist, keep canonical, delete twin, emit `{deleted-url:canonical}` to a Worker redirect map (`build-image-redirects.mjs` reference). Source-code refs use FULL canonical filenames (`pseg-feb-2023-1.jpg`), never short aliases (`pseg-1.jpg`) — the alias breaks the moment dedupe runs.

**Per-route SEO (***EVERY ROUTE — UNIQUE TITLE/DESC/KEYPHRASE/JSON-LD***):** SPAs must dynamically swap meta on `useLocation()` change via a `<PageHead />` side-effect component reading `src/data/page-meta.ts`. Each route entry: title 50-60ch keyphrase-first, description 120-156ch, researched intent-based keyphrase (`donate to {city} soup kitchen` not generic "best"), canonical, og:*, twitter:*, JSON-LD (Org/Service/BlogPosting/BreadcrumbList/FAQPage). Blog posts derive meta dynamically from `blogPosts[]`. Hard gate: every `<Route path>` in App.tsx has a `page-meta.ts` entry or data-derived meta — no fallback `index.html` `<title>` showing on production routes.

**Font-flash mitigation (***NEVER FLASH UNSTYLED FONT***):** `index.html` `<head>` includes `<link rel="preload" as="style">` + animate.css + a `html:not(.fonts-loaded) body { opacity: 0 }` style + an inline `document.fonts.ready.then(reveal)` script with `setTimeout(reveal, 1200)` safety net. Page fades in once fonts load. All in-page motion uses animate.css transform/opacity classes (`animate__fadeInUp animate__faster`) gated on `prefers-reduced-motion`.

**Hero context match (***IMAGE MUST DEPICT PAGE TOPIC***):** Every hero image/video literally depicts what the page is about — `/mass-schedule` gets stained-glass-window, `/donate` gets volunteers-serving, `/health-clinic` gets medical imagery. Never reuse a generic kitchen/food shot across topically-different pages. AI-vision QA scores `image_matches_page_topic` 0-10 per hero; <8 = replace.

**Empty-config widgets (***NEVER SHIP EMPTY data-sitekey OR PLACEHOLDER URLS***):** Gate every third-party widget render on its env var being set: `{import.meta.env.VITE_TURNSTILE_SITEKEY ? <div className="cf-turnstile" data-sitekey={...} /> : null}`. Same for Stripe pk, PostHog snippet, Resend embed. Empty `data-sitekey=""` produces a console error on every page render — caught only by post-deploy `scan-assets.mjs`, never by the bash route sweep.

**Post-deploy parallel scan (***BOTH SCRIPTS RUN OR DEPLOY NOT VERIFIED***):** `scripts/scan-assets.mjs` (Playwright concurrency 6, captures console errors/warnings + `requestfailed` + `response.status>=400` per route) AND `scripts/check-routes.sh` (curl every route + every blog slug for non-200) BOTH run as the last step of every deploy. Reference scripts in `~/.agentskills/15-site-generation/`. Bash sweep alone misses asset 404s and console errors; Playwright alone is slower. Both green = deploy verified; any error = redeploy after fix.

**Design:** Dark-first, brand-extracted base color (skill 10 design patterns — MANDATORY). 10+ @keyframes animations. Glassmorphism cards (bg-white/5 backdrop-blur-md border-white/10). Gradient text on key headings. Parallax-style depth on hero. 25+ inline SVG decorative elements. Every interactive element has hover+active+focus states. Smooth scroll for ALL same-page nav (scrollIntoView, never #href jumps).

**Content:** Word count must MATCH OR EXCEED original site — never ship a site with less content than before. 5000+ words minimum. Migrate ALL blog posts, news, events, team bios from scraped content. About page 2000+ words. Every claim factually accurate from research. Blog → individual routes per post with RSS feed. Addresses → Google Maps links. Phone → tel: links. Email → mailto: links. NO lorem ipsum, NO placeholder text, NO TODO stubs. URL preservation: every original URL must resolve (200 or 301) — generate `_redirects` file for merged pages.

**SEO:** JSON-LD LocalBusiness with ALL structured data. OG tags with hero image. Twitter cards. Canonical URL. robots.txt + sitemap.xml. Primary keyword in H1+title+meta+first paragraph. FAQ section with FAQPage schema. Breadcrumbs with BreadcrumbList schema.

**Brand:** Extract colors from LOGO first → website → signage in photos (see skill 09 "Brand Extraction from Physical Assets" section). Never guess from category. Use ALL original content from scraped site. Logo must appear in every header. Brand fonts influence entire design. Logo extraction is MANDATORY: download from original site header/nav img, convert to PNG, generate header-sized variant (200px height) + full-size + favicon. NEVER use placeholder SVG icons when a real logo exists on the original site.

**Tech:** Vite+React+Tailwind+shadcn/ui. React Router for multi-page nav. IntersectionObserver for scroll animations. Lucide React icons (verified names only). `npm run build` must compile zero errors. `prefers-reduced-motion` on ALL animations (see skill 11). 16 local business components from template-system.md: HeroWithPhoto, ServiceCards, TestimonialCarousel, MapEmbed, StickyPhoneCTA, NAPFooter, TrustBadges, ReviewCTA, GalleryGrid, BeforeAfterSlider, QuickActions, EmergencyBanner, SpeedDial, BookingEmbed, LocalSchemaGenerator, ResponsiveImage. PWA manifest + favicon set + print stylesheet mandatory. Service worker for offline mode mandatory — local business customers need contact info without connectivity.

**Cursors (***EVERY CLICKABLE ELEMENT GETS THE RIGHT CURSOR — NEVER DEFAULT***):** Safari ships a `default` cursor on `<button>` unless `cursor:pointer` is explicit. Ship a global rule in `index.css` `@layer utilities`: `button:not(:disabled), a[href], [role="button"]:not([aria-disabled="true"]), [role="link"], [role="tab"], [role="menuitem"], [role="option"], summary, label[for], input[type="submit"|"button"|"reset"|"checkbox"|"radio"], select { cursor: pointer; }` plus `button:disabled, [aria-disabled="true"] { cursor: not-allowed; }` plus text inputs/textareas → `cursor: text`. Custom cursors per context: image previews → `zoom-in` on the trigger + `zoom-out` on the modal backdrop, drag handles → `grab`/`grabbing`, resize handles → `ew-resize`/`ns-resize`, loading states → `wait`. Carousel arrows, lightbox arrows, lightbox X close, accordion toggles, tab triggers, all `<div onClick>` shims — all need `cursor: pointer` explicitly. Hard gate: visual-qa screenshots hover state on every interactive element; any `default` cursor on a clickable surface = fail.

**Modals & Lightboxes (***RENDER VIA PORTAL TO `<body>`, USE FIXED POSITIONING + REAL SCROLL LOCK***):** Always render modals through `createPortal(modal, document.body)` so transformed/filtered ancestors can never break `position: fixed`. Pin to viewport with `position: fixed; inset: 0; width: 100vw; height: 100dvh; z-index: 100;`. Use `100dvh` not `100vh` to handle iOS dynamic chrome correctly. Scroll lock: `body.style.position = 'fixed'; body.style.top = '-${scrollY}px'; body.style.width = '100%'; body.style.overflow = 'hidden'`. On close: restore the styles AND `window.scrollTo(0, scrollY)` to put the user back where they were. Never just `body.style.overflow = 'hidden'` — that doesn't lock scroll on iOS Safari. Add `overscroll-behavior: contain` on the modal root to prevent scroll chaining. Verify by clicking gallery images at the very bottom of long pages — modal must center exactly in the viewport, not where the scroll position was.

**Analytics (***NON-NEGOTIABLE — skill 13***):** PostHog snippet (`persistence:'memory'`, cookie-free) + GA4/GTM container + local conversion tracking (phone_click, direction_click, form_submit, booking_click). See skill 13 conversion-optimization.md for event taxonomy. Every `tel:` link fires phone_click. Every Maps link fires direction_click. Every form submit fires form_submit.

## Container Architecture

Container is a stateless Claude Code executor on CF Workers Containers. Pre-bakes: `@anthropic-ai/claude-code`, `~/.agentskills` (this repo), `~/template-local` (megabytespace/template.projectsites.dev), `~/template-saas` (megabytespace/saas-starter), `~/upload-to-r2.mjs` (R2 upload script), `~/inspect.js` (visual QA), `~/validate-urls.js` (URL preservation validator), `~/validate-citations.js` (citation gate via citation-js npm), `~/format-citations.js` (BibTeX/RIS/CSL→APA 7th converter). Runs as non-root `cuser` with `--dangerously-skip-permissions`.

The container entrypoint: HTTP server on 8080. POST /build → select template from `_form_data.json.category` (local→`~/template-local`, saas→`~/template-saas`) → copy to `~/build/` → write context files → write CLAUDE.md → run single `claude -p` → on completion, run `npm run build` → run `node ~/validate-urls.js` (fail if original URLs unaccounted) → run `node ~/validate-citations.js dist/` (fail if any unsourced numeric claim) → run `node ~/inspect.js dist/index.html` → run `node ~/upload-to-r2.mjs` → return status. GET /status → poll job. GET /result → return metadata.

**R2 upload script** runs inside the container after build. Uses CF REST API (`api.cloudflare.com/client/v4/accounts/{acctId}/r2/buckets/{bucket}/objects/{key}`). Detects Vite projects via dist/ prefix. dist/ files → `sites/{slug}/{version}/`. Source → `sites/{slug}/{version}/_src/`. Writes `_manifest.json`. Credentials passed as env vars.

## Env Vars Available in Container

API keys passed from Worker → container: ANTHROPIC_API_KEY, OPENAI_API_KEY, UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, PIXABAY_API_KEY, YOUTUBE_API_KEY, LOGODEV_TOKEN, BRANDFETCH_API_KEY, FOURSQUARE_API_KEY, YELP_API_KEY, GOOGLE_PLACES_API_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX, IDEOGRAM_API_KEY, REPLICATE_API_TOKEN, STABILITY_API_KEY, GOOGLE_MAPS_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MAPBOX_TOKEN.

R2 credentials: CF_API_TOKEN, CF_ACCOUNT_ID, R2_BUCKET_NAME, SITE_SLUG, SITE_VERSION.

Donation/payment: STRIPE_PAYMENT_LINK_URL (for DonationForm component, nonprofit/church sites).

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

## Post-Launch Email Sequence (***DISABLED BY DEFAULT***)

After site generation, the pipeline CAN auto-send a welcome email to the business owner (extracted from `_research.json.contact.email` or `_form_data.json.email`). Currently disabled — enable via `ENABLE_POST_LAUNCH_EMAIL=true` env var in container.

**Sequence (Resend + Inngest):**
1. **Immediate:** "Your new website is live at {slug}.projectsites.dev" — screenshot, direct link, QR code
2. **Day 3:** "Claim your Google Business listing" — step-by-step with deep link to `business.google.com/create`
3. **Day 7:** "Get your first 5-star review" — review QR card PDF, email template, SMS template
4. **Day 14:** "Share your site on social media" — pre-written posts for Facebook/Instagram/LinkedIn
5. **Day 30:** "Your first month: {pageviews} visitors, {calls} calls" — PostHog analytics summary

**Implementation:** Inngest step functions with scheduled delays. Each step checks `_research.json.contact.email` validity. Unsubscribe link in every email. CAN-SPAM compliant. Templates in Resend with brand colors from `_brand.json`.

**Trigger:** Worker sends Inngest event `site/launched` with slug+email+brandColors after successful build+deploy. Inngest function handles timing.

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
