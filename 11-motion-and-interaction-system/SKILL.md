---
name: "Motion and Interaction System"
description: "Meaning-first animation with 3-tier motion hierarchy. Transition grammar, scroll-driven animation via IntersectionObserver, View Transitions API, hover/focus/active states on every element, skeleton loading, mandatory prefers-reduced-motion handling, and performance discipline (only animate transform/opacity). Includes Playwright animation tests."
layer: "product-compiler"
canonical-owner-of:
  - "transition-grammar"
  - "scroll-driven-animation"
  - "page-transitions"
  - "hover-focus-active-states"
  - "reduced-motion-handling"
  - "motion-hierarchy"
---

# 11 — Motion and Interaction System

> Motion that improves comprehension. Animation that builds delight. Performance that never suffers.

---

## Core Principle

**Motion is communication, not decoration.** Every animation must improve comprehension, orientation, delight, or perceived quality. If an animation doesn't serve one of these purposes, remove it.

---

## Motion Hierarchy

### Tier 1: Functional Motion (always)
- Page transitions between routes
- Loading states and skeleton screens
- Form validation feedback
- Success/error state changes
- Navigation state (active, hover)
- Scroll-to-section smoothness
- Accordion expand/collapse
- Modal open/close
- Tooltip show/hide

### Tier 2: Enrichment Motion (usually)
- Scroll-reveal of content sections
- Hover state enhancements on cards/buttons
- Staggered list item reveals
- Counter animations on statistics
- Progress indicators
- Parallax on hero images (subtle)

### Tier 3: Delight Motion (when appropriate)
- Micro-interactions on primary CTAs
- Confetti or celebration on success states
- Animated illustrations or icons
- Background ambient motion (particles, gradients)
- Easter eggs

### Rule: Always implement Tier 1. Add Tier 2 for polish. Add Tier 3 only when it strengthens the experience.

---

## Default Transition Grammar

### Timing Functions
```css
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);      /* exits: elements leaving */
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);    /* transitions: state changes */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* entrances: bouncy feel */
  --ease-smooth: cubic-bezier(0.25, 0.1, 0.25, 1);   /* subtle: default fallback */
}
```

### Duration Scale
| Context | Duration | When |
|---------|----------|------|
| Micro | 100-150ms | Button press, toggle, tooltip |
| Short | 200-250ms | Hover states, small reveals |
| Medium | 300-400ms | Section reveals, modals, accordions |
| Long | 500-700ms | Page transitions, hero animations |
| Extended | 800-1200ms | Complex sequences, celebrations |

### Rule: Shorter is almost always better. If in doubt, use 200ms.

---

## Scroll-Driven Animation

### Intersection Observer Pattern
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animate once
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
```

### Scroll Reveal CSS
```css
[data-animate] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out);
}

[data-animate].visible {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered children */
[data-animate-stagger] > * {
  opacity: 0;
  transform: translateY(15px);
  transition: opacity 0.4s var(--ease-out), transform 0.4s var(--ease-out);
}

[data-animate-stagger].visible > *:nth-child(1) { transition-delay: 0ms; }
[data-animate-stagger].visible > *:nth-child(2) { transition-delay: 80ms; }
[data-animate-stagger].visible > *:nth-child(3) { transition-delay: 160ms; }
[data-animate-stagger].visible > *:nth-child(4) { transition-delay: 240ms; }

[data-animate-stagger].visible > * {
  opacity: 1;
  transform: translateY(0);
}
```

### Scroll Reveal Rules
- Animate once (don't re-trigger on scroll back)
- Reveal from bottom (20px translate) — not from sides
- Use subtle transforms (20px max, never 100px+)
- Stagger delays: 80ms between siblings
- Never block content behind animation (use opacity, not display)
- Threshold 0.15 — trigger when 15% visible

---

## Page Transitions

### View Transitions API (Modern Browsers)
```css
@view-transition {
  navigation: auto;
}

::view-transition-old(root) {
  animation: fade-out 0.25s var(--ease-out);
}

::view-transition-new(root) {
  animation: fade-in 0.25s var(--ease-out);
}

@keyframes fade-out { to { opacity: 0; } }
@keyframes fade-in { from { opacity: 0; } }
```

### Fallback (No View Transitions)
```css
/* Simple opacity transition on route change */
.page-enter { opacity: 0; }
.page-enter-active { opacity: 1; transition: opacity 0.3s var(--ease-smooth); }
```

### Page Transition Rules
- Keep transitions under 300ms
- Fade is always safe; slide only for hierarchical navigation
- Never block user interaction during transition
- Provide instant feedback (highlight nav item immediately)

---

## Hover and Focus States

### Interactive Element Transitions
```css
/* Universal interactive transition */
a, button, [role="button"], .card-interactive {
  transition: color 0.2s ease, background-color 0.2s ease,
              border-color 0.2s ease, box-shadow 0.2s ease,
              transform 0.1s ease, opacity 0.2s ease;
}

/* Button hover */
button:hover, [role="button"]:hover {
  transform: translateY(-1px);
}

/* Button active */
button:active, [role="button"]:active {
  transform: translateY(0) scale(0.98);
}

/* Card hover */
.card-interactive:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
  transform: translateY(-2px);
}

/* Focus ring */
:focus-visible {
  outline: 3px solid var(--accent-cyan);
  outline-offset: 2px;
}
```

---

## Loading States

### Skeleton Screens
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Spinner (fallback)
```css
.spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent-cyan);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

---

## Reduced Motion

### Mandatory Respect
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  [data-animate] {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### Reduced Motion Rules
- Always implement `prefers-reduced-motion`
- Remove all decorative animation
- Keep functional state changes (active/hover color changes)
- Keep layout transitions but make them instant
- Never use motion as the only way to convey information

---

## Performance Discipline

### Animation Performance Rules
- Only animate `transform` and `opacity` (GPU-composited)
- Never animate `width`, `height`, `margin`, `padding`, `top`, `left`
- Use `will-change` sparingly (only when jank is measured)
- Avoid animating more than 10 elements simultaneously
- Test at 4x CPU slowdown in DevTools
- Keep total animation JS under 2KB (Intersection Observer is enough)

### Performance Checklist
```
[ ] Only transform/opacity animated
[ ] No layout thrashing (read then write, never interleave)
[ ] Intersection Observer for scroll-driven (not scroll event listener)
[ ] Reduced motion handled
[ ] No animation library imported (CSS + IO is sufficient)
[ ] Tested at 4x CPU slowdown
[ ] No visible jank on 375px mobile viewport
```

---

## Motion by Section Type

| Section | Motion |
|---------|--------|
| Hero | Fade in heading (400ms), stagger CTA (200ms delay) |
| Features grid | Scroll-reveal with stagger (80ms between cards) |
| Statistics | Counter animation on scroll intersection |
| Testimonials | Fade transition between slides (300ms) |
| Pricing | Subtle hover lift on cards |
| FAQ | Accordion expand with height animation (250ms) |
| Footer | No motion (always visible, always stable) |
| Navigation | Blur backdrop on scroll, smooth active indicator |

---

## Trigger Conditions
- Any UI implementation
- Visual polish phase
- Motion-specific improvements
- Accessibility audit (reduced motion)

## Stop Conditions
- All Tier 1 motion implemented
- Reduced motion handled
- Performance checklist passes
- No jank on mobile

## Cross-Skill Dependencies
- **Reads from:** 10-experience-and-design (what elements exist), 04-preference-and-memory (motion preferences)
- **Feeds into:** 07-quality-and-verification (animation performance), 06-build-and-slice-loop (motion implementation)

---

## What This Skill Owns
- Transition grammar and timing
- Scroll-driven animation
- Page transitions
- Hover/focus/active states
- Loading states
- Reduced motion handling
- Animation performance discipline
- Motion hierarchy and prioritization

## What This Skill Must Never Own
- Layout or visual design (→ 10)
- Content (→ 09)
- Video generation (→ 12)
- Implementation approach (→ 06)

## Animation Testing (Playwright)

### Reduced Motion
```typescript
test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  // Verify no CSS animations are running
  const animations = await page.evaluate(() =>
    document.getAnimations().filter(a => a.playState === 'running').length
  );
  expect(animations).toBe(0);
});
```

### Scroll Reveals Fire
```typescript
test('scroll reveals trigger on scroll', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.reveal').first();
  await expect(section).not.toHaveClass(/visible/);
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await expect(section).toHaveClass(/visible/);
});
```

### Hover States Change Computed Styles
```typescript
test('cards have hover effect', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('.card').first();
  const before = await card.evaluate(el => getComputedStyle(el).transform);
  await card.hover();
  await page.waitForTimeout(300);
  const after = await card.evaluate(el => getComputedStyle(el).transform);
  expect(after).not.toBe(before);
});
```

---

## Research-Backed Motion Intelligence (2026 Sources)

### CSS Scroll-Driven Animations (Source: MDN, Chrome Developers)
Pure CSS, zero JS, compositor-thread animations. Supported in Chrome 115+, Safari 18+.

```css
/* Scroll progress bar — zero JS */
.progress-bar {
  animation: grow-width linear;
  animation-timeline: scroll(root block);
}
@keyframes grow-width { from { width: 0%; } to { width: 100%; } }

/* Element fade-in on viewport entry — replaces IntersectionObserver */
.fade-in-section {
  animation: fade-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Fallback for Firefox */
@supports not (animation-timeline: scroll()) {
  .fade-in-section { opacity: 1; transform: none; }
}
```

### View Transitions API (Source: DEV Community, Web Perf Clinic)
Native GPU-accelerated page transitions — zero library needed.

```css
/* MPA auto-transitions (zero JS!) */
@view-transition { navigation: auto; }

/* Shared element transitions */
.card-thumbnail { view-transition-name: hero-image; contain: paint; }
.detail-hero    { view-transition-name: hero-image; contain: paint; }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation-duration: 0s; }
}
```

Pair with Speculation Rules for instant transitions:
```html
<script type="speculationrules">
{ "prerender": [{ "where": { "href_matches": "/details/*" } }] }
</script>
```

### SVG Draw-On Effect (Source: Gatitaa, Awwwards)
Hand-drawn underlines/circles on key text — signals human touch, anti-AI-slop:
```css
.scribble path {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: draw 1s ease forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }
```

### Dynamic Text Treatments (Source: Webflow Trends 2026)
Animate headlines with character-level stagger for hero "wow" moments:
```js
// SplitType + GSAP (optional, for award-level sites)
const split = new SplitType('h1', { types: 'chars' });
gsap.from(split.chars, { opacity: 0, y: 40, stagger: 0.03, duration: 0.6 });
```
Typography IS the hero. Animated type drives 2x more dwell time in hero sections.

### Clip-Path Reveals (Source: Awwwards, Medium)
Dramatic geometric reveals on scroll:
```css
.reveal {
  clip-path: circle(0% at 50% 50%);
  transition: clip-path 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.reveal.active { clip-path: circle(75% at 50% 50%); }
```

### Performance: INP Optimization (Source: Google Web.dev)
43% of sites fail INP (Interaction to Next Paint). Key fixes:
- Break long tasks with `scheduler.yield()` or `setTimeout` chunking
- Keep DOM under 1,500 nodes, max 32-level depth
- Only animate `transform` and `opacity` (compositor-thread, always 60fps)
- Never animate `width`, `height`, `margin`, `top`, `left`
