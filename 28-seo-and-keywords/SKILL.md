---
name: "SEO and Keywords"
description: "Full SEO engine: keyword research via free/cheap APIs, competitor keyword analysis, per-page primary + longtail targeting, Yoast-level on-page checks, schema markup, internal linking, and programmatic SEO at scale on Cloudflare Workers. Every page ranks for a holy-grail keyword plus 1-2 longtail phrases. Runs on every build."
layer: "capability-pack"
canonical-owner-of:
  - "keyphrase-research"
  - "on-page-seo-checks"
  - "programmatic-seo"
  - "internal-linking-strategy"
  - "schema-structured-data"
---

# SEO and Keywords

> Every page ranks. Every keyword is researched. Every rule is followed.

---

## Core Philosophy

Every page this system builds targets:
1. **One holy-grail keyword** — the high-volume phrase everyone wants to rank for
2. **1-2 longtail phrases** — lower competition, high intent, easier to win
3. **Semantic variations** — related terms woven naturally into the copy

SEO is not an afterthought. It shapes the content from the first word.

---

## Keyword Research Workflow

### Step 1: Seed Keywords from Product
```
Domain name → product category → core features → user problems solved
Example: "instantidle.com" → container deployment → "docker hosting" → "cheap docker hosting"
```

### Step 2: Expand with Free/Cheap APIs

#### Google Search Console API (FREE — best for existing sites)
```bash
# Requires GCP service account with Search Console access
# Shows actual search queries, clicks, impressions, position
curl "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fdomain.com/searchAnalytics/query" \
  -H "Authorization: Bearer $GSC_TOKEN" \
  -d '{
    "startDate": "2026-01-01",
    "endDate": "2026-04-19",
    "dimensions": ["query"],
    "rowLimit": 100
  }'
```
Best data source for pages that already get some traffic.

#### Google Autocomplete (FREE — no API key)
```typescript
// Scrape Google autocomplete for keyword ideas
async function getAutocompleteSuggestions(seed: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}`;
  const res = await fetch(url);
  const [, suggestions] = await res.json();
  return suggestions;
}

// Expand: add alphabet modifiers
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
for (const letter of letters) {
  const results = await getAutocompleteSuggestions(`${seed} ${letter}`);
  // Collect all unique suggestions
}
```

#### Google "People Also Ask" Extraction (FREE)
```typescript
// Use SearXNG (self-hosted) to get PAA questions
const paaQuestions = await fetch(
  `https://searxng.megabyte.space/search?q=${encodeURIComponent(keyword)}&format=json`
).then(r => r.json());
```

#### DataForSEO API (CHEAP — ~$0.01 per keyword)
```bash
# Keyword data with volume, difficulty, CPC
curl -X POST "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live" \
  -H "Authorization: Basic $DATAFORSEO_AUTH" \
  -d '[{
    "keywords": ["docker hosting", "cheap container deployment", "cloudflare docker"],
    "location_code": 2840,
    "language_code": "en"
  }]'
```
Returns: search volume, CPC, competition level, trend data.
Cost: ~$0.01 per keyword lookup. Budget $5-10 covers a full project.

#### Keyword Surfer / Free Alternatives
- **Google Trends API** — free, shows relative interest over time
- **AnswerThePublic style** — questions people ask about a topic
- **AlsoAsked** — "People Also Ask" graph expansion

### Step 3: Competitor Keyword Analysis

```
1. Identify 3-5 competitors (skill 17)
2. For each competitor:
   a. Scrape their sitemap.xml → get all page URLs
   b. Fetch each page → extract title tags, h1s, meta descriptions
   c. Identify their target keywords from these elements
   d. Check Google: "site:competitor.com" → see what pages rank
3. Find gaps: keywords competitors rank for that we don't target
4. Find easy wins: keywords with high volume + low competition
```

#### Competitor Keyword Extraction
```typescript
async function extractCompetitorKeywords(url: string) {
  const html = await fetch(url).then(r => r.text());
  // Parse with simple regex (no heavy DOM library needed)
  const title = html.match(/<title>(.*?)<\/title>/i)?.[1] || '';
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/i)?.[1] || '';
  const metaDesc = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"/i)?.[1] || '';
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)].map(m => m[1]);

  return { url, title, h1, metaDesc, h2s };
}
```

### Step 4: Keyword Selection Matrix

| Keyword | Volume | Difficulty | Intent | Our Angle | Target Page |
|---------|--------|-----------|--------|-----------|-------------|
| "docker hosting" | 12K/mo | High | Commercial | Cloudflare edge | Homepage |
| "cheap container deployment" | 800/mo | Low | Commercial | Free tier + pricing | Pricing |
| "deploy docker without kubernetes" | 400/mo | Very Low | Informational | Blog post | /blog/no-k8s |

**Selection criteria:**
- Holy-grail: highest volume keyword relevant to our product
- Longtail 1: lower competition, commercial intent, different page
- Longtail 2: informational intent, blog/resource page

---

## Per-Page SEO Implementation

### The Yoast Checklist (Every Page Must Pass)

#### Title Tag
- [ ] Primary keyword appears in title
- [ ] Title is 50-60 characters
- [ ] Title starts with or contains the keyword early
- [ ] Title is unique across all pages
- [ ] Title includes brand name (at end, after separator)
- Format: `Primary Keyword — Supporting Text | Brand`

#### Meta Description
- [ ] 150-160 characters
- [ ] Contains primary keyword naturally
- [ ] Includes a call-to-action
- [ ] Unique per page
- [ ] Reads like an ad (compelling, specific)

#### URL Structure
- [ ] Short, readable, keyword-rich
- [ ] Lowercase, hyphens (no underscores)
- [ ] No stop words (the, and, of) unless natural
- Good: `/docker-hosting` Bad: `/page?id=123`

#### Headings
- [ ] One H1 per page containing primary keyword
- [ ] H2s contain longtail keywords or semantic variations
- [ ] Heading hierarchy is logical (H1 → H2 → H3)
- [ ] No skipped heading levels

#### Content
- [ ] Primary keyword in first paragraph (first 100 words)
- [ ] Primary keyword density: 1-2% (natural, not stuffed)
- [ ] Longtail keywords appear in body naturally
- [ ] Content length: minimum 300 words per page (600+ preferred)
- [ ] Flesch Reading Ease: >= 60 (see readability section)
- [ ] Short paragraphs (2-4 sentences max)
- [ ] Subheadings every 200-300 words
- [ ] Transition words used (however, therefore, additionally)

#### Images
- [ ] Alt text contains keyword (when natural)
- [ ] Filename is descriptive: `docker-hosting-dashboard.webp`
- [ ] Width and height attributes set (prevents CLS)
- [ ] Lazy loading on below-fold images
- [ ] WebP format, < 200KB

#### Internal Linking
- [ ] Every page links to 2-3 other pages on the site
- [ ] Anchor text is descriptive (not "click here")
- [ ] Homepage links to all main pages
- [ ] Related pages cross-link to each other

#### External Linking
- [ ] 1-2 outbound links to authoritative sources per page
- [ ] Links open in new tab: `target="_blank" rel="noopener"`
- [ ] No broken external links

#### Schema / Structured Data
- [ ] JSON-LD on every page (skill 24)
- [ ] Organization, WebSite, WebPage minimum
- [ ] FAQ schema on pages with FAQ sections
- [ ] Product/Offer schema on pricing pages
- [ ] BreadcrumbList on subpages
- [ ] Validates in Google Rich Results Test

#### Technical
- [ ] Canonical URL set
- [ ] Mobile-friendly (responsive)
- [ ] Page loads in < 2.5s (LCP)
- [ ] HTTPS (Cloudflare handles this)
- [ ] No duplicate content across pages
- [ ] XML sitemap includes this page
- [ ] robots.txt allows crawling

---

## Flesch Reading Ease Enforcement

### Target: >= 60 (All Content)

```typescript
// Simple Flesch calculator for runtime checking
function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}
```

### Yoast Readability Checks (9 checks — Source: yoast.com)
All 9 are automatable with no external API:

| # | Check | Rule | How to Automate |
|---|-------|------|-----------------|
| 1 | Flesch Reading Ease | Score >= 60 | Formula above |
| 2 | Sentence length | Avg <= 20 words | Split on `.!?`, count words |
| 3 | Paragraph length | Max 150 words | Count between `\n\n` |
| 4 | Passive voice | < 10% of sentences | Detect "was/were/been + past participle" |
| 5 | Transition words | >= 30% of sentences | Match against word list (however, therefore, also...) |
| 6 | Consecutive sentences | No 3+ starting with same word | Compare first words |
| 7 | Subheading distribution | Max 300 words between H2/H3 | Count between headings |
| 8 | Text presence | Actual text content exists | Strip tags, check length |
| 9 | Single H1 | Exactly one H1 tag | Count H1 elements |

### Writing Rules for 50+ Readability
- Average sentence: 15-20 words (never exceed 25)
- Use common words. "Use" not "utilize." "Help" not "facilitate."
- One idea per sentence. One topic per paragraph.
- Active voice. Subject then verb then object.
- Short paragraphs: 2-4 sentences max.
- Use contractions: "you'll" not "you will"
- Avoid jargon unless the audience expects it
- Front-load the important information
- Transition words in 30%+ of sentences (Source: Yoast)

### Readability by Section
| Section | Target | Why |
|---------|--------|-----|
| Hero headline | 80+ | Must be instantly clear |
| Body copy | 50-65 | Informative but accessible |
| Technical docs | 40-50 | OK to be slightly complex |
| Legal pages | 50+ | Must be plain English |
| Error messages | 70+ | Must be crystal clear |
| CTAs | 80+ | Zero friction to understand |

---

## Programmatic SEO at Scale

### Auto-Generate SEO Content for Dynamic Pages
```typescript
// For SaaS with many similar pages (e.g., "Docker hosting in [city]")
const cities = ['New York', 'San Francisco', 'London', 'Berlin'];
const baseKeyword = 'docker hosting';

for (const city of cities) {
  const page = {
    slug: `docker-hosting-${city.toLowerCase().replace(/\s/g, '-')}`,
    title: `Docker Hosting in ${city} — Fast Edge Deployment | Brand`,
    h1: `Docker Hosting in ${city}`,
    metaDescription: `Deploy Docker containers in ${city} with sub-50ms latency. Free tier available. Start in 30 seconds.`,
    content: generateCityContent(city, baseKeyword),
  };
}
```

### Internal Linking Strategy
```
Homepage → links to all category pages
Category pages → link to each other + homepage
Product pages → link to related products + parent category
Blog posts → link to relevant product pages + related posts
Every page → 2-3 internal links minimum
```

### Sitemap Auto-Generation
```typescript
// Generate on every deploy (skill 24 handles this)
function generateSitemap(pages: Page[]): string {
  const entries = pages.map(p => `
  <url>
    <loc>https://domain.com${p.slug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq || 'weekly'}</changefreq>
    <priority>${p.priority || '0.7'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}
```

---

## SEO Audit Checklist (Run on Every Deploy)

```typescript
test('SEO audit', async ({ page }) => {
  await page.goto('/');

  // Title tag
  const title = await page.title();
  expect(title.length).toBeGreaterThanOrEqual(30);
  expect(title.length).toBeLessThanOrEqual(60);

  // Meta description
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBeTruthy();
  expect(desc!.length).toBeGreaterThanOrEqual(120);
  expect(desc!.length).toBeLessThanOrEqual(160);

  // H1 tag (exactly one)
  const h1Count = await page.locator('h1').count();
  expect(h1Count).toBe(1);

  // Canonical URL
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBeTruthy();

  // OG tags
  expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBeTruthy();
  expect(await page.locator('meta[property="og:description"]').getAttribute('content')).toBeTruthy();
  expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toBeTruthy();

  // JSON-LD structured data
  const jsonLd = await page.locator('script[type="application/ld+json"]').count();
  expect(jsonLd).toBeGreaterThanOrEqual(1);

  // No placeholder content
  const bodyText = await page.locator('body').textContent();
  expect(bodyText).not.toContain('Lorem');
  expect(bodyText).not.toContain('ipsum');
  expect(bodyText).not.toContain('TODO');
  expect(bodyText).not.toContain('placeholder');

  // Images have alt text
  const images = page.locator('img:not([alt=""])');
  const imgCount = await page.locator('img').count();
  const altCount = await images.count();
  expect(altCount).toBe(imgCount);

  // Internal links exist
  const internalLinks = page.locator('a[href^="/"], a[href^="https://domain.com"]');
  expect(await internalLinks.count()).toBeGreaterThanOrEqual(3);

  // Robots.txt exists
  const robots = await page.goto('/robots.txt');
  expect(robots?.status()).toBe(200);

  // Sitemap exists
  const sitemap = await page.goto('/sitemap.xml');
  expect(sitemap?.status()).toBe(200);
});
```

---

## Keyword Research API Stack (Research-Backed — $8/mo Total)

### Recommended Stack (Source: VebAPI, DataForSEO, Serper)
| Layer | Tool | Cost | Use |
|-------|------|------|-----|
| Own-site keywords | Google Search Console API | Free | Real clicks, impressions, position |
| Competitor keywords | VebAPI | $8/mo | 1K daily requests, SERP + backlinks |
| SERP scraping | Serper free tier | Free | 2,500/mo SERP + PAA extraction |
| Autocomplete | Google Suggest API | Free | Keyword expansion, no key needed |
| Self-hosted search | SearXNG (megabyte.space) | Free | PAA questions, web research |
| Bulk volume (scale) | DataForSEO | $0.0006/query | When you need 10K+ keyword volumes |

### Prompt User for Keys (Casual, One-Time)
```
Hey — quick question. Got any of these for keyword research?

1. VebAPI ($8/mo, best bang for buck) — competitor keyword data
2. DataForSEO (pay-per-use, ~$0.0006/keyword) — bulk volume data
3. Serper (free tier: 2,500 searches/mo) — SERP analysis

If not, no stress — Google Autocomplete + SearXNG are free
and give us solid keyword data. I'll use those.
```

Store any keys in the shared API pool (skill 26).

### Google's Own SEO Rules (Source: Google Search Central, March 2026 Core Update)
- Original research and proprietary data heavily rewarded ("Information Gain" signal)
- No magic keyword density — write naturally, avoid stuffing
- Descriptive URLs with meaningful words
- One URL per piece of content (canonical tags)
- Core Web Vitals: LCP < 2.5s is a hard ranking factor
- Internal links on every important page
- `nofollow` on untrusted/UGC links
- AI Overviews now steal clicks from short-tail keywords — longtail is more important than ever
- Meta keywords tag is ignored (don't bother)

### Longtail Strategy (Source: Moz, Yotpo)
- Ultra-long-tail is the "new normal" per Moz 2026 research
- Short-tail triggers AI Overviews (stealing clicks). Longtail still drives direct traffic.
- Modifier stacking: `[product] + [use case] + [audience] + [qualifier]`
- Problem-first keywords: "how to reduce churn for B2B SaaS" beats "churn reduction software"
- GSC API: filter queries with impressions > 10 but position > 10 = low-hanging fruit

---

## Cross-Skill Integration

- **02 Goal & Brief** — keyword research shapes the product thesis
- **06 Build Loop** ��� every page targets specific keywords from build start
- **09 Brand & Content** — copy written around target keywords naturally
- **17 Competitive Analysis** — competitor keywords feed into our targeting
- **22 Copy System** — Flesch >= 60 enforced on all copy
- **24 Web Manifest** — sitemap, robots.txt, structured data verified
- **07 Quality Gate** — SEO audit runs as part of quality gate

---

## MANDATORY: Keyword Research BEFORE Writing

Never write a single word of content without completing this:

### Per-Page Keyword Due Diligence
1. **Identify 5-10 candidate keyphrases** (Google Autocomplete + SearXNG + competitor analysis)
2. **Evaluate each candidate**: volume, difficulty, commercial intent, relevance
3. **Select PRIMARY keyphrase** (1-4 words, never used on another page)
4. **Select 2-3 RELATED keyphrases** (secondary keywords, longtail variants)
5. **Map keyword → page URL** (no two pages target the same primary keyphrase)
6. **Write content optimized for these keyphrases** from the first sentence

This runs for EVERY page. Homepage, about, pricing, blog posts, features — all of them.

---

## Complete Yoast SEO Analysis (Implement ALL — Target GREEN on Every Check)

### Readability Checks (All Must Pass)

| Check | Green Threshold | How to Achieve |
|-------|----------------|----------------|
| Flesch Reading Ease | >= 60 | Short sentences, simple words |
| Sentence Length | <= 25% of sentences > 20 words | Break long sentences |
| Paragraph Length | <= 150 words per paragraph | Short paragraphs (2-4 sentences) |
| Subheading Distribution | <= 300 words between H2/H3s | Add subheadings every 200-250 words |
| Passive Voice | <= 10% of sentences | Rewrite passives to active |
| Transition Words | >= 30% of sentences contain them | Add: however, therefore, moreover, additionally, furthermore, in fact, as a result |
| Consecutive Sentences | < 3 starting with same word | Vary sentence openings |

### SEO Content Checks (All Must Be GREEN)

| Check | Green Threshold | Implementation |
|-------|----------------|----------------|
| Keyphrase in Title | At the BEGINNING of title | `{keyphrase} - {brand}` or `{keyphrase}: {subtitle}` |
| Keyphrase in Meta Description | Exactly 1-2 occurrences | Naturally include in 120-156 char description |
| Keyphrase in Introduction | All words in first paragraph (one sentence) | Open with a sentence containing the full keyphrase |
| Keyphrase in Subheadings | 30-75% of H2/H3s reflect the topic | Use keyphrase variations in subheadings |
| Keyphrase Density | 0.5-3% of total content | For 500 words: use keyphrase 3-15 times |
| Keyphrase in URL/Slug | All content words present | `/primary-keyphrase-here` |
| Keyphrase in Image Alt | >= 1 image (or 30-75% if 5+ images) | First image alt includes keyphrase |
| Keyphrase Length | 1-4 content words | Keep keyphrases concise |
| Previously Used Keyphrase | Never used on another page | Track in a keyword-to-page map |
| SEO Title Width | 400-600 pixels (~50-60 chars) | Test with title-width checker |
| Meta Description Length | 120-156 characters | Write to exactly this range |
| Text Length | >= 300 words (900+ for cornerstone) | Always meet minimum |
| Internal Links | >= 1 followed internal link | Link to related pages |
| Outbound Links | >= 1 followed external link | Cite sources or reference tools |
| Single H1 | Exactly one H1 per page | Title is the H1, no others in body |
| Images Present | At least 1 image | Every page has visuals |

### Technical SEO (Auto-Implemented)

| Feature | Implementation |
|---------|---------------|
| Canonical URL | `<link rel="canonical" href="...">` on every page |
| XML Sitemap | Auto-generated at `/sitemap.xml`, updated on deploy |
| robots.txt | Allow all, reference sitemap, block admin paths |
| Breadcrumbs | BreadcrumbList JSON-LD + visible breadcrumb nav |
| Structured Data | Organization + WebSite + WebPage + contextual (4+ per page) |
| Open Graph | og:title, og:description, og:image (1200x630), og:url, og:type |
| Twitter Card | twitter:card=summary_large_image, twitter:title, twitter:image |
| hreflang | If i18n enabled (Skill 42) |
| Internal Link Network | Every page links to 2+ other pages on the site |

### Schema/JSON-LD Types to Implement

| Context | Schema Type | When |
|---------|-------------|------|
| Every page | Organization, WebPage, BreadcrumbList | Always |
| Homepage | WebSite + SearchAction | Always |
| Blog posts | Article + author Person | All blog pages |
| FAQ sections | FAQPage | Any Q&A content |
| Pricing pages | Product + Offer | SaaS pricing |
| How-to content | HowTo | Tutorial/guide pages |
| Software/tools | SoftwareApplication | App/tool pages |
| Nonprofit | DonateAction | Donation pages |
| Local business | LocalBusiness | If physical location |

### Internal Linking Strategy

1. **Every page links OUT to 2+ internal pages** (minimum)
2. **Cornerstone pages get linked TO by 5+ other pages**
3. **Orphan detection**: after build, verify no page has 0 incoming text links
4. **Anchor text**: use keyphrase variations, not "click here"
5. **Link hierarchy**: homepage → category pages → individual pages
6. **Contextual placement**: links in body text, not just nav/footer

### Keyword-to-Page Map (Maintain Per Project)

```typescript
// Track in CLAUDE.md or a dedicated keywords.json
const keywordMap = {
  '/': { primary: 'project management tool', related: ['team collaboration app', 'agile project tracker'] },
  '/pricing': { primary: 'project management pricing', related: ['free project tool', 'team tool cost'] },
  '/features': { primary: 'project management features', related: ['kanban board', 'sprint planning'] },
  '/blog/getting-started': { primary: 'how to start project management', related: ['project management for beginners'] },
};
// Rule: No two pages share the same primary keyphrase
```

---

## What This Skill Owns
- Keyword research and selection (BEFORE any content is written)
- Competitor keyword analysis
- Per-page keyword targeting with primary + related keyphrases
- Complete Yoast-equivalent on-page SEO checks (all GREEN)
- Flesch readability enforcement (>= 60)
- Programmatic SEO patterns
- SEO audit automation
- Internal linking strategy and orphan detection
- Schema/JSON-LD structured data (4+ per page)
- OG/Twitter social preview tags
- XML sitemap and robots.txt
- Keyword-to-page mapping (no duplication)

## Rich Snippets and Structured Data (skill 24 standard)

Every page must include a minimum of **4 JSON-LD blocks** to maximize rich snippet eligibility:

1. **Organization** — on all pages, with `sameAs` linking to all ecosystem sites and social profiles
2. **WebSite** with `SearchAction` — on homepage, enables sitelinks searchbox in Google (pair with opensearch.xml)
3. **WebPage** — on every page, with `datePublished`, `dateModified`, `breadcrumb`
4. **Domain-specific** — at least one of:
   - `FAQPage` — for any section with Q&A content
   - `BreadcrumbList` — on all subpages
   - `Product` / `Offer` — on pricing pages
   - `SoftwareApplication` — on tool/app pages
   - `DonateAction` — on nonprofit/donation pages
   - `AggregateRating` — where reviews or ratings exist

### OpenSearch XML (sitelinks searchbox)
Every site must serve `/opensearch.xml` for browser search integration. This enables the Google sitelinks searchbox when paired with `WebSite` + `SearchAction` JSON-LD.

### Validation
- Test with Google Rich Results Test: `https://search.google.com/test/rich-results`
- JSON-LD count check in SEO audit: `expect(jsonLdCount).toBeGreaterThanOrEqual(4)`
- Every JSON-LD block must validate without errors

---

## What This Skill Must Never Own
- Content writing (→ 09, 22)
- Visual design (→ 10)
- Deployment (→ 08)
- Structured data templates (→ 24)
