---
name: "domain-features"
description: "Category-specific features for 15+ business types PLUS universal features included in every generated site at near-zero cost. Domain-specific schema, sections, interactive elements. Universal: PWA, RSS, structured data, reviews, booking, analytics, accessibility, legal pages, performance."
updated: "2026-04-25"
---

# Domain Features

Two layers: universal features (every site gets these) + category-specific features (loaded by business type).

## Universal Features (EVERY GENERATED SITE)

These cost near-zero to add and dramatically increase value. Include ALL of these in every build.

### SEO & Discovery
- **Sitemap.xml** — auto-generated from all pages, `lastmod` dates
- **robots.txt** — allow all crawlers, reference sitemap
- **JSON-LD schema** — minimum 4 types: Organization/LocalBusiness, WebSite with SearchAction, WebPage, BreadcrumbList + category-specific
- **FAQ section + FAQPage schema** — AI-generated from research (rich snippets in Google)
- **Open Graph + Twitter Card meta** — per page, 1200x630 OG image
- **Canonical URLs** — prevent duplicate content
- **Internal linking** — every page links 2+ other pages with keyword-rich anchors
- **Structured breadcrumbs** — with BreadcrumbList schema
- **AI search optimization (GEO)** — quotable 40-60 word answer blocks, entity definitions, structured data

### PWA & Installability
- **Web App Manifest** — `site.webmanifest` with name, icons (192+512), theme_color, display: standalone
- **Favicon complete set** — favicon.ico (16+32+48), favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180), android-chrome-192x192.png, android-chrome-512x512.png
- **Meta theme-color** — matches brand primary
- **Apple mobile web app capable** — fullscreen on iOS

### Trust & Social Proof
- **Google Reviews widget** — pull rating + top reviews from Places API, display with stars
- **Review count badge** — "4.8★ from 127 reviews" in hero/header
- **Social media links** — verified from research, icons in header/footer
- **Trust badges section** — years in business, certifications, awards (from research)
- **Testimonial section** — real reviews from Google/Yelp, carousel or grid

### Contact & Conversion
- **Contact form** — with Turnstile invisible captcha, Zod validation, Resend delivery
- **Click-to-call button** — `tel:` link, prominent on mobile
- **Click-to-directions** — Google Maps directions URL with encoded address
- **WhatsApp/SMS button** — `wa.me/` link if phone available, floating on mobile
- **Google Maps embed** — with exact address marker, directions link
- **Business hours display** — from Places API, with open/closed status indicator
- **Email signup** — newsletter form (connects to Listmonk or stores in D1)
- **Social share buttons** — per page, uses OG meta
- **SMS deep links** — `sms:` links alongside `tel:`, track as sms_click event
- **Speed Dial FAB** — floating action button (mobile), expands to phone/email/directions/booking
- **Emergency banner** — auto-shows after business hours with emergency number (medical/dental/plumber/HVAC/legal)

### Legal & Compliance
- **Privacy Policy page** — AI-generated from business type + jurisdiction, GDPR/CCPA compliant
- **Terms of Service page** — AI-generated, covers website usage
- **Accessibility statement page** — WCAG 2.2 AA commitment, contact info for issues
- **Cookie consent banner** — lightweight, GDPR-compliant, stores preference
- **ADA compliance** — meets Title II requirements (effective April 2026)

### Performance & Analytics
- **PostHog snippet** — cookie-free (`persistence:'memory'`), autocapture, pageview, pageleave
- **GA4 via GTM** — container snippet, custom dimensions
- **Sentry error tracking** — client-side, catches JS errors
- **Image lazy loading** — native `loading="lazy"` below fold, `fetchpriority="high"` on hero
- **Blur placeholders** — CSS gradient or tiny base64 for images
- **Preconnect hints** — for Google Fonts, analytics domains
- **Print stylesheet** — `@media print` for contact/about pages (useful for directories)

### UX Enhancements
- **Dark/light mode** — CSS `prefers-color-scheme` + manual toggle, saves preference
- **Back to top button** — smooth scroll, appears after 300px
- **Smooth scroll anchors** — for single-page sections
- **404 error page** — branded, animated, recovery links
- **500 error page** — branded, contact info, correlation ID
- **Skip to content link** — accessibility, hidden until focused
- **Reduced motion** — `prefers-reduced-motion` disables all animations
- **Focus visible outlines** — WCAG 2.4.11 Focus Appearance
- **Before/after slider** — CSS clip-path drag comparison, touch-support, for contractors/salons/dental
- **Competitor comparison** — auto-generated from research data, "/why-choose-us" page
- **Weather-aware hero** — outdoor businesses get dynamic hero based on local weather conditions

### Content Enrichment
- **Blog/news section** — AI-generated 3-5 initial posts from research + scraped content, with RSS feed
- **RSS feed** — `/feed.xml` or `/rss.xml`, auto-generated from blog posts (AI search crawlers consume this)
- **Reading time estimates** — on blog posts
- **QR code** — SVG QR code for print materials linking to site URL (downloadable from about page)
- **Multi-language** — detect via `Accept-Language`, translate key pages via Workers AI (if content justifies it)
- **FAQ from reviews** — mine Google/Yelp reviews for recurring questions, generate with FAQPage schema
- **Service area pages** — pSEO `/service-area/{city}` for service-area businesses

### Booking & Scheduling
- **Cal.com embed** — free tier, embeddable scheduling widget (if no existing booking system)
- **Appointment request form** — for businesses needing human confirmation (medical, legal)
- **Booking CTA** — links to existing system (OpenTable, Resy, Calendly, etc.) if discovered in research

### Communication
- **Live chat widget** — Chatwoot embed (self-hosted on Coolify) for businesses with support needs
- **Notification bar** — dismissible announcement banner at top (for specials, events, COVID updates)
- **Exit-intent email capture** — triggered on desktop mouse-leave, offers value (coupon, guide, consultation)

## Category→Feature Map

**Restaurant/Cafe:** Menu with categories+prices+dietary icons (V/VG/GF/DF) | OpenTable/Resy reservation widget or built-in form | Hours with holiday exceptions | Photo gallery (food-first, min 8 dishes) | Chef/team bios | Catering inquiry form | JSON-LD: Restaurant+Menu+FAQPage | Special: daily specials section, happy hour callout, online ordering link

**Salon/Spa:** Service menu with duration+price+description | Online booking CTA (link to existing system or built-in form) | Before/after gallery (side-by-side layout) | Stylist/therapist profiles with specialties | Product recommendations section | Gift card CTA | JSON-LD: HealthAndBeautyBusiness+PriceSpecification | Special: loyalty program highlight

**Medical/Dental:** Provider profiles with credentials+headshots | Insurance accepted list (searchable) | Patient portal link | Conditions treated (expandable accordion) | Telehealth availability badge | HIPAA notice in footer | Appointment request form (NOT booking — requires human confirmation) | JSON-LD: MedicalBusiness+Physician | Special: emergency contact prominent, ADA compliance critical

**Legal:** Practice areas with detailed descriptions | Attorney profiles with bar admissions+education | Case results/verdicts (anonymized) | Free consultation CTA (prominent, every page) | Blog/legal updates section | FAQ per practice area | JSON-LD: LegalService+Attorney | Special: disclaimer footer, no guarantees language

**Fitness/Gym:** Class schedule (weekly grid, filterable) | Membership tiers (comparison table) | Trainer profiles with certifications | Virtual tour / facility gallery | Free trial CTA | Transformation stories (before/after with consent) | JSON-LD: SportsActivityLocation | Special: mobile-first schedule view

**Automotive:** Services list with price ranges | Online appointment scheduling | Vehicle makes/models served | Coupons/specials section | Customer reviews prominent | ASE certification badges | JSON-LD: AutoRepair | Special: emergency/towing number prominent

**Construction/Contractor:** Project portfolio (masonry grid with filters: residential/commercial/type) | License+insurance+bonding badges | Service area map | Free estimate CTA | Process timeline (step-by-step) | Testimonials with project photos | JSON-LD: HomeAndConstructionBusiness | Special: license number in footer

**Photography:** Portfolio gallery (masonry, lightbox, categories) | Pricing packages (session types) | Booking calendar or inquiry form | Client access portal link | Blog with recent shoots | Instagram feed integration | JSON-LD: ProfessionalService | Special: image-heavy, minimal text, full-bleed hero

**Real Estate:** Property listings (grid+map view) | Agent profiles | Market reports/blog | Neighborhood guides | Mortgage calculator widget | Virtual tour embeds | Home valuation CTA | JSON-LD: RealEstateAgent | Special: IDX integration link, MLS disclaimer

**Education:** Programs/courses list with details | Faculty directory | Admissions process timeline | Campus gallery/virtual tour | Events calendar | Student resources links | Apply now CTA | JSON-LD: EducationalOrganization+Course | Special: accreditation badges

**Financial/Accounting:** Services matrix (tax/audit/advisory/bookkeeping) | Team credentials (CPA, EA, CFP) | Client portal link | Tax deadline calendar | Resource library (downloadable guides) | Free consultation CTA | JSON-LD: FinancialService+AccountingService | Special: regulatory disclaimers

**Retail:** Product highlights (featured, not full catalog) | Store locator if multi-location | Brand story section | Loyalty program CTA | Instagram/social shop link | Events/workshops calendar | JSON-LD: Store+Product | Special: link to existing ecommerce, don't rebuild catalog

**Non-Profit:** Donation CTA (prominent, 3+ placements, suggested amounts $10/$25/$50/$100/$250) | Impact metrics (animated counters) | Programs/services list | Volunteer signup form | Events calendar | Newsletter signup | Partner/sponsor logos | Annual report highlights | JSON-LD: NGO+DonateAction | Special: mission statement hero, 501(c)(3) EIN in footer

**Government/Institutional:** Service finder (search/filter) | Department directory | Document library (PDFs, organized by category) | News/press releases | Meeting calendar with agendas | Multi-language toggle | Accessibility statement page | JSON-LD: GovernmentOrganization | Special: WCAG AAA target, plain language

**SaaS/Tech:** Feature comparison table (3-tier) | Interactive demo/video hero | Pricing toggle (monthly/annual) | Integration logos grid | API documentation link | Changelog/status page link | Trust badges (SOC2/GDPR/HIPAA) | Free trial CTA with email capture | JSON-LD: SoftwareApplication+Product | Special: dark theme default, code snippets section

**Church/Religious:** Service times (weekly schedule) | Sermon archive (audio/video embeds) | Event calendar | Small groups directory | Online giving (Stripe donation) | Prayer request form | Staff/leadership directory | Visitor welcome section | JSON-LD: Church+Event | Special: livestream embed, warm welcoming tone

**Pet Services:** Services (grooming/boarding/training) with pricing | Pet gallery | Staff profiles with certifications | Online booking | Vaccination requirements | Emergency vet referral | JSON-LD: PetStore+AnimalShelter | Special: friendly playful design, pet safety badges

**Wedding/Events:** Portfolio gallery (by event type) | Package pricing comparison | Availability calendar | Vendor partnerships | Testimonials with event photos | Planning timeline | JSON-LD: EventVenue+LocalBusiness | Special: romantic elegant design, lead capture form

## Schema Priority

Every site gets: Organization or category-specific subtype, FAQPage, BreadcrumbList, WebSite with SearchAction. Category-specific schema layered on top. All schema validated against Google Rich Results Test before deploy.

## Feature Loading

Build prompt checks business category → loads matching feature set → injects into build instructions. Unknown categories default to generic LocalBusiness with: about, services, gallery, testimonials, contact, FAQ + all universal features.
