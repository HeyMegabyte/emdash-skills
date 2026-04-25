---
name: "template-system"
description: "Vite+React+Tailwind+shadcn/ui starter template architecture. Pre-installed in container, customized per build. Component library, routing, animation presets."
updated: "2026-04-24"
---

# Template System

Container pre-bakes `~/template/` — a production-ready Vite+React+Tailwind+shadcn/ui starter. Claude Code copies it to `~/build/`, writes context files, then customizes. Never generates from scratch.

## Template Structure
```
template/
├── index.html          — entry point, meta tags, GTM snippet placeholder
├── package.json        — deps pre-installed (react, react-router, tailwind, shadcn, lucide)
├── vite.config.ts      — build config, path aliases (@/ → src/)
├── tailwind.config.ts  — brand color slots (primary/secondary/accent), font slots, dark mode
├── tsconfig.json       — strict mode, path aliases
├── postcss.config.js   — tailwind + autoprefixer
├── src/
│   ├── main.tsx        — router setup, scroll restoration
│   ├── App.tsx         — layout shell (header+outlet+footer), route definitions
│   ├── components/
│   │   ├── ui/         — shadcn components (button, card, badge, dialog, sheet, carousel)
│   │   ├── Header.tsx  — responsive nav, mobile sheet menu, logo slot
│   │   ├── Footer.tsx  — columns layout, social links, copyright, legal links
│   │   ├── Hero.tsx    — full-width, parallax-ready, gradient overlay, CTA slots
│   │   ├── Section.tsx — reusable section wrapper with IntersectionObserver animations
│   │   ├── ContactForm.tsx — Turnstile-ready, Zod validation, submission handler
│   │   ├── local/      — 16 local business components (see below)
│   │   ├── BlogList.tsx    — paginated blog listing with category filters
│   │   ├── BlogPost.tsx    — full post with TOC, sharing, related posts
│   │   └── DonationForm.tsx — one-time/monthly toggle, Stripe integration
│   ├── hooks/
│   │   ├── useInView.ts    — IntersectionObserver hook
│   │   ├── useSEO.ts       — meta tag management
│   │   └── useServiceWorker.ts — SW registration + offline detection
│   ├── pages/          — route pages (Home, About, Services, Gallery, Contact, FAQ, Blog)
│   ├── hooks/          — useScrollAnimation, useMediaQuery, useInView
│   ├── lib/            — utils.ts (cn helper), constants.ts (brand tokens)
│   └── styles/
│       └── globals.css — @layer reset/base/components/utilities, custom properties, animations
├── public/
│   ├── robots.txt      — template (SITE_URL placeholder)
│   ├── sitemap.xml     — template (SITE_URL placeholder)
│   ├── feed.xml        — Atom RSS feed (generated during build from blog posts)
│   ├── _redirects      — Cloudflare Pages redirect rules (301s for merged/renamed URLs)
├── inspect.js          — post-build checker (validates build output, checks for placeholders)
└── validate-urls.js    — compares original sitemap URLs against new routes + _redirects, exits 1 if any 404
```

## Customization Points

**Brand tokens** (tailwind.config.ts): `primary→_brand.json.colors.primary` | `secondary→colors.secondary` | `accent→colors.accent` | `background→colors.background` | `foreground→colors.foreground`. Font: `heading→_brand.json.fonts.heading` | `body→fonts.body`.

**Content slots**: SITE_NAME | HERO_HEADLINE | HERO_SUBTEXT | HERO_CTA | PHONE | EMAIL | ADDRESS | HOURS | All replaced with real data from `_research.json`.

**Page generation**: Claude Code reads `_scraped_content.json` to determine page count and structure. Minimum 4 pages (Home/About/Services/Contact). NEVER reduce page count vs original site — create pages for all substantial scraped content. Blog posts get individual dynamic routes (`/blog/:slug`). Merged thin pages get 301 redirects in `public/_redirects`. Each page gets its own route in App.tsx.

## Animation Presets (Pre-Built)

`fade-up` — translateY(20px)→0, opacity 0→1, 600ms ease-out, IntersectionObserver triggered. `fade-in` — opacity only, 400ms. `slide-left/slide-right` — translateX(±40px)→0, 800ms. `scale-in` — scale(0.95)→1, 500ms. `stagger-children` — each child delays 100ms. All presets respect `prefers-reduced-motion`. Scroll-driven hero parallax via `animation-timeline: scroll()` with `@supports` gate.

## inspect.js (Post-Build Validator)

Runs after `npm run build`. Checks: (1) dist/ exists with index.html (2) no SITE_NAME/HERO_HEADLINE/TODO/lorem placeholders remain (3) all images referenced exist in dist/assets/ (4) no console.error/console.warn in source (5) bundle size under 500KB gzip. Exit code 1 on any failure → Claude Code sees error → fixes → rebuilds.

## shadcn/ui Components Pre-Installed

Button (variants: default/outline/ghost/link) | Card (header/content/footer) | Badge | Dialog | Sheet (mobile nav) | Carousel (testimonials/gallery) | Accordion (FAQ) | Tabs (services) | Avatar (team) | Separator | ScrollArea. All styled via CSS variables matching brand tokens.

## Local Business Component Patterns (***CRITICAL***)

Local business sites need components SaaS templates don't have. These are pre-built in `template/src/components/local/`:

**HeroWithPhoto.tsx:** Full-viewport hero with actual business photo (not abstract gradient). `assets/hero-*` image fills background with `object-fit:cover`, dark overlay `rgba(0,0,0,0.55)`, business name in brand font, tagline from `_research.json.marketing.hero_slogans[0]`, twin CTAs: "Call Now" (`tel:` primary gradient) + "Get Directions" (Maps link secondary). Mobile: CTAs stack full-width, sticky bottom bar with phone icon persists on scroll.

**ServiceCards.tsx:** Grid of services from `_research.json.offerings.services[]`. Each card: relevant image from `_image_profiles.json` (matched by keyword), service name, 2-sentence description, price range (if available). Glassmorphism: `bg-white/5 backdrop-blur-md border-white/10`. Hover: border-brand-primary, shadow-glow. Mobile: horizontal scroll carousel.

**TestimonialCarousel.tsx:** Google Places reviews from `_research.json.trust.reviews[]`. Each: star rating (filled SVG stars), reviewer name, date, truncated text with "Read more on Google →" link. Auto-advances 5s, pause on hover. Min 3 reviews or fallback to CTA "Be the first to review us →" with Google review link.

**MapEmbed.tsx:** Google Maps iframe from `_research.json.operations.geo` (lat/lng). 100% width, 400px height, rounded corners, `loading="lazy"`. Below map: formatted address (clickable → directions), hours grid (today highlighted in brand-primary), parking/transit info if available. Dark mode map: `&style=feature:all|element:geometry|color:0x212121`.

**StickyPhoneCTA.tsx:** Mobile-only (`@media (max-width: 768px)`). Fixed bottom bar: brand-primary background, phone icon + "Call Now" centered, `tel:` link. `z-index:50`. Hides on scroll-down, shows on scroll-up (IntersectionObserver on footer hides it when footer visible). Min 44px touch target.

**NAPFooter.tsx:** Name, Address, Phone block matching JSON-LD exactly. Logo, business name, full address (Google Maps link), phone (`tel:`), email (`mailto:`), hours (collapsible on mobile), social icons row. Schema.org LocalBusiness microdata attributes on each element. This block is THE source of truth for NAP consistency.

**TrustBadges.tsx:** Horizontal row of verification badges from `_research.json.trust` + `_citations.json`. Google rating badge (star + number), BBB rating, industry certifications, "Licensed & Insured" if applicable. Lazy-loaded images from `assets/badges/`. Placed below hero and in footer.

**ReviewCTA.tsx:** "Love our service? Leave us a review!" card with Google review QR code (`assets/review-qr.svg`) and direct link button. Placed on thank-you page and contact page. Star-gate logic: 4+ stars → Google, <3 → private feedback form.

**GalleryGrid.tsx:** Masonry layout of ALL images in `assets/`. Full-width section. Lightbox on click (Dialog component). Lazy-loaded, srcset for responsive. Caption from `_image_profiles.json.description`. Min 12 images visible without scrolling on desktop.

**BeforeAfterSlider.tsx:** CSS clip-path drag comparison for contractors/salons/dental. Props: beforeSrc, afterSrc, labels. Touch-enabled handle. `prefers-reduced-motion` disables transition. No external deps.

**QuickActions.tsx:** Mobile-only 2x2 action grid (md:hidden). Icons: Phone, MapPin, Calendar, UtensilsCrossed. Min 48px touch targets. Each fires tracking event (phone_click, direction_click, booking_click). Replaces hamburger menu for local businesses.

**EmergencyBanner.tsx:** Auto-detects after-hours from `_research.json.operations.hours` vs client timezone. Shows urgent red banner: "After Hours? Call {emergencyPhone}". `tel:` with phone_click + `after_hours:true` property. Hidden during business hours.

**SpeedDial.tsx:** Floating action button (bottom-right, z-index:55, above StickyPhoneCTA). Expands on tap to radial/vertical layout of 2-4 actions (phone/email/directions/booking). Collapse on outside click. Mobile-only.

**LocalSchemaGenerator.tsx:** Utility module (not visual). Exports: `generateLocalBusinessSchema(research)` → complete JSON-LD with @type, name, PostalAddress, telephone, geo, openingHoursSpecification, image, sameAs, aggregateRating, priceRange, areaServed, hasMenu, paymentAccepted, knowsAbout. Also: `generateFAQSchema(faqs)`, `generateBreadcrumbSchema(items)`.

**BookingEmbed.tsx:** Wraps Calendly/Acuity/Square iframe OR custom booking form. Props: provider, embedUrl, phone. booking_click tracking on all interactions. Responsive iframe sizing. Custom form: name, phone, preferred date, service dropdown, message.

**DonationForm.tsx:** One-time + monthly toggle (defaults to MONTHLY). Suggested amount buttons ($10/$25/$50/$100/$250 — customizable via props). Custom amount input. Stripe Payment Links integration or link to existing donation platform. Props: `stripePaymentLink`, `externalDonationUrl`, `suggestedAmounts`, `defaultRecurrence`. Fires `donation_click` + `donation_amount` analytics events. Used by nonprofits at `/donate` and churches at `/give`. Visual: glassmorphism card, brand-primary CTA, impact statement ("$25 feeds a family for a week").

**BlogList.tsx:** Paginated blog listing. Props: `posts[]` (title, slug, excerpt, date, image, author, readingTime). Grid layout: 2-col desktop, 1-col mobile. Each card links to `/blog/{slug}`. Pagination: numbered pages or infinite scroll. Category filter tabs if >10 posts. RSS link icon in header.

**BlogPost.tsx:** Full blog post page. Props: `title, content, date, author, image, readingTime, relatedPosts[]`. Renders markdown/HTML content. Table of contents sidebar for posts >1500 words. Social share buttons (Web Share API with fallback). Related posts grid at bottom. JSON-LD BlogPosting schema. `<link rel="canonical">` preserving original URL if migrated. Previous/next post navigation.

**RSSFeed:** Not a component — generated as `public/feed.xml` during build. Atom 2.0 format. Includes all blog posts with title, link, published date, summary, author. `<link rel="alternate" type="application/atom+xml">` in index.html `<head>`.

## PWA & Print (***EVERY SITE***)

**PWA manifest:** `public/site.webmanifest` with business name, brand colors, icons (192+512). `<link rel="manifest">` in index.html. Favicon set: ico (16+32+48), apple-touch-icon (180), android-chrome (192+512). Meta theme-color matches brand primary.

**Print stylesheet:** `@media print` in index.css: hide nav/footer/sticky-cta/speed-dial, white bg, black text, show link URLs via `a[href]::after`, img max-width 100%.

**Service worker:** `public/sw.js` caches app shell + images (cache-first, max 200) + HTML (network-first). Excludes analytics. Registered in `main.tsx` (production only). Critical for rural/poor-connectivity areas. Verify offline: disconnect → refresh → site loads.

**Responsive images:** `<ResponsiveImage>` component in `src/components/local/`. Renders `<picture>` with AVIF→WebP→fallback, srcset 320/640/1280/1920w, blur placeholder, dominant color. Hero uses `eager` prop. Everything else lazy. Built on skill 12 image-optimization.md pipeline.

**SMS deep links:** Every `tel:` link paired with `sms:` option. Track as sms_click. Mobile: "Call" and "Text" buttons side by side.

## Dual-Template Architecture

Two template repos serve different site types:
- **`megabytespace/template.projectsites.dev`** — local business (this template). 19 components (16 local + BlogList + BlogPost + DonationForm), CSS var brand slots, conversion tracking, PWA.
- **`megabytespace/saas-starter`** — SaaS products. Hono+D1+Clerk+Stripe+Inngest+Resend on CF Workers.

Container selects template from `_form_data.json.category`. Local categories → `~/template-local`. SaaS categories → `~/template-saas`. See SKILL.md "Dual-Template Architecture" for full selection logic.

## Dep Versions (Pinned)
react 19 | react-router 7 | tailwindcss 4 | @shadcn/ui latest | lucide-react latest | vite 6 | typescript 5.8. Container runs `bun install` during image build — deps are cached, not fetched per build.
