# Homepage Block Library — 50 Distinct Feature-Block Types

Canonical block taxonomy for `template.projectsites.dev` homepage composition. Every generated site picks 8–14 blocks from this library, ordered narratively (hero → trust → problem → solution → proof → action → closer). Each block is a standalone, self-contained React component in `src/components/blocks/<kebab-slug>.tsx` with its own data prop interface. Builds compose via `blocksManifest.json` at the site level — order is per-site, blocks are universal.

## Tier 1 — Hero / Above-the-Fold (pick 1)
1. **`hero-split-narrative`** — left-column 8-word headline + 18-word subhead + 2-CTA stack; right-column hero photograph with brand-tinted scrim, photo subject named in alt-text. View Transitions cross-fade between routes.
2. **`hero-video-loop`** — full-bleed muted autoplay 12-30s b-roll; `<source>` AV1+H.264; LQIP poster; ASCII-art fallback for `prefers-reduced-motion`; headline+CTA overlay with reduced-opacity gradient.
3. **`hero-mission-statement`** — single centered 14-word manifesto sentence, oversized type (clamp 4rem-9rem), animated word-by-word reveal (View Transitions or CSS @starting-style), no image — pure typographic poster.
4. **`hero-impact-counter`** — three IntersectionObserver count-up stats above headline ("198 years. 6M+ meals. 11 pastors."), then narrative subhead. Roll-in animates once per session via rAF.
5. **`hero-rotating-headlines`** — single visual, rotating headline carousel (5-7s/slide), 3-5 alternate value propositions, dot navigation, pause on hover, respects `prefers-reduced-motion`.
6. **`hero-interactive-map`** — Mapbox/MapLibre hero showing service area, animated pins drop on viewport entry, click reveals branch/site detail panel, kept under 200KB JS budget via dynamic import.
7. **`hero-quote-from-founder`** — oversized pull-quote from founder/CEO, photo top-right, date+context line, single "Read the full story →" deep-link.
8. **`hero-before-after-slider`** — drag-to-reveal split image (e.g. neighborhood before/after, building before renovation, dataset visualization), 60fps, touch+keyboard accessible, ARIA slider role.

## Tier 2 — Trust & Credibility Band (pick 1-2)
9. **`logo-river-partners`** — horizontally-scrolling grayscale-to-color-on-hover logo river of grant funders, media outlets, partner orgs; CSS scroll-snap; native `<marquee>` replacement using CSS `@property --offset` + scroll-driven animation.
10. **`accreditation-strip`** — Charity Navigator 4-star badge + GuideStar Platinum Seal + BBB Wise Giving Alliance accredited + 501(c)(3) EIN — clickable badges deep-linking to the rating page, not images.
11. **`press-mentions-band`** — masonry of 4-6 outlet logos with the exact pull-quote from each article, link to source, dateline. Real verbatim quotes only.
12. **`years-in-operation-counter`** — single oversized "Serving since 1828" with a year-by-year micro-timeline strip beneath, dots representing eras color-coded by category (founding/growth/inflection).
13. **`google-reviews-aggregate`** — live Google Places aggregate rating (stars + count) + 3 most-recent 5-star reviews, deep-linked to Google Maps reviews page. Refreshed daily via Worker cron.
14. **`testimonial-headline-rotator`** — single tall pull-quote that rotates every 8-12s, "more →" link to /testimonials, reviewer photo + name + role.

## Tier 3 — Problem / Mission Framing (pick 1-2)
15. **`stat-block-grid`** — 3-6 stat cards in a responsive grid; each card: oversized number, 2-line caption, inline APA citation superscript. IO count-up.
16. **`narrative-walkthrough`** — 4-step vertical scroll-driven narrative ("This is Maria. She's worked since 7am…"), each step pinned 100vh, animated illustration changes per step, scroll-jacking disabled (relies on scroll progress only).
17. **`map-heatmap-need`** — choropleth map showing geographic distribution of need (food insecurity %, child poverty rate, etc.) — Mapbox/D3 hybrid, hover for census-tract detail.
18. **`comparison-table-need-vs-supply`** — full-bleed table showing demand vs current capacity, color-coded gap column, sticky header, sortable. Mobile: card stack.
19. **`audio-testimonial-grid`** — 3-6 audio waveform tiles, click-to-play, transcript drawer slides in, AudioContext shared across cards so only one plays at a time.
20. **`day-in-the-life-timeline`** — horizontal timeline 6am→10pm showing a single client's day with milestone events, your service intersected at the right hour.

## Tier 4 — What We Do / Services Showcase (pick 1-2)
21. **`service-pillars-3up`** — 3 oversized service cards with custom icon, 1-sentence pitch, micro-stat ("2,400 meals/week"), and "Learn more →" deep-link. Cards lift on hover, no layout shift.
22. **`process-stepper`** — numbered horizontal/vertical step-by-step "how this works" — 4-7 nodes, animated connecting line draws on viewport entry, each step links to a deeper page.
23. **`tabbed-service-deepdive`** — sticky vertical tab nav (left, desktop) / accordion (mobile) showcasing services with rich content panes (text + image + 1 stat per pane).
24. **`carousel-program-spotlight`** — autoplay program-of-the-month spotlight, hero photo + short story + CTA, swipeable touch, keyboard navigable.
25. **`interactive-program-finder`** — 2-3 dropdown filters ("I am a…", "I need…") → live-filtered service result card. URL-syncs filters via search params.

## Tier 5 — Impact / Results (pick 1)
26. **`live-impact-ticker`** — fixed-height bar at top of section showing live-updating counters (meals served today, $ donated this week, volunteers this month) — animated number change every 30s pulled from Worker /api/impact.
27. **`year-over-year-chart`** — Chart.js or Recharts bar/line chart showing 5-year impact growth, hover for exact numbers, source citation link below.
28. **`impact-receipt-generator`** — interactive widget: "Donate $X → see exactly what it buys" — slider + animated illustration of meals/services unlocked at each tier.
29. **`featured-impact-story`** — full-bleed story tile with hero photo, 3-paragraph case study, named subject with consent, outcome metric, "Read more stories →" link.
30. **`heritage-stats-rollup`** — 4-stat horizontal band for orgs with deep history ("198 years · 6M+ meals · 11 leaders · 3 buildings"), each with hover-reveal era detail.

## Tier 6 — Action / Conversion (pick 1-2)
31. **`donate-tier-ladder`** — 5-7 dollar-amount tier cards ($25, $50, $100, $250, $500, $1K, Custom) — each shows what that gift buys, primary CTA "Give Now" deep-links to Stripe with `?amount=` prefilled.
32. **`monthly-vs-onetime-toggle`** — donation form embedded with monthly/one-time toggle, animated tier-impact reveal on toggle, "Your $50/mo = 600 meals/year" social-proof helper.
33. **`volunteer-shift-picker`** — calendar widget showing next 30 days, available shifts, click-to-claim, captures email+phone, Resend confirmation triggers.
34. **`in-kind-needs-board`** — 6-12 "most-needed" tiles with thermometer fill bars (% of monthly target hit), Amazon wishlist link per item, "Bring this Saturday →" CTA.
35. **`major-gifts-callout`** — full-bleed dark band targeting $10K+ donors: planned giving, named-gift opportunities, "Book a call with our director →" Calendly embed.

## Tier 7 — Social Proof / Stories (pick 1-2)
36. **`testimonial-wall-masonry`** — Pinterest-style masonry of 9-18 testimonial cards, each with photo+name+role+quote, lightbox on click reveals full story, infinite scroll.
37. **`video-testimonial-grid`** — 3-6 silent autoplay 8-15s video loops, click expands to full audio version with transcript, picture-in-picture support.
38. **`partner-quote-pull`** — single full-bleed quote from a high-credibility partner (bishop, mayor, hospital CEO, etc.), oversized typography, partner logo + photo bottom-right.
39. **`donor-spotlight-card`** — rotating major-donor profile (with permission) — "Why I give" 90-second video + photo + dollar level + CTA "Join them →".
40. **`media-coverage-river`** — vertical river of press articles with logos, dates, headlines linking out — newest at top, sortable by outlet/year.

## Tier 8 — Closer / CTA + Newsletter (pick 1)
41. **`newsletter-signup-conversion-band`** — full-bleed dark band, oversized headline ("Join 12,400 readers"), Turnstile-protected email input, Resend triggered, no decoration distractions.
42. **`upcoming-events-strip`** — next 3 events horizontal cards: date chip + title + 1-line desc + "RSVP →" — Cal.com / iCal feed sync.
43. **`partner-with-us-cta`** — corporate-partnership pitch: "Bring your team for a service day", 3-4 corporate-fit bullets, "Book a tour →" Calendly.
44. **`legacy-gift-cta`** — planned-giving callout: "Leave a legacy", financial-advisor-ready language, link to a dedicated legacy page + EIN + bequest sample language.
45. **`map-find-location-cta`** — physical-address closer: Google Maps Embed of building, hours of operation, "Get directions →" deep-link, transit-line callouts.

## Tier 9 — Specialty / Surprise & Delight (pick 0-1, sparingly)
46. **`founder-letter-handwritten`** — scanned handwritten thank-you note from founder/director, image-based with text alternate, evokes intimacy.
47. **`scroll-tied-illustration`** — single SVG illustration that animates per scroll progress (a building rises, a meal is plated, a tree grows) using scroll-driven CSS animations — luxury craft moment.
48. **`konami-easter-egg-bay`** — visually neutral footer band that hides a Konami-code reveal (confetti + special thank-you message) — pure delight surface, zero functional cost.
49. **`audio-podcast-cluster`** — NotebookLM-generated podcast embedded with chapter markers, 3 episode tiles, persistent player that survives navigation (modal-iframe pattern from music.megabyte.space).
50. **`live-q-and-a-widget`** — embedded chat (Crisp, Intercom, or open-source Tidio alternative) gated by office hours, falls back to "Leave a message" form — pairs with founder-letter for intimate brands.

## Composition Rules (apply per site)
- **Maximum 14 blocks per homepage.** Longer homepages decay; ruthlessly cut to top performers.
- **Always include**: 1 hero, 1 trust, 1 mission, 1 services, 1 impact, 1 action, 1 closer. 7-block minimum.
- **Block order = narrative arc**: hero → trust → problem framing → solution → proof → conversion → closer. Never lead with conversion.
- **Block uniqueness**: never repeat block-type slugs on a single homepage. Variation across the page beats repetition.
- **Mobile collapse rules**: every block must define `mobile`, `tablet`, `desktop` variants. Mobile rarely needs more than 6 blocks visible above the fold-equivalent.
- **Accessibility floor**: every block ships WCAG 2.2 AA, 4.5:1 contrast, full keyboard nav, 24px touch targets, `prefers-reduced-motion` honored.
- **Performance budget per block**: ≤30KB JS gz, ≤15KB CSS gz, ≤200KB media. Hero gets a larger budget (400KB media); blocks below the fold use IntersectionObserver lazy-mount.
- **Citation rule**: any block surfacing a statistic (`stat-block-grid`, `live-impact-ticker`, `year-over-year-chart`, `comparison-table-need-vs-supply`) MUST carry inline `<Citation refId="...">` markers, with the page-level `<PageReferences>` rendering at page bottom. See `09-brand-and-content-system/build-breaking-rules.md` for the references rule.

## Implementation Pattern (per block)
```tsx
// src/components/blocks/<slug>.tsx
export interface <Slug>Props { /* fully typed data prop */ }
export function <Slug>({ data }: { data: <Slug>Props }) { /* … */ }
export const <slug>BlockMeta = {
  slug: '<slug>',
  category: 'hero' | 'trust' | 'problem' | 'services' | 'impact' | 'action' | 'proof' | 'closer' | 'specialty',
  tier: 1-9,
  cssBudgetKbGz: number,
  jsBudgetKbGz: number,
  mediaBudgetKb: number,
  requiresCitations: boolean,
} as const;
```

Per-site homepage definition (`src/data/homepage-blocks.ts`):
```ts
export const homepageBlocks: HomepageBlock[] = [
  { slug: 'hero-impact-counter', props: { /* per-site data */ } },
  { slug: 'accreditation-strip', props: { /* … */ } },
  { slug: 'stat-block-grid', props: { /* … */ } },
  // …
];
```

`<HomepageRenderer blocks={homepageBlocks} />` iterates and dynamic-imports each block lazily.

## Reference
- Brian (2026-05-11): *"what are 50 different types of feature blocks we can add to the homepage of the website that we might want to build into template.projectsites.dev?"* — this file is the canonical answer; new block types append here, never inline elsewhere.
- Pairs with `15-site-generation/template-system.md` (composition engine) + `15-site-generation/build-breaking-rules.md` (block-level quality gates).
