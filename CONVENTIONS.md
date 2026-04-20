# Conventions

Shared constants and patterns. Reference this instead of re-deriving values.

## Brand Tokens

| Token | Value |
|-------|-------|
| Black | #060610 |
| Cyan | #00E5FF |
| Blue | #50AAE3 |
| Purple (tertiary) | #7C3AED (cosmic/space imagery) |
| Font heading | Sora |
| Font body | Space Grotesk |
| Font mono | JetBrains Mono |
| Handle | HeyMegabyte (all platforms) |
| Email | hey@megabyte.space |
| GitHub (products) | HeyMegabyte |
| GitHub (infra) | ProfessorManhattan |

## Design Principles

- Dark theme FIRST, always
- "Simpler is better" — when in doubt, simplify
- Purple tertiary for cosmic/space imagery only

## Owned Domains

megabyte.space, projectsites.dev, fundl.ink, gitl.ink, deskl.ink, linkbl.ink, thebestsites.com, install.doctor, claimyour.site, item.link, socia.link, onionl.ink, all-hands.dev, dreame.dev, soupl.ink, grantl.ink

## Runtime & UI Selection

| Need | Choice |
|------|--------|
| JS Runtime | Bun preferred; Node.js for legacy/incompatible |
| Angular UI | PrimeNG components |
| Mobile | Ionic + Capacitor (hybrid) |
| Auth (SaaS) | Clerk |
| Auth (self-hosted) | Authentik |
| Auth UX | Google Sign-In + magic email link |

## Pricing Defaults

| Type | Tiers |
|------|-------|
| SaaS | Free tier + $50/month Pro |
| Nonprofits | Donation presets: $10/$25/$50/$100/$250/$500 |

No custom pricing without explicit user request.

## Bash Conventions

- Functions: `camelCase` (createUser, mountJuiceFS)
- Variables: `UPPER_CASE` (BACKUP_DIR, S3_BUCKET)
- Logging: `gum log -sl info "msg"`, `gum log -sl warn "msg"`, `gum log -sl error "msg"` (NEVER echo)
- Docs: shdoc format (@file, @brief, @description) at top of scripts
- Linting: ShellCheck + shfmt mandatory
- Cross-platform: macOS + Linux (all distributions)
- Error handling: error-resistant, skip unavailable, never completely error out

## Deploy Command

```bash
npx wrangler deploy
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'
```

## Secret Access

```bash
get-secret SECRET_NAME          # Primary (chezmoi, 182 encrypted secrets)
# Central: /Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local
#   └── 50+ keys: AI APIs, media APIs, MCP server tokens, self-hosted URLs
# Config: ~/.config/emdash/ (coolify-token, gcp-service-account.json)
```

**All MCP secrets are consolidated in `.env.local`** — read with `grep KEY_NAME .env.local`.
`get-secret` checks env vars first, then chezmoi. Load `.env.local` to make both paths work.

## Infrastructure

| Layer | Tool |
|-------|------|
| Hypervisor | Proxmox with ZFS storage |
| Firewall | OPNsense (virtualized) |
| Public exposure | Cloudflare Tunnels |
| VPN | WireGuard + Mullvad |
| Mesh network | Headscale |
| Backup | Proxmox Backup Server → R2 + Wasabi sync |

## Self-Hosted Services (70+ on Coolify/Proxmox)

| Service | URL | Purpose | Mentions |
|---------|-----|---------|----------|
| Coolify | coolify.megabyte.space | Docker orchestrator (THE hub) | 136 |
| Authentik | authentik.megabyte.space | SSO identity provider | 64 |
| Healthchecks | healthchecks.megabyte.space | Uptime/cron monitoring | 41 |
| Open WebUI | openwebui.megabyte.space | AI chat interface | 38 |
| Bolt.diy | bolt.megabyte.space | AI website builder | 35 |
| Dify | dify.megabyte.space | AI application builder | 32 |
| Postiz | postiz.megabyte.space | Social media scheduling | 32 |
| n8n | n8n.megabyte.space | Workflow automation | 27 |
| NocoDB | nocodb.megabyte.space | Database UI | 25 |
| Home Assistant | (internal) | Smart home | 25 |
| Windmill | windmill.megabyte.space | Developer automation | 24 |
| Chatwoot | chatwoot.megabyte.space | Customer support chat | 18 |
| Sentry | sentry.megabyte.space | Error tracking | 17 |
| Netdata | netdata.megabyte.space | Server monitoring | 17 |
| Firecrawl | firecrawl.megabyte.space | Web scraping | 17 |
| Listmonk | listmonk.megabyte.space | Newsletter/email marketing | 15 |
| Dozzle | dozzle.megabyte.space | Container log viewer | 11 |
| PostHog | posthog.megabyte.space | Product analytics | 10 |
| Browserless | browserless.megabyte.space | Headless browser | 9 |
| SFTPGo | sftpgo.megabyte.space | SFTP on ZFS | 8 |
| Grafana | grafana.megabyte.space | Metrics dashboards | 6 |
| LiteLLM | ai.megabyte.space | AI gateway | 4 |
| SearXNG | searxng.megabyte.space | Self-hosted search | 3 |
| Backrest | backrest.megabyte.space | Restic backup management | - |
| Code Server | code.megabyte.space | Cloud VS Code | - |
| Directus | directus.megabyte.space | Headless CMS | - |
| Langflow | langflow.megabyte.space | AI orchestration | - |
| MetaMCP | metamcp.megabyte.space | MCP aggregation | - |
| Plane | plane.megabyte.space | Project management | - |
| Paymenter | pay.megabyte.space | Hosting billing | - |

## MCP Servers (All Configured in ~/.claude.json)

| Server | Type | Enables Skills | Secret Source |
|--------|------|----------------|---------------|
| Cloudflare | OAuth | 05 Arch, 08 Deploy, 44 Drizzle | OAuth (connected) |
| Playwright | stdio | 07 Quality, 20 A11y | None needed |
| Sentry | HTTP | 13 Observability | OAuth (one-time) |
| PostHog | SSE | 13 Observability | OAuth (one-time) |
| Gmail | OAuth | 19 Email | OAuth (one-time) |
| Google Calendar | OAuth | Scheduling | OAuth (one-time) |
| Google Drive | OAuth | Media, docs | OAuth (one-time) |
| Stripe | OAuth | 18 Stripe | OAuth (one-time) |
| Canva | OAuth | 12 Media | OAuth (one-time) |
| GitHub | HTTP | CI/CD, PRs | `ghp_*` in .claude.json |
| Coolify | stdio | 50 Coolify | `COOLIFY_ACCESS_TOKEN` |
| Firecrawl | stdio | RAG, scraping | `FIRECRAWL_API_KEY` |
| n8n | stdio | 45 Webhooks, automation | `N8N_API_KEY` |
| Home Assistant | stdio | IoT, smart home | `HASS_TOKEN` (chezmoi) |
| DeepSeek | stdio | AI fallback | `DEEPSEEK_API_KEY` |
| Postiz | HTTP | 27 Social | `POSTIZ_MCP_URL` (chezmoi) |
| Notion | stdio | Docs, knowledge base | `NOTION_TOKEN` |
| Supermemory | HTTP | AI memory | Bearer token |
| WordPress | stdio | megabyte.space CMS | `WP_API_PASSWORD` |
| Plane | stdio | Project management | `PLANE_API_KEY` |
| Omi | stdio (Docker) | Memory, transcription | `OMI_MCP_KEY` |
| Sequential Thinking | stdio | Complex reasoning | None needed |
| Computer Use | native | Desktop automation | Permission-gated |

## Key Integrations for projectsites.dev

| Tool | Purpose | Integration |
|------|---------|-------------|
| CF AI Search | RAG search per tenant | Shared instance + metadata filtering |
| Stagehand (22K) | AI browser testing | Augments Playwright with natural language |
| CF Agents SDK | Multi-agent on Workers | Think class on Durable Objects |
| Inngest (5K) | Step functions for Workers | Workflow orchestration |
| Mem0 (54K) | Persistent AI memory | Context across chat sessions |

## Error Envelope

```typescript
{ error: string, code?: string, details?: unknown }
```

## Zod Validation Pattern

```typescript
const Schema = z.object({ /* fields */ });
const result = Schema.safeParse(input);
if (!result.success) return c.json({ error: result.error.flatten() }, 400);
```

## Turnstile Pattern

```html
<div class="cf-turnstile" data-sitekey="${SITE_KEY}" data-theme="dark"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```
Server verify: POST `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret` + `response`.

## CSP Header Template

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com https://*.posthog.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https://images.unsplash.com https://images.pexels.com https://*.stripe.com;
connect-src 'self' https://www.google-analytics.com https://*.posthog.com https://*.sentry.io https://challenges.cloudflare.com;
frame-src https://www.youtube.com https://js.stripe.com https://challenges.cloudflare.com;
```

## Image Compression Targets

| Format | Quality | Max Size |
|--------|---------|----------|
| WebP photo | 80% | 200KB |
| WebP illustration | 90% | 150KB |
| PNG logo/icon | Lossless | 50KB |
| SVG | Optimized | 10KB |
| MP4 hero | CRF 28 | 2MB |
| OG image | 1200x630 | PNG |

## Linting and Formatting

Use **Biome** (Rust-based) instead of ESLint + Prettier. Auto-runs via PostToolUse hook.
```bash
npx @biomejs/biome check --write src/  # Manual run
```

## Cloudflare Credentials

Account: blzalewski@gmail.com | API Token: `get-secret CLOUDFLARE_API_TOKEN` | Account ID: `get-secret CLOUDFLARE_ACCOUNT_ID`

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

## Common Failure Patterns

| Error | Cause | Fix |
|-------|-------|-----|
| "binding not found" on deploy | Missing binding in wrangler.toml | Add `[[d1_databases]]` or `[kv_namespaces]` |
| Turnstile "invalid-input-response" | Wrong secret or not awaited | Check `TURNSTILE_SECRET` in wrangler secrets |
| `ERR_BLOCKED_BY_CSP` | CSP too restrictive | Add domain to relevant CSP directive |
| Playwright flaky | Missing `waitFor` | Replace `sleep` with `expect().toBeVisible()` |
| D1 "no such table" | Migration not applied | `wrangler d1 migrations apply DB_NAME` |
| Angular build fails on deploy | SSR incompatible with Workers | Use `@angular/ssr` with Cloudflare adapter |

## Webhook Reliability Pattern

```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature');
  const event = stripe.webhooks.constructEvent(body, sig!, WEBHOOK_SECRET);
  const existing = await c.env.KV.get(`webhook:${event.id}`);
  if (existing) return c.json({ received: true });
  // Process event...
  await c.env.KV.put(`webhook:${event.id}`, 'processed', { expirationTtl: 86400 * 7 });
  return c.json({ received: true });
});
```

## Git Commit Convention

```
type(scope): description
Types: feat, fix, refactor, test, docs, style, perf, ci, chore
```
