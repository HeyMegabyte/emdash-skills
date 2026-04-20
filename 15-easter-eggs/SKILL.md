---
name: "Easter Eggs"
description: "MANDATORY: Every website gets at least one hidden Easter egg via URL query parameter. Canvas-based, full-screen, dismissible, delightful. AI chooses what — creative, contextually appropriate, and genuinely fun. Includes QR code flyer generation at /flyer.pdf."
layer: "capability-pack"
canonical-owner-of:
  - "easter-egg-implementation"
  - "hidden-delight-features"
  - "qr-code-flyer-generation"
---

# Easter Eggs — Mandatory Hidden Delights

## Rule: Every Website Gets One

This is not optional. Every website deployed through Emdash must include at least one
Easter egg accessible via a URL query parameter. The AI chooses what it is — creative,
appropriate for the project's tone, and genuinely fun.

## Brian's Personal Motifs (Use in Easter Eggs)
- **Squirrels** — Brian's spirit animal. Animated squirrel collecting acorns, squirrel cursor follower, etc.
- **Turtles** — secondary motif. Can appear as loading animations or hidden games.
- **Space/cosmic themes** — stars, constellations, quantum particles in cyan/purple

## What Works (Proven Patterns)

### Full-screen canvas games/animations
- Squirrel collecting acorns (Brian's personal favorite animal)
- Stick figure shooting things with rainbows coming out of his mouth
- Particle systems that spell out messages (in cyan #00E5FF)
- Retro arcade references
- Physics simulations with turtles
- Generative art that uses the site's brand colors

### What makes a GOOD Easter egg:
- **Self-contained** — one `<script>` block, no external assets
- **Full-screen canvas** — overlays the entire page with translucent dark background
- **Immediate visual payoff** — something cool happens within 1 second
- **Continuous action** — it keeps going, not a one-shot animation
- **Dismissible** — ESC key + click on overlay to close
- **Themed** — uses the site's brand colors (cyan, blue) somewhere
- **Has a score/counter** — gives the user something to watch grow
- **Performant** — requestAnimationFrame, no heavy computation

## Implementation Template

```javascript
(function(){
  if(!new URLSearchParams(location.search).has('EggName'))return;
  let on=true;
  const o=document.createElement('div');
  o.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);cursor:pointer;';
  o.innerHTML='<canvas id="eggC" style="width:100%;height:100%;display:block;"></canvas>';
  const cl=()=>{o.remove();on=false;};
  o.addEventListener('click',cl);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cl();});
  document.body.appendChild(o);

  const cv=document.getElementById('eggC');
  const c=cv.getContext('2d');
  let W,H;
  const resize=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};
  resize(); addEventListener('resize',resize);

  // ... your creative animation here ...

  const tick=()=>{
    if(!on)return;
    // clear, draw, update
    requestAnimationFrame(tick);
  };
  tick();
})();
```

## Ideas by Project Type

### Nonprofit / Mission
- `?Win` — Guy with rainbows + AK-47 shooting clouds (IMPLEMENTED)
- `?Love` — Particle hearts that swarm toward cursor
- `?Stars` — Generative starfield with mission keywords

### SaaS / Tech
- `?Matrix` — Matrix rain with the product's feature names
- `?Hack` — Hollywood hacking terminal with real project stats
- `?CRT` — CRT scanline filter over the whole page

### Creative / Portfolio
- `?Nyan` — Nyan cat trail following the cursor
- `?Paint` — Turns the page into an MS Paint canvas

### Hint
Always leave a comment in the HTML source:
```html
<!-- 🥚 -->
```
Don't reveal the parameter name in the hint. Let people discover it.

## Quality Gate

Before shipping:
1. Watch the FULL animation run for 30+ seconds
2. Verify no freezing, stuttering, or glitching
3. ESC and click-dismiss work at every point
4. No console errors
5. Works at mobile viewport (375px)
6. Doesn't block the page underneath after dismiss
7. Canvas resizes properly on window resize
8. Stars/particles generated ONCE, not re-randomized per frame
9. Score/counter updates smoothly

## What NOT To Do
- Complex game logic that can get stuck (mazes, pathfinding, collision)
- Loading external assets (images, sounds, fonts)
- Anything that modifies the DOM outside the overlay
- Anything that persists after dismiss (intervals, event listeners)
- Anything inappropriate for the project's audience

## QR Code Flyer (Utility Easter Egg)

Auto-generate a printable one-page flyer with:
- QR code linking to the site
- Hotline number (if applicable)
- Brand colors and logo
- "Scan to learn more" CTA

Generate as PDF on deploy. Available at /flyer.pdf.
Useful for physical distribution (bus stops, community centers, churches).

Include this as part of the Easter egg plan — a useful hidden feature
accessible via ?Flyer or /flyer.pdf.
