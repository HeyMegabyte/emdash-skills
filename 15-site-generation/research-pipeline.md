---
name: "research-pipeline"
description: "API-driven business research inside container: Google Places, website scraping, social verification, brand extraction, confidence scoring, media discovery. Claude Code executes all research via curl + API keys passed as env vars."
updated: "2026-04-25"
---

# Research Pipeline

All research runs INSIDE the container via Claude Code. API keys are passed as env vars from the workflow. The workflow pre-assembles only: uploaded asset manifest (`_assets.json`) and user-provided context. Claude Code handles all API calls, scraping, and data assembly.

## Architecture

```
Workflow (Worker):
  1. move-uploaded-assets → _assets.json context file
  2. Collect API keys from env bindings → envVars object
  3. POST /build to container with { prompt, contextFiles, envVars }

Container (Claude Code):
  1. Read ~/.agentskills/15-site-generation/ for methodology
  2. Read all _ prefixed context files
  3. Execute research phases via curl + API keys
  4. Build website from research data + template
  5. Self-inspect via GPT-4o (inspect.js)
  6. Upload to R2 (upload-to-r2.mjs)
```

## Pre-Research Context (assembled by workflow)

The workflow passes these to the container as `contextFiles` (written as `_` prefixed files):
- `_assets.json` — uploaded asset manifest with R2 keys + public URLs (if user uploaded logos/photos)
- Business data in the prompt: name, category, slug, address, phone, website, Google Place ID, additional context

## API Keys Available (passed as env vars)

| Key | Service | Research Use |
|-----|---------|-------------|
| GOOGLE_PLACES_API_KEY | Google Places | Profile, hours, reviews, photos, rating, geo |
| GOOGLE_CSE_KEY + GOOGLE_CSE_CX | Google Custom Search | Business-specific web images |
| GOOGLE_MAPS_API_KEY | Google Maps | Embed map, directions URL |
| YELP_API_KEY | Yelp Fusion | Reviews, photos, rating, categories |
| FOURSQUARE_API_KEY | Foursquare | Venue photos, tips, hours |
| UNSPLASH_ACCESS_KEY | Unsplash | Stock photos (hero, section backgrounds) |
| PEXELS_API_KEY | Pexels | Stock photos + videos |
| PIXABAY_API_KEY | Pixabay | Illustrations, vectors, supplementary |
| YOUTUBE_API_KEY | YouTube Data | Business videos for hero/featured |
| OPENAI_API_KEY | GPT Image 1.5 / GPT-4o | Generated images, visual inspection, brand extraction |
| IDEOGRAM_API_KEY | Ideogram v3 | Logo generation, stylized text |
| STABILITY_API_KEY | Stability AI | Supplementary images, backgrounds |
| REPLICATE_API_TOKEN | Replicate | Image upscaling, background removal |
| LOGODEV_TOKEN | Logo.dev | Logo discovery for established businesses |
| BRANDFETCH_API_KEY | Brandfetch | Full brand kit (logo, colors, fonts) |
| CLOUDINARY_* | Cloudinary | Image optimization CDN |
| MAPBOX_ACCESS_TOKEN | Mapbox | Map embeds (alternative to Google Maps) |

## Phase 0a: Business Profile (Google Places API)

Query: `findplacefromtext` with business name + address → `place/details` for: name, formatted_address, formatted_phone_number, opening_hours, website, rating, user_ratings_total, reviews (top 3), photos, geometry (lat/lng), types, price_level, business_status. Use `curl` with GOOGLE_PLACES_API_KEY.

Fallback: web search via Google CSE if no Places result. Lower confidence.

## Phase 0b: Website Scraping (Deep Crawl)

If business has existing website: crawl up to 20 pages via `curl`. For each: extract title, headings, body text, images, nav structure, footer content, meta tags, schema.org data. Store scraped content for reuse. Extract: all text content, all image URLs for download, sitemap structure for page recreation, blog posts for content migration.

For JS-rendered sites: graceful degradation — extract what's available from initial HTML response.

## Phase 0c: Social Media Verification

For each platform (Facebook, Instagram, Twitter/X, LinkedIn, YouTube, TikTok, Pinterest, Yelp, Google Business): construct candidate URL from business name → `curl -I` HEAD request → verify 200 status. Only include verified URLs.

## Phase 0d: Brand Extraction

Priority order for colors: logo dominant color → header/nav background → CTA button color → accent borders → body background. Extract via: GPT-4o vision on screenshot/logo of existing site (if available), or Brandfetch API, or Logo.dev API. Return: primary, secondary, accent colors + font family + brand personality.

**Color source tracking (***CRITICAL***):** Every color must have source: extracted_from_logo|extracted_from_website|extracted_from_assets|generated. NEVER guess colors from business category. The njsk.org burgundy incident: system guessed "warm soup kitchen colors" instead of extracting their actual burgundy brand.

## Phase 0e: Confidence Scoring

Every data point gets confidence: `{ value, confidence: 0-1, sources[] }`. Source types: google_places, llm_inference, user_provided, web_scrape, social_verify. Merge: higher confidence wins, corroboration boosts +0.1 (capped 0.99). Display policy: prominent >=0.85, standard 0.70-0.84, deemphasize 0.50-0.69, hide <0.50.

## Phase 0f: Media Discovery

Query ALL available media APIs in parallel: Unsplash + Pexels + Pixabay for stock, Foursquare + Yelp for venue photos, Google CSE for business-specific images, YouTube for videos. Download best candidates. Score each via GPT-4o vision for quality+relevance. Select top 10-15 for final site.

## Output Format

Claude Code assembles all research into structured data used during the build phase. Key data points:
- Identity: name, tagline, category, schema.org type
- Operations: phone, email, address, hours, geo coordinates
- Offerings: services/menu, pricing
- Trust: rating, review count, top reviews, years in business
- Brand: colors (with source tracking), fonts, personality, logo URL
- Marketing: selling points, hero slogans, benefit bullets
- Media: curated images, videos, placeholder strategy
- SEO: primary keyword (`{type} in {city}`), secondary keywords, FAQ content

## Research by Site Type

**Local business:** Full Google Places + Yelp + Foursquare enrichment. Deep website scrape. Social verification. Brand extraction from logo/site.

**SaaS:** Skip Google Places. Research: competitor features (web search), pricing benchmarks, integration ecosystems, trust signals (G2/Capterra), tech stack. Scrape: landing pages, pricing, docs, changelog.

**Portfolio:** Minimal API research. Focus: scrape all project/work pages, extract case studies, download project images, identify skills/tech. Client list from testimonials.

**Non-profit:** Google Places + mission research. Impact metrics, volunteer programs, donation platforms, event calendars, partner organizations. Deep scrape — non-profits often have 20+ pages to reorganize.

**Government/institutional:** Deep scrape required (often 100+ pages). Organize by user intent not org structure. Extract: services, contact directories, document libraries, news/press, policy documents.
