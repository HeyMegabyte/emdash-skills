---
name: "Shared API Pool"
description: "Centralized API key pool shared across all Emdash projects. Every project automatically integrates with PostHog, Sentry, Postiz, and all available services. Keys stored in one location, discovered automatically. Includes self-hosted services on Proxmox/Coolify: Sentry, PostHog, Postiz, Home Assistant, SearXNG, FireCrawl, n8n, Authentik."---

# Shared API Key Pool

## Rule
ALL Emdash projects share a common pool of API keys. When building any
project, automatically integrate with every service that has a key available.

## Secret Discovery (3 Sources, Checked in Priority Order)

### 1. Chezmoi Encrypted Store (181 secrets) — PRIMARY
```bash
# Decrypt any secret by name
get-secret SECRET_NAME
# Example: get-secret SLACK_WEBHOOK_URL
```
Location: `~/.local/share/chezmoi/home/.chezmoitemplates/secrets/`

### 2. Shared .env.local (media + maps keys)
`/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`

### 3. Emdash Config (tokens + GCP)
`~/.config/emdash/` — coolify-token, gcp-service-account.json

### Discovery Script
```bash
# Run full discovery
~/.agentskills/scripts/discover-secrets.sh

# Check if a specific key exists
~/.agentskills/scripts/discover-secrets.sh --check SLACK_WEBHOOK_URL
```

## Available Keys (Verified Decryptable — 50+)

### AI APIs (9 keys)
OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, DEEPGRAM_API_KEY,
ELEVENLABS_API_KEY, REPLICATE_API_KEY, MISTRAL_API_KEY, CEREBRAS_API_KEY, BASETEN_API_KEY

### Communication (12 keys)
SLACK_WEBHOOK_URL, SLACK_API_TOKEN, SLACK_BOT_USER_OAUTH_TOKEN, SLACK_CLIENT_ID/SECRET,
DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID/SECRET,
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER,
TELEGRAM_BOT_TOKEN

### Cloud (12 keys)
CLOUDFLARE_API_TOKEN, CLOUDFLARE_API_KEY, CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_EMAIL,
CLOUDFLARE_R2_* (ID, SECRET, TOKEN — main + user), CLOUDFLARE_TEAMS_*, CLOUDFLARE_SSH_API_TOKEN

### Media (6 keys)
PEXELS_API_KEY, UNSPLASH_ACCESS_KEY, PIXABAY_API_KEY,
IDEOGRAM_API_KEY, RUNWAY_API_KEY, REPLICATE_API_TOKEN

### Social (10+ keys)
POSTIZ_API_KEY, POSTIZ_MCP_URL,
TWITTER_* (API_KEY, SECRET, ACCESS_TOKEN, BEARER_TOKEN, OAUTH_*),
FACEBOOK_OAUTH_*, REDDIT_*, PINTEREST_OAUTH_*, YOUTUBE_OAUTH_*

### Dev/Email (8 keys)
GITHUB_TOKEN, GITHUB_GIST_TOKEN, GITHUB_READ_TOKEN,
RESEND_API_KEY, SENDGRID_API_KEY, NPM_TOKEN, DOCKERHUB_TOKEN

### Search (3 keys)
GOOGLE_SEARCH_API_KEY, SERP_API_KEY, TAVILY_API_KEY

### Stripe (in fancy-dolls .env — project-specific)
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET (4 webhooks)

### Coolify
~/.config/emdash/coolify-token

### GCP
~/.config/emdash/gcp-service-account.json (GA4/GTM automation)

## Self-Hosted Services (Proxmox/Coolify)
| Service | URL | Purpose |
|---------|-----|---------|
| Sentry | sentry.megabyte.space | Error tracking (self-hosted) |
| PostHog | posthog.megabyte.space | Analytics (self-hosted) |
| Postiz | postiz.megabyte.space | Social media scheduling |
| Home Assistant | connect.tomy.house | Home automation |
| SearXNG | searxng.megabyte.space | Self-hosted search |
| FireCrawl | firecrawl.megabyte.space | Web scraping |
| Browserless | browserless.megabyte.space | Headless Chrome |
| n8n | n8n.megabyte.space | Workflow automation |
| Authentik | authentik.megabyte.space | SSO/identity |
| Coolify | coolify.megabyte.space | PaaS (token: ~/.config/emdash/coolify-token) |

## Integration Protocol
For EVERY new project:
1. Scan the key pool for available keys
2. Create project-specific instances where needed (PostHog project, Sentry project)
3. Inject keys as Cloudflare Worker secrets
4. Configure client-side snippets (PostHog JS, Sentry JS)
5. Set up server-side reporting (structured logs → Sentry, events → PostHog)

## PostHog Integration (MANDATORY for all projects)
```javascript
// Client-side
posthog.init('PROJECT_KEY', {
  api_host: 'https://posthog.megabyte.space',
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: true,
});
```
Create a new PostHog project per domain via API:
```bash
curl -X POST "https://posthog.megabyte.space/api/projects/" \
  -H "Authorization: Bearer POSTHOG_API_KEY" \
  -d '{"name":"domain.com"}'
```

## Sentry Integration (MANDATORY for all projects)
```javascript
Sentry.init({
  dsn: 'https://KEY@sentry.megabyte.space/PROJECT_ID',
  tracesSampleRate: 0.1,
  environment: 'production',
});
```
Create Sentry project per domain via API or manually at sentry.megabyte.space.

## Key Discovery Order
1. Check `.env.local` in the current project
2. Check the shared pool at rare-chefs `.env.local`
3. Check Coolify environment variables via API
4. Check `~/.config/emdash/` for stored tokens
5. If not found, prompt the user ONCE, then store permanently

## Proxmox
Brian has a Proxmox box running Coolify with 70+ services.
Coolify API: https://coolify.megabyte.space/api/v1/
Token: stored at ~/.config/emdash/coolify-token
Use Coolify to deploy any service that needs persistent hosting (databases, 
Docker apps, etc.) that Cloudflare can't handle.
