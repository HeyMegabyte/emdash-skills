# Conventions

Shared constants and patterns. Reference instead of re-deriving.

## Brand Tokens

Black `#060610` | Cyan `#00E5FF` | Blue `#50AAE3` | Purple (cosmic/space only) `#7C3AED`
Font heading: Sora | Font body: Space Grotesk | Font mono: JetBrains Mono
Handle: HeyMegabyte | Email: hey@megabyte.space
GitHub products: HeyMegabyte | GitHub infra: ProfessorManhattan | GitHub skills+templates: megabytespace
Template repo: megabytespace/saas-starter | Infra configs: ProfessorManhattan/proxmox-configs, coolify-configs
Dark theme FIRST. Purple for cosmic/space only.

## Owned Domains

megabyte.space | projectsites.dev | fundl.ink | gitl.ink | deskl.ink | linkbl.ink | thebestsites.com | install.doctor | claimyour.site | item.link | socia.link | onionl.ink | all-hands.dev | dreame.dev | soupl.ink | grantl.ink

## Stack

CF Workers+Hono v4.12+ | Angular 20+Ionic+PrimeNG | Capacitor | D1/Neon | Drizzle v1-beta (passed Prisma in downloads) | Zod | Clerk (SaaS)/Authentik (self-hosted) | Stripe | Resend | Inngest | Bun (Node.js fallback) | Playwright v1.56+ | Vitest | ESLint+Prettier | PostHog | Sentry | GA4/GTM

## Angular 20 Key Changes

`effect()`+`linkedSignal`+`toSignal` stable | Zoneless change detection (dev preview, no Zone.js) | HttpResource (signal-based reactive HTTP) | `@if`/`@for` control flow replaces `*ngIf`/`*ngFor` | Incremental hydration stable | Host bindings type-checked
Standalone-only (no NgModules for new projects) | Signal stores per feature | providedIn:'root' | Angular 20 released May 28 2025

## Drizzle v1 Patterns

`sqliteTable` for D1 | plural snake_case tables (`users`, `blog_posts`) | `$inferSelect`/`$inferInsert` for types | `createInsertSchema`/`createSelectSchema` for Zod | batch API (not `BEGIN` — D1 doesn't support transactions) | prepared statements for repeated queries | Node.js compat polyfill in wrangler.jsonc

## CF Workers Limits (2026)

Free: 100K req/day, 10ms CPU | Paid: unlimited req, 5min CPU (30s default) | Memory: 128MB/isolate | Worker size: 3MB free / 10MB paid | Subrequests: 50 free / 10K paid | Static assets: 20K free / 100K paid | WebSocket msg: 32MiB | D1 storage: 250GB→1TB (paid) | Cron: 5 free / 250 paid
D1 global read replication (beta): routes reads to nearest replica, 40-60% latency decrease

## CF Agents SDK (Agents Week 2026)

AIChatAgent: streaming chat, auto persistence, resumable streams, tool support | MCPAgent: build MCP servers | Durable Objects: stateful micro-server with SQL DB, WebSockets, scheduling | Dynamic Workers: V8 isolate sandboxing, 100x faster than containers | CF Sandboxes (GA): isolated persistent environments | CF Mesh: private networking for users/nodes/agents/Workers | Flagship: native feature flags sub-ms evaluation | Artifacts: git-compatible versioned storage | Workflows v2: higher concurrency

## Pricing Defaults

SaaS: Free + $50/mo Pro | Nonprofits: $10/$25/$50/$100/$250/$500 presets | Stripe: 2.9%+$0.30 per card, +0.7% per recurring (Billing)

## Deploy

```bash
npx wrangler deploy
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

One-liner: `npx wrangler deploy && curl -sX POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" -d '{"purge_everything":true}'`

## Test

```bash
PROD_URL=https://domain.com npx playwright test
npx tsc --noEmit && npx eslint . --max-warnings=0 && npx prettier --check .
```

## Secrets

```bash
get-secret SECRET_NAME  # chezmoi, 182 encrypted secrets
# Shared env: use `CLAUDE_ENV_FILE` when set, otherwise the active project's `.env.local`
# Config: ~/.config/emdash/ (coolify-token, gcp-service-account.json)
```

All MCP secrets: active project env file or `get-secret`. Check env vars first, then chezmoi.

## CF Credentials

blzalewski@gmail.com | `get-secret CLOUDFLARE_API_TOKEN` | `get-secret CLOUDFLARE_ACCOUNT_ID`

## Infrastructure

Proxmox+ZFS | OPNsense | CF Tunnels | WireGuard+Mullvad | Headscale | PBS→R2+Wasabi

## Self-Hosted (70+ on Coolify)

Coolify coolify.megabyte.space | Authentik (SSO) | Healthchecks | Open WebUI | Bolt.diy | Dify | Postiz | n8n | NocoDB | Home Assistant | Windmill | Chatwoot | Sentry sentry.megabyte.space | Netdata | Firecrawl | Listmonk | PostHog posthog.megabyte.space | Browserless | Grafana | LiteLLM ai.megabyte.space | SearXNG | Backrest | Code Server | Directus | Langflow | MetaMCP | Plane | Paymenter

## MCP Servers

Cloudflare (OAuth) | Playwright (stdio) | Sentry (HTTP/OAuth) | PostHog (SSE/OAuth) | Gmail/Calendar/Drive (OAuth) | Stripe (OAuth) | Canva (OAuth) | GitHub (HTTP) | Coolify (stdio) | Firecrawl (stdio) | n8n (stdio) | Home Assistant (stdio) | DeepSeek (stdio) | Postiz (HTTP) | Notion (stdio) | Supermemory (HTTP) | WordPress (stdio) | Plane (stdio) | Omi (Docker) | Sequential Thinking (stdio) | Computer Use (native)

## MCP Rate Limits

Stripe 25/sec | GitHub 5000/hr | Firecrawl 1/sec/domain | Postiz 100/day

## Media Generation

Logo: Ideogram v3 (`IDEOGRAM_API_KEY`) | Images: GPT Image 1.5 (`OPENAI_API_KEY`) | Video: Sora 2 (`scripts/sora.py`)
WebP photo 80% <200KB | WebP illustration 90% <150KB | PNG logo lossless <50KB | SVG optimized <10KB | MP4 hero CRF28 <2MB | OG 1200x630 PNG

## Analytics

GA4/GTM: `~/.config/emdash/gcp-service-account.json` | PostHog: posthog.megabyte.space | Sentry: sentry.megabyte.space

## Key Integrations

CF AI Search (RAG per tenant, formerly AutoRAG) | Stagehand (AI browser testing, accessibility-tree MCP) | CF Agents SDK | Inngest (step functions) | Mem0 (persistent AI memory) | Flagship (feature flags)

## Breakpoints

```typescript
const BREAKPOINTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
```

## Hono Worker Starter

```typescript
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { cors } from 'hono/cors';
type Env = { DB: D1Database; KV: KVNamespace; AI: Ai; VECTORIZE: VectorizeIndex; AI_SEARCH: AiSearch; TURNSTILE_SECRET: string; SITE_NAME: string; SITE_DESCRIPTION: string; };
const app = new Hono<{ Bindings: Env }>();
app.use('*', secureHeaders());
app.use('/api/*', cors({ origin: ['https://domain.com'] }));
export default app;
```

## Security Headers (OWASP 2025)

OWASP Top 10:2025 — A01 Broken Access Control | A02 Security Misconfiguration | A03 Software Supply Chain Failures (NEW, was #9) | A04 Cryptographic Failures | A05 Injection | A06 Insecure Design | A07 Auth Failures | A08 Data Integrity Failures | A09 Logging Failures | A10 Mishandling Exceptional Conditions (NEW)

Must add: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | `X-Content-Type-Options: nosniff` | `X-Frame-Options: DENY` | `Referrer-Policy: strict-origin-when-cross-origin` | `Cross-Origin-Opener-Policy: same-origin` | `Permissions-Policy: geolocation=(), camera=(), microphone=()` | `Cross-Origin-Embedder-Policy: require-corp`
Must remove: `X-XSS-Protection` (CSP replaces it, creates vulns in old browsers) | `Expect-CT` (deprecated) | `Server` | `X-Powered-By`

## CSP Template

```
default-src 'self'; script-src 'self' 'unsafe-inline' googletagmanager.com challenges.cloudflare.com *.posthog.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;
img-src 'self' data: images.unsplash.com images.pexels.com *.stripe.com;
connect-src 'self' google-analytics.com *.posthog.com *.sentry.io challenges.cloudflare.com;
frame-src youtube.com js.stripe.com challenges.cloudflare.com;
```

Prefer nonce-based or hash-based CSP with `strict-dynamic`. Test with `Content-Security-Policy-Report-Only` first.

## Patterns

Error envelope: `{ error: string, code?: string, details?: unknown }`
Zod: `Schema.safeParse(input)` → if !success return 400 with error.flatten()
Turnstile: `<div class="cf-turnstile" data-sitekey="${SITE_KEY}" data-theme="dark">` + server POST to siteverify
Stripe webhook: verify sig → deduplicate via KV (`webhook:${event.id}`) → process → set TTL 604800

## Stripe Webhook Events

`checkout.session.completed`→provision | `customer.subscription.created`→record | `customer.subscription.updated`→plan change | `customer.subscription.deleted`→revoke | `invoice.payment_succeeded`→confirm | `invoice.payment_failed`→dunning | `customer.subscription.trial_will_end`→notify

## Webhook Pattern

```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const event = stripe.webhooks.constructEvent(body, sig!, SECRET);
  if (await c.env.KV.get(`webhook:${event.id}`)) return c.json({ received: true });
  // Process...
  await c.env.KV.put(`webhook:${event.id}`, 'processed', { expirationTtl: 604800 });
  return c.json({ received: true });
});
```

## SEO (Every Page)

Keyphrase FIRST→title 50-60 chars→meta desc 120-156 chars→one H1→canonical | 4+ JSON-LD schemas | OG 1200x630 | 2+ internal links | 1+ outbound | keyphrase density 0.5-3%
Required schema types: Organization | WebSite | WebPage | SoftwareApplication | FAQPage | BreadcrumbList | Article | Product
JSON-LD boosts LLM accuracy 16%→54% (AI search visibility for ChatGPT/Perplexity/Google AI Overviews)

## Quality Bar

E2E 0 failures | WCAG 2.2 AA | Lighthouse a11y ≥95 perf ≥75 | CSP | Flesch ≥60 | Yoast GREEN | Images <200KB WebP | No placeholders | No dead forms | ADA compliance deadline: April 2026 (Title II) / 2027 (Title III small business)

## Playwright (v1.56+)

6 breakpoints: 375,390,768,1024,1280,1920 | axe-core 0 violations | No sleeps—waitFor/toBeVisible() | data-testid/role/text selectors | Stagehand AI fallback (AOM not DOM) | AI agents: Planner+Generator+Healer | parallel-safe+deterministic | PROD_URL env var

## Claude Code — Skills

Skill locations: managed > personal `~/.claude/skills/` > project `.claude/skills/` > plugin | Description auto-invocation truncated at 1536 chars | After compaction: most recent invocation re-attached up to 5000 tokens each, 25K budget total | Live change detection: file edits take effect in current session | `disable-model-invocation: true` = user-only, NOT in description context | Dynamic injection: `` !`command` `` syntax runs before skill loads

## Claude Code — Hooks

27 event types | 5 handler types: command/http/mcp_tool/prompt/agent | Exit 0=success | Exit 2=blocking error fed to Claude | Other non-zero=non-blocking | Hooks > CLAUDE.md (deterministic vs advisory) | `CLAUDE_ENV_FILE` available on SessionStart/CwdChanged/FileChanged only | asyncRewake: runs background, wakes Claude on exit 2

## Claude Code — Settings Precedence

Managed > CLI args > local project `.claude/settings.local.json` > shared project `.claude/settings.json` > user `~/.claude/settings.json` | Array values merge across scopes | Verify active: `/status`

## Claude Code — Memory

CLAUDE.md = your rules (loaded every session) | Auto memory `~/.claude/projects/<project>/memory/` = Claude's observations (first 200 lines/25KB of MEMORY.md) | Topic files loaded on demand | Auto Dream: converts relative dates, deletes contradicted facts | After `/compact`: project-root CLAUDE.md survives, nested CLAUDE.md files don't auto-reload | CLAUDE.md target: under 200 lines

## Claude Code — Agents

Subagent locations: managed > `--agents` CLI > `.claude/agents/` > `~/.claude/agents/` > plugin | @ mention invocation with typeahead | `isolation: worktree` auto-cleans if no changes | Agent teams (experimental): `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, 3-5 teammates, 5-6 tasks each | Model resolution: env `CLAUDE_CODE_SUBAGENT_MODEL` > invocation param > frontmatter > main model

## Prompt Cache Optimization

92% prefix reuse via deterministic order: Tools→System→CLAUDE.md→rules (alpha)→skill descriptions→MEMORY.md→conversation | Cache TTL: 5min (1.25x cost), 1hr (2x cost), reads 0.1x (90% savings) | Min cacheable: Opus 4.7/4.6/4.5 = 4096 tokens, Sonnet 4.6 = 2048 tokens | Workspace-level isolation since Feb 5 2026 | 2M token task: ~$1.15 vs $6.00 with good cache hits

## Domain Due Diligence

Payments: PCI (Stripe Checkout), tax, fees, refunds | Health: HIPAA, encryption | Education: COPPA/FERPA | PII: GDPR/CCPA, deletion endpoint | Marketplace: Stripe Connect, disputes | Nonprofit: 501c3, donation receipts

## Emergency

Site down→`wrangler deployments list`→rollback | D1 corrupt→export | Secret leaked→rotate `wrangler secret put` | CI stuck→`gh run cancel` | Cache poisoned→purge all

## Common Failures

`binding not found`→add to wrangler.toml | Turnstile invalid-input→check TURNSTILE_SECRET | ERR_BLOCKED_BY_CSP→add domain to CSP | Playwright flaky→replace sleep with waitFor | D1 "no such table"→`wrangler d1 migrations apply` | Angular SSR on Workers→use @angular/ssr CF adapter | Hono RPC type loss→use method chaining not separate controllers

## Linting

TypeScript/JS: ESLint flat config (`eslint.config.ts`) + typescript-eslint + angular-eslint + Prettier | Python: Ruff+mypy | Bash: ShellCheck+shfmt | YAML: yamllint | Docker: hadolint | GitHub Actions: actionlint | Plus: trailing-whitespace, end-of-file-fixer, detect-secrets, check-merge-conflict | `npx eslint . --max-warnings=0 && npx prettier --check .` in CI

## Git Convention

`type(scope): description` — Types: feat | fix | refactor | test | docs | style | perf | ci | chore
