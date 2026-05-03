---
name: "media-acquisition"
description: "12+ API media sourcing strategy for site generation. Stock photos, AI-generated images, logos, videos, favicon sets. Collect 100 candidates → AI inspect → curate top 15."
updated: "2026-04-24"
---

# Media Acquisition

Collect 10x more assets than needed, curate down via AI visual inspection. Asset count scales with page count: every page needs **6+ images on home, 4+ images on every sub-page, plus 1 logo + 5–10 AI originals + 3–5 videos**. A 4-page rebuild ⇒ 30–50 images; a 50-page rebuild ⇒ 200+ images; a 500-page rebuild ⇒ 2000+ images. Page count comes from the source sitemap (1:N mapping, max 1000) — NEVER cap media at 4-page-site numbers when source has more. Site must feel media-rich and immersive from the first scroll. Every site MUST have a logo and favicon set. Users should feel like a professional agency spent weeks curating this content.

## Media Slot Manifest (***PHASE 0 — BEFORE ANY GENERATION — UNIVERSAL — BUILD-BREAKING***)

Before any agent fans out, enumerate EVERY image slot on EVERY route into `_media_slots.json`. Treat slots as first-class build artifacts — no blind "fetch some images and pick later" pipeline. Each slot has an explicit identity, a per-slot DALL-E prompt drafted at this stage, an ordered source-resolution chain, and a final-fill commitment. A site whose `_media_slots.json` shows all slots filled = images guaranteed; a site without this manifest = ships missing images.

**Slot record schema (JSON):**
```json
{
  "slot_id": "home.hero.bg",
  "route": "/",
  "section": "hero",
  "role": "background",
  "aspect": "16:9",
  "min_dims": [1920, 1080],
  "topic_keywords": ["soup kitchen volunteers serving", "warm community gathering"],
  "topic_intent": "people-actively-serving (NOT generic charity stock, NOT mixed adults if women+children focus)",
  "brand_palette": ["#7C2D12", "#FED7AA"],
  "preferred_motion": "video",
  "source_chain": ["original-source-hero", "pexels-video", "coverr", "dalle-photoreal", "flux-pro", "brand-gradient"],
  "dalle_prompt": "Photorealistic documentary-style overhead shot of volunteers serving soup at a community kitchen, warm window light, 85mm lens, brand palette burgundy #7C2D12 + cream #FED7AA, shallow depth of field, no text, no watermarks, no logos, hyperdetailed, 16:9 cinematic",
  "negative_prompt": "no text, no watermarks, no logos, no extra fingers, no AI artifacts, no stock-photo cliches",
  "relevance_floor": 8,
  "filled_by": null,
  "filled_url": null,
  "filled_score": null,
  "regen_attempts": 0
}
```

**Manifest generation (***runs ONCE per build, before any agent fans out***):** Phase 0 step 1 = parse sitemap → for each route, classify section archetype (hero/services/team/blog-card/gallery/cta/about/testimonial/footer), instantiate slot records from `_slot_templates.json`, populate `topic_keywords` + `topic_intent` + `dalle_prompt` from page-context LLM call (single batched call across all slots — `gpt-4o` ~$0.05 per site). Manifest is the SINGLE source of truth — every downstream agent reads `_media_slots.json` and writes back to `filled_url` + `filled_score`.

**Per-slot DALL-E prompt mandatory fields:** (1) page topic+intent verbatim from `topic_intent`, (2) brand palette tokens from `_brand.json.colors`, (3) composition + aspect ratio matching `aspect`, (4) subject specificity (NEVER "people" — always "octogenarian volunteer plating soup"), (5) photographic technical specs (camera, lens, lighting, DoF), (6) negative prompt block. Generic "create a hero image for /about" prompts FAIL `validate-image-prompts.mjs`.

## Fail-CLOSED Auto-Regenerate (***ZERO MISSING IMAGES — NEVER SHIP BLANK SLOTS — UNIVERSAL — BUILD-BREAKING***)

Every slot in `_media_slots.json` MUST end the build with `filled_url != null AND filled_score >= relevance_floor`. Failure modes (Pexels returns nothing, DALL-E returns NSFW-flagged, scraped image broken, GPT-4o vision relevance scores 6/10) trigger immediate auto-regeneration via DALL-E with refined prompt — NEVER silent skip, NEVER substitute brand-gradient placeholder unless 5 regen attempts exhausted. The build does not declare "complete" until every slot is filled at threshold.

**Regen loop (per slot, max 5 attempts):**
1. Initial fill via `source_chain` walk: original → Pexels Video → Coverr → DALL-E → Flux → brand-gradient. First source returning a candidate gets vision-scored.
2. If `filled_score < relevance_floor` (default 8/10) OR source returned 0 candidates → regen with DALL-E using REFINED prompt: feed `(original_prompt, vision_critique_of_what_was_wrong, relevance_floor)` to gpt-4o, get back tightened prompt naming what to ADD + what to REMOVE. Increment `regen_attempts`.
3. Refined DALL-E generation (gpt-image-1 HD, ~$0.04-0.08) → vision-score → if pass, commit; if fail and `regen_attempts < 5`, GOTO 2.
4. After 5 attempts: log to `_unfillable_slots.json`, fall back to brand-gradient + log critical warning. **Build still completes** (gradient is the last-resort floor that prevents 404s) but post-build report flags the slot for manual review. Default behavior is regen-until-pass — fallback only on hard exhaustion.

**Hard gate:** `_unfillable_slots.json` must be empty for a clean build. ANY entry = build status `published_with_warnings`, dashboard surfaces the slot for manual replacement, alert email to operator. The gate prevents the lone-mountain-global-3 + njsk-light class of failure where slots silently shipped empty or with off-topic generic stock.

**Cost ceiling:** 5 regen attempts × $0.08/img = $0.40 worst case per slot. With ~30 slots/site at typical 0.3 regen rate average, total worst-case DALL-E spend ~$3.60/site (most sites: $0.50-1.50). Tracked per-build in `_dalle_spend.json`; daily rollup in `_dalle_daily.json` against `OPENAI_DAILY_BUDGET` env (default $50). Budget exhaustion triggers fallback to Flux for remainder of day.

## Original Media Extraction (***FIRST STEP — EVERY BUILD WITH A SOURCE SITE***)

Before any stock/AI sourcing, walk the source site and extract EVERYTHING. The original site's media is canonical brand voice — discarding it is malpractice.

**Walk-list (***apply to every page in sitemap, in order***):** (1) `<header>` + `<nav>` logos via the Logo Discovery chain below; (2) ALL `<img src>`, `<img srcset>`, `<picture><source srcset>`, `<image href>` (SVG) on the page body — download every variant in srcset, keep the largest; (3) CSS background-images: parse computed styles via Playwright (`window.getComputedStyle(el).backgroundImage`) for every visible element — backgrounds carry hero photography, brand splashes, section dividers; (4) ***slider/carousel/swiper images (***NEVER MISS — they hide from naive scrapers***):*** Swiper.js (`.swiper-slide img`), Slick (`.slick-slide img`), Splide (`.splide__slide img`), Glide (`.glide__slide img`), WordPress Smart Slider (`.n2-ss-slide-background-image`), Squarespace Gallery (`.sqs-gallery-image img, .sqs-gallery-block-grid img, [data-slide-url]`), Wix Gallery (`[data-mesh-id*="gallery"] img`), Elementor Slides (`.elementor-slide-bg`), bxSlider/Owl/Flickity equivalents — query each container, force JS execution via Playwright (`waitForLoadState('networkidle')`), then extract every slide image; (5) `<video src>` + `<source src>` + lazy-load placeholders (`data-src`, `data-original`, `data-lazy`, `data-srcset`, `loading="lazy"` deferred URLs); (6) downloadable documents — `<a href$=".pdf">`, `.doc(x)`, `.ppt(x)`, `.xls(x)`, `.zip` linked from body content (resumes, brochures, menus, annual reports — always feature these on the new site, see "Document Preservation" below); (7) `og:image`, `twitter:image`, `og:video`, `msapplication-TileImage`, `<link rel="preload" as="image">` URLs; (8) inline SVGs (copy `<svg>` markup verbatim — these are often custom brand illustrations); (9) WordPress block images (`wp-image-*` classes carry attachment IDs — `wp-json/wp/v2/media/{id}` returns full-size original).

**Group preservation (***NEVER FLATTEN — slider images stay sliders***):** When extracting from a slider/carousel/gallery, store images with their group identity intact: `public/images/sliders/{slider-id}/{order-index}-{filename}` and emit a manifest entry `{group: "homepage-hero-slider", order: [...], aspect: "16:9", autoplay: true, interval: 5000}`. The new site rebuilds the same slider with the same images in the same order — never dump grouped sliders into a flat gallery grid.

**1.4x–2.0x augmentation rule (***NEVER FEWER IMAGES THAN ORIGINAL***):** Count original-site images. New site MUST ship `original_count × 1.4` minimum, `× 2.0` typical, `× 3.0` for thin source sites with <10 originals. Augmentation = original media + (Pexels/Unsplash/Pixabay stock matching brand voice) + (DALL-E 3 / GPT Image 1.5 originals matching extracted brand style — see DALL-E priority below) + (Google CSE image search for context shots). The deployed site should always feel richer, never sparser, than the source.

**Multimedia Agent Integration (***FIRST-CLASS PARALLEL AGENTS — every build runs all 4 in parallel during Phase 0***):** Pexels, Google CSE, DALL-E 3, and Original-Site Crawler are first-class media agents — not optional fallbacks. Spawn all 4 in parallel as the first action of every build (before template clone, before any code). Each agent writes to `_assets/{agent}/` with metadata; main thread merges + dedupes via md5 + AI-rates via Workers AI Llama Vision (free) + curates final set.

| Agent | Trigger | Min Output | Parallel Calls | Notes |
|-------|---------|------------|----------------|-------|
| **Pexels** | `PEXELS_API_KEY` set | 8 stills + 3 videos/site | 4-6 queries (`{type} interior`, `{type} {city}`, `{service} professional`, `{atmosphere}`) | Free commercial license; Workers AI rates relevance |
| **Google CSE** | `GOOGLE_CSE_KEY`+`GOOGLE_CSE_CX` set | 5 context shots | 3-5 queries (`"{name}" {city}`, `"{name}" team`, `"{name}" exterior`, `{neighborhood} {type}`) | Filter `rights=cc_publicdomain,cc_attribute,cc_sharealike`; verify license before download |
| **DALL-E 3** | `OPENAI_API_KEY` set | 5 originals/site | 5 generations (1 hero HD 1024×1792 + 3 sections 1024×1024 + 1 OG 1024×1024) | PRIMARY for AI imagery — Brian's stated preference; ultra-real photography mode + creative narrative mode |
| **Original-Site Crawler** | source URL provided | every page crawled | Playwright concurrency 6, 1000-page cap | Walk all media types: img/picture/CSS bg/sliders/lazy/og:image/PDFs |

**Two DALL-E modes (***use heavily — both modes per site***):** (1) **Ultra-real photography mode** — `"Photorealistic [scene depicting page topic], [extracted brand color palette from _brand.json], [logo style adjective], shot on Hasselblad, golden hour, 85mm prime lens, no text/logos, hyperdetailed, cinematic"` for hero backgrounds, service illustrations, atmospheric textures. (2) **Creative narrative mode** — when source has unique brand story OR original artwork OR strong logo motif, generate scene-by-scene narrative imagery extending that visual world (e.g. lonemountainglobal.com mountain motif → narrative scenes featuring mountains in different contexts: dawn climb, summit view, valley basecamp). Pair narrative scenes with site copy beats so imagery tells a story across sections rather than feeling decorative. ~$0.04-0.08/image, total $0.30-0.50/site.

**Sora video agent (***when OPENAI_API_KEY present***):** Generate 1-2 short narrative video loops per site (5-10s, muted, autoplay) for hero backgrounds. Cost ~$0.20-0.40 each. Pair with same brand palette + narrative thread as DALL-E originals. Falls back to Pexels Video API loops when Sora unavailable.

**Image count scales with sitemap (***NEVER cap at 4-page-site numbers***):** Required count = `max(30, original_image_count × 1.4, page_count × 6_home_or_4_sub)`. 4-page rebuild ⇒ ≥30 images, 50-page ⇒ ≥200, 500-page ⇒ ≥2000. Source sitemap.xml is ground truth; cap at 1000 pages. The pipeline that promised "4-8 page rebuild with 30+ images" but delivered ~15% of that is a build failure — every page must hit its image floor before "done".

**Tier S Agents — beyond Pexels/CSE/DALL-E (***ALL first-class, all parallel in Phase 0 when keys present***):** Stock alone is generic. AI alone is uncanny. The full media stack chains 17+ parallel agents so every image slot has the best-fit source. Each agent writes to `_assets/{agent}/` with metadata; main thread merges + dedupes by md5 + AI-rates via Workers AI Llama Vision (free) + Cloudinary-transforms + curates final set.

| # | Agent | Trigger | Use Case | License | Cost | Min Output |
|---|-------|---------|----------|---------|------|------------|
| 1 | **Wikimedia Commons** | always (no key) | Named buildings/landmarks/businesses/public figures, historical context, brand-noted imagery | CC0/CC-BY/CC-BY-SA | free | scan every business name/location/founder for matches |
| 2 | **Wikipedia + Wikidata** | always (no key) | Entity-based imagery for businesses/people with Wikipedia entries — pulls infobox image + structured properties (founding date, HQ photo, founder portraits) | CC | free | when entity exists |
| 3 | **Flickr Creative Commons** | `FLICKR_API_KEY` set | Niche photography Pexels misses (hyperlocal, professional/hobbyist, event coverage) — filter `license=4,5,6,7,9,10` for commercial-OK | CC-BY/CC-BY-SA/CC0 | free | 5-10 niche-relevant shots per build |
| 4 | **FLUX.1 (via fal.ai)** | `FAL_API_KEY` OR `REPLICATE_API_TOKEN` set | Secondary AI imagery — beats DALL-E for photoreal humans, complex multi-subject scenes, narrative variation. FLUX.1 [pro] for hero, [schnell] for fast iteration | commercial OK | ~$0.025-0.05/img | 2-3 narrative variants per major section |
| 5 | **Recraft v3** | `RECRAFT_API_KEY` set | Vector + raster AI with brand-style adherence — generates on-brand SVG icon sets, illustrations, infographics. Output = editable SVG, infinite scale | commercial OK | ~$0.04/img | full icon set when no Lucide match exists |
| 6 | **Mapbox Static Images** | `MAPBOX_TOKEN` set (already in env) | Custom-styled map snapshots (PNG, brand-color-matched, no JS) — replaces Google Maps iframe for performance + brand cohesion | commercial OK | free up to 50K/mo | 1 map per address-bearing page |
| 7 | **Cloudinary** | `CLOUDINARY_*` set (already in env) | Image transform layer — auto-format (WebP/AVIF), auto-quality, AI-crop (`g_auto`), generative-fill, background-removal, upscale, color-cast correction. Apply to EVERY non-AI image post-fetch | — | free 25GB/mo | every image piped through |
| 8 | **Remove.bg / Photoroom** | `REMOVE_BG_API_KEY` OR `PHOTOROOM_API_KEY` set | Background removal on team headshots, product shots, scraped logos — drops onto brand-color or transparent bg for clean composition | commercial OK | ~$0.20-0.30/img | every team headshot + product shot |
| 9 | **Magnific / Real-ESRGAN** | `MAGNIFIC_API_KEY` OR local Real-ESRGAN bin | AI upscale on low-res scraped originals (4x-8x). Critical for old logos, small team headshots, vintage event photos | commercial OK | ~$0.10/img Magnific, free local | every scraped image <800px wide |
| 10 | **unDraw** | always (no key) | Free customizable SVG illustrations — brand-color-matched at fetch time via URL param. Service cards, empty states, hero spot illustrations | MIT-style (no attribution) | free | 5-10 brand-tinted SVGs per site |
| 11 | **Iconify** | always (no key, IconifyAPI public) | 200K+ icons unified API — beats Lucide for niche/brand icons (specific industries, regional brands, software logos) | various open | free | unlimited |
| 12 | **Coverr + Mixkit** | always (no key — direct MP4 URLs) | Free stock video supplement — Coverr (no login, MP4 direct), Mixkit (MP4 + music). Higher narrative variety than Pexels Video alone | commercial OK | free | 2-3 supplemental videos per site |
| 13 | **Internet Archive Wayback** | always (no key) | Source site is dead/blocked — pull last good snapshot of every URL in original sitemap. Critical for old-business rebuilds | PD/fair use | free | every dead-source rebuild |
| 14 | **ElevenLabs (audio)** | `ELEVENLABS_API_KEY` set | AI voice narration — about-us voiceover, podcast intro, accessibility audio for blog posts, audio CTAs. Differentiator vs text-only | commercial OK | ~$0.02/1K chars | 1 narration per site (about page) |
| 15 | **MusicGen / Suno / Udio** | `OPENAI_API_KEY` (Suno via 3rd-party) OR Replicate (MusicGen) | AI background music for video heroes, brand sonic identity. MusicGen open-source via Replicate is free-ish | commercial OK varies | ~$0.05-0.20/track or free | 1-2 brand-themed tracks per site with video hero |
| 16 | **Sora (video)** | `OPENAI_API_KEY` set | AI video generation — short narrative loops extending logo motif into scene-by-scene story | commercial OK | ~$0.20-0.40/clip | 1-2 narrative video loops per site |
| 17 | **Public-domain archives (situational)** | always (no key) | NASA Image API (space/earth), Smithsonian Open Access (artifacts/history), Met Museum (art), Rijksmuseum (art), NOAA (weather/satellite), USGS (geo), Library of Congress (PD historical), NYPL Digital Collections, Europeana (cultural heritage) — match to site narrative when topic aligns (e.g. NOAA storm imagery for emergency-services site, NASA earth shots for environmental nonprofit) | PD | free | when topical match exists |

**Source-attribution discipline (***license-by-license, render in image alt+JSON-LD***):** Every non-PD image carries `{source, license, attribution_required, attribution_text, attribution_url}` in `_image_profiles.json`. CC-BY/CC-BY-SA → render attribution in figcaption + JSON-LD `creditText`. CC0/PD → no attribution required but record source for audit. Commercial stock (Pexels/Pixabay/Unsplash) → optional credit, render when present in profile. Build gate: any CC-BY image without `attribution_text` in HTML = FAIL.

**Phase 0 parallel execution architecture (***17-agent fan-out, single-thread merge***):** Container entrypoint forks 17 agent processes via `Promise.all([...])` (or `xargs -P 17` in bash). Each agent reads `_research.json` + `_form_data.json`, writes to `_assets/{agent}/`, exits. Main thread waits, merges results into unified `_assets.json` + `_image_profiles.json`, runs Cloudinary transform pipeline, AI-rates via Workers AI Llama Vision, curates final set via score threshold. Total wall-clock: ~30-60s for all 17 agents (network-bound, not CPU). Cost: $0.50-2.00/site total media spend (DALL-E + FLUX.1 + Sora dominate). The 4-agent baseline (Pexels/CSE/DALL-E/Crawler) is the floor; the 17-agent stack is the ceiling — every site runs as many agents as the env keys allow.

**DALL-E first for originals (***Brian's stated preference — use it a lot***):** When generating original imagery, use DALL-E 3 (via OpenAI Images API) as the primary engine — superior text rendering, brand-style adherence, and photorealistic results vs alternatives. Generate 3-5 hero variants per major section. Prompt template: `"Photorealistic [scene], [extracted brand color palette], [logo style adjective from logo extraction], shot on Hasselblad, golden hour, 85mm, no text, no logos, hyperdetailed, cinematic"`. Cost: ~$0.04-0.08/image (HD 1024×1792). Reserve GPT Image 1.5 for fast iteration, Stability AI for textures/patterns, Sora for short videos.

## Document Preservation (***RESUMES, BROCHURES, ANNUAL REPORTS — FEATURE PROMINENTLY***)

When the original site links to a downloadable document (PDF/DOC/PPT/XLS), it's there because the business considers it important. Examples: founder/team CVs, service brochures, restaurant menus, non-profit annual reports, capability decks, whitepapers, case studies. Download every linked document, store at `public/docs/{slug}.{ext}`, and feature them on the new site:

- ***Team/About pages — link CVs/resumes inline next to the person:*** "View {Name}'s Resume →" button. The lonemountainglobal.com `Vian_CV_Long_4-2-2024.pdf` linked on `/about` is the canonical example — it's her resume, prominently displayed by the source site, so the rebuild MUST keep it accessible.
- ***Generate a preview thumbnail*** (first page render via `pdftoppm` or `pdf2image`) → display as `<a href="...pdf"><img alt="..." class="doc-preview"></a>` so the document feels first-class, not buried.
- ***JSON-LD `DigitalDocument` schema*** for each preserved document → boosts visibility in Google's document carousel.
- ***Hard gate:*** every PDF/DOC linked in the original sitemap MUST resolve on the new site (200 or 301), and if it appears on a specific page on the original site, it MUST appear on the equivalent new page.

### PDF as Primary Research (***NOT JUST AN ASSET***)
Every linked PDF (especially CVs, resumes, capability decks, annual reports) gets processed through `pdftotext -layout` → LLM structured-fact extraction (strict JSON schema) → `_pdf_facts.json` keyed by URL BEFORE Phase 1 build. Schema for CV/resume: `{ name, headline, education[{degree,institution,year,location,url?}], positions[{title,org,start,end,location,description,url?}], publications[{title,authors,journal,year,doi?,url?,citations?}], grants[{title,funder,amount,years,role}], awards[{title,year,org,url?}], talks[{title,venue,year,url?}], skills[], languages[], affiliations[{org,role,url?}] }`. For each entry with `url?` blank, run web-research enrichment (Exa/Tavily/Perplexity) to find the canonical link — institution page, journal article, grant database, conference proceedings — and populate. The CV becomes structured data available to ALL build prompts: hero copy can quote a published paper, /about can render an interactive timeline, /publications can pre-populate from `_pdf_facts.publications[]`.

### Interactive Timeline Component (***GENERATED FROM CV facts***)
When `_pdf_facts.json` contains a CV with ≥3 timeline-eligible entries (positions OR education OR awards OR grants), template renders an `<InteractiveTimeline>` component on `/about` (or new `/cv` route): vertical chronological line with year markers, role/event cards on alternating sides, concise summary headline + 1-2 sentence body, smaller text for supplementary metadata (org name, location, dates) at ≥7:1 contrast, every institution/paper/grant/award name hyperlinked to its canonical URL, expand-on-click for full details, keyboard navigable (Tab through cards, Enter to expand), in-viewport fadeIn per card via IntersectionObserver, ARIA `role="list"` + `aria-label="Career timeline"`. Reduced-motion: skip stagger, render all cards visible. The lonemountainglobal.com `Vian_CV_Long_4-2-2024.pdf` is the canonical case — Dr. Taryn Vian's 30+ years of WHO/USAID/BU positions, anti-corruption publications, and global health grants become a living timeline, not a buried PDF link.

**Budget split:** GPT-4o vision QA capped at $1 (see completeness-verification). Media generation/acquisition is a SEPARATE budget — spend what's needed to make the site gorgeous. Ideogram (~$0.05/logo), GPT Image 1.5 (~$0.04/image), Stability (~$0.03/image), stock APIs (free tiers). Typical media budget: $0.50-2.00/site. This is GOOD spend — it creates the content that makes sites convert.

## R2 Self-Hosting Pipeline (***NO CDN HOTLINKS — UNIVERSAL — BUILD-BREAKING — 2026-05-02 lonemountainglobal.com cycle***)

Every image, video, font, PDF, and JSON file the source site references via third-party CDN MUST be downloaded at build time, content-hashed, written to `public/assets/migrated/<sha256-prefix>.<ext>`, and rewritten throughout the source code so the production bundle has zero outbound CDN dependencies. The deployed site MUST self-host every asset on `<slug>.projectsites.dev` (R2-backed) — no `cdn.shopify.com`, no `*.squarespace-cdn.com`, no `*.wp.com`, no `*.wixstatic.com`, no `*.imgix.net`, no `images.ctfassets.net`, no `*.contentful.com`, no `*.cloudinary.com`, no random WordPress upload paths. Reference incident: lonemountainglobal.com 2026-05-02 — footer logo + 8 hero images hotlinked to source WordPress CDN; site visually broke when source WordPress was taken down for maintenance, AND every page load leaked referrer to the source host (privacy + brand-leak risk).

**Vite plugin (`template/scripts/rewrite-cdn-assets.mjs`):** runs as `enforce: 'post'` Vite transform on every `.tsx|.jsx|.ts|.js|.html|.css|.json` file. Pseudocode:

```js
import { createHash } from 'node:crypto';
import { writeFile, mkdir } from 'node:fs/promises';
import { fetch } from 'undici';

const CDN_HOSTS = [
  'cdn.shopify.com', 'squarespace-cdn.com', 'wp.com', 'wixstatic.com', 'imgix.net',
  'cloudinary.com', 'contentful.com', 'ctfassets.net', 'sanity.io', 'prismic.io',
  'shopifycdn.com', 'shopify.com/s/files', 'i0.wp.com', 'i1.wp.com', 'i2.wp.com', 'i3.wp.com',
  'amazonaws.com/wp-content', 'akamaized.net', 'cloudfront.net', 'fastly.net',
  'unsplash.com/photos', 'pexels.com/photos', 'pixabay.com/photo'
];

export function r2AssetRewriter() {
  const downloads = new Map();
  return {
    name: 'r2-asset-rewriter',
    enforce: 'post',
    async transform(code, id) {
      if (!/\.(tsx?|jsx?|html|css|json)$/.test(id)) return null;
      const re = new RegExp(`https?://([^/"'\\s)]*?(${CDN_HOSTS.join('|')}))/[^"'\\s)]+`, 'g');
      const out = code.replace(re, (match) => {
        const ext = guessExt(match);
        const hash = createHash('sha256').update(match).digest('hex').slice(0, 16);
        const localPath = `/assets/migrated/${hash}.${ext}`;
        downloads.set(localPath, match);
        return localPath;
      });
      return out === code ? null : { code: out, map: null };
    },
    async closeBundle() {
      await mkdir('public/assets/migrated', { recursive: true });
      const limit = pLimit(8);
      await Promise.all([...downloads].map(([local, remote]) => limit(async () => {
        const res = await fetch(remote, { headers: { 'User-Agent': REAL_UA } });
        if (!res.ok) throw new Error(`CDN download failed ${remote}: ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        await writeFile(`public${local}`, buf);
      })));
    }
  };
}
```

**Asset-extension detection:** parse URL pathname, fall back to MIME from HEAD response. Always store the original-quality variant (drop `?w=400&h=400` query strings; fetch the bare URL when CDN serves higher-res). When source CDN gates by signed URL with expiring token, fetch ONCE at build time — the local mirror has no expiration.

**Hash strategy:** sha256 of the *original URL* (not the bytes) — guarantees byte-identical rewrites across multiple builds + lets the same image referenced from multiple places dedupe to one local file. Bytes-hash would force re-download of every reference; URL-hash is a build-cache key.

**Excluded hosts (KEEP as-is):** `googletagmanager.com`, `google-analytics.com`, `googleapis.com/maps`, `posthog.com`, `sentry.io`, `js.stripe.com`, `*.youtube.com/embed`, `*.vimeo.com/video`, `fonts.gstatic.com`, `fonts.googleapis.com` — these are first-party SaaS platforms with stable CDN URLs that we WANT loaded from origin (better caching, security policies, version stability). Self-hosting Google Analytics or Stripe.js breaks them.

**Validator (`validate-no-cdn-hotlinks.mjs`):** post-build, grep dist/ for any URL matching `CDN_HOSTS` regex outside the excluded list — any match=fail with diagnostic showing source HTML location + suggested local replacement path. CSS `url(...)` and `<img src>` and JS string literals all checked.

**Build cache:** `.cdn-rewrite-cache.json` keyed by sha256-prefix → original URL + last-fetched-at + bytes-md5. Skip re-download when file exists locally + cache entry <30d old + HEAD request to original returns same `etag` or `content-length`. Cuts incremental build CDN bandwidth ~95%.

## Blog Featured-Image Fallback (***NEVER SKIP — UNIVERSAL — every imported blog post MUST have a featured image***)

When migrating a source blog (Squarespace, WordPress, Wix, Ghost, Medium, Substack), some posts have empty or 404'd featured-image fields — old posts where the source author skipped the image, posts where the CMS lost the asset, posts whose featured image was a 1px tracking pixel. The rebuilt blog MUST NOT ship posts with missing or broken hero images. Every post gets a featured image at build time, sourced via this fallback chain:

1. **Source `featured_image`/`og:image` URL** if HEAD-200 + bytes >5KB (filters out tracking pixels) + dimensions ≥800×600.
2. **First inline `<img>` from post body** if HEAD-200 + dimensions ≥800×600 — the article's lead image is usually a fine hero.
3. **Pexels search** by post title + tags + categories: top 3 results scored by GPT-4o vision against `(post_title, post_excerpt, brand_palette)`, pick highest scoring ≥7/10.
4. **DALL-E generation** with per-post prompt encoding all 6 mandatory fields (page topic+intent verbatim from `post_title + post_excerpt`, brand palette, composition matching post genre, subject specificity, photographic technical specs, negative prompt). Cost ~$0.04-0.08/post. ~$2-4 per 50-post blog migration.
5. **Brand-gradient SVG** as the hard-floor fallback — placeholder SVG with post title rendered + brand palette gradient. Used only when DALL-E spend ceiling tripped.

**Per-post prompt template:**
```
Photorealistic editorial-style image illustrating "<post_title>". Subject: <subject from post_excerpt + first paragraph>. Brand palette: <brand-primary hex> + <brand-accent hex>. Composition: 16:9 wide, hero-card aspect. Mood: <mood inferred from post_tags or default "warm documentary">. Lighting: natural soft, golden hour. Lens: 85mm prime, shallow DoF. Negative prompt: no text, no watermarks, no logos, no extra fingers, no AI artifacts, no stock-photo cliches, no busy backgrounds, no clip-art aesthetic.
```

**Vision validation:** each fallback hero gets vision-scored before commit; <7/10 triggers regen via DALL-E with refined prompt (max 3 attempts per post — capped lower than slot regen ceiling because blog herofills are bulk). Final fallback: brand-gradient SVG. Never ship a post with NO image.

**Storage:** generated heroes go to `public/assets/blog/<post-slug>-hero.<ext>` (slug-named for human-readable diffs across rebuilds, NOT hash-named like CDN-rewritten assets). JSON-LD `BlogPosting.image` references this path.

**Validator (`validate-blog-featured-images.mjs`):** for every entry in `_corpus.json.posts[]`, assert `featured_image_url` is non-null AND HEAD-200 in dist AND dimensions ≥800×600. FAIL on any post missing a hero. Reference incident: njsk.org 2026-05-02 — 14 of 129 imported blog posts had broken Squarespace CDN hero URLs (404), shipped with `<img src="">` rendering as broken-image icon. Fix: featured-image fallback chain runs at corpus-import time, NEVER at first user view.

## API Priority Chain (***DALL-E ELEVATED — Brian's stated preference for slot-fill***)

Real photos of the actual entity always win when they exist (Places/uploads/scrape — slots 1-3). Beyond that, DALL-E becomes the PRIMARY originator for every slot the source chain didn't naturally fill — it crafts the per-slot ultra-realistic perfect photo for each spot. Stock APIs are supplements + speed-passes, not the workhorse.

| Priority | API | Key | Use | Rate | Confidence |
|----------|-----|-----|-----|------|------------|
| 1 | Google Places Photos | GOOGLE_PLACES_API_KEY | Actual business photos (real entity wins) | 1000/day | 85-95 |
| 2 | User uploads | (form) | Submitted via /create | — | 95 |
| 3 | Website scrape | (fetch) | Images from existing site (preserve brand equity) | — | 80-90 |
| 4 | **DALL-E 3 HD / gpt-image-1** | OPENAI_API_KEY | **PRIMARY slot-fill engine — per-slot ultra-real perfect photo** | — | 85 |
| 5 | Pexels | PEXELS_API_KEY | Stock photos + videos (speed-pass) | 200/hr | 60 |
| 6 | Pexels Video | PEXELS_API_KEY | Hero video loops (preferred over static stock) | 200/hr | 70 |
| 7 | Google CSE | GOOGLE_CSE_KEY+CX | Web image search (filtered + relevance-scored) | 100/day | 40-70 |
| 8 | Unsplash | UNSPLASH_ACCESS_KEY | Stock photos (landscape) | 50/hr | 55 |
| 9 | Pixabay | PIXABAY_API_KEY | Illustrations, vectors | 100/hr | 45 |
| 10 | Flux 1.1 Pro Ultra | FAL_API_KEY OR REPLICATE_API_TOKEN | Secondary AI (photoreal humans, complex scenes) | — | 85 |
| 11 | GPT Image 1.5 | OPENAI_API_KEY | Stylized illustrations, sections, OG | — | 80 |
| 12 | Ideogram 3.0 | IDEOGRAM_API_KEY | Logo + favicon set + text-heavy | — | 80 |
| 13 | Recraft V3 | RECRAFT_API_KEY | Editable SVG icon sets | — | 75 |
| 14 | Foursquare | FOURSQUARE_API_KEY | Venue-specific photos | — | 65-75 |
| 15 | Yelp Fusion | YELP_API_KEY | Business listing photos | — | 60-70 |
| 16 | Stability AI SD3 | STABILITY_API_KEY | Backgrounds, patterns, textures | — | 65 |
| 17 | Sora | OPENAI_API_KEY | 5–10s video loops | — | 70 |
| 18 | Cloudinary | CLOUDINARY_* | Transform layer (WebP/AVIF, AI-crop) | 25GB free | — |

**DALL-E-first slot-fill rule (***UNIVERSAL — for slots 4+ in the chain***):** Once real-entity sources (Places/uploads/scrape) are exhausted, DALL-E is invoked BEFORE generic stock — the per-slot prompt produces a tighter topic match than any stock library can return. Stock APIs run in parallel as speed-pass fallback (instant return for quick fill if DALL-E call hangs >15s) but DALL-E output is preferred at curation. Brian's preference: "DALL-E can literally create the ultra-realistic perfect photo for any given photo spot, so rely on that fact" — encoded as default behavior, not opt-in.

**2026 image-stack pricing reference (***drives engine selection in research_images prompt***):**

| Engine | Cost/img | Best For | License |
|--------|----------|----------|---------|
| Pexels | free | Stock photos + videos, all categories | commercial-OK |
| Wikimedia Commons | free | Named landmarks, historic, public figures | CC |
| Flickr CC | free | Niche/hyperlocal photography | CC-licensed-only |
| Ideogram Turbo | $0.025 | OG cards w/ tagline + logo | commercial-OK |
| Stability AI SD3 | $0.03 | Textures, patterns, abstract bg | commercial-OK |
| GPT Image 1.5 | $0.034 | Stylized illustrations, section dividers | commercial-OK |
| DALL-E 3 HD | $0.04–0.08 | Fallback for Flux when key absent | commercial-OK |
| Flux 1.1 Pro Ultra | $0.06 | Photoreal hero (humans, complex scenes, 4MP+) | commercial-OK |
| Recraft V3 | $0.08 | Editable SVG icon sets, brand-style adherence | commercial-OK |
| Ideogram 3.0 | $0.09 | Logo + favicon set + text-heavy graphics | commercial-OK |
| Sora | $0.20–0.40 | Short narrative video loops | commercial-OK |
| Google Street View | $0.007 | Storefront, signage | commercial-OK |

Total typical media spend: $0.50–2.00/site. **Engine selection logic:** photoreal hero → Flux 1.1 Pro Ultra | stylized → GPT Image 1.5 | logo → Ideogram 3.0 | SVG icons → Recraft V3 | OG card → Ideogram Turbo | video → Pexels first, Sora when premium → fallback DALL-E 3 HD when Flux key absent. Brian's stated preference (DALL-E heavy use) preserved as fallback chain entry.

**pHash dedup (***replaces md5 — visually identical but byte-different images dedupe correctly***):** sharp 8×8 DCT → 64-bit hash → hamming distance ≤6 = duplicate. Implementation in `~/.agentskills/15-site-generation/blog-import.mjs::phash()`. md5 only as fallback when sharp unavailable.

## Google Street View (***LOCAL BUSINESS MUST-HAVE***)

Google Street View Static API (`GOOGLE_MAPS_API_KEY`): captures storefront/signage automatically. Three shots per business:
1. `source=outdoor&heading=auto` — front-facing storefront, best for signage/brand extraction
2. `source=outdoor&heading={heading+45}` — angled view showing context/neighboring businesses
3. `source=outdoor&heading={heading-45}` — opposite angle

URL: `https://maps.googleapis.com/maps/api/streetview?size=1200x800&location={lat},{lng}&source=outdoor&key={GOOGLE_MAPS_API_KEY}`. Check `status` endpoint first — returns `ZERO_RESULTS` if no imagery available. Cost: $7/1000 requests. Cache aggressively in R2 — Street View rarely changes.

Use for: brand extraction (signage colors/fonts), storefront hero image (if no better photo), neighborhood context, building exterior for "Visit Us" section.

## Interior + Staff Photo Acquisition

**Google Places photo types:** The Places API returns photos tagged by Google's classifier. Filter for: `types: ["interior"]` for ambiance shots, `types: ["food"]` for restaurants, owner-uploaded photos (often show staff/team). Download all — more is always better for local business media richness.

**Yelp Fusion photos:** Business endpoint returns user-uploaded photos. These are often candid interior/food/service shots that feel authentic. Higher emotional impact than staged photos. Rate: 5000 API calls/day.

**Staff/team photos:** Search Google CSE: "{business_name} team" OR "{business_name} staff" with `searchType=image`. Also check business Facebook page (if verified in social check) — cover photos and "About" section often have team photos. NEVER generate fake headshots — use real photos or skip the team section entirely.

## Image Search Queries

Per business: construct 3-5 search queries combining: business type + city, business name + storefront, business type + interior, specific services + professional. Example for "Vito's Mens Salon, Lake Hiawatha NJ": `["mens salon interior modern", "barber shop Lake Hiawatha NJ", "men haircut professional", "salon storefront exterior"]`.

## Logo Discovery (***NON-NEGOTIABLE — KEEP ORIGINAL IN ALMOST ALL CASES***)

Priority: 1. User upload 2. ***Scrape from existing site*** — `<img>` in `<header>/<nav>` (alt/class/src contains "logo"|"brand"|"site-logo"|"custom-logo-link" — WordPress) → `<link rel="icon">` → `<link rel="apple-touch-icon">` → `<link rel="mask-icon">` → `<meta property="og:image">` → `<meta name="msapplication-TileImage">` → `wp-content/uploads/*/logo*` → Squarespace `header-title-logo img` → theme.json/customize.css logo refs 3. Logo.dev (`LOGODEV_TOKEN`) 4. Brandfetch (`BRANDFETCH_API_KEY`) 5. Google favicon API (`https://www.google.com/s2/favicons?domain={d}&sz=256`) 6. Wayback Machine snapshot if live site down 7. AI-generate as LAST resort.

**Original-asset retention (***DEFAULT BEHAVIOR — never replace a quality logo***):** When source site has a professional logo+favicon (logo quality score ≥7/10 via GPT-4o detail:low, OR site is a known good-design brand), KEEP both verbatim. Replacement requires explicit user instruction OR logo quality score <7/10. Brand equity > AI-generated novelty. The lonemountainglobal.com lesson: original logo was perfectly designed; the rebuild shipped without it because extraction stopped at the header `<img>`. Now extraction walks ALL six head/meta sources above before falling back to generation.

**Logo font + visual element extraction (***GOLD MINE — drives ENTIRE site design***):** When logo found, single GPT-4o vision call extracts: `{font_family_guess (closest Google Font), font_weight, letterspacing, has_icon (bool), icon_description, icon_dominant_color, accent_graphic_description, accent_graphic_color, logo_style (modern/classic/serif/script/geometric/handdrawn), suggested_heading_font, suggested_body_font}`. Reuse the matched Google Font as `--font-heading` site-wide. The logo's graphic motif (mountain silhouette, leaf, geometric shape) becomes the site's hero motif — extracted as standalone SVG/PNG asset and reused as background splash, divider, OG card element, loading spinner.

**Background-asset-from-logo extraction (***LMG MOUNTAIN-SPLASH PATTERN — converts logo into hero***):** When logo contains a strong graphic element (mountain, wave, leaf, geometric mark), extract that element ALONE (no wordmark) at high resolution as a hero background splash. Process: GPT-4o identifies bounding box of icon-only region → ImageMagick crops + alpha-trims (`magick logo.png -alpha extract -trim +repage`) → upscale 2-4x via Real-ESRGAN or DALL-E variation → save `assets/brand-splash.png` (full-bleed hero bg) + `assets/brand-mark.png` (favicon-sized). Pair with logo's matched font → hero feels designed by the same hand that made the logo. The lonemountainglobal.com `mountain-background-splash.png` extracted from the logo is the canonical example.

**AI logo generation (***LAST RESORT — only when scrape fails OR original quality <7/10***):** Ideogram v3 preferred for text-heavy logos. Generate exactly 3 variants: A=lockup, B=icon, C=wordmark. Single GPT-4o detail:low call rates all 3 (1-10), picks winner. Winner <7: regenerate losing slot only (max 2 rounds). Cost: ~$0.05 total. Style: clean, modern, text-based with geometric accent. Brand colors + bold display font.

## Favicon Set (***real-favicongenerator MANDATORY — every site, every build***)

***Hard gate:*** every site MUST run the full favicon generation pipeline. Use the chosen icon-only logo region (no text wordmark — extract icon via GPT-4o bounding box if logo is a lockup) as input. Two execution paths:

1. **realfavicongenerator.net API (preferred — 30+ asset variants):** POST to `https://realfavicongenerator.net/api/favicon` with `api_key` (`REAL_FAVICON_GENERATOR_API_KEY`), base64-encoded master image (≥260×260 PNG, transparent background), `favicon_design` config (iOS background color, Android theme color, Windows tile color, Safari pinned-tab color — all from `_brand.json.colors`). Response includes ZIP URL → download → extract to `public/`. Generates: `favicon.ico` (16+24+32+48+64), `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png` (180×180), `android-chrome-192x192.png`, `android-chrome-512x512.png`, `mstile-144x144.png`, `mstile-150x150.png`, `mstile-310x150.png`, `mstile-310x310.png`, `safari-pinned-tab.svg`, `site.webmanifest`, `browserconfig.xml`, `manifest.json`, plus the head HTML snippet. Inject the snippet into `index.html` `<head>` verbatim.

2. **Local fallback (no API key OR offline):** ImageMagick chain — `magick icon-master.png -fuzz 15% -trim +repage -resize 512x512 -background none -gravity center -extent 512x512 favicon-512.png` then derive each size. Build `.ico` via `magick favicon-16.png favicon-32.png favicon-48.png favicon.ico`. Hand-craft `site.webmanifest` (192+512 refs, theme_color from brand, background_color from theme), `browserconfig.xml` (MS tile), Safari `safari-pinned-tab.svg` (single-color silhouette via `magick ... -threshold 50% -colorspace gray svg:`). 14 total files minimum. **In-container alt** (no ImageMagick): `buildPngIco()` — manual ICO construction: 6-byte header + 16-byte directory entry + raw PNG bytes. Width/height 0 (=256+), 32-bit, offset 22. Store full PNG as favicon.ico (browsers handle it).

**Hard gate:** `public/` MUST contain ALL of: `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `safari-pinned-tab.svg`, `site.webmanifest`, `browserconfig.xml`. Missing any = build incomplete. Verify with `ls public/ | grep -E '(favicon|apple-touch|android-chrome|safari-pinned|site\.webmanifest|browserconfig)'` — count must be ≥9.

## AI-Generated Original Content (***AGGRESSIVE — EVERY SITE***)

Generate originals when stock/discovered images are insufficient or generic. Originals make the site feel bespoke.

| Type | API | Use Case | Cost |
|------|-----|----------|------|
| Hero backgrounds | GPT Image 1.5 | Abstract brand-colored scenes, atmospheric gradients with depth | ~$0.04 |
| Service illustrations | GPT Image 1.5 | Custom illustrations per service offered | ~$0.04 |
| Section dividers | Stability AI | Geometric patterns, brand-colored abstract art | ~$0.03 |
| Texture overlays | Stability AI | Noise, grain, mesh gradients for glassmorphism | ~$0.03 |
| Team/about imagery | GPT Image 1.5 | Workplace scenes matching business type (NOT fake headshots) | ~$0.04 |
| Logo + variants | Ideogram v3 | A=lockup, B=icon, C=wordmark | ~$0.05 |
| OG preview image | GPT Image 1.5 | 1200x630 social share card with brand + business name | ~$0.04 |
| Icon set | Ideogram v3 | Custom service icons matching brand style (if generic Lucide insufficient) | ~$0.05 |

**Generation strategy:** Generate 3-5 hero candidates, 1 per service, 2-3 atmospheric textures, 1 OG image. Pick best via GPT-4o detail:low (single batch call, all candidates in one request). Total generation: ~$0.30-0.50. Combined with logo A/B/C: ~$0.35-0.55 generation spend.

**Prompt patterns for GPT Image 1.5:**
- Hero: "Cinematic wide shot, {business_type} environment, {brand_primary} and {brand_secondary} color palette, dramatic lighting, professional photography style, no text, no people, 16:9"
- Service: "Clean modern illustration of {service_name}, {brand_colors}, minimal style, white/dark background, professional"
- Texture: "Abstract geometric pattern, {brand_primary} gradients, subtle depth, seamless tileable, dark background"

## Video Discovery (***3-5 VIDEOS MINIMUM***)

YouTube Data API (`YOUTUBE_API_KEY`): search business name + city → top 3 results. Search business type + "professional" → 2 more. Pexels Video API (`PEXELS_API_KEY`): search business type for B-roll (3-5 clips). Store as video manifest JSON (URL, thumbnail, duration, title) — not downloaded. Embed via YouTube iframe or Pexels player.

**Video placement strategy:** Hero background (muted autoplay 4-8s loop from Pexels), services section (YouTube embed if business has channel), about section (B-roll montage), testimonials (video reviews if available). Every page should have at least one video or animated element.

## Image Profiling (***COST-TIERED***)

**Tier 1 — Workers AI Llama Vision (FREE):** Profile ALL images: description, keywords (3-5), quality_score (1-10), relevance_score (1-10), suggested_placement, alt_text, dominant_colors (3-5 hex). Batch 5 images/call, 3 batches parallel. Sufficient for 90% of placement decisions.

**Tier 2 — GPT-4o detail:low (~$0.02):** Top 5 hero candidates only (sorted by Tier 1 combined score). Single batch call. Picks final hero, validates brand color extraction, confirms quality for above-the-fold placement.

Reject: quality <5, relevance <4, watermarks, inappropriate content, <1000 bytes (tracking pixels), >10MB. Store profiles as `_image_profiles.json`. Claude Code reads this to know which image goes where.

## Image Storage

R2 path: `sites/{slug}/assets/discovered/{safeName}-{confidence}pct.{ext}`. Custom metadata: source, confidence, originalUrl. User uploads: `sites/{slug}/assets/uploaded/`. Generated: `sites/{slug}/assets/generated/`. Logo: `sites/{slug}/assets/logo.png`.

## Media for Different Site Types

**SaaS:** Product screenshots (Playwright on demo), feature illustrations (GPT Image 1.5), integration partner logos, abstract hero (gradient mesh or 3D), team photos.

**Portfolio:** Project screenshots/photos are THE content. High-res, properly cropped. Before/after comparisons. Process photos. Client headshots for testimonials.

**Restaurant:** Food photography is critical. Google Places photos, Yelp photos, menu item images. Interior ambiance shots. Chef/team photos. Prioritize appetizing, well-lit food images.

**Non-profit:** Impact photos (people helped, events), team/volunteer photos, partner logos, infographic-style impact stats. Warm, dignified — never poverty tourism.

**Real estate:** Property photos, neighborhood shots, market data visualizations. Virtual tour links. Agent headshots.

## Placeholder Strategy

If insufficient images: CSS gradients as backgrounds (never stock photos as placeholders). Gradient patterns: `linear-gradient(135deg, {brand_primary}22, {brand_secondary}11)`. SVG abstract patterns generated from brand colors. Never leave empty image slots — either fill with real content or use branded gradient.

## Hard Gates Summary (***BUILD-BREAKING — verified post-build***)

- `public/images/` count ≥ `max(30, original_image_count × 1.4)` else FAIL
- `public/` contains all 9 favicon assets (favicon.ico, 16/32/180/192/512 PNGs, safari-pinned-tab.svg, site.webmanifest, browserconfig.xml) else FAIL
- ≥1 logo file in `public/` (`logo.{png,svg,webp}` AND `logo-header.png`) else FAIL
- Every original-site slider image group preserved with order + group manifest else FAIL
- Every original-site PDF/DOC linked in body content downloaded to `public/docs/` and surfaced on the equivalent new page else FAIL
- ≥3 DALL-E-generated originals when OPENAI_API_KEY present else WARN (FAIL if 0 originals)
- ≥3 video assets (Pexels stock, YouTube embed, or original-site video) else WARN

## Performance Budget

Total images <500KB compressed. Largest single image <200KB. Hero: eager+preload+fetchpriority=high. Below fold: lazy+decoding=async. Prefer WebP (CF Image Transforms format=auto). srcset: 320/640/1280/1920w. Inline SVGs <2KB each.
