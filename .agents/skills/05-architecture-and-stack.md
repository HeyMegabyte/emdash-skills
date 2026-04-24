---
name: "architecture-and-stack"
description: "Cloudflare-first platform selection. Decision trees for Workers, D1, R2, KV, DO, Queues, Vectorize, Containers, Sandboxes, Flagship, Agent Memory, Workflows v2. Default stack, override conditions, auth, data patterns, reliability."
metadata:
  version: "2.0.0"
  updated: "2026-04-23"
submodules:
  - api-design-and-documentation.md
  - shared-api-pool.md
  - drizzle-orm-and-migrations.md
  - coolify-docker-proxmox.md
  - mcp-and-cloud-integrations.md
  - ai-technology-integration.md
  - auth-and-session-management.md
  - background-jobs-and-workflows.md
  - openapi-generation.md
  - cf-auto-provision.md
  - enterprise-multi-tenancy.md
---

## Submodules

| File | Description |
|------|-------------|
| api-design-and-documentation.md | Hono v4.12.x RPC mode, error envelope, rate limiting, pagination, OpenAPI, versioning. |
| shared-api-pool.md | Centralized API key pool. Auto-integrates PostHog, Sentry, Postiz, all services. |
| drizzle-orm-and-migrations.md | Drizzle ORM v1.0 for D1/Neon. RQBv2, schema-first, auto migrations, type-safe queries. |
| coolify-docker-proxmox.md | Self-hosted services on Proxmox via Coolify API. Docker containers, env vars. |
| mcp-and-cloud-integrations.md | All MCP servers, cloud APIs, SaaS integrations. Secret discovery, AI API usage. |
| ai-technology-integration.md | AI APIs/models: GPT-4o vision, Workers AI edge inference, embeddings for RAG. |
| auth-and-session-management.md | Clerk auth: middleware, webhook sync, RBAC, protected routes, session tokens. |
| background-jobs-and-workflows.md | Inngest durable jobs, CF Workflows v2, CF Cron Triggers, CF Queues, email drips, fan-out. |
| openapi-generation.md | @hono/zod-openapi auto-generated specs, Swagger UI, client SDK codegen, versioning. |
| cf-auto-provision.md | Single-function CF project bootstrap: D1+KV+R2+DNS+routes+wrangler.toml+integrations via cf CLI. |
| enterprise-multi-tenancy.md | DB-per-tenant D1, RBAC/ABAC, audit logging (R2 WORM), SSO/SCIM, data residency, rate limiting, white-labeling. |

# 05 — Architecture and Stack

## Default Stack

| Need | Default | Override When |
|------|---------|---------------|
| Hosting | CF Workers + Static Assets | Never |
| Backend | Hono v4.12.x on Workers | Complex GraphQL → Yoga |
| Frontend (simple) | Vanilla HTML/CSS/JS | >3 interactive pages |
| Frontend (complex) | Angular 21 + Ionic + PrimeNG + Nx | Simple marketing site |
| DB (simple) | D1 (SQLite, global read replication) | Joins >3 tables |
| DB (complex) | Neon PostgreSQL | D1 sufficient |
| Cache | KV / Upstash Redis | Atomic ops → D1 |
| Storage | R2 | S3-specific SDK |
| Auth (SaaS) | Clerk | Custom auth requested |
| Auth (self-hosted) | Authentik | Clerk for customer-facing |
| Payments | Stripe + Stripe Link | Non-card/crypto |
| Email (transactional) | Resend / CF Email Service | Bulk → Listmonk |
| Email (marketing) | Listmonk on Coolify | Simple → Resend |
| Runtime | Bun | Node.js for incompatible |
| Package Manager | pnpm | Legacy npm |
| Linting (TS) | ESLint + Prettier | Never Biome |
| Linting (Python) | Ruff + mypy | Never black+isort separately |
| Testing | Playwright v1.59+ + Vitest | Never Jest/Cypress |
| Analytics | GA4 via GTM + PostHog | Privacy-first → PostHog only |
| Errors | Sentry | PostHog errors sufficient |
| Validation | Zod | — |
| Search | AI Search (fka AutoRAG) + Vectorize | Simple → D1 LIKE |
| Queues | CF Queues | — |
| Realtime | Durable Objects + WebSocket (32MiB msg) | Simple polling |
| Scheduling | CF Cron Triggers (250 paid) | — |
| AI/ML | Workers AI (Unweight 22% compression) | Specific model → OpenAI/Anthropic via AI Gateway |
| Workflows | Inngest / CF Workflows v2 | Simple cron → Cron Triggers |
| AI Agents | CF Agents SDK (Project Think on DO) | No agent needed |
| Agent Memory | CF Agent Memory (managed) | Custom → DO+SQLite |
| Sandboxes | CF Sandboxes (GA) | Simple → Dynamic Workers |
| Containers | CF Containers (GA) | Simple → Workers |
| Feature Flags | Flagship (sub-ms eval) | PostHog flags sufficient |
| IaC | cf CLI (3000 ops) + wrangler.jsonc | Multi-cloud → Pulumi |
| CI/CD | Workers Builds / GitHub Actions | Complex → GH Actions |

Key reasoning: Hono over NestJS (native CF Workers, 12KB). Angular over React (Brian's background, signals stable). Neon over Supabase (multi-DB, lower cost). Drizzle over Prisma (5KB vs 40KB, edge-native, passed Prisma in downloads). ESLint over Biome (angular-eslint, typescript-eslint, massive plugin library).

## CF-Only Assumption (***DEFAULT***)
Every feature MUST try CF-native first. Never reach for external services when CF has an equivalent. Template: megabytespace/saas-starter has stubs for all CF primitives.
AI→Workers AI (not OpenAI). Cache→KV/Cache API (not Redis). DB→D1 (not Postgres). Storage→R2 (not S3). Queue→CF Queues (not SQS). Realtime→DO+WebSocket (not Pusher). Schedule→Cron Triggers (not external cron). Search→AI Search+Vectorize (not Algolia). Email→CF Email Service (not SES). Feature flags→Flagship (not LaunchDarkly). Sandbox→CF Sandboxes (not Docker). Only escape to external when CF primitive insufficient (complex joins→Neon, specific model→OpenAI/Anthropic via AI Gateway).

## CF Platform Decision Trees

**Run code:** Static→Workers Static Assets. API→Workers(Hono). Long-running→Workers+Queues/Workflows v2. Stateful→DO. Container workload→CF Containers(GA). Scheduled→Cron Triggers. Browser→Browser Run(Live View+HitL). Sandboxed exec→Dynamic Workers(100x faster than containers). Full isolation→CF Sandboxes(GA, persistent shell+fs).

**Store data:** Config→KV. Relational simple→D1(global read replication, 1TB). Relational complex→Neon. Files→R2. Session→DO/KV. Search→AI Search(hybrid retrieval). Vectors→Vectorize. Messages→Queues. Cache→KV(CACHE binding, TTL). Versioned objects→Artifacts(git-compatible). Agent state→Agent Memory(managed).

**Security:** Bots→Turnstile. DDoS→always-on free. WAF→CF WAF. Auth→Clerk. Agent auth→Managed OAuth(RFC 9728). Rate limit→KV counters. Secrets→wrangler secret put. Admin→CF Access. Private networking→CF Mesh.

**Feature management:** Flags→Flagship(sub-ms eval). Rollout→percentage+cohort+property. Kill switch→instant disable.

## Architecture Patterns

**Marketing Site:** Worker(Hono) → Static Assets + R2 images + KV config + GA4+GTM + Turnstile + Resend

**SaaS App:** Workers Static Assets(Angular 21+Ionic) → Workers API(Hono) → D1(global replicas)/Neon + R2 + KV + Queues + DO + Clerk + Stripe + Resend + Listmonk + Flagship + PostHog+Sentry+GA4 + Playwright+Vitest

**API Service:** Worker(Hono) → D1/Neon + KV(rate limit/cache) + R2 + Queues + Workers AI + Sentry + PostHog

**AI Agent Service:** Worker(Hono) → Agents SDK(Project Think) + Agent Memory + Dynamic Workers + Browser Run + AI Search + DO(stateful sessions)

### Service Boundaries
Start monolith. Split when: different scaling needs, different deploy cadence, Worker size exceeded (10MB compressed paid), isolation required. Angular frontend = separate Worker. Webhook handlers = separate. Cron = shared via scheduled handler. Service bindings for zero-cost Worker-to-Worker RPC.

## Auth: Clerk

User → Clerk widget → JWT → Worker middleware verifies → proceed. Metadata in D1 (Clerk ID as FK). Roles in D1, not Clerk metadata. Not needed for: public marketing, OSS docs, public APIs with rate limiting only.

## Data: Drizzle ORM v1.0

Schema in TypeScript, type-safe queries, auto migrations. RQBv2 (363 commits, 9K+ tests). 10x faster introspection. D1 conventions: id=TEXT(ULID), created_at/updated_at=TEXT(ISO8601), deleted_at=TEXT(soft delete), explicit FKs, indexes on FKs+frequent columns. D1 batch API for transactions (no BEGIN support).

**Neon when D1 isn't enough:** >3 table joins, full-text search, jsonb, complex aggregations, RLS, >1TB. D1 global read replication eliminates most Neon arguments for read-heavy apps.

## API Keys

All keys: `/Users/apple/emdash-projects/worktrees/rare-chefs-film-8op/.env.local`
GCP: `/Users/apple/.config/emdash/gcp-service-account.json`
CF Global: blzalewski@gmail.com / ***REDACTED_CF_KEY***

| Service | Env Var | Free Tier |
|---------|---------|-----------|
| Cloudflare | CLOUDFLARE_API_TOKEN | Yes |
| Stripe | STRIPE_API_KEY | Test free |
| Resend | RESEND_API_KEY | 100/day |
| PostHog | POSTHOG_API_KEY | 1M events/mo |
| Sentry | SENTRY_AUTH_TOKEN | 5K errors/mo |
| OpenAI | OPENAI_API_KEY | Pay-per-use |
| Anthropic | ANTHROPIC_API_KEY | Pay-per-use |
| Ideogram | IDEOGRAM_API_KEY | Pay-per-use |
| Unsplash | UNSPLASH_ACCESS_KEY | 50 req/hr |
| Pexels | PEXELS_API_KEY | 200 req/hr |
| GA4 | GCP service account | Free |
| Clerk | CLERK_SECRET_KEY | 10K MAU |

## Reliability

Error handler: `app.onError()` → log + Sentry + JSON envelope. Retry: idempotent 3x exponential backoff, non-idempotent no retry. Health: GET /health (version+timestamp), /health/db, /health/services. D1 Time Travel: 30-day PIT recovery (paid), 7-day (free). D1→R2 daily backup workflow for 90+ day retention.

## CF Infrastructure

Zone (megabyte.space): 75a6f8d5e441cd7124552976ba894f83. Deploy+purge always together (see CONVENTIONS.md).

| Product | Free Limit | Paid Limit |
|---------|-----------|------------|
| Workers | 100K req/day, 10ms CPU | Unlimited, 5min CPU |
| Static Assets | 20K files/version | 100K files/version |
| D1 | 5M rows read, 5GB | 25B rows, 1TB |
| R2 | 10GB, 10M req/mo | Zero egress |
| KV | 100K reads/day | 10M reads/day |
| Queues | 1M msg/mo | Pay-per-use |
| DO | 100K req/day | Pay-per-use |
| Vectorize | 5M vectors | Pay-per-use |
| Workers AI | 10K neurons/day | Pay-per-use |
| WebSocket msg | 32 MiB | 32 MiB |
| Worker size | 3MB compressed | 10MB compressed |
| Cron Triggers | 5 | 250 |
| Containers | — | GA (DO-based) |

Security headers, Turnstile, rate limiting, DNS management, wrangler.jsonc template — see CONVENTIONS.md.

## AI Agent Patterns (CF Agents SDK + Project Think, April 2026)

Think class on DO: addressable entity with SQLite, zero compute when hibernated. Durable execution via Fibers (survives crashes). Dynamic Workers for sandboxed V8 isolates (100x faster, 100x more memory-efficient than containers). Execution ladder: Workspace → Dynamic Worker → npm resolution → headless browser → CF Sandbox(GA). Sub-agent coordination via Facets (colocated, typed RPC).

Agent Memory: managed persistent memory service — recall what matters, forget what doesn't. Browser Run: enhanced browser rendering with Live View, Human-in-the-Loop, CDP access, 4x concurrency. CF Email Service (public beta): native send/receive/process from agents. Managed OAuth: RFC 9728 agent authentication. CF Mesh: secure private networking for agents+Workers with scoped DB/API access. AI Search: dynamic instances with hybrid retrieval + relevance boosting (fka AutoRAG).

Code Mode MCP: 2 tools + <1K tokens (81% reduction vs traditional MCP). cf CLI: unified CLI covering ~3000 API operations.

Traffic reality: agentic actors = ~10% CF network (up 60% YoY). Design every API for human+agent consumers.
