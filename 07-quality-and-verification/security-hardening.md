---
name: "Security Hardening"
description: "Canonical owner of CSP headers, OWASP Top 10 prevention, Zod validation at all boundaries, Turnstile CAPTCHA integration, KV-based rate limiting, secret rotation, dependency scanning, and XSS/CSRF/injection prevention. Every deploy is secure by default."
always-load: false---

# 22 — Security Hardening

> Secure by default. Every boundary validated. Every header set. Every secret rotated.

---

## Core Principle

**Security is not a feature — it is a property of correct code.** Every input is hostile until validated. Every response has security headers. Every secret is encrypted at rest and rotated on schedule. Defense in depth: no single control prevents all attacks.

---

## Canonical Definitions

### Security Headers (MANDATORY on every Worker)

```typescript
import { secureHeaders } from 'hono/secure-headers';

// Apply to all routes
app.use('*', secureHeaders());

// Custom headers for full control
app.use('*', async (c, next) => {
  await next();
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '0'); // Deprecated but set to 0 (modern CSP is better)
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  c.header('Cross-Origin-Opener-Policy', 'same-origin');
  c.header('Cross-Origin-Embedder-Policy', 'require-corp');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
});
```

### CSP Template (Emdash Standard)

```typescript
const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://images.unsplash.com https://images.pexels.com https://*.stripe.com https://*.cloudflare.com",
  "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://*.posthog.com https://*.sentry.io https://challenges.cloudflare.com",
  "frame-src https://www.youtube.com https://www.google.com https://js.stripe.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join('; ');

app.use('*', async (c, next) => {
  await next();
  c.header('Content-Security-Policy', CSP_DIRECTIVES);
});
```

### OWASP Top 10 (2025) Prevention Map

| # | Vulnerability | Our Prevention |
|---|--------------|----------------|
| A01 | Broken Access Control | Clerk JWT middleware on every protected route |
| A02 | Cryptographic Failures | HTTPS-only, secrets in wrangler secrets, no client-side crypto |
| A03 | Injection | Zod validation + parameterized D1 queries (Drizzle) |
| A04 | Insecure Design | Threat modeling at architecture phase (skill 05) |
| A05 | Security Misconfiguration | Security headers on every response, CSP enforced |
| A06 | Vulnerable Components | `npm audit` in CI, Dependabot alerts enabled |
| A07 | Auth Failures | Clerk handles auth, rate limit login attempts |
| A08 | Data Integrity Failures | Webhook signature verification, SRI for CDN scripts |
| A09 | Logging Failures | Sentry captures all errors, structured logs |
| A10 | SSRF | No user-controlled URLs in server-side fetch without allowlist |

---

## Rules

1. **Validate ALL input at the boundary.** Every request body, query parameter, URL parameter, and header value passes through Zod before touching business logic. No exceptions.
2. **Never use `eval()`, `innerHTML`, or `document.write()`.** These are XSS vectors. Use `textContent` for text, template literals for HTML generation server-side.
3. **Parameterized queries ONLY.** Never string-concatenate SQL. Drizzle ORM handles this by default. Raw queries must use `.bind()`.
4. **Secrets live in `wrangler secret put`, never in code.** No `.env` files in repositories. No secrets in `wrangler.toml [vars]`. Access via `c.env.SECRET_NAME`.
5. **CORS must specify exact origins.** Never use `origin: '*'` in production. Enumerate allowed origins explicitly.
6. **Rate limit all public endpoints.** Default: 60 requests per minute per IP. Tighter for auth endpoints (10/min). Use KV-based counters.
7. **Turnstile on every public form.** Contact forms, signup forms, newsletter forms, donation forms. No exceptions.
8. **Webhook signatures must be verified.** Stripe uses HMAC-SHA256. Clerk uses Svix. GitHub uses SHA-256. Never process unverified webhook payloads.
9. **Dependencies audited on every build.** `npm audit --production` in CI. Critical/high vulnerabilities block deploy.
10. **No sensitive data in URLs.** Tokens, session IDs, and PII never appear in query strings (they end up in logs and Referer headers).
11. **Set `HttpOnly`, `Secure`, `SameSite=Strict`** on all cookies. Prefer token-based auth (Clerk JWT) over cookies when possible.
12. **Log security events.** Failed auth attempts, rate limit hits, invalid webhook signatures, and validation failures. Send to Sentry with security tag.

---

## Patterns

### Zod Validation at Every Boundary

```typescript
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  email: z.string().email().max(254),
  message: z.string().min(10).max(5000).trim(),
  turnstileToken: z.string().min(1),
});

app.post('/api/contact', zValidator('json', ContactSchema), async (c) => {
  const data = c.req.valid('json');
  // data is fully typed and validated
  // Turnstile verification next...
});

// URL parameters validated too
const IdParam = z.object({ id: z.string().ulid() });
app.get('/api/users/:id', zValidator('param', IdParam), async (c) => {
  const { id } = c.req.valid('param');
  // Safe to use in queries
});
```

### Rate Limiting Middleware

```typescript
interface RateLimitConfig {
  limit: number;      // Max requests
  window: number;     // Window in seconds
  keyPrefix: string;  // KV key prefix
}

function rateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const key = `rl:${config.keyPrefix}:${ip}`;
    const current = parseInt(await c.env.KV.get(key) || '0');

    if (current >= config.limit) {
      c.header('Retry-After', String(config.window));
      return c.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, 429);
    }

    await c.env.KV.put(key, String(current + 1), { expirationTtl: config.window });
    c.header('X-RateLimit-Limit', String(config.limit));
    c.header('X-RateLimit-Remaining', String(config.limit - current - 1));
    await next();
  };
}

// Apply to routes
app.use('/api/contact', rateLimit({ limit: 5, window: 300, keyPrefix: 'contact' }));
app.use('/api/auth/*', rateLimit({ limit: 10, window: 60, keyPrefix: 'auth' }));
app.use('/api/*', rateLimit({ limit: 60, window: 60, keyPrefix: 'api' }));
```

### Turnstile Verification

```typescript
async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });

  const result = await res.json<{ success: boolean; 'error-codes'?: string[] }>();
  if (!result.success) {
    console.error('Turnstile failed:', result['error-codes']);
  }
  return result.success;
}

// Usage in handler
app.post('/api/contact', zValidator('json', ContactSchema), async (c) => {
  const { turnstileToken, ...data } = c.req.valid('json');
  const ip = c.req.header('cf-connecting-ip') || '';

  if (!await verifyTurnstile(turnstileToken, c.env.TURNSTILE_SECRET, ip)) {
    return c.json({ error: 'Captcha verification failed', code: 'CAPTCHA_FAILED' }, 403);
  }
  // Proceed with validated, verified request...
});
```

### Authentication Middleware (Clerk JWT)

```typescript
import { verifyToken } from '@clerk/backend';

function requireAuth() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized', code: 'NO_TOKEN' }, 401);
    }

    const token = authHeader.slice(7);
    try {
      const payload = await verifyToken(token, {
        secretKey: c.env.CLERK_SECRET_KEY,
      });
      c.set('userId', payload.sub);
      c.set('sessionId', payload.sid);
    } catch {
      return c.json({ error: 'Invalid token', code: 'INVALID_TOKEN' }, 401);
    }

    await next();
  };
}

// Apply to protected routes
app.use('/api/admin/*', requireAuth());
app.use('/api/user/*', requireAuth());
```

### XSS Prevention in HTML Responses

```typescript
// HTML escape function for dynamic content in server-rendered HTML
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Never inject user input unescaped
const html = `<p>Hello, ${escapeHtml(userName)}</p>`;
```

### Secret Rotation Checklist

```
Every 90 days:
[ ] Rotate STRIPE_API_KEY (create new restricted key, update wrangler secret, delete old)
[ ] Rotate TURNSTILE_SECRET (regenerate in CF dashboard, update wrangler secret)
[ ] Rotate CLERK_SECRET_KEY (generate new key in Clerk, update wrangler secret)
[ ] Verify npm audit shows 0 critical/high vulnerabilities
[ ] Review Dependabot alerts and merge security PRs
[ ] Check CF WAF for new attack patterns to block
```

---

## Security Audit Quick Scan

```bash
# Find dangerous patterns in source
grep -rn 'eval\|innerHTML\|document\.write\|dangerouslySetInnerHTML' src/ --include="*.ts" --include="*.tsx"
# Find hardcoded secrets
grep -rn 'password.*=.*["\x27]\|api_key.*=.*["\x27]\|secret.*=.*["\x27]' src/ --include="*.ts"
# Find string concatenation in queries (SQL injection risk)
grep -rn '`.*\$\{.*\}.*WHERE\|`.*\$\{.*\}.*INSERT\|`.*\$\{.*\}.*UPDATE' src/ --include="*.ts"
# Check for wildcard CORS
grep -rn "origin.*['\"]\\*['\"]" src/ --include="*.ts"
```

---

## Integration Points

| Skill | Interaction |
|-------|------------|
| 05 Architecture | Security patterns in architecture decisions, Turnstile/WAF selection |
| 07 Quality | Security is one of 7 quality gate checks |
| 08 Deploy | Security headers verified post-deploy |
| 25 API Design | Rate limiting, auth middleware, input validation on all endpoints |
| 32 Forms | Turnstile on every form, Zod validation |
| 35 CI/CD | npm audit in pipeline, block on critical vulns |
| 44 Drizzle | Parameterized queries prevent injection |
| 45 Webhooks | Signature verification for all inbound webhooks |

---

## What This Skill Owns

- Content Security Policy definition and maintenance
- Security header configuration (HSTS, X-Frame-Options, CORP, COOP, COEP)
- OWASP Top 10 prevention strategy
- Input validation patterns (Zod at boundaries)
- Turnstile CAPTCHA integration and verification
- Rate limiting implementation (KV-based)
- Secret management policy and rotation schedule
- Dependency vulnerability scanning
- XSS/CSRF/injection prevention patterns
- CORS policy enforcement
- Authentication middleware patterns
- Security audit procedures

## What This Skill Must Never Own

- Auth provider selection or configuration (-> 05 Architecture)
- Webhook business logic (-> 45 Webhooks)
- Form UI design (-> 32 Forms)
- CI/CD pipeline setup (-> 35 CI/CD)
- Error page design (-> 31 Error Pages)
- API route implementation (-> 25 API Design)
