---
name: "build-prompts"
description: "Master prompt template for single Claude Code site build. Covers foundation, brand, content, SEO, animations, accessibility, responsive, self-check, and inspect/fix loop."
updated: "2026-04-24"
---

# Build Prompts

The container runs ONE comprehensive Claude Code prompt. This prompt encompasses all build phases. The prompt is dynamically assembled from form data + research results. Claude Code reads pre-written context files (`_research.json`, `_brand.json`, `_assets.json`, etc.) and customizes the pre-installed template.

## Master Prompt Template

```
# Build a Stunning Website for {{businessName}}

Read ALL _ prefixed files in this directory for context:
- _research.json — business profile, hours, phone, address, reviews, geo
- _brand.json — colors, fonts, personality, logo URL
- _scraped_content.json — content from existing website (if available)
- _assets.json — manifest of all images in assets/ folder
- _image_profiles.json — GPT-4o analysis of each image
- _videos.json — YouTube/video URLs and metadata
- _places.json — Google Places enrichment data
- _form_data.json — user-submitted form data
- _domain_features.json — category-specific requirements

Read ~/.agentskills/15-site-generation/ for full methodology.
Cross-reference skills: 09 (brand extraction, copy rules), 10 (design system, local business patterns), 11 (animation, prefers-reduced-motion), 12 (media orchestration, image generation), 07 (quality verification, accessibility), 13 (analytics auto-provision, local conversion tracking).

## Your Mission
Transform this Vite+React+Tailwind+shadcn/ui project into the most gorgeous website
this business has ever had. Start from the pre-installed template in ~/template.
Every image in assets/ MUST appear on the site. Every fact must come from research data.

## Phase 1: Foundation (generates 90% of the site)

### Brand Configuration (***PRIMARY COLOR RETRIEVAL — skill 09***)
- Read _brand.json — colors are pre-extracted from logo/website/assets by research pipeline
- Set CSS custom properties in globals.css: --color-primary, --color-secondary, --color-accent, --color-background, --color-foreground from _brand.json.colors
- Map to tailwind.config.ts: primary→_brand.json.colors.primary.value, secondary→colors.secondary.value, accent→colors.accent.value
- Background color: derived from primary (darkened 80-90% lightness in OKLCH), NOT hardcoded
- Use brand fonts from _brand.json.fonts (fallback: Inter body, system-ui heading)
- Logo from assets/logo.* in EVERY page header
- NEVER hardcode hex colors — always reference _brand.json or CSS custom properties
- NEVER guess colors from business category — the njsk.org burgundy incident

### Logo Extraction (***MANDATORY — NEVER SKIP***)
- Phase 0 research pipeline MUST extract the official logo from the existing website
- Extraction order: (1) <img> in <header>/<nav> with "logo" in src/alt/class (2) og:image meta tag (3) site banner/hero image with org name (4) favicon/apple-touch-icon (5) Squarespace/WordPress theme logo selectors
- Download logo image to assets/logo.{ext} — preserve original format (WebP/PNG/SVG preferred)
- Generate sized variants: logo-header.png (max 200px height for nav), logo.png (full size for OG/hero), logo-favicon.ico (32x32+16x16)
- If original is WebP: convert to PNG via sips/sharp/imagemagick for broad compatibility
- Logo MUST appear in: header nav (every page), footer, OG image, JSON-LD logo field, favicon
- NEVER substitute SVG placeholder icons for the real logo — the njsk.org soup-bowl-SVG incident
- If no logo found on website: check Google Places photos, social media profile images, Brandfetch API, logo.dev API — exhaust ALL sources before generating one
- Logo colors inform brand palette extraction: dominant color→primary, secondary accent→secondary

### Pages (***match original site structure — NEVER reduce page count***)
- Homepage: hero with brand image + gradient overlay, selling points grid, about preview, testimonials, FAQ, CTA
- About: 2000+ words, verifiable facts from research, team section if data exists. Include sub-pages: mission, vision, how-we-do-it, founder history
- Services/Menu/Features: detailed grid with images, pricing if available. Each service gets full description — not a 2-sentence summary
- Contact: form (if email found), Google Maps embed (if geo), social links (verified only), full NAP, mailing address
- Blog (***MANDATORY if original site has one***): migrate ALL blog/news/updates from _scraped_content.json — individual route per post with full content, listing page with date+author+excerpt, pagination if 10+ posts. Blog content is SEO equity and community engagement proof — never discard it. Each post gets its own route, not just a listing card
- FAQ: if original site has FAQ, create dedicated FAQ page with accordion UI and FAQPage schema
- Team/Staff: if original site lists team members, create team page with names, roles, department groupings
- Donation page (non-profit/church): one-time + monthly toggle, default to MONTHLY. Suggested amounts from category. Stripe integration or link to existing platform
- Category-specific pages: mass schedule (church), menu (restaurant), pricing (salon), specialties (medical), practice areas (legal) — scrape and recreate ALL of these
- "We Need" / wishlist pages (non-profit): donation item lists, drop-off info, seasonal needs
- Additional pages: create a page for EVERY distinct page in _scraped_content.json. Content-rich originals get rebuilt as full pages. Thin pages may be merged but MUST get 301 redirects
- Nav must include ALL pages — never hide pages that exist on the original site. If nav gets crowded, use dropdown menus

### Page Enrichment Patterns (***AUTO-APPLY ON FIRST BUILD***)
These patterns must be applied automatically — not as a follow-up. Every page should ship with these features on the first prompt.

**Video Heroes:** Every major page gets a `<video autoPlay muted loop playsInline>` background behind the hero section at 20% opacity with a gradient overlay. Source: download 2-3 Pexels videos (SD 640x360, ~600KB each) matching the business type. Search Pexels for "{business_type}" + "volunteer" + "community meal" etc. Store in `public/videos/`. Fallback: photo hero with gradient if no video available. Use `aria-hidden="true"` on video elements.

**Contact Forms (***WHEREVER EMAIL IS MENTIONED***):** Any page that tells users to "email X" or "call to get started" MUST include an inline contact form pointing to that email via the projectsites.dev contact API or Resend. The form replaces the friction of copy-pasting an email. Fields: name, email, message (minimum). For volunteer pages: add organization and group size fields. For donation inquiries: add amount range. Always include Turnstile invisible widget. Show fallback email/phone below the form.

**Partner/Client Logo Strips:** When the site mentions corporate partners, sponsors, or collaborators by name, download their logos and display a grayscale logo strip with hover-to-color effect (`grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all`). Major corporations (Fortune 500) have logos on logo.wine, Wikimedia Commons, or companieslogo.com. Smaller orgs: extract from their website headers. Store in `public/images/partners/`. Consistent height (h-12 sm:h-16), object-contain, max-w-[160px].

**Full-Width Maps:** Any page showing a physical address (especially church/schedule pages, contact pages) should include a full-width Google Maps embed — not just a sidebar map. Use `width="100%" height="450"` with no border, outside any max-width container. The map IS the visual for location pages.

**Photo Galleries:** Pages with 4+ related images should include a grid gallery section. Use `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` with `aspect-square object-cover rounded-lg`. Volunteer pages should show a "Volunteers in Action" gallery reusing blog post images. Services pages should show partner photos in a grid under Community Partnerships.

**Contextual CTAs:** Every page ends with a relevant CTA section. Services→"Need a Meal?" + directions. About→"Join Our Mission" + donate/volunteer. Blog→"Support Our Mission" + donate/volunteer. Volunteer→"Can't Volunteer?" + donate. Match the CTA to what makes sense for the page topic.

**Donation Forms (***MONTHLY-FIRST, LIVE VALIDATION***):** Donation pages default to monthly recurring at $100/mo. Monthly/one-time toggle at top (monthly pre-selected). Presets: $50, $100, $250, $500. $100 selected by default. Monthly preset amounts→Stripe Payment Links (redirect with `prefilled_email`). One-time/custom→PaymentIntent flow via API. Live validation: validate on blur, re-validate on change after first blur. Green checkmark icons for valid fields, red borders+messages for invalid. Summary bar shows amount+frequency before submit. "Secured by Stripe" trust badge below button. Partner logo strips use `flex flex-wrap justify-center` (NOT grid) to ensure horizontal centering regardless of item count.

**Donation Page Structure (***TWO-PANE + RICH SALES APPEAL***):** Donate pages are NEVER just a form. Layout: `grid lg:grid-cols-2 gap-12` — left pane: form (sticky on scroll); right pane: sales appeal stack. Right pane required sections (in order): (1) hero appeal photo + bold headline (e.g. "500 hungry neighbors walk through our doors every day") + emotional paragraph with one bolded clincher; (2) **Goal Progress Bar** — `$X of $Y/month` with animated fill bar, supporter count, dollars-to-go, and one italic line explaining what hitting the goal unlocks. Pick a realistic monthly goal ($10K is good default for small non-profits); (3) **Where Your Money Goes** — 4 horizontal bars showing program % allocation with one-line note each (food/supplies/clinic/operations); (4) **Impact Tiers** — table of dollar amounts → outcomes ("$100 = one week of breakfasts for 70 neighbors"). Below the two-pane: testimonials (3 cards with quote/author/role — donor + corporate volunteer + former guest), FAQ (`<details>` accordions, 6-8 questions covering tax-deductibility, cancel-anytime, % to programs, payment security, alt giving methods, employer matching, tribute gifts), trust badges grid (501c3 verified+EIN, Stripe secured, % to programs, years operating), final urgency CTA section ("Tomorrow morning, 500 people will show up hungry") that scrolls back to form. Hero h1 must include EIN/501(c)(3) tagline. Reference benchmark: donate.megabyte.space.

**Homepage Interlinking (***LINK EVERY MAIN PAGE WITH PREVIEW CONTENT***):** Homepage cannot just dump hero+CTA. Required sections in order: (1) hero with photo/video; (2) **Impact Stats Bar** — 4 hero numbers on dark background (meals/years/days/zero-questions); (3) Mission preview → links to /about + /team; (4) Services preview — 3 cards with photos + descriptions linking to /services and sub-anchors; (5) **"Three Ways to Help"** card grid with icons → /donate, /volunteer, /we-need; (6) Blog preview — 3 latest posts with photos linking to /blog and individual posts; (7) Partner logos strip; (8) **Faith/Mass Schedule + Visit Us** two-column section linking to /mass-schedule and /contact; (9) Final donate CTA. Every main nav route must be reachable via at least one homepage preview card with image + descriptive copy. The homepage is a hub, not a brochure.

**Footer Logos on Dark Backgrounds:** Header logos render naturally on white. Footer logos on maroon/dark backgrounds need `opacity-80 mix-blend-screen` (translucent, lets red bleed through warmly) — NOT `brightness-0 invert` (harsh stark white). Test against actual background color before declaring done.

**Site-Wide Image Lightbox (***EVERY PHOTO ZOOMABLE***):** Every site ships a global click-to-zoom lightbox modal mounted once in `Layout` (after `<Footer />`). Single `src/components/lightbox.tsx` listens for `<img>` clicks via document-level handler, opens portal-style modal: `bg-black/90 backdrop-blur-md`, centered `max-h-[85vh]` image with `object-contain`, top-right close button (`bg-white/10 hover:bg-white/20`, 44×44 minimum target size for WCAG 2.2 2.5.8), figcaption from alt text, body scroll locked, `Escape`+backdrop-click+X-button all close. Auto-mark zoomable: on mount + every 1500ms, walk `main img`, set `cursor: zoom-in` + `data-zoomable="true"` on each. Exclusions (NEVER zoom): `header`, `footer`, inside `<a>`, inside `<button>`, ancestor with `[data-no-zoom]`, naturalWidth/Height < 200px (icons, avatars, tiny logos). Add `data-no-zoom` wrapper to: partner logo strips on home/services/volunteer pages, initials avatar fallbacks on team page. Modal must include `role="dialog"`, `aria-modal="true"`, `aria-label`. Animation: `animate-fade-in 0.18s ease-out` defined in `@layer utilities`.

**Team Page Photos (***DOWNLOAD HEADSHOTS, FALLBACK TO INITIALS***):** Team pages render real photos, not initials-only avatars. Phase 0 research must scrape `<our-team|/team|/staff|/about>` page and capture every headshot URL. Download to `public/images/team/{first-name}.{ext}` (preserve original format — JPG/PNG/WebP). Team data model: `{ name, role, photo?: string }` — `photo` optional so missing-source members render initials fallback. Photo avatar: `w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-md` with `<img object-cover>` and `group-hover:scale-105` zoom hint. Initials fallback: same dimensions, `bg-maroon-200`, two-letter initials skipping `Rev.`/`Sr.`/etc prefixes. Hero subhead nudges interaction: "Click any photo to zoom in." Photos auto-pick up site-wide Lightbox.

**The njsk.org enrichment incident:** The first build shipped pages with plain text heroes, no contact forms (just "email us" text), no partner logos (just name-drops), and sidebar-only maps. All of these should have been first-build features, not follow-up additions.

### Content Migration (***NEVER DISCARD CONTENT***)
The original site's content is the business's accumulated SEO equity and institutional knowledge. Treat it as sacred.
- Migrate ALL text content from _scraped_content.json — rewrite for quality but preserve substance
- Every blog post, news article, update → individual page at matching URL path
- Team bios, service descriptions, FAQ answers, event archives → all migrated
- Only discard: broken markup, "test" pages, truly empty pages, exact duplicates
- When combining thin pages: content merges into a richer page, old URLs get 301s
- Word count of new site should MATCH OR EXCEED original (not 50% — 100%+)

### URL Slug Hygiene (***ALWAYS CLEAN — NEVER COPY CMS GARBAGE***)
Original CMS paths often contain garbage suffixes, numeric IDs, or folder artifacts (e.g. `/the-mens-dining-hall-1`, `/volunteer-1`, `/new-folder-1`). NEVER use these as primary routes.
- Clean the slug: strip trailing numbers added by CMS (`-1`, `-2`), remove articles (`the-`), remove `new-folder-*` artifacts
- `/the-mens-dining-hall-1` → primary route: `/services/mens-dining-hall`, redirect from original path
- `/volunteer-1` → primary route: `/volunteer`, redirect from original path
- `/new-folder-1` → primary route: `/services`, redirect from original path
- Sub-services get nested routes: `/services/health-clinic`, `/services/womens-center`
- Use a Redirect component (navigate with replace:true) for SPA client-side 301 equivalents
- Original ugly paths MUST still resolve via redirect — never 404 on a previously-indexed URL

### URL Preservation (***NON-NEGOTIABLE***)
Parse _scraped_content.json for all original URL paths. Every original URL must resolve:
- Same path → actual page (preferred): `/about-us` → About page at `/about-us`
- Different path → 301 redirect: if original `/our-team` merges into `/about`, add redirect
- Blog posts: preserve exact slug `/blog/2024/summer-event` → same route
- Generate `public/_redirects` file in Cloudflare Pages format:
  ```
  # Cloudflare Pages _redirects format: FROM TO STATUS
  /old-about-us /about 301
  /our-team /about#team 301
  /news/2023/post-title /blog/post-title 301
  /services/old-service /services#old-service 301
  ```
  One redirect per line. `FROM` is the original path, `TO` is the new path, `STATUS` is 301 (permanent). For SPAs with client-side routing, also add a catch-all `/* /index.html 200` as the LAST line (Cloudflare Pages SPA fallback). Redirects are evaluated top-to-bottom, first match wins.
- Validate: every URL from original sitemap.xml returns 200 or 301 — never 404
- Build gate: compare original sitemap URLs vs new sitemap + redirects, fail if any URL unaccounted

### Media Acquisition (***MANDATORY — RUNS IN ALL BUILD MODES***)
Media enrichment is NOT optional. Whether running in container, via prompt, or in manual Claude Code session — media acquisition MUST happen. A site with no images is not a site. Read ~/.agentskills/15-site-generation/media-acquisition.md for full strategy.

**The njsk.org text-only-site incident:** The first build shipped a site with ZERO images because media acquisition was treated as a Phase 0 container-only step. It is a HARD GATE for ALL builds.

**Manual/prompt build media steps (***FIRST PROMPT — BEFORE ANY CODE***):**
1. **Extract images from original site:** WebFetch every page, extract ALL img src URLs. Download each to public/images/. njsk.org had at least: banner logo, food service photos (IMG_3035.jpg), kitchen photos (Resized-20180809-114452.jpeg), plus Squarespace gallery images. EVERY image on the original site MUST be downloaded and used.
2. **Google image search:** Search "{business_name} {city}" for 10-15 relevant photos. Use WebFetch to find image URLs from Google CSE or direct search.
3. **Stock photo APIs:** If API keys available (UNSPLASH_ACCESS_KEY, PEXELS_API_KEY), query for business-type-specific photos. Download 5-10 to public/images/.
4. **AI image generation:** If OPENAI_API_KEY available, generate 3-5 originals via GPT Image 1.5 (hero background, service illustrations, atmospheric textures). If not available, use CSS gradients with brand colors as hero backgrounds — but NEVER ship pages with no visual content at all.
5. **Video embeds:** Search YouTube for "{business_name}" — embed any official videos. Search Pexels for business-type B-roll.
6. **Image placement:** Hero section MUST have a background image or photo. Every service card needs an image. About page needs at least 2 photos. Blog posts with photos on original site must have those photos. Gallery/photo section if 5+ images available.
7. **Hard gate:** Count images in public/images/ or equivalent. If <10 unique images → build is NOT complete. If <5 → build has NOT started media acquisition.

**For non-profit/church sites specifically:** Extract volunteer group photos from blog posts (these are often the most emotionally compelling images), download event photos, kitchen/dining hall interior shots. These organizations rely on emotional connection — text-only sites kill donations.

### Per-Page Image Extraction (***MANDATORY — EVERY PAGE GETS ITS IMAGES***)
Images are not a site-wide pool — they belong to specific pages. When scraping the original site, associate EVERY image with the page it appeared on. This is critical for blog posts, service pages, and event recaps where photos are the primary content.

**Process:**
1. **Scrape every page individually:** For each page in _scraped_content.json or original sitemap, WebFetch the page and extract ALL `<img>` src URLs from the page body (not nav/footer chrome)
2. **Download with page association:** Save images to `public/images/{section}/{slug}-{index}.jpg` (e.g., `public/images/blog/federal-reserve-bank-1.jpg`, `public/images/services/dining-hall-1.jpg`). Maintain a mapping of page→image paths
3. **Data model integration:** Every page's data structure MUST include an `images: string[]` field with local paths. Blog posts: `blogPosts[].images`. Services: `services[].images`. Team members: `team[].photo`. This is NOT optional metadata — it's a required field
4. **Featured image:** First image in the array (`images[0]`) is the featured/hero image — displayed in listing cards, OG tags, and page hero sections
5. **Gallery rendering:** Pages with 2+ images render a photo grid/gallery below the primary content. Use `grid-cols-1 sm:grid-cols-2` with `object-cover aspect-[4/3]` for consistent presentation
6. **CMS URL patterns:** Squarespace uses `images.squarespace-cdn.com/content/v1/{site-id}/{hash}/{filename}`. WordPress uses `wp-content/uploads/{year}/{month}/{filename}`. Wix uses `static.wixstatic.com/media/{hash}`. Always download and host locally — never hotlink to CMS CDN (the original site may go offline)
7. **Hard gate:** Every blog post that had images on the original site MUST have images on the new site. Every service page that had photos MUST have photos. Zero-image blog posts on a site where other posts have images = build incomplete

**The njsk.org blog image incident:** Blog posts were migrated as text-only even though every post on njsk.org had 1-19 associated photos (volunteer group photos, event shots, donation images). These photos ARE the content for a non-profit blog — without them, posts are meaningless stubs.

### Design System (***skill 10 — MANDATORY***)
Read ~/.agentskills/10-experience-and-design-system/SKILL.md for full design system.
Apply ALL patterns from "Local Business Design Patterns (SITE GENERATION)" section.

- Dark-first: dark base color from _brand.json (fallback: extracted from logo/site), brand-appropriate overrides via OKLCH
- Typography: clamp() fluid scale (1rem→1.125rem body, 2.5rem→4rem hero), brand heading font or fallback
- Cascade layers: @layer reset, base, components, utilities — native CSS nesting, no preprocessor
- Container queries for component-responsive cards (not just viewport breakpoints)
- 10+ @keyframes: fadeInUp, slideIn, scaleIn, shimmer, float, pulse, gradientShift, borderGlow, parallax, typewriter
- Glassmorphism cards: bg-white/5 backdrop-blur-md border border-white/10
- Gradient text on key headings: bg-clip-text text-transparent bg-gradient-to-r
- 25+ inline SVG decorative elements (geometric shapes, section dividers)
- IntersectionObserver on every section for scroll-triggered animations
- Staggered animation delays on card grids (0.1s between each)
- Anti-slop check: grep for banned words before build (see skill 09 copy-rules)
- Apple Test: "Would Apple ship this?" If no → redesign before deploy

### Content Rules (***PRESERVE EVERYTHING***)
- Word count must MATCH OR EXCEED original site (never less content than before)
- 5000+ words minimum real content (from research + scraped content) — most rebuilds will far exceed this
- Migrate ALL substantive text from _scraped_content.json — rewrite for quality, preserve substance
- Blog posts, news articles, event recaps → individual pages with original publish dates
- Every claim factually accurate from _research.json
- Address links → Google Maps: https://www.google.com/maps/dir/?api=1&destination={{encoded_address}}
- Phone → tel: links | Email → mailto: links
- NO lorem ipsum | NO placeholder text | NO TODO stubs
- Primary keyword "{{businessType}} in {{city}}" in H1, title, meta, first paragraph

### Images (***CRITICAL***)
- USE EVERY IMAGE in assets/ — check _image_profiles.json for placement suggestions
- Hero: assets/hero-* or highest quality_score image as background with gradient overlay
- Gallery: full-width slider/carousel with ALL images
- Service cards: relevant images matched by suggested_placement
- No external image URLs (hotlinking blocked)
- All images: lazy loading (except hero), width/height attributes, descriptive alt text

### Image Optimization Pipeline (***NON-NEGOTIABLE — skill 12***)
Every image in assets/ MUST be processed before build:
1. Generate responsive variants: 320w, 640w, 1280w, 1920w (skip if source narrower)
2. Convert to WebP (quality 80) + AVIF (quality 70) for each variant
3. Generate PNG fallback at 1280w for legacy browsers
4. Generate 20px blur placeholder (base64 WebP) per image
5. Extract dominant color per image for CSS placeholder
6. Store all variants alongside originals in assets/

Use `<ResponsiveImage>` component from `src/components/local/ResponsiveImage`:
```html
<ResponsiveImage src="assets/hero.jpg" alt="Business exterior" eager />
```
Renders `<picture>` with AVIF→WebP→fallback, srcset 320-1920w, blur placeholder.

Hero image: `eager` + `fetchpriority="high"` + preload link in `<head>`.
All other images: `loading="lazy"` + `decoding="async"`.
Max single optimized image: 200KB. Total page images: <500KB.
Original PNG/JPG kept as source, never served to browser.

### Interactions
- Every button: hover (scale + glow), active (press), focus (ring)
- Every link: hover (color change + underline animation)
- Every card: hover (lift + shadow + border glow)
- Smooth scroll on ALL anchor links (scrollIntoView({ behavior: 'smooth' }), never #href)
- Mobile hamburger menu with slide-in animation
- Back-to-top button with fade-in on scroll

### SEO (complete implementation)
- <title> under 60 chars: "{{primaryKeyword}} | {{businessName}}"
- <meta description> under 160 chars with keyword + CTA
- <link rel="canonical" href="https://{{slug}}.projectsites.dev{{path}}">
- JSON-LD LocalBusiness with ALL available structured data
- FAQPage schema on FAQ section
- BreadcrumbList schema on sub-pages
- Open Graph + Twitter Card meta tags
- robots.txt + sitemap.xml with all pages
- Internal linking: every page links to 2+ other pages
- Image alt text contains relevant keywords

### Conditional Features
{{#if business_email}}
- Contact form POSTing to https://projectsites.dev/api/contact-form/{{slug}}
- Fields: name (required), email (required, validated), phone (optional), service dropdown (from _domain_features.json services), message (required, 500 char max)
- Turnstile invisible widget (data-appearance="interaction-only") on submit
- Success: green checkmark animation + "We'll respond within 24 hours" + fade to thank-you state
- Error: inline field validation (red border + helper text), network error toast with retry
- Zod schema validation client-side before submit
- Accessible: aria-describedby on all fields, focus ring, label association, error announcements via aria-live
{{else}}
- "Get in Touch" section with phone (tel: link), address (Maps link), social links (verified only), full NAP
- Click-to-call button styled as primary CTA on mobile
{{/if}}

{{#if lat_lng}}
- Google Maps embed: <iframe src="https://www.google.com/maps/embed/v1/place?key={{GOOGLE_MAPS_KEY}}&q={{lat}},{{lng}}&maptype=roadmap" width="100%" height="400" style="border:0;border-radius:12px" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade">
- "Get Directions" button → https://www.google.com/maps/dir/?api=1&destination={{encoded_address}}
- Address card with opening hours (from _places.json) beside map
- Dark map style via &style=feature:all|element:geometry|color:0x1a1a2e (brand-matched)
- Mobile: map collapses to 250px with "Expand Map" tap target
{{/if}}

{{#if google_rating}}
- Hero trust badge: "{{rating}}/5 stars from {{review_count}} reviews" with animated star SVGs (fill animation on scroll)
- Dedicated testimonials section: 3 real review quotes in glassmorphism cards with reviewer initial avatar, star rating, relative date
- JSON-LD aggregateRating on LocalBusiness schema
- Review carousel on mobile (swipe gesture), grid on desktop
{{/if}}

{{#if videos}}
- Video hero section: YouTube embed with custom play button overlay (brand-colored), lazy iframe load on click (performance)
- Video gallery: thumbnail grid, lightbox playback, category tabs if >3 videos
- Pexels B-roll: muted autoplay background loops (max 2MB each, poster frame)
{{/if}}

### Multimedia Enhancement (***ALWAYS***)
- Hero: parallax background with gradient overlay (brand primary → transparent), floating geometric SVG accents
- Gallery: masonry grid with lightbox (Dialog component), image count badge, swipe on mobile
- Before/after slider (if applicable): CSS clip-path with drag handle for service showcases
- Testimonial cards: quote marks SVG, reviewer photo/initial, animated border glow on hover
- Stats counter: animated number counting (IntersectionObserver triggered), with unit labels
- Trust badges section: payment icons, certifications, "Serving {{city}} since {{year}}" with verified year

### Offline Mode (***EVERY SITE — service worker***)
Service worker (`public/sw.js`) pre-installed in template. Caches:
- App shell: index.html, CSS, JS bundles, manifest, fonts
- Images: cache-first, max 200 items (all gallery/hero/service images)
- HTML pages: network-first with cache fallback
- EXCLUDES: analytics scripts (posthog, gtag, gtm)

Registration in main.tsx (production only, skips dev).
Critical for: rural businesses with poor connectivity, in-store kiosk displays, repeat visitors.
After site build, verify: disconnect network → refresh → site loads from cache.

### Local Conversion Components (***ALWAYS FOR LOCAL BUSINESS***)
- NAPFooter: schema.org microdata, tel:/mailto:/Maps links, hours with today highlighted, social icons
- ReviewCTA: star-gate (>=4→Google review link, <3→private feedback), QR code
- QuickActions: mobile-only 2x2 grid (Call, Directions, Book, Menu), 48px touch targets
- StickyPhoneCTA: mobile fixed bottom bar, hides when footer visible
- SpeedDial: floating action button, expands to show phone/email/directions/booking
- EmergencyBanner: auto-shows after business hours with emergency phone number
- BookingEmbed: Calendly/Acuity/Square iframe OR custom booking form
- BeforeAfterSlider: CSS clip-path drag comparison (contractors, salons, dental)

### Schema Generation (***NON-NEGOTIABLE***)
Import `generateLocalBusinessSchema` from `src/components/local/LocalSchemaGenerator`.
Pass `_research.json` data → outputs complete JSON-LD with: @type, name, PostalAddress, telephone, geo, openingHoursSpecification, image, sameAs, aggregateRating, priceRange, areaServed, hasMenu (restaurant), paymentAccepted, knowsAbout.
Also generate: FAQPage schema on FAQ sections, BreadcrumbList on sub-pages.
Validate: Google Rich Results Test before deploy.

### Service Area Pages (pSEO — IF service-area business)
{{#if area_served}}
- Generate `/service-area/{city}` for each city in _research.json.operations.areaServed
- Each page: unique H1 "{service} in {city}", localized intro paragraph, embedded map centered on city
- Link all service area pages from footer and sitemap.xml
- JSON-LD areaServed array matches generated pages
{{/if}}

### GBP Review Deep Link
- "Leave a Review" button: `https://search.google.com/local/writereview?placeid={{place_id}}`
- Place in: thank-you state after form submit, contact page, ReviewCTA component
- QR code SVG in assets/review-qr.svg for print materials

### Print Stylesheet
Add to index.css:
```css
@media print {
  header, footer, .sticky-cta, .speed-dial, nav, .back-to-top { display: none; }
  body { background: white; color: black; font-size: 12pt; }
  a[href]::after { content: " (" attr(href) ")"; font-size: 0.8em; }
  img { max-width: 100%; }
}
```

### PWA Manifest
Generate `public/site.webmanifest`:
```json
{
  "name": "{{businessName}}",
  "short_name": "{{shortName}}",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "{{brand_primary}}",
  "background_color": "{{brand_background}}",
  "icons": [
    {"src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```
Add `<link rel="manifest" href="/site.webmanifest">` to index.html.

### SMS Deep Links
Alongside every `tel:` link, add `sms:` link option. Track as `sms_click` event.
Mobile: show both "Call" and "Text" buttons side by side.

### Competitor Comparison Page (IF competitor data exists)
{{#if competitors}}
- Generate `/why-choose-us` page from _research.json.competitors[]
- H1: "Why Choose {{businessName}} Over the Competition"
- Comparison table: features, rating, reviews, years in business
- Every comparison factual from research data
- JSON-LD: no schema needed, pure content play
{{/if}}

### FAQ Auto-Generation from Reviews
Mine _research.json.trust.reviews[] for recurring themes/questions.
Generate 8-12 FAQ items with FAQPage schema. Real customer language = better AI citation.
Place on dedicated /faq page AND inline on relevant service pages.

### Weather-Aware Hero (outdoor businesses only)
{{#if outdoor_business}}
- Fetch weather from _research.json.operations.geo via free weather API
- Swap hero messaging based on conditions: rain→"Rainy season? Book your {service}" | snow→"Snow removal available" | heat→"Beat the heat with {service}"
- Fallback: standard hero if API unavailable
{{/if}}

### Domain-Specific Features
Read _domain_features.json and implement ALL listed features for this business category.

## Phase 2: Build + Inspect + Fix

After customizing all files:
1. Run `npm run build` — fix ANY errors
2. Run `node /home/cuser/validate-urls.js` — compare _scraped_content.json.original_urls against new sitemap + _redirects. Fail if any URL unaccounted.
3. Run `node /home/cuser/inspect.js dist/index.html` — read the GPT-4o critique
4. Fix ALL issues scoring below 8/10 in the critique
5. Run `npm run build` again — verify zero errors
6. If inspect score < 8: repeat fix+build (max 3 iterations)

## Phase 3: Polish Pass

Review the entire site one more time:
1. Every section has a dark or brand-colored background? No plain white sections.
2. Every button/link has hover + active + focus styles?
3. Smooth scroll on all same-page links?
4. All Lucide icon imports are valid names?
5. Mobile responsive at 375px? No horizontal overflow?
6. Copyright year is current?
7. Logo in every page header?
8. Footer has Privacy Policy + Terms links?
9. No console.log statements?
10. All URLs use HTTPS?
11. Fonts have preconnect hints?
12. Contact form only if business email exists?
13. Social links only to verified URLs?

## Phase 4: Upload to R2

After successful build, run: `node /home/cuser/upload-to-r2.mjs`
This uploads all dist/ files to R2 at sites/{{slug}}/{{version}}/.
```

## Prompt Assembly Logic

The Worker builds this prompt dynamically:
1. Read form data (business name, address, category, notes, uploaded files)
2. Inject research results into template variables
3. Select domain features from _domain_features.json
4. Conditional blocks expand based on available data (email, geo, rating, videos)
5. Write assembled prompt to `_prompt.txt` in build directory

## Inspect Script Integration

`/home/cuser/inspect.js` — pre-baked in Docker image. Takes HTML file path, sends first 14KB to GPT-4o with "senior Stripe web designer" persona. Scores 1-10 across: color contrast, typography, layout/spacing, animations, images, mobile, brand consistency, visual polish. Returns `{ score, issues[], recommendations[] }` as JSON to stdout. 25s timeout. Requires `OPENAI_API_KEY`.

## Prompt Evolution

Every successful build → analyze output quality. Patterns that improve quality get folded into this prompt template. Criticism from users → generalized into rules added to quality-gates.md. The prompt chain gets better with every iteration.
