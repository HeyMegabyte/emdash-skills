---
name: "experience-and-design-system"
version: "2.1.0"
updated: "2026-04-23"
description: "Anti-AI-slop design system for distinctive, premium interfaces. Bold typography, dark-first #060610, fluid clamp() type, cascade layers + native nesting + container queries, OKLCH color, @starting-style, View Transitions API, DTCG tokens."
submodules:
  - design-tokens.md
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
Native nesting (Sass now optional). Container queries (`container-type:inline-size`, `@container`). `:has()` parent selector replaces JS. `@scope` for bounded styling. Anchor positioning for tooltips/dropdowns without JS. CSS `if()` conditional logic. Typed `attr()`. `sibling-index()`/`sibling-count()` for stagger delays: `transition-delay: calc((sibling-index() - 1) * 40ms)`. `appearance:base-select` for native `<select>` customization (Chrome 135+). Feature queries (`@supports`) for progressive enhancement.

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

## Motion (CSS-Native 2026)
View Transitions API (baseline all browsers Oct 2025): `@view-transition { navigation: auto; }` for full-page. Named: `view-transition-name: match-element` (Chrome 137+) auto-assigns from element identity — no manual names for list items. Nested groups (Chrome 140+) for clipping/3D. `<300ms total. Scroll-driven: `animation-timeline: scroll(root block)` | `animation-timeline: view()`, off main thread, `animation-range: entry 0% cover 50%`. `@starting-style` for DOM-insert animations (modals, toasts, drawers) — replaces JS add-class-on-mount. Container scroll-state: `@container scroll-state(stuck: top)` for sticky headers, `@container scroll-state(snapped: x)` for carousels. `::scroll-button()` / `::scroll-marker` for scroll UI (Chrome 135+). `prefers-reduced-motion` on ALL animations (mandatory — see skill 11).

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
