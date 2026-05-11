---
name: "experience-and-design-system"
description: "Anti-AI-slop design system for distinctive, premium interfaces. Bold typography, dark-first #060610, fluid clamp() type, cascade layers + native nesting + container queries, OKLCH color, @starting-style, View Transitions API, DTCG tokens."
metadata:
  version: "2.1.0"
  updated: "2026-05-03"
  effort: "high"
  model: "opus"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - design-tokens.md
  - build-breaking-rules.md
  - cinematic-doctrine.md
---

# 10 — Experience and Design System

## The Apple Test
After every design: would Apple's design team find this acceptable? Two elements compete: remove one. Crowded: whitespace. Busy type: reduce sizes, increase weight contrast. Final: effortless, inevitable. "Cooler and catchier" within simplicity.

## CSS Patterns (Brian's code)
Overlay: rgba(0,0,0,0.81). Text shadow: 1px 1px 1px rgba(255,255,255,0.333). Box shadow: 2px 2px 2px rgba(0,0,0,0.69). Border-radius: 5px interactive, 10px containers (never 0, never pill). Hero padding: 40px. Max text: 720px. Line-height: 1.4. Letter-spacing: 0.4px labels, 0.5px nav, 1px titles, 1.4px CTAs. CTA: uppercase always. Button: 700 always. Install Doctor blue: #119eff. Reference: Linear, Notion, Stripe.

## Typography
Body: Sora 400/500. Headings: Space Grotesk 600/700. Mono: JetBrains Mono 400/500. Display: Clash Display 700 (hero only). Variable fonts: WOFF2, subset to needed chars, self-host (never Google Fonts CDN), font-display:swap. Restrain axes to weight+width only.

```css
:root {
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1rem + 1.25vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.1rem + 2vw, 2rem);
  --text-3xl: clamp(2rem, 1.5rem + 2.5vw, 3rem);
  --text-4xl: clamp(2.5rem, 1.5rem + 5vw, 4.5rem);
  --text-hero: clamp(3rem, 2rem + 5vw, 6rem);
}
```
Body min 16px (prefer 18). Line-height: 1.6 body (or `calc(2px + 2ex + 2px)` for proportional), 1.1-1.2 headings. Letter-spacing: -0.02em >2rem. Max: 65ch. Never skip levels. Scale ratio: Minor Third 1.2 general, Perfect Fourth 1.333 marketing. `text-wrap:balance` headings, `text-wrap:pretty` paragraphs.

## Color (Dark Default)
```css
:root {
  color-scheme: light dark;
  --bg-primary: #060610; --bg-secondary: #0a0a1a; --bg-tertiary: #121225;
  --bg-card: #0f0f1f; --bg-elevated: #1a1a35;
  --text-primary: #f0f0f5; --text-secondary: #a0a0b5; --text-muted: #606080;
  --accent-cyan: #00E5FF; --accent-blue: #50AAE3; --accent-purple: #8B5CF6;
  --gradient-primary: linear-gradient(135deg, #00E5FF, #50AAE3);
  --gradient-accent: linear-gradient(135deg, #50AAE3, #8B5CF6);
  --border-subtle: rgba(255,255,255,0.06); --border-hover: rgba(255,255,255,0.12);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3); --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5); --shadow-glow: 0 0 20px rgba(0,229,255,0.15);
}
```
Never #000 (use #060610 — pure black causes visual vibration, halation, eye strain). Never #fff (use #f0f0f5). Cyan: primary CTAs. Blue: secondary. Gradients on buttons only. 6% borders. Subtle glow on primary interactive.
Dark-first architecture: elevation via lightness not shadows. Background hierarchy: base->surface 1->surface 2->surface 3. Text hierarchy: primary->secondary->tertiary. Status colors: desaturate 10-20% from light-mode equivalents. Sans-serif fonts perform best in dark mode; use `-webkit-font-smoothing:antialiased` to mitigate halo effects.
Theme implementation: `color-scheme:light dark` declaration, `data-theme="dark|light"` attributes for user override, `localStorage` for persistence, `prefers-color-scheme` as system default. Always provide toggle.
Modern color: OKLCH perceptually uniform, `color-mix()` for blending without precomputed palettes, relative colors `oklch(from var(--brand) l c calc(h + 30))`, `light-dark()` for theme-aware values. Contrast: 4.5:1 normal text, 3:1 large text/UI components (WCAG 2.2 AA). Target size minimum 24x24 CSS px (2.5.8). Focus indicators 2px thick, 3:1 contrast (2.4.13).

## CSS Architecture (2026)
```css
/* Cascade layers: declare order at top, specificity ignored across layers */
@layer reset, base, tokens, components, utilities, overrides;
```
Native nesting (Sass now optional). Container queries (`container-type:inline-size`, `@container`). `:has()` parent selector replaces JS. `@scope` for bounded styling (Baseline 2026 — production-ready). Anchor positioning for tooltips/dropdowns without JS (Baseline 2026 — production-ready, replaces Floating UI). Scroll-state container queries: `@container scroll-state(stuck: top)` (Baseline 2026). CSS `if()` conditional logic. Typed `attr()`. `sibling-index()`/`sibling-count()` for stagger delays: `transition-delay: calc((sibling-index() - 1) * 40ms)`. `appearance:base-select` for native `<select>` customization (Chrome 135+). Feature queries (`@supports`) for progressive enhancement.
**Baseline 2026 (newly interoperable):** `@scope` bounded styling | anchor positioning (CSS Anchor Positioning) | scroll-state queries | `@starting-style` (all browsers) | `interpolate-size: allow-keywords` for animating `auto` | `field-sizing: content` for auto-sizing inputs | `text-wrap: pretty` (all browsers) | `@property` (typed custom properties, all browsers).

## W3C DTCG Design Tokens (2025.10 Stable)
JSON format, `.tokens`/`.tokens.json` extensions, MIME: `application/design-tokens+json`. Token structure: `$value` (required), `$type`, `$description`, `$deprecated`, `$extensions` (vendor). Types: color|dimension|duration|fontFamily|fontWeight|cubicBezier|number + composites (shadow, border, gradient, typography, transition). Aliasing: `"$value": "{base.color}"` resolves to target. `$ref` JSON Pointer for property access. Group `$type` inheritance to children. `$root` for base+variants, `$extends` for deep merge. Full Display P3, OKLCH, CSS Color Module 4. Naming: no `$` prefix, no `{}`/`.` in names. Multi-brand theming without file duplication. Tools: Tokens Studio, Style Dictionary, Penpot, Figma.

## AI-Ready Design Documentation
DESIGN.md: plain-text markdown optimized for LLM consumption. Sections: Visual Theme, Color Palette, Typography, Spacing+Layout, Components, Elevation. Atomic documentation: small context-rich units tied to components. Consistent naming across Figma/docs/code. Component metadata: states, variants, props, constraints, a11y attributes, rationale. MCP servers (Figma Dev Mode MCP) for standardized programmatic access. Token APIs queryable by AI tools.

## Layout
Container: 1140px (wide 1400, narrow 720), padding clamp(1rem,3vw,3rem). Sections: clamp(4rem,8vw,8rem), border between. Grid: auto-fit minmax(280px,1fr), 1fr at 768px.
Patterns: Hero (full-viewport, centered), Features (3-col icon+heading+desc), Alternating (zigzag), Pricing (3-tier highlighted), FAQ (accordion), CTA (full-width dark), Footer (4-col stack). SaaS: single-CTA 13.5%, Hero/Proof/Features/Demo/Testimonials/Pricing/FAQ/CTA. Bento grid for feature showcases.

## Components
Cards: bg-card, border-subtle, 12px radius, hover: border-hover+shadow-glow. Buttons: Primary gradient #060610 text, 600 weight, 8px radius, hover 0.9, active scale(0.98), focus 3px cyan. Secondary: transparent, border, hover cyan. Nav: sticky, rgba(6,6,16,0.85), blur(16px). Forms: bg-secondary, border-subtle, 8px, focus cyan+glow. PrimeNG: standalone imports (not NgModule), OnPush on all, lazy-load heavy components (DataTable, Editor, Chart), design tokens for theming integration.

## Interaction Affordances (EVERY interactive element)
cursor:pointer, hover state, focus-visible (3px cyan, 2px offset), active (scale 0.98), transition (0.2s color, 0.1s transform). WCAG 2.2: min 24x24px targets, focus not obscured by sticky headers, dragging alternatives required, accessible auth (support password managers).
**4-state distinction (NON-NEGOTIABLE):** every link/button/card MUST visually differ across `:default | :hover | :focus-visible | :active` — NEVER let two states look identical. Default→neutral; hover→underline-sweep + color shift + translateY(-1px); focus-visible→3px cyan ring 2px offset (distinct from hover, never same shade); active→scale(0.98) + immediate color confirm. Audit gate: Playwright cycles each interactive element through all 4 states and screenshots → diff must be ≥3px pixel-difference between adjacent states or fail.
**Underline-sweep (text links default — ***CANONICAL `::after` 51%→0 PATTERN***):** every body+heading `<a>` MUST use the `.underline-hover` ::after sweep collapsing from center outward — `.underline-hover{position:relative} .underline-hover::after{content:"";position:absolute;z-index:1;left:51%;right:51%;bottom:0;background:var(--brand-accent);height:1px;transition:left .3s ease-out,right .3s ease-out} .underline-hover:hover::after,.underline-hover:focus-visible::after{left:0;right:0}`. Brand-accent color = the theme's primary (`var(--brand-accent)` / `var(--c-capacitor-blue)` / theme equivalent — never hard-coded #hex). Reference: rebuild of express-heyo-ellicott-city (2026-05-02) where plain `text-decoration:underline` on hover read as a jarring jump-cut. Background-image-gradient sweep variant accepted ONLY when wrapping multi-line text where `::after` would clip — never as default. NEVER plain `text-decoration: underline` on hover.
**Tile-as-link rule (NON-NEGOTIABLE):** every card / tile / feature box that visually communicates "click me" (cursor:pointer, hover lift, hover border-glow) MUST be wrapped in `<a>` or `<button>` and route somewhere. NEVER decorative-only hover affordances on non-clickable tiles — that's a UX lie. If the tile has nowhere to go, remove the hover lift + cursor:pointer. If the tile SHOULD go somewhere (service detail, team bio, blog post), build that route. Audit gate: grep dist for `[class*="card"]:hover` rules → assert each card root resolves to `<a href>` or `<button onclick>` or fail.
**Image hover NEVER changes layout (***NON-NEGOTIABLE — flicker/shift root cause***):** `<img>`, `<picture>`, `<svg>`, and any element rendering raster/vector media MUST NOT change `border`, `outline`, `padding`, `margin`, `width`, `height`, `border-width`, or any layout-affecting property on `:hover` / `:focus`. Adding 1px outline/border on hover causes a 1px reflow → visible white-line flicker around the image bbox (the FedEx-ShipCenter incident on express-heyo-ellicott-city, 2026-05-02). Allowed hover effects on media: `transform: scale(1.02)` (compositor-only) | `filter: brightness(1.05)` / `filter: saturate(1.1)` | `box-shadow: 0 12px 32px rgba(0,0,0,.25)` (paint-only, doesn't reflow) | `opacity` shift on overlay sibling, NEVER on the image itself if a parent uses backdrop-filter. If a "border on hover" look is required, render it via `box-shadow: inset 0 0 0 2px var(--brand-accent)` (paints inside the image's existing bbox, zero reflow) OR via a sibling `::after` element absolute-positioned over the image with `pointer-events:none`. Audit gate: Playwright triggers `:hover` on every `<img>` + screenshot diffs the 4-pixel border ring vs the default state — any pixel-shift outside the image's nominal bbox = fail.
**Decorative pseudo positioning (::before/::after):** ALL `::before` and `::after` pseudo-elements that decorate a parent MUST set `position: absolute` AND parent MUST have `position: relative`. NEVER `position: static` pseudo with `top:`/`left:` values — they get ignored, resulting in misplaced glows/badges/numbers. Audit gate: regex `::(before|after)\s*\{[^}]*?(top|left|right|bottom):[^}]*\}` in dist CSS → corresponding selector resolves to `position: absolute` or fail.
**Address→Google Maps (NON-NEGOTIABLE for local biz):** every street-address rendering MUST be a clickable `<a href="https://www.google.com/maps/dir/?api=1&destination={url-encoded-address}" target="_blank" rel="noopener">` (directions, NOT search). On mobile, also offer `geo:` URI fallback. Pair with a static map preview (Google Static Maps API) thumbnail beside the address for visual anchor. NEVER plain text addresses — they fail the local-business "contact in 1 tap" test.
**Legal/utility page consistency (NON-NEGOTIABLE):** `/privacy`, `/terms`, `/accessibility`, `/cookies`, `/sitemap`, `/404`, `/500` MUST inherit the SAME header + footer + nav + brand tokens as the marketing pages. NEVER ship a legal page with default Tailwind styles or unstyled prose. Apply `<Layout>` wrapper. Body text uses `--font-body` not `font-family: serif`. Headings use `--font-heading`. Brand colors. Same max-width container. Audit gate: Playwright loads `/privacy` → asserts presence of `<header data-site-header>` + `<footer data-site-footer>` + computed `font-family` matches body copy on home page or fail.

## Motion (CSS-Native 2026)
View Transitions API (baseline all browsers Oct 2025): `@view-transition { navigation: auto; }` for full-page. Named: `view-transition-name: match-element` (Chrome 137+) auto-assigns from element identity — no manual names for list items. Nested groups (Chrome 140+) for clipping/3D. `<300ms total. Scroll-driven: `animation-timeline: scroll(root block)` | `animation-timeline: view()`, off main thread, `animation-range: entry 0% cover 50%`. `@starting-style` for DOM-insert animations (modals, toasts, drawers) — replaces JS add-class-on-mount. Container scroll-state: `@container scroll-state(stuck: top)` for sticky headers, `@container scroll-state(snapped: x)` for carousels. `::scroll-button()` / `::scroll-marker` for scroll UI (Chrome 135+). `prefers-reduced-motion` on ALL animations (mandatory — see skill 11).

## Local Business Design Patterns (***SITE GENERATION***)

Local business sites have fundamentally different design needs than SaaS. These patterns are NON-NEGOTIABLE for all generated local business sites:

**Hero:** Full-viewport REAL business photo (never abstract gradient). Dark overlay 55-65% opacity. Business name in brand heading font at `--text-hero` scale. Tagline/specialty below. Twin CTAs: "Call Now" (primary, `tel:` link, phone icon) + "Get Directions" (secondary, Maps link, map-pin icon). Rating badge overlay (Google stars + "X reviews"). On mobile: CTAs full-width stacked, rating moves above CTAs.

**Hero Text Contrast Scrim (***UNIVERSAL — BUILD-BREAKING — every hero on every site type***):** hero/page-banner backgrounds (image, video, gradient) MUST guarantee ≥4.5:1 contrast for ALL hero text via mandatory scrim overlay. NEVER ship hero text directly on raw image. Pattern: `.hero{position:relative;isolation:isolate} .hero::before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.65) 100%)} .hero > .hero-content{position:relative;z-index:2}`. For dark text on light/bright bg, invert: `linear-gradient(180deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,.75) 100%)`. Scrim opacity tuned per bg luminance (compute via Playwright pixel sample of hero bg pre-build): bright bg luminance>0.7 = 55-70% scrim|mid bg 0.3-0.7 = 35-50% scrim|dark bg <0.3 = 25-35% scrim. Companion belt-and-suspenders: `text-shadow: 0 1px 3px rgba(0,0,0,.5)` on hero h1+subhead for dark text scrims, inverse for light. Validator: visual-qa samples hero text computed-color + computed-bg-after-scrim (post-render Playwright canvas pixel sample under text bbox) at 6bp, fails if contrast<4.5:1. The lone-mountain-global-3 (2026-05-01) hero rendered text on insufficiently-darkened bg drove this rule. Cross-ref always.md "Every hero" + skill 09 logo-vs-container contrast.

**Sticky Mobile CTA Bar:** Fixed bottom, 56px height, brand-primary bg. Phone icon + "Call Now" centered. `position:fixed; bottom:0; z-index:50`. Hides when footer in viewport (IntersectionObserver). Touch target 44px+. This is THE highest-converting element on local business sites — 60%+ of mobile conversions come from sticky CTAs.

**Service Cards Section:** Auto-fill grid from research data. Each card: relevant image (from `_image_profiles.json` keyword match), service name, 2-line description, price range (if available), "Learn More" or "Book Now" CTA. Glassmorphism style: `bg-white/5 backdrop-blur-md border border-white/10`. 3-col desktop, 1-col mobile with horizontal scroll peek.

**Google Maps Integration (route-conditional — see skill 15 §Quality Bar(2) + template-system.md `<FullWidthMap>`/`<StylizedMap>`):** Two patterns ship in template, never both on same route. (a) `<MapEmbed>` — dark-styled iframe within container (`max-w-*` wrapper, `&style=feature:all|element:geometry|color:0x212121`), used in home/about/services contact-strip — sidebar wide / stacked narrow via container queries. (b) `<FullWidthMap>` — viewport-bleed iframe (100% width, 560px height, `loading="lazy"`, `referrerpolicy="no-referrer-when-downgrade"`, breaks out of `max-w-*`) MANDATORY on dedicated `/contact` AND `/mass-schedule` (or equivalent location pages) — those routes exist for one reason: directions, so the map IS the page. (c) `<StylizedMap>` — hand-drawn brand-color SVG of neighborhood/region (no iframe, no LCP cost) for home hero overlay, footer mini-map, section thumbnails. Below ANY map variant: `<AddressBlock size='lg'>` (hyperlinked per always.md) + hours grid (today highlighted brand-primary) + `<TelLink>` + `<MailLink>`. NEVER plain-text addresses adjacent to maps.

**Mega-Menu Hover-Bridge + Triangle-Aim (***UNIVERSAL — desktop hover-driven nav — BUILD-BREAKING — njsk-light 2026-05-02***):** every desktop nav with multi-column dropdown/mega-menu MUST implement hover-bridge + triangle-aim algorithm so menu does NOT close when cursor traverses the gap from trigger to panel. CSS hover-bridge fills gap: `.mega-menu-panel{position:absolute;top:calc(100% + 12px);left:0} .mega-menu-panel::before{content:"";position:absolute;top:-12px;left:0;right:0;height:12px;pointer-events:auto}` (invisible 12px corridor matches gap to trigger). JS triangle-aim (Bostock 2013 algorithm): track last 3 `mousemove` positions on document; on each move, compute vector from cursor → bottom-left + bottom-right of currently-open panel; if cursor lies INSIDE the triangle defined by `[lastCursorPos, panelBottomLeft, panelBottomRight]` AND velocity-direction points toward panel, delay close 300ms (user is aiming AT panel diagonally — preserve open state); if OUTSIDE triangle, close 150ms. Open-delay 100ms (intent confirmation, prevents accidental opens on mouse-passthrough). Touch (`@media (pointer:coarse)`): tap-to-open + tap-outside-to-close, NO hover bridge, NO triangle algorithm. Keyboard: Enter/Space opens panel + focuses first link, Esc closes + returns focus to trigger, Arrow keys navigate items within panel, Tab cycles to next trigger. Reduced-motion: skip open/close animations, instant show/hide. Template ships `<MegaMenu>` component implementing all of above — never hand-rolled per site. Validator: `validate-mega-menu-hover.mjs` (skill 15 quality-gates).

**Trust Section:** Horizontal badge row immediately after hero. Google rating (star SVG + number + "X reviews"), BBB rating, industry certs, "Licensed & Insured", years in business counter. Subtle bg-secondary band. This section builds instant credibility — local customers check these first.

**Testimonials:** Google Places reviews displayed as cards. Star rating (brand-colored fill), reviewer name, date, text (truncated 150 chars with "Read more on Google →"). Carousel on mobile, grid on desktop. Min 3 reviews or fallback to review CTA.

**Gallery:** Masonry grid of ALL business photos. Full-bleed section, no side padding. Lightbox on click. Lazy-loaded. Caption from image profiles. This section should feel like walking into the business — immersive and media-rich. Min 12 images visible without scrolling.

**NAP Footer:** Business name + logo, full address (Google Maps deep link), phone (`tel:`), email (`mailto:`), hours (collapsible accordion on mobile), social icons. MUST match JSON-LD exactly — divergence hurts rankings. This is the canonical source; header phone/address link to this section.

**Before/After (optional):** CSS slider (`<input type="range">`) showing transformation (salons, contractors, auto body, landscaping). Dramatic visual proof of service quality. Uses actual client photos from Places/uploads.

**Booking Integration:** If `_research.json.operations.booking_url` exists: prominent "Book Online" CTA in hero + nav + floating button. Embeds or links to: OpenTable (restaurant), Calendly/Acuity (professional), Vagaro/Booksy (salon), Mindbody (fitness). Never build custom booking — link to what they already use.

## Responsive
Mobile 375px: no h-scroll, 44px targets, readable, hamburger, full-width buttons. Desktop 1280px: centered, multi-column, hover states, 65ch max. 6 breakpoints: 375,390,768,1024,1280,1920.

## Anti-Slop
Never: default Bootstrap/Tailwind, Inter/Poppins font, generic purple-blue gradients, uncurated stock, same-weight text, centered-everything, >16px radius, rainbow text, "AI feel", gray on white, uniform fade-in, shadcn defaults, vague headlines ("Build the future").
Always: hierarchy via scale+weight, sparse color, scannable 3s, distinct sections, whitespace, custom typography (never default AI fonts), semantic color naming (--color-action not --color-gradient-start), purposeful motion (each animation serves state/attention/brand), real photography over AI illustrations, test 375+1280, polished footer.
Anti-AI (NNGroup 2026): asymmetry, custom icons, mixed serif/sans, bespoke micro-interactions. If "make me a modern website" could produce it, it fails.

## Accessibility (WCAG 2.2 AA Baseline)
Focus Appearance: 2px thick, 3:1 contrast. Focus Not Obscured: never hidden by sticky headers. Target Size: min 24x24px (44px touch). Dragging: single-pointer alternative for all drag-and-drop. Consistent Help: same relative order across pages. Redundant Entry: never require same info twice. Accessible Auth: support password managers/autofill/biometrics.
WCAG 3.0 (Working Draft March 2026, est. 2028-2030): 174 requirements, no A/AA/AAA levels, covers touch/gesture/voice/VR/AR.
axe-core: 0 violations, covers WCAG 2.0/2.1/2.2 + Section 508 + ADA. Detects ~57% automatically, zero false positives.

## Research Intelligence
Design psychology: golden ratio spacing (0.382rem..4.236rem), Gestalt (proximity, similarity, figure/ground), Hick's (max 7 nav, 3 pricing), Miller's (3-6 cards).
INP: <200ms p75. Break callbacks via scheduler.yield(), content-visibility:auto, batch DOM, <1500 nodes, CSS containment `contain:layout style paint`. transform+opacity only for 60fps.
Performance: variable fonts (one WOFF2 replaces 4+ static files, 80% fewer requests), CSS clamp() eliminates media queries for type, container queries replace many @media, `:has()` replaces JS for parent-based styling. Preprocessors now optional (CSS has variables, nesting, math, color functions).
Stats: human-written content outperforms AI 94% of the time. 40-62% AI-generated code has security/design flaws. Poor design drives 38% of visitors away. 25% conversion increase with good CWV.
