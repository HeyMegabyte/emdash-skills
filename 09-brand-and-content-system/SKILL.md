---
name: "brand-and-content-system"
description: "Extract real brands before inventing (Wayback Machine for rebuilds). Business-type inference for tone and style. Copy system with headline/CTA rules. Trust surfaces (testimonials, logos, stats). Legal pages. Information architecture. SEO content with structured data, meta tags, and sitemap. PDF and DOCX generation."
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
3. **Logo (NON-NEGOTIABLE):** Every project needs premium logo. See Skill 12 for full process.
4. Audit: logo found+rated>=7/10+works 16-512px, colors EXTRACTED, palette WCAG AA, typography+tone+messages identified.

## Brand Inference (New Products)
Dev tool: technical/dark/monospace. SaaS: professional/clean/cards. Agency: confident/bold. E-commerce: friendly/product-focused. Nonprofit: warm/impact imagery. API: technical/docs-forward.

Emdash defaults (NOT for clients): #00E5FF, #50AAE3, #060610. Sora/Space Grotesk/JetBrains Mono.

## Copy System
Headlines: benefit-first, specific, numbers, max 8 words. Subheadings: expand promise, 15-25 words. Body: one idea/paragraph, 2-4 sentences, active, concrete, benefit-oriented. CTAs: specific action, gradient primary+ghost secondary, above fold+page end.

## Trust Surfaces
Named testimonials > logos > stats > awards > media > ratings > GitHub stars. Every commercial page: security badge, compliance, real contact, team photos, case studies.

## Legal: Privacy Policy, Terms, Cookie Policy (EU), AUP (SaaS). Plain language, dark theme.

## IA: Hero, social proof, features (3-4), how it works (3 steps), testimonials, pricing, FAQ (4-6), final CTA, footer. Content density: hero 20-30, features 15-25, testimonials 20-40, FAQ 30-60, body 50-100.

## SEO
Per-page: title 50-60 (keyword+brand), meta 150-160, one H1, canonical, OG+Twitter, JSON-LD (Organization, WebSite+SearchAction, WebPage, FAQPage, Product, BreadcrumbList, SoftwareApplication). robots.txt, sitemap.xml, internal linking, alt text.

Keywords: primary in title/H1/first paragraph/meta. Longtails in H2s (1-2/page). Density 1-2%. Lengths: homepage 500+, feature 600+, pricing 400+, blog 1000+, about 300+. Internal links 2-3/page.

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
