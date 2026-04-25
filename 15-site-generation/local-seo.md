---
name: "local-seo"
description: "Local SEO pipeline: citation building, GBP sync, review generation, trust badge verification, local conversion tracking. The delta between 'good local website' and '#1 in the Map Pack.'"
updated: "2026-04-25"
---

# Local SEO Pipeline (***MAP PACK DOMINATION***)

A gorgeous website means nothing if it doesn't rank. Local businesses live and die by Google Map Pack (top 3 local results). This submodule covers everything BEYOND the website that drives local rank.

## Google Business Profile Sync (***CRITICAL***)

Website and GBP must match EXACTLY — divergence hurts rankings. After site generation:

**Auto-sync fields:** Business name, address, phone (NAP consistency across ALL citations), hours (including holiday exceptions), services list, business description (first 750 chars = most important), categories (primary + secondary), attributes (wheelchair accessible, free wifi, etc.), photos (upload hero + top 5 from assets/).

**GBP Posts:** Generate 3 initial posts from site content: (1) welcome/intro post, (2) featured service/product, (3) special offer or event. Schedule via GBP API or manual upload instructions in `_gbp_sync.json`.

**Output file:** `_gbp_sync.json` — structured data matching GBP fields exactly. Worker can auto-push via Google My Business API (OAuth required) or generate human-readable instructions for manual update.

**NAP consistency check:** After build, verify Name+Address+Phone match across: site header, site footer, JSON-LD, Google Maps embed, contact page, GBP listing. Any mismatch = build failure.

## Citation Building (***LOCAL RANK SIGNAL #2***)

Citations = mentions of business NAP on external directories. More consistent citations = higher local rank.

### Tier 1 — Essential (submit within 24hr of site launch)
Google Business Profile | Apple Maps Connect | Bing Places | Yelp Business | Facebook Business Page | Better Business Bureau

### Tier 2 — Industry Directories (submit within 1 week)
| Business Type | Directories |
|---------------|-------------|
| Medical | Healthgrades, Vitals, ZocDoc, WebMD, RateMDs |
| Legal | Avvo, FindLaw, Justia, Martindale-Hubbell, Lawyers.com |
| Restaurant | TripAdvisor, OpenTable, Grubhub, DoorDash, Zomato |
| Salon/Spa | StyleSeat, Booksy, Vagaro, SalonCentric |
| Real Estate | Zillow, Realtor.com, Trulia, Redfin |
| Automotive | CarFax, RepairPal, AutoMD, Mechanic Advisor |
| Construction | Houzz, Angi, HomeAdvisor, Thumbtack, Porch |
| Financial | NerdWallet, WalletHub, CPA Directory |
| Fitness | ClassPass, Mindbody, Gympass |
| Education | Niche, GreatSchools, US News |
| Photography | The Knot, WeddingWire, Thumbtack |
| Pet Services | Rover, Care.com, BringFido |

### Tier 3 — General Directories (submit within 2 weeks)
Yellow Pages | Manta | Foursquare | Hotfrog | Superpages | CitySearch | Local.com | MerchantCircle | Brownbook | eLocal

**Output file:** `_citations.json` — list of directories with: name, URL, submission status (pending/submitted/verified), NAP data to submit, category. Worker tracks submission status in D1.

**Automation:** For directories with APIs (Yelp, Foursquare, Apple Maps), auto-submit via Worker. For manual-only directories, generate step-by-step instructions with pre-filled data in `_citation_instructions.md`.

## Review Generation (***LOCAL RANK SIGNAL #1***)

Review velocity (new reviews per month) is the single biggest Map Pack ranking signal. Not fake reviews — systematic request workflow.

### QR-to-Review Flow
Generate `assets/review-qr.svg` — QR code linking to: `https://search.google.com/local/writereview?placeid={PLACE_ID}`. Display on: thank-you page, email footer, printable card (PDF in assets/).

### Review Request Page
Build `/review` page on generated site: "How was your experience?" → 5-star rating → if >=4 stars: redirect to Google review page | if <3 stars: show feedback form (captures complaint privately, prevents negative public review).

### Post-Visit Automation (instructions for business owner)
Generate `_review_automation.md` with setup instructions for:
- **Email:** Resend template triggered 24hr after appointment/purchase. Subject: "How was your visit to {business_name}?" CTA: "Leave a Review →" linking to Google review URL.
- **SMS:** Twilio template (if phone collected). Same timing, shorter copy.
- **In-store:** Printable QR card design (PDF) for counter/receipt stapling.

### Review Widget on Site
Pull Google Places reviews → display on site with: star rating, reviewer name, date, text (truncated with "Read more" linking to Google). Carousel on mobile. Min 3 reviews displayed. If <3 reviews available, show testimonial section instead with CTA to leave first review.

## Trust Badge Verification (***CONVERSION SIGNAL***)

Don't just list certifications — verify and display them with badge images.

### Auto-Discovery Pipeline
From research data, identify claimed certifications. Attempt verification:

| Badge Type | Verification Source | Display |
|------------|-------------------|---------|
| BBB Rating | BBB API or scrape | BBB badge with rating letter |
| Chamber of Commerce | Local chamber website scrape | Member badge with year |
| Google Guaranteed | Google LSA API | Green checkmark badge |
| ASE Certified (auto) | ASE website | Blue seal with specialties |
| HIPAA Compliant (medical) | Self-declared, standard badge | HIPAA badge in footer |
| ADA Compliant | Self-declared after axe-core pass | ADA badge in footer |
| Licensed & Insured | State license board scrape | License # in footer |
| SOC2/GDPR (SaaS) | Self-declared | Badge in footer + trust section |
| Angi/HomeAdvisor (construction) | Angi API or scrape | Rating badge |
| ABMP (massage) | ABMP directory | Member badge |

**Badge image generation:** If no official badge image available, generate clean SVG badge with Ideogram: "{Certification Name}" + icon + year. Store in `assets/badges/`.

**Display pattern:** Trust badges section after hero or in sidebar. Footer row of badge images. Service pages show relevant certifications inline.

## Local Conversion Tracking (***MEASURE WHAT MATTERS***)

SaaS conversions (trial-to-paid) are irrelevant for local businesses. Track these instead:

### Event Taxonomy (PostHog + GA4)
```
phone_click        — tel: link clicked (primary conversion)
direction_click    — Google Maps directions clicked
form_submit        — contact/booking form submitted
booking_click      — external booking system CTA clicked
email_click        — mailto: link clicked
chat_open          — live chat widget opened
review_click       — review CTA clicked
menu_download      — PDF menu downloaded (restaurant)
coupon_claim       — special offer/coupon clicked
social_click       — social media profile link clicked
```

### GA4 Goals (auto-configure via GTM)
Goal 1: Phone Call (phone_click event)
Goal 2: Direction Request (direction_click event)
Goal 3: Form Submission (form_submit event)
Goal 4: Booking (booking_click event)

### Call Tracking (optional, premium)
If business opts in: Google forwarding number via Google Ads (free with ads account) or CallRail integration ($45/mo). Tracks: call duration, caller location, call recording, missed call alerts. Without call tracking: count tel: clicks as proxy.

### Local Funnel
```
Visit → Page View → Engagement (scroll 50%+) → Micro-conversion (menu view, gallery browse) → Macro-conversion (call, directions, form, booking)
```

PostHog funnel: define per-site, track weekly conversion rate. Alert if rate drops >20% week-over-week.

## Local Schema Enhancements

Beyond basic JSON-LD, add:
- **geo coordinates** — lat/lng from Google Places (Map Pack signal)
- **areaServed** — list of cities/neighborhoods served
- **priceRange** — "$" to "$$$$" from research
- **aggregateRating** — from Google Places reviews
- **hasMenu** — for restaurants (MenuSection+MenuItem)
- **openingHoursSpecification** — day-by-day including exceptions
- **paymentAccepted** — Cash, Credit Card, etc.
- **currenciesAccepted** — USD
- **sameAs** — all verified social profiles
- **knowsAbout** — services/specialties list

## Integration Points

- research-pipeline.md → provides Place ID, reviews, hours, geo for GBP sync
- media-acquisition.md → badge images generated alongside other assets
- build-prompts.md → review widget + trust badges injected into build
- quality-gates.md → NAP consistency check added to quality scoring
- domain-features.md → conversion events match feature CTAs
- 13-observability-and-growth → local conversion events fire alongside SaaS events
