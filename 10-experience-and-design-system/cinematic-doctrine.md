# Cinematic Doctrine — Disney+/HBO/Showtime aesthetic (***ALWAYS — every premium build***)

Every page reads like a streaming-platform splash, not a content blog. Marketing/non-profit/portfolio sites apply the FULL stack; SaaS dashboards apply EDGE-SAFE GUTTERS + FOCUS RINGS + LETTERBOX at minimum.

## Edge-safe gutters (***NON-NEGOTIABLE — never let a card kiss the viewport edge***)
Cards touching the edge = AI-slop tell. Use a token, never a literal:
```css
:root {
  --edge:        max(1.75rem,  env(safe-area-inset-left, 1.75rem));
  --edge-tablet: max(1.5rem,   env(safe-area-inset-left, 1.5rem));
  --edge-mobile: max(1.25rem,  env(safe-area-inset-left, 1.25rem));
  --edge-tiny:   max(1.125rem, env(safe-area-inset-left, 1.125rem));
}
.container { padding-inline: var(--edge); }
@media (max-width: 1024px) { .container { padding-inline: var(--edge-tablet); } }
@media (max-width: 768px)  { .container { padding-inline: var(--edge-mobile); } }
@media (max-width: 480px)  { .container { padding-inline: var(--edge-tiny); } }
```
`env(safe-area-inset-*)` handles notched/round-screen devices. Gate: `e2e/cinematic.spec.ts` asserts `.container` computed `padding-inline-start >= 16px` at all 6 breakpoints.

## Overflow containment (***BUILD-BREAKING — never ship a page with horizontal scroll***)
`html { overflow-x: clip; } body { overflow-x: clip; }` — `clip` not `hidden` (no scroll container, cleaner). Position-fixed pseudo-elements (`body::after { inset: -10% }`) DO contribute to `body.scrollWidth` in Chromium — always use `inset: 0` for fixed overlays, not negative insets. Animate via `transform: scale()` inside if you need bleed. Gate: `bodyScrollWidth <= viewportWidth + 1` at 6bp.

## Cinematic layer (six fixed overlays — z-index orchestration)
Lay them in this z-order: noise(0) → aurora(0) → vignette(1) → spotlight(1) → letterbox(2) → content(3+). Each must be `pointer-events:none` and `position:fixed` with `inset:0`.

### 1. Aurora bloom (establishing shot)
Three drifting radial gradients, 32s alternate keyframe animation. `mix-blend-mode: normal`, opacity 0.95→1.0→0.90:
```css
body::after {
  content:''; position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(50% 40% at 18% 22%, rgba(80,170,227,.18), transparent 60%),
    radial-gradient(45% 38% at 82% 78%, rgba(0,229,255,.14),  transparent 60%),
    radial-gradient(35% 30% at 60% 12%, rgba(124,58,237,.10), transparent 60%);
  animation: auroraDrift 32s ease-in-out infinite alternate;
  will-change: transform, opacity;
}
@keyframes auroraDrift {
  0%   { transform: translate3d(-2%,-1%,0) scale(1.00); opacity:.95; }
  50%  { transform: translate3d( 3%, 2%,0) scale(1.05); opacity:1.00; }
  100% { transform: translate3d(-1%, 3%,0) scale(1.02); opacity:.90; }
}
```

### 2. Vignette (2.39:1 release-print darkening)
Radial-darken corners + linear-darken top/bottom edges. `mix-blend-mode: multiply` deepens shadows without crushing midtones:
```css
.vignette {
  position:fixed; inset:0; pointer-events:none; z-index:1;
  background:
    radial-gradient(ellipse at center, transparent 55%, rgba(6,6,16,.65) 100%),
    linear-gradient(180deg, rgba(6,6,16,.25) 0%, transparent 8%, transparent 92%, rgba(6,6,16,.35) 100%);
  mix-blend-mode: multiply;
}
```

### 3. Spotlight (pointer-driven follow light)
Desktop only — `(pointer: fine)` media query gate. Updates `--mx/--my` via rAF-throttled mousemove handler. `mix-blend-mode: screen` makes it additive:
```css
.spotlight {
  position:fixed; inset:0; pointer-events:none; z-index:1; opacity:0;
  background: radial-gradient(600px circle at var(--mx,50%) var(--my,50%), rgba(0,229,255,.06), transparent 60%);
  mix-blend-mode: screen;
  transition: opacity .4s ease;
}
@media (pointer: fine) { body.has-pointer .spotlight { opacity:1; } }
```
```js
(() => {
  let raf = 0, x = 50, y = 50;
  const s = document.getElementById('spotlight');
  if (!s || !matchMedia('(pointer: fine)').matches) return;
  document.body.classList.add('has-pointer');
  addEventListener('pointermove', (e) => {
    x = (e.clientX / innerWidth) * 100; y = (e.clientY / innerHeight) * 100;
    if (raf) return;
    raf = requestAnimationFrame(() => { s.style.setProperty('--mx', x+'%'); s.style.setProperty('--my', y+'%'); raf = 0; });
  }, { passive:true });
})();
```

### 4. Letterbox bars (cinematic 2.39:1 framing on hero)
14px top + 28px bottom — top is shorter (cinema bars are intentionally asymmetric for visual weight):
```css
.hero { position:relative; overflow:hidden; }
.hero::before { content:''; position:absolute; inset:0 0 auto 0; height:14px; background:linear-gradient(180deg, rgba(6,6,16,1), transparent); z-index:2; }
.hero::after  { content:''; position:absolute; inset:auto 0 0 0; height:28px; background:linear-gradient(  0deg, rgba(6,6,16,1), transparent); z-index:2; }
```

### 5. Color grading (body filter — entire page reads like a graded master)
```css
body { filter: contrast(1.04) saturate(1.06); }
```
Don't go past 1.06/1.08 — destroys photo grades and pumps reds in skin tones.

### 6. Selection + focus (cinema-blue interactive states)
```css
::selection { background: rgba(0,229,255,.35); text-shadow: 0 0 12px rgba(0,229,255,.5); color: #fff; }
:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 3px;
  box-shadow: 0 0 0 5px rgba(0,229,255,.15), 0 0 20px rgba(0,229,255,.4);
  border-radius: 8px;
}
```

## Random creative touches (***DELIGHT FLOOR — pick ≥3 per build***)
Pre-built menu. Pick at least 3 — Brian's directive is "a lot of random creative stuff."

1. **Headline shimmer** — tri-stop gradient + `background-clip:text` + 8s slide animation on `h1, h2`:
   ```css
   .hero h1, section h2 {
     background: linear-gradient(90deg, #fff 0%, var(--cyan) 50%, #fff 100%);
     background-size: 200% 100%;
     -webkit-background-clip: text; background-clip: text;
     -webkit-text-fill-color: transparent;
     animation: titleShimmer 8s ease-in-out infinite;
   }
   @keyframes titleShimmer { 0%,100%{background-position:200% 0;} 50%{background-position:0 0;} }
   ```
2. **Drop-cap on first manifesto paragraph** — `:first-of-type::first-letter`, 4rem cyan with text-shadow.
3. **3D card tilt** — perspective + custom-prop rotateX/rotateY from pointer position. Disabled on `(pointer: coarse)` and `prefers-reduced-motion`:
   ```css
   .card { transform: perspective(900px) rotateX(calc(var(--ty,0) * -3deg)) rotateY(calc(var(--tx,0) * 3deg)); transition: transform .3s ease; }
   @media (pointer: coarse), (prefers-reduced-motion: reduce) { .card { transform: none !important; } }
   ```
4. **Cinema-poster gradient borders** — `mask-composite: exclude` to render only the border path:
   ```css
   .card::after {
     content:''; position:absolute; inset:0; border-radius:inherit; padding:1px;
     background: linear-gradient(135deg, var(--blue), var(--cyan), var(--purple));
     -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
     -webkit-mask-composite: xor; mask-composite: exclude;
     pointer-events:none; opacity:0; transition: opacity .4s ease;
   }
   .card:hover::after { opacity:1; }
   ```
5. **Button shimmer-sweep on hover** — `::before` linear-gradient sliding `left: -75% → 125%`:
   ```css
   .hero-cta { position:relative; overflow:hidden; }
   .hero-cta::before { content:''; position:absolute; top:0; left:-75%; width:50%; height:100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.2), transparent); transform: skewX(-25deg); transition: left .6s ease; }
   .hero-cta:hover::before { left: 125%; }
   ```
6. **Establishing-shot section glow** — `section:not(.hero)::before` radial gradient overhead, varies per section.
7. **Decorative chapter glyph** — `.section-header::after` 80px gradient line + diamond/dot, like an HBO scene-divider.
8. **Card-image bottom-fade** — `.card-img-wrap::after` linear-gradient overlay (0deg, black, transparent).
9. **Anti-FOUC + in-viewport fadeIn** — `body { animation: pageFadeIn .5s ease-out; }` + IntersectionObserver `.fade-in-section`.
10. **Page transitions via View Transitions API** — `@view-transition { navigation: auto; }` + cross-fade.
11. **Konami code easter egg** — secret animation on `↑↑↓↓←→←→BA` (keep < 1KB).
12. **Branded scrollbar** — `scrollbar-color: var(--blue) var(--black);` + webkit overrides 8px wide.
13. **Scroll-driven hero parallax** — `@supports (animation-timeline: scroll())` only, fallback `transform: none`.
14. **Custom selection cursor** — `cursor: url('data:image/svg+xml,...'), auto;` near interactive elements.
15. **Footer signature animation** — copyright fades in last, with cyan period blink.

## Reduced-motion override (***ACCESSIBILITY — every cinematic element***)
```css
@media (prefers-reduced-motion: reduce) {
  body::after { animation: none; }
  .hero h1, section h2 { animation: none; -webkit-text-fill-color: currentColor; background: none; }
  .card, .help-card { transform: none !important; transition: none; }
  .hero-cta::before { display: none; }
  body { filter: none; }
}
```

## Mobile downgrade
- Spotlight: hidden via `@media (pointer: coarse)`.
- 3D tilt: disabled (`transform: none`).
- Letterbox: reduce to 8px / 16px below 768px.
- Aurora: opacity 0.6 below 480px (battery + contrast).

## Build gate (***E2E SPEC — `e2e/cinematic.spec.ts` MANDATORY***)
Six-breakpoint guard. Per breakpoint asserts: (a) `bodyScrollWidth ≤ viewportWidth + 1` (no horizontal scroll), (b) `htmlScrollWidth ≤ viewportWidth + 1`, (c) `.container` computed `padding-inline-{start,end} ≥ 16px`, (d) `.vignette` + `#spotlight` attached, (e) `getComputedStyle(body).filter` matches `/contrast|saturate/`. Failure = build broken.

## Reference incident (2026-05-11, mission.megabyte.space)
First cinematic pass added aurora `body::after { position:fixed; inset:-10% }`. In Chromium, position-fixed body pseudo-elements DO contribute to `body.scrollWidth` even though they're out of document flow. Caused 146px horizontal overflow at 1920 (`bodyScrollWidth = 2068`). Fix bundle = `inset: -10%` → `inset: 0` AND `html/body { overflow-x: clip }`. Lesson: always test `body.scrollWidth` at 1920 after adding fixed-position pseudo overlays. The orbs inside `.hero { overflow:hidden }` were red herrings — they DON'T contribute to body.scrollWidth because their containing block clips them.

## File-map (drop-in CSS bundle path)
Store the canonical bundle at `~/.agentskills/10-experience-and-design-system/cinematic-bundle.css` (next iteration). Include all six layers + delight menu items + reduced-motion overrides. Site-gen skill 15 imports + tokens-swaps colors for brand fit.
