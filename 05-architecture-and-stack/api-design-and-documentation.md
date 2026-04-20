---
name: "API Design and Documentation"
description: "Canonical owner of Hono RPC mode, error envelope format, rate limiting patterns, pagination, OpenAPI spec generation, API versioning, webhook signature verification, and API documentation. Every API endpoint is type-safe, validated, documented, and production-ready."
always-load: false---

# 25 — API Design and Documentation

> Type-safe from client to database. Validated at every boundary. Documented by the code itself.

---

## Core Principle

**The API is the product.** Whether consumed by a frontend, a mobile app, or an AI agent, the API must be consistent, predictable, and self-documenting. Hono's RPC mode makes the API contract a TypeScript type — the client literally cannot call it wrong.

---

## Canonical Definitions

### Error Envelope (MANDATORY on all error responses)

```typescript
interface ErrorResponse {
  error: string;        // Human-readable message (shown to user)
  code?: string;        // Machine-readable code (for client logic)
  details?: unknown;    // Validation errors, debug info (never in production for 500s)
}

// Success envelope (for list endpoints)
interface ListResponse<T> {
  data: T[];
  cursor?: string;      // For pagination
  hasMore: boolean;
}

// Success envelope (for single item)
interface ItemResponse<T> {
  data: T;
}
```

### HTTP Status Code Usage

| Status | When | Error Code |
|--------|------|-----------|
| 200 | Success (GET, PUT, PATCH) | — |
| 201 | Created (POST that creates) | — |
| 204 | Deleted (DELETE) | — |
| 400 | Invalid input (Zod validation failed) | `VALIDATION_ERROR` |
| 401 | No auth token or invalid token | `UNAUTHORIZED` |
| 403 | Valid token but insufficient permissions | `FORBIDDEN` |
| 404 | Resource not found | `NOT_FOUND` |
| 409 | Conflict (duplicate, race condition) | `CONFLICT` |
| 422 | Business logic rejection (valid input, invalid state) | `UNPROCESSABLE` |
| 429 | Rate limit exceeded | `RATE_LIMITED` |
| 500 | Unexpected server error | `INTERNAL_ERROR` |

### Middleware Layering Order

```
1. Logger (global) — logs every request
2. Security Headers (global) — CSP, HSTS, etc.
3. CORS (route group) — /api/* only
4. Rate Limiting (route group) — tiered per endpoint type
5. Auth (route-specific) — protected routes only
6. Validation (route-specific) — Zod on request body/params
7. Handler — business logic
```

---

## Rules

1. **Inline handlers for type inference.** Never extract handlers into separate controller files. Hono's RPC mode requires the handler to be inline for TypeScript to infer the response type.
2. **Export AppType for RPC clients.** Every API exports `type AppType = typeof app` so clients get full type safety via `hc<AppType>`.
3. **Zod schema is the single source of truth.** Define the schema once, derive the TypeScript type with `z.infer<typeof Schema>`, validate with `zValidator()`, and generate OpenAPI from the same schema.
4. **Centralized error handler.** Use `app.onError()` for unexpected errors and `app.notFound()` for 404s. Never let unhandled errors reach the client.
5. **Split large APIs with `app.route()`.** Group related endpoints into sub-apps. Each sub-app is a separate file. Mount at the top level.
6. **Cursor-based pagination, not offset-based.** Offset pagination is O(n) on D1/SQLite. Cursor pagination is O(1). Use the last item's ID as cursor.
7. **Version via URL path (`/v1/`).** Only introduce v2 when breaking changes are unavoidable. Maintain v1 for at least 6 months after v2 launch.
8. **Health endpoint on every API.** `GET /health` returns `{ status, version, timestamp }`. Used by uptime monitoring and deploy verification.
9. **Rate limits are tiered.** Public endpoints: 60/min. Auth endpoints: 10/min. Webhook endpoints: 1000/min. Admin endpoints: 120/min.
10. **Every endpoint has a Zod schema.** Request body, query params, URL params, and response shape. No unvalidated input touches business logic.
11. **API documentation is generated from code.** Use `@hono/zod-openapi` or hand-crafted OpenAPI YAML. Never maintain separate docs that drift from implementation.
12. **Webhook endpoints verify signatures BEFORE parsing.** Read raw body, verify HMAC, then parse JSON. Never parse untrusted payloads.

---

## Patterns

### Hono RPC Mode (Full Type Safety)

```typescript
// src/index.ts — API definition
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

type Env = {
  Bindings: { DB: D1Database; KV: KVNamespace; CLERK_SECRET_KEY: string };
};

const app = new Hono<Env>();

// Mount sub-routes
import { usersRoutes } from './routes/users';
import { postsRoutes } from './routes/posts';

const routes = app
  .route('/api/v1/users', usersRoutes)
  .route('/api/v1/posts', postsRoutes)
  .get('/health', (c) => c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));

// Export type for RPC client
export type AppType = typeof routes;
export default app;
```

```typescript
// Client-side usage (fully type-safe)
import { hc } from 'hono/client';
import type { AppType } from '../api';

const client = hc<AppType>('https://api.domain.com');

// TypeScript knows the exact shape of request and response
const res = await client.api.v1.users.$get();
const { data } = await res.json(); // Typed!
```

### Route Organization (Sub-Apps)

```typescript
// src/routes/users.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

const ListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const usersRoutes = new Hono<Env>()
  // List users (paginated)
  .get('/', zValidator('query', ListQuerySchema), async (c) => {
    const { cursor, limit } = c.req.valid('query');
    const db = drizzle(c.env.DB);

    const query = db.select().from(users).orderBy(desc(users.createdAt)).limit(limit + 1);
    if (cursor) query.where(lt(users.id, cursor));

    const results = await query;
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;

    return c.json({
      data,
      cursor: data.length ? data[data.length - 1].id : undefined,
      hasMore,
    });
  })
  // Get single user
  .get('/:id', zValidator('param', z.object({ id: z.string().ulid() })), async (c) => {
    const { id } = c.req.valid('param');
    const db = drizzle(c.env.DB);
    const user = await db.select().from(users).where(eq(users.id, id)).get();

    if (!user) return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404);
    return c.json({ data: user });
  })
  // Create user
  .post('/', zValidator('json', CreateUserSchema), async (c) => {
    const data = c.req.valid('json');
    const db = drizzle(c.env.DB);
    const id = ulid();

    await db.insert(users).values({ id, ...data, createdAt: new Date().toISOString() });
    return c.json({ data: { id, ...data } }, 201);
  });
```

### Centralized Error Handler

```typescript
import { HTTPException } from 'hono/http-exception';

// Catch all unhandled errors
app.onError((err, c) => {
  // Known HTTP errors (thrown intentionally)
  if (err instanceof HTTPException) {
    return c.json({
      error: err.message,
      code: `HTTP_${err.status}`,
    }, err.status);
  }

  // Zod validation errors (from zValidator)
  if (err.name === 'ZodError') {
    return c.json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: (err as z.ZodError).flatten(),
    }, 400);
  }

  // Unexpected errors — log, report, return generic message
  console.error(`[${c.req.method}] ${c.req.path}:`, err);
  // Report to Sentry
  return c.json({
    error: 'Something went wrong on our end',
    code: 'INTERNAL_ERROR',
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: `Route ${c.req.method} ${c.req.path} not found`,
    code: 'NOT_FOUND',
  }, 404);
});
```

### Cursor-Based Pagination

```typescript
// Cursor is the last item's ID (ULID = lexicographically sortable)
interface PaginationParams {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

async function paginate<T extends { id: string }>(
  db: DrizzleD1,
  table: Table,
  params: PaginationParams,
  orderColumn = table.id,
): Promise<{ data: T[]; cursor?: string; hasMore: boolean }> {
  const { cursor, limit, direction = 'forward' } = params;

  let query = db.select().from(table).limit(limit + 1);

  if (cursor) {
    query = direction === 'forward'
      ? query.where(lt(orderColumn, cursor))
      : query.where(gt(orderColumn, cursor));
  }

  query = direction === 'forward'
    ? query.orderBy(desc(orderColumn))
    : query.orderBy(asc(orderColumn));

  const results = await query as T[];
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;

  return {
    data,
    cursor: data.length ? data[data.length - 1].id : undefined,
    hasMore,
  };
}
```

### Webhook Signature Verification

```typescript
// Generic HMAC verification (works for Stripe, GitHub, custom)
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: 'sha256' | 'sha512' = 'sha256',
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: `SHA-${algorithm === 'sha256' ? '256' : '512'}` },
    false,
    ['verify'],
  );

  const sigBytes = hexToBytes(signature);
  return crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(payload));
}

// Stripe-specific (timestamp + payload)
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => p.split('=') as [string, string])
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  // Reject if timestamp is older than 5 minutes (replay attack prevention)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
  if (age > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  return verifyHmacSignature(signedPayload, signature, secret);
}

// GitHub webhook verification
async function verifyGitHubSignature(
  payload: string,
  sigHeader: string, // "sha256=abc123..."
  secret: string,
): Promise<boolean> {
  const signature = sigHeader.replace('sha256=', '');
  return verifyHmacSignature(payload, signature, secret);
}
```

### OpenAPI Generation Pattern

```typescript
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono<Env>();

const getUserRoute = createRoute({
  method: 'get',
  path: '/api/v1/users/{id}',
  request: {
    params: z.object({ id: z.string().ulid() }),
  },
  responses: {
    200: {
      content: { 'application/json': { schema: UserResponseSchema } },
      description: 'User found',
    },
    404: {
      content: { 'application/json': { schema: ErrorResponseSchema } },
      description: 'User not found',
    },
  },
});

app.openapi(getUserRoute, async (c) => {
  // Handler with full type safety
});

// Serve OpenAPI spec
app.doc('/api/openapi.json', {
  openapi: '3.1.0',
  info: { title: 'My API', version: '1.0.0' },
});

// Optional: Swagger UI
app.get('/api/docs', (c) => {
  return c.html(`
    <html><body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
      <script>SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' })</script>
    </body></html>
  `);
});
```

### API Versioning

```typescript
// src/index.ts
const v1 = new Hono<Env>();
const v2 = new Hono<Env>();

// v1 routes (maintained for backward compatibility)
v1.route('/users', usersV1Routes);
v1.route('/posts', postsV1Routes);

// v2 routes (breaking changes)
v2.route('/users', usersV2Routes); // Different response shape
v2.route('/posts', postsV2Routes);

// Mount both versions
app.route('/api/v1', v1);
app.route('/api/v2', v2);

// Deprecation header on v1
v1.use('*', async (c, next) => {
  await next();
  c.header('Deprecation', 'true');
  c.header('Sunset', '2026-12-31');
  c.header('Link', '</api/v2>; rel="successor-version"');
});
```

### CORS Configuration

```typescript
import { cors } from 'hono/cors';

// Strict CORS for API routes only
app.use('/api/*', cors({
  origin: [
    'https://domain.com',
    'https://www.domain.com',
    'https://admin.domain.com',
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-Request-ID'],
  maxAge: 86400,
  credentials: true,
}));
```

---

## API Design Checklist

```
[ ] Every route has Zod validation (body, params, query)
[ ] Error responses use the standard envelope { error, code, details }
[ ] Correct HTTP status codes (201 for create, 204 for delete, etc.)
[ ] Rate limiting applied (tiered per endpoint type)
[ ] Auth middleware on protected routes
[ ] CORS configured with explicit origins (never *)
[ ] Health endpoint returns { status, version, timestamp }
[ ] Pagination is cursor-based (not offset)
[ ] AppType exported for RPC client generation
[ ] Webhook endpoints verify signatures before parsing
[ ] OpenAPI spec generated from Zod schemas
[ ] Security headers on all responses
[ ] Request IDs for tracing (X-Request-ID)
[ ] Proper cache headers per endpoint type
```

---

## Integration Points

| Skill | Interaction |
|-------|------------|
| 05 Architecture | API architecture patterns, service boundaries |
| 07 Quality | API endpoint tests (valid -> 200, invalid -> 400, missing -> 404) |
| 22 Security | Rate limiting, auth middleware, input validation |
| 38 Health | Health check endpoint implementation |
| 44 Drizzle | Database queries inside handlers |
| 45 Webhooks | Webhook endpoint patterns, signature verification |
| 52 MCP | API exposed as MCP tools for AI agents |

---

## What This Skill Owns

- Hono RPC mode setup and AppType export
- Error envelope format and HTTP status code usage
- Middleware layering order
- Rate limiting implementation (tiered)
- Cursor-based pagination pattern
- OpenAPI spec generation from Zod schemas
- API versioning strategy (URL path-based)
- Route organization (`app.route()` sub-apps)
- CORS configuration
- Request ID generation and tracing
- Webhook signature verification (Stripe, GitHub, Clerk, custom)
- API documentation generation and serving
- Centralized error and 404 handlers

## What This Skill Must Never Own

- Database schema design (-> 44 Drizzle)
- Authentication provider setup (-> 05 Architecture)
- Deployment of the Worker (-> 08 Deploy)
- Frontend API client UI (-> 06 Build Loop)
- Business logic within handlers (-> domain-specific)
- Security header definitions (-> 22 Security)
- Webhook business logic (-> 45 Webhooks)
