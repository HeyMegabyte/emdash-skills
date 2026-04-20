---
name: "Architecture and Stack"
description: "Cloudflare-first platform selection and architecture design. Decision trees for Workers, Pages, D1, R2, KV, Durable Objects, Queues, Vectorize. Default stack with override conditions. Auth via Clerk, data patterns, reliability structure, and complete API key reference."
layer: "product-compiler"
canonical-owner-of:
  - "platform-selection"
  - "architecture-patterns"
  - "cloudflare-decision-trees"
  - "auth-architecture"
  - "data-architecture"
---

# 05 — Architecture and Stack

> Cloudflare-first. Choose fast. Build right. Scale later.

---

## Core Principle

**Start with the default stack. Deviate only when requirements demand it.** Every technology choice must justify itself against the default. The default stack exists because it works — override it with evidence, not preference.

---

## Default Stack

| Need | Default | Override When |
|------|---------|---------------|
| **Hosting** | Cloudflare Workers + Pages | Never (hard constraint) |
| **Backend** | Hono on Workers | Complex GraphQL needs → consider Yoga |
| **Frontend (simple)** | Vanilla HTML/CSS/JS on Workers | More than 3 interactive pages |
| **Frontend (complex)** | Angular 19 + Ionic + Nx | Simple marketing site |
| **Database (simple)** | D1 (SQLite) | Joins > 3 tables, complex queries |
| **Database (complex)** | Neon PostgreSQL | D1 is sufficient |
| **Cache / Config** | Cloudflare KV | Need atomic operations → D1 |
| **Object Storage** | Cloudflare R2 | S3-specific SDK requirement |
| **Auth** | Clerk | Custom auth flow explicitly requested |
| **Payments** | Stripe (+ Stripe Link) | Non-card payments, crypto |
| **Email (transactional)** | Resend | Bulk sending → SendGrid/Listmonk |
| **Email (marketing)** | Listmonk on CF Containers | Simple transactional only → Resend |
| **Analytics** | GA4 via GTM + PostHog | Privacy-first → PostHog only |
| **Error tracking** | Sentry | PostHog errors sufficient |
| **Testing** | Playwright (E2E) + Vitest (unit) | — |
| **Validation** | Zod | — |
| **Notifications** | OneSignal | Simple email only → Resend |
| **Search** | Cloudflare Vectorize + Workers AI | Simple text → D1 LIKE queries |
| **Queues** | Cloudflare Queues | — |
| **Realtime** | Durable Objects + WebSocket | Simple polling sufficient |
| **Scheduling** | Cloudflare Cron Triggers | — |
| **AI/ML** | Workers AI | Specific model needed → OpenAI/Anthropic |
| **Workflows** | Inngest (step functions for Workers) or CF Workflows v2 | Simple cron → Cron Triggers |
| **AI Agents** | cloudflare/agents SDK (`Think` class on Durable Objects) | No agent needed |
| **AI Memory** | Mem0 (persistent context across sessions) | Stateless agents only |
| **IaC** | Wrangler CLI + wrangler.toml | Multi-cloud → Pulumi |

---

## Cloudflare Platform Decision Trees

### "I need to run code"
```
Static site only? → Pages
API endpoints? → Workers (Hono)
Long-running tasks? → Workers + Queues or Workflows
Stateful connections? → Durable Objects
Container workloads? → Cloudflare Containers
Scheduled tasks? → Cron Triggers
Browser automation? → Browser Rendering API
```

### "I need to store data"
```
Key-value config? → KV
Relational data (simple)? → D1
Relational data (complex)? → Neon PostgreSQL
Files/blobs? → R2
Session state? → Durable Objects or KV
Search index? → Vectorize
Message queue? → Queues
```

### "I need security"
```
Bot protection? → Turnstile (free)
DDoS? → Always-on (free tier)
WAF rules? → CF WAF
Auth? → Clerk (via Workers middleware)
Rate limiting? → KV-based per-endpoint counters
Secrets? → wrangler secret put (never .env in repo)
```

---

## Architecture Patterns

### Simple Marketing Site
```
Cloudflare Worker (Hono)
├── Static HTML/CSS/JS
├── R2 for images
├── KV for config
├── GA4 + GTM
├── Turnstile on forms
└── Resend for contact form
```

### SaaS Application
```
Cloudflare Pages (Angular + Ionic)
├── Workers API (Hono)
│   ├── D1 or Neon (data)
│   ├── R2 (uploads)
│   ├── KV (cache)
│   ├── Queues (async jobs)
│   └── Durable Objects (realtime)
├── Clerk (auth)
├── Stripe (billing)
├── Resend (transactional email)
├── Listmonk (marketing email)
├── PostHog + Sentry + GA4
└── Playwright + Vitest
```

### API Service
```
Cloudflare Worker (Hono)
├── D1 or Neon (data)
├── KV (rate limiting, cache)
├── R2 (if file handling)
├── Queues (async processing)
├── Workers AI (if ML features)
├── Sentry (error tracking)
└── PostHog (API analytics)
```

### R2 File Uploads (Presigned URLs)
For user file uploads, use R2 with presigned URLs (same pattern as OpenSaaS S3):
```typescript
// Generate presigned upload URL
app.post('/api/upload-url', async (c) => {
  const { filename, contentType } = await c.req.json();
  const key = `uploads/${ulid()}-${filename}`;
  // R2 presigned URL via S3-compatible API
  const url = await c.env.R2.createMultipartUpload(key);
  return c.json({ uploadUrl: url, key });
});
```
Client uploads directly to R2 → no Worker CPU/memory for file transfer.

---

## Service Boundaries

### Monolith-First Rule
Start with a single Worker. Split only when:
- Different scaling requirements (e.g., API vs webhook processor)
- Different deployment cadences
- Worker size limit exceeded (1MB free, 10MB paid)
- Isolation requirements (security boundary)

### When to Split
- API and frontend should be separate Workers when frontend is Angular
- Webhook handlers should be separate Workers for isolation
- Cron jobs can share the API Worker via scheduled handler

---

## Auth Architecture

### Default: Clerk
```
User → Clerk widget → JWT → Worker middleware verifies → proceed
```

### Clerk Integration Pattern
1. Clerk handles all auth UI (sign-up, sign-in, profile)
2. Worker middleware verifies JWT on every request
3. User metadata stored in D1 (Clerk ID as foreign key)
4. Roles/permissions in D1 (not Clerk metadata)

### When Auth is NOT Needed
- Public marketing sites
- Open-source project documentation
- Public APIs with rate limiting only

---

## Data Architecture

### ORM: Drizzle (Default — skill 44)
Use Drizzle ORM for all database access. Schema defined in TypeScript, type-safe queries, auto-generated migrations via `drizzle-kit`. See skill 44 for full patterns.

### D1 Schema Conventions (via Drizzle)
- `id` — TEXT PRIMARY KEY (ULID for ordered inserts)
- `created_at` — TEXT (ISO 8601)
- `updated_at` — TEXT (ISO 8601)
- `deleted_at` — TEXT NULL (soft delete)
- All foreign keys explicit
- Indexes on every foreign key and frequent query column

### Neon When D1 Isn't Enough
- Complex joins (> 3 tables)
- Full-text search (pg_trgm)
- JSON querying (jsonb)
- Complex aggregations
- Row-level security needs
- > 500MB data

---

## API Key Reference

### Key Locations
- All keys: `/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`
- GCP: `/Users/apple/.config/emdash/gcp-service-account.json`
- CF Global: blzalewski@gmail.com / `84fa0d1b16ff8086dd958c468ce7fd59`

### Key Services Quick Reference
| Service | Env Variable | Free Tier |
|---------|-------------|-----------|
| Cloudflare | `CLOUDFLARE_API_TOKEN` | Yes (generous) |
| Stripe | `STRIPE_API_KEY` | Test mode free |
| Resend | `RESEND_API_KEY` | 100 emails/day |
| PostHog | `POSTHOG_API_KEY` | 1M events/mo |
| Sentry | `SENTRY_AUTH_TOKEN` | 5K errors/mo |
| OpenAI | `OPENAI_API_KEY` | Pay-per-use |
| Anthropic | `ANTHROPIC_API_KEY` | Pay-per-use |
| Ideogram | `IDEOGRAM_API_KEY` | Pay-per-use |
| Unsplash | `UNSPLASH_ACCESS_KEY` | 50 req/hr |
| Pexels | `PEXELS_API_KEY` | 200 req/hr |
| GA4 | GCP service account | Free |
| Clerk | `CLERK_SECRET_KEY` | 10K MAU |

---

## Reliability Structure

### Error Handling Pattern
```typescript
// Hono error handler
app.onError((err, c) => {
  console.error(`[${c.req.method}] ${c.req.path}:`, err);
  // Report to Sentry
  c.env.SENTRY?.captureException(err);
  return c.json({ error: 'Internal server error' }, 500);
});
```

### Retry Strategy
- Idempotent operations: retry up to 3 times with exponential backoff
- Non-idempotent operations: no automatic retry, surface error
- Queue operations: built-in retry with dead letter queue

### Health Checks
- `GET /health` — returns 200 with version and timestamp
- `GET /health/db` — verifies D1/Neon connectivity
- `GET /health/services` — checks external service reachability

---

## Trigger Conditions
- New project (select full stack)
- New feature requiring new service
- Performance issue requiring architecture change
- Scale requirements changing

## Stop Conditions
- Stack is selected and documented
- Architecture is sufficient for current requirements

## Cross-Skill Dependencies
- **Reads from:** 02-goal-and-brief (product requirements), 03-planning-and-research (technology evaluation)
- **Feeds into:** 06-build-and-slice-loop (what to build with), 08-deploy-and-runtime (deployment config), 13-observability-and-growth (service integration)

---

## What This Skill Owns
- Platform and service selection
- Architecture patterns and boundaries
- Auth architecture
- Data architecture
- API key management reference
- Reliability patterns
- Cloudflare-specific decision trees
- See STYLE_GUIDES.md for Hono patterns

## What This Skill Must Never Own
- Implementation details (→ 06)
- Deployment execution (→ 08)
- Visual design (→ 10)
- Analytics configuration (→ 13)
- Testing strategy (→ 07)

---

## Cloudflare Infrastructure Reference

### Account Credentials
- **Email:** blzalewski@gmail.com
- **Account ID:** 84fa0d1b16ff8086dd958c468ce7fd59
- **Zone (megabyte.space):** 75a6f8d5e441cd7124552976ba894f83
- **API Token:** in shared key pool (skill 26)

### Deploy + Purge (ALWAYS together)
```bash
npx wrangler deploy

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

sleep 3  # edge propagation
```

### Product Decision Matrix

| Product | Use Case | Free Limit | Paid |
|---------|----------|------------|------|
| **Workers** | APIs, SSR, edge compute | 100K req/day, 10ms CPU | Unlimited, 30s CPU |
| **Pages** | Static sites, SPAs | 500 builds/mo | 5K builds/mo |
| **D1** | SQLite database | 5M rows, 5GB | 10B rows, 50GB |
| **R2** | Object storage (S3-compat) | 10GB, 10M req/mo | Pay per use |
| **KV** | Key-value cache | 100K reads/day | Unlimited |
| **Containers** | Docker workloads | — | Pay per use |
| **Queues** | Background jobs | 1M msg/mo | Pay per use |
| **Durable Objects** | Stateful, WebSocket, rate limit | 100K req/day | Pay per use |
| **Vectorize** | Vector search | 5M vectors | Pay per use |
| **Workers AI** | ML inference at edge | 10K neurons/day | Pay per use |

### Security Headers (EVERY Worker)

```typescript
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com https://*.posthog.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://images.unsplash.com https://images.pexels.com https://*.stripe.com",
    "connect-src 'self' https://www.google-analytics.com https://*.posthog.com https://*.sentry.io https://challenges.cloudflare.com",
    "frame-src https://www.youtube.com https://www.google.com https://js.stripe.com https://challenges.cloudflare.com",
  ].join('; '));
});
```

### Turnstile (All Public Forms)
```html
<div class="cf-turnstile" data-sitekey="SITE_KEY" data-theme="dark"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```
```typescript
// Server verification
const fd = new URLSearchParams();
fd.append('secret', env.TURNSTILE_SECRET_KEY);
fd.append('response', token);
const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: fd });
if (!(await r.json()).success) return c.json({ error: 'Captcha failed' }, 403);
```

### Rate Limiting (KV-based)
```typescript
async function rateLimit(c: Context, key: string, limit: number, window: number): Promise<boolean> {
  const current = parseInt(await c.env.KV.get(`rl:${key}`) || '0');
  if (current >= limit) return false;
  await c.env.KV.put(`rl:${key}`, String(current + 1), { expirationTtl: window });
  return true;
}
```

### DNS Management
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -d '{"type":"CNAME","name":"sub","content":"project.workers.dev","proxied":true}'
```

### Wrangler.toml Template
```toml
name = "project-name"
main = "src/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

routes = [{ pattern = "domain.com", custom_domain = true }]

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "KV"
id = "abc123"

[[d1_databases]]
binding = "DB"
database_name = "project-db"
database_id = "abc123"

[[r2_buckets]]
binding = "R2"
bucket_name = "project-assets"
```

---

## Enhancement: AI Agent Patterns on Cloudflare (Source: Cloudflare Agents Week, April 2026)

### Agents SDK "Think" Framework
Cloudflare's Agents SDK provides a high-level `Think` base class built on Durable Objects:
- Each agent is an addressable entity with its own SQLite database
- Consumes zero compute when hibernated (actor model)
- 10,000 agents active 1% of the time = ~100 simultaneous instances, not 10,000 VMs

### Key Architectural Patterns

**Durable Execution with Fibers:**
```typescript
// Long-running agent tasks survive crashes
await runFiber(async (fiber) => {
  const result = await fiber.stash(expensiveOperation());
  // State checkpointed - recoverable on restart
  await fiber.stash(nextStep(result));
});
// onFiberRecovered() hook resumes after platform restarts
```

**Dynamic Workers for Sandboxed Execution:**
```typescript
// Agent writes and executes code in a fresh V8 isolate
const sandbox = await createDynamicWorker({
  globalOutbound: null, // zero permissions by default
  bindings: { KV: env.KV }, // explicit capability grants
});
```

**Execution Ladder (escalate as needed):**
- Tier 0: Workspace (virtual filesystem via SQLite + R2)
- Tier 1: Dynamic Worker (sandboxed JS, millisecond startup)
- Tier 2: npm resolution via `@cloudflare/worker-bundler`
- Tier 3: Headless browser automation
- Tier 4: Full sandboxed environments with toolchains

**Sub-Agent Coordination with Facets:**
Child agents get colocated isolation with their own SQLite and execution context. RPC between agents is typed via TypeScript, with function-call latency (not network).

### Code Mode MCP Pattern
Instead of exposing 2,500+ individual tool calls, Cloudflare's MCP server uses just 2 tools and under 1,000 tokens. Agents write TypeScript code that calls APIs directly — 81% reduction in token usage vs traditional MCP.

### MCP Security (Shadow MCP)
Shadow MCP (unauthorized MCP servers connected to AI tools) is the 2026 equivalent of Shadow IT. Use Cloudflare Gateway to detect Shadow MCP traffic. Reference architecture: Cloudflare Access (auth) + AI Gateway (observability/rate limiting) + MCP portals (discovery).

### Traffic Reality
Agentic actors represent ~10% of Cloudflare network requests as of March 2026 (up 60% YoY). Design every API to serve both human and agent consumers.
