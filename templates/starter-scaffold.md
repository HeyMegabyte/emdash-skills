---
name: "Starter Scaffold"
description: "Pre-wired Hono+D1+Clerk+Stripe+Inngest skeleton for one-prompt SaaS deploys"
---

# Starter Scaffold Template

Deploy this skeleton on first prompt. Folder name = domain. All bindings pre-wired.

## File Structure

```
├── .claude/
│   ├── settings.json         # Project-level permissions, hooks, env
│   ├── CLAUDE.md             # Project architecture, conventions, product brief
│   └── rules/
│       ├── api-design.md     # Path-scoped: src/routes/**
│       └── testing.md        # Path-scoped: tests/**
├── .mcp.json                 # Project MCP servers (if any beyond global)
├── .gitignore                # Includes: .claude/settings.local.json, CLAUDE.local.md
├── SPEC.md                   # Acceptance criteria (generated from brief)
├── src/
│   ├── index.ts              # Hono app entry, middleware stack, routes
│   ├── routes/
│   │   ├── health.ts         # GET /health { status, version, timestamp }
│   │   ├── auth.ts           # Clerk webhook + session middleware
│   │   ├── billing.ts        # Stripe checkout, portal, webhooks
│   │   ├── api.ts            # Domain-specific API routes
│   │   └── inngest.ts        # Inngest serve endpoint
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema (users, subscriptions, ...)
│   │   └── migrations/       # Drizzle Kit migrations
│   ├── lib/
│   │   ├── auth.ts           # Clerk middleware (verifyToken)
│   │   ├── billing.ts        # Stripe helpers (createCheckout, createPortal)
│   │   ├── inngest.ts        # Inngest client + functions
│   │   ├── email.ts          # Resend transactional wrapper
│   │   └── turnstile.ts      # CF Turnstile verification
│   └── types.ts              # Env bindings type
├── public/
│   ├── index.html            # SPA shell or landing page
│   ├── favicon.ico
│   └── robots.txt
├── tests/
│   ├── homepage.spec.ts      # Homepage E2E (ALWAYS FIRST)
│   └── health.spec.ts        # Health endpoint test
├── wrangler.toml             # CF Workers config with all bindings
├── drizzle.config.ts
├── biome.json
├── package.json
├── tsconfig.json
└── CLAUDE.md                 # Project-specific instructions
```

## wrangler.toml Skeleton

```toml
name = "DOMAIN_NAME"
main = "src/index.ts"
compatibility_date = "2025-04-01"
compatibility_flags = ["nodejs_compat"]

[vars]
SITE_NAME = "DOMAIN_NAME"
SITE_DESCRIPTION = ""
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "DOMAIN_NAME-db"
database_id = "" # Created via: wrangler d1 create DOMAIN_NAME-db

[[kv_namespaces]]
binding = "KV"
id = "" # Created via: wrangler kv namespace create KV

[ai]
binding = "AI"

# [vectorize] — uncomment when AI Search needed
# binding = "VECTORIZE"
# index_name = "DOMAIN_NAME-index"
```

## src/index.ts Skeleton

```typescript
import { Hono } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { Env } from './types';
import { healthRoute } from './routes/health';
import { authRoute } from './routes/auth';
import { billingRoute } from './routes/billing';
import { apiRoute } from './routes/api';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('/api/*', cors({ origin: ['https://DOMAIN'] }));

// Routes
app.route('/health', healthRoute);
app.route('/auth', authRoute);
app.route('/billing', billingRoute);
app.route('/api', apiRoute);

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal server error', code: 'INTERNAL' }, 500);
});
app.notFound((c) => c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404));

export type AppType = typeof app;
export default app;
```

## src/types.ts

```typescript
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  AI: Ai;
  CLERK_SECRET_KEY: string;
  CLERK_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  TURNSTILE_SECRET: string;
  RESEND_API_KEY: string;
  INNGEST_EVENT_KEY: string;
  INNGEST_SIGNING_KEY: string;
  SITE_NAME: string;
  SITE_DESCRIPTION: string;
  ENVIRONMENT: string;
}
```

## src/db/schema.ts

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  name: text('name'),
  stripeCustomerId: text('stripe_customer_id'),
  plan: text('plan').default('free').notNull(), // free | pro
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(), // Stripe subscription ID
  userId: text('user_id').notNull().references(() => users.id),
  status: text('status').notNull(), // active | canceled | past_due
  priceId: text('price_id').notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
});
```

## package.json Dependencies

```json
{
  "dependencies": {
    "hono": "^4",
    "@hono/zod-validator": "^0.4",
    "drizzle-orm": "^0.36",
    "zod": "^3.23",
    "@clerk/backend": "^1",
    "stripe": "^17",
    "inngest": "^3",
    "resend": "^4"
  },
  "devDependencies": {
    "wrangler": "^4",
    "drizzle-kit": "^0.28",
    "@biomejs/biome": "^1.9",
    "@playwright/test": "^1.49",
    "typescript": "^5.7"
  }
}
```

## First Deploy Sequence

```bash
# 1. Create bindings
wrangler d1 create DOMAIN-db
wrangler kv namespace create KV

# 2. Update wrangler.toml with IDs from step 1

# 3. Apply migrations
wrangler d1 migrations apply DOMAIN-db --remote

# 4. Set secrets
wrangler secret put CLERK_SECRET_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put TURNSTILE_SECRET
wrangler secret put RESEND_API_KEY

# 5. Deploy
npx wrangler deploy

# 6. Purge cache
curl -sX POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" \
  -H "Authorization: Bearer ${CF_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# 7. Test
PROD_URL=https://DOMAIN npx playwright test
```
