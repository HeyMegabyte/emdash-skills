---
name: "experience-and-design-system"
description: "Anti-AI-slop design system for distinctive, premium interfaces. Bold typography (Sora, Space Grotesk, JetBrains Mono), dark-first color system (#060610 bg, #00E5FF cyan), fluid type scale, layout patterns, component design with interaction affordances on everything, and responsive at 375px + 1280px. The Apple Test."
---

# 10 — Experience and Design System

## The Apple Test
After every design: would Apple's design team find this acceptable?

## Brian's Direction
Most repeated: **"Make it simpler."** Remove complexity each iteration. Two elements compete: remove one. Crowded: whitespace. Busy type: reduce sizes, increase weight contrast. Final: effortless, inevitable. "Cooler and catchier" within simplicity.

## CSS Patterns (Brian's code)
Overlay: rgba(0,0,0,0.81). Text shadow: 1px 1px 1px rgba(255,255,255,0.333). Box shadow: 2px 2px 2px rgba(0,0,0,0.69). Border-radius: 5px interactive, 10px containers (never 0, never pill). Hero padding: 40px. Max text: 720px. Line-height: 1.4. Letter-spacing: 0.4px labels, 0.5px nav, 1px titles, 1.4px CTAs. CTA: uppercase always. Button: 700 always. Install Doctor blue: #119eff. Reference: Linear, Notion, Stripe.

## Typography
Body: Sora 400/500. Headings: Space Grotesk 600/700. Mono: JetBrains Mono 400/500. Display: Clash Display 700 (hero only).

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
Body min 16px (prefer 18). Line-height: 1.6 body, 1.1-1.2 headings. Letter-spacing: -0.02em >2rem. Max: 65ch. Never skip levels.

## Color (Dark Default)
```css
:root {
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
Never #000 (use #060610). Never #fff (use #f0f0f5). Cyan: primary CTAs. Blue: secondary. Gradients on buttons only. 6% borders. Subtle glow on primary interactive.

## Layout
Container: 1140px (wide 1400, narrow 720), padding clamp(1rem,3vw,3rem). Sections: clamp(4rem,8vw,8rem), border between. Grid: auto-fit minmax(280px,1fr), 1fr at 768px.
Patterns: Hero (full-viewport, centered), Features (3-col icon+heading+desc), Alternating (zigzag), Pricing (3-tier highlighted), FAQ (accordion), CTA (full-width dark), Footer (4-col stack).

## Components
Cards: bg-card, border-subtle, 12px radius, hover: border-hover+shadow-glow. Buttons: Primary gradient #060610 text, 600 weight, 8px radius, hover 0.9, active scale(0.98), focus 3px cyan. Secondary: transparent, border, hover cyan. Nav: sticky, rgba(6,6,16,0.85), blur(16px). Forms: bg-secondary, border-subtle, 8px, focus cyan+glow.

## Interaction Affordances (EVERY interactive element)
cursor:pointer, hover state, focus-visible (3px cyan, 2px offset), active (scale 0.98), transition (0.2s color, 0.1s transform).

## Responsive
Mobile 375px: no h-scroll, 44px targets, readable, hamburger, full-width buttons. Desktop 1280px: centered, multi-column, hover states, 65ch max.

## Anti-Slop
Never: default Bootstrap/Tailwind, generic gradients, uncurated stock, same-weight text, centered-everything, >16px radius, rainbow text, "AI feel", gray on white.
Always: hierarchy via scale+weight, sparse color, scannable 3s, distinct sections, whitespace, test 375+1280, polished footer.

## Research Intelligence
Anti-slop: bespoke typography, semantic color (--color-action), intentional spacing, restraint, purposeful motion. SaaS: single-CTA 13.5%, Hero/Proof/Features/Demo/Testimonials/Pricing/FAQ/CTA. Bento grid. Organic layouts.

Design psychology: golden ratio spacing (0.382rem..4.236rem), Gestalt (proximity, similarity, figure/ground), Hick's (max 7 nav, 3 pricing), Miller's (3-6 cards).

INP: <200ms p75. Break callbacks, content-visibility:auto, batch DOM, <1500 nodes, throttle with rAF.

Anti-AI-slop (NNGroup 2026): asymmetry, custom icons, mixed serif/sans, real photography, bespoke micro-interactions. If "make me a modern website" could produce it, it fails.
