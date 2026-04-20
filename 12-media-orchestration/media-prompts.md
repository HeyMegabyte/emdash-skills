# Media Generation Prompt Templates

> Submodule of 12-media-orchestration. Contains detailed prompt templates for image, logo, and video generation.

---

## Image Prompt Schema

```
Subject: [main subject]
Style: [art style — digital illustration, photograph, 3D render, etc.]
Mood: [emotional tone — professional, energetic, calm, bold]
Color palette: [specific colors from brand]
Composition: [framing — centered, rule of thirds, wide angle]
Background: [specific background description]
Lighting: [lighting style — soft, dramatic, studio, natural]
Details: [specific details that matter]
Avoid: [what to exclude — text, watermarks, specific elements]
Aspect ratio: [dimensions]
```

### Image Prompt Rules
- Be specific about style, not generic ("dark tech illustration with cyan accent glow" not "cool image")
- Include brand colors explicitly
- Specify what to AVOID (text in images, watermarks, specific unwanted elements)
- For product screenshots, use browser rendering instead of generation
- For people, specify diversity and professional context
- Never add detail the user didn't imply — augment generic prompts, preserve specific ones

---

## Brian's Brand Prompt Style

```
Dark, atmospheric [subject]. Cyan (#00E5FF) light streaks and purple (#7C3AED) nebula effects
on deep black (#060610). Quantum-inspired dots and connections. Premium tech aesthetic.
Ultra-wide composition. Ultra realistic. No text.
```

---

## Logo Prompt Templates (Ideogram v3)

### Horizontal Lockup
```
a premium, clean, modern logo for "{BusinessName}", a {industry} business.
Minimal design with the text "{BusinessName}" in a bold sans-serif font.
{brand_color} accent color on dark transparent background. Professional,
scalable, no gradients, vector-style. PNG with transparency.
```

### Icon/Monogram
```
a minimal icon logo using the letter "{FirstLetter}" for "{BusinessName}",
a {industry} business. Clean geometric shape, {brand_color} color,
transparent background, works at very small sizes. Modern, professional.
```

### Wordmark
```
a premium wordmark logo that spells "{BusinessName}" in elegant, custom
typography. {brand_color} on transparent background. Think Apple, Stripe,
or Linear level of typographic quality. No icons, text only.
```

---

## OG Image Template Prompt

```
Create a social media preview image for [product name].
Dimensions: 1200x630 pixels.
Background: dark (#060610) with subtle gradient.
Text: "[Product Name]" in large, bold white text (Space Grotesk).
Subtitle: "[Tagline]" in smaller cyan (#00E5FF) text below.
Include a simple iconic element representing [product purpose].
No photographs, no busy backgrounds.
Clean, modern, tech-forward design.
```

---

## Video Prompt Template (Sora)

```
[Opening shot/setup, 0-2s]: [describe initial frame]
[Main action, 2-6s]: [describe what happens]
[Closing/hold, 6-8s]: [describe ending state]

Style: [cinematic, documentary, animated, etc.]
Camera: [static, slow pan, tracking, drone]
Lighting: [natural, studio, dramatic, ambient]
Color: [brand-consistent palette]
Mood: [match product tone]
```

---

## Ideogram v3 API Call

```bash
curl -X POST "https://api.ideogram.ai/v1/ideogram-v3/generate" \
  -H "Api-Key: $IDEOGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a minimalist tech logo with the text \"BrandName\" in cyan #00E5FF, dark background, sans-serif",
    "aspect_ratio": "ASPECT_16_9",
    "rendering_speed": "DEFAULT"
  }'
```

- Put desired text in quotation marks within the prompt
- Upload up to 3 style reference images for consistency
- TURBO mode: ~4s generation at $0.03-0.05 per image
