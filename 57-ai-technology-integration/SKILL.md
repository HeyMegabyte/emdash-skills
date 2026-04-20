---
name: "AI Technology Integration"
description: "Latest AI APIs, models, and techniques for building AI-native products. GPT-4o vision for visual QA, Workers AI for edge inference, embeddings for RAG, structured outputs, image/video generation, speech, and the visual TDD loop."
allowed-tools: Bash, Read, Write, Edit, mcp__playwright__*
---

# AI Technology Integration

> Every product is AI-native. Every deploy is vision-verified. Every feature uses the best model for the job.

---

## Visual TDD Loop (MANDATORY on every deploy)

The core automation loop that ensures quality:

```
Build → Deploy → Screenshot (6 breakpoints) → GPT-4o Vision Analysis → Fix Issues → Redeploy → Repeat until 0 issues
```

### Implementation

#### Quick (inline in Claude Code session)
```bash
# Screenshot with Playwright MCP
# For each breakpoint: browser_resize → browser_take_screenshot
# Then analyze with GPT-4o:
curl -s "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{
      "role": "user",
      "content": [
        {"type": "text", "text": "Analyze this web page screenshot for visual defects. Report layout breaks, text overflow, broken images, poor contrast, misalignment. Return JSON array of issues with severity, element, description, fix. Return [] if clean."},
        {"type": "image_url", "image_url": {"url": "data:image/png;base64,BASE64_HERE"}}
      ]
    }]
  }'
```

#### Automated (shell script)
```bash
/Users/apple/.agentskills/scripts/visual-tdd-loop.sh https://example.com 5
```

#### Single Image Analysis
```bash
/Users/apple/.agentskills/scripts/gpt4o-vision-analyze.sh screenshot.png
```

### When to Run
- After every `wrangler deploy`
- After any CSS/layout change
- After adding new pages or components
- Before merging any PR with UI changes
- During competitive analysis (screenshot competitor, analyze strengths)

### Acceptance Criteria
- [ ] All 6 breakpoints screenshot successfully
- [ ] GPT-4o returns valid JSON for each screenshot
- [ ] Zero critical/high issues remain after fix loop
- [ ] Max 5 iterations (if still failing, escalate to user)

---

## AI Model Selection Guide

### By Task Type

| Task | Best Model | API | Cost | Latency |
|------|-----------|-----|------|---------|
| **Visual QA** | GPT-4o | OpenAI | ~$0.01/image | 2-5s |
| **Code generation** | Claude Opus 4.6 | Anthropic | Included | — |
| **Quick research** | Claude Haiku 4.5 | Anthropic | Low | Fast |
| **Logo generation** | Ideogram v3 | Ideogram | ~$0.03 | 5-10s |
| **Scene/hero images** | GPT Image (gpt-image-1) | OpenAI | ~$0.04 | 10-20s |
| **Hero video (4s loop)** | Sora | OpenAI | ~$0.10 | 30-60s |
| **Alt text generation** | Workers AI (@cf/meta/llama-3.2-11b-vision-instruct) | Cloudflare | Free | <1s |
| **Text embeddings** | Workers AI (@cf/baai/bge-base-en-v1.5) | Cloudflare | Free | <100ms |
| **Translation** | Workers AI (@cf/meta/m2m100-1.2b) | Cloudflare | Free | <1s |
| **Content summaries** | Workers AI (@cf/meta/llama-3.1-8b-instruct) | Cloudflare | Free | <1s |
| **Speech-to-text** | Deepgram Nova-2 | Deepgram | $0.0043/min | Real-time |
| **Text-to-speech** | ElevenLabs | ElevenLabs | ~$0.30/1K chars | <1s |
| **Web search** | Firecrawl or Tavily | Self-hosted/API | Varies | 1-3s |
| **Structured extraction** | Firecrawl Extract | Self-hosted | Free | 2-5s |
| **Competitive screenshots** | Playwright MCP | Local | Free | <2s |
| **Document analysis** | GPT-4o or Claude | OpenAI/Anthropic | ~$0.01/page | 2-5s |

### API Key Locations
All keys in `/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`:
- `OPENAI_API_KEY` — GPT-4o, GPT Image, Sora, Whisper, embeddings
- `ANTHROPIC_API_KEY` — Claude (usually included in session)
- `IDEOGRAM_API_KEY` — Logo generation
- `REPLICATE_API_TOKEN` — Open-source models (Flux, SDXL, etc.)
- `RUNWAY_API_KEY` — Video generation alternative
- `DEEPGRAM_API_KEY` — Speech-to-text
- `CLOUDFLARE_API_TOKEN` — Workers AI (free tier)

---

## Workers AI Patterns (Free, Edge-Native)

### Text Generation
```typescript
const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [{ role: 'user', content: prompt }],
});
```

### Image Classification / Alt Text
```typescript
const response = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
  image: imageBytes, // Uint8Array
  prompt: 'Describe this image in one sentence for use as alt text.',
});
```

### Text Embeddings (for RAG / Search)
```typescript
const embeddings = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
  text: ['document chunk 1', 'document chunk 2'],
});
// Store in Vectorize index
await env.VECTORIZE_INDEX.upsert(
  embeddings.data.map((e, i) => ({ id: `doc-${i}`, values: e.values, metadata: { text: chunks[i] } }))
);
```

### Translation
```typescript
const translated = await env.AI.run('@cf/meta/m2m100-1.2b', {
  text: 'Hello, how can I help you?',
  source_lang: 'en',
  target_lang: 'es',
});
```

### Wrangler Config
```toml
[ai]
binding = "AI"

[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "site-content"
```

---

## GPT-4o Structured Outputs

For reliable JSON from vision analysis:
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4o',
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'visual_qa',
        schema: {
          type: 'object',
          properties: {
            score: { type: 'number', minimum: 1, maximum: 10 },
            issues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
                  element: { type: 'string' },
                  description: { type: 'string' },
                  fix: { type: 'string' },
                },
                required: ['severity', 'element', 'description', 'fix'],
              },
            },
            summary: { type: 'string' },
          },
          required: ['score', 'issues', 'summary'],
        },
      },
    },
    messages: [{ role: 'user', content: [
      { type: 'text', text: 'Analyze this webpage screenshot for visual defects.' },
      { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
    ]}],
  }),
});
```

---

## Image Generation Workflows

### Logo (Ideogram v3)
```bash
curl -X POST "https://api.ideogram.ai/generate" \
  -H "Api-Key: $IDEOGRAM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_request": {
      "prompt": "Minimalist logo for [BRAND], cyan (#00E5FF) on black (#060610), clean geometric, no text, vector style",
      "model": "V_3",
      "aspect_ratio": "ASPECT_1_1",
      "style_type": "DESIGN"
    }
  }'
```

### Hero Image (GPT Image)
```bash
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "Dark, atmospheric hero image for [PRODUCT]. Abstract geometric shapes with cyan (#00E5FF) light streaks on deep black (#060610). Premium tech aesthetic. Ultra-wide 21:9 composition.",
    "n": 1,
    "size": "1536x1024",
    "quality": "high"
  }'
```

### OG Image (1200x630)
```bash
# Generate with GPT Image, then resize
curl -X POST "https://api.openai.com/v1/images/generations" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "Social preview card for [PAGE_TITLE]. Clean design, [BRAND] name prominent, dark background, cyan accent. Include tagline: [TAGLINE]",
    "size": "1536x1024"
  }'
# Resize to 1200x630 with sharp or CF Image Resizing
```

### Image Critique + Remix Loop
```
1. Generate image with prompt
2. Screenshot/download result
3. GPT-4o vision: "Rate 1-10. What's wrong? How to improve the prompt?"
4. If score < 8: remix with improved prompt
5. Repeat until score >= 8 or 3 iterations
```

---

## RAG Architecture (for AI-powered features)

### Per-Tenant RAG on Cloudflare
```
User query → Embed query → Search Vectorize → Retrieve chunks → LLM with context → Response
```

```typescript
// 1. Embed the query
const queryEmbed = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [query] });

// 2. Search vector index
const results = await env.VECTORIZE_INDEX.query(queryEmbed.data[0].values, {
  topK: 5,
  filter: { tenantId: tenant.id },
});

// 3. Build context from matched chunks
const context = results.matches.map(m => m.metadata.text).join('\n\n');

// 4. Generate answer
const answer = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
  messages: [
    { role: 'system', content: `Answer based on this context:\n${context}` },
    { role: 'user', content: query },
  ],
});
```

---

## AI in Every Skill (Integration Points)

| Skill | AI Integration |
|-------|---------------|
| 07 Quality | Visual TDD loop (GPT-4o), axe-core analysis |
| 08 Deploy | Post-deploy vision verification |
| 09 Brand | AI-generated copy, tone analysis |
| 10 Design | GPT-4o design critique, competitive visual analysis |
| 12 Media | Image gen (Ideogram/GPT), video gen (Sora), critique loops |
| 13 Observability | AI-powered anomaly detection on analytics |
| 14 Idea Engine | AI web research, competitive analysis |
| 17 Competitive | Screenshot competitors + GPT-4o analysis |
| 20 Accessibility | AI-generated alt text (Workers AI) |
| 28 SEO | AI keyword research, meta description generation |
| 33 Blog | AI content generation + human editing |
| 37 Search | RAG with embeddings (Workers AI + Vectorize) |
| 42 i18n | AI translation (Workers AI m2m100) |
| 43 AI Chat | RAG chatbot per tenant |
| 55 Browser | AI-powered test generation from screenshots |

---

## What This Skill Owns
- AI model selection and API integration patterns
- Visual TDD loop (Playwright + GPT-4o)
- Image/video generation workflows and critique loops
- Workers AI edge inference patterns
- RAG architecture and embedding pipelines
- Structured output schemas for reliable AI responses
- AI cost optimization (free Workers AI vs paid APIs)

## What This Skill Must Never Own
- Actual deployment (Skill 08)
- Actual testing framework (Skill 07)
- Actual media asset pipeline (Skill 12)
- Brand strategy (Skill 09)
