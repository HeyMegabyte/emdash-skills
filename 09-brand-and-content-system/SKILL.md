---
name: "Brand and Content System"
description: "Extract real brands before inventing (Wayback Machine for rebuilds). Business-type inference for tone and style. Copy system with headline/CTA rules. Trust surfaces (testimonials, logos, stats). Legal pages. Information architecture. SEO content with structured data, meta tags, and sitemap. PDF and DOCX generation."
layer: "product-compiler"
canonical-owner-of:
  - "brand-extraction"
  - "copy-system-and-tone"
  - "trust-surfaces"
  - "legal-pages"
  - "information-architecture"
---

# 09 — Brand and Content System

> Extract the real brand before inventing one. Write with clarity, proof, and purpose.

---

## Core Principle

**Brand is not decoration — it's trust.** Every word, image, and interaction either builds or erodes trust. The content system must produce copy that is specific, credible, and conversion-aware while feeling authentic to the product's identity.

### The Three Brand Goals (Shape Every Content Decision)
1. **End-user value** — does this content help the user accomplish their goal?
2. **Business strategy** — does this content support conversion through ethical psychology?
3. **projectsites.dev reputation** — does this content make our ecosystem look world-class?

### Psychology-Informed Content Strategy (skill 51)
- **Reciprocity:** give genuine value in the content itself (teach, don't just market)
- **Social proof:** place testimonials, stats, and logos near every conversion point
- **Authority:** demonstrate expertise through depth, specificity, and real numbers
- **Unity:** use "we/us" language to create shared identity with users
- **Peak-End Rule:** the last section of every page should be the most compelling

---

## Brand Extraction (Rebuilds)

When rebuilding an existing site or product:

### 1. Capture Before Inventing
- Screenshot the existing site (Wayback Machine if down)
- Extract: logo, colors, fonts, tone, tagline, imagery style
- Identify: what's worth preserving, what needs improvement
- **Never discard existing brand equity without explicit permission**

### 2. Color Extraction Pipeline (NON-NEGOTIABLE — extract, never invent)

**The #1 brand failure mode: inventing colors instead of extracting them from the real website and logo.**

Example: njsk.org (Newark soup kitchen) has a distinctive burgundy/maroon throughout their site
and logo. A naive LLM guesses "warm blue/green for nonprofits." That's WRONG. The correct
answer is to extract the actual burgundy from the real site and use it as the primary color.

**The rule: ALWAYS extract colors from the actual website and logo FIRST. Only invent colors
for businesses with zero web presence.**

#### Step 1: Screenshot the original website with Playwright
```typescript
// Take screenshot of the homepage
const page = await browser.newPage();
await page.goto('https://njsk.org', { waitUntil: 'networkidle' });
const screenshot = await page.screenshot({ fullPage: true });
```

#### Step 2: Send screenshot to GPT-4o for color extraction
```
Prompt: "Analyze this website screenshot. Extract the EXACT brand colors used.
Focus on:
1. Logo colors (highest priority — the logo defines the brand)
2. Header/nav background and text colors
3. Primary CTA button colors
4. Accent colors used for links, highlights, borders
5. Background colors (main and section alternates)

Return hex codes for each color found. Identify which is primary (most prominent
in the logo and headers), secondary, and accent. Do NOT suggest alternative colors.
Do NOT pick colors based on the industry. Extract ONLY what is actually on the page."
```

#### Step 3: Cross-reference with logo colors
- If the logo has a dominant color (e.g., burgundy), that IS the primary color
- The logo color trumps everything — it was chosen intentionally by the business
- If the website uses the logo color consistently, confidence is HIGH
- If the website uses different colors than the logo, flag the inconsistency

#### Step 4: Build the palette from extracted colors
```
Priority order for primary color selection:
1. Dominant color in the logo (highest weight)
2. Color used in the header/nav
3. Color used in CTA buttons
4. Color used for headings and emphasis

DO NOT:
- Substitute a "more modern" color for the extracted one
- Pick blue because "nonprofits use blue" — look at the ACTUAL site
- Use the Emdash/Megabyte defaults (#00E5FF cyan) for client brands
- Infer colors from the business category — that's lazy and wrong
```

#### Step 5: Validate the palette
- Check WCAG AA contrast of primary color on dark background (#060610)
- If contrast fails: slightly lighten/brighten the extracted color (shift L in HSL by +10-15%)
- NEVER change the hue — a business's burgundy should stay burgundy, not become red or pink
- Generate a harmonious palette: primary (from logo), secondary (complementary), surface, text

#### When there is NO website at all:
Only then may you infer colors based on industry + AI suggestion:
- Use Skill 51 (Wisdom) color psychology as guidance
- Generate 3 palette options and A/B test with GPT-4o vision on mockups
- Document that colors are AI-generated, not extracted

### 3. Logo Requirement (NON-NEGOTIABLE)
**Every project MUST have a premium logo.** See Skill 12 for the full process:
- **If the business has a logo:** Find it (Logo.dev → Brandfetch → scrape site → Google Images → favicon). Visually inspect quality. AI-enhance if needed.
- **If no logo exists:** Generate with Ideogram v3 API. Create 4-6 variants. A/B select the best one using GPT-4o vision scoring. Process into full favicon + brand asset set.
- **If user doesn't like it:** Regenerate with the same process, varying style. Never settle for mediocre.
- The logo appears EVERYWHERE: header, favicon, OG images, emails, app icons. It must be premium.

### 4. Brand Audit Checklist
```
[ ] Logo found, enhanced, or generated (see Skill 12 for full process)
[ ] Logo visually inspected and rated >= 7/10 by GPT-4o
[ ] Logo works at 16px (favicon) AND 512px (app icon)
[ ] Original website screenshotted with Playwright
[ ] Colors EXTRACTED from screenshot via GPT-4o vision (NOT invented)
[ ] Primary color matches the logo's dominant color
[ ] Color palette passes WCAG AA contrast on dark background
[ ] Typography identified (font families, weights)
[ ] Tone characterized (formal/casual, technical/friendly)
[ ] Key messages preserved
[ ] Trust signals preserved (testimonials, logos, stats)
[ ] Visual style characterized (minimal/rich, dark/light)
```

---

## Brand Inference (New Products)

When no existing brand:

### Business-Type Inference
| Product Type | Default Tone | Default Style |
|-------------|-------------|---------------|
| Developer tool | Technical, direct, no fluff | Dark, monospace accents, code snippets |
| SaaS platform | Professional, benefit-focused | Clean, card-based, gradients |
| Agency/portfolio | Confident, aspirational | Full-bleed images, bold type |
| E-commerce | Friendly, trust-building | Product-focused, social proof heavy |
| Non-profit | Warm, mission-driven | Impact imagery, donation CTAs |
| Community | Inclusive, energetic | Member stories, activity feeds |
| API service | Technical, precise | Documentation-forward, usage examples |

### Default Brand System (Emdash/Megabyte ONLY — NOT for client brands)

**These defaults apply ONLY to projectsites.dev itself and Megabyte Labs properties.**
**For client/generated websites: ALWAYS extract colors from their actual website and logo.**

| Element | Value |
|---------|-------|
| Primary | Cyan #00E5FF |
| Secondary | Blue #50AAE3 |
| Background | Near-black #060610 |
| Body font | Sora, sans-serif |
| Heading font | Space Grotesk, sans-serif |
| Mono font | JetBrains Mono, monospace |
| Tone | Technical, confident, direct |
| Style | Dark-first, gradient accents, premium feel |

**Common mistake:** Using #00E5FF cyan as the primary color for a client's nonprofit site
when their real logo is burgundy. The cyan is OUR brand, not theirs. ALWAYS extract first.

---

## Copy System

### Headline Rules
- Lead with the benefit, not the feature
- Be specific (not "The Best Tool" but "Ship 3x Faster")
- Use numbers when credible
- Match the product's sophistication level to the audience
- Max 8 words for primary headlines

### Subheading Rules
- Expand on the headline's promise
- Add specificity or social proof
- 15-25 words
- Create curiosity or urgency

### Body Copy Rules
- One idea per paragraph
- Short paragraphs (2-4 sentences)
- Active voice
- Concrete language (not abstract)
- Benefit-oriented (what does the user get?)

### CTA Rules
- Specific action ("Start Free Trial" not "Submit")
- Create urgency without being sleazy
- Primary CTA: high-contrast button with gradient
- Secondary CTA: text link or ghost button
- Every page has at least one CTA
- CTAs above the fold and at page end

---

## Trust and Proof Surfaces

### Social Proof Hierarchy (most to least powerful)
1. Named testimonials with headshots and titles
2. Company logos of known customers
3. Usage statistics ("10,000+ developers")
4. Industry awards or certifications
5. Media mentions
6. Star ratings / review counts
7. GitHub stars / npm downloads
8. "As seen in" logos

### Trust Elements (include on every commercial page)
- **Security badge** — if handling data or payments
- **Compliance note** — GDPR, SOC 2, HIPAA if applicable
- **Contact info** — real email, not just a form
- **Physical address** — if applicable
- **Team photos** — for agency/service businesses
- **Case studies** — for B2B products

---

## Legal and Trust Pages

### Required Legal Pages
- **Privacy Policy** — required by law, linked in footer
- **Terms of Service** — required for any commercial product
- **Cookie Policy** — required in EU, linked in footer
- **Acceptable Use Policy** — for SaaS/platform products

### Legal Content Rules
- Plain language (not legalese)
- Accurate to what the product actually does
- Include effective date
- Include contact information for questions
- Dark theme consistent with site design

---

## Information Architecture

### Page Hierarchy
```
Homepage
├── Product/Features
├── Pricing
├── About / Team
├── Blog / Resources
├── Documentation (if applicable)
├── Contact
├── Privacy Policy
├── Terms of Service
└── 404 Page
```

### Homepage Sections (typical flow)
1. **Hero** — headline, subheading, CTA, hero image/video
2. **Social proof bar** — logos or stats
3. **Features** — 3-4 key features with icons/illustrations
4. **How it works** — 3-step process
5. **Testimonials** — 2-3 quotes
6. **Pricing** — tiers if applicable
7. **FAQ** — 4-6 common questions
8. **Final CTA** — repeat primary action
9. **Footer** — links, social, legal, newsletter

### Content Density Rules
- Hero: 20-30 words max (headline + subheading)
- Feature cards: 15-25 words each
- Testimonials: 20-40 words each
- FAQ answers: 30-60 words each
- Body sections: 50-100 words each

---

## SEO Content Requirements

### Per-Page SEO
- Title tag (50-60 chars, primary keyword + brand)
- Meta description (150-160 chars, CTA-oriented)
- H1 tag (one per page, contains primary keyword)
- Canonical URL
- OG title, description, image
- Twitter card tags

### Structured Data
- Organization (all pages)
- WebSite with SearchAction (homepage)
- WebPage (every page)
- FAQPage (FAQ sections)
- Product/Offer (pricing pages)
- BreadcrumbList (subpages)
- SoftwareApplication (tool sites)

### Content SEO
- robots.txt (allow crawling, disallow admin)
- sitemap.xml (all public pages)
- Internal linking (every page links to related pages)
- Alt text on all images (descriptive, keyword-aware)

---

## Document Generation

### PDF Reports
- Use reportlab for generation
- Render with pdftoppm for visual verification
- Professional typography and layout
- Brand-consistent colors and fonts
- Save to `output/pdf/`

### DOCX Documents
- Use python-docx for generation
- Render via LibreOffice → PDF → PNG for verification
- Consistent typography throughout
- Save to `output/doc/`

---

## Trigger Conditions
- New project (establish brand)
- Rebuild of existing site (extract brand)
- Content creation or revision
- Legal page creation
- SEO audit

## Stop Conditions
- Brand established and documented
- Content complete and reviewed
- Legal pages present

## Cross-Skill Dependencies
- **Reads from:** 02-goal-and-brief (product positioning), 04-preference-and-memory (tone preferences, VoC)
- **Feeds into:** 10-experience-and-design (visual identity), 12-media-orchestration (brand for media), 06-build-and-slice-loop (content to implement)

---

## What This Skill Owns
- Brand extraction and inference
- Copy system and tone
- Trust and proof surfaces
- Legal pages
- Information architecture
- SEO content
- Document generation (PDF, DOCX)
- See STYLE_GUIDES.md for Mailchimp + GOV.UK writing rules

## Web Property Brand Consistency (skill 24)

Branding must be consistent across ALL web property files, not just visible pages:

- **OG images** (1200x630) must use brand colors (cyan #00E5FF, blue #50AAE3, black #060610) and brand fonts
- **site.webmanifest** name, short_name, and description must match the brand voice established in this skill
- **humans.txt** must list the actual tech stack, team, and tools used — keep it current with each deploy
- **All sites in the Emdash ecosystem** must cross-link via `rel="alternate"` in HTML and `sameAs` in Organization JSON-LD
- **Shortcut icons** (96x96) in the manifest must use the brand icon style, not generic placeholders
- **browserconfig.xml** tile color must match brand background (#060610)

---

## What This Skill Must Never Own
- Visual layout (→ 10)
- Animation (→ 11)
- Image/video generation (→ 12)
- Analytics (→ 13)
- Deployment (→ 08)

---

## SEO-Driven Content (skill 28 Integration)

### Every Page Written Around Keywords
1. Get target keywords from skill 28 research
2. Primary keyword in: title, H1, first paragraph, meta description
3. Longtail phrases in: H2s, body paragraphs (1-2 per page)
4. Semantic variations woven naturally throughout
5. Keyword density: 1-2% (never stuffed, always natural)

### Content Length by Page Type
| Page | Min Words | Keyword Focus |
|------|-----------|--------------|
| Homepage | 500+ | Holy-grail keyword |
| Feature page | 600+ | Feature-specific longtail |
| Pricing page | 400+ | "pricing" + product keyword |
| Blog post | 1000+ | Longtail informational |
| About page | 300+ | Brand + mission keywords |
| Legal pages | 500+ | None (plain English only) |

### Internal Linking Strategy
- Every page links to 2-3 other pages
- Anchor text uses descriptive phrases (not "click here")
- Homepage links to all main pages
- Blog posts link to product pages naturally
- Related content cross-links

## Flesch Reading Ease: >= 60 (Non-Negotiable)

### Rules for All Content
- Sentences: 15-20 words average (never exceed 25)
- Paragraphs: 2-4 sentences max
- Words: common over complex ("use" not "utilize")
- Voice: active over passive
- Contractions: use them ("you'll" not "you will")
- Front-load: important information first

### Scoring by Section
| Section | Target | Achieved By |
|---------|--------|------------|
| Hero | 80+ | 5-8 word headline, simple subtext |
| Body | 55-65 | Short sentences, common words |
| CTAs | 80+ | Action verb + object (4 words) |
| FAQ answers | 60+ | Direct answer first, then detail |
| Error messages | 70+ | Simple subject-verb-object |
| Legal | 50+ | Plain English, not legalese |

---

## Brian's Voice (Copy System)

> Sharp. Punchy. Irreverent. Love-forward. No bullshit.

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| Nonprofit / Mission | Warm but direct, never preachy | "Your clean driveway feeds a family." |
| SaaS / Developer | Technical but human, zero fluff | "Ship 3x faster. No config required." |
| Landing page hero | Bold, benefit-first, urgent | "The same technology reshaping Wall Street, pointed at a soup kitchen." |
| Error messages | Human, helpful, never blame user | "Something went wrong on our end. Try again?" |
| Legal pages | Plain English, not legalese | Clear, honest, readable at 8th grade level |

### Microcopy Rules
- Form labels: conversational ("Your email" not "Email Address")
- Placeholders: example data ("jane@example.com")
- Validation: friendly ("Looks like that email needs an @ symbol")
- Success: celebratory ("You're in! Check your inbox.")
- Loading: informative ("Setting up your account...")

### Good Examples (Brian's Voice)
- "The same technology reshaping Wall Street, pointed at a soup kitchen."
- "One number. No hold music. No bureaucracy."
- "Your clean driveway feeds a family."
- "Even the machine has limits. But the mission doesn't."
- "Built by one person. Powered by everything."
- "Not a charity. A system that works."

### Bad Examples (Anti-Patterns)
- "Welcome to our innovative platform that leverages cutting-edge AI..." (corporate slop)
- "Click here to learn more about our services" (generic, passive)
- "We're excited to announce..." (empty filler)

### Anti-Pattern Words (Never Use)
- "Welcome to...", "Discover...", "Unleash...", "Revolutionize..."
- "Click here", "Submit", "Learn more"

### Research-Backed Copy Principles

#### Conversion (Source: CXL Institute, Copyhackers)
- Headlines with numbers convert 36% better
- Benefit-oriented headlines outperform feature-oriented by 28%
- Social proof near CTAs increases click-through 15-20%
- Specificity builds trust: "$47/month" beats "affordable pricing"

#### Emotional Drivers (Source: Harvard Business Review)
- Stories with a named individual raise 2x more than statistics alone
- Show the transformation: before -> after

### Wisdom in Copy (skill 51)

#### Servant Framing
Write from the user's perspective, not ours:
- "Start helping today" > "Sign up now" (serve them, don't command)
- "See what's possible" > "Learn more" (inspire curiosity)
- "Join 1,200 builders" > "Create account" (unity, belonging)

#### Truth Over Hype (Proverbs 12:22, Marcus Aurelius)
- Real numbers: "127 donors" not "hundreds of supporters"
- Specific impact: "$47 feeds a family for a week" not "your donation helps"
- No superlatives without evidence: prove "fastest" or don't say it

#### Reciprocity (Cialdini)
Give value in the copy itself. Teach something. Share an insight. Make the reader smarter by reading your page, even if they never convert.

### Copy Quality Checklist
```
[ ] No placeholder text anywhere
[ ] No "Click here" or "Learn more" CTAs
[ ] Hero headline <= 8 words
[ ] Flesch score >= 60
[ ] All numbers specific, not vague
[ ] Error messages human and helpful
[ ] No corporate jargon or AI slop words
[ ] Servant framing (user benefit, not our feature)
[ ] Truth over hype (provable claims only)
```
