---
name: "media-acquisition"
description: "12+ API media sourcing strategy for site generation. Stock photos, AI-generated images, logos, videos, favicon sets. Collect 100 candidates → AI inspect → curate top 15."
updated: "2026-04-24"
---

# Media Acquisition

Collect 10x more assets than needed, curate down via AI visual inspection. A 4-page site needs ***30-50 high-quality images + 3-5 videos + 1 logo + 5-10 AI-generated originals*** minimum. The site must feel media-rich and immersive from the first scroll. Every site MUST have a logo and favicon set. Users should feel like a professional agency spent weeks curating this content.

## Original Media Extraction (***FIRST STEP — EVERY BUILD WITH A SOURCE SITE***)

Before any stock/AI sourcing, walk the source site and extract EVERYTHING. The original site's media is canonical brand voice — discarding it is malpractice.

**Walk-list (***apply to every page in sitemap, in order***):** (1) `<header>` + `<nav>` logos via the Logo Discovery chain below; (2) ALL `<img src>`, `<img srcset>`, `<picture><source srcset>`, `<image href>` (SVG) on the page body — download every variant in srcset, keep the largest; (3) CSS background-images: parse computed styles via Playwright (`window.getComputedStyle(el).backgroundImage`) for every visible element — backgrounds carry hero photography, brand splashes, section dividers; (4) ***slider/carousel/swiper images (***NEVER MISS — they hide from naive scrapers***):*** Swiper.js (`.swiper-slide img`), Slick (`.slick-slide img`), Splide (`.splide__slide img`), Glide (`.glide__slide img`), WordPress Smart Slider (`.n2-ss-slide-background-image`), Squarespace Gallery (`.sqs-gallery-image img, .sqs-gallery-block-grid img, [data-slide-url]`), Wix Gallery (`[data-mesh-id*="gallery"] img`), Elementor Slides (`.elementor-slide-bg`), bxSlider/Owl/Flickity equivalents — query each container, force JS execution via Playwright (`waitForLoadState('networkidle')`), then extract every slide image; (5) `<video src>` + `<source src>` + lazy-load placeholders (`data-src`, `data-original`, `data-lazy`, `data-srcset`, `loading="lazy"` deferred URLs); (6) downloadable documents — `<a href$=".pdf">`, `.doc(x)`, `.ppt(x)`, `.xls(x)`, `.zip` linked from body content (resumes, brochures, menus, annual reports — always feature these on the new site, see "Document Preservation" below); (7) `og:image`, `twitter:image`, `og:video`, `msapplication-TileImage`, `<link rel="preload" as="image">` URLs; (8) inline SVGs (copy `<svg>` markup verbatim — these are often custom brand illustrations); (9) WordPress block images (`wp-image-*` classes carry attachment IDs — `wp-json/wp/v2/media/{id}` returns full-size original).

**Group preservation (***NEVER FLATTEN — slider images stay sliders***):** When extracting from a slider/carousel/gallery, store images with their group identity intact: `public/images/sliders/{slider-id}/{order-index}-{filename}` and emit a manifest entry `{group: "homepage-hero-slider", order: [...], aspect: "16:9", autoplay: true, interval: 5000}`. The new site rebuilds the same slider with the same images in the same order — never dump grouped sliders into a flat gallery grid.

**1.4x–2.0x augmentation rule (***NEVER FEWER IMAGES THAN ORIGINAL***):** Count original-site images. New site MUST ship `original_count × 1.4` minimum, `× 2.0` typical, `× 3.0` for thin source sites with <10 originals. Augmentation = original media + (Pexels/Unsplash/Pixabay stock matching brand voice) + (DALL-E 3 / GPT Image 1.5 originals matching extracted brand style — see DALL-E priority below) + (Google CSE image search for context shots). The deployed site should always feel richer, never sparser, than the source.

**DALL-E first for originals (***Brian's stated preference — use it a lot***):** When generating original imagery, use DALL-E 3 (via OpenAI Images API) as the primary engine — superior text rendering, brand-style adherence, and photorealistic results vs alternatives. Generate 3-5 hero variants per major section. Prompt template: `"Photorealistic [scene], [extracted brand color palette], [logo style adjective from logo extraction], shot on Hasselblad, golden hour, 85mm, no text, no logos, hyperdetailed, cinematic"`. Cost: ~$0.04-0.08/image (HD 1024×1792). Reserve GPT Image 1.5 for fast iteration, Stability AI for textures/patterns, Sora for short videos.

## Document Preservation (***RESUMES, BROCHURES, ANNUAL REPORTS — FEATURE PROMINENTLY***)

When the original site links to a downloadable document (PDF/DOC/PPT/XLS), it's there because the business considers it important. Examples: founder/team CVs, service brochures, restaurant menus, non-profit annual reports, capability decks, whitepapers, case studies. Download every linked document, store at `public/docs/{slug}.{ext}`, and feature them on the new site:

- ***Team/About pages — link CVs/resumes inline next to the person:*** "View {Name}'s Resume →" button. The lonemountainglobal.com `Vian_CV_Long_4-2-2024.pdf` linked on `/about` is the canonical example — it's her resume, prominently displayed by the source site, so the rebuild MUST keep it accessible.
- ***Generate a preview thumbnail*** (first page render via `pdftoppm` or `pdf2image`) → display as `<a href="...pdf"><img alt="..." class="doc-preview"></a>` so the document feels first-class, not buried.
- ***JSON-LD `DigitalDocument` schema*** for each preserved document → boosts visibility in Google's document carousel.
- ***Hard gate:*** every PDF/DOC linked in the original sitemap MUST resolve on the new site (200 or 301), and if it appears on a specific page on the original site, it MUST appear on the equivalent new page.

**Budget split:** GPT-4o vision QA capped at $1 (see completeness-verification). Media generation/acquisition is a SEPARATE budget — spend what's needed to make the site gorgeous. Ideogram (~$0.05/logo), GPT Image 1.5 (~$0.04/image), Stability (~$0.03/image), stock APIs (free tiers). Typical media budget: $0.50-2.00/site. This is GOOD spend — it creates the content that makes sites convert.

## API Priority Chain

| Priority | API | Key | Use | Rate | Confidence |
|----------|-----|-----|-----|------|------------|
| 1 | Google Places Photos | GOOGLE_PLACES_API_KEY | Actual business photos | 1000/day | 85-95 |
| 2 | User uploads | (form) | Submitted via /create | — | 95 |
| 3 | Website scrape | (fetch) | Images from existing site | — | 80-90 |
| 4 | Foursquare | FOURSQUARE_API_KEY | Venue-specific photos | — | 65-75 |
| 5 | Yelp Fusion | YELP_API_KEY | Business listing photos | — | 60-70 |
| 6 | Google CSE | GOOGLE_CSE_KEY+CX | Web image search | 100/day | 40-70 |
| 7 | Unsplash | UNSPLASH_ACCESS_KEY | Stock photos (landscape) | 50/hr | 55 |
| 8 | Pexels | PEXELS_API_KEY | Stock photos + videos | 200/hr | 50 |
| 9 | Pixabay | PIXABAY_API_KEY | Illustrations, vectors | 100/hr | 45 |
| 10 | GPT Image 1.5 | OPENAI_API_KEY | AI-generated hero/section | — | 75 |
| 11 | Ideogram v3 | IDEOGRAM_API_KEY | Logo generation | — | 70 |
| 12 | Stability AI | STABILITY_API_KEY | Backgrounds, patterns | — | 65 |

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
