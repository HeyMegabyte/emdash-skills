---
name: "API Design and Documentation"
description: "Canonical owner of Hono v4.12.x RPC mode (RegExpRouter O(1) matching, 12KB), error envelope format, rate limiting patterns, pagination, OpenAPI spec generation, API versioning, webhook signature verification, and API documentation. Every API endpoint is type-safe, validated, documented, and production-ready. Factory pattern via createFactory() for reusable middleware."
---
# API Design and Documentation

## Canonical Definitions

### Error Envelope (ALL error responses)
```typescript
interface ErrorResponse { error: string; code?: string; details?: unknown; }
interface ListResponse<T> { data: T[]; cursor?: string; hasMore: boolean; }
interface ItemResponse<T> { data: T; }
```

### HTTP Status Codes
200=success GET/PUT/PATCH, 201=created POST, 204=deleted, 400=validation(VALIDATION_ERROR), 401=no auth(UNAUTHORIZED), 403=insufficient perms(FORBIDDEN), 404=not found(NOT_FOUND), 409=conflict(CONFLICT), 422=business logic(UNPROCESSABLE), 429=rate limit(RATE_LIMITED), 500=server error(INTERNAL_ERROR)

### Middleware Order
1. Logger(global) 2. Security Headers(global) 3. CORS(/api/*) 4. Rate Limiting(route group) 5. Auth(route-specific) 6. Validation(route-specific) 7. Handler

## Rules
1. Inline handlers for type inference (Hono RPC requires it)
2. Export `type AppType = typeof app` for RPC clients via `hc<AppType>`
3. Zod schema = single source of truth (validate + types + OpenAPI)
4. Centralized `app.onError()` + `app.notFound()`
5. Split large APIs: `app.route('/path', subApp)`
6. Cursor-based pagination (not offset — O(1) vs O(n) on D1)
7. Version via URL path `/v1/`. Maintain v1 6+ months after v2.
8. Health endpoint: `GET /health` -> `{ status, version, timestamp }`
9. Rate limits: public 60/min, auth 10/min, webhooks 1000/min, admin 120/min
10. Every endpoint has Zod schema (body, query, params, response)
11. API docs generated from code (`@hono/zod-openapi`)
12. Webhook endpoints verify signatures BEFORE parsing

## Key Patterns

### Hono RPC Mode
```typescript
const routes = app
  .route('/api/v1/users', usersRoutes)
  .route('/api/v1/posts', postsRoutes)
  .get('/health', (c) => c.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() }));
export type AppType = typeof routes;
// Client: const client = hc<AppType>('https://api.domain.com');
```

### Cursor Pagination
```typescript
// Fetch limit+1, if results > limit -> hasMore=true, slice off last
// Cursor = last item's ID (ULID = lexicographically sortable)
const results = await query.limit(limit + 1);
const hasMore = results.length > limit;
const data = hasMore ? results.slice(0, -1) : results;
return { data, cursor: data[data.length-1]?.id, hasMore };
```

### Centralized Error Handler
```typescript
app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message, code: `HTTP_${err.status}` }, err.status);
  if (err.name === 'ZodError') return c.json({ error: 'Validation failed', code: 'VALIDATION_ERROR', details: err.flatten() }, 400);
  console.error(`[${c.req.method}] ${c.req.path}:`, err);
  return c.json({ error: 'Something went wrong on our end', code: 'INTERNAL_ERROR' }, 500);
});
app.notFound((c) => c.json({ error: `Route ${c.req.method} ${c.req.path} not found`, code: 'NOT_FOUND' }, 404));
```

### Webhook Signature Verification
```typescript
async function verifyHmacSignature(payload: string, signature: string, secret: string, algorithm = 'sha256'): Promise<boolean> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: `SHA-256` }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, hexToBytes(signature), new TextEncoder().encode(payload));
}
// Stripe: verify timestamp freshness (<300s) + `${timestamp}.${payload}` signed
// GitHub: strip 'sha256=' prefix from header
```

### CORS
```typescript
app.use('/api/*', cors({
  origin: ['https://domain.com', 'https://www.domain.com'],
  allowMethods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowHeaders: ['Content-Type','Authorization','X-Request-ID'],
  exposeHeaders: ['X-RateLimit-Limit','X-RateLimit-Remaining','X-Request-ID'],
  maxAge: 86400, credentials: true,
}));
```

### API Versioning
Mount both: `app.route('/api/v1', v1); app.route('/api/v2', v2);`
Add deprecation headers on v1: `Deprecation: true`, `Sunset: 2026-12-31`, `Link: </api/v2>; rel="successor-version"`

## Checklist
Every route: Zod validation, error envelope, correct status codes, rate limiting, auth on protected, CORS explicit origins, health endpoint, cursor pagination, AppType exported, webhook sig verification, OpenAPI from Zod, security headers, X-Request-ID, cache headers.

## Ownership
**Owns:** Hono RPC setup, error envelope, middleware layering, rate limiting, pagination, OpenAPI generation, versioning, route organization, CORS, request IDs, webhook verification, API docs, error/404 handlers.
**Never owns:** DB schema (->44), auth provider (->05), deployment (->08), frontend client UI (->06), business logic, security headers (->22), webhook logic (->45).
