---
name: "AI Chat Widget"
description: "MANDATORY on every service/product. Workers AI + Vectorize RAG chat widget trained on the service's own data and context. Auto-indexes all pages into vector store at deploy time. Floating chat bubble, dark theme, streaming responses. Free on CF Workers AI free tier."---

# AI Chat Widget

> Every service gets its own AI chat, trained on its own data. No exceptions.

---

## Mandatory Inclusion Rule

**Every product/service built by this system MUST include an AI chat widget** trained on that specific service's content. This is not optional. The chat must:

1. Be trained exclusively on the service's own pages, docs, and content
2. Auto-re-index at every deploy (content changes = chat knowledge updates)
3. Know the service's name, purpose, pricing, and features
4. Refuse to answer about unrelated topics (stay scoped)
5. Suggest contacting support when it can't help
6. Work within the CF Workers AI free tier (10K neurons/day)

## Context Training Per Service

Each AI chat is unique because it indexes ONLY that service's content:

```typescript
// At deploy time, index THIS service's content
async function indexServiceContent(env: Env) {
  const pages = await getAllPages(); // from sitemap or route map
  const serviceContext = {
    name: env.SITE_NAME,
    description: env.SITE_DESCRIPTION,
    pricing: env.PRICING_INFO || 'See pricing page',
    support_email: env.SUPPORT_EMAIL || 'support@' + env.DOMAIN,
  };

  // Index service metadata as first document
  await indexChunk(env, 'service-context', JSON.stringify(serviceContext), {
    type: 'context', priority: 'high'
  });

  // Index all pages
  for (const page of pages) {
    const chunks = splitIntoChunks(page.content, 500);
    for (const [i, chunk] of chunks.entries()) {
      await indexChunk(env, `${page.url}#${i}`, chunk, {
        url: page.url, title: page.title, type: 'content'
      });
    }
  }
}
```

## System Prompt Template (Per Service)

```typescript
const systemPrompt = `You are the AI assistant for ${env.SITE_NAME}.
${env.SITE_DESCRIPTION}

Rules:
- Only answer questions about ${env.SITE_NAME} and its features
- Use the provided context to give accurate answers
- If the context doesn't cover the question, say: "I don't have information about that. Contact us at ${env.SUPPORT_EMAIL} for help."
- Be concise, friendly, and helpful
- Never make up features or pricing that aren't in the context
- Suggest relevant pages from the site when helpful

Context from ${env.SITE_NAME}:
${context}`;
```

## Architecture

```
User types question → Worker AI embeds query → Vectorize finds relevant chunks
→ Worker AI generates answer from chunks → Stream response to user
```

### Vector Index (Built at Deploy Time)
```typescript
// Index all page content into Vectorize
async function indexSiteContent(env: Env) {
  const pages = await getAllPages(); // from sitemap or route map
  for (const page of pages) {
    // Split into ~500 token chunks
    const chunks = splitIntoChunks(page.content, 500);
    for (const [i, chunk] of chunks.entries()) {
      const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [chunk] });
      await env.VECTORIZE.upsert([{
        id: `${page.url}#${i}`,
        values: embedding.data[0],
        metadata: { url: page.url, title: page.title, chunk },
      }]);
    }
  }
}
```

### Chat API Endpoint
```typescript
app.post('/api/chat', async (c) => {
  const { message } = await c.req.json();
  if (!message || message.length > 500) return c.json({ error: 'Invalid' }, 400);

  // Rate limit: 20 messages per IP per hour
  if (!await rateLimit(c, `chat:${c.req.header('cf-connecting-ip')}`, 20, 3600)) {
    return c.json({ error: 'Too many messages. Try again later.' }, 429);
  }

  // Embed the question
  const queryEmbed = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [message] });

  // Find relevant content
  const matches = await c.env.VECTORIZE.query(queryEmbed.data[0], { topK: 5, returnMetadata: true });
  const context = matches.matches.map(m => m.metadata?.chunk).filter(Boolean).join('\n\n');

  // Generate answer
  const response = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: `You are a helpful assistant for ${c.env.SITE_NAME}. Answer based on this context:\n\n${context}\n\nIf the context doesn't cover the question, say so honestly and suggest contacting support.` },
      { role: 'user', content: message },
    ],
    stream: true,
  });

  return new Response(response, { headers: { 'Content-Type': 'text/event-stream' } });
});
```

### Chat Widget UI
```html
<button id="chatToggle" class="chat-toggle" aria-label="Open chat">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>
</button>
<div id="chatWidget" class="chat-widget" hidden>
  <div class="chat-header">
    <span>Ask anything</span>
    <button onclick="document.getElementById('chatWidget').hidden=true">&times;</button>
  </div>
  <div id="chatMessages" class="chat-messages"></div>
  <form id="chatForm" class="chat-input">
    <input type="text" id="chatInput" placeholder="Type your question..." maxlength="500" autocomplete="off">
    <button type="submit">Send</button>
  </form>
</div>
```

### Styling
```css
.chat-toggle {
  position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 1000;
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #00E5FF, #50AAE3);
  color: #060610; border: none; cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 229, 255, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
}
.chat-toggle:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0, 229, 255, 0.4); }
.chat-widget {
  position: fixed; bottom: 5rem; right: 1.5rem; z-index: 1001;
  width: 380px; max-height: 500px;
  background: #0f0f1f; border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px; overflow: hidden;
  display: flex; flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
```

## Cost: Free on CF Workers AI free tier (10K neurons/day)
