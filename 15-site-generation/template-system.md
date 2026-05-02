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

### Anti-FOUC reveal gate (***UNIVERSAL — every site with IntersectionObserver reveals***)

IntersectionObserver-driven reveal animations cause a visible→invisible→fade-in twitch on first paint when JS adds the `.reveal` (opacity:0) class AFTER paint. Fix: pre-paint class gate set synchronously inline.

`index.html` — FIRST line inside `<head>`, before any `<link>` or `<style>`:
```html
<script>document.documentElement.classList.add('js-reveal-active');</script>
```

`src/index.css`:
```css
html.js-reveal-active main section:not(:has(.hero-rise)),
html.js-reveal-active main [data-reveal] {
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: opacity, transform;
}
html.js-reveal-active main section:not(.reveal-visible):not(.no-reveal):not(:has(.hero-rise)),
html.js-reveal-active main [data-reveal]:not(.reveal-visible) {
  opacity: 0;
  transform: translateY(24px);
}
@media (prefers-reduced-motion: reduce) {
  html.js-reveal-active main section,
  html.js-reveal-active main [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
```

The `.no-reveal` opt-out is for sections whose own children animate themselves (e.g. `.hero-rise` stagger) so they aren't double-faded by the parent gate. The `js-reveal-active` class is required so the gate only activates when JS will subsequently add `.reveal-visible` — non-JS users see content normally. Reference incident: njsk.org 2026-05-02 sections flashed visible→invisible→fade-in because RevealOnScroll's useEffect added `.reveal` after first paint.

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

## Citation Components (***skill 15 + rules/citations.md***)

**Citation.tsx:** Inline superscript citation. Props: `refId: string`, `children: ReactNode`. Renders `<span>children<sup><a href="#refId">[N]</a></sup></span>` where N is the auto-numbered position from `_citations.json`. Click → smooth-scroll to ReferencesList entry, focus + 2s highlight. Keyboard accessible (focus ring, Enter/Space). Mandatory wrapper for any quantitative claim in copy.

**ReferencesList.tsx:** Footer-of-page bibliography. Props: `refIds: string[]` (defaults to all cited on page). Renders `<section aria-labelledby="references">` with `<h2 id="references">References</h2>` and ordered list of APA 7th ed entries from `_citations.json`. Hanging indent (`text-indent: -2em; padding-left: 2em`). DOI/URL rendered as link. JSON-LD `citation: CreativeWork[]` array auto-generated alongside (boosts AI search inclusion 16%→54%, Brewer, 2024).

**SourcedStat.tsx:** Specialized for hero/section stats. Props: `value: string|number`, `label: string`, `refId: string`. Renders large number with inline citation badge. Auto-applies to any `<Stat>` or numeric copy that needs callout treatment. Animated count-up on IntersectionObserver, citation appears with the number (no orphaned stats).

## Universal Helper Components (***SHIP IN TEMPLATE — referenced by always.md, MUST exist as code***)

`always.md` mandates `<MailLink>`/`<TelLink>`/`<AddressBlock>` + universal hyperlink + lightbox capture-restore + count-up + per-route metadata + route-conditional maps + inline markdown links. None work unless template ships the implementation. Template MUST include:

**MailLink.tsx:** `export function MailLink({email, className=''}: {email:string;className?:string}) { return <a href={\`mailto:\${email}\`} className={\`underline-hover \${className}\`}>{email}</a>; }`. Never hand-code `<a href="mailto:...">` ad-hoc — always import this.

**TelLink.tsx:** strips formatting to E.164 in `href`, renders formatted display text. `const e164 = '+1' + phone.replace(/\D/g,'').replace(/^1/,''); return <a href={\`tel:\${e164}\`} className={\`underline-hover \${className}\`}>{phone}</a>;`. Pair with optional `sms:` button per always.md.

**AddressBlock.tsx:** Bordered card with map-pin SVG, three size variants. Props: `lines: string[]; label?: string; mapsQuery?: string; mapsMode?: 'dir'|'search'; size?: 'sm'|'md'|'lg'`. `mapsMode='dir'` → `https://www.google.com/maps/dir/?api=1&destination=<urlencoded>` (default for street addresses), `'search'` → `https://www.google.com/maps/search/?api=1&query=<urlencoded>` (PO Boxes / no-direction-target). `size='sm'` indented hint-text 14px, `'md'` bordered card 16px (default), `'lg'` hero block 20px+. Wraps every line in the maps anchor with `target="_blank" rel="noopener"`. The whole tile is the click target (per always.md "tile-as-link" rule), not just inner text.

**Lightbox.tsx (overflow-lock + viewport-fixed root + explicit scroll-restore — fixes both lightbox-renders-at-page-top AND close-jumps-to-top bugs):** YARL portal mount with `overflow:hidden` body lock + scrollbar-gutter compensation + forced `position:fixed; inset:0; zIndex:9999` on YARL root + capture-scrollY-at-open + `window.scrollTo(0, scrollY)` on cleanup. NEVER use the `body.style.position='fixed'; top=-${scrollY}` shift pattern — YARL's portal child resolves its `position:fixed` against the displaced body's containing block when body is itself fixed, causing the lightbox to render anchored to the page-top (offset by `-scrollY`) instead of the viewport. The user sees the dialog "at the top of the page, can't scroll to it." But pure `overflow:hidden` alone is ALSO insufficient — some browsers (Safari iOS, some Chrome variants under heavy React render churn) lose the scroll position when YARL's portal mount triggers focus management or when state transitions around open/close. Belt-and-suspenders: capture `scrollY` at open AND explicitly call `window.scrollTo(0, scrollY)` in the cleanup return — guaranteeing the page is exactly where the user clicked when the lightbox closes. Correct pattern:
```tsx
useEffect(() => {
  if (!open) return;
  const body = document.body; const html = document.documentElement;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  const original = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, paddingRight: body.style.paddingRight, scrollBehavior: html.style.scrollBehavior };
  html.style.scrollBehavior = 'auto';
  html.style.overflow = 'hidden'; body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  return () => {
    html.style.overflow = original.htmlOverflow; body.style.overflow = original.bodyOverflow;
    body.style.paddingRight = original.paddingRight;
    window.scrollTo(0, scrollY); // explicit restore — defense against any browser/React state that lost the scroll
    html.style.scrollBehavior = original.scrollBehavior;
  };
}, [open]);
// YARL props:
// portal={{ root: document.body }}
// styles={{ root: { '--yarl__color_backdrop': 'rgba(8,0,12,0.94)', position: 'fixed', inset: 0, zIndex: 9999 } }}
```
The `paddingRight = scrollbarWidth` compensation prevents content reflow when the vertical scrollbar disappears. The `scrollBehavior='auto'` override defeats any global `html { scroll-behavior: smooth }` that would interfere — and is set BEFORE the `window.scrollTo()` so the restore is instant, not animated. Mount in Layout, wrap ALL major image groups with `[data-gallery="<id>"]` (services|gallery|team|blog hero|testimonials|before-after). Bundle MUST contain `data-zoomable` AND `data-gallery` strings (verified by build_validators.ts). Lightbox-eligible: `kind!=logo AND dims≥1024×768 AND quality_score≥7` — logo grids use grayscale→color hover instead. Reference fixes: njsk.org 2026-05-01 — initial body-shift pattern caused dialog to render at page-top; corrected to overflow-lock + viewport-fixed root. njsk.org 2026-05-02 — overflow-lock alone proved insufficient under some browser/React combinations; added explicit `window.scrollTo(0, scrollY)` in cleanup return so close always restores exact click-origin scroll position.

**FullWidthMap.tsx (route-conditional, per skill 15 §Quality Bar(2)):** Used ONLY on dedicated `/contact` AND `/mass-schedule` (or equivalent location-pages). Full-bleed (breaks out of `max-w-*` containers via negative margin or `100vw` width), 560px height, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`. Embed src: `https://www.google.com/maps/embed?pb=...` from research geo. Below map: `<AddressBlock size="lg">` + `Get Directions →` deep link + hours grid. NEVER use this on home/about/services — those use `<MapEmbed>` with `max-w-*` container per skill 10 §Local Business or `<StylizedMap>` SVG thumbnail.

**StylizedMap.tsx (route-conditional alternate):** Hand-drawn SVG of neighborhood/region with brand-color paths, business pin marker, decorative streets — NO third-party iframe. Used on home hero overlay, footer mini-map, section thumbnails. May overlay an `<AddressBlock>`. Renders at any size, no LCP cost.

**PageHead.tsx + page-meta.ts (HARD GATE per rules/per-route-metadata.md):** Central registry of `RouteMetadata` for every route. Template ships `src/data/page-meta.ts`:
```ts
import type { RouteMetadata } from '@/types/route-metadata'; // matches per-route-metadata.md interface
export const routes: Record<string, RouteMetadata> = {
  '/':            { path:'/', title:'…', description:'…', canonical:'…', themeColor:'…', applicationName:'…', appleMobileWebAppTitle:'…', og:{…}, twitter:{…}, jsonLd:[…] },
  '/about':       { … },
  '/contact':     { … },
  '/donate':      { … },
  '/blog':        { … },
};
export function meta(path: string): RouteMetadata {
  if (routes[path]) return routes[path];
  // dynamic blog routes: /blog/:slug → derive from blog post data
  if (path.startsWith('/blog/')) return buildBlogMeta(path);
  return routes['/']; // fallback (validator catches missing entries pre-deploy)
}
```
`PageHead.tsx` subscribes to `useLocation()`, calls `meta(pathname)`, swaps `document.title` + every `<meta>` + `<link rel="canonical">` + JSON-LD `<script>` tags. ALSO emit static `<head>` per route during build (vite-react-ssg or per-route HTML pre-render) — client swap is fallback only; SEO crawlers MUST see static head. Validator `scripts/validate-route-metadata.mjs` greps `dist/**/*.html` for required fields + uniqueness, fails build on miss.

**CountUp.tsx:** Production default per skill 11 §Number-Roll Counters. IntersectionObserver+rAF, `threshold:0.5`, ease-out cubic, `prefers-reduced-motion` jumps to final, suffix (`+`/`%`/`x`) renders OUTSIDE animated digit node (NEVER suffix-inside-digit — `5,000+` ticking through `1,234+` looks broken). Reuse from skill 11 reference impl.

**renderInline.ts (markdown link parser, used by FAQ/blog/donate-FAQ/AddressBlock children):**
```ts
export function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []; const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0; let m: RegExpExecArray | null; let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, url] = m; const ext = /^https?:/.test(url); const tel = url.startsWith('tel:'); const mail = url.startsWith('mailto:');
    parts.push(<a key={key++} href={url} className="underline-hover" {...(ext ? { target:'_blank', rel:'noopener noreferrer' } : {})}>{label}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
```
6 lines of logic, auto-detects `mailto:`/`tel:`/`http`/internal. Plain-text mode if no matches.

## DonationForm — Non-Profit /donate Page Spec (***EXPANDED***)

Replaces the prior bare DonationForm. Used by nonprofits at `/donate`, churches at `/give`. Composed sections (top-to-bottom):

1. **Hero:** Mission-aligned headline + 1-sentence impact statement (e.g. "$25 feeds a Newark family for a week"). Brand-primary CTA scrolls to form below.
2. **Impact tiers (4 cards):** Per `_research.json.donations.impact_tiers` (default fallback for soup kitchens: `$25→5 meals`, `$100→20 meals`, `$500→100 meals`, `$1,000→200 meals`; per-category presets ship in `donation-tier-presets.json` for food-pantry|disaster-relief|education|medical|environmental|animal-welfare). Each card: amount, what it provides, supporting line, "Give $X →" button that pre-fills form.
3. **"Where Your Money Goes" — 4-bar breakdown:** Animated horizontal bars per `_research.json.donations.allocations[]` with percentages (default for soup kitchens: program 92%, admin 5%, fundraising 3%, infrastructure 1% — pull actual percentages from Form 990 / GuideStar when available, cite source per rules/citations.md). Bars animate width on IntersectionObserver via `<CountUp>`-style ease-out.
4. **Donation form (one-time + monthly toggle, DEFAULT MONTHLY):** Suggested amounts $25/$50/$100/$250/$500 (customizable per `_research.json.donations.suggested_amounts`). Custom amount input. Stripe Payment Links integration (`stripePaymentLink` prop) OR external donation platform link (`externalDonationUrl` for Donorbox/Givebutter/Classy/Bonterra). Tribute fields: "In honor of" / "In memory of" (optional). Cover-fees checkbox (default ON, adds ~3% to keep nonprofit's net intact). Fires `donation_click` + `donation_amount` + `donation_recurrence` analytics events.
5. **Live Monthly Goal widget (CONDITIONAL — env-gated):** Render ONLY when `import.meta.env.VITE_PROJECTSITES_API` is set. Pulls live `monthly_goal_cents` + `monthly_raised_cents` from projectsites.dev API, renders progress bar + `$X of $Y raised this month`. When env NOT set, the entire widget is `null` — never render an empty bar showing `$0 / $0` (looks broken+demoralizing). This is the canonical "gate empty widgets behind env" pattern from auto-memory feedback (njsk.org incident 2026-04).
6. **Donor FAQ (16 accordions, AI-generated from research + nonprofit-FAQ-library):** Required topics: tax deductibility (501(c)(3) status with EIN cited inline) | recurring vs one-time | how to cancel/modify recurring | in-honor / in-memory gifts | stock gifts | crypto gifts (mailing address linked via `<AddressBlock mapsMode='search'>` — PO Box uses search, not directions) | DAF (donor-advised fund) instructions | corporate matching | IRA qualified charitable distribution | planned giving / bequests | gift acknowledgement / receipt timing | where receipts come from (email + sender domain) | privacy of donor info | refunds / mistakes | volunteer hours match | who to contact for large gifts (`<MailLink>` major-gifts contact). Each FAQ answer ≤120 words, runs through `renderInline` so embedded links render. Generates `FAQPage` JSON-LD.
7. **Other ways to give (footer of /donate):** Mail-in check (PO Box wrapped in `<AddressBlock mapsMode='search'>`), planned giving anchor link, in-kind donations contact (`<MailLink>`).

DonationForm props (full): `stripePaymentLink?:string; externalDonationUrl?:string; suggestedAmounts:number[]; defaultRecurrence:'monthly'|'one-time'; impactTiers:Array<{amount:number;outcome:string}>; allocations:Array<{label:string;pct:number;refId?:string}>; ein:string; orgName:string; mailingAddress:string[]; majorGiftsEmail:string; liveGoalEnabled?:boolean (defaults to !!import.meta.env.VITE_PROJECTSITES_API);`.

**Component count:** 28 total in template (16 local + BlogList + BlogPost + DonationForm[expanded] + Citation + ReferencesList + SourcedStat + MailLink + TelLink + AddressBlock + Lightbox + FullWidthMap + StylizedMap + PageHead + CountUp + renderInline-helper). Update tailwind safelist + index exports + `validate-route-metadata.mjs` registry accordingly. Validator `scripts/validate-template-components.mjs` greps `template/src/components/` to confirm every helper exists pre-build.

## Blog Routing (React Router)

Template App.tsx includes catch-all blog routes:
```tsx
<Route path="/blog" element={<BlogListPage />} />
<Route path="/blog/:slug" element={<BlogPostPage />} />
<Route path="/blog/:year/:slug" element={<BlogPostPage />} />
```
During build, Claude Code generates page components for each blog post from `_scraped_content.json`. Posts with date-based original URLs (e.g., `/blog/2024/summer-event`) use the `:year/:slug` pattern. Posts without dates use flat `/blog/:slug`. BlogListPage imports all posts as a static array and renders BlogList component with pagination. Each BlogPostPage resolves its post from the slug param.

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
