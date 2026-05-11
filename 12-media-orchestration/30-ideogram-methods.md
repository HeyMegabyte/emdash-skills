---
name: "30 Ideogram Methods"
description: "Thirty distinct, creative ways every generated site can consume Ideogram v3 assets — hero/illustration/OG/divider/parallax/card/stat/badge/role/era/404/confetti/newsletter/email/PDF/sticker/loading/easter-egg/light-dark/poster/lockup/PWA/favicon/cursor/watermark/press/social/ticker/scroll-glyph. Each method has prompt template, slot manifest contract, render component, fallback, and cache key. Goal: replace every stock image with brand-coherent generated asset + extend reach across PWA, social, print."
updated: "2026-05-11"
---

# 30 Ideogram Methods (***UNIVERSAL CATALOG — EVERY GENERATED SITE***)
Brand-coherent Ideogram v3 assets fan out across the entire site beyond `hero.png`. Each method has: `slot id` | `dims` | `dpi` | `prompt template` | `negative prompt` | `style preset` | `format` | `output path` | `consumer component` | `fallback chain` | `cache key`. Manifest lives at `src/data/ideogram/methods.ts` (typed catalog) + `public/_ideogram/manifest.json` (post-build asset registry). Pipeline: `scripts/generate-ideogram-assets.mjs` reads catalog → renders missing slots via Ideogram v3 API → uploads to `public/images/ideogram/` (small assets) or R2 (>500KB) → writes manifest. Re-runs idempotent (skips slots with valid md5 in manifest).

## Slot Manifest Schema (canonical)
```ts
export type IdeogramAspect = '1:1' | '1:3' | '3:1' | '3:2' | '2:3' | '16:9' | '9:16' | '16:10' | '10:16' | '4:3' | '3:4';
export type IdeogramStyle = 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'ANIME';
export interface IdeogramSlot {
  id: string;                       // canonical slug e.g. "hero-home", "og-services"
  method: number;                   // 1-30 catalog ref
  prompt: string;                   // resolved (token-substituted) prompt
  negativePrompt?: string;
  aspect: IdeogramAspect;
  styleType: IdeogramStyle;
  renderingSpeed: 'TURBO' | 'DEFAULT' | 'QUALITY';
  magicPrompt?: 'ON' | 'OFF' | 'AUTO';
  numImages?: 1 | 2 | 3 | 4 | 8;
  seed?: number;
  outputPath: string;               // `/images/ideogram/<id>.{webp|png|svg}`
  outputFormat: 'webp' | 'png' | 'svg' | 'jpeg';
  consumers: string[];              // component paths that render this slot
  fallback: string;                 // path to fallback asset if generation fails
  cacheKey: string;                 // sha256(prompt+aspect+style+seed)
  brandTokens: Record<string, string>; // resolved tokens: BRAND_HEX, MISSION, etc.
}
```

## The 30 Methods (prompts use `{{token}}` substitution from `_brand.json` + page data)

**1 — Hero per route.** 16:9 cinematic illustration anchoring every top-level route hero. Prompt: *"editorial illustration of {{ROUTE_SUBJECT}} in {{CITY}}, cinematic lighting, {{BRAND_PALETTE}} color palette, painterly brush, soft golden hour, depth of field, no text"*. Style: REALISTIC | aspect: 16:9 | path: `/images/ideogram/hero-{route}.webp`. Consumer: `<Hero variant="cinematic">`. Fallback: existing source-site hero.

**2 — OG card per route.** 1200×630 designed social card with brand stripe + title overlay. Prompt: *"social media share card, deep {{BRAND_HEX}} gradient background, abstract organic shapes, subtle texture, leave clear negative space top-left for headline overlay, no text in image"*. Aspect: 16:9 (resized to 1200×630 post-gen). Consumer: per-route metadata `og.image`. Fallback: shared default `og-default.png`.

**3 — Twitter / X card variant.** 1200×600 (sharper crop). Same base prompt as #2 with different seed for variation. Path: `/images/ideogram/twitter-{route}.png`. Consumer: per-route `twitter.image`.

**4 — Section dividers.** 3:1 horizontal panoramic separators between major page sections. Prompt: *"thin horizontal banner, abstract topography map with {{BRAND_HEX}} contour lines on cream background, organic flow, no text, decorative"*. Aspect: 3:1 | format: svg-or-png. Consumer: `<SectionDivider>` between pricing/features/cta blocks.

**5 — Parallax layer set.** Three 1:1 transparent-PNG layers (foreground, midground, background) for parallax hero scroll. Prompt set: *"transparent PNG, {{LAYER}} foliage silhouette in {{BRAND_HEX}}, no background, painterly"*. Consumer: `<ParallaxScene layers="3">` with `transform: translateY()` driven by scroll.

**6 — Article / card thumbnails.** 4:3 illustrative thumbnails for blog/news/case-study listings. Prompt: *"flat-vector editorial illustration of {{POST_SUBJECT}}, {{BRAND_PALETTE}}, isometric perspective, 4:3"*. Consumer: `<BlogCard>`, `<NewsCard>`.

**7 — Stat block icons.** 1:1 80×80 brand-tinted icons accompanying stat counters. Prompt: *"minimal line icon of {{STAT_SUBJECT}}, single-color {{BRAND_HEX}}, 1px stroke, geometric, centered on transparent background"*. Format: SVG. Consumer: `<StatBlock icon={...}>`.

**8 — Testimonial frames.** Branded portrait frames behind testimonial avatars. Prompt: *"decorative circular frame, hand-drawn laurel wreath in {{BRAND_HEX}}, transparent PNG, 256×256"*. Consumer: `<Testimonial>` overlaying `<img>`.

**9 — Impact-tier badges.** Donation/pricing tier illustrated badges (Tier 1 / 2 / 3). Prompt: *"badge illustration of {{TIER_NAME}} with {{TIER_AMOUNT}} feeling, hand-drawn medallion style, {{BRAND_HEX}} ink, cream paper"*. Consumer: `<DonationTier>`, `<PricingTier>`.

**10 — Volunteer-role / job-role illustrations.** 3:2 portraits per role (cook, server, packer, ambassador, dev, designer). Prompt: *"editorial illustration of {{ROLE_NAME}} at work in {{SETTING}}, warm lighting, {{BRAND_PALETTE}}, painterly"*. Consumer: `<RoleCard>` on /volunteer or /careers.

**11 — Timeline / era illustrations.** 16:9 scene-setter per timeline era (e.g. 1820s, 1900s, 1970s, present). Prompt: *"sepia-toned editorial illustration of {{ERA_LABEL}} in {{CITY}}, {{ERA_DETAIL}}, painterly historical realism"*. Consumer: `<HistoryTimeline>` era headers.

**12 — Branded 404 mascot.** 1:1 friendly anthropomorphic mascot or icon greeting lost visitors. Prompt: *"friendly mascot illustration for 404 page of {{BRAND_NAME}}, holding 'lost' sign, in {{BRAND_PALETTE}}, hand-drawn, no rendered text on sign"*. Consumer: `<NotFound>` route.

**13 — Donation-success confetti sprite sheet.** Animated success state confetti shapes (3:1 sprite strip). Prompt: *"sprite sheet of 12 confetti shapes in {{BRAND_PALETTE}}, transparent PNG, evenly spaced, geometric"*. Consumer: confetti canvas on `/donate/thank-you`.

**14 — Newsletter signup art.** 4:3 inviting illustration adjacent to email signup form. Prompt: *"warm editorial illustration of opening a hand-written letter in {{BRAND_PALETTE}}, painterly, no text on paper"*. Consumer: `<NewsletterSignup>`.

**15 — Email signature header.** 4:1 thin banner suitable for transactional email header (Resend / Inngest templates). Prompt: *"thin email banner with {{BRAND_NAME}} wordmark area on left, abstract {{BRAND_HEX}} shapes on right, leave 30% left blank for logo overlay"*. Output: `/images/ideogram/email-header.png`. Consumer: Resend email templates.

**16 — PDF cover (annual report / press kit).** A4 portrait cover for downloadable PDFs. Prompt: *"editorial annual-report cover for {{BRAND_NAME}} {{YEAR}}, central illustration of {{MISSION_VISUAL}}, painterly, {{BRAND_PALETTE}}, leave top 30% clear for typography overlay"*. Aspect: 2:3. Consumer: Puppeteer/Playwright PDF generator.

**17 — Magazine-spread asset (multi-image collage).** 16:10 multi-pane editorial spread for storytelling pages. Prompt: *"editorial magazine spread layout of {{STORY_THEME}}, 3-panel collage, {{BRAND_PALETTE}}, painterly, varied compositions"*. Consumer: `<StorySpread>` on case-study or about pages.

**18 — Sticker pack.** 4×4 grid of die-cut style stickers for printed swag + Slack/Discord emoji sets. Prompt: *"sticker sheet of 16 die-cut stickers for {{BRAND_NAME}} community, {{BRAND_PALETTE}}, varied subjects: heart, hands, plate, sun, lightbulb, etc, white outline border"*. Output: `/images/ideogram/stickers.png` + post-process to individual transparent PNGs in `/public/images/ideogram/stickers/`. Consumer: download page + Slack workspace emoji.

**19 — Loading-state illustrations.** 1:1 friendly illustrations replacing "Loading..." spinners on slow routes. Prompt: *"friendly illustration of {{SUBJECT}} being prepared, {{BRAND_PALETTE}}, gentle motion sense, painterly"*. Consumer: `<Suspense fallback={<LoadingArt slot="..." />}>`.

**20 — Easter-egg art (Konami / footer / 404-deeper).** Hidden delight unlocked by Konami code or repeated logo click. Prompt: *"surprising playful illustration of {{INSIDE_JOKE}}, hand-drawn, {{BRAND_PALETTE}}, only visible to the curious"*. Consumer: footer hidden div triggered by keyboard sequence.

**21 — Light / dark theme variants.** Every hero/illustration generated in BOTH light AND dark variants. Prompt suffix split: *"...on cream paper background"* vs *"...on midnight navy background"*. Manifest stores both paths; CSS `prefers-color-scheme` swaps via `<picture><source media="(prefers-color-scheme: dark)" srcset=...>`.

**22 — Reduced-motion poster frames.** Static poster frames replacing motion video for users with `prefers-reduced-motion: reduce`. Prompt: *"single dramatic still frame of {{VIDEO_SCENE_SUBJECT}}, cinematic lighting, {{BRAND_PALETTE}}, painterly"*. Consumer: `<video poster={...} preload="metadata">` + CSS reduced-motion gate.

**23 — Logo lockups (horizontal + stacked + monogram).** Three variants of the wordmark in different layouts. Prompt: *"clean wordmark logo lockup for {{BRAND_NAME}}, {{LAYOUT_VARIANT}}, {{BRAND_HEX}} ink, vector style, transparent background, NO illustrative elements, typography only"*. Style: DESIGN. Three slots: `logo-horizontal.svg` | `logo-stacked.svg` | `logo-monogram.svg`. Consumer: `<Header>`, `<Footer>`, favicon source. Validate via real-favicongenerator API.

**24 — Maskable PWA icon + full favicon kit source.** Single 1024×1024 master icon with 10% safe-zone padding to feed `real-favicongenerator` (or ImageMagick fallback) for all 9 favicon outputs + maskable variant. Prompt: *"app icon for {{BRAND_NAME}}, central monogram or symbol in {{BRAND_HEX}}, geometric, 10% safe-zone padding around edge, square 1:1, no text"*. Consumer: `site.webmanifest` icons[] + `apple-touch-icon` + `favicon.ico`.

**25 — Apple touch icon (180×180 polished).** Higher-effort iOS home-screen icon (rendered separately from #24 master at higher quality + Apple's rounded-corner expectation). Prompt: *"iOS home screen app icon for {{BRAND_NAME}}, 180×180, central monogram on solid {{BRAND_HEX}}, no inset shadow (iOS applies it), no text"*. Consumer: `<link rel="apple-touch-icon">`.

**26 — Custom cursor glyph (desktop ≥1024px).** 32×32 PNG cursor for desktop interactive zones (Brian's "click ripple only" rule — NO follow cursor, but a branded *resting* cursor is fine). Prompt: *"minimalist cursor glyph, {{BRAND_HEX}} arrow with small heart accent, 32×32, transparent PNG, sharp pixel edges"*. Consumer: `body { cursor: url('/images/ideogram/cursor.png'), auto; }` inside `@media (min-width: 1024px) and (hover: hover)`.

**27 — Footer / page watermark.** 1:1 subtle watermark glyph rendered in `--watermark-color` (very low opacity). Prompt: *"single decorative mark for {{BRAND_NAME}}, {{BRAND_HEX}} ink on transparent, geometric monogram, no text"*. Consumer: footer background-image with `opacity: 0.05`.

**28 — Press kit hero (high-res, 4K).** 4096×2304 source asset for press release inclusion + magazine reprints. Prompt same as #1 with `--res=2048` and `renderingSpeed: 'QUALITY'`. Consumer: `/press-kit` download page link.

**29 — Social-share variant per channel.** Distinct compositions tuned to each platform's UX (LinkedIn = professional, Instagram = vibrant square, TikTok = vertical 9:16 with motion-implied composition). Three slots per route: `share-linkedin-{route}.png` (1200×627) | `share-instagram-{route}.png` (1080×1080) | `share-tiktok-{route}.png` (1080×1920). Consumer: Postiz / Buffer / native share API.

**30 — Ticker / scroll-progress glyph.** Small repeating SVG element used as marquee scroll ticker + scroll-progress indicator bar at top of page. Prompt: *"small decorative SVG glyph 32×32 of {{BRAND_SYMBOL}}, single color {{BRAND_HEX}}, geometric, tiles seamlessly"*. Style: DESIGN | format: SVG. Consumer: `<ScrollProgress>` + `<Ticker>` (marquee.css `@keyframes ticker`).

## Catalog file (project-side)
```ts
// src/data/ideogram/methods.ts
import type { IdeogramSlot } from './_types';
export const IDEOGRAM_METHODS: IdeogramSlot[] = [
  { id: 'hero-home', method: 1, prompt: '...', aspect: '16:9', styleType: 'REALISTIC', renderingSpeed: 'QUALITY', outputPath: '/images/ideogram/hero-home.webp', outputFormat: 'webp', consumers: ['src/pages/home.tsx'], fallback: '/images/hero-fallback.jpg', cacheKey: '', brandTokens: {} },
  // ...30 entries total, one per method × N routes/variants
];
```

## Pipeline script (one-time + idempotent)
```js
// scripts/generate-ideogram-assets.mjs — pseudo-skeleton
import { IDEOGRAM_METHODS } from '../src/data/ideogram/methods.js';
import { resolveTokens, callIdeogramV3, writeManifest, hashSlot } from './_ideogram-lib.js';
const manifestPath = 'public/_ideogram/manifest.json';
const existing = await readManifest(manifestPath);
for (const slot of IDEOGRAM_METHODS) {
  const resolved = resolveTokens(slot, brand);
  const key = hashSlot(resolved);
  if (existing[slot.id]?.cacheKey === key) continue; // skip cached
  const asset = await callIdeogramV3(resolved); // POST /api/v1/ideogram-v3/generate
  await saveAsset(asset, slot.outputPath);
  existing[slot.id] = { ...slot, cacheKey: key, generatedAt: new Date().toISOString() };
}
await writeManifest(manifestPath, existing);
```

## API contract (Ideogram v3)
```ts
POST https://api.ideogram.ai/v1/ideogram-v3/generate
Headers: { 'Api-Key': process.env.IDEOGRAM_API_KEY }
Body: { prompt, negative_prompt?, aspect_ratio, rendering_speed: 'QUALITY', style_type, magic_prompt: 'ON', num_images: 1, seed? }
Returns: { data: [{ url, prompt, resolution, is_image_safe, seed, style_type }] }
```

## Build gates
- Manifest exists + every `IDEOGRAM_METHODS[i].outputPath` resolves to a real file in `public/` build output (asset-existence gate from always.md).
- No slot has empty `prompt` after token resolution.
- Methods #1, #2, #3, #12, #23, #24, #25 = MANDATORY (build fail if missing). Others = strongly recommended.
- Delight-moment registry (`_iteration_log.json[current].delight_moments[]`) gets entries for #12 (404 mascot), #13 (confetti), #18 (sticker pack), #20 (Easter egg), #26 (custom cursor) when shipped.

## Cost guardrail
QUALITY render ≈ $0.08 / image | DEFAULT ≈ $0.04 | TURBO ≈ $0.02. Catalog of 30 methods × 5-15 routes = 150-450 images. Use TURBO for variants (#3 twitter, #21 light/dark mirror, #29 social channel mirrors); QUALITY only for #1 hero, #16 PDF cover, #28 press kit. Budget: ~$10-20 per full site generation. Cache aggressively — re-runs of same prompt+seed return cached asset.

## Reference incident (2026-05-11 — njsk.org)
Brian's verbatim ask: *"Leverage creativity to fully include Ideogram assets using 30 different methods across the entire site."* Catalog codified here so future site builds fan all 30 methods automatically. Pipeline plug-in to skill 15 site-generation as Step 6b (post-research, pre-typecheck).
