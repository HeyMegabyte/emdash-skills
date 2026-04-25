---
name: "image-profiling"
description: "Tiered vision profiling: Workers AI Llama Vision (free, bulk) → GPT-4o (paid, hero/logo picks only). Scores, placement, alt text, colors."
updated: "2026-04-25"
---

# Image Profiling (Tiered Vision)

Bridge between visual assets and text-only AI builders. Profile every candidate image BEFORE the build so the builder makes informed placement decisions without seeing images.

## Architecture (***COST-TIERED***)
**Tier 1 — Workers AI Llama Vision (FREE, 90% of images):** `@cf/meta/llama-3.2-11b-vision-instruct`. Batch 5 images/call, 3 batches parallel = 15 images/round. Handles: description, keywords, quality_score, suggested_placement, alt_text, dominant_colors. Sufficient for gallery/about/services/background images.

**Tier 2 — GPT-4o detail:low ($0.01/call, 10% of images):** Hero candidates only (top 5 by Tier 1 score) + logo variants + brand color extraction. Single batch call with all hero candidates. Worth the spend — hero is 80% of first impression.

## Profile Schema
```json
{
  "name": "hero-storefront.webp",
  "url": "https://r2.example.com/assets/hero-storefront.webp",
  "source": "discovered|generated|scraped|uploaded",
  "description": "Warm interior shot of a busy coffee shop with exposed brick walls",
  "keywords": ["coffee", "interior", "warm", "cozy", "brick"],
  "quality_score": 8,
  "relevance_score": 9,
  "suggested_placement": "hero|about|services|gallery|team|testimonials|background",
  "alt_text": "Interior of Main Street Coffee with customers at wooden tables",
  "dominant_colors": ["#8B4513", "#F5F5DC", "#2F4F4F"]
}
```

## System Prompt Pattern
```
You are an expert visual curator for professional websites. For each image:
1. Describe what's in it (2 sentences max)
2. Rate quality 1-10 (composition, lighting, resolution, professionalism)
3. Rate relevance 1-10 (how well it fits a {business_type} website)
4. Suggest ONE placement: hero|about|services|gallery|team|testimonials|background
5. Write descriptive alt text (SEO-friendly, includes business context)
6. Extract 3-5 dominant hex colors
Return JSON array matching the profile schema.
```

## Top-Pick Selection Algorithm
1. Sort by `quality_score * 0.4 + relevance_score * 0.6` descending
2. Hero: highest combined score, prefer wide/landscape, quality≥7
3. Logo: source=uploaded|discovered with "logo" in name/description, else generated
4. About: top 3 by relevance with "interior"|"team"|"story" keywords
5. Services: top 3 matching service-related keywords
6. Gallery: remaining images quality≥6, deduplicated by dominant_colors similarity

## Integration with Build Pipelines
Pre-container: collect 50-100 candidate images from all APIs → batch profile → select top picks → write `_image_profiles.json` as context file. Builder reads profiles, uses every top-pick in its suggested placement. Alt text pre-written. No guessing, no vision needed in build step.

## Cost Management
Workers AI: FREE (included in Workers Paid plan). 60 images = $0.00. GPT-4o: 1 batch call for top 5 hero candidates = ~$0.02. Total profiling cost: ~$0.02/site (down from $0.60-1.20). Skip duplicates (hash-based dedup before profiling). Skip images <100px or >5MB. Timeout: 30s per batch call, 90s total phase.
