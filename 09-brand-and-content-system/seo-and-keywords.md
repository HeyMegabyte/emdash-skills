---
name: "SEO and Keywords"
version: "1.2.0"
updated: "2026-04-23"
description: "Full SEO engine: keyword research, competitor analysis, per-page primary+longtail targeting, Yoast-level checks, schema markup, internal linking, pSEO at scale. Runs every build."
---

# SEO and Keywords

Every page targets: 1 holy-grail keyword (high-volume), 1-2 longtail phrases (lower competition, high intent), semantic variations woven naturally.

## Keyword Research Workflow

### Step 1: Seed from Product
`Domain -> category -> features -> user problems. e.g. "instantidle.com" -> container deployment -> "docker hosting" -> "cheap docker hosting"`

### Step 2: Expand with APIs

**Google Autocomplete (FREE, no key):**
```typescript
async function getAutocompleteSuggestions(seed: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
  const [, suggestions] = await (await fetch(url)).json();
  return suggestions;
}
// Expand with alphabet modifiers: `${seed} a`, `${seed} b`, etc.
```

**DataForSEO (~$0.01/keyword):** Returns volume, CPC, competition, trends.
**Google Search Console (FREE):** Real clicks, impressions, position for existing sites.
**Google Trends:** Relative interest over time.

### Step 3: Competitor Analysis
1. Identify 3-5 competitors
2. Scrape sitemap.xml -> fetch pages -> extract title/h1/meta
3. Find gaps (keywords they rank for that we don't)
4. Find easy wins (high volume + low competition)

### Step 4: Selection Matrix
- Holy-grail: highest volume relevant keyword
- Longtail 1: lower competition, commercial intent
- Longtail 2: informational intent, blog/resource page

## Per-Page Yoast Checklist (ALL GREEN)

### Title Tag
50-60 chars, keyword at start, unique, includes brand. Format: `{Keyword} — {Supporting} | Brand`

### Meta Description
120-156 chars, contains keyword, includes CTA, unique per page.

### URL
Short, readable, keyword-rich, lowercase, hyphens. Good: `/docker-hosting`

### Headings
One H1 with keyword, H2s with longtail/semantic variations, logical hierarchy, no skipped levels.

### Content
- Keyword in first 100 words
- Density 0.5-3% (natural)
- Min 300 words (600+ preferred)
- Flesch >= 60
- Short paragraphs (2-4 sentences)
- Subheadings every 200-300 words
- Transition words >= 30% of sentences

### Images
Alt text with keyword (natural), descriptive filename, width/height set, lazy load below-fold, WebP <200KB.

### Links
- Internal: 2-3+ per page, descriptive anchors
- External: 1-2 outbound to authoritative sources, `target="_blank" rel="noopener"`

### Schema/JSON-LD (4+ per page minimum)
Organization + WebSite + WebPage + domain-specific (FAQ, Product, BreadcrumbList, Article, HowTo, SoftwareApplication, DonateAction)

### Technical
Canonical URL, mobile-friendly, LCP <2.5s, HTTPS, no duplicate content, XML sitemap, robots.txt.

## Readability Enforcement (Flesch >= 60)

### Yoast 9 Checks (All Automatable)
| Check | Green Threshold |
|-------|----------------|
| Flesch | >= 60 |
| Sentence length | avg <= 20 words |
| Paragraph length | <= 150 words |
| Passive voice | < 10% |
| Transition words | >= 30% of sentences |
| Consecutive sentences | < 3 with same opening word |
| Subheading distribution | <= 300 words between H2/H3 |
| Text presence | Content exists |
| Single H1 | Exactly one |

### By Section
Hero: 80+, Body: 50-65, Technical docs: 40-50, Legal: 50+, Errors: 70+, CTAs: 80+

## Programmatic SEO

```typescript
// Dynamic pages: "Docker hosting in [city]"
const cities = ['New York', 'San Francisco', 'London'];
for (const city of cities) {
  // slug, title, h1, metaDescription all include city + keyword
}
```

### Internal Linking Strategy
Homepage -> category pages -> product pages. Blog -> relevant products + related posts. Every page: 2-3 internal links min. Anchor text: keyphrase variations, never "click here." Orphan detection after build.

## SEO Audit (Every Deploy)
Playwright test verifying: title 30-60 chars, meta desc 120-160 chars, exactly 1 H1, canonical URL, OG tags, JSON-LD >= 1, no Lorem/TODO/placeholder, images have alt, internal links >= 3, robots.txt 200, sitemap.xml 200.

## API Stack ($8/mo total)
| Tool | Cost | Use |
|------|------|-----|
| Google Search Console | Free | Real clicks/impressions |
| VebAPI | $8/mo | Competitor keywords, SERP |
| Serper free tier | Free | 2,500/mo SERP + PAA |
| Google Suggest | Free | Keyword expansion |
| SearXNG (self-hosted) | Free | PAA questions |
| DataForSEO | $0.0006/query | Bulk volumes at scale |

## Google's SEO Rules (2026 Core Update)
- Original research/proprietary data rewarded (Information Gain signal)
- Write naturally, no stuffing
- Core Web Vitals: LCP <2.5s is hard ranking factor
- AI Overviews steal short-tail clicks — longtail more important than ever
- Meta keywords tag ignored

## Longtail Strategy (Moz 2026)
Ultra-long-tail is "new normal." Short-tail triggers AI Overviews. Modifier stacking: `[product] + [use case] + [audience] + [qualifier]`. Problem-first keywords beat feature keywords. GSC: impressions >10 but position >10 = low-hanging fruit.

## MANDATORY: Research BEFORE Writing
1. Identify 5-10 candidate keyphrases
2. Evaluate: volume, difficulty, intent, relevance
3. Select PRIMARY (1-4 words, unique to page)
4. Select 2-3 RELATED keyphrases
5. Map keyword -> page URL (no duplicates)
6. Write content optimized from first sentence

## Keyword-to-Page Map
```typescript
const keywordMap = {
  '/': { primary: 'main keyword', related: ['variation 1', 'variation 2'] },
  '/pricing': { primary: 'pricing keyword', related: [...] },
};
// No two pages share same primary keyphrase
```

## Rich Snippets
Every page: Organization + WebSite(SearchAction) + WebPage + domain-specific schema. OpenSearch XML at `/opensearch.xml`. Validate with Google Rich Results Test.

## Ownership
**Owns:** Keyword research, competitor analysis, per-page targeting, Yoast checks, readability, programmatic SEO, audit automation, internal linking, schema/JSON-LD, OG/Twitter tags, sitemap, robots.txt, keyword-to-page mapping.
**Never owns:** Content writing (->09,22), visual design (->10), deployment (->08).
