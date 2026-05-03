---
name: "09 build-breaking brand+content rules"
description: "Universal brand/content gates: social brand-hex, small-text WCAG AAA contrast, logo-vs-container contrast, hero scrim, transparent-bg logo variant, X-not-Twitter, institution-credentials row. Migrated verbatim from rules/always.md 2026-05-03."
metadata:
  version: "1.0.0"
  updated: "2026-05-03"
  effort: "high"
  context: "fork"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
---

# 09 — Build-Breaking Brand + Content Rules

Migrated from `~/.claude/rules/always.md` 2026-05-03.

## Every social link
Hover/focus/active swaps to official brand hex (FB #1877F2|LinkedIn #0A66C2|X #000|Instagram gradient #F58529→#DD2A7B→#8134AF→#515BD4|YT #FF0000|TikTok #000 with cyan/magenta dual-shadow|Pinterest #BD081C|GitHub #181717|Discord #5865F2|Bluesky #0085FF|Threads #000|WhatsApp #25D366|Reddit #FF4500|Snap #FFFC00). Encode as `social-brand-hex.json` map shipped in template — never hardcode generic accent. See `social-brand-hex.md`.

## Every site (small text contrast — ***WCAG AAA FOR SMALL TEXT***)
Any text ≤14px MUST contrast ≥7:1 vs its background (WCAG AAA for small text). Body small text muted ONLY at full WCAG-AA (≥4.5:1). Forbidden: muted-foreground on muted-background pairing for small text. Build gate: visual-qa samples computed-style of `font-size ≤ 14px` elements + bg, fails if contrast<7:1. The /services small-print incident on lone-mountain-global-3 (2026-05-01) — small descriptive text rendered too close to bg color, illegible — drove this rule.

## Every logo render (***LOGO-VS-CONTAINER CONTRAST — UNIVERSAL — BUILD-BREAKING***)
Every logo render (header, footer, hero, modal, splash, mobile menu, sidebar) MUST contrast its container background by ≥4.5:1 measured on the logo's dominant chroma (NOT the transparent pixels). Forbidden pairings: white-text-logo on white/cream bg|dark-text-logo on dark/navy bg|low-saturation-logo on same-hue bg. Resolution: header AND footer themes are CHOSEN AFTER logo luminance scan (skill 09 logo-luminance-drives-theme). When dual-theme site (light header + dark footer or vice versa) needs the SAME logo, ship TWO logo files (`brand-mark-light.svg` for dark bg, `brand-mark-dark.svg` for light bg) and CSS `picture`/`<source media>` swaps based on container. Validator (`validate-logo-contrast.mjs`): GPT-4o samples logo bbox + container computed bg at 6bp, fails if contrast<4.5:1. The lone-mountain-global-3 (2026-05-01) header rendered white-text-logo on white bg (invisible) AND footer rendered dark-text-logo on dark bg (invisible) — both invisible — drove this rule.

## Every hero (***HERO TEXT CONTRAST SCRIM — UNIVERSAL — BUILD-BREAKING***)
Hero/page-banner backgrounds (image, video, gradient) MUST guarantee ≥4.5:1 contrast for ALL hero text via mandatory scrim overlay. Pattern: `.hero::before { content:""; position:absolute; inset:0; background: linear-gradient(180deg, rgba(0,0,0,.45) 0%, rgba(0,0,0,.65) 100%); z-index:1 } .hero > .hero-content { position:relative; z-index:2 }` for dark text on light/bright bg invert to white-overlay. Scrim opacity tuned per bg luminance: bright bg = 55-70% scrim|mid bg = 35-50% scrim|dark bg = 25-35% scrim. Companion: `text-shadow: 0 1px 3px rgba(0,0,0,.5)` on hero h1+subhead as belt-and-suspenders. NEVER ship hero text directly on raw image without scrim. Validator: visual-qa samples hero text + computed-bg-after-scrim at 6bp, fails if contrast<4.5:1. The lone-mountain-global-3 (2026-05-01) hero rendered text on insufficiently-darkened bg drove this rule.

## Every nav/header/footer logo render (***LOGO TRANSPARENT-BG VARIANT — UNIVERSAL — BUILD-BREAKING — extends "Every logo render"***)
When source logo PNG/JPG has a baked-in solid background (white card, colored stripe, gradient bar) AND the rebuild's nav/header/footer surface DIFFERS from that baked bg, the build MUST produce a transparent-bg logo variant before render. Pipeline: (1) detect source logo bg via Sharp `getDominantColor` + edge-pixel sample at 5px inset — if ≥80% of border pixels share a single hue, logo has baked bg, (2) auto-strip via `sharp(logo).removeAlpha().threshold(...)` OR remove.bg API (`REMOVEBG_API_KEY`) for hard cases (anti-aliased edges, drop shadows, gradient bgs), (3) ship `brand-mark-transparent.png` + `brand-mark-transparent.svg` (when SVG available) alongside `brand-mark.png`, (4) `<picture><source srcset="brand-mark-transparent.png" media="(--surface-bg: transparent)"><img src="brand-mark.png"></picture>` with CSS `--surface-bg` custom property set per surface. Header on white nav uses transparent variant; header on dark hero uses dark-bg variant; footer on dark band uses light-text variant — three files, three contexts, never one PNG fighting all three. Validator (`validate-logo-transparent-variant.mjs`): for every site whose source logo has detected baked bg, assert `public/brand-mark-transparent.png` exists AND header `<img>` references transparent variant when nav bg-luminance differs from logo baked-bg luminance by ≥0.3. Reference incident: njsk.org rebuild (2026-05-02) shipped white-card-bg logo on white nav (logo box visibly clashed with nav surface) — drove this rule.

## Every X (formerly Twitter) reference (***X-NOT-TWITTER + LATEST X ICON — UNIVERSAL — BUILD-BREAKING***)
EVERY mention/icon/aria-label/alt-text/social-row tile referencing the social network formerly known as Twitter MUST use the current "X" branding (text="X", icon=current X logo SVG, brand color=#000 with cyan/magenta dual-shadow on hover per "Every social link" rule). Forbidden text strings in dist/ HTML+ARIA: "Twitter" (except in historical context like "formerly Twitter"), "Tweet" (except as past-tense verb in dated content), "@" mentions style. Forbidden icons: the blue Twitter bird SVG (path data with `tw-bird` etc.), `simple-icons:twitter`, `lucide-twitter`. Required: `simple-icons:x` OR custom inline SVG of the X mark (`<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`). aria-label MUST be "X (formerly Twitter)" on first mention (for screen readers + SEO context) then plain "X" on repeat. Validator (`validate-x-not-twitter.mjs`): grep dist/ for `\bTwitter\b`, `tweet`, `tw-bird`, blue twitter-bird SVG path; fail on any match outside whitelisted contexts (`<time datetime>` in archived blog posts, dated quotes, "formerly Twitter" parenthetical). Reference incident: nyfoldingbox.com rebuild (2026-05-02) shipped Twitter-bird icon + "Follow us on Twitter" copy — drove this rule.

## Every bio mentioning notable institutions
BU|Harvard|MIT|Stanford|Oxford|Cambridge|Yale|Princeton|Columbia|UPenn|Cornell|Brown|Dartmouth|Caltech|UChicago|Northwestern|Duke|JHU|UMich|UCLA|UCB|CMU|T20: credentials row with high-res transparent-PNG institution logos. Fetch chain: Logo.dev → Wikipedia Commons SVG → Brandfetch.
