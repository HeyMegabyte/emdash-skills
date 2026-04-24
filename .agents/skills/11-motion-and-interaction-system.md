---
name: "motion-and-interaction-system"
description: "Meaning-first animation with 3-tier hierarchy. CSS scroll-driven (animation-timeline: scroll()), View Transitions API, @starting-style DOM-insert, container scroll-state queries, prefers-reduced-motion mandatory on all animations."
metadata:
  version: "2.1.0"
  updated: "2026-04-23"
---

# 11 — Motion and Interaction System

## Motion Hierarchy
**Tier 1 (always):** Page transitions, loading/skeleton, form validation, success/error, nav hover, smooth scroll, accordion, modal, tooltip.
**Tier 2 (usually):** Scroll-reveal, hover enhancements, staggered reveals, counters, progress, subtle parallax.
**Tier 3 (when appropriate):** CTA micro-interactions, confetti, animated illustrations, ambient motion, easter eggs.
Anti-slop: each animation serves one purpose — state change, attention direction, or brand reinforcement. Uniform fade-in on everything = red flag.

## Transition Grammar
```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```
Micro 100-150ms | Short 200-250ms | Medium 300-400ms | Long 500-700ms | Extended 800-1200ms. If in doubt: 200ms.

## CSS Scroll-Driven Animations (Chrome/Edge/Safari 26+ — off main thread)
```css
/* Tied to scroll position */
.progress-bar { animation: grow-width linear; animation-timeline: scroll(root block); }

/* Tied to element visibility */
.reveal {
  animation: slide-up linear both;
  animation-timeline: view();
  animation-range: entry 0% cover 50%;
}

/* Named timeline for cross-element sync */
.scroller { scroll-timeline: --page block; }
.synced { animation-timeline: --page; }

/* Firefox fallback (no native scroll-driven yet) */
@supports not (animation-timeline: scroll()) {
  .reveal { opacity: 1; transform: none; }
}
```
Stagger via `sibling-index()` (Chrome 129+): `.item { transition-delay: calc((sibling-index() - 1) * 80ms); }`. IntersectionObserver only when scroll-driven CSS is insufficient.

## @starting-style — Enter Animations
```css
.toast {
  opacity: 1; transform: translateY(0);
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
  @starting-style { opacity: 0; transform: translateY(20px); }
}
.modal[open] {
  opacity: 1; scale: 1;
  @starting-style { opacity: 0; scale: 0.95; }
}
```
Use for: modals, toasts, tooltips, drawers — anything inserted into DOM. Replaces JS add-class-on-mount patterns.

## Container Scroll-State Queries
```css
.header { container-type: scroll-state; }
@container scroll-state(stuck: top) {
  .header { box-shadow: 0 2px 8px rgba(0,0,0,0.15); backdrop-filter: blur(12px); }
}
.carousel { container-type: scroll-state; }
@container scroll-state(snapped: x) { .slide { scale: 1.02; } }
```
States: `stuck` | `snapped` | `scrollable` | `scrolled`. No JS sticky detection needed.

## View Transitions (Baseline Newly Available — Oct 2025)
```css
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: fade-out 0.25s var(--ease-out); }
::view-transition-new(root) { animation: fade-in 0.25s var(--ease-out); }

/* Shared elements */
.card { view-transition-name: match-element; view-transition-class: card; }
::view-transition-group(.card) { animation-duration: 0.35s; }
```
`view-transition-name: match-element` (Chrome 137+) auto-names from identity — no manual names for list items. Nested groups (Chrome 140+) for clipping/3D. `element.startViewTransition()` for subtree-scoped (Chrome 140 experimental). <300ms total. Fade safe; slide for hierarchical nav only. Prerender: `<script type="speculationrules">{"prerender":[{"where":{"href_matches":"/details/*"}}]}</script>`

## Hover / Focus / Active
All interactive: `transition: color 0.2s, background 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.1s`. Button hover: `translateY(-1px)`. Active: `scale(0.98)`. Card: border-hover + shadow-glow + `translateY(-2px)`. Focus-visible: 3px cyan, 2px offset, no focus for mouse users.

## Loading
Skeleton: shimmer gradient 1.5s infinite. Spinner: 20px, cyan top border, 0.6s spin. Always reserve space with `aspect-ratio` or min-height — zero CLS.

## Reduced Motion (MANDATORY — every animation)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  [data-animate] { opacity: 1 !important; transform: none !important; }
}
```
CSS `if()` alternative: `transition-duration: if(media(prefers-reduced-motion: reduce), 0s, 0.3s);`

## Performance
Only `transform` + `opacity`. Never width/height/margin/top/left. `will-change` sparingly, remove after animation ends. Max 10 simultaneous. Test 4× CPU throttle. JS scroll listeners banned — use CSS scroll-driven or IntersectionObserver. DOM <1500 nodes. `scheduler.yield()` / `setTimeout` for INP chunking.

## Motion by Section
Hero: fade 400ms, stagger CTA 200ms. Features: scroll-driven reveal, stagger 80ms. Stats: counter on view() timeline. Testimonials: fade 300ms. Pricing: hover lift. FAQ: accordion 250ms. Footer: none. Nav: blur on scroll-state(stuck), smooth active indicator.

## SVG Draw-On
`.scribble path { stroke-dasharray: 300; stroke-dashoffset: 300; animation: draw 1s var(--ease-out) forwards; }`

## Scroll Pseudo-Elements (Chrome 135+)
`::scroll-button(up)` / `::scroll-button(down)` — generated controls for scrollable containers. `::scroll-marker` — pagination dots. Style with CSS, no JS carousel boilerplate.

## Playwright Tests
Reduced motion: `page.emulateMedia({reducedMotion:'reduce'})` → assert 0 running animations. Scroll-driven: scroll container, wait for `animation-timeline` to progress, assert computed style. Hover: compare computed style before/after. View transition: `page.waitForURL()` + assert shared element position.
