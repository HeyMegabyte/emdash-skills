---
name: "brand-and-content-system"
description: "Extract real brands (Wayback for rebuilds). Copy system, headline/CTA rules, trust surfaces, legal pages, SEO+structured data, anti-AI-slop, microcopy, DESIGN.md, W3C DTCG tokens, pSEO 5 types, GEO/AI search."
metadata:
  version: "2.1.0"
  updated: "2026-04-23"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - email-templates.md
  - social-automation.md
  - seo-and-keywords.md
  - documentation-and-codebase-hygiene.md
---

# 09 — Brand and Content System

Submodules: email-templates (branded HTML via Resend), social-automation (Postiz on Coolify), seo-and-keywords (per-page targeting, Yoast, schema), documentation-and-codebase-hygiene (README/CLAUDE.md/JSDoc sync).

## Brian's Brand Voice
Slogans: "Open-Source Wizardry. 100% Wizardry. 0% Robes." / "Often imitated, never duplicated." Newsletter: "Lab Insights Journal". Handle: @HeyMegabyte. Email: hey@megabyte.space / brian@megabyte.space. Tone: professional but irreverent, "Hey" not "Hi", first-person Megabyte Labs. Always "cross-platform"+"open-source". Install Doctor: "single command"/"one-liner". Hero: "[Topic] **Innovation**". Footer CTA: "Let's Talk". Rates: $140/hr ($70 nonprofit), $100/mo WordPress. Social: all platforms, "Megabyte Minis" YouTube, Dev.to, Patreon.

Psychology: reciprocity (teach), social proof near CTAs, authority (depth/numbers), unity ("we/us"), Peak-End Rule.

## Brand Extraction (Rebuilds)

1. Screenshot existing (Wayback if down). Extract logo/colors/fonts/tone. Never discard equity.
2. **Color extraction (NON-NEGOTIABLE):** Screenshot with Playwright, GPT-4o extracts hex (logo priority), cross-ref logo, build palette, validate WCAG AA. NEVER invent, NEVER use Emdash defaults for clients, NEVER infer from category.
3. **Logo-luminance + source-theme drives theme (NON-NEGOTIABLE — gates template selection):** Two-signal rule. Signal A = logo dominant-color luminance (WCAG formula). Signal B = source-site dominant background luminance (Playwright screenshot of `body` background — average pixel luminance). Decision: if BOTH signals agree (logo dark + source bg light → `theme="light"`; logo light + source bg dark → `theme="dark"`), match them. If they disagree, source-site theme wins UNLESS source design score <7/10 (then logo wins). When source site is high-quality (visual quality ≥7/10 via GPT-4o detail:low review of homepage screenshot), ***match the source theme verbatim*** — "their original is already great" trumps "we default to dark". Set theme BEFORE template selection. Reject any palette where logo-on-background contrast <4.5:1 (WCAG AA). Logo legibility outranks aesthetic preference. CLAUDE.md "Dark-first" applies to accent-rich Emdash/SaaS brands, NOT to (a) logo-driven non-profit/serif clients (njsk.org 2026-04-30 — dark burgundy wordmark invisible on dark BG), (b) high-quality light-themed source brands (lonemountainglobal.com 2026-04-30 — original is a polished light-theme design with mountain splash + serif logo; rebuild MUST stay light to preserve brand integrity). Confidence 0.97.

3a. **Brand-element extraction (***LOGO IS A GOLD MINE — extract its DNA, don't just copy the file***):** When source logo is found, single GPT-4o vision call returns `{font_family_guess, suggested_heading_font, suggested_body_font, font_weight, letterspacing, has_icon_mark, icon_mark_description, icon_mark_dominant_color, decorative_motif_description, motif_extractable (bool)}`. Apply: (i) matched Google Font becomes `--font-heading` site-wide — same hand drew the logo and the headlines; (ii) when `motif_extractable=true` (mountain silhouette, wave, leaf, geometric mark embedded in logo), crop the icon-only region (`magick logo.png -alpha extract -trim +repage`), upscale 2-4x via Real-ESRGAN/DALL-E variation, save as `assets/brand-splash.png` (full-bleed hero background) + `assets/brand-mark.png` (favicon icon source). The lonemountainglobal.com `mountain-background-splash.png` extracted from the wordmark logo is the canonical example — combined with the matched logo font, the hero feels designed by the same studio. See skill 12/15 media-acquisition.md "Background-asset-from-logo extraction".
4. **Logo (NON-NEGOTIABLE):** Every project needs premium logo. See Skill 12 for full process.
5. Audit: logo found+rated>=7/10+works 16-512px, colors EXTRACTED, palette WCAG AA, typography+tone+messages identified.

## Brand Extraction from Physical Assets (***LOCAL BUSINESS — NO WEBSITE***)

Most local businesses have no website or a terrible one. Brand identity lives in the physical world — signage, storefront, business cards, uniforms, vehicle wraps. Extract from these:

**Signage/Storefront (Google Street View + Places Photos):**
1. Google Street View Static API (`GOOGLE_MAPS_API_KEY`): `https://maps.googleapis.com/maps/api/streetview?size=1200x800&location={lat},{lng}&source=outdoor` — captures storefront/signage
2. Google Places photos: filter for `types: ["exterior", "storefront"]` — business owner uploads often show signage
3. GPT-4o vision on storefront photo: extract sign text (business name font), sign colors (exact hex), logo if visible, building color scheme, awning/accent colors
4. Prompt: "Extract brand identity from this business storefront photo. Return JSON: {sign_text, sign_font_style (serif/sans/script/decorative/hand-lettered), primary_color (hex), secondary_color (hex), accent_color (hex), logo_description, overall_aesthetic (modern/classic/rustic/industrial/cozy/clinical/upscale), confidence (0-1)}"

**Business Cards/Collateral (user uploads via form):**
GPT-4o vision extracts: logo (crop region), colors (exact hex from printed colors), font identification, tagline, phone/email/address for NAP verification.

**Vehicle Wraps/Uniforms (Google Places photos):**
Often the most brand-consistent asset. Extract colors and logo from team/vehicle photos in Places gallery.

**Color extraction priority for local businesses:** signage → logo → storefront awning/trim → interior decor → vehicle wrap → business card → category default (LAST RESORT). Each color tagged with `color_source` for provenance.

**Font matching from signage:** GPT-4o identifies font style → map to closest Google Font: script→Dancing Script, serif→Playfair Display, modern sans→Inter, hand-lettered→Caveat, decorative→varies. Never use exact proprietary fonts — find the spirit, not the letter.

## Brand Inference (New Products)
Dev tool: technical/dark/monospace. SaaS: professional/clean/cards. Agency: confident/bold. E-commerce: friendly/product-focused. Nonprofit: warm/impact imagery. API: technical/docs-forward.

Emdash defaults (NOT for clients): #00E5FF, #50AAE3, #060610. Sora/Space Grotesk/JetBrains Mono.

## Anti-AI-Slop Detection (MANDATORY SCAN)
**Banned copy words:** delve|leverage|unleash|revolutionize|best-in-class|cutting-edge|discover|innovative|seamless|robust|synergy|elevate|empower|transformative. **Banned patterns:** "Welcome to"|"Discover [product]"|vague aspirational headlines ("Build the future of work")|hedging ("may help you," "can potentially")|generic superlatives. **Banned design tells:** Inter as sole font|purple-blue gradients|uniform 16px border-radius everywhere|centered everything|Hero/Lucide as sole icon set|abstract 3D blobs|uniform fade-in on all elements|plastic AI stock photos. **Fix:** Ask "Would the founder actually say this?" If no → rewrite. Color signals function, not decoration. Motion must serve one of three purposes.

## Copy System
Headlines: benefit-first, specific, numbers, max 8 words. Subheadings: expand promise, 15-25 words. Body: one idea/paragraph, 2-4 sentences, active, concrete, benefit-oriented. CTAs: specific action verb first, gradient primary+ghost secondary, above fold+page end. Never: "Click here"|"Submit"|"Learn more".

## Brand Voice Enforcement
Personality trait mapping: Expert→precise industry terms (not vague metaphors)|Direct→short declarative sentences (not passive)|Pragmatic→outcomes/implementation (not theory). Vocabulary lists: always-use/never-use/prefer-over. Max sentence length: 25 words. Banned structures: passive voice, hedging, em dashes mid-sentence. Monthly drift audit: check copy against vocabulary lists and structural rules.

## Microcopy System
**Error messages:** [What happened] + [What to do]. Tone: empathetic, solution-oriented. "Payment failed. Try a different card or contact support." Never: "Error 500", technical jargon, user blame. Flesch 70+. **CTAs:** action verb first, max 3 words preferred. "Start building"|"Ship today"|"Get access". **Empty states:** acknowledge absence + suggest action. "No projects yet. Create your first one." Never just "No results". **Toasts:** past tense for success ("Project created"), present for in-progress ("Saving…"), plain-language for errors. **Form labels:** noun phrases, sentence case. Helper text: one line, 10 words max.

## Machine-Readable Brand Documentation
**DESIGN.md** (6 sections): Visual Theme → Color Palette (hex+role) → Typography (family+scale+weight) → Spacing & Layout (grid+max-width+gaps) → Components (button/card/input specs) → Elevation (shadow system). Acts as AI design contract — LLMs parse it instead of Figma. **W3C DTCG tokens (2025.10 spec):** `.tokens.json` (MIME: `application/design-tokens+json`). Structure: `{"token": {"$type": "color", "$value": {...}, "$description": "..."}}`. Aliasing via `{base.color}`. Composite types: shadow|border|typography|transition. Tooling: Style Dictionary, Tokens Studio, Supernova. Export both `DESIGN.md` + `tokens.json` for every project.

## Trust Surfaces
Named testimonials > logos > stats > awards > media > ratings > GitHub stars. Every commercial page: security badge, compliance, real contact, team photos, case studies.

## Legal: Privacy Policy, Terms, Cookie Policy (EU), AUP (SaaS). Plain language, dark theme.

## IA: Hero, social proof, features (3-4), how it works (3 steps), testimonials, pricing, FAQ (4-6), final CTA, footer. Content density: hero 20-30, features 15-25, testimonials 20-40, FAQ 30-60, body 50-100.

## SEO
Per-page: title 50-60 (keyword+brand), meta 120-156, one H1, canonical, OG+Twitter, JSON-LD (Organization, WebSite+SearchAction, WebPage, FAQPage, Product, BreadcrumbList, SoftwareApplication). robots.txt, sitemap.xml, internal linking, alt text.

Keywords: primary in title/H1/first paragraph/meta. Longtails in H2s (1-2/page). Density 1-2%. Lengths: homepage 500+, feature 600+, pricing 400+, blog 1000+, about 300+. Internal links 2-3/page.

## Programmatic SEO Page Types
1. **Integration pages:** "[Tool A] + [Tool B] integration" — Zapier model (1.3M keywords). Template: shared data points, step-by-step setup, real use cases.
2. **Comparison/alternative pages:** "[Competitor] alternatives" — feature matrix, honest differentiators, social proof.
3. **Use-case/industry pages:** "[Product] for [vertical]" — Atlassian model. Vertical-specific pain points + screenshots.
4. **Template/resource libraries:** Downloadable assets gating signups. Each template = indexable URL.
5. **Location/segment pages:** Geographic or persona variations. Quality floor: 300+ unique words + page-specific data, 30-40% content differentiation.

## GEO — AI Search Optimization
Lead with 40-60 word quotable summary (LLMs excerpt this). Explicit entity definitions. FAQ sections for AI extraction. Statistics with clear sources. Comparison tables with structured data. ChatGPT favors Wikipedia/G2 citations; Perplexity favors Reddit/YouTube; Google AI Overviews favor traditionally ranked pages. JSON-LD FAQ+HowTo+Article on every content page.

## Readability (Flesch >=60 NON-NEGOTIABLE)
Sentences 15-20 avg (never >25). Paragraphs 2-4. Common words. Active voice. Contractions. Front-load. Hero 80+, body 55-65, CTAs 80+, FAQ 60+, errors 70+, legal 50+.

## Brian's Copy Voice
Sharp. Punchy. Irreverent. Love-forward. Nonprofit: warm, never preachy. SaaS: technical, zero fluff. Hero: bold, benefit-first. Errors: human, helpful.

Examples: "The same technology reshaping Wall Street, pointed at a soup kitchen." Anti-patterns: "Welcome to...", "Discover...", "Unleash...", "Click here", "Submit", corporate slop.

Conversion: headlines+numbers +36%, benefit>feature +28%, proof near CTAs +15-20%. Servant framing: "Start helping today" > "Sign up now". Truth: "127 donors" not "hundreds".

## Document Generation
PDF: reportlab, pdftoppm verify, brand colors. DOCX: python-docx, LibreOffice verify.

## Web Property Consistency
OG brand colors/fonts. Manifest matches voice. humans.txt current. Emdash sites cross-link (alternate, sameAs). browserconfig tile=#060610.
