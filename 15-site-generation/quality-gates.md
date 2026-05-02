---
name: "quality-gates"
description: "Visual inspection via GPT-4o, SEO audit, accessibility checks, 10-dimension quality scoring. Criticism registry with universal + domain-specific rules."
updated: "2026-04-24"
---

# Quality Gates

## Visual Inspection (MANDATORY — ***COST-TIERED***)

**In-container `inspect.js`:** Takes HTML file path → sends first 14KB to vision model. Persona: "senior Stripe web designer." 8 scoring categories: color contrast, typography, layout/spacing, animations, images, mobile responsiveness, brand consistency, visual polish vs generic AI look. Scale 1-10.

**Tiered model selection:**
- **Draft rounds (1-2):** Workers AI Llama Vision (FREE) — catches layout breaks, missing elements, broken images, contrast failures. Sufficient for 80% of issues.
- **Final round (homepage only):** GPT-4o detail:low (~$0.02) — catches aesthetic nuance, brand harmony, "does it feel premium?" Only if Workers AI round scores ≥7 (no point polishing a broken layout).

**In-container loop:** After `npm run build`, run `node /home/cuser/inspect.js dist/index.html`. If score <8: fix → rebuild → re-inspect. Max 3 iterations. Workers AI for rounds 1-2, GPT-4o for final homepage check only.

**Post-deploy inspection:** Worker screenshots via `microlink.io` API → Workers AI Llama Vision for all pages → GPT-4o detail:low for homepage ATF only → logs score + issues to D1 audit_logs.

## 10-Dimension Quality Scoring

| Dimension | Min | What |
|-----------|-----|------|
| visual_design | 0.85 | Layout balance, whitespace, color harmony, depth, animations |
| content_quality | 0.85 | Real content, no placeholder, accurate, comprehensive |
| completeness | 0.85 | All sections present, all images used, all pages linked |
| responsiveness | 0.85 | 375/768/1024px clean, no overflow, touch targets >=44px |
| accessibility | 0.85 | WCAG AA contrast, heading hierarchy, alt text, ARIA, skip link |
| seo | 0.85 | JSON-LD, meta, canonical, OG, sitemap, keyword placement |
| performance | 0.85 | <100KB HTML, lazy images, font preconnect, no render blocking |
| brand_consistency | 0.85 | Matches research colors/fonts, logo prominent, NAP consistent |
| media_richness | 0.85 | 30+ unique images, 3-5 videos, no broken, no duplicates, proper sizing |
| text_contrast | 0.85 | 4.5:1 body, 3:1 large text, no washed-out combinations |

Overall must exceed 0.90 to auto-publish. Below 0.85 any dimension → fix required.

## Universal Build Validators (***BUILD-BREAKING — runs on EVERY site***)

These validators run in `build_validators.ts` between R2 upload and `published` status. They apply to every generated site regardless of category, source, or domain. Each maps to a universal rule in skill 09 / 12 / always.md. New validators land in `report` mode for one build cycle then flip to `strict` once template ships clean.

| Validator | Source rule | Failure code |
|-----------|-------------|--------------|
| `validate-color-from-logo.mjs` | skill 09 color-extraction-second-pass | `color.hue_distance_from_logo` |
| `validate-logo-singularity.mjs` | skill 09 logo-singularity | `logo.multiple_in_container` |
| `validate-legal-page-consistency.mjs` | skill 09 LegalLayout-consistency | `legal.layout_inconsistent` |
| `validate-image-prompts.mjs` | skill 12 per-slot-prompts | `image.prompt_generic` |
| `validate-hero-media.mjs` | skill 12 hero-media-preference-order | `hero.no_media` |
| `validate-publication-imagery.mjs` | skill 12 publication-imagery | `publication.image_irrelevant` |
| `validate-lightbox-grouping.mjs` | skill 12 + always.md lightbox-grouping | `lightbox.group_split` / `lightbox.caption_missing` |
| `validate-social-brand-hex.mjs` | skill 12 social-brand-hex-map | `social.hover_color_wrong` |
| `validate-cursor.mjs` | always.md click-ripple-only (ring forbidden) | `cursor.ring_present` \| `cursor.native_hidden` \| `cursor.ripple_missing` |
| `validate-image-hover.mjs` | always.md image-hover-no-layout-shift | `image.hover_layout_shift` |
| `validate-google-maps-widget.mjs` | always.md google-maps-widget | `map.embed_missing` / `map.geo_mismatch` |
| `validate-links.mjs` | always.md zero-broken-links + zero-broken-images | `link.dead_blog_slug` / `link.unknown_route` / `asset.missing` |
| `validate-blog-filters.mjs` | always.md blog-listing-functional-filters (nyfoldingbox 2026-05-02) | `blog.filter_inert` \| `blog.url_no_sync` \| `blog.search_inert` \| `blog.deep_link_ignored` \| `blog.empty_state_missing` |

## Gorgeous-Loop Reinforcement (***FINAL CRITIQUE BEFORE DEPLOY — every site***)

After all functional + structural gates pass, the orchestrator MUST run a final aesthetic critique-and-edit pass on every site: GPT-4o (detail:high) reviews homepage + 2 highest-traffic sub-pages with the prompt "Make this even more gorgeous + beautiful + intuitive + concise + creative + witty + intelligent + confident — list 8-12 concrete edits, then apply them." Max 3 rounds of edit-rebuild-rescreenshot. Each round MUST measurably increase the visual_design + brand_consistency dimension scores by ≥0.03 OR exit early. Output diff written to `_polish_log.json` for criticism-registry feedback.

## Criticism Registry (chronological — generalized rules)

Each entry: user-feedback symptom on a specific site → universal rule that prevents the class of failure on every future build. Rules live in their source skill; this index is for traceability only.

**2026-05-02 cycle** (driven by lone-mountain-global-3.projectsites.dev feedback):
- Color hallucination (green primary on burgundy/navy/cream logo) → logo-pixel hue-distance verification (skill 09 color-extraction-second-pass)
- Header rendered icon-mark + wordmark as two adjacent `<img>` tags → logo-singularity (skill 09)
- /accessibility flat paragraphs while /privacy + /terms used boxed sections → shared `<LegalLayout>` (skill 09)
- /publications used irrelevant generic stock → journal-logo / paper-figure / generated-only (skill 12 publication-imagery)
- Hero with no video despite Pexels Video API availability → hero-media preference order (skill 12)
- Same-topic gallery images split across multiple lightbox groups → `data-gallery` inheritance + caption presence (skill 12 + always.md)
- Social-button hover used generic accent instead of brand hex → canonical social-brand-hex map (skill 12)
- Generic AI imagery ("create a hero image") → per-slot purpose-crafted prompts (skill 12)
- Plain-text address on /contact → "Every address" Google Maps directions href (always.md, pre-existing)
- No final polish pass → Gorgeous-Loop Reinforcement (this file, above)
- No embedded interactive map for local-business sites → Google Maps Embed API widget (always.md google-maps-widget)

**2026-05-02 cycle** (driven by njsk-light.projectsites.dev feedback — 12 critiques generalized):
- Pexels stock photo on hero when source had usable hero of its own → hero-media preference order ENFORCES original-source-hero IF quality≥7/10 wins over Pexels/DALL-E (skill 12 + always.md hero-image-preference)
- No impact stat-rollup section despite source surfacing 30+ years / 150K+ meals / 25k volunteers → "Every site IMPACT/STAT ROLLUP" universal rule + `validate-stat-counter-section.mjs` (always.md + this file)
- Body+heading anchor links lacked underline-on-hover → universal `.underline-hover` 51%→0 sweep canonical pattern + `validate-underline-hover.mjs` (skill 10 + always.md, pre-existing — reinforced)
- Modules popped into view without entrance animation → universal in-viewport fadeIn ONCE on entry + anti-FOUC `js-reveal-active` class + `validate-reveal-foud.mjs` (skill 11 + always.md + this file, pre-existing — reinforced)
- Single-source DALL-E imagery vs available Pexels Video / YouTube / Google Image stack → multi-source media generation per page + per-page-floor mandate (skill 12 + always.md "Every page (media density)" pre-existing — reinforced)
- Lightbulb on /volunteer + mixed-gender adults on /women-and-children → per-page topic-relevance vision-LLM scoring ≥8/10 + `validate-image-relevance.mjs` (skill 12 per-page-topic-relevance + always.md page-rendered image rule)
- Broken `/taryn-albania.jpg` style 404s → "Every image" zero-broken-images rule + post-build crawl gate (always.md + skill 15, pre-existing — reinforced)
- Mega-menu "About" snapped closed when cursor traveled diagonally toward panel → hover-bridge + Bostock 2013 triangle-aim + `validate-mega-menu-hover.mjs` (skill 10 mega-menu pattern + always.md + this file)
- /volunteer page imagery off-topic to volunteering → per-page topic-relevance gate (same as critique 6 — generalized)
- Original blog URLs 404 on rebuilt site (CMS slug scheme drift) → "Every site rebuild CROSS-SITE _REDIRECTS" universal rule + `validate-cross-site-redirects.mjs` (always.md + this file)
- Filter-chip taxonomies "All|News|Events" rendered but did NOT measurably filter → "Every interactive feature" functionality DOM-diff validator + `validate-interactive-functionality.mjs` (always.md + this file)
- Only 12 of 120+ source blog posts imported → COMPLETE BLOG/CONTENT CORPUS mandate + `validate-blog-corpus-complete.mjs` (always.md + this file + skill 15 njsk.org Quality Bar reinforcement)

## SEO Audit Checklist

- [ ] Title tag 50-60 chars with primary keyword
- [ ] Meta description 120-156 chars with keyword + CTA
- [ ] Canonical URL on every page
- [ ] One H1 per page containing primary keyword
- [ ] Logical H2→H3 hierarchy
- [ ] JSON-LD LocalBusiness with: name, address, phone, geo, hours, image, sameAs
- [ ] FAQPage schema on FAQ section
- [ ] BreadcrumbList on sub-pages
- [ ] OG title, description, image (1200x630), URL
- [ ] Twitter card: summary_large_image
- [ ] robots.txt allowing all crawlers
- [ ] sitemap.xml with all pages + lastmod
- [ ] Internal links: every page → 2+ other pages
- [ ] Image alt text with relevant keywords
- [ ] Primary keyword density 1-2% (natural, not stuffed)

## Accessibility Audit

WCAG 2.2 AA requirements:
- Color contrast >=4.5:1 body text, >=3:1 large text/UI
- Heading hierarchy: single H1, sequential H2→H3
- All images: descriptive alt text (not "image" or "photo")
- Form inputs: visible labels, not just placeholder
- Skip-to-content link
- lang attribute on <html>
- Focus-visible on all interactive elements
- Touch targets >=24px (WCAG 2.2 2.5.8)
- Focus appearance visible (2.4.11)
- Dragging alternatives (2.5.7) for any drag interactions
- ARIA roles on custom widgets only (semantic HTML preferred)

## Criticism Registry (evolving rules)

Universal rules applied to ALL generated sites:

**Color & Contrast:** Never use washed-out, muddy, or generic palettes. Brand colors enhanced for vibrancy if needed while keeping hue family. Every text/background combo checked for WCAG AA. Dark overlays on image-backed text sections.

**Typography:** Consistent font-weight hierarchy. Hero headlines max 8 words. Section labels consistent case. Button text uses action verbs. NAP (Name, Address, Phone) consistent everywhere.

**Images:** No broken images (naturalWidth > 0). No duplicate images. All images lazy except hero. Proper width/height/aspect-ratio. Loading shimmer placeholders. Every image in assets/ used somewhere.

**Layout:** No horizontal scroll at 375px. All text readable at 375px (min 14px). Consistent card grid alignment. No orphaned sections. Full-width on mobile, max-width on desktop.

**Brand:** Logo in every page header. Brand colors dominate, not generic Tailwind defaults. Font from logo/brand research used throughout. Favicon set present.

**Content:** No lorem ipsum. No TODO stubs. No "Coming Soon" pages. Copyright year current. Footer has Privacy + Terms links. Contact info matches research data exactly.

**Performance:** HTML under 100KB. No console.log. No render-blocking scripts. Fonts preconnected. Smooth scroll (no jarring jumps). Back-to-top button.

**Safety:** No inappropriate content. Privacy notice on forms. Footer compliance links. rel="noopener noreferrer" on external links. COPPA compliance if child-facing. ProjectSites.dev attribution in FAQ.

**Animation & Motion (skill 11):** `prefers-reduced-motion: reduce` on ALL @keyframes and transitions. View Transitions API with `@supports` gate. `@starting-style` for modal/toast entry. No animation longer than 300ms. Parallax only via `animation-timeline: scroll()` (off main thread).

**Core Web Vitals (***NON-NEGOTIABLE***):** LCP <= 2.5s (hero image preloaded, `fetchpriority="high"`). CLS <= 0.1 (all images have width/height/aspect-ratio). INP <= 200ms (no blocking event handlers). Fonts preconnected + `font-display:swap`. CSS `<link>` in `<head>`, JS deferred.

**Image Optimization (***BUILD-BREAKING***):** Every image in assets/ must have WebP+AVIF variants at 320/640/1280/1920w. No raw PNG/JPG served to browser. `<picture>` with srcset on all `<img>` elements. Blur placeholder (base64) on below-fold images. Hero: eager+preload+fetchpriority=high. Max single image: 200KB optimized. Total page: <500KB images. Verify: no `<img src="*.jpg">` or `<img src="*.png">` in dist/ HTML (must be inside `<picture>` with WebP source).

**Offline Capability:** Service worker registered in production. After build: simulate offline in DevTools → verify site loads from cache. Contact info (phone, address, hours) available offline. Gallery images cached. Analytics gracefully degrade (no errors when offline).

**Analytics Verification:** PostHog snippet present with `persistence:'memory'`. GTM container snippet in head + noscript. Local conversion events wired: `tel:` → phone_click, Maps → direction_click, form → form_submit. Verify all three fire on page load (PostHog, GA4, GTM).

**Structured Data Validation:** JSON-LD LocalBusiness with: @type, name, address (PostalAddress), telephone, geo (GeoCoordinates), openingHoursSpecification, image, sameAs[], aggregateRating (if reviews exist), priceRange, areaServed, hasMenu (restaurants). FAQPage schema on FAQ sections. BreadcrumbList on sub-pages. Validate with Google Rich Results Test.

**Cross-Browser:** Test in Chrome + Safari (80%+ local business visitors). Safari-specific: `-webkit-` prefixes for backdrop-filter, scroll-snap. No Firefox-only CSS features without fallback.

**Lightbox Coverage (***BUILD-BREAKING***):** `src/components/lightbox.tsx` MUST exist and be mounted in Layout. Every page with 4+ content images MUST include at least one `[data-gallery]` wrapper. Build gate: grep `dist/assets/*.js` for `data-zoomable` AND `data-gallery` strings — both required. Visual gate: Playwright opens 3 random pages, clicks 1st content image, asserts `[role="dialog"][aria-modal="true"]` appears within 200ms, presses `→`, asserts image src changes, presses `Esc`, asserts dialog removed. Audit checklist: prev/next buttons present when gallery has 2+ images|counter `n/total` visible|figcaption from alt text|44×44 close button|swipe gestures wired (Pointer Events listener)|`prefers-reduced-motion` disables scale|preload of neighbor images|focus-trap on modal-only.

**Asset Existence (***BUILD-BREAKING***):** Every `<img src>`, `<source srcset>`, `<link href>`, `<script src>`, `<video src>`, `<source src>`, `url(...)` in dist/ HTML+CSS must resolve to a file present in dist/ OR an allowed external host (https only, hostname in allowlist: googletagmanager.com, fonts.googleapis.com, fonts.gstatic.com, www.google.com/maps/embed, microlink.io, posthog.com). Local refs (starting `/` or relative) checked against `find dist -type f`. Build gate: `node validate-assets.js dist/` — fail if any reference 404s. The megabyte-labs `/og-image.png` 404 incident (HTML referenced .png, R2 had .jpg) MUST never repeat.

**Image Format vs Size (***BUILD-BREAKING***):** Any PNG over 200KB MUST be re-encoded to WebP (lossy q=85) or JPEG progressive (q=82) before R2 upload. Hero photos: WebP+AVIF variants at 1920/1280/640/320w. Logos: keep PNG only if <50KB transparent — otherwise SVG. OG cards: PNG OK at 1200×630 ≤100KB; if larger, re-encode to JPEG q=85. Build gate: `node validate-image-budgets.js dist/` — flag any single image >200KB, total images >500KB.

**OG Image Quality (***BUILD-BREAKING***):** Every site MUST ship `/og-image.png` (or .jpg) at exactly 1200×630, ≤100KB, branded card style: dark brand background, primary color accent bar, business name in display font, tagline below, logo bottom-right. NO scraped or stock photo as og-image — must be generated via Satori or DALL-E with brand colors. `<meta property="og:image:width" content="1200">` + `og:image:height content="630"` mandatory. Twitter `summary_large_image` card mandatory.

**Apple Touch Icon (***BUILD-BREAKING***):** `/apple-touch-icon.png` at 180×180 mandatory at root, generated from logo. `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">` in every page head. Missing icon = build fails.

**Meta Description Strict (***BUILD-BREAKING***):** Every page meta description 120-156 chars HARD LIMIT. Title 50-60 chars HARD LIMIT. Build gate: `node validate-meta.js dist/**/index.html` — count chars (not bytes), fail if outside ranges. Pages without meta desc = fail.

**JSON-LD Count (***BUILD-BREAKING***):** Every page MUST include 4+ JSON-LD `<script type="application/ld+json">` blocks. Required minimum: WebSite + Organization (or LocalBusiness) + WebPage + BreadcrumbList. Sub-pages add: Product (manufacturer), BlogPosting (blog post), FAQPage (faq page), Person (team member), Article (article page). Build gate: count `application/ld+json` in dist HTML, fail if <4 on any indexed page.

**H1 in HTML Shell (***BUILD-BREAKING — SEO***):** SPAs MUST prerender hero H1 + first paragraph + meta into the static `index.html` shell so crawlers see content without executing JS. Use `vite-plugin-prerender-spa` or static `<noscript>` fallback with H1 + business name + brief description. Build gate: `node validate-h1.js dist/index.html` — must find at least one `<h1>` in the raw HTML before any `<script>` tag executes.

**Sitemap lastmod (***BUILD-BREAKING***):** Every `<url>` in `sitemap.xml` MUST include `<lastmod>YYYY-MM-DD</lastmod>` set to build timestamp. Missing lastmod = fail.

**color-scheme Meta (***DARK SITES***):** Sites with dark theme as primary MUST include `<meta name="color-scheme" content="dark light">` so browsers render scrollbars + form controls correctly without flash-of-light.

**JS Code-Splitting (***PERFORMANCE GATE***):** Vite config MUST include `build.rollupOptions.output.manualChunks` splitting React core, UI lib, route bundles. Per-route chunks via `React.lazy()` for any page >50KB. Build gate: largest single .js chunk <250KB gz; total JS <500KB gz.

**DNS Prefetch + Font Preload (***PERFORMANCE — STANDARD***):** `<link rel="dns-prefetch">` + `<link rel="preconnect" crossorigin>` for fonts.googleapis.com, fonts.gstatic.com, www.google-analytics.com. `<link rel="preload" as="font" type="font/woff2" crossorigin>` for primary display + body font. Hero image: `<link rel="preload" as="image" fetchpriority="high">`.

**Custom Hostname Canonical (***SEO***):** When projectsites.dev subdomain represents a real brand with custom domain potential or existing custom hostname, canonical URL MUST point to the custom domain (not the projectsites.dev URL) once domain provisioned. During pre-domain phase: canonical = projectsites.dev URL is acceptable.

**`tel:` in Nav for Local Business (***CONVERSION***):** Local businesses with phone numbers MUST include a `<a href="tel:+...">` in primary navigation desktop + mobile, plus a sticky mobile CTA bar at bottom. Click triggers PostHog `phone_click` + GA4 `tel_click`.

**Cookie Consent / GDPR:** If site targets EU: cookie banner with accept/reject. PostHog `persistence:'memory'` = no cookies (compliant by default). Google Analytics requires consent mode v2 (`gtag('consent', 'default', {analytics_storage:'denied'})` until accepted).

**NAP Consistency (***BUILD-BREAKING***):** Name+Address+Phone must match EXACTLY across: site header, NAPFooter, JSON-LD LocalBusiness, Google Maps embed, contact page, `_gbp_sync.json`. Any divergence = build failure. Automated check in inspect.js: extract NAP from all sources, diff, fail if mismatch.

**Component Completeness:** All 16 local components must be available in template. Build prompt must reference: HeroWithPhoto, ServiceCards, TestimonialCarousel, MapEmbed, StickyPhoneCTA, NAPFooter, TrustBadges, ReviewCTA, GalleryGrid, BeforeAfterSlider, QuickActions, EmergencyBanner, SpeedDial, BookingEmbed, LocalSchemaGenerator, ResponsiveImage. Missing component = template drift.

**PWA Validation:** site.webmanifest present with correct name/icons/theme_color. Favicon set complete (ico+16+32+apple-touch+android-chrome 192+512). `<link rel="manifest">` in index.html.

**Print Stylesheet:** `@media print` rules present in index.css. Verify: nav/footer/sticky hidden, body white bg, link URLs printed.

**Service Area Pages (if applicable):** Each `/service-area/{city}` has unique H1, meta desc, localized content. No duplicate content across pages. All pages in sitemap.xml.

**URL Preservation (***BUILD-BREAKING***):** Parse original sitemap from `_scraped_content.json`. Every original URL must return 200 (actual page) or 301 (redirect to new location). Zero 404s for previously-indexed URLs. Generate `_redirects` file for Cloudflare Pages or equivalent server-side redirect map. Build gate: `node validate-urls.js` compares original sitemap URLs against new sitemap + `_redirects` — fail if any URL unaccounted.

**Citations & Sources (***BUILD-BREAKING — rules/citations.md***):** Every quantitative claim (%, N, $, ratio, comparison, year-claim) on every page MUST cite source via `<Citation refId="...">` resolving to `_citations.json` entry (APA 7th ed). Banned unsourced phrases: "studies show|research suggests|most users|industry-leading|trusted by|proven|widely-recognized|recent studies|experts agree|countless|numerous|many|often|typically". JSON-LD Article/BlogPosting/FAQPage/Claim schemas MUST include `citation: CreativeWork[]` array per source. Build gate: `node validate-citations.js dist/` greps `\d+%|\$\d+[MBK]|\d+x|\d+ users|since \d{4}` — any unsourced match fails build. Source hierarchy: peer-reviewed > .gov/.edu > primary data > industry research. Wikipedia rejected. Confidence>=0.85 requires 2+ cites.

**Content Migration Completeness:** New site word count must MATCH OR EXCEED original site word count from `_scraped_content.json`. All blog posts migrated as individual pages. Blog listing page with pagination present if original had blog. RSS feed at `/feed.xml` or `/rss.xml`. No substantive content discarded without explicit user approval.

**Donation Page (non-profit/church):** `/donate` or `/give` page present with both one-time and monthly options. Monthly selected by default. Suggested amounts visible. Stripe integration or link to existing platform. Donation CTA present on 3+ pages.

## Domain-Specific Quality Rules

**Restaurant:** Menu must have prices. Food photos must look appetizing (well-lit, styled). Hours prominently displayed. Online ordering CTA if platform exists.

**Salon/Barber:** Services with prices. Booking CTA prominent. Before/after gallery. Stylist profiles with photos.

**Medical:** Provider credentials displayed. HIPAA-compliant form language. Emergency info. Insurance accepted list.

**Legal:** Practice areas with descriptions. Attorney profiles with bar info. Free consultation CTA. Client testimonials with attribution.

**Non-profit:** Donation CTA in hero + footer + every page. Impact counters animated. Volunteer signup. 501(c)(3) status visible.

**SaaS:** Pricing tiers comparison. Free trial CTA. Integration logos. API docs link. Status page link. SOC2/GDPR badges if applicable.

## Generalization Principle

When any specific criticism is received about a generated site, it MUST be generalized into a rule that applies to ALL future builds. Example: "njsk.org colors are wrong" → "NEVER guess colors from business category; ALWAYS extract from logo/website." The criticism registry grows with every user feedback cycle.

Canonical generalization cases (njsk-light 2026-05-02 cohort — 12 site-specific critiques → 12 universal rules + validators):
- "lightbulb image on /volunteer" → "Every page-rendered image scores ≥8/10 vs per-page topic via GPT-4o vision" → `validate-image-relevance.mjs`
- "no stat-rollup despite 30 years + 150K meals" → "Every site renders impact-stat section when ≥3 quantifiable stats resolve" → `validate-stat-counter-section.mjs`
- "mega-menu snaps closed mid-traverse" → "Every desktop mega-menu has hover-bridge + Bostock 2013 triangle-aim" → `validate-mega-menu-hover.mjs`
- "old blog URLs 404 on new site" → "Every site rebuild emits per-URL `_redirects` 301 covering original sitemap intersection" → `validate-cross-site-redirects.mjs`
- "filter chips do nothing" → "Every interactive feature mutates DOM measurably on click — styled-but-stub UI fails build" → `validate-interactive-functionality.mjs`
- "only 12 of 120 blog posts imported" → "Every site rebuild imports 100% of source blog/news/articles corpus — never subsample" → `validate-blog-corpus-complete.mjs`
- "stock hero when source had its own hero" → "Hero preference order: original-source ≥7/10 > Pexels-video > Pexels-image > DALL-E per-slot > brand-gradient" → enforced inside `validate-image-relevance.mjs`
The pattern: site-specific symptom → name the class of failure → universal rule in `~/.claude/rules/always.md` → automated validator row in `## Automated Build Gates` table → criticism-registry entry citing the original incident date+site. Future incidents that match an existing class extend (NOT duplicate) the existing rule.

## Automated Build Gates (***RUN POST-BUILD, FAIL HARD***)

Every projectsites.dev build MUST pass these automated gates before R2 upload. Wired in `package.json` `gate` script: `node scripts/validate-assets.mjs dist && node scripts/validate-meta.mjs dist && node scripts/validate-citations.mjs dist && node scripts/validate-h1.mjs dist && lhci autorun && playwright test --grep @gate`.

| Gate | Tool | Threshold | Fail Action |
|------|------|-----------|-------------|
| Asset existence | `validate-assets.mjs` (skill 15) | 9 mandatory files + every ref resolves | exit 1 |
| Meta length | `validate-meta.mjs` | title 50–60ch, desc 120–156ch | exit 1 |
| H1 in shell | `validate-h1.mjs` | `<h1>` present before `<script>` in raw HTML | exit 1 |
| Citations | `validate-citations.mjs` | every `\d+%`/`\$\d+[MBK]`/`\d+x` cited APA | exit 1 |
| URL preservation | `validate-urls.mjs` | every original URL → 200 or 301 | exit 1 |
| Source parity | `compare-source.ts` | new word count ≥ original × 1.0, image count ≥ original × 1.4 | exit 1 |
| Lighthouse | `@lhci/cli` v0.15+ | Perf≥75, A11y≥95, BestPractices≥95, SEO≥95 | exit 1 |
| Accessibility | `@axe-core/playwright` v4.11+ | 0 WCAG 2.2 AA violations | exit 1 |
| Visual regression | Percy AI Visual Review / pixelmatch | <0.1% pixel diff vs baseline | warn → review |
| Image budget | `validate-image-budgets.mjs` | single ≤200KB, total ≤500KB | exit 1 |
| Cross-browser smoke | Playwright Chrome+Safari | homepage loads, no console errors at 6 breakpoints | exit 1 |
| Pseudo-element positioning | `validate-pseudo-position.mjs` (grep CSS for `::before\|::after` blocks containing `top:\|left:\|right:\|bottom:` → assert parent selector has `position:` declared) | every absolutely-positioned ::before/::after has parent `position: relative\|absolute\|fixed\|sticky` | exit 1 |
| Lightbox-on-logos forbidden | `validate-lightbox-targets.mjs` (grep dist/ source for `data-gallery="logos\|trusted\|sponsors\|partners\|institutions\|press\|publications\|awards"`) | zero matches — institutional logo grids must use hover-grayscale-to-color (skill 12 lightbox-classifier.md) NOT lightbox | exit 1 |
| Per-route metadata | `validate-route-metadata.mjs` (every `<Route path>` in App.tsx has matching entry in src/data/page-meta.ts OR data-derived meta from blogPosts[]) | 100% route coverage, no fallback `index.html` `<title>` showing on production routes | exit 1 |
| White-flash transition | Playwright records 60fps video of route transition on dark-themed sites → asserts NO frame contains average pixel-luminance >0.5 | dark sites pass, light sites N/A | exit 1 |
| PWA full kit | `validate-pwa.mjs` (skill 06 pwa-kit.md) | site.webmanifest valid + ≥6 icon entries + ≥2 real screenshots + sw.js registered + offline.html ≤30KB with NAP + Lighthouse PWA ≥0.95 | exit 1 |
| Publication crawl depth | `validate-publications.mjs` (skill 15 SKILL.md "Deep crawl per page") | `_publications.json` length ≥ source index item count, every entry has paraphrased summary + outbound URL + source logo + date | exit 1 |
| Logo transparency | `validate-logo-alpha.mjs` (Sharp corner-pixel sample) | every shipped logo PNG has alpha<255 on ≥1% of corner pixels (no white-rectangle floating logos) | exit 1 |
| Institutional logos resolved | `validate-institutional-logos.mjs` | every name in `_research.json.affiliations[]\|publications[].source\|sponsors[]\|partners[]` has a resolved logo file in dist/ | exit 1 |
| Grammar audit | `validate-grammar.mjs` (skill 09 grammar-audit.md GPT-4o-mini final pass) | zero grammar/spelling/typography errors flagged on every rendered page | exit 1 |
| Brand-hex social hover | `validate-social-hex.mjs` (skill 12 social-brand-hex.md) | every social-link icon `<a>` has hover/focus/active CSS using canonical platform hex | exit 1 |
| Outbound link HEAD-200 | `validate-outbound-links.mjs` — for every external `<a href>` in dist/ HTML (skip mailto:/tel:/javascript:/anchor #), HEAD request with realistic UA per fetch-defaults.md, retry once on transient 5xx; accept 200/206/301/302/303/307/308; FAIL on 404/410/451/5xx; cache results in `.link-cache.json` 24h TTL keyed by URL+ETag; surface failing URL + source page + anchor text in error report | exit 1 |
| Publication tile deeplinks | `validate-publication-deeplinks.mjs` — every item in `_research.json.publications[]` AND every rendered publication tile (`[data-card="publication"]`) MUST have `deeplink_url` pointing to canonical external academic source (DOI > PubMed > arXiv > journal article URL > publisher landing); NEVER an internal `/portfolio/<slug>` stub when `deeplink_url` is empty; visible action buttons (View, Read Full Paper, Download, Open) MUST point to the same `deeplink_url` (compare `<a href>` of inner button vs card-wrapper href, fail on mismatch) | exit 1 |
| Lightbox section grouping | `validate-lightbox-grouping.mjs` (skill 12 lightbox-classifier.md "Same-Section Grouping") — for every `<section>` / `[data-section]` containing ≥2 `[data-zoomable]` descendants, assert ALL share ONE `data-gallery` value AND every `[data-zoomable]` carries `data-caption-title` + `data-caption-description` AND captions round-trip identically across section figcaption/overlay UI + lightbox modal bottom strip (DOM text-content compare) | exit 1 |
| Anti-FOUC scroll-reveal | `validate-reveal-foud.mjs` (skill 11 "Universal In-Viewport Reveal") — assert `<html>` carries inline `<script>` adding `js-reveal-active` class BEFORE first paint; CSS rule `html.js-reveal-active .reveal:not(.is-visible){opacity:0}` exists; every section/article/major-block has `.reveal` class; Playwright run records first 500ms of paint and asserts NO `.reveal` element flashes visible-then-jumped (compute opacity at paint frames, fail if any goes 1→0→1) | exit 1 |
| 4-state interactive | `validate-4state.mjs` (skill 10 "4-state distinction") — Playwright cycles every `<a>`, `<button>`, `[role=button]`, `<input>` through `:default | :hover | :focus-visible | :active`, screenshots each, computes pixel-diff between adjacent states; FAIL if any two adjacent states differ <3px AND fail if any element lacks distinct `:focus-visible` styling vs `:hover` | exit 1 |
| Underline-hover canonical | `validate-underline-hover.mjs` (skill 10 "Underline-sweep canonical `::after` 51%→0 pattern") — grep dist/ CSS for `.underline-hover::after` blocks, assert pattern contains `left:51%` AND `right:51%` initial state, `left:0` AND `right:0` hover state, `transition:left .3s` AND `transition:right .3s` (or shorthand), color uses `var(--brand-accent)` or theme token (NEVER hard-coded #hex). Every body+heading `<a>` outside nav resolves to a `.underline-hover` ancestor or has `text-decoration:underline` permanent — fail on bare-hover `text-decoration:underline` | exit 1 |
| Click ripple only (no ring) | `validate-cursor.mjs` (always.md "Every desktop site CLICK RIPPLE ONLY" — Brian removed cursor-ring 2026-05-02 — felt clingy, hurt accessibility, fought OS cursor themes) — Playwright desktop run (1280×720, pointer:fine) asserts `getComputedStyle(document.body).cursor !== 'none'` (native cursor visible) AND `document.querySelector('.cursor-ring')` returns null (ring DOM forbidden) AND no CSS rule matches `body{cursor:none}` (grep dist/ CSS) AND mousedown spawns `.cursor-ripple` element that animates+removes within 700ms. Mobile run (375×667, pointer:coarse) asserts no `.cursor-ripple` ever spawns. Reduced-motion run asserts ripple system disabled entirely | exit 1 |
| Image hover no-layout | `validate-image-hover.mjs` (skill 10 "Image hover NEVER changes layout") — Playwright triggers `:hover` on every `<img>`, `<picture>`, `<svg class*="img"]>`; samples bounding-rect before+after; FAIL if any dimension (width/height/x/y) shifts by >0px. Also grep dist/ CSS for `img:hover` rules → reject any rule mutating `border`, `outline`, `padding`, `margin`, `width`, `height` (allowlist: `transform`, `filter`, `opacity`, `box-shadow`) | exit 1 |
| Image topic-relevance | `validate-image-relevance.mjs` (always.md "Every page-rendered image" — njsk-light 2026-05-02) — for every `<img>` rendered on every route, GPT-4o vision describes image subject+composition then scores relevance against per-page topic descriptor (route → topic map: /volunteer="people contributing time/labor", /women-and-children-services="women+children specifically NOT mixed-gender adults", /soup-kitchen="meal service to those in need", /donate="generosity+community impact", /about="org history+mission", per-page topic loaded from `_research.json.routes[].topic`); FAIL any image scoring <8/10. Also enforce hero preference order: original-source-hero IF quality≥7/10 wins over Pexels/DALL-E (NEVER lucky-stock when crawled-hero exists). Lightbulb on /volunteer=fail. Mixed-gender adults on women+children=fail. Generic stock corporate handshake on soup-kitchen=fail | exit 1 |
| Stat rollup section | `validate-stat-counter-section.mjs` (always.md "Every site IMPACT/STAT ROLLUP" — njsk-light 2026-05-02) — when `_research.json.stats[]` resolves ≥3 quantifiable items (donors|volunteers|meals|customers|years|lives|revenue|raised|publications|projects|members|clients|countries), assert dist/index.html contains `<section data-section="stats">` above-fold-or-second-screen with ≥3 `[data-stat-counter]` children, each with `data-stat-end` numeric attribute, IntersectionObserver-driven roll-in, `clamp(2.5rem,8vw,5rem)` font-size on counter, distinct bg from neighboring sections. NEVER ship non-profit/SaaS/service site without stat-rollup when stats exist | exit 1 |
| Mega-menu hover-bridge | `validate-mega-menu-hover.mjs` (always.md "Every mega-menu" + skill 10 mega-menu pattern — njsk-light 2026-05-02) — Playwright desktop run (1280×720, pointer:fine): hover trigger → wait 100ms (open-delay) → assert panel `[data-mega-menu]` visible → move cursor diagonally toward panel through gap → assert panel still visible after 250ms (hover-bridge active); second run: hover trigger → move cursor away (NOT toward panel) → assert close within 200ms (triangle-aim correctly identifies non-aimed). Touch run (375×667, pointer:coarse): tap-to-open + tap-outside-to-close, NO hover bridge. Keyboard: Enter/Space opens, Esc closes, Arrow keys navigate, Tab moves to next trigger | exit 1 |
| Cross-site redirects | `validate-cross-site-redirects.mjs` (always.md "Every site rebuild CROSS-SITE _REDIRECTS" — njsk-light 2026-05-02) — when env `OLD_SITE_URL` set OR `_research.json.source_url` resolves a different host than primary deploy host, fetch original sitemap.xml, intersect with new sitemap.xml, assert every original-URL path appears in `_redirects` as `<original-path> 301 https://<new-host><new-path>` line OR resolves identically via `<link rel="canonical">` chain on every new page. Per-URL mapping required when slug schemes differ (CMS migration /post-id → /slug); wildcards forbidden when 1:1 mapping exists. Pair with sitemap submission to GSC + IndexNow ping post-deploy | exit 1 |
| Interactive functionality | `validate-interactive-functionality.mjs` (always.md "Every interactive feature" — njsk-light 2026-05-02) — Playwright finds every `[data-filter], [role=tab], [aria-controls], [data-search], [data-sort], [data-load-more], [data-toggle]`, simulates click/input/keypress, snapshots DOM before+after via `document.body.outerHTML.length` + `[data-post-card]:not([hidden])` count + `location.hash` + `[aria-selected=true]` set; FAIL on any element where state-after === state-before (styled-but-stub UI). Filter chip "All|News|Events" MUST measurably filter post grid. Tab "Overview|Pricing|Reviews" MUST swap visible panel. Search MUST filter results. Sort MUST reorder children. Load-more MUST append items | exit 1 |
| Blog listing filters + search + URL-sync | `validate-blog-filters.mjs` (always.md "Every blog/news/portfolio listing" — nyfoldingbox 2026-05-02) — for every route matching `/blog|/news|/articles|/posts|/press|/portfolio|/projects|/case-studies|/insights|/stories`, Playwright: (1) count `[data-post-card]` before filter (=N), (2) iterate each `[data-category-chip]`, click, assert post-count `<N AND >0` AND URL contains `?category=<slug>` AND chip has `aria-pressed=true`, (3) click "All" chip, assert count returns to N, (4) iterate each `[data-tag-chip]`, same checks with `?tag=<slug>`, (5) type "test" in `[data-search]`, debounce 200ms, assert count drops, assert URL has `?q=test`, clear input, assert count returns to N, (6) change `[data-sort]` dropdown, assert post order changes (compare first 3 `[data-published-at]` before+after), (7) navigate fresh to `<route>?category=<slug>`, assert filter pre-applied (chip aria-pressed, post count filtered), (8) click last chip+search to filter to 0 results, assert empty-state visible AND "Clear filters" CTA present AND clicking CTA restores N posts. Categories+tags MUST be derived from corpus (`posts.flatMap(p=>p.categories)` deduped) — grep build artifacts for hand-authored chip arrays=fail. FAIL any step where DOM state doesn't change OR URL doesn't sync OR deep-link state ignored | exit 1 |
| Blog corpus completeness | `validate-blog-corpus-complete.mjs` (always.md "Every site rebuild COMPLETE BLOG/CONTENT CORPUS" + reinforces full-corpus mandate — njsk-light 2026-05-02) — when source detected as having a blog (URL paths matching `/blog|/news|/articles|/journal|/posts|/press|/updates|/insights|/stories` OR sitemap shows ≥10 such URLs), assert `_corpus.json.posts.length >= source_blog_post_count * 1.0` (NEVER subsample — import all 120+/500+/2000+); blog index renders ALL posts via numbered pagination (12-24/page) with prev/next/first/last + visible total count; ≥2 functional filter taxonomies (category + tag minimum) per "Every interactive feature" rule; every post is a real route with BlogPosting JSON-LD + author byline + publish date + tags + categories + reading time + ≥3 related-posts + share buttons | exit 1 |

## Lighthouse CI (***NON-NEGOTIABLE***)

`.lighthouserc.json` config:
```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:4173/", "http://localhost:4173/about", "http://localhost:4173/services", "http://localhost:4173/contact"],
      "numberOfRuns": 3,
      "settings": { "preset": "desktop", "throttling": { "cpuSlowdownMultiplier": 1 } }
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.75 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "interaction-to-next-paint": ["error", { "maxNumericValue": 200 }],
        "uses-text-compression": "error",
        "uses-responsive-images": "error",
        "modern-image-formats": "error",
        "uses-optimized-images": "error",
        "render-blocking-resources": ["warn", { "maxNumericValue": 200 }]
      }
    },
    "upload": { "target": "filesystem", "outputDir": "./.lighthouseci" }
  }
}
```

Mobile preset additionally enforced via second LHCI run with `"preset": "mobile"`. Both must pass.

For full-site coverage at scale, `unlighthouse` (single binary, parallel-crawls every route in sitemap, generates HTML report). Run on every PR via GitHub Action.

## Accessibility — axe-core via Playwright (***WCAG 2.2 AA, ZERO VIOLATIONS***)

`tests/accessibility.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = ['/', '/about', '/services', '/contact', '/blog', '/privacy', '/terms'];
const BREAKPOINTS = [375, 390, 768, 1024, 1280, 1920];

for (const route of ROUTES) {
  for (const width of BREAKPOINTS) {
    test(`a11y: ${route} @ ${width}px @gate`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .disableRules(['color-contrast-enhanced'])  // AAA, not required
        .analyze();
      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
}
```

Zero violations across all routes × all breakpoints = pass. WCAG 2.2 introduces 9 new criteria: focus appearance (2.4.11), focus not obscured min/enhanced (2.4.12/2.4.13), dragging movements (2.5.7), target size 24px (2.5.8), consistent help (3.2.6), redundant entry (3.3.7), accessible auth min/enhanced (3.3.8/3.3.9). axe-core v4.11+ checks all of these. ADA compliance deadline: 2027 state/local, 2028 federal.

## Source-Parity Diff (***FOR REBUILDS — `compare-source.ts`***)

When source URL provided, compare original vs new:

```typescript
const original = await crawl(sourceUrl, { maxPages: 1000 });
const newSite = await crawl(deployUrl, { maxPages: 1000 });

assert(newSite.wordCount >= original.wordCount * 1.0, `Word count regression: ${original.wordCount} → ${newSite.wordCount}`);
assert(newSite.imageCount >= original.imageCount * 1.4, `Image count below augmentation floor`);
assert(newSite.routes.length >= original.routes.length, `Route count dropped: ${original.routes.length} → ${newSite.routes.length}`);
for (const r of original.routes) {
  const res = await fetch(deployUrl + r);
  assert(res.status === 200 || (res.status === 301 && res.headers.get('location')), `Lost URL: ${r}`);
}
for (const doc of original.documents) {  // PDFs/DOCs/PPTs
  const res = await fetch(deployUrl + doc.path);
  assert(res.ok, `Missing preserved document: ${doc.path}`);
}
```

njsk-light.projectsites.dev failure mode (missing blog, missing media, single-page collapse) is exactly what this gate catches. Build fails before R2 upload.

## Visual Regression — 3-Tier Strategy

| Tier | Tool | When | Cost |
|------|------|------|------|
| Local dev | `pixelmatch` + golden screenshots | every save | free |
| PR | Chromatic via Storybook | per-PR per-component | free up to 5K snapshots/mo |
| Deploy | Percy AI Visual Review | per-deploy full-page 6 breakpoints | free up to 5K snapshots/mo |

Percy AI Visual Review (40% false-positive filtering, 3× faster than legacy Percy) handles the per-deploy gate. For component-level regression, Chromatic via Storybook. For local dev iteration, `pixelmatch` against golden PNGs in `tests/__golden__/`.

## Console-Error Gate (***POST-DEPLOY***)

After every deploy, Playwright loads each route and asserts zero console errors:

```typescript
test(`console clean: ${route} @gate`, async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto(route);
  await page.waitForLoadState('networkidle');
  expect(errors, errors.join('\n')).toEqual([]);
});
```

CSP violations, JS errors, missing resource 404s — all caught here. Fix before marking deploy complete.

## Recommendations Loop (***ZERO-RECOMMENDATIONS GATE***)

After all other gates pass, run `recommendations-checker` agent: GPT-4o detail:high inspects deployed homepage + 3 random sub-pages, returns markdown list of every "could be improved" observation. Loop: implement → redeploy → re-check. Done when checker returns empty list. Max 5 iterations.
