---
name: "Competitive Analysis"
description: "Before building any product: WebSearch for 3-5 competitors, scrape their homepages and pricing pages via WebFetch, extract features, pricing tiers, design patterns, and copy tone. Summarize in comparison table. Scrape source sites for brand assets during rebuilds. Use FireCrawl (self-hosted) for deep crawling."
layer: "capability-pack"
canonical-owner-of:
  - "competitor-feature-extraction"
  - "pricing-analysis"
  - "design-pattern-analysis"
context: "fork"
---

# Competitive Analysis

> Know the landscape before you build. Beat competitors on quality, not guesswork.

---

## Before First Line of Code

### Step 1: Identify Competitors
```
1. WebSearch for "[product category] + [target audience]"
   Example: "soup kitchen management software" or "donation platform nonprofit"
2. WebSearch for "best [product type] 2026"
3. WebSearch for "alternatives to [known competitor]"
4. Identify 3-5 direct competitors
```

### Step 2: Scrape Each Competitor
For each competitor, fetch:
```
1. Homepage → extract: hero copy, value proposition, design style
2. Pricing page → extract: tiers, amounts, features per tier
3. Features page → extract: feature list, categorization
4. About page → extract: team size, story, trust signals
5. Footer → extract: social links, legal pages, contact
```

Use WebFetch for public pages. Use FireCrawl (firecrawl.megabyte.space) for deeper crawling.

### Step 3: Visual Analysis
```
1. Take Playwright screenshots of each competitor at 1280px and 375px
2. Analyze: color palette, typography, layout patterns, image style
3. Note: what looks premium vs. generic
4. Identify: design patterns we should adopt or improve upon
```

### Step 4: Synthesize into Comparison Table

```markdown
## Competitive Landscape — [Product Category]

| Dimension | Competitor A | Competitor B | Competitor C | **Us (Target)** |
|-----------|-------------|-------------|-------------|-----------------|
| **Pricing** | $29/mo | $49/mo | Free + $99/mo | Free + $50/mo |
| **Free tier** | Yes (limited) | No | Yes (generous) | Yes (generous) |
| **Key feature** | [specific] | [specific] | [specific] | [better version] |
| **Design quality** | Generic | Premium | Dated | Premium (dark, bold) |
| **Mobile** | Good | Poor | Good | Excellent |
| **SEO/content** | Blog | None | Docs | Blog + Docs |
| **Social proof** | Logos | Testimonials | None | Both + stats |
| **Speed (LCP)** | 2.1s | 3.5s | 1.8s | < 1.5s target |
| **Accessibility** | Poor | Medium | Good | WCAG AA (verified) |
| **Easter eggs** | None | None | None | Yes (mandatory) |
```

### Step 5: Extract Winning Patterns
```
1. Which features do ALL competitors have? (table stakes — we must have them)
2. Which features does only the leader have? (differentiation opportunity)
3. What do ALL competitors do poorly? (our biggest opportunity)
4. What pricing model converts best? (evidence from their approach)
5. What design patterns work? (adopt the best, improve on the rest)
```

## Content Scraping (for Rebuilds)

When rebuilding or referencing an existing site:

### Brand Extraction
```
1. Screenshot the site at multiple viewpoints
2. Extract via AI vision:
   - Primary colors (hex values)
   - Font families and weights
   - Logo (download if possible)
   - Image style (photography, illustration, abstract)
   - Overall mood (formal, casual, technical, warm)
3. Extract from source:
   - Meta tags (title, description, OG)
   - Structured data (JSON-LD)
   - Sitemap (all pages)
   - Social links
   - Contact information
```

### Content Extraction
```
1. Scrape ALL text content (never truncate or summarize)
2. Preserve heading hierarchy
3. Extract all image URLs and alt text
4. Capture testimonials and quotes exactly
5. Note which sections appear on which pages
6. Preserve any numbers, statistics, or data points
```

### Deep Crawling via FireCrawl
```bash
# Self-hosted at firecrawl.megabyte.space
curl -X POST "https://firecrawl.megabyte.space/v1/crawl" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://competitor.com",
    "maxDepth": 3,
    "limit": 50,
    "scrapeOptions": {
      "formats": ["markdown", "html"],
      "includeTags": ["h1","h2","h3","p","li","a","img"]
    }
  }'
```

## Research-Backed Differentiation (Source: First Round Review, Y Combinator)

### How to Beat Competitors
1. **10x better on one dimension** — don't try to be better at everything
2. **Speed** — if you're fastest, users forgive everything else
3. **Design quality** — most B2B/nonprofit tools look terrible; premium design is a moat
4. **Completeness** — competitors often ship 60%; ship 95%
5. **Price** — generous free tier converts more than any marketing
6. **Accessibility** — most competitors fail WCAG; passing is a selling point
7. **Media quality** — real images, real video, real animation (not stock)

### What to Always Beat Competitors On (Emdash Defaults)
- Visual quality (anti-slop design system, skill 10)
- Page speed (Cloudflare edge, < 1.5s LCP)
- Accessibility (WCAG AA verified, skill 20)
- Media richness (generated imagery, not stock, skill 12)
- Completeness (no placeholder content, skill 06)
- Motion quality (meaningful animation, skill 11)
- Easter eggs (delightful hidden features, skill 15)

## Output: Build Plan Integration

After analysis, feed findings into:
- **02 (Goal & Brief):** Refine product thesis based on competitive gaps
- **03 (Planning):** Prioritize features that differentiate
- **09 (Brand):** Adopt winning design patterns, improve on weaknesses
- **10 (Design):** Match or exceed best competitor's visual quality
- **18 (Pricing):** Position pricing competitively

---

## Enhancement: AI Website Builder Competitive Landscape (April 2026)

### Key Competitors in the AI Builder Space

| Platform | Model | Strengths | Weaknesses | Price |
|----------|-------|-----------|------------|-------|
| **Bolt.new** | Claude Sonnet/Opus 4.6 | Browser-based full-stack, no local setup | WebContainer overhead, npm compat issues | Free (3-8 prompts/day) |
| **bolt.diy** | Any (19 providers) | Open-source, self-hosted, BYO API keys | Requires CLI knowledge, manual setup | Free (self-hosted) |
| **v0** | Vercel's model | Tight Next.js integration, focused UI gen | Frontend-only, locked to Vercel ecosystem | ~$5/mo free tier |
| **Lovable** | Unknown | Non-technical user focus, polished output | Restrictive free tier, mandatory public projects | $25/mo |
| **Replit** | Various | Educational focus, collaborative | Trial-based free tier, costs add up | Variable |
| **Dyad** | BYO API keys | Unlimited free usage, local dev, open-source | Newer product, requires API key setup | Free |

### Market Split
- **Cloud platforms** (Bolt.new, v0, Lovable): Restrictive free tiers, faster iteration, managed hosting
- **Local/self-hosted** (bolt.diy, Dyad): Unlimited free use, privacy, but setup burden

### How to Beat AI Builders (Emdash Differentiation for projectsites.dev)
1. **Design quality** — AI builders produce generic output; our anti-slop design system is a moat
2. **Completeness** — Builders ship 60% products; we ship with SEO, a11y, analytics, legal, email
3. **Domain expertise** — Builders are general-purpose; we know the exact stack and optimize for it
4. **Post-build quality** — Builders stop at "it runs"; we verify via quality gate (Lighthouse 90+, E2E, visual QA)
5. **Integration depth** — Builders leave you with code; we deploy to Cloudflare with DNS, SSL, analytics wired up
