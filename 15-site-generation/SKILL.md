---
name: "site-generation"
description: "End-to-end AI website generation pipeline. Claude Opus 4.7 emits Bolt-style <boltArtifact> envelopes (multi-file, plan-first) that customize Vite+React+Tailwind templates from pre-researched business data. Pre-research via APIs, media acquisition, brand extraction, visual inspection via GPT-4o, R2 upload (per-file content-type by extension), D1 status updates. Supports all business types: SaaS, portfolio, non-profit, restaurant, salon, medical, legal, retail, tech."
metadata:
  version: "2.0.0"
  updated: "2026-04-30"
  effort: "xhigh"
  model: "claude-opus-4-7"
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
  - bolt-artifact-protocol.md
  - blog-import.mjs
  - validate-assets.mjs
---

# 15 -- Site Generation

Submodules: research-pipeline.md (API-driven business research, scraping, enrichment), media-acquisition.md (image/video/logo sourcing across 17 engines incl. Flux 1.1 Pro Ultra, Ideogram 3.0, Recraft V3, GPT Image 1.5, Sora — Pexels-first/AI-fallback, pHash dedup), build-prompts.md (master prompt + enhancement phases), quality-gates.md (Lighthouse CI v0.15+, axe-core/playwright v4.11+ WCAG 2.2 AA, source-parity diff, 3-tier visual regression, console-error gate, Recommendations Loop), domain-features.md (category-specific features for 18+ business types), template-system.md (Vite+React+Tailwind+shadcn/ui starter, customization patterns), local-seo.md (citation building, GBP sync, review generation, trust badges, local conversion tracking), bolt-artifact-protocol.md (<boltArtifact> XML envelope spec — ordered file/shell actions, PLAN.md-first, runtime parser+executor, anti-patterns, ~$6/site at 80K output tokens), blog-import.mjs (RSS-first crawl + Squarespace JSON fallback → strip CMS residue → GPT-4o-mini typed-block restructure → pHash dedup → src/data/blog-posts.ts emission), validate-assets.mjs (post-build R2/dist gate — 13 mandatory files + every img/link/script/source ref resolves OR matches external host allowlist).

## Dual-Template Architecture (***TWO REPOS — NEVER CONFUSE***)

| Template | Repo | Use Case | Stack |
|----------|------|----------|-------|
| **Local Business** | `megabytespace/template.projectsites.dev` | Restaurant, salon, medical, legal, fitness, contractor, retail, etc. | Vite+React+Tailwind+shadcn/ui, 15 local components, CSS var brand slots, conversion tracking |
| **SaaS** | `megabytespace/saas-starter` | SaaS products, APIs, dev tools, platforms | Hono+D1+Clerk+Stripe+Inngest+Resend on CF Workers, ESLint+Prettier |

**Template selection logic:** Container entrypoint checks `_form_data.json.category`. If category ∈ {restaurant,cafe,salon,spa,medical,dental,legal,fitness,automotive,construction,photography,real_estate,education,financial,retail,pet_services,wedding,church,nonprofit,government} → clone `template.projectsites.dev`. If category ∈ {saas,api,platform,devtool,marketplace} → clone `saas-starter`. Unknown → default to local business.

**Auto-sync workflow (***EVERY PROMPT***):** After ANY change to skills 05-15, evaluate: "Does this improve the template?" If yes → push to the appropriate template repo in the same prompt. Changes to: design patterns/components/CSS → `template.projectsites.dev` | API patterns/auth/billing/middleware → `saas-starter` | both → push to both. Template repos must always reflect current best practices from skills.

## Philosophy

A perfect website CANNOT be created with a single LLM call. It requires a Principal SE-level prompt that orchestrates research→build→inspect→fix loops. The system front-loads ALL research and assets BEFORE Claude Code touches code, then gives it one comprehensive prompt with everything pre-digested. Claude Code starts from a pre-installed template and customizes it — never generates from scratch.

**Generation protocol (***Bolt-style `<boltArtifact>` ENVELOPE — see `bolt-artifact-protocol.md`***):** The model emits ONE XML envelope containing an ordered sequence of `<boltAction type="file" filePath="…">` and `<boltAction type="shell">` actions. First action is ALWAYS `PLAN.md` (route tree, design-token diff, media count, file count, validators) — auditable post-build, not a chat artifact. Replaces the legacy single-inline-HTML output (Llama 3.1 70B → 16K-token monolith) which fundamentally couldn't produce the multi-page, media-rich, blog-bearing sites the platform promises. Runtime parser (`projectsites.dev/.../services/artifact_parser.ts`) validates first-action-is-PLAN.md + required-files set + npm…build shell action; failures re-prompt the model with the error list (max 2 retries). Executor (`artifact_executor.ts`) supports two modes: `r2-files` uploads each servable file to `sites/{slug}/{version}/{path}` with content-type by extension (skips source-only files like `src/`, `package.json`, `vite.config.*`, and shell actions); `container` runs `git clone template → npm install → vite build → upload dist/` inside Cloudflare Containers (gated behind `ContainerModeNotProvisionedError` until container provisioned). Choose `container` when the artifact emits source code (the default per the new generator prompt) and `r2-files` when emitting pre-built static HTML/CSS/JS.

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

Phase 1: Claude Opus 4.7 Bolt-Artifact Emission (Worker OR Container)
  → Reads all _ prefixed context files
  → Emits ONE <boltArtifact> envelope with ordered <boltAction> file/shell tags
  → First action ALWAYS PLAN.md (route tree, design tokens, media+file counts, validators)
  → Customizes pre-installed Vite+React+Tailwind+shadcn/ui template via file actions
  → Builds 1:N-page site MATCHING source sitemap (every URL recreated, max 1000); never caps at 4–8 — content-thin source = condensed (≥4 pages floor for new builds), content-rich source = full mirror
  → Clean URL slugs (never copy CMS garbage like -1 suffixes)
  → Runtime parser validates first-action-PLAN.md + REQUIRED_FILES + npm…build shell action; failures re-prompt (max 2 retries)
  → Executor branches: r2-files (Worker uploads pre-built static files to R2 with content-type per extension) OR container (clone template → npm install → vite build → upload dist/)

Phase 2: Post-Build Verification (Worker)
  → Screenshot via microlink.io → GPT-4o vision scoring
  → D1 status update → email notification
```

***CRITICAL: In manual/prompt-based builds (no container), Phase 0 runs INLINE as the first step of Claude Code's work. The agent MUST: (1) WebFetch original site pages and extract all image URLs, (2) curl/download images to public/, (3) search for stock photos and download, (4) generate AI images if API keys available — ALL BEFORE writing any React code. A text-only site is a failed build. See build-prompts.md "Media Acquisition" section.***

## Single-Prompt Architecture

The container (or Worker, in r2-files mode) receives ONE prompt that encompasses all build phases. The prompt references `~/.agentskills/15-site-generation/` for methodology and instructs the model to emit a single `<boltArtifact>` envelope (see `bolt-artifact-protocol.md`). Context files written to the build directory before the model runs:

`_research.json`→business profile+hours+phone+address+reviews+geo (Google Places+Workers AI) | `_brand.json`→colors+fonts+personality+logo URL+color_source (brand extraction) | `_citations.json`→APA 7th ed bibliography keyed by refId for every quantitative claim (rules/citations.md) | `_scraped_content.json`→all pages from existing website by URL (scraper) | `_assets.json`→image manifest with metadata (discovery pipeline) | `_image_profiles.json`→GPT-4o analysis per image: quality+placement+colors (profiling) | `_videos.json`→YouTube/Pexels embed URLs+metadata | `_places.json`→Google Places enrichment: photos+reviews+rating | `_form_data.json`→user-submitted form data from /create | `_domain_features.json`→category-specific feature requirements (template cache)

## Build Rules (NON-NEGOTIABLE)

**Images:** USE ALL images in assets/. Never use external URLs (hotlinking blocked). Hero: assets/hero-*. Gallery: full-width slider with ALL images. Service cards: relevant images. No image in assets/ left unused. ***Minimum image count scales with sitemap:*** `max(30, original_image_count × 1.4, page_count × 6_home_or_4_sub)` — 4-page rebuild ⇒ 30-50 images, 50-page ⇒ 200+, 500-page ⇒ 2000+, never cap at 4-8-page-site numbers when source has more. ***Per-page floor: home ≥6 images, every sub-page ≥4***. ***Minimum 5 AI-generated DALL-E 3 originals per site*** (hero backgrounds, service illustrations, textures, narrative scenes — Brian's stated preference: use DALL-E heavily for ultra-real photography AND creative narrative imagery). The site must feel media-rich from first scroll — no sparse pages. All images processed through optimization pipeline (skill 12 image-optimization.md): WebP+AVIF at 320/640/1280/1920w, blur placeholders, dominant color extraction. Use <ResponsiveImage> component — never raw <img> with PNG/JPG src. **Dedupe via 301, not deletion:** when md5-hashed twins exist, keep canonical, delete twin, emit `{deleted-url:canonical}` to a Worker redirect map (`build-image-redirects.mjs` reference). Source-code refs use FULL canonical filenames (`pseg-feb-2023-1.jpg`), never short aliases (`pseg-1.jpg`) — the alias breaks the moment dedupe runs.

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

**Blog Grooming (***EVERY POST GETS AN AI EDITORIAL PASS — ON IMPORT AND ON DEMAND***):** Run every imported blog post through `enhance-blog-posts.mjs` (GPT-4o-mini editorial pass) before shipping. Mandates: (1) fix grammar, spelling, and Squarespace formatting residue while preserving the author's voice; (2) preserve direct quotes verbatim — never rewrite quoted speech, named people, dates, money figures, or factual claims; (3) restructure flat paragraph dumps into typed `lead | heading | paragraph | quote | callout` blocks; (4) inject 2-5 contextual interlinks per post using markdown syntax `[label](/path)` — link to other blog posts (`/blog/{slug}`) AND site sections (`/about`, `/services`, `/team`, `/volunteer`, `/donate`, `/we-need`, `/mass-schedule`, `/contact`, `/faq`); (5) always hyperlink contact references when they appear in body copy: `volunteer@njsoupkitchen.org` → `mailto:volunteer@njsoupkitchen.org`, `info@njsoupkitchen.org` → `mailto:info@njsoupkitchen.org`, `(973) 623-0822` → `tel:+19736230822`, the full street address → `/contact`. Renderer must support inline markdown links (`renderInline` regex parses `[label](url)` → `<a>`). Concurrency 5-8 against OpenAI API. CLI flags: `--only=slug`, `--limit=N`, `--concurrency=N`. Idempotent — re-running on already-enhanced posts is safe. Hard gate: every blog post must have at least 2 outbound interlinks AND zero raw `volunteer@`/`(973)`/`22 Mulberry` strings without an anchor wrapper.

**njsk.org Quality Bar (***ONE-LINE PROMPT MUST PRODUCE THIS LEVEL***):** Reference build `~/emdash-projects/njsk.org` (live https://njsk-org.manhattan.workers.dev/) is the visual+interaction floor — every generated site matches it. Mandatory: (1) 9-utility motion kit `hero-rise|text-sheen|heading-underline|card-lift|link-wipe|float-bob|badge-pop|scroll-progress|reveal-stagger`, ALL gated by `@media (prefers-reduced-motion: reduce){animation:none!important;transition:none!important}` — `hero-rise` cascades stepped 80/240/400/560ms (translateY 12px+blur(4px)→0+opacity 0→1, 0.7s cubic-bezier(0.22,1,0.36,1)); (2) Stylized hand-drawn SVG map (street grid + landmark blocks + business pin in brand color), NEVER Google Maps iframe — slow, ugly, leaks data; below map → `Get Directions →` link to `https://www.google.com/maps/dir/?api=1&destination={url-encoded-address}` target=_blank; (3) Document-level lightbox click listener auto-opens any `<img>` ≥200×200 not inside `a|button|header|footer|[data-no-zoom]` — portal to body, body-scroll-lock via `position:fixed; top:-${scrollY}px; width:100%`, `100dvh` not `100vh`, arrow keys + Escape, counter `{n}/{total}`, caption from alt; (4) WCAG 2.2 AA (NOT 2.1) — 24×24px min targets (2.5.8), focus appearance `outline:2px solid var(--brand-500); outline-offset:2px` (2.4.11), focus-not-obscured (2.4.12), consistent help (3.2.6), redundant entry (3.3.7); (5) Two Google Fonts when `formality≥0.6` — serif heading (Fraunces/Playfair/DM Serif) + sans body (Inter/DM Sans), preconnect+preload, font-loaded gate `<style>html:not(.fonts-loaded) body{opacity:0}</style>` + `document.fonts.ready.then(()=>document.documentElement.classList.add('fonts-loaded'))`; (6) 11-stop palette `--brand-50…--brand-950` via OKLCH lightness ramp from `brand_json.colors.primary` — surfaces use 50/100, text/accents use 600/700/800, dark hero overlays use 900/950; (7) Drop-cap on first paragraph `.lead::first-letter{float:left;font-size:4em;line-height:0.9;padding:0.1em 0.1em 0 0;font-family:var(--font-heading);color:var(--brand-700)}`; (8) ≥4 JSON-LD blocks — Organization + LocalBusiness + WebSite + FAQPage/BreadcrumbList; (9) Banned-word grep — `revolutionize|leverage|seamless|robust|cutting-edge|world-class|empower|game-changing|unleash|supercharge|harness|foster|bolster|paradigm|holistic|ecosystem|next-generation|best-in-class|turnkey|synergy|disrupt|elevate|streamline|cornerstone|pivotal|myriad|plethora|transform|reimagine|redefine|transcend|boundless` → ANY occurrence regenerates the page (each occurrence -0.1 to professionalism+brand_consistency); (10) IntersectionObserver on `[data-reveal]` toggles `.reveal-visible` (children stagger via `--i` custom prop); (11) Ken-Burns slow-zoom on every hero bg image (`transform: scale(1.0→1.08)` 8s alternate); (12) md5 image dedup before render — never ship same hash twice. **Pipeline order:** `import → strip_cms_residue → ai_block_typing(lead/heading/paragraph/quote/callout) → md5_image_dedup → keyword_extract → excerpt_120_180 → related_score → generate_routes(if mid+) → generate_website → score_website → structural_validator(local grep) → regen_if_below_0.6 → publish`. Full gap analysis: `~/emdash-projects/projectsites.dev/apps/project-sites/NJSK_LESSONS.md`.

**Multi-page expansion (***complexity≥mid → 5+ routes***):** Single-page is the default for `simple` businesses. For `mid` (5–8 routes) and `rich` (10–14 routes including blog index + blog/:slug), run `generate_routes` prompt FIRST to plan the route graph — each Route returns `{path, title (50-60ch), description (120-156ch), h1, sections[], jsonLdTypes[], internalLinks[]}` — then `generate_website` runs per-route with shared brand+motion CSS extracted to `<head>`. Internal-link graph: every page → 3–5 contextual anchors to siblings with VARIED anchor text (never repeat "click here"). BreadcrumbList JSON-LD on every non-home route. Sitemap.xml emitted with priority+changefreq+lastmod per route. njsk.org reference: 12 routes (`/`, `/about`, `/team`, `/services`, `/donate`, `/volunteer`, `/we-need`, `/contact`, `/blog`, `/blog/:slug`, `/mass-schedule`, `/faq`) + 129 long-tail blog posts = topical authority.

**Deep crawl per page (***NON-NEGOTIABLE for portfolio/academic/press/publication-bearing sites***):** Source-rebuild crawler MUST follow list-style index pages (publications, press, news, blog index, awards, portfolio, case studies, talks, papers) into each item's detail page — never stop at the index. For each child item extract: (a) full title verbatim, (b) date, (c) author/byline, (d) source publication name + homepage URL (for institutional logo lookup — see skill 12 institutional logo rule), (e) outbound canonical URL or DOI (for `target="_blank" rel="noopener"` link), (f) ~40-word PARAPHRASED summary written from the full body via GPT-4o-mini (NEVER quote the abstract verbatim — copyright + duplicate-content), (g) thumbnail/hero image if present, (h) tags/categories. Output: `_publications.json` array consumed by template's `<PublicationList>` component. Every item card on rebuilt site renders: paraphrased summary + hyperlinked source name (links to source homepage) + "Read on {Source} →" deep-link button to outbound URL + institutional logo (resolved via skill 12 lookup) + date pill. Crawler depth gate: `original_index_items_count - rebuilt_publications_count ≤ 0` else build fails with diagnostic listing missing items. Reference incident: lone-mountain-global-2 (2026-05-01) shipped flat list-page summaries with no detail-page crawl, no outbound links, no source-publication logos, no paraphrased summaries — looked like a shallow blog index instead of an authoritative publications page.

**Editorial pass for imported corpora (***clean_content prompt — typed blocks***):** Any imported content (Squarespace export, scraped CMS, manual paste) runs through `clean_content` prompt before generation. Output shape: `{ posts: [{ title, slug, excerpt(120-180ch), keywords[4-8], blocks: [{type:"lead|heading|paragraph|quote|callout", text, level?}], publishedAt, image }], related_map: {slug:[siblingSlugs]} }`. NEVER alter direct quotes, names, dates, or factual claims. Strip Squarespace residue (`#block-yui_*`, `.sqs-*`, `.margin-wrapper`, raw `<style>` blocks). Split paragraph blobs — each block stands alone visually. Mark opening paragraph as `lead` for drop-cap rendering. Reference: `apps/project-sites/src/services/ai_workflows.ts` registration `clean_content@1`.

**Analytics (***NON-NEGOTIABLE — skill 13***):** PostHog snippet (`persistence:'memory'`, cookie-free) + GA4/GTM container + local conversion tracking (phone_click, direction_click, form_submit, booking_click). See skill 13 conversion-optimization.md for event taxonomy. Every `tel:` link fires phone_click. Every Maps link fires direction_click. Every form submit fires form_submit.

## Execution Architecture (***TWO MODES — pick at call time***)

**Mode 1: r2-files (Worker-native, ships today).** Worker receives Bolt artifact, parses via `artifact_parser.ts`, executor `executeR2Files(artifact, { bucket, slug, version })` uploads each servable file action to `sites/{slug}/{version}/{path}` with content-type by extension (~20 extensions: html, css, js, json, svg, png, jpg, webp, woff2, webmanifest, …). Source-only paths skipped silently (`src/`, `scripts/`, `tests/`, `node_modules/`, `.github/`, `package.json`, `tsconfig.json`, `vite.config.*`, `tailwind.config.*`, `PLAN.md`). `public/` prefix stripped on upload (favicons land at served root). Shell actions skipped (Workers has no shell) and surfaced via `skippedShells[]` for the orchestrator to warn. Batch size 10 to stay under Workers I/O ceilings. Manifest written to `sites/{slug}/_manifest.json`. Requires the prompt to instruct Claude to emit pre-built static HTML/CSS/JS (no Vite source) — otherwise the served bundle won't render.

**Mode 2: container (Cloudflare Container, future).** Stateless Claude Code executor on CF Workers Containers. Pre-bakes: `@anthropic-ai/claude-code`, `~/.agentskills` (this repo), `~/template-local` (megabytespace/template.projectsites.dev), `~/template-saas` (megabytespace/saas-starter), `~/upload-to-r2.mjs` (R2 upload script), `~/inspect.js` (visual QA), `~/validate-urls.js` (URL preservation validator), `~/validate-citations.js` (citation gate via citation-js npm), `~/format-citations.js` (BibTeX/RIS/CSL→APA 7th converter), Node 20+, Bun 1.x optional, ImageMagick (favicon fallback), pdftoppm (PDF preview), git, curl, jq. Runs as non-root `cuser` with `--dangerously-skip-permissions`. Entrypoint: HTTP server on 8080. POST /build → select template from `_form_data.json.category` (local→`~/template-local`, saas→`~/template-saas`) → copy to `~/build/` → write context files → write CLAUDE.md → run single `claude -p` → parse `<boltArtifact>` → write each file action → `npm install && node scripts/generate-favicons.mjs && npm run build && node scripts/validate-assets.mjs dist` → `node ~/validate-urls.js` (fail if original URLs unaccounted) → `node ~/validate-citations.js dist/` (fail if any unsourced numeric claim) → `node ~/inspect.js dist/index.html` → `node ~/upload-to-r2.mjs dist/ → sites/{slug}/{version}/` → return status. GET /status → poll job. GET /result → return metadata. Currently gated behind `ContainerModeNotProvisionedError` in `artifact_executor.ts` until container provisioned.

**R2 upload script** (container mode) uses CF REST API (`api.cloudflare.com/client/v4/accounts/{acctId}/r2/buckets/{bucket}/objects/{key}`). Detects Vite projects via dist/ prefix. dist/ files → `sites/{slug}/{version}/`. Source → `sites/{slug}/{version}/_src/`. Writes `_manifest.json`. Credentials passed as env vars.

**Workflow integration** (`apps/project-sites/src/workflows/site-generation.ts`): step `generate-website` returns model output → `looksLikeArtifact(output)` branches the `upload-to-r2` step. Artifact path: `parseArtifact()` → on parse failure throw with detail (workflow retries via `step.do(RETRY_3)`) → `executeR2Files()` → overlay legal pages + research.json → write richer manifest. Legacy single-HTML path preserved as fallback. Structural HTML validators + banned-word grep skipped when `isArtifact === true` (validation runs inside the artifact parser instead).

## Env Vars Available in Container

API keys passed from Worker → container: ANTHROPIC_API_KEY, OPENAI_API_KEY, UNSPLASH_ACCESS_KEY, PEXELS_API_KEY, PIXABAY_API_KEY, YOUTUBE_API_KEY, LOGODEV_TOKEN, BRANDFETCH_API_KEY, FOURSQUARE_API_KEY, YELP_API_KEY, GOOGLE_PLACES_API_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX, IDEOGRAM_API_KEY, REPLICATE_API_TOKEN, STABILITY_API_KEY, GOOGLE_MAPS_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, MAPBOX_TOKEN, REAL_FAVICON_GENERATOR_API_KEY, FAL_API_KEY, RECRAFT_API_KEY, FLICKR_API_KEY, REMOVE_BG_API_KEY, PHOTOROOM_API_KEY, MAGNIFIC_API_KEY, ELEVENLABS_API_KEY. Phase-0 agents auto-skip when their key is missing — no key = no agent (graceful degradation, never block the build).

R2 credentials: CF_API_TOKEN, CF_ACCOUNT_ID, R2_BUCKET_NAME, SITE_SLUG, SITE_VERSION.

Donation/payment: STRIPE_PAYMENT_LINK_URL (for DonationForm component, nonprofit/church sites).

## One-Line Prompt → Mode → Build (***mode set by skill 02***)

Skill 02 infers `mode` (portfolio | saas | local-business | non-profit | other) from prompt+domain+context. Skill 15 builds per mode — each mode has different defaults for page count, feature set, content depth, and prompt-detail expectations. The prompt CAN handle anything; mode just biases defaults.

**Detail expected in one-line prompt by mode:**
- `portfolio`: minimal — domain + maybe a hint ("redo my website", "build me a portfolio at brian.dev", or just the domain). AI fills everything from inference (git config + GitHub + Gravatar + skill 02 founder chain).
- `saas`: richer — product name + at minimum a 1-sentence value prop. Often includes pricing, target market, integrations, competitors. AI infers stack defaults from skill 05.
- `local-business`: moderate — biz name + location/category. AI fills via Google Places + scrape.
- `non-profit`: moderate — mission + cause. AI fills via scrape + donation CTA scaffolding.
- `other`: variable — AI applies judgment, scans context, picks defaults.

When prompt is genuinely ambiguous, AI defaults to `portfolio` (lowest blast radius) and announces the assumption in `PROJECT_BRIEF.md § Mode`.

## Optional SaaS↔Portfolio Sibling Build (***RECOMMENDED, NOT BLIND***)

When mode=`saas` AND skill 02 founder-pairing decision returns "spawn portfolio", skill 15 runs a SECOND parallel workflow instance for the founder portfolio. Same applies in reverse for mode=`portfolio` if a flagship SaaS exists. Pairing is judgment-driven — see skill 02 "Optional SaaS↔Portfolio Pairing" for the full skip/spawn matrix.

**D1 schema (when paired):** `sites` table gains `pair_group_id TEXT` (UUID) + `pair_role TEXT CHECK(pair_role IN ('saas','portfolio'))`. Both sibling rows share `pair_group_id`. Solo builds leave both columns NULL. Worker `/api/sites/:id/siblings` returns partner row when present.

**Sibling build pipeline (only when pairing decision = spawn):**
1. `/api/sites/create` receives one-line prompt → skill 02 infers mode + founder + pairing decision → if spawn: write TWO D1 rows sharing `pair_group_id` → enqueue both into workflow runner. If skip: one row, NULL pair fields.
2. Workflow `site-generation` accepts optional `pair_role` arg. SaaS branch: full skill 15 pipeline + portfolio link injected into `/about` + footer credit. Portfolio branch: condensed personal-site pipeline (4-page floor: `/`, `/about`, `/work`, `/contact`) — `/work` flagship #1 = paired SaaS, cross-link via `pair_group_id` lookup.
3. Both branches share: `_brand.json` accent (founder accent if known, else SaaS color desaturated 20%), `_founder.json` (single source of truth for headshot/bio/links), `_pair.json` (sibling URLs).
4. Domains: SaaS = `${product}.com|.dev|.app` (or `${product}.projectsites.dev` fallback). Portfolio = `${firstname}.dev` → `${firstname}-${lastname}.dev` → `${firstname}.megabyte.space` fallback chain.
5. Cross-link gate (paired only): build VALIDATES SaaS `/about` HTML contains portfolio URL AND portfolio `/work` HTML contains SaaS URL — fail otherwise.

**Founder portfolio template (always-included routes when portfolio mode runs):** `/` hero with name+role+headshot+1-line bio+CTA "View work →" | `/about` long bio + skills + timeline + contact | `/work` flagship grid (SaaS sibling auto-prepended as #1 when paired) + case studies | `/contact` form + email + social links | optional `/blog` (if founder has posts) + `/now` (Derek Sivers /now-page convention) + `/uses` (gear/stack page).

**Portfolio brief enrichment (when `_founder.json` is sparse):**
- Bio drafted from prompt context + `git config user.email` lookup (Gravatar bio) + GitHub profile fetch (if `github.com/${handle}` resolves).
- Headshot: Gravatar (`https://gravatar.com/avatar/${md5(email)}?s=512&d=404`) → GitHub avatar → DALL-E 3 stylized portrait (last resort, alt clearly states "stylized representation").
- Social links: discovered via skill 09 brand extraction over founder's email handle on GitHub/LinkedIn/Twitter/X/Bluesky/Mastodon.
- Skills: inferred from paired SaaS stack + git history + GitHub repos + bio keywords.

**Pairing skip cases (no portfolio sibling spawned — judgment call):** mode=`portfolio` already (single site is the goal) | internal-only SaaS with no external founder narrative | explicit `--no-portfolio` API flag | founder identity generic/anonymous | polished founder portfolio already exists and resolves (200 OK at expected domain) | budget/scope makes second build wasteful. Decision recorded in `PROJECT_BRIEF.md § Pairing Decision`.

## Site Types Supported

**Local business:** Restaurant, salon, medical, legal, fitness, automotive, construction, photography, real estate, education, financial, cafe, retail. Category-specific features loaded from domain-features.md.

**SaaS:** Feature comparison tables, pricing tiers (3-column), integrations grid, API documentation page, changelog, status page link, trust badges (SOC2, GDPR), free trial CTA, demo video hero. ***Considers founder-portfolio pairing per skill 02 — recommended when founder is identifiable, never blind.***

**Portfolio:** Masonry project grid, case study pages, client logos, testimonials carousel, skills/tech stack, resume/CV page, contact form with project brief fields. Default mode for personal sites and "redo my website" rebuilds — minimal prompt detail expected, AI fills via founder inference chain.

**Non-profit:** Donation CTA (prominent, multiple placements), impact counters (animated), volunteer signup, event calendar, newsletter signup, partner logos, annual report highlights, mission statement hero.

**Government/institutional:** Clean navigation for dense content, accessibility-first, multi-language support, document library, news/press section, org chart, service finder.

## Post-Build Self-Improvement Loop (***MANDATORY — every site, every prompt***)

After ANY site build is declared "done", run a structured improvement scan and feed findings back into the local skills/template repos. This is the meta-learning loop — every shipped site makes the next one better.

**Scan process (***runs automatically, no user prompt required***):** (1) Playwright + GPT-4o detail:low against the deployed URL — score 10 dimensions vs the source site (visual quality, brand fidelity, media density, motion sophistication, content depth, SEO completeness, a11y, performance, mobile polish, distinctiveness); each dimension 0-10 with `gap_notes[]`; (2) For each gap_notes entry, classify as `local-skill-gap` (fixable by editing this project's `.claude/`) vs `universal-skill-gap` (fixable by editing `~/.agentskills/`) vs `template-gap` (fixable in `megabytespace/template.projectsites.dev` or `saas-starter`) vs `one-off` (project-specific, no skill change); (3) Auto-edit the appropriate file with a dense pipe-delimited rule addition (match sibling density per Brian's preferences). The rule must include the project name + date as the citation incident (e.g. "lonemountainglobal.com 2026-04-30 — original logo/favicon dropped because extraction stopped at header img"); (4) For `template-gap` items, push commit to the template repo same prompt; (5) Record decision log to `.claude/improvements/{date}.md` so the user can review what was learned.

**LMG case study (***reference incident, 2026-04-30***):** Source was lonemountainglobal.com (high-quality light theme, mountain-splash background extracted from logo, polished serif wordmark, slider-driven homepage, CV PDF on /about). First build shipped: dark theme (wrong — source was light), no logo (extraction stopped at header img instead of walking to og:image / wp-content / link rel=icon), no favicon set (real-favicongenerator not run), zero images on the entire site (slider/carousel images skipped), no PDF preserved, no font matching, no background-mark extraction. Fixes seeded into skills 09 + 12 + 15 (theme matching, logo extraction chain, real-favicongenerator gate, slider/carousel walker, background-from-logo extraction, font matching from logo, document preservation, 1.4-2.0x media augmentation, DALL-E primary, post-build self-improvement loop). Same gap will not recur.

## Homepage Clone Directive (***WHEN USER SAYS SO — clone, then improve***)

When the user explicitly says "clone the homepage" or "base the design on theirs" (or the source homepage scores ≥9/10 in the visual quality scan), the rebuild must (a) match the source homepage section-by-section (hero, hero-motif placement, font pairing, color usage, motion choreography, slider/gallery cadence), (b) keep the original logo + favicon + brand-extracted assets verbatim, (c) propagate the homepage's design language to all sub-pages with consistency, (d) add genuine improvements only where the source has clear weaknesses (mobile responsiveness, a11y, performance, missing trust elements, weak CTAs). Never "improve" what is already excellent — preserve it. The lonemountainglobal.com homepage with mountain-splash + serif logo + animated motif is the canonical "great source" pattern.

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
| **Code generation** | $5-7 (Claude Opus 4.7, ~80K out @ $75/MTok) | $0.02-0.05 (Workers AI) | Opus 4.7 emits Bolt artifact for complex/custom; Llama 3.3 70B for template fill at scale; Llama 3.1 70B baseline was $0.30/site but capped at 16K-token monolith (rejected — couldn't produce multi-page sites) |
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
| **TOTAL** | **$5.50-8.00** (Tier 3 Opus) / $1.00-3.50 (Tier 1-2) | **$0.25-0.40** | 80-95% cost reduction at scale via tiered routing |

### Scale Optimization Strategies

**Tier 1: Template Engine (80% of sites, $0.10-0.20/site)**
Most local businesses (restaurant, salon, medical, legal) are structurally identical. Pre-build 18 category templates as complete React apps. Worker fills data slots (business name, hours, phone, colors, images) via string replacement — NO LLM needed. Workers AI Llama 3.3 70B generates copy (about text, service descriptions, FAQs) at $0.001/1K tokens. Reserve Claude Code for custom/complex sites only.

**Tier 2: Workers AI First (15% of sites, $0.20-0.40/site)**
Sites needing layout customization beyond templates. Workers AI generates component JSX (not full site). Llama Vision replaces GPT-4o for image profiling and QA. Edge inference = zero network latency, included in Workers Paid plan.

**Tier 3: Claude Opus 4.7 (5% of sites, $5-7/site)**
Complex multi-page sites, custom designs, SaaS, portfolios with unique layouts. Full Bolt-artifact emission (~80K output tokens × $75/MTok = $6 typical) into container build. Worth the cost — these are premium-priced sites and the multi-file artifact protocol is the only path to true Stripe/Linear/Vercel-level output. Pricing pays off when conversion lift > 5% of LTV (Anthropic, 2026).

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
