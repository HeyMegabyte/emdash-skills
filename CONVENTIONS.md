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

CF Workers+Hono v4.12+ | Angular 21+Ionic 8+PrimeNG 21 | Capacitor 8 | D1/Neon | Drizzle v1 | Zod | Clerk Core 3 (SaaS)/Authentik (self-hosted) | Stripe (versioned releases: `2026-03-25.dahlia`) | Resend | Inngest v4 | Bun 1.3 | TS 5.9 | Playwright v1.59+ | Vitest | ESLint+Prettier | PostHog | Sentry | GA4/GTM

## Angular 21 Key Changes

Angular 21 (Nov 2025): Zoneless by default (CLI scaffolds without Zone.js, `provideZonelessChangeDetection()` no longer needed) | Vitest default test runner (replaces Karma/Jest) | Signal Forms experimental (signal-based reactive forms API) | Angular Aria library dev preview (8 patterns, 13 components, signals-based) | MCP server in CLI for AI-assisted dev
Angular 20 (May 2025): `effect()`+`linkedSignal`+`toSignal` stable | HttpResource | `@if`/`@for`/`@switch`/`@defer` control flow (deprecated v20, removed v22) | Incremental hydration stable | Host bindings type-checked
Standalone-only (no NgModules) | Signal stores per feature | providedIn:'root'

## TypeScript 5.9 (Q1 2026)

Stable TC39 Decorator Metadata | `strictInference` flag | 10-20% build perf gains | Conditional type narrowing improvements. TS 7.0 (mid-2026): Go-based compiler rewrite — track for breaking changes.

## Drizzle v1 Patterns

`sqliteTable` for D1 | plural snake_case tables (`users`, `blog_posts`) | `$inferSelect`/`$inferInsert` for types | `createInsertSchema`/`createSelectSchema` for Zod (now `drizzle-orm/zod` — no separate `drizzle-zod` package) | batch API (not `BEGIN` — D1 doesn't support transactions) | prepared statements for repeated queries | Node.js compat polyfill in wrangler.jsonc (`"compatibility_flags": ["nodejs_compat"]`)
v1 migration: `journal.json` removed, SQL files/snapshots grouped separately — run `drizzle-kit up` to migrate. `drizzle-kit drop` removed. RQBv2: relations defined in one place instead of per-table.

## CF Workers Limits (2026)

Free: 100K req/day, 10ms CPU | Paid: unlimited req, 30s CPU default / 5min max | Memory: 128MB/isolate | Worker size: 3MB free / 10MB paid | Subrequests: 50 free / 10K paid | Static assets: 20K free / 100K paid | WebSocket msg: 32MiB | D1 storage: 250GB→1TB (paid) | Cron: 5 free / 250 paid
D1 global read replication (beta): routes reads to nearest replica, 40-60% latency decrease
D1 jurisdiction: `--jurisdiction eu|fedramp` at creation for GDPR/FedRAMP compliance. Vectorize: 10M vectors/index, topK 50. Workflows: 25K step limit (was 1024), `pause()`/`resume()` in local dev.

## CF Containers (GA Apr 13 2026)

Full Linux containers co-located with Workers. Instance types: lite/basic/standard-1/standard-2. Billing: 25 GiB-hours + 375 vCPU-min + 200 GB-hours on Workers Paid ($5/mo). Active-only CPU billing. Use for: heavy background jobs, FFmpeg, headless Chrome, per-agent sandboxing. Sandbox SDK GA same day — isolated code execution with TypeScript API, live preview URLs, persistent interpreters.

## CF Agents SDK (Agents Week 2026)

AIChatAgent: streaming chat, auto persistence, resumable streams, tool support | MCPAgent: build MCP servers | Durable Objects: stateful micro-server with SQL DB, WebSockets, scheduling | Dynamic Workers (GA): V8 isolate sandboxing, 100x faster than containers, DO Facets with isolated SQLite | CF Sandboxes (GA): persistent agent environments with shell+filesystem+background processes, Outbound Workers for zero-trust egress | CF Mesh: private networking for users/nodes/agents/Workers | Flagship (GA): native feature flags sub-ms evaluation via KV+DOs | Agent Memory: managed persistent memory binding | Artifacts: git-compatible versioned storage | Workflows v2: 50K concurrency, 300/s creation rate | Browser Run: CDP access, human-in-the-loop, session recordings, 4x concurrency | CF AI Platform: unified inference binding for 14+ model providers | CF Email Service (beta): native send/receive/process binding | `cf` CLI: unified CLI across entire CF platform (replaces wrangler-only)

## Workers Builds (Native CI/CD)

Workers Builds = native CI/CD replacing GitHub Actions deploy steps. Connects to GitHub repo, auto-deploys on push, supports preview URLs per branch. Enable in CF dashboard → Workers → project → Settings → Git. `wrangler deploy` still preferred for Brian's direct deploys. Branch preview URLs: `<branch>.<worker>.workers.dev`. Build cache: Bun install cached between builds. Use GH Actions only for E2E tests + Lighthouse — not for deploy.

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

Cloudflare (OAuth) | CF Code Mode (2 tools: search+execute, ~1K tokens for entire CF API) | Playwright (stdio) | Sentry (HTTP/OAuth) | PostHog (SSE/OAuth) | Gmail/Calendar/Drive (OAuth) | Stripe (OAuth) | Slack (OAuth) | Canva (OAuth) | GitHub (HTTP) | Coolify (stdio) | Firecrawl (stdio) | n8n (stdio) | Home Assistant (stdio) | DeepSeek (stdio) | Postiz (HTTP) | Notion (stdio) | Supermemory (HTTP) | WordPress (stdio) | Plane (stdio) | Omi (Docker) | Context7 (stdio) | Sequential Thinking (stdio) | Computer Use (native)

## MCP Rate Limits

Stripe 25/sec | GitHub 5000/hr | Firecrawl 1/sec/domain | Postiz 100/day

## Media Generation

Logo: Ideogram v3 (`IDEOGRAM_API_KEY`) | Images: GPT Image 1.5 (`OPENAI_API_KEY`) | Video: Sora 2 (`scripts/sora.py`)
WebP photo 80% <200KB | WebP illustration 90% <150KB | PNG logo lossless <50KB | SVG optimized <10KB | MP4 hero CRF28 <2MB | OG 1200x630 PNG

## Analytics

GA4/GTM: `~/.config/emdash/gcp-service-account.json` | PostHog: posthog.megabyte.space | Sentry: sentry.megabyte.space

## Key Integrations

CF AI Search (namespace binding Apr 2026, per-tenant/per-agent RAG, runtime instance CRUD) | Stagehand v3 (direct CDP, 44% faster, CF Browser Run native) | CF Agents SDK | Inngest v4 (step.ai.infer, realtime, Standard Schema) | Mem0 (persistent AI memory) | Flagship (feature flags)

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
import { createFactory } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { cors } from 'hono/cors';
type Env = { DB: D1Database; KV: KVNamespace; AI: Ai; VECTORIZE: VectorizeIndex; AI_SEARCH: AiSearchNamespace; TURNSTILE_SECRET: string; SITE_NAME: string; SITE_DESCRIPTION: string; INNGEST_SIGNING_KEY: string; };
const app = new Hono<{ Bindings: Env }>();
app.use('*', secureHeaders());
app.use('/api/*', cors({ origin: ['https://domain.com'] }));
// Method chaining (preserves RPC type inference — never split into controllers)
app.get('/api/items', authMiddleware, handler).post('/api/items', authMiddleware, createHandler);
// Reusable middleware chains: const factory = createFactory<{ Bindings: Env }>(); const authChain = factory.createMiddleware(authMiddleware);
export default app;
```

## Hono Patterns

`createFactory<{ Bindings: Env }>()` for reusable typed middleware chains | Method chaining `app.use().get().post()` preserves RPC type inference — never separate controller files | `hc<AppType>(BASE_URL)` for typed client | `@hono/zod-validator` on all bodies | `app.onError()+app.notFound()` centralized | Split large apps: `app.route('/path', subApp)`
Error envelope: `{ error: string, code?: string, details?: unknown }` | Rate limit public endpoints: KV-based per-IP | Turnstile on all forms | `GET /health` returns `{status, version, timestamp}`

## Security Headers (OWASP Top 10:2025)

A01 Broken Access Control | A02 Security Misconfiguration | A03 Software Supply Chain Failures (NEW, was #9) | A04 Cryptographic Failures | A05 Injection | A06 Insecure Design | A07 Auth Failures | A08 Data Integrity Failures | A09 Logging Failures | A10 Mishandling Exceptional Conditions (NEW)

Must add: `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` | `X-Content-Type-Options: nosniff` | `X-Frame-Options: DENY` | `Referrer-Policy: strict-origin-when-cross-origin` | `Cross-Origin-Opener-Policy: same-origin` | `Cross-Origin-Embedder-Policy: require-corp` | `Cross-Origin-Resource-Policy: same-origin` | `Permissions-Policy: geolocation=(), camera=(), microphone=()` | `Content-Security-Policy: require-trusted-types-for 'script'` (Trusted Types cross-browser Feb 2026)
Must remove: `X-XSS-Protection` (CSP replaces it, creates vulns in old browsers) | `Expect-CT` (deprecated) | `Server` | `X-Powered-By`

OWASP Agentic Top 10 (2026): prompt injection|trust boundary failures|tool misuse|excessive permissions|insecure output handling|data poisoning|inadequate sandboxing|supply chain (MCP servers)|logging gaps|uncontrolled agent behavior. Relevant for any app calling LLM APIs.

## CSP Template

```
default-src 'self'; script-src 'self' 'nonce-{NONCE}' 'strict-dynamic' googletagmanager.com challenges.cloudflare.com *.posthog.com;
style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com;
img-src 'self' data: images.unsplash.com images.pexels.com *.stripe.com *.sentry.io;
connect-src 'self' google-analytics.com *.posthog.com *.sentry.io challenges.cloudflare.com *.inngest.com;
frame-src youtube.com js.stripe.com challenges.cloudflare.com;
report-uri /api/csp-report;
```

Prefer nonce-based strict CSP with `strict-dynamic`. Test with `Content-Security-Policy-Report-Only` first.

## Inngest v4 Patterns (BREAKING — Mar 16, 2026)

v3→v4 breaking: EventSchemas removed→`eventType()` per-event with Standard Schema (Zod/Valibot/ArkType) | serve options→client constructor | default mode→cloud (set `isDev:true` for local) | `step.invoke()` no longer accepts string IDs | CF Workers: `inngest/cloudflare` adapter + `inngest.setEnvVars(c.env)`
Setup: `app.on(['GET','PUT','POST'], '/api/inngest', (c) => { inngest.setEnvVars(c.env); return serve({ client: inngest, functions })(c.req.raw); })` | Step functions: `step.run('id', fn)` (each step idempotent, retried independently) | Delays: `step.sleep('id', '1 day')` | External triggers: `step.waitForEvent('id', { event: 'stripe/paid', timeout: '7d' })` | Fan-out: `step.sendEvent('id', items.map(...))` | Cron: `{ cron: '0 9 * * *' }` | Concurrency: `{ concurrency: { limit: 5 } }` | Retries: `{ retries: 3 }` default exponential backoff | Max duration: 2hr | Parallel step optimization + checkpointing default-on (~50% fewer HTTP requests)
New v4: `step.ai.infer('id', { model, body })` offloads inference to Inngest infra (zero compute during wait) | `step.realtime.publish(channel, data)` durable pub/sub | `useRealtime(channel)` React hook | Local dev: `npx inngest-cli dev` with `INNGEST_DEV=1`
Dedup: Inngest auto-deduplicates by event ID within 24h. Use D1 UNIQUE constraint for external side effects. `onFailure` callback → Sentry + Slack.

## Patterns

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

E2E 0 failures | WCAG 2.2 AA | Lighthouse a11y ≥95 perf ≥75 | CSP (Trusted Types cross-browser since Feb 2026 — add `require-trusted-types-for 'script'`) | Flesch ≥60 | Yoast GREEN | Images <200KB WebP | No placeholders | No dead forms | ADA Title II: April 24, 2026 (state/local gov 50K+ pop — EFFECTIVE NOW) / April 2028 (small/special districts). WCAG 2.1 AA mandatory | Chrome LNA (v142+): public sites accessing local network need `Access-Control-Allow-Private-Network` header

## Bun 1.3 Native Clients

`Bun.sql` — unified tagged template API: ``sql`SELECT * FROM users WHERE id = ${id}` ``. Supports PostgreSQL, MySQL/MariaDB, SQLite. Zero deps, auto SQL injection prevention. Replaces `pg`/`mysql2`/`better-sqlite3`.
`Bun.redis` — 7.9x faster than ioredis. 66 commands. Auto-reconnect, command timeouts, message queuing. Replaces `ioredis`/`redis` npm packages.
`Bun.s3` — built-in S3 client with backpressure handling. Replaces `@aws-sdk/client-s3`. Note: CF Workers use R2 binding directly, not S3 client.

## Clerk Core 3 (Mar 2026 — Breaking)

`@clerk/clerk-react` → `@clerk/react` | `@clerk/clerk-expo` → `@clerk/expo` | `<Protect>/<SignedIn>/<SignedOut>` → unified `<Show when="signed-in|signed-out" />` | `getToken()` now throws `ClerkOfflineError` (was null) | `@clerk/types` deprecated (import from SDK packages) | ~50KB gzipped bundle reduction | Upgrade: `npx @clerk/upgrade` codemod, requires Node 20.9+
**Clerk CLI** (Apr 22 2026): `clerk init` (framework detect + scaffold) | `clerk config` (auth settings) | `clerk api` (BAPI access) | `clerk deploy` coming
**API Keys GA** (Apr 17 2026): machine auth — users create delegated API keys for programmatic access. Billing active.
**SCIM/Directory Sync GA** (Apr 16 2026): auto user create/update/deactivate from IdP. Custom attribute mapping (beta) into `publicMetadata`. Role assignment from IdP groups. No extra charge with enterprise connection.

## Stripe (Versioned Releases)

Semiannual named releases ("Acacia"→"Dahlia") + monthly additive updates. Pin via `stripe-version` header. Agentic Commerce Suite: AI agents pay on behalf of users, Shared Payment Tokens (new auth surface to model). AI billing: markup % on token usage. Adaptive Pricing: local currency in 150+ countries. Decimal quantities on invoices.
**Billing Meter API v2** (GA): required for all metered prices, token/API-call billing, real-time streaming events. `POST /v1/billing/meters` + `POST /v1/billing/meter_events`.
**Entitlements API** (GA): Feature objects attached to Products, active entitlements returned on subscription. Check at API boundary: `GET /v1/entitlements/active_entitlements?customer={id}`. Use for plan-tier feature gating.
**Stripe Rate Limit binding**: CF Workers native, arbitrary identifiers (orgId/tenantId) for per-tenant rate limiting.

## Playwright (v1.59+)

6 breakpoints: 375,390,768,1024,1280,1920 | axe-core 0 violations | No sleeps—waitFor/toBeVisible() | data-testid/role/text selectors | Stagehand AI fallback (AOM not DOM) | AI agents: Planner+Generator+Healer | parallel-safe+deterministic | PROD_URL env var
v1.57: Chrome for Testing default (was Chromium) | `testConfig.webServer.wait` regex | v1.58: Timeline Speedboard, Cmd+F in UI mode/Trace Viewer | v1.59: `page.screencast` (video receipts, action annotations), `browser.bind` (MCP to live browser), Trace CLI for agent debugging | MCP server: 20+ tools (browser_click, browser_snapshot, etc.)
**Stagehand v3** (2026): removed Playwright dep, direct CDP, 44% faster on iframes/shadow DOM, `act/extract/observe/agent` primitives, element caching. CF Browser Run native: `@cloudflare/browser-run` + Stagehand.

## Claude Code — Skills

Skill locations: managed > personal `~/.claude/skills/` > project `.claude/skills/` > plugin | Description auto-invocation truncated at 1536 chars | After compaction: most recent invocation re-attached up to 5000 tokens each, 25K budget total | Live change detection: file edits take effect in current session | `disable-model-invocation: true` = user-only, NOT in description context | Dynamic injection: `` !`command` `` syntax runs before skill loads | Path-scoped rules: use `globs:` format (not `paths:` — known bugs), triggers on Read only not Write

## Claude Code — Hooks

28 event types | 5 handler types: command/http/mcp_tool/prompt/agent | Exit 0=success | Exit 2=blocking error fed to Claude | Other non-zero=non-blocking | Hooks > CLAUDE.md (deterministic vs advisory) | `CLAUDE_ENV_FILE` available on SessionStart/CwdChanged/FileChanged only | asyncRewake: runs background, wakes Claude on exit 2
Events (28): SessionStart|SessionEnd|InstructionsLoaded|UserPromptSubmit|UserPromptExpansion|PreToolUse|PostToolUse (includes `duration_ms`)|PostToolUseFailure|PostToolBatch|PermissionRequest|PermissionDenied (`retry:true` for alternate approach)|Stop|StopFailure|SubagentStart|SubagentStop|TaskCreated|TaskCompleted|CwdChanged|FileChanged|ConfigChange|PreCompact (can block)|PostCompact|Notification|TeammateIdle|WorktreeCreate|WorktreeRemove|Elicitation|ElicitationResult
`type: "mcp_tool"` chains MCP operations from hook handlers without Bash | Conditional `if` field: permission-rule syntax e.g. `"if": "Bash(git commit *)"` scopes handlers to specific commands | Plugin skills support frontmatter-defined hooks

## Claude Code — Settings Precedence

Managed > CLI args > local project `.claude/settings.local.json` > shared project `.claude/settings.json` > user `~/.claude/settings.json` | Array values merge across scopes | Verify active: `/status` | `$defaults` in autoMode: append custom allow/deny alongside built-ins instead of replacing | `sandbox.network.deniedDomains` for granular network blocking | `cleanupPeriodDays` sweeps tasks/snapshots/backups
New settings: `effortLevel` (low/medium/high/xhigh) | `attribution.commit`+`attribution.pr` (replaces deprecated `includeCoAuthoredBy`) | `worktree.symlinkDirectories`+`worktree.sparsePaths` | `viewMode` (default/verbose/focus) | `allowedMcpServers`/`deniedMcpServers` | `modelOverrides` (map model IDs to Bedrock ARNs/Vertex) | `availableModels` (restrict model picker) | `managed-settings.d/` drop-in directory for layered policy | `permissions.defaultMode: "auto"` now stable

## Claude Code — Memory

CLAUDE.md = your rules (loaded every session) | Auto memory `~/.claude/projects/<project>/memory/` = Claude's observations (first 200 lines/25KB of MEMORY.md) | Topic files loaded on demand | Auto Dream: converts relative dates, deletes contradicted facts | After `/compact`: project-root CLAUDE.md survives, nested CLAUDE.md files don't auto-reload | CLAUDE.md target: under 200 lines

## Claude Code — Agents

Subagent locations: managed > `--agents` CLI > `.claude/agents/` > `~/.claude/agents/` > plugin | Brian's custom agents: `~/.agentskills/agents/` (18 agents, referenced via `--agents` or symlinked) | @ mention invocation with typeahead | `isolation: worktree` auto-cleans if no changes | Agent teams (experimental): `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`, 3-5 teammates, 5-6 tasks each | Model resolution: env `CLAUDE_CODE_SUBAGENT_MODEL` > invocation param > frontmatter > main model | Agent frontmatter `mcpServers` loaded for main-thread agents via `--agent` | Agent `hooks:` fire in `--agent` mode | Forked subagents: `CLAUDE_CODE_FORK_SUBAGENT=1` for true process isolation
Built-in subagents: `Explore` (Haiku, read-only codebase exploration), `Plan` (read-only research+planning), `general-purpose` (full tools) | `initialPrompt` frontmatter: auto-submits first turn on spawn | Agent persistent memory: `~/.claude/agent-memory/` (opt-in per subagent) | `/agents` UI: Running tab (live view+stop) + Library tab (create, color, memory scope) | `Monitor` tool: streams background watcher events as live transcript messages (replaces Bash sleep loops) | Plugin `bin/` added to Bash PATH automatically

## Claude Code — Slash Commands

Built-in: /help, /clear, /compact, /status, /login, /logout, /config, /permissions, /sandbox, /hooks, /agents, /memory, /cost, /fast, /model, /plan, /bug, /vim | /ultrareview (deep multi-agent code review) | /ultraplan (comprehensive planning) | /tui (terminal UI mode) | /theme (custom themes, `~/.claude/themes/` JSON) | /loop (repeat prompt/command on interval) | /recap (conversation summary) | /focus (narrow context) | /less-permission-prompts (reduce confirmations) | /plugin (install/marketplace/tag) | /usage (merged cost+stats) | /doctor (config diagnostics, duplicate MCP detection) | /fork (branch conversation) | /export (save transcript) | /remote-control (claude.ai sync) | /team-onboarding (ramp-up guide from project context)

## Claude Code — Plugins

`/plugin` command (public beta). Structure: `.claude-plugin/plugin.json` + `commands/`|`agents/`|`skills/`|`hooks/`|`themes/`|`monitors/`|`.mcp.json`|`.lsp.json`|`bin/`|`settings.json`. Install: `/plugin marketplace add user/repo`. `claude plugin tag` creates release git tags. Marketplaces are git repos with `marketplace.json` — no centralized registry. `blockedMarketplaces`/`strictKnownMarketplaces` for policy. Plugin monitors: `monitors/monitors.json` auto-armed at session start. Plugin `bin/` added to Bash PATH automatically.

## Claude Code — Key Env Vars

`CLAUDE_CODE_EFFORT_LEVEL` (low/medium/high/max/auto) | `CLAUDE_CODE_MAX_TOOL_USE_CONCURRENCY` (default 10) | `CLAUDE_CODE_AUTO_COMPACT_WINDOW` | `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` | `CLAUDE_CODE_FORK_SUBAGENT` | `ENABLE_PROMPT_CACHING_1H` (2x cost) | `FORCE_PROMPT_CACHING_5M` (1.25x cost) | `CLAUDE_CODE_RESUME_THRESHOLD_MINUTES` | `CLAUDE_CODE_ENABLE_AWAY_SUMMARY` | `CLAUDE_CODE_COORDINATOR_MODE` | `TRACEPARENT` (W3C, injected into Bash subprocesses for distributed tracing)

## Claude Agent SDK

Renamed from "Claude Code SDK". Python: `SessionStore` protocol (5 methods), top-level `skills` option. TypeScript: `agentProgressSummaries` for periodic AI-generated subagent progress, `taskBudget` for token-paced tool use. Both: distributed tracing via `TRACEPARENT`/`TRACESTATE`, parallel MCP reconnection.
`POST /v1/agents` (create persistent agent), `POST /v1/sessions` (stateful conversations), `POST /v1/environments` (sandboxed execution). Agent Memory GA (Apr 23 2026): managed persistent memory across sessions. `ant` CLI (Apr 8 2026): `ant agent create`, `ant session run`.

## MCP Streamable HTTP

New default transport (spec 2025-03-26), replaces deprecated HTTP+SSE. Single endpoint, bidirectional, resumable streams, session management. All new MCP servers should use Streamable HTTP. Stdio still valid for local tools.

## Prompt Cache Optimization

92% prefix reuse via deterministic order: Tools→System→CLAUDE.md→rules (alpha)→skill descriptions→MEMORY.md→conversation | Cache TTL: 5min (1.25x cost), 1hr (2x cost), reads 0.1x (90% savings) | Min cacheable: Opus 4.7/4.6/4.5 = 4096 tokens, Sonnet 4.6 = 2048 tokens | Workspace-level isolation since Feb 5 2026 | 2M token task: ~$1.15 vs $6.00 with good cache hits

## Domain Due Diligence

Payments: PCI DSS v4.0 (mandatory Mar 2025 — script inventory 6.4.3, WAF mandatory, real-time tamper detection 11.6.1), tax, fees, refunds | Health: HIPAA, encryption, HHS May 2026 deadline | Education: COPPA/FERPA | PII: GDPR/CCPA 2026 (dark pattern rules codified, GPC signal mandatory in 12 US states), deletion endpoint | Marketplace: Stripe Connect, disputes | Nonprofit: 501c3, donation receipts | AI features: EU AI Act Art. 50 (Aug 2, 2026 — users must know they're talking to AI, GPAI labeling) | Supply chain: EU CRA SBOM requirement (Sept 2026 enforcement, 24hr vuln reporting)

## Emergency

Site down→`wrangler deployments list`→`wrangler rollback` | D1 corrupt→`wrangler d1 time-travel restore --database-id DB_ID --timestamp TIMESTAMP` (30-day PIT) | D1→R2 for long-term backup | Secret leaked→`wrangler secret put KEY` | CI stuck→`gh run cancel RUN_ID` | Cache poisoned→purge all

## Common Failures

`binding not found`→add to wrangler.toml/wrangler.jsonc | Turnstile invalid-input→check TURNSTILE_SECRET | ERR_BLOCKED_BY_CSP→add domain to CSP | Playwright flaky→replace sleep with waitFor | D1 "no such table"→`wrangler d1 migrations apply` | Angular SSR on Workers→use @angular/ssr CF adapter | Hono RPC type loss→use method chaining not separate controllers | CPU exceeded→split into ctx.waitUntil() | Memory exceeded→stream instead of buffer

## Linting

TypeScript/JS: ESLint flat config (`eslint.config.ts`) + typescript-eslint + angular-eslint + Prettier | Python: Ruff+mypy | Bash: ShellCheck+shfmt | YAML: yamllint | Docker: hadolint | GitHub Actions: actionlint | Plus: trailing-whitespace, end-of-file-fixer, detect-secrets, check-merge-conflict | `npx eslint . --max-warnings=0 && npx prettier --check .` in CI

## Git Convention

`type(scope): description` — Types: feat | fix | refactor | test | docs | style | perf | ci | chore
