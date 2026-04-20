---
name: "Site Search"
description: "Cloudflare AI Search-powered site search for projectsites.dev: hybrid semantic + keyword search, multi-tenant via folder-prefix filtering or dedicated namespaces, built-in MCP endpoint for AI agents, Cmd+K modal UI, and auto-indexing at deploy time."
layer: "capability-pack"
canonical-owner-of:
  - "ai-search-implementation"
  - "search-indexing-strategy"
  - "cmd-k-search-ui"
  - "mcp-search-endpoint"
---

# Site Search (Cloudflare AI Search)

> Every site with content needs search. AI Search makes it zero-infrastructure.

---

## When to Include (MANDATORY)
- **Every product/service** — Cloudflare AI Search is free and zero-infrastructure
- All SaaS products (even simple ones — search improves UX)
- All projectsites.dev tenant sites (auto-enabled)
- Documentation, blog, and content sites
- Even 3-page sites benefit from Cmd+K search (it's fast to add)

**There is no reason to skip search.** CF AI Search is free, requires no infrastructure, and makes every product feel premium. Include it always.

## Architecture Overview

```
┌────────────────────────────────────────────────────┐
│              Cloudflare AI Search                   │
│                                                     │
│  Shared Namespace (free/standard sites)             │
│  ┌─────────────────────────────────────────┐        │
│  │ Folder-prefix multi-tenancy             │        │
│  │  site-abc123/pages/home                 │        │
│  │  site-abc123/pages/about                │        │
│  │  site-def456/pages/home                 │        │
│  │  site-def456/blog/first-post            │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  Dedicated Namespaces (premium sites)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ premium-1│  │ premium-2│  │ premium-3│          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                     │
│  Features: hybrid search, MCP endpoint, relevance   │
│  boosting, cross-instance search, built-in storage   │
└────────────────────────────────────────────────────┘
```

---

## Default: Cloudflare AI Search (replaces D1 LIKE)

AI Search provides hybrid semantic + keyword search with zero retrieval infrastructure. Create an instance, upload content, search immediately.

### Wrangler Config

```jsonc
// wrangler.jsonc
{
  "ai_search_namespaces": [
    {
      "binding": "AI_SEARCH",
      "namespace": "default"
    }
  ]
}
```

### Instance Creation (Hybrid Search Enabled)

```typescript
// Create a shared multi-tenant instance with hybrid search
const instance = await env.AI_SEARCH.create({
  id: "projectsites-shared",
  index_method: { vector: true, keyword: true },
  fusion_method: "rrf",                          // Reciprocal Rank Fusion
  indexing_options: { keyword_tokenizer: "porter" },
  retrieval_options: { keyword_match_mode: "and" },
});
```

### Premium Sites: Dedicated Namespace

```typescript
// Premium sites get their own instance for isolation + custom config
const premiumInstance = await env.AI_SEARCH.create({
  id: `site-${siteId}`,
  index_method: { vector: true, keyword: true },
  fusion_method: "rrf",
  indexing_options: { keyword_tokenizer: "porter" },
});
```

---

## Multi-Tenant Architecture (projectsites.dev)

### Strategy: Shared Instance + Folder-Prefix Filtering

For 100K+ sites on projectsites.dev, use a single shared AI Search instance with folder-prefix isolation. Each tenant's content is stored under `{siteId}/` prefixes.

#### Folder Structure
```
site-abc123/pages/home
site-abc123/pages/about
site-abc123/blog/getting-started
site-def456/pages/home
site-def456/pages/pricing
```

#### Folder-Prefix Filtering Pattern (Multi-Tenant Isolation)

```typescript
// Search scoped to a single tenant using folder prefix range
const results = await instance.search({
  messages: [{ role: "user", content: query }],
  filters: {
    folder: { $gte: `${siteId}/`, $lt: `${siteId}0` }
  },
});
```

This range query (`$gte` / `$lt`) ensures `site-abc123/` matches but `site-abc1234/` does not. The character `0` (ASCII 48) is the next character after `/` (ASCII 47) in sort order for alphanumeric IDs.

#### Tier Matrix

| Tier | Strategy | Isolation | Cross-Instance | Max Pages |
|------|----------|-----------|----------------|-----------|
| Free | Shared instance, folder-prefix | Metadata filter | No | 50 |
| Standard | Shared instance, folder-prefix | Metadata filter | No | 500 |
| Premium | Dedicated instance via `ai_search_namespaces` | Full instance | Yes (cross-instance search) | 10,000 |
| Enterprise | Dedicated namespace | Full namespace | Yes | Unlimited |

---

## Search API Endpoint

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().min(2).max(200),
  siteId: z.string().min(1),
  limit: z.number().min(1).max(50).default(10),
});

app.get('/api/search', zValidator('query', searchSchema), async (c) => {
  const { q, siteId, limit } = c.req.valid('query');

  // Determine if site has dedicated instance (premium) or uses shared
  const siteConfig = await c.env.KV.get(`site:${siteId}:config`, 'json');
  const isPremium = siteConfig?.tier === 'premium' || siteConfig?.tier === 'enterprise';

  let results;

  if (isPremium) {
    // Premium: dedicated instance, no folder filter needed
    const instance = env.AI_SEARCH.get(`site-${siteId}`);
    results = await instance.search({
      messages: [{ role: "user", content: q }],
      ai_search_options: { max_num_results: limit },
    });
  } else {
    // Shared: folder-prefix filtering for tenant isolation
    const shared = env.AI_SEARCH.get("projectsites-shared");
    results = await shared.search({
      messages: [{ role: "user", content: q }],
      filters: {
        folder: { $gte: `${siteId}/`, $lt: `${siteId}0` }
      },
      ai_search_options: { max_num_results: limit },
    });
  }

  return c.json({
    results: results.results.map((r: any) => ({
      url: r.metadata?.url || r.id,
      title: r.metadata?.title || '',
      snippet: r.content?.substring(0, 200) || '',
      score: r.score,
    })),
  });
});
```

---

## MCP Endpoint for AI Agents

Every AI Search instance includes a built-in MCP endpoint. AI agents (Claude, GPT, custom) can search site content directly.

### Exposing MCP per Tenant

```typescript
// MCP endpoint for AI agents to search a specific site
app.get('/api/mcp/:siteId', async (c) => {
  const siteId = c.req.param('siteId');
  const siteConfig = await c.env.KV.get(`site:${siteId}:config`, 'json');

  if (!siteConfig?.mcpEnabled) {
    return c.json({ error: 'MCP not enabled for this site' }, 403);
  }

  // Proxy to AI Search's built-in MCP endpoint with tenant scoping
  // AI Search instances have MCP built in at /mcp path
  const instance = env.AI_SEARCH.get(
    siteConfig.tier === 'premium' ? `site-${siteId}` : 'projectsites-shared'
  );

  return c.json({
    mcpEndpoint: `https://projectsites.dev/api/mcp/${siteId}`,
    description: `Search ${siteConfig.name} content`,
    tools: [{
      name: 'search',
      description: `Search content on ${siteConfig.name}`,
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
        },
        required: ['query'],
      },
    }],
  });
});
```

### MCP Tool Handler

```typescript
// Handle MCP tool calls from AI agents
app.post('/api/mcp/:siteId/tools/search', async (c) => {
  const siteId = c.req.param('siteId');
  const { query } = await c.req.json();

  const shared = env.AI_SEARCH.get("projectsites-shared");
  const results = await shared.search({
    messages: [{ role: "user", content: query }],
    filters: {
      folder: { $gte: `${siteId}/`, $lt: `${siteId}0` }
    },
    ai_search_options: { max_num_results: 5 },
  });

  return c.json({
    content: [{
      type: 'text',
      text: results.results.map((r: any) =>
        `**${r.metadata?.title}** (${r.metadata?.url})\n${r.content?.substring(0, 300)}`
      ).join('\n\n'),
    }],
  });
});
```

---

## Auto-Index at Deploy Time

Every deploy triggers a full re-index of all site pages into AI Search.

```typescript
// Run after deploy to index all pages into AI Search
async function indexSitePages(env: Env, siteId: string, pages: SitePage[]) {
  const isPremium = (await env.KV.get(`site:${siteId}:config`, 'json'))?.tier === 'premium';
  const instance = isPremium
    ? env.AI_SEARCH.get(`site-${siteId}`)
    : env.AI_SEARCH.get('projectsites-shared');

  for (const page of pages) {
    const itemId = isPremium
      ? `pages/${page.slug}`                    // Premium: no prefix needed
      : `${siteId}/pages/${page.slug}`;         // Shared: folder-prefix for isolation

    // Upload content and wait for indexing
    await instance.items.uploadAndPoll(itemId, page.content, {
      metadata: {
        title: page.title,
        url: page.url,
        description: page.description,
        category: page.category || 'page',
        updatedAt: new Date().toISOString(),
      },
    });
  }

  console.log(`Indexed ${pages.length} pages for site ${siteId}`);
}

// Usage in deploy pipeline
interface SitePage {
  slug: string;
  title: string;
  url: string;
  content: string;
  description?: string;
  category?: string;
}
```

### Incremental Indexing (on Page Update)

```typescript
// Index a single page when it's created or updated
async function indexSinglePage(env: Env, siteId: string, page: SitePage) {
  const isPremium = (await env.KV.get(`site:${siteId}:config`, 'json'))?.tier === 'premium';
  const instance = isPremium
    ? env.AI_SEARCH.get(`site-${siteId}`)
    : env.AI_SEARCH.get('projectsites-shared');

  const itemId = isPremium ? `pages/${page.slug}` : `${siteId}/pages/${page.slug}`;

  await instance.items.uploadAndPoll(itemId, page.content, {
    metadata: {
      title: page.title,
      url: page.url,
      description: page.description,
      updatedAt: new Date().toISOString(),
    },
  });
}
```

---

## Search UI (Cmd+K Modal)

```html
<div id="searchModal" class="search-modal" hidden>
  <div class="search-backdrop" onclick="closeSearch()"></div>
  <div class="search-container">
    <div class="search-header">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input type="search" id="searchInput" placeholder="Search..." autofocus>
      <kbd class="search-shortcut">Esc</kbd>
    </div>
    <div id="searchResults" class="search-results"></div>
    <div class="search-footer">
      <span><kbd>↑↓</kbd> Navigate</span>
      <span><kbd>↵</kbd> Open</span>
      <span><kbd>Esc</kbd> Close</span>
      <span class="search-powered">Powered by AI Search</span>
    </div>
  </div>
</div>
```

```javascript
// Cmd+K / Ctrl+K to open
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchModal').hidden = false;
    document.getElementById('searchInput').focus();
  }
  if (e.key === 'Escape') closeSearch();
});

function closeSearch() {
  document.getElementById('searchModal').hidden = true;
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

// Debounced search with loading state
let timeout;
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  clearTimeout(timeout);
  const q = e.target.value;
  if (q.length < 2) {
    document.getElementById('searchResults').innerHTML = '';
    return;
  }
  // Show loading
  document.getElementById('searchResults').innerHTML = '<div class="search-loading">Searching...</div>';
  timeout = setTimeout(async () => {
    const siteId = document.documentElement.dataset.siteId; // Set on <html data-site-id="...">
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&siteId=${siteId}`);
    const { results } = await res.json();
    renderResults(results);
  }, 200);
});

function renderResults(results) {
  const container = document.getElementById('searchResults');
  if (!results.length) {
    container.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }
  container.innerHTML = results.map((r, i) => `
    <a href="${r.url}" class="search-result ${i === 0 ? 'active' : ''}" data-index="${i}">
      <div class="search-result-title">${r.title}</div>
      <div class="search-result-snippet">${r.snippet}</div>
    </a>
  `).join('');
}

// Keyboard navigation in results
document.getElementById('searchResults')?.addEventListener('keydown', (e) => {
  const results = document.querySelectorAll('.search-result');
  const active = document.querySelector('.search-result.active');
  const idx = active ? parseInt(active.dataset.index) : -1;

  if (e.key === 'ArrowDown' && idx < results.length - 1) {
    e.preventDefault();
    active?.classList.remove('active');
    results[idx + 1].classList.add('active');
    results[idx + 1].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp' && idx > 0) {
    e.preventDefault();
    active?.classList.remove('active');
    results[idx - 1].classList.add('active');
    results[idx - 1].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter' && active) {
    e.preventDefault();
    window.location.href = active.href;
  }
});
```

---

## Cross-Instance Search (Premium Feature)

Premium sites can search across multiple instances in one call:

```typescript
// Search across multiple premium site instances
const results = await env.AI_SEARCH.search({
  messages: [{ role: "user", content: query }],
  ai_search_options: {
    instance_ids: ["site-abc123", "site-def456", "product-docs"],
  },
});
```

---

## Relevance Boosting

Boost recent content or high-priority pages:

```typescript
const results = await instance.search({
  messages: [{ role: "user", content: query }],
  boost: [
    { field: "timestamp", method: "recency", weight: 1.2 },
    { field: "category", method: "match", value: "docs", weight: 1.5 },
  ],
});
```

---

## Migration from D1 LIKE Queries

If upgrading an existing site from D1 LIKE search:

1. Keep the same `/api/search` endpoint signature
2. Replace D1 query with AI Search `instance.search()`
3. Add `data-site-id` attribute to `<html>` element
4. Run `indexSitePages()` on first deploy to populate AI Search
5. Remove `search_index` table from D1 after verification
6. Enable hybrid search for immediate quality improvement

---

## Trigger Conditions
- Site has 5+ pages of content
- User mentions "search", "find", "Cmd+K"
- Blog or documentation site
- Any projectsites.dev tenant

## Cross-Skill Dependencies
- **Reads from:** 06-build-and-slice-loop (pages to index), 08-deploy-and-runtime (deploy trigger)
- **Feeds into:** 43-ai-chat-widget (RAG context), 52-mcp-and-cloud-integrations (MCP endpoint)

## What This Skill Owns
- Search indexing strategy (AI Search)
- Multi-tenant search isolation
- Search API endpoint
- Cmd+K search UI
- MCP search endpoint for AI agents
- Auto-indexing at deploy time
- Cross-instance search for premium tiers

## What This Skill Must Never Own
- AI chat/conversational UI (-> 43)
- General MCP integration (-> 52)
- Deployment execution (-> 08)
