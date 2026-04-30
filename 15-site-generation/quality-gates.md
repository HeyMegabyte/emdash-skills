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
