---
name: "Shared API Pool"
description: "185 API keys across 27 categories in chezmoi+age encrypted store. Auto-discovery via get-secret. Every project auto-integrates with available services. Full catalog in ~/.claude/research/api-library.md (150+ APIs with free tiers, env vars, MCP availability, and integration examples)."---

# Shared API Key Pool
## Rule
ALL Emdash projects share a common pool of API keys. When building any project, automatically integrate with every service that has a key available. Run `discover-secrets.sh` to see what's unlocked.

## Secret Discovery (3 Sources, Priority Order)
### 1. Chezmoi Encrypted Store (185 secrets) — PRIMARY
```bash
get-secret SECRET_NAME          # Decrypt any secret by name
discover-secrets.sh             # Full inventory
discover-secrets.sh --check KEY # Check single key
```
Location: `~/.local/share/chezmoi/home/.chezmoitemplates/secrets/`
Cross-machine sync: `chezmoi apply` on any new machine → all 185 secrets available instantly.

### 2. Shared .env.local (54 keys, runtime-loaded)
`/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`

### 3. Emdash Config
`~/.config/emdash/` — coolify-token, gcp-service-account.json

## Available Keys by Category

### AI/ML (11 keys)
OPENAI_API_KEY→GPT/DALL-E/Whisper | ANTHROPIC_API_KEY→Claude | GEMINI_API_KEY→Gemini | DEEPSEEK_API_KEY→DeepSeek V3/R1 | DEEPGRAM_API_KEY→STT ($200 free) | ELEVENLABS_API_KEY→TTS/voice clone | REPLICATE_API_TOKEN→any ML model | MISTRAL_API_KEY→open-weight LLMs | CEREBRAS_API_KEY→fast inference | BASETEN_API_KEY→model hosting | CARTESIA_API_KEY→voice AI
**Missing (sign up):** GROQ_API_KEY (fastest, free 30rpm) | TOGETHER_API_KEY ($5 free) | FIREWORKS_AI_API_KEY ($1 free) | COHERE_API_KEY (free embeddings) | STABILITY_API_KEY (25 free/day) | PERPLEXITY_API_KEY | FAL_AI_API_KEY | ASSEMBLYAI_API_KEY ($50 free) | LUMA_API_KEY | SUNO_API_KEY

### Communication (12 keys)
SLACK_WEBHOOK_URL | SLACK_API_TOKEN | SLACK_BOT_USER_OAUTH_TOKEN | SLACK_CLIENT_ID/SECRET | DISCORD_BOT_TOKEN | DISCORD_CLIENT_ID/SECRET | TWILIO_ACCOUNT_SID | TWILIO_AUTH_TOKEN | TWILIO_FROM_NUMBER | TELEGRAM_BOT_TOKEN + TELEGRAM_BOT_NAME + TELEGRAM_RECIPIENT_ID
**Missing:** VONAGE_API_KEY

### Cloud/Infra (15+ keys)
CLOUDFLARE_API_TOKEN | CLOUDFLARE_API_KEY | CLOUDFLARE_ACCOUNT_ID | CLOUDFLARE_EMAIL | CLOUDFLARE_R2_* (6 keys) | CLOUDFLARE_TEAMS_* (2 keys) | CLOUDFLARE_SSH_API_TOKEN | CLOUDFLARE_ORIGIN_CA_KEY | AWS_ACCESS_KEY_ID | AWS_SECRET_ACCESS_KEY | DIGITALOCEAN_ACCESS_TOKEN

### Media (7 keys)
PEXELS_API_KEY | UNSPLASH_ACCESS_KEY | PIXABAY_API_KEY | IDEOGRAM_API_KEY→text-in-image | RUNWAY_API_KEY→video gen | REPLICATE_API_TOKEN→any model | CLOUDINARY_API_KEY+SECRET+CLOUD_NAME→image CDN

### Social (15+ keys)
POSTIZ_API_KEY→social scheduling | TWITTER_API_KEY+SECRET+ACCESS_TOKEN+BEARER_TOKEN+OAUTH_* (7 keys) | FACEBOOK_OAUTH_ID/SECRET | REDDIT_APP_ID+SECRET+USERNAME+PASSWORD | PINTEREST_OAUTH_ID/SECRET | YOUTUBE_OAUTH_ID/SECRET | DEVTO_API_KEY

### Payments
STRIPE via project .env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
**Missing:** LEMONSQUEEZY_API_KEY (handles tax/VAT automatically)

### Email (2 keys)
RESEND_API_KEY→modern, React Email | SENDGRID_API_KEY→legacy (free tier removed May 2025)
**Missing:** POSTMARK_SERVER_TOKEN (highest deliverability) | LOOPS_API_KEY (SaaS marketing) | PLUNK_SECRET_KEY (open-source)

### Search (3 keys)
GOOGLE_SEARCH_API_KEY + GOOGLE_SEARCH_ID | SERP_API_KEY | TAVILY_API_KEY→AI search
**Missing:** ALGOLIA_APP_ID+API_KEY | TYPESENSE_API_KEY | BROWSERBASE_API_KEY (for Stagehand)

### Maps/Geo (3 keys)
GOOGLE_MAPS_API_KEY | MAPBOX_ACCESS_TOKEN | FOURSQUARE_API_KEY
**Missing:** LOCATIONIQ_TOKEN (free 10K/day) | OPENWEATHERMAP_API_KEY (in chezmoi)

### Dev (7 keys)
GITHUB_TOKEN | GITHUB_GIST_TOKEN | GITHUB_READ_TOKEN | GITLAB_TOKEN | GITLAB_READ_TOKEN | NPM_TOKEN | DOCKERHUB_TOKEN

### Domain/DNS (2 keys)
GODADDY_API_KEY+SECRET | WHOISXML_API_KEY
**Missing:** NAMECHEAP_API_KEY | DUB_API_KEY (link shortening)

### Self-Hosted (8 keys)
OMI_DEV_KEY+OMI_MCP_KEY→Omi wearable | HASS_TOKEN→Home Assistant | SUPERMEMORY_TOKEN | N8N_API_KEY | PLANE_API_KEY | NOTION_TOKEN | WP_API_PASSWORD+USERNAME
Plus Coolify token at ~/.config/emdash/coolify-token

### Infrastructure/VPN (10+ keys)
TAILSCALE_AUTH_KEY | NGROK_AUTH_TOKEN | NORDVPN_* | PROTONVPN_* | PROXMOX_ROOT_PASSWORD | RESTIC_PASSWORD (backups) | HISHTORY_USER_SECRET | WAKATIME_API_KEY

## MCP Servers with Keys (26 servers installed)
Cloudflare | GitHub | Playwright | Stripe | Slack | Airtable | Figma | Google Cal/Drive/Gmail | IFTTT | Notion | Plane | Coolify | WordPress | PostHog | Sentry | Firecrawl | DeepSeek | Sequential Thinking | Supermemory | Computer Use | Context7 | Neon | Snyk | Semgrep | Upstash | Twilio | Replicate | ElevenLabs | Meilisearch | Accessibility Scanner | Idea Reality

## Self-Hosted Services (Proxmox/Coolify, 70+ containers)
Sentry→sentry.megabyte.space | PostHog→posthog.megabyte.space | Postiz→postiz.megabyte.space | Home Assistant→connect.tomy.house | SearXNG→searxng.megabyte.space | FireCrawl→firecrawl.megabyte.space | Browserless→browserless.megabyte.space | n8n→n8n.megabyte.space | Authentik→authentik.megabyte.space | Coolify→coolify.megabyte.space

## Integration Protocol
For EVERY new project: (1) scan key pool via discover-secrets.sh (2) create PostHog+Sentry project instances (3) inject keys as CF Worker secrets via `wrangler secret put` (4) configure client-side snippets (5) set up server-side reporting. MANDATORY: PostHog analytics + Sentry errors on every project.

## Full API Catalog
150+ APIs with free tiers, env vars, MCP availability, and code examples: `~/.claude/research/api-library.md`
Sideload this file when choosing which APIs to integrate: `Read ~/.claude/research/api-library.md`

## Key Discovery Order
1. Check `.env.local` in current project
2. Check shared pool at rare-chefs `.env.local`
3. Run `get-secret KEY` (chezmoi+age)
4. Check `~/.config/emdash/` tokens
5. If not found → sign up (most have free tiers) → `chezmoi add --encrypt`
