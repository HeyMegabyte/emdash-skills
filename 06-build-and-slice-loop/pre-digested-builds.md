---
name: "pre-digested-builds"
description: "Research→profile→build architecture — pre-digest ALL context before expensive AI builder runs"
updated: "2026-04-24"
---

# Pre-Digested Build Architecture

AI builders (Claude Code, Cursor, bolt.diy) are expensive ($5-15/run) and slow (20-40min). Every minute spent researching inside the builder is wasted. Pre-digest ALL context using cheap, fast workers before the builder starts.

## Architecture: 4 Pre-Build Phases

### Phase 1: Research (~30s, parallel)
Profile the business via LLM (o3-mini, $0.01) + Google Places API ($0.003). Returns structured JSON: type, services, hours, contact, reviews, geo. Run both in parallel — profile doesn't depend on Places.

### Phase 2: Enrich (~45s, 5 parallel)
Brand identity (colors, fonts, personality) + selling points (3 USPs, hero slogans) + social presence + website scrape (homepage + 5 key pages) + logo discovery (Logo.dev, Brandfetch). Each runs independently with profile as input.

### Phase 3: Media (~60s, 5 parallel)
Discover images (6 APIs: Unsplash, Pexels, Pixabay, Google CSE, Foursquare, Yelp) + generate logo (DALL-E if none found) + generate section images + discover videos (YouTube, Pexels) + move user uploads. Store all media in object storage, return metadata only.

### Phase 4: Profile Images (~90s)
Workers AI Llama Vision profiles all images (FREE): description, quality score, relevance score, suggested placement, alt text, dominant colors. GPT-4o detail:low ONLY for top 5 hero candidates (~$0.02). Pre-selects top picks for hero/about/services/gallery. See image-profiling skill for tiered architecture.

## Context Files (what builder receives)
```
_research.json     — confidence-weighted business data (~50KB)
_image_profiles.json — every image profiled with scores + placements (~100KB)
_scraped_content.json — original website pages: text, headings, images (~200KB)
_videos.json       — YouTube/Pexels embed URLs (~5KB)
_places.json       — Google Places hours, reviews, photos, rating (~20KB)
_assets.json       — all object storage URLs for media assets (~10KB)
```
Total: ~400KB. Builder reads structured data, never calls APIs.

## Builder Prompt Philosophy
**Old**: "Research everything, find images, build the site" (builder wastes 15min on research)
**New**: "Everything is researched. Every image is profiled. Just build." (builder spends 100% on quality)

Builder instructions: "Read _research.json for ALL business data. Read _image_profiles.json — use EVERY top-pick in its suggested placement. All alt text is pre-written. ALL original content is in _scraped_content.json — use it ALL. Brand colors/fonts in _research.json.brand."

## Quality Impact
Pre-digested builds produce dramatically better first-time results because: (1) builder has 100% context from minute 1, (2) image placement is data-driven not guessed, (3) original website content is preserved completely, (4) brand colors are extracted from real assets not hallucinated.

## Cost Savings
Pre-container phases: ~$0.15-0.50 (LLM calls + API queries + Workers AI profiling + GPT-4o hero pick). Container time saved: ~15min ($3-5 of compute). Net savings: $3-5/build + dramatically higher quality.

## Logic Distribution
Generic methodology (this skill, image-profiling, heartbeat-polling) → public skills repo. Business-specific prompts (image profiling system prompt, builder instructions, CLAUDE.md template) → private project prompts/. Implementation code (workflow orchestration, API wiring) → private project src/.
