---
name: "experience-and-design-system"
description: "Anti-AI-slop design system for distinctive, premium interfaces. Bold typography (Sora, Space Grotesk, JetBrains Mono), dark-first color system (#060610 bg, #00E5FF cyan), fluid type scale, layout patterns, component design with interaction affordances on everything, and responsive at 375px + 1280px. The Apple Test."
---

# 10 — Experience and Design System

> Design like a top-tier agency. Anti-slop. Bold typography. Premium feel. Every pixel intentional.

---

## Core Principle

**Most AI-generated sites look generic — same layout, same gradients, same feel. Ours must not.** Every design decision should serve clarity, hierarchy, and emotional impact. The test is: would a professional designer ship this?

## Brian's Refinement Direction (from 3,102 conversations, 478 design-specific)

The single most repeated design feedback across all history: **"Make it simpler."**

When iterating on any design:
1. First draft: bold and impactful
2. Every subsequent iteration: remove complexity, not add it
3. If two elements compete for attention: remove one
4. If a section feels crowded: increase whitespace, reduce content
5. If typography feels busy: reduce font sizes, increase weight contrast
6. The final version should feel effortless and inevitable

**"Cooler and catchier"** is the other perpetual request — but always within the constraint of simplicity. Cool ≠ complex. The coolest designs are often the simplest.

## CSS Patterns (extracted from Brian's actual code)

### Verified CSS Values
- Background overlay: `rgba(0, 0, 0, 0.81)` — semi-transparent black over hero images
- Text shadow on dark: `1px 1px 1px rgba(255,255,255,0.333)` for readability
- Box shadow: `2px 2px 2px rgba(0,0,0,0.69)` — subtle depth on cards and hero sections
- Border-radius: `5px` for interactive elements (buttons, inputs), `10px` for content containers
- Never `0` (sharp corners), never fully rounded (pill shape)
- Hero inner padding: `40px`
- Max text width: `720px` (applied to `.hero-description`, `.lead`, newsletter wrappers)
- Line height: `1.4` for body text (his standard)
- Letter-spacing: `0.4px` (labels), `0.5px` (nav), `1px` (titles), `1.4px` (CTAs)
- CTA text-transform: `uppercase` always
- Button font-weight: `700` always (bold for all UI chrome)

### Install Doctor Brand Blue
- `#119eff` — used specifically in Install Doctor contexts (social images, featured graphics)
- This is separate from the main Megabyte Labs brand colors

### Design Quality Benchmarks
- Reference premium SaaS (Linear, Notion, Stripe) for design quality, not consumer apps
- "Pixel-perfect" and "best-in-class" are Brian's quality aspirations
- Brian does design-in-code (CSS), not in Figma — CSS is the source of truth

---

## The Apple Test

After every design implementation, ask:
> If Apple's design team reviewed this page, would they find it acceptable?

Not that we copy Apple — but we match their standard of intentionality, hierarchy, and polish.

---

## Typography System

### Font Stack
| Role | Font | Weight | Use |
|------|------|--------|-----|
| Body | Sora | 400, 500 | Paragraphs, descriptions |
| Headings | Space Grotesk | 600, 700 | h1-h6, nav, buttons |
| Mono | JetBrains Mono | 400, 500 | Code, technical values |
| Display (optional) | Clash Display | 700 | Hero headlines only |

### Typography Scale
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

### Typography Rules
- Body text: minimum 16px (1rem), prefer 18px
- Line height: 1.6 for body, 1.1-1.2 for headings
- Letter spacing: -0.02em for headings > 2rem
- Max line length: 65ch for body text
- Heading hierarchy: h1 → h2 → h3, never skip levels
- Use font-feature-settings where beneficial

---

## Color System

### Dark Theme (Default)
```css
:root {
  --bg-primary: #060610;
  --bg-secondary: #0a0a1a;
  --bg-tertiary: #121225;
  --bg-card: #0f0f1f;
  --bg-elevated: #1a1a35;

  --text-primary: #f0f0f5;
  --text-secondary: #a0a0b5;
  --text-muted: #606080;

  --accent-cyan: #00E5FF;
  --accent-blue: #50AAE3;
  --accent-purple: #8B5CF6;

  --gradient-primary: linear-gradient(135deg, #00E5FF, #50AAE3);
  --gradient-accent: linear-gradient(135deg, #50AAE3, #8B5CF6);

  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-hover: rgba(255, 255, 255, 0.12);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(0, 229, 255, 0.15);
}
```

### Color Rules
- Background never pure black (#000) — use #060610
- Text never pure white (#fff) — use #f0f0f5
- Cyan accent for primary CTAs and active states
- Blue accent for secondary actions and links
- Gradients on buttons and CTAs (not on backgrounds)
- Subtle borders (6% white opacity)
- Glow effects on primary interactive elements (subtle)

---

## Layout System

### Container
```css
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 3rem);
}

.container-wide {
  max-width: 1400px;
}

.container-narrow {
  max-width: 720px;
}
```

### Section Spacing
```css
section {
  padding: clamp(4rem, 8vw, 8rem) 0;
}

section + section {
  border-top: 1px solid var(--border-subtle);
}
```

### Grid System
```css
.grid-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(1.5rem, 3vw, 2.5rem);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### Layout Patterns
- **Hero:** Full-viewport height, centered content, gradient overlay on image
- **Features:** 3-column grid with icon + heading + description
- **Alternating:** Text-left/image-right, then swap (zigzag)
- **Testimonials:** Carousel or 3-column cards
- **Pricing:** 3-tier centered cards with highlighted "popular" option
- **FAQ:** Accordion with smooth expand animation
- **CTA:** Full-width dark section with centered text and button
- **Footer:** 4-column grid with links, collapsing to stack on mobile

---

## Component Design

### Cards
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: clamp(1.5rem, 3vw, 2rem);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
}
```

### Buttons
```css
.btn-primary {
  background: var(--gradient-primary);
  color: #060610;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary:active { transform: scale(0.98); }
.btn-primary:focus-visible {
  outline: 3px solid var(--accent-cyan);
  outline-offset: 2px;
}

.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  /* same padding, radius, cursor, transitions */
}

.btn-secondary:hover {
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}
```

### Navigation
```css
nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(6, 6, 16, 0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 1rem 0;
}
```

### Forms
```css
input, textarea, select {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  font-family: 'Sora', sans-serif;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  border-color: var(--accent-cyan);
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
}
```

---

## Interaction Affordances

### Every Interactive Element MUST Have
- `cursor: pointer` (buttons, links, cards with actions)
- Hover state (color change, border change, or subtle transform)
- Focus-visible ring (3px solid cyan, 2px offset)
- Active state (scale 0.98 or opacity change)
- Transition (0.2s ease for color/opacity, 0.1s for transform)

### Affordance Checklist
```
[ ] Buttons: hover + active + focus-visible
[ ] Links: hover color + underline behavior
[ ] Cards: hover border or shadow
[ ] Nav items: hover + active indicator
[ ] Form inputs: focus border + shadow
[ ] Checkboxes/radios: custom styled with transitions
[ ] Dropdowns: hover + focus states
[ ] Toggles: smooth slide animation
```

---

## Responsive Design

### Breakpoints
```css
/* Mobile first */
@media (min-width: 640px) { /* sm: tablets */ }
@media (min-width: 768px) { /* md: small laptops */ }
@media (min-width: 1024px) { /* lg: laptops */ }
@media (min-width: 1280px) { /* xl: desktops */ }
```

### Mobile Requirements (375px)
- No horizontal scroll
- Touch targets minimum 44x44px
- Text readable without zooming
- Navigation collapses to hamburger
- Full-width buttons on mobile
- Adequate spacing between elements
- No text truncation

### Desktop Requirements (1280px)
- Content centered with max-width
- Multi-column layouts active
- Hover states visible
- Adequate whitespace
- No excessively wide text lines (65ch max)

---

## Anti-Slop Design Rules

### Never Do
- Default Bootstrap/Tailwind look without customization
- Generic gradient backgrounds (purple-to-pink)
- Stock photography without curation
- Same-weight text everywhere
- Centered everything with no visual hierarchy
- Excessive rounded corners (> 16px on large elements)
- Rainbow gradient text
- "AI-generated" feeling (too perfect, too generic)
- Light gray text on white backgrounds
- Placeholder avatars

### Always Do
- Create clear visual hierarchy with type scale and weight
- Use color sparingly and intentionally
- Make the page scannable in 3 seconds
- Give every section a distinct visual treatment
- Use whitespace to create breathing room
- Test at real breakpoints (375px, 1280px)
- Make the footer as polished as the hero

---

## Trigger Conditions
- New project design
- UI changes or additions
- Visual quality concerns
- Responsive issues
- Design system updates

## Stop Conditions
- Passes the Apple Test
- No visual issues at 375px and 1280px
- All interaction states implemented
- Accessibility requirements met

## Cross-Skill Dependencies
- **Reads from:** 09-brand-and-content (brand identity, copy), 04-preference-and-memory (design preferences)
- **Feeds into:** 11-motion-and-interaction (what to animate), 07-quality-and-verification (visual QA), 06-build-and-slice-loop (design implementation)

---

## What This Skill Owns
- Typography system and scale
- Color system and palettes
- Layout patterns and grid
- Component design and styling
- Interaction affordances
- Responsive design rules
- Anti-slop design enforcement
- Empty states and loading patterns (see 06/empty-states for full patterns)
- Skeleton screens for all dynamic content
- See STYLE_GUIDES.md for Material Design + CUBE CSS

## What This Skill Must Never Own
- Copy and content (→ 09)
- Animation and transitions (→ 11)
- Image/video creation (→ 12)
- Code implementation (→ 06)
- Testing (→ 07)

---

## Research-Backed Design Intelligence (2026 Sources)

### Anti-AI-Slop Principles (Source: 925 Studios)
Most AI-generated sites use the same fonts (Inter), same gradients, same layouts. To escape this:
1. **Bespoke typography** — use distinctive headline fonts, never ship Inter alone
2. **Semantic color** — name colors by function (`--color-action`) not aesthetics (`--color-blue`)
3. **Intentional spacing hierarchy** — featured cards get more padding than secondary cards
4. **Restraint over excess** — fewer design choices, each intentional (Linear, Notion, Stripe approach)
5. **Purposeful motion** — every animation must communicate state, direct attention, or reinforce brand

### SaaS Landing Page Conversion (Source: Veza Digital, CXL Institute)
- Single-CTA pages convert at **13.5%** vs 10.5% for multi-CTA (median SaaS: 3.8%)
- Optimal section sequence: Hero → Social Proof → Features → Demo → Testimonials → Pricing → FAQ → CTA
- 5th-7th grade reading level yields **12.9% conversion** vs 2.1% for complex copy
- Interactive product demos on-page increase conversion significantly vs static screenshots

### Bento Grid Layout (Source: SaaSFrame, Apple)
3-column CSS grid with `.featured` spanning 2 cols + 2 rows. Modular, self-contained feature cards: icon + short copy + micro-animation. Reduces cognitive load.

### Semantic Color Naming (Source: Webflow Trends 2026)
Name colors by function, not aesthetics: `--color-action` (CTAs), `--color-energy` (urgency), `--color-calm` (secondary), `--color-success`, `--color-warning`. Maps to brand palette defined in Color System above.

### Organic Layouts (Source: Gatitaa, Figma)
Break rigid 12-column grids with overlapping elements, asymmetric placement, and `grid-template-areas` + negative margins. Feels human-designed, not AI-templated.

### The TL;DR Experience (Source: Webflow Trends 2026)
Complete summary/pitch-deck above the fold with expandable sections below. Users who "get it" fast convert faster.

### Design Psychology (04/wisdom — Wisdom Applied)

**Golden Ratio Spacing (Da Vinci, Fibonacci):**
```css
:root {
  --space-xs: 0.382rem;  --space-sm: 0.618rem;  --space-md: 1rem;
  --space-lg: 1.618rem;  --space-xl: 2.618rem;  --space-2xl: 4.236rem;
}
```
Mathematically harmonious spacing that humans find inherently pleasing.

**Gestalt Principles:**
- Proximity: related elements close together (label near input, CTA near value prop)
- Similarity: consistent styling signals grouping (all cards same style)
- Figure/Ground: CTAs must pop from background (gradient button on dark bg)
- Continuity: eye follows visual flow from hero → features → CTA

**Hick's Law:** Time to decide increases with options. Max 7 items per navigation. 3 pricing tiers, not 5. One primary CTA per section.

**Miller's Law:** Working memory holds 7 (plus or minus 2) items. Feature sections: 3-6 cards. Navigation: 5-7 items. Form fields: minimize.

**Simplicity is Mastery (Lao Tzu, Steve Jobs):** The best interface is invisible. Every element must earn its place. If removing something doesn't hurt the experience, it shouldn't be there.

---

### Enhancement: INP Optimization (Source: web.dev, April 2026)

INP is a Core Web Vital. Target: under 200ms at p75.

**Key techniques:**
1. **Break up event callbacks** — only the visual update blocks the main thread; defer analytics/cache to `setTimeout(fn, 0)`
2. **`content-visibility: auto`** on below-fold sections (with `contain-intrinsic-size`) to skip rendering off-screen content
3. **Batch DOM reads then writes** — never interleave reads/writes (causes forced synchronous layout). Use `requestAnimationFrame` for write batches
4. **Keep DOM small** — target under 1,500 nodes. Use virtual scrolling for long lists
5. **Throttle high-frequency handlers** — `requestAnimationFrame` gate for scroll/resize handlers

---

### Enhancement: "Handmade" Anti-AI-Slop (Source: NNGroup, April 2026)

NNGroup confirms AI-fatigued users prefer human-crafted designs. Techniques: intentional asymmetry, custom icons/dividers, mixed serif/sans on display text, real photography over generic AI stock, bespoke micro-interactions, visible craft details (custom cursor, unique scrollbar).

**The rule:** If a design could have been produced by typing "make me a modern website" into any AI builder, it fails.
