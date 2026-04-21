---
name: "motion-and-interaction-system"
description: "Meaning-first animation with 3-tier motion hierarchy. Transition grammar, scroll-driven animation via IntersectionObserver, View Transitions API, hover/focus/active states on every element, skeleton loading, mandatory prefers-reduced-motion handling, and performance discipline (only animate transform/opacity). Includes Playwright animation tests."
---

# 11 — Motion and Interaction System

## Motion Hierarchy
**Tier 1 (always):** Page transitions, loading/skeleton, form validation, success/error, nav hover, smooth scroll, accordion, modal, tooltip.
**Tier 2 (usually):** Scroll-reveal, hover enhancements, staggered reveals, counters, progress, subtle parallax.
**Tier 3 (when appropriate):** CTA micro-interactions, confetti, animated illustrations, ambient motion, easter eggs.

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

## Scroll Animation
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```
```css
[data-animate] { opacity: 0; transform: translateY(20px); transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out); }
[data-animate].visible { opacity: 1; transform: translateY(0); }
[data-animate-stagger].visible > *:nth-child(1) { transition-delay: 0ms; }
[data-animate-stagger].visible > *:nth-child(2) { transition-delay: 80ms; }
[data-animate-stagger].visible > *:nth-child(3) { transition-delay: 160ms; }
[data-animate-stagger].visible > *:nth-child(4) { transition-delay: 240ms; }
```
Rules: once only, bottom 20px max, stagger 80ms, threshold 0.15, opacity not display.

## Page Transitions
```css
@view-transition { navigation: auto; }
::view-transition-old(root) { animation: fade-out 0.25s var(--ease-out); }
::view-transition-new(root) { animation: fade-in 0.25s var(--ease-out); }
```
<300ms. Fade safe; slide for hierarchical only. Never block interaction.

## Hover/Focus/Active
All interactive: transition color/bg/border/shadow 0.2s + transform 0.1s. Button hover: translateY(-1px). Active: scale(0.98). Card: border-hover+shadow-glow+translateY(-2px). Focus-visible: 3px cyan, 2px offset.

## Loading
Skeleton: shimmer gradient 1.5s. Spinner: 20px, cyan top border, 0.6s spin.

## Reduced Motion (MANDATORY)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
  [data-animate] { opacity: 1 !important; transform: none !important; }
}
```

## Performance
Only transform+opacity. Never width/height/margin/top/left. will-change sparingly. Max 10 simultaneous. Test 4x CPU. JS <2KB. IO for scroll (never scroll listener).

## Motion by Section
Hero: fade 400ms, stagger CTA 200ms. Features: reveal stagger 80ms. Stats: counter on intersection. Testimonials: fade 300ms. Pricing: hover lift. FAQ: accordion 250ms. Footer: none. Nav: blur, smooth active.

## CSS Scroll-Driven (Chrome 115+, Safari 18+)
```css
.progress-bar { animation: grow-width linear; animation-timeline: scroll(root block); }
.fade-in-section { animation: fade-in linear both; animation-timeline: view(); animation-range: entry 0% entry 100%; }
@supports not (animation-timeline: scroll()) { .fade-in-section { opacity: 1; transform: none; } }
```

## View Transitions + Speculation
Shared elements: view-transition-name + contain:paint. Prerender: `<script type="speculationrules">{"prerender":[{"where":{"href_matches":"/details/*"}}]}</script>`

## SVG Draw-On
`.scribble path { stroke-dasharray: 300; stroke-dashoffset: 300; animation: draw 1s ease forwards; }`

## Playwright Tests
Reduced motion: emulateMedia({reducedMotion:'reduce'}) then assert 0 running animations. Scroll: scroll into view, wait, assert .visible. Hover: compare computed style before/after.

## INP: scheduler.yield()/setTimeout chunking. DOM <1500. Only transform+opacity.
