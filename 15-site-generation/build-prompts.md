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

### Brand Configuration
- Extract exact colors from _brand.json (NEVER guess from category)
- Set colors in tailwind.config.ts: primary, secondary, accent from brand
- Use brand fonts (or Inter/Satoshi fallback) in tailwind.config.ts
- Logo from assets/logo.* in EVERY page header

### Pages (4-8 depending on content volume)
- Homepage: hero with brand image + gradient overlay, selling points grid, about preview, testimonials, FAQ, CTA
- About: 2000+ words, verifiable facts from research, team section if data exists
- Services/Menu/Features: detailed grid with images, pricing if available
- Contact: form (if email found), Google Maps embed (if geo), social links (verified only), full NAP
- Additional pages based on content volume from _scraped_content.json
- Blog listing (if scraped content includes news/updates/blog posts)

### Design System
- Dark theme: bg-[#0a0a1a] or brand-appropriate dark
- 10+ @keyframes: fadeInUp, slideIn, scaleIn, shimmer, float, pulse, gradientShift, borderGlow, parallax, typewriter
- Glassmorphism cards: bg-white/5 backdrop-blur-md border border-white/10
- Gradient text on key headings: bg-clip-text text-transparent bg-gradient-to-r
- 25+ inline SVG decorative elements (geometric shapes, section dividers)
- IntersectionObserver on every section for scroll-triggered animations
- Staggered animation delays on card grids (0.1s between each)

### Content Rules
- 5000+ words total real content (from research + scraped content)
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
  "background_color": "#0a0a1a",
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
2. Run `node /home/cuser/inspect.js dist/index.html` — read the GPT-4o critique
3. Fix ALL issues scoring below 8/10 in the critique
4. Run `npm run build` again — verify zero errors
5. If inspect score < 8: repeat fix+build (max 3 iterations)

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
