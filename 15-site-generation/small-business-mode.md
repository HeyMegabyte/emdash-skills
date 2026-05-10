---
name: "small-business-mode"
description: "Mode-inference defaults for small-business rebuilds (restaurant, salon, medical, legal, retail, contractor). Google Places NAP authority, Stripe-first donation/booking, simplified copy, owner-friendly admin. Optimizes for non-technical owners."
updated: "2026-05-10"
---

# Small-Business Mode

When mode-inference (CLAUDE.md One-Line Prompt Mode Inference) routes a prompt to `local-business`, the build differs from `saas` and `portfolio` in priority order: **conversion → NAP correctness → trust signals → owner-editable content → SEO → polish**. Owners are non-technical, so every choice optimizes for "phone calls / bookings / orders" not "GitHub stars / launch traffic."

## Trigger Phrases

Mode resolves to `local-business` when prompt contains: restaurant|cafe|bakery|pizza|sushi|deli — salon|barber|spa|nails|massage|hair — medical|dental|chiropractor|physio|orthodontist|dermatology|optometry|veterinarian|clinic — legal|law firm|attorney|lawyer|paralegal — retail|boutique|store|shop (without "online store" qualifier — that routes to `saas`) — contractor|plumber|electrician|hvac|roofing|landscaping|cleaning|moving — gym|fitness|yoga|crossfit|martial arts — auto|mechanic|body shop|detailing — pet|grooming|kennel|training. Also fires on bare-domain prompts where `_research.json` Google Places type returns any of the LocalBusiness subtypes per Schema.org.

## Required Pre-Research (Phase 0a, see research-pipeline.md)

Google Places API is **non-negotiable** in this mode. Without `GOOGLE_PLACES_API_KEY` + `GOOGLE_MAPS_API_KEY` (api-key-gate enforces), refuse to proceed — these are the source of truth for NAP, hours, ratings, photos. `_research.json` MUST contain: `business.name|formatted_address|formatted_phone_number|opening_hours.weekday_text[]|google_maps_url|google_place_id|coordinates{lat,lng}|rating|user_ratings_total|reviews_top3[]|photos_r2_urls[]|primary_type|types[]|business_status`. Confidence ≥0.85 on every field or block the build.

Competitor pull (free with Places): `nearbysearch` within 5mi same-type, top 5 by rating. Used in copy: "4.8 stars vs neighborhood average 4.2 — emphasize." Used in pricing: if 3+ competitors publish prices, ours should too (transparency wins local SEO).

## Mandatory Page Inventory

Twelve routes minimum, per page-count gate (skill 07): `/` (home with primary CTA above-fold) | `/about` (owner story, years in business, credentials) | `/services` (or `/menu` for restaurants) | `/services/{slug}` per service (pSEO — at least 4) | `/team` when ≥2 staff (skill 15 build-breaking-rules) | `/pricing` when transparency is competitive advantage | `/contact` (form + map widget + hours block) | `/locations` per physical address | `/reviews` (synced from Google Places + first-party testimonials) | `/faq` (10+ Q&A from Google Places "People also ask" + service-specific objections) | `/gallery` (Google Places photos R2-mirrored + owner uploads) | `/blog` only when `_research.json.has_existing_blog===true`.

Service detail pages are the core pSEO play. Each one: H1 = "{Service} in {City}, {State}", 800+ words, 1 hero photo (skill 12 image-relevance ≥8/10 to that specific service), 3-5 FAQs (FAQPage JSON-LD), pricing range, before/after gallery when applicable, "Book Now" / "Call Now" / "Get Quote" CTAs above-fold AND in body AND sticky on mobile.

## NAP Authority (***NON-NEGOTIABLE***)

Name + Address + Phone must match Google Business Profile EXACTLY across every page. Build gate `validate-nap-consistency.mjs` (extends skill 07 — task #35) greps every dist HTML page for the canonical NAP triplet from `_research.json.business` and fails on any deviation (truncated address, formatted phone variations like "(555) 123-4567" vs "555-123-4567", different suite numbers). One typo on `/contact` vs `/about` torpedoes local SEO ranking signals — Google penalizes inconsistent NAP across business listings.

Hyperlinks: every street address renders as `<a href="https://www.google.com/maps/search/?api=1&query={url-encoded-address}">{address}</a>` (skill 07 build-breaking-rules "Every address Google-Maps-link"). Every phone renders as `<a href="tel:+1{e164-digits}">{display-format}</a>` with PostHog `phone_click` event + GA4 `generate_lead` event firing onclick. Every email as `<a href="mailto:{email}">` with `contact_email_click` event.

## Conversion Surfaces

Above-fold primary CTA on `/`: ONE action, owner-chosen. Restaurants → "Order Online" (Toast/Square deep link) OR "Reserve a Table" (OpenTable/Resy/Tock deep link). Salons → "Book Now" (Vagaro/Square Appointments/Booksy/Cal.com). Medical/dental → "Request Appointment" (Tebra/Phreesia/Cal.com webhook). Legal → "Free Consultation" (Cal.com 30min slot). Contractors → "Get Free Quote" (form → Inngest → Resend to owner + auto-reply). NEVER multiple equal-weight CTAs above fold — one primary + one secondary ("Call Now" tel: link as secondary is universal).

Sticky mobile bottom bar (skill 10 experience): "Call" + "Directions" + primary CTA on every page below 768px viewport. Skill 13 conversions tracking: phone_click | direction_click | form_submit | booking_click | order_click — all four into PostHog + GA4 with `value` populated where Stripe price is known.

Map widget: full-width Google Maps Embed on `/contact` and footer (skill 12 build-breaking-rules "Every site with physical address full-width Google Maps Embed widget"). Iframe with `loading="lazy"` + `referrerpolicy="no-referrer-when-downgrade"`. URL: `https://www.google.com/maps/embed/v1/place?key={GOOGLE_MAPS_API_KEY}&q={encoded-address}&zoom=15`.

## Trust Stack (***RANK ABOVE PRETTY***)

Owners convert customers via trust, not aesthetics. Required surfaces in priority order: (1) Google reviews — embed top 3 on `/`, full sync on `/reviews` page, AggregateRating + Review JSON-LD per skill 15 build-breaking-rules "Every testimonials section". `validate-reviews-jsonld.mjs` (task #35) verifies count + ratings match Google Places source. (2) Years in business — heritage timeline on `/about` when `business.founded_year` ≥ current_year - 5; prominent badge "Family-owned since {year}" in header when applicable. (3) Licenses + certifications — visible on every service page (medical: state license #, board certification; legal: bar admission, Avvo rating; contractor: state license #, insurance carrier, BBB rating). (4) Local press mentions — `_research.json.press_mentions[]` from skill 15 deep-crawl; logos row "As featured in {publication}". (5) Photos of actual owner + actual staff + actual location — never stock. Skill 12 image-relevance gate already enforces business-type semantic match; small-business mode adds `validate-photo-authenticity.mjs` (task #35) to block stock-looking images on team/about/gallery pages.

## Copy Voice

Sharp + irreverent voice from rules/copy-writing.md applies but DIALED DOWN for local-business — owners have repeat customers and word-of-mouth reputation, edgy copy can feel off-brand. Examples that work: "We've cut hair in this town for 22 years." "12-minute oil changes. We know you're busy." "Same dentist for 15 years, same hygienist for 8. We don't have turnover problems." Examples that DON'T work for local: "We disrupt traditional plumbing." "Revolutionary new haircut experience." (Banned by copy-writing.md anyway, but worth flagging — local owners have specifically rejected this voice in user-test.)

Microcopy on forms: helpful + specific. "We'll text you the appointment confirmation within 5 minutes" beats "Submit." "We answer 7am-7pm. After hours, leave voicemail and we'll call back by 8:30am tomorrow" beats "Contact us anytime."

## Stripe-First Booking/Donation

When mode is `local-business` AND business takes deposits, prepayments, or upsell add-ons, default booking flow is Stripe Checkout — NOT a third-party booking platform. Why: 2.9%+30¢ vs platform 5-15% take-rate, payout in 2 business days, no per-month subscription. Pattern: owner books slot via Cal.com (free tier, 1 calendar) → Cal.com webhook → Worker creates Stripe Checkout session for deposit → email magic link to customer → on payment success, Stripe webhook → Worker confirms booking + Inngest schedules reminder emails 24h+1h before. Skill 13 stripe webhook-first idempotent processing applies.

For non-profits within local-business (charity events, school fundraisers): Stripe Donation forms (Stripe-hosted, free) beat GiveDirectly/PayPal Giving. Single line of code: `<a href="https://buy.stripe.com/{donation-link-id}">Donate</a>`. Works on every device, accepts Apple Pay/Google Pay/cards/Klarna, payout direct to owner's bank.

## Owner-Editable Content

Non-technical owners need to update hours, prices, photos, FAQ without touching code. Two paths in priority order: (1) **Google Business Profile is the CMS.** Hours, primary photos, services, FAQs, posts — owner edits in Google's UI; build pulls fresh from Places API every 6 hours via Cron Trigger; site re-renders affected pages. Owner never logs into our admin for these. (2) **Markdown files in a private R2-mirrored repo for everything else** (about story, blog posts, custom service descriptions, team bios). Owner doesn't touch repo — they email/text the changes to brian@megabyte.space, AI commits + redeploys (10-second turnaround typical). For owners who want self-service, scaffold a `/admin` route gated by Clerk magic-link, edit-in-place via TipTap or Editor.js (skill 06 packages list), commit via GitHub API. Don't build the admin until owner asks — most don't, and the email path is faster for the 80% case.

## Performance Budget (relaxed for local)

Local-business sites typically have older customer demographics + slower mobile networks. Tighten image budgets: largest hero ≤120KB (vs 200KB default), total page ≤350KB (vs 500KB), JS ≤120KB gz (vs 200KB). Phone+address+hours visible without JS (server-rendered in HTML shell — works on every browser including 5-year-old Android stock browsers in a service area). Lighthouse Mobile Performance ≥85 (raised from default 75).

## Local SEO Stack

Per-route metadata (rules/per-route-metadata.md) with location modifiers: every service-detail title includes `{Service} in {City}, {State}` — geo-relevant H1s drive 30%+ ranking gain over generic. Schema.org: `LocalBusiness` (or specific subtype: `Restaurant`, `Dentist`, `LegalService`, `HairSalon`, `MedicalClinic`, `AutoRepair`, `HomeAndConstructionBusiness`) with `@id`, `address` PostalAddress, `geo` GeoCoordinates, `openingHoursSpecification[]`, `telephone`, `priceRange`, `aggregateRating` (synced Google Places rating), `review[]` top 5. JSON-LD validator (skill 15 validate-jsonld-schema.mjs) requires this on every page.

`humans.txt` includes owner name + nearest cross-streets (humanizing signal for E-E-A-T). `robots.txt` allows everything (no surface to hide). `sitemap.xml` `<priority>` weighted: home 1.0, services index 0.9, individual services 0.8, contact/about 0.7, blog 0.5.

## Acceptance Gate (this mode only)

Build cannot ship until: (a) Google Places fields all populated at confidence ≥0.85, (b) NAP consistency gate passes, (c) primary CTA functional end-to-end (form submit lands in Resend inbox; booking link opens correct calendar; phone tel: dials), (d) map widget renders (no API key error), (e) reviews JSON-LD validates against schema.org, (f) mobile sticky CTA bar visible at 375px, (g) Lighthouse Mobile ≥85, (h) source-fidelity loop passes when source domain exists.

## See also

- `rules/always.md` — universal Every-X gates (per-route metadata, Google Maps embed, NAP)
- `research-pipeline.md` — Google Places integration
- `local-seo.md` — local SEO playbook (existing in this skill)
- skill 13 `observability-and-growth` — local conversion events
- skill 09 `brand-and-content-system` — copy voice + trust surfaces
- `non-technical-owner-onboarding.md` — owner-side experience
