---
name: "quality-gates"
description: "Visual inspection via GPT-4o, SEO audit, accessibility checks, 10-dimension quality scoring. Criticism registry with universal + domain-specific rules."
updated: "2026-04-24"
---

# Quality Gates

## Visual Inspection (MANDATORY — ***COST-TIERED***)

**In-container `inspect.js`:** Takes HTML file path → sends first 14KB to vision model. Persona: "senior Stripe web designer." 8 scoring categories: color contrast, typography, layout/spacing, animations, images, mobile responsiveness, brand consistency, visual polish vs generic AI look. Scale 1-10.

**Tiered model selection:**
- **Draft rounds (1-2):** Workers AI Llama Vision (FREE) — catches layout breaks, missing elements, broken images, contrast failures. Sufficient for 80% of issues.
- **Final round (homepage only):** GPT-4o detail:low (~$0.02) — catches aesthetic nuance, brand harmony, "does it feel premium?" Only if Workers AI round scores ≥7 (no point polishing a broken layout).

**In-container loop:** After `npm run build`, run `node /home/cuser/inspect.js dist/index.html`. If score <8: fix → rebuild → re-inspect. Max 3 iterations. Workers AI for rounds 1-2, GPT-4o for final homepage check only.

**Post-deploy inspection:** Worker screenshots via `microlink.io` API → Workers AI Llama Vision for all pages → GPT-4o detail:low for homepage ATF only → logs score + issues to D1 audit_logs.

## 10-Dimension Quality Scoring

| Dimension | Min | What |
|-----------|-----|------|
| visual_design | 0.85 | Layout balance, whitespace, color harmony, depth, animations |
| content_quality | 0.85 | Real content, no placeholder, accurate, comprehensive |
| completeness | 0.85 | All sections present, all images used, all pages linked |
| responsiveness | 0.85 | 375/768/1024px clean, no overflow, touch targets >=44px |
| accessibility | 0.85 | WCAG AA contrast, heading hierarchy, alt text, ARIA, skip link |
| seo | 0.85 | JSON-LD, meta, canonical, OG, sitemap, keyword placement |
| performance | 0.85 | <100KB HTML, lazy images, font preconnect, no render blocking |
| brand_consistency | 0.85 | Matches research colors/fonts, logo prominent, NAP consistent |
| media_richness | 0.85 | 30+ unique images, 3-5 videos, no broken, no duplicates, proper sizing |
| text_contrast | 0.85 | 4.5:1 body, 3:1 large text, no washed-out combinations |

Overall must exceed 0.90 to auto-publish. Below 0.85 any dimension → fix required.

## SEO Audit Checklist

- [ ] Title tag 50-60 chars with primary keyword
- [ ] Meta description 120-156 chars with keyword + CTA
- [ ] Canonical URL on every page
- [ ] One H1 per page containing primary keyword
- [ ] Logical H2→H3 hierarchy
- [ ] JSON-LD LocalBusiness with: name, address, phone, geo, hours, image, sameAs
- [ ] FAQPage schema on FAQ section
- [ ] BreadcrumbList on sub-pages
- [ ] OG title, description, image (1200x630), URL
- [ ] Twitter card: summary_large_image
- [ ] robots.txt allowing all crawlers
- [ ] sitemap.xml with all pages + lastmod
- [ ] Internal links: every page → 2+ other pages
- [ ] Image alt text with relevant keywords
- [ ] Primary keyword density 1-2% (natural, not stuffed)

## Accessibility Audit

WCAG 2.2 AA requirements:
- Color contrast >=4.5:1 body text, >=3:1 large text/UI
- Heading hierarchy: single H1, sequential H2→H3
- All images: descriptive alt text (not "image" or "photo")
- Form inputs: visible labels, not just placeholder
- Skip-to-content link
- lang attribute on <html>
- Focus-visible on all interactive elements
- Touch targets >=24px (WCAG 2.2 2.5.8)
- Focus appearance visible (2.4.11)
- Dragging alternatives (2.5.7) for any drag interactions
- ARIA roles on custom widgets only (semantic HTML preferred)

## Criticism Registry (evolving rules)

Universal rules applied to ALL generated sites:

**Color & Contrast:** Never use washed-out, muddy, or generic palettes. Brand colors enhanced for vibrancy if needed while keeping hue family. Every text/background combo checked for WCAG AA. Dark overlays on image-backed text sections.

**Typography:** Consistent font-weight hierarchy. Hero headlines max 8 words. Section labels consistent case. Button text uses action verbs. NAP (Name, Address, Phone) consistent everywhere.

**Images:** No broken images (naturalWidth > 0). No duplicate images. All images lazy except hero. Proper width/height/aspect-ratio. Loading shimmer placeholders. Every image in assets/ used somewhere.

**Layout:** No horizontal scroll at 375px. All text readable at 375px (min 14px). Consistent card grid alignment. No orphaned sections. Full-width on mobile, max-width on desktop.

**Brand:** Logo in every page header. Brand colors dominate, not generic Tailwind defaults. Font from logo/brand research used throughout. Favicon set present.

**Content:** No lorem ipsum. No TODO stubs. No "Coming Soon" pages. Copyright year current. Footer has Privacy + Terms links. Contact info matches research data exactly.

**Performance:** HTML under 100KB. No console.log. No render-blocking scripts. Fonts preconnected. Smooth scroll (no jarring jumps). Back-to-top button.

**Safety:** No inappropriate content. Privacy notice on forms. Footer compliance links. rel="noopener noreferrer" on external links. COPPA compliance if child-facing. ProjectSites.dev attribution in FAQ.

## Domain-Specific Quality Rules

**Restaurant:** Menu must have prices. Food photos must look appetizing (well-lit, styled). Hours prominently displayed. Online ordering CTA if platform exists.

**Salon/Barber:** Services with prices. Booking CTA prominent. Before/after gallery. Stylist profiles with photos.

**Medical:** Provider credentials displayed. HIPAA-compliant form language. Emergency info. Insurance accepted list.

**Legal:** Practice areas with descriptions. Attorney profiles with bar info. Free consultation CTA. Client testimonials with attribution.

**Non-profit:** Donation CTA in hero + footer + every page. Impact counters animated. Volunteer signup. 501(c)(3) status visible.

**SaaS:** Pricing tiers comparison. Free trial CTA. Integration logos. API docs link. Status page link. SOC2/GDPR badges if applicable.

## Generalization Principle

When any specific criticism is received about a generated site, it MUST be generalized into a rule that applies to ALL future builds. Example: "njsk.org colors are wrong" → "NEVER guess colors from business category; ALWAYS extract from logo/website." The criticism registry grows with every user feedback cycle.
