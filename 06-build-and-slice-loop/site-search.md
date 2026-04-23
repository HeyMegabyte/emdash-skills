---
name: "Site Search"
version: "2.0.0"
updated: "2026-04-23"
description: "Cloudflare AI Search (formerly AutoRAG): hybrid semantic + keyword search, dynamic instances, relevance boosting, multi-tenant via folder-prefix filtering or dedicated namespaces, built-in MCP endpoint for AI agents, Cmd+K modal UI, auto-indexing at deploy."
---

# Site Search (Cloudflare AI Search)

**MANDATORY for every product.** CF AI Search is free, zero-infrastructure, makes products feel premium.

## Wrangler Config
```jsonc
{ "ai_search_namespaces": [{ "binding": "AI_SEARCH", "namespace": "default" }] }
```

## Instance Creation
```typescript
const instance = await env.AI_SEARCH.create({
  id: "projectsites-shared",
  index_method: { vector: true, keyword: true },
  fusion_method: "rrf",
  indexing_options: { keyword_tokenizer: "porter" },
  retrieval_options: { keyword_match_mode: "and" },
});
```

## Multi-Tenant: Folder-Prefix Isolation
```typescript
// Shared instance, filter by site prefix
const results = await instance.search({
  messages: [{ role: "user", content: query }],
  filters: { folder: { $gte: `${siteId}/`, $lt: `${siteId}0` } },
});
```
Range query ensures `site-abc123/` matches but `site-abc1234/` does not.

### Tier Matrix
| Tier | Strategy | Max Pages |
|------|----------|-----------|
| Free | Shared, folder-prefix | 50 |
| Standard | Shared, folder-prefix | 500 |
| Premium | Dedicated instance | 10,000 |
| Enterprise | Dedicated namespace | Unlimited |

## Search API
```typescript
app.get('/api/search', zValidator('query', searchSchema), async (c) => {
  const { q, siteId, limit } = c.req.valid('query');
  const isPremium = (await c.env.KV.get(`site:${siteId}:config`, 'json'))?.tier === 'premium';
  const instance = isPremium ? env.AI_SEARCH.get(`site-${siteId}`) : env.AI_SEARCH.get("projectsites-shared");
  const results = await instance.search({
    messages: [{ role: "user", content: q }],
    ...(isPremium ? {} : { filters: { folder: { $gte: `${siteId}/`, $lt: `${siteId}0` } } }),
    ai_search_options: { max_num_results: limit },
  });
  return c.json({ results: results.results.map((r: any) => ({ url: r.metadata?.url, title: r.metadata?.title, snippet: r.content?.substring(0, 200), score: r.score })) });
});
```

## MCP Endpoint for AI Agents
Expose per-tenant search as MCP tool at `/api/mcp/:siteId`. Returns tool definition + handles tool calls with tenant-scoped search.

## Auto-Index at Deploy
```typescript
async function indexSitePages(env: Env, siteId: string, pages: SitePage[]) {
  const isPremium = (await env.KV.get(`site:${siteId}:config`, 'json'))?.tier === 'premium';
  const instance = isPremium ? env.AI_SEARCH.get(`site-${siteId}`) : env.AI_SEARCH.get('projectsites-shared');
  for (const page of pages) {
    const itemId = isPremium ? `pages/${page.slug}` : `${siteId}/pages/${page.slug}`;
    await instance.items.uploadAndPoll(itemId, page.content, {
      metadata: { title: page.title, url: page.url, description: page.description, updatedAt: new Date().toISOString() },
    });
  }
}
```

## Cmd+K UI
Keyboard: Cmd/Ctrl+K opens, Escape closes. Debounced 200ms search on input. Arrow keys navigate results. Enter opens. Shows loading state, empty state.

## Cross-Instance Search (Premium)
```typescript
await env.AI_SEARCH.search({ messages: [...], ai_search_options: { instance_ids: ["site-abc", "site-def"] } });
```

## Relevance Boosting
```typescript
boost: [{ field: "timestamp", method: "recency", weight: 1.2 }, { field: "category", method: "match", value: "docs", weight: 1.5 }]
```

## Migration from D1 LIKE
Keep same `/api/search` endpoint, replace D1 query with AI Search, add `data-site-id` to `<html>`, run indexSitePages on first deploy, remove search_index table after verification.

## Ownership
**Owns:** Search indexing, multi-tenant isolation, search API, Cmd+K UI, MCP endpoint, auto-indexing, cross-instance search.
**Never owns:** AI chat/conversational (->43), general MCP (->52), deployment (->08).
