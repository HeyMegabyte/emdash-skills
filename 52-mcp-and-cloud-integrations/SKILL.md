---
name: "MCP and Cloud Integrations"
description: "Connect all available MCP servers, cloud APIs, and SaaS integrations. Auto-discover secrets from shared pool, Coolify, and local configs. Integrate Slack, Discord, Twilio, Zapier, Cal.com, and all de-facto standard services. Promote aggressive use of AI APIs (OpenAI, Workers AI, Ideogram) and multimedia APIs for rich product experiences."
layer: "capability-pack"
canonical-owner-of:
  - "mcp-server-discovery"
  - "cloud-service-integration"
  - "ai-api-usage-strategy"
  - "cross-service-orchestration"
---

# MCP and Cloud Integrations

> Connect everything. Auto-discover secrets. Make every product feel like it's plugged into the entire internet.

---

## Core Philosophy

Every product should feel interconnected — not isolated. Users expect products to:
- Send notifications where they already are (Slack, Discord, email, push)
- Connect with tools they already use (Zapier, Cal.com, Google)
- Use AI to be smarter than static software
- Handle multimedia natively (images, video, audio)

**Aggressive integration creates perceived value that justifies premium pricing.**

---

## MCP Server Discovery

### Installed MCP Plugins (Found on System)
Located at `~/.claude/plugins/marketplaces/claude-plugins-official/external_plugins/`:

| Plugin | Type | Status |
|--------|------|--------|
| **playwright** | NPX (@playwright/mcp@latest) | Active |
| **github** | HTTP (api.githubcopilot.com/mcp) | Active |
| **linear** | HTTP (mcp.linear.app/mcp) | Available |
| **asana** | SSE (mcp.asana.com/sse) | Available |
| **terraform** | Docker (hashicorp/terraform-mcp-server) | Available |
| **firebase** | CLI | Available |
| **discord** | Bun-based | Available |
| **telegram** | Bun-based | Available |
| **gitlab** | Plugin | Available |
| **imessage** | Plugin | Available |

### Built-In MCP (Claude AI)
These are always available via claude.ai integration:
- **Cloudflare Developer Platform** — Workers, D1, R2, KV, DNS (2500+ endpoints)
- **Stripe** — Customers, subscriptions, invoices (needs auth)
- **Gmail** — Email (needs auth)
- **Google Calendar** — Scheduling (needs auth)
- **Google Drive** — Files (needs auth)
- **Canva** — Design (needs auth)

### Docker MCP Catalog
At `~/.config/docker/mcp/catalogs/docker-mcp.yaml`:
- AWS Core MCP Server available

### Scan Locations for MCP Configs
```
1. ~/.claude/settings.json              — Claude Code global MCP
2. ~/.claude/projects/*/settings.json   — Per-project MCP
3. ~/.claude/plugins/                   — Installed MCP plugins
4. ~/.config/docker/mcp/               — Docker MCP catalog
5. Project .mcp.json or .mcp/           — Local project MCP
```

### Available MCP Servers (Auto-Connect When Found)

| MCP Server | Purpose | Auto-Connect? |
|-----------|---------|--------------|
### Priority-Ranked MCP Servers (Source: MCP Research, April 2026)

| Priority | Server | Official? | Tools | Auto-Connect? | Cost |
|----------|--------|-----------|-------|--------------|------|
| 1 | **Cloudflare** | Official | Workers, D1, R2, KV, DNS (2500+ endpoints via 2 tools) | **Already connected** | Free |
| 2 | **Playwright** | Official | Browser automation, screenshots, testing | **Already connected** | Free |
| 3 | **Stripe** | Official | Customers, subscriptions, invoices, refunds | **Already connected** | Free |
| 4 | **GitHub** | Official | Repos, PRs, issues, Actions, code analysis | Yes — always | Free |
| 5 | **Neon Postgres** | Official | Projects, branches, SQL, migrations | Yes — when DB needed | Free tier |
| 6 | **Resend** | Official | Send emails, manage contacts, domains | Yes — always | Free (3K/mo) |
| 7 | **PostHog** | Official | Analytics, feature flags, experiments | Yes — always | Free (1M/mo) |
| 8 | **Sentry** | Official | Issues, events, stack traces, Seer AI | Yes — always | Free (5K/mo) |
| 9 | **Google Analytics** | Official | GA4 reports, properties, custom dimensions | Auto when GA4 set up | Free |
| 10 | **n8n** | Community | Build/deploy workflows, expose as tools | When automation needed | Free (self-hosted) |
| 11 | **Google (Gmail, Cal, Drive)** | Official | Email, scheduling, files | Ask first | Free |
| 12 | **Canva** | Official | Design generation | Ask first | Free tier |
| 13 | **Composio** | Third-party | 300+ connectors (HubSpot, Jira, Linear, etc.) | Ask first | Free tier |
| 14 | **Sentry MCP** | Official | Investigate errors, issues, events, stack traces from Claude | Yes — auto-connect | Free (5K/mo) |
| 15 | **Google Workspace MCP** | Community (taylorwilsdon/google_workspace_mcp) | Gmail, Calendar, Docs, Sheets — unified access | Yes — auto-connect | Free |

**Key insight:** Cloudflare MCP uses just 2 tools + < 1,000 tokens to access 2,500+ endpoints (Code Mode pattern). 81% less token usage than traditional MCP.

### MCP Config Patterns
```bash
# Add Neon Postgres MCP (branch-based migrations)
claude mcp add neon --transport http --url https://mcp.neon.tech

# Add Resend MCP (transactional email)
npx -y resend-mcp  # requires RESEND_API_KEY env var

# Add PostHog MCP (analytics queries)
claude mcp add posthog --transport http --url https://mcp.posthog.com

# Add Sentry MCP (error investigation)
claude mcp add sentry --transport http --url https://mcp.sentry.dev/mcp

# Add GitHub MCP (richer than gh CLI)
claude mcp add github --transport http --url https://api.githubcopilot.com/mcp

# Add Sentry MCP (investigate errors directly from Claude)
claude mcp add sentry --transport http --url https://mcp.sentry.dev/mcp

# Add Google Workspace MCP (Gmail, Calendar, Docs, Sheets)
claude mcp add google-workspace -- npx -y @taylorwilsdon/google_workspace_mcp
```

### Already Connected in This Environment

#### Built-In (Claude AI OAuth)
- `mcp__claude_ai_Cloudflare_Developer_Platform__*` — full CF management
- `mcp__claude_ai_Stripe__*` — payment management
- `mcp__claude_ai_Gmail__*` — email (needs auth)
- `mcp__claude_ai_Google_Calendar__*` — scheduling (needs auth)
- `mcp__claude_ai_Google_Drive__*` — files (needs auth)
- `mcp__claude_ai_Slack__*` — messaging (needs auth)
- `mcp__claude_ai_Canva__*` — design (needs auth)
- `mcp__claude_ai_IFTTT__*` — automation (needs auth)

#### Self-Hosted (in ~/.claude.json)
- `mcp__coolify__*` — Coolify container management (coolify.megabyte.space)
- `mcp__firecrawl__*` — Web scraping/RAG (firecrawl.megabyte.space)
- `mcp__postiz__*` — Social media automation (postiz.megabyte.space)
- `mcp__wordpress__*` — megabyte.space CMS management
- `mcp__home-assistant__*` — Smart home/IoT (connect.tomy.house)
- `mcp__deepseek__*` — AI model fallback
- `mcp__n8n__*` — Workflow automation (n8n.megabyte.space)
- `mcp__notion__*` — Knowledge base and docs
- `mcp__supermemory__*` — AI persistent memory
- `mcp__plane__*` — Project management (Megabyte Labs workspace)
- `mcp__omi__*` — Voice memories and transcription from Omi wearable

#### Developer Tools (in ~/.claude.json)
- `mcp__playwright__*` — Browser automation and testing
- `mcp__github-mcp__*` — GitHub repos, PRs, issues, Actions
- `mcp__sequential-thinking__*` — Complex reasoning chains
- `mcp__computer-use__*` — Desktop automation (native apps)
- `mcp__posthog__*` — Analytics and feature flags
- `mcp__sentry__*` — Error tracking and investigation

### MCP → Skill Mapping (Which MCP Enables Which Skill)

| MCP Server | Primary Skill | Secondary Skills |
|-----------|---------------|-----------------|
| Cloudflare | 08 Deploy | 05 Architecture, 44 Drizzle (D1), 26 API Pool |
| Playwright | 07 Quality | 20 Accessibility, 17 Competitive Analysis |
| Stripe | 18 Billing | 36 Onboarding, 45 Webhooks |
| GitHub | 35 CI/CD | 39 Changelog, 29 Docs Hygiene |
| Coolify | 50 Coolify | 40 Backup, 38 Health |
| Firecrawl | 17 Competitive | 37 Search (RAG), 28 SEO |
| Postiz | 27 Social | 34 Launch Day |
| n8n | 45 Webhooks | 49 Notifications |
| Gmail | 19 Email | 32 Contact Forms |
| WordPress | 33 Blog | 09 Brand/Content |
| Notion | 29 Docs | 04 Memory |
| Omi | 04 Memory | Context for all skills |
| Home Assistant | (IoT projects) | 15 Easter Eggs |
| Sentry | 13 Observability | 07 Quality |
| PostHog | 13 Observability | 36 Onboarding (feature flags) |
| Computer Use | 07 Quality | Desktop app testing |
| Plane | 03 Planning | 35 CI/CD |
| Supermemory | 04 Memory | 43 AI Chat |
| DeepSeek | 43 AI Chat | AI fallback for any skill |
| Sequential Thinking | 03 Planning | Complex architecture decisions |

---

## Secret Hygiene: MCP Inline Key Migration

12 MCP servers in `~/.claude.json` have secrets hardcoded inline instead of using `get-secret`.
These should be migrated to chezmoi encrypted secrets at:
`~/.local/share/chezmoi/home/.chezmoitemplates/secrets-macbook-pro/`

| MCP Server | Current (inline) | Target chezmoi key |
|-----------|------------------|-------------------|
| Coolify | `COOLIFY_ACCESS_TOKEN` | Already exists as file |
| Firecrawl | `FIRECRAWL_API_KEY` | Create `FIRECRAWL_API_KEY` |
| n8n | `N8N_API_KEY` | Create `N8N_API_KEY` |
| Home Assistant | `HA_TOKEN` | `HASS_TOKEN` (already in chezmoi) |
| DeepSeek | `DEEPSEEK_API_KEY` | Create `DEEPSEEK_API_KEY` |
| GitHub | `ghp_*` bearer | `GITHUB_TOKEN` (already in chezmoi) |
| Notion | `NOTION_TOKEN` | Create `NOTION_TOKEN` |
| Supermemory | Bearer token | Create `SUPERMEMORY_TOKEN` |
| WordPress | `WP_API_PASSWORD` | Create `WP_API_PASSWORD` |
| Plane | `PLANE_API_KEY` | Create `PLANE_API_KEY` |
| Omi | `OMI_MCP_KEY` | Create `OMI_MCP_KEY` |
| Postiz | URL-embedded key | `POSTIZ_MCP_URL` (already in chezmoi) |

**Migration pattern:** After creating chezmoi secrets, update `~/.claude.json` to use shell expansion or a wrapper script that calls `get-secret` at launch time.

**Never store secrets in:** memory markdown files, CLAUDE.md, skill files, git-tracked configs.

---

## Secrets Discovery Protocol (Central Repository)

### Discovery Order (check all, merge results)
```
1. Project .env.local                    → project-specific overrides
2. Project .env                          → project defaults
3. Shared pool: rare-chefs/.env.local    → master key collection
4. ~/.config/emdash/                     → stored tokens
   ├── coolify-token
   ├── gcp-service-account.json
   └── [other tokens]
5. Coolify API → service env vars        → self-hosted service keys
6. Claude MCP configs                    → pre-configured service auth
7. Prompt user (ONCE per key, then store)
```

### Auto-Discover from Coolify
```bash
# List all services and their env vars
COOLIFY_TOKEN=$(cat ~/.config/emdash/coolify-token 2>/dev/null)
if [ -n "$COOLIFY_TOKEN" ]; then
  curl -s "https://coolify.megabyte.space/api/v1/services" \
    -H "Authorization: Bearer $COOLIFY_TOKEN" | \
    jq '.[].name' # List available services
fi
```

### Key Categories (What to Look For)
| Category | Keys | Where Used |
|----------|------|-----------|
| **AI** | OPENAI_API_KEY, ANTHROPIC_API_KEY, IDEOGRAM_API_KEY | Image/video gen, chat, translation |
| **Cloud** | CLOUDFLARE_API_TOKEN, CF_ZONE_ID | Deploy, DNS, cache |
| **Payments** | STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET | Billing, donations |
| **Email** | RESEND_API_KEY | Transactional email |
| **Auth** | CLERK_SECRET_KEY | Authentication |
| **Analytics** | POSTHOG_API_KEY, SENTRY_DSN, GA4_MEASUREMENT_ID | Tracking |
| **Social** | POSTIZ_API_KEY | Social automation |
| **Stock Media** | PEXELS_API_KEY, UNSPLASH_ACCESS_KEY | Stock photos |
| **Communication** | SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL, TWILIO_AUTH_TOKEN | Notifications |
| **Automation** | ZAPIER_WEBHOOK_URL, N8N_API_KEY | Workflow automation |
| **Self-Hosted** | COOLIFY_API_TOKEN, SEARXNG_URL, FIRECRAWL_API_KEY | Self-hosted services |

---

## De-Facto Standard Integrations

### Tier 1: Include in Every Product

#### Slack Notifications (Deploy + Alerts)
```typescript
// Send deploy notification to Slack
async function notifySlack(env: Env, message: string) {
  if (!env.SLACK_WEBHOOK_URL) return;
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: message,
      blocks: [{
        type: 'section',
        text: { type: 'mrkdwn', text: message }
      }]
    }),
  });
}

// Usage: after deploy
await notifySlack(env, `🚀 *${domain}* deployed successfully\n<https://${domain}|View live>`);
// Usage: on error
await notifySlack(env, `🔴 Error on *${domain}*: ${error.message}`);
```

#### Discord Webhooks (Community Updates)
```typescript
async function notifyDiscord(env: Env, title: string, description: string) {
  if (!env.DISCORD_WEBHOOK_URL) return;
  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title,
        description,
        color: 0x00E5FF, // Brand cyan
        timestamp: new Date().toISOString(),
      }]
    }),
  });
}
```

### Tier 2: Include When Product Benefits

#### Twilio (SMS Notifications)
For products with phone-based features (call.megabyte.space pattern):
```typescript
async function sendSMS(env: Env, to: string, body: string) {
  const auth = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `To=${to}&From=${env.TWILIO_PHONE}&Body=${encodeURIComponent(body)}`,
  });
}
```

#### Zapier Webhooks (Connect to 5000+ Apps)
```typescript
// Outbound: trigger Zapier workflow on key events
async function triggerZapier(env: Env, event: string, data: Record<string, unknown>) {
  if (!env.ZAPIER_WEBHOOK_URL) return;
  await fetch(env.ZAPIER_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, ...data, timestamp: new Date().toISOString() }),
  });
}

// Trigger on: new donation, new signup, new testimonial, deploy complete
```

#### Cal.com / Calendly (Scheduling)
```html
<!-- Embed scheduling widget -->
<script src="https://cal.com/embed.js"></script>
<button data-cal-link="brian/30min" data-cal-config='{"theme":"dark"}'>
  Schedule a Call
</button>
```

---

## Aggressive AI API Usage

### What to Auto-Generate with AI (Cost-Effective)

| Asset | API | Cost | When |
|-------|-----|------|------|
| Hero image | GPT Image 1.5 | ~$0.04 | Every new project |
| Logo | Ideogram v3 | ~$0.03 | Every new project |
| OG images (per page) | GPT Image 1.5 | ~$0.04/page | Every page |
| Hero video (4s loop) | Sora 2 | ~$0.10 | When product benefits |
| Alt text | Workers AI (free) | $0 | Every image |
| Translations | Workers AI (free) | $0 | Every project (EN+ES) |
| Meta descriptions | Claude (included) | $0 | Every page |
| Blog seed posts | Claude (included) | $0 | Every project with blog |
| Search index embeddings | Workers AI (free) | $0 | Sites with 5+ pages |
| Content summaries | Workers AI (free) | $0 | Blog posts, long pages |
| Keyword research | Google Autocomplete | $0 | Every project |
| Competitive screenshots | Playwright | $0 | Every new product |

### AI as Product Feature (for projectsites.dev brand)
- **AI-powered site builder** — the core product
- **AI chat support** — Workers AI RAG on site content (skill 43)
- **AI image generation** — built into the editor
- **AI translation** — one-click multi-language
- **AI SEO** — auto-optimize titles, descriptions, keywords
- **AI accessibility** — auto-fix common a11y issues

---

## Multimedia API Strategy

### Images: Multi-Source Pipeline (skill 12)
```
Ideogram v3 (logos) → GPT Image 1.5 (scenes) → Pexels (stock) → Unsplash (fallback)
```

### Video: Sora 2 for Key Assets
- Hero background loops (4s, muted, autoplay)
- Product demo intros
- Social media clips

### Audio (When Applicable)
- Twilio for voice (call.megabyte.space)
- Deepgram for speech-to-text
- ElevenLabs for text-to-speech (if budget allows)

---

## projectsites.dev Brand Integration

Every product built by this system is a projectsites.dev showcase:

### Footer Attribution
```html
<footer>
  <p>Built with <a href="https://projectsites.dev">projectsites.dev</a></p>
</footer>
```

### "Built With" Badge (Optional)
```html
<a href="https://projectsites.dev">
  <img src="https://img.shields.io/badge/Built%20with-projectsites.dev-00E5FF?style=for-the-badge" alt="Built with projectsites.dev">
</a>
```

### Quality as Brand Strategy
Every site we ship IS the marketing for projectsites.dev. If it's beautiful, fast, accessible, and well-instrumented — that's the best ad. If it's ugly or broken — that's anti-marketing.

**The product IS the pitch.**

---

## Casual Key Prompt (When Missing)

When a key is needed but not found:
```
Hey — I need a [SERVICE] API key for this project. Quick options:

1. [SERVICE] — [free tier info] — [signup URL]
2. Or I can skip this and use [fallback]

Which do you prefer? (I'll store the key so you only enter it once)
```

Never block on a missing key. Always have a fallback. Always be casual.

---

## What This Skill Owns
- MCP server discovery and connection
- Secrets discovery across all sources
- Cloud service API integration patterns
- AI API usage strategy
- Multimedia API orchestration
- Slack/Discord/Twilio notification patterns
- Zapier/n8n automation hooks
- projectsites.dev brand integration

## What This Skill Must Never Own
- Specific service implementations (→ individual skills)
- Payment processing (→ 18)
- Email sending (→ 19)
- Deployment (→ 08)
