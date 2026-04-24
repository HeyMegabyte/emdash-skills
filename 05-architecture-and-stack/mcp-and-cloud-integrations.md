---
name: "MCP and Cloud Integrations"
description: "Connect all available MCP servers, cloud APIs, and SaaS integrations. Auto-discover secrets from shared pool, Coolify, and local configs. Integrate Slack, Discord, Twilio, Zapier, Cal.com, and all de-facto standard services. Promote aggressive use of AI APIs (OpenAI, Workers AI, Ideogram) and multimedia APIs for rich product experiences."
updated: "2026-04-23"
---

# MCP and Cloud Integrations

## MCP Server Discovery

### Scan Locations
1. `~/.claude/settings.json` — global MCP
2. `~/.claude/projects/*/settings.json` — per-project
3. `~/.claude/plugins/` — installed plugins
4. `~/.config/docker/mcp/` — Docker catalog
5. Project `.mcp.json` or `.mcp/` — local project

### Priority-Ranked Servers
| # | Server | Tools | Status | Cost |
|---|--------|-------|--------|------|
| 1 | Cloudflare | Workers, D1, R2, KV, DNS (2500+ endpoints via 2 tools) | Connected | Free |
| 2 | Playwright | Browser automation, screenshots | Connected | Free |
| 3 | Stripe | Customers, subscriptions, invoices | Connected | Free |
| 4 | GitHub | Repos, PRs, issues, Actions | Auto | Free |
| 5 | Neon Postgres | Projects, branches, SQL | When DB needed | Free tier |
| 6 | Resend | Send emails, contacts, domains | Auto | Free (3K/mo) |
| 7 | PostHog | Analytics, feature flags | Auto | Free (1M/mo) |
| 8 | Sentry | Issues, events, stack traces | Auto | Free (5K/mo) |
| 9 | Google Analytics | GA4 reports, dimensions | When GA4 set up | Free |
| 10 | n8n | Workflows, expose as tools | When automation needed | Free (self-hosted) |
| 11 | Google (Gmail, Cal, Drive) | Email, scheduling, files | Ask first | Free |
| 12 | Composio | 300+ connectors | Ask first | Free tier |

**Key insight:** Cloudflare MCP uses 2 tools + <1K tokens for 2,500+ endpoints (Code Mode).

### MCP Config Commands
```bash
claude mcp add neon --transport http --url https://mcp.neon.tech
claude mcp add posthog --transport http --url https://mcp.posthog.com
claude mcp add sentry --transport http --url https://mcp.sentry.dev/mcp
claude mcp add github --transport http --url https://api.githubcopilot.com/mcp
claude mcp add google-workspace -- npx -y @taylorwilsdon/google_workspace_mcp
```

### Connected in This Environment

**Built-In (Claude AI OAuth):** Cloudflare, Stripe, Gmail, Google Calendar, Google Drive, Slack, Canva, IFTTT
**Self-Hosted:** Coolify, Firecrawl, Postiz, WordPress, Home Assistant, DeepSeek, n8n, Notion, Supermemory, Plane, Omi
**Developer Tools:** Playwright, GitHub, Sequential Thinking, Computer Use, PostHog, Sentry
**Resend MCP (Apr 7, 2026):** Official MCP server with HTTP transport. `claude mcp add resend --transport http --url https://mcp.resend.com`. Tools: send_email, list_emails, create_contact, list_contacts, list_domains. Use for: transactional email automation, contact management, domain verification — all from Claude Code.

### MCP -> Skill Mapping
Cloudflare→08-deploy, Playwright→07-quality, Stripe→13/stripe-billing, GitHub→08/ci-cd-pipeline, Coolify→05/mcp-and-cloud-integrations, Firecrawl→03/competitive-analysis, Postiz→09/social-automation, n8n→06/webhook-system, Gmail→09/email-templates, WordPress→06/blog-and-content-engine, Notion→09/documentation-and-codebase-hygiene, Sentry→13-observability, PostHog→13-observability, Computer Use→07-quality, Plane→03-planning

## Secret Hygiene

12 MCP servers have inline secrets. Migrate to chezmoi at `~/.local/share/chezmoi/home/.chezmoitemplates/secrets-macbook-pro/`. Never store secrets in markdown, CLAUDE.md, skill files, or git-tracked configs.

## Secrets Discovery (check all, merge)
```
1. Project .env.local -> 2. Project .env -> 3. rare-chefs/.env.local (master)
4. ~/.config/emdash/ (stored tokens) -> 5. Coolify API -> 6. Claude MCP configs
7. Prompt user (ONCE per key, then store)
```

### Key Categories
| Category | Keys |
|----------|------|
| AI | OPENAI_API_KEY, ANTHROPIC_API_KEY, IDEOGRAM_API_KEY |
| Cloud | CLOUDFLARE_API_TOKEN, CF_ZONE_ID |
| Payments | STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET |
| Email | RESEND_API_KEY |
| Auth | CLERK_SECRET_KEY |
| Analytics | POSTHOG_API_KEY, SENTRY_DSN, GA4_MEASUREMENT_ID |
| Communication | SLACK_WEBHOOK_URL, DISCORD_WEBHOOK_URL, TWILIO_AUTH_TOKEN |
| Automation | ZAPIER_WEBHOOK_URL, N8N_API_KEY |
| Self-Hosted | COOLIFY_API_TOKEN, SEARXNG_URL, FIRECRAWL_API_KEY |

## Standard Integrations

### Tier 1 (Every Product)

**Slack Notifications:**
```typescript
async function notifySlack(env: Env, message: string) {
  if (!env.SLACK_WEBHOOK_URL) return;
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  });
}
```

**Discord Webhooks:** Same pattern with `embeds: [{ title, description, color: 0x00E5FF }]`

### Tier 2 (When Beneficial)
- **Twilio:** SMS via REST API for phone-based features
- **Zapier:** Trigger workflows on key events (new donation, signup, deploy)
- **Cal.com:** `<button data-cal-link="brian/30min" data-cal-config='{"theme":"dark"}'>Schedule a Call</button>`

## AI API Usage Strategy

| Asset | API | Cost |
|-------|-----|------|
| Hero image | GPT Image 1.5 | ~$0.04 |
| Logo | Ideogram v3 | ~$0.03 |
| OG images | GPT Image 1.5 | ~$0.04/page |
| Hero video (4s) | Sora 2 | ~$0.10 |
| Alt text, translations, meta, blog, embeddings | Workers AI | $0 (free) |
| Keyword research | Google Autocomplete | $0 |

## projectsites.dev Attribution
```html
<footer><p>Built with <a href="https://projectsites.dev">projectsites.dev</a></p></footer>
```
Every site shipped IS the marketing. Quality = best ad.

## Missing Key Prompt
Never block on missing key. Always have fallback. Be casual:
```
Hey — I need a [SERVICE] key. Options:
1. [SERVICE] — [free tier] — [URL]
2. Skip and use [fallback]
(I'll store so you only enter once)
```

## Ownership
**Owns:** MCP discovery/connection, secrets discovery, cloud API patterns, AI API strategy, notification patterns, automation hooks, projectsites.dev branding.
**Never owns:** Specific implementations (→individual skills), payments (→13/stripe-billing), email (→09/email-templates), deployment (→08-deploy).
