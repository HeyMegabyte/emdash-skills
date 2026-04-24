---
name: "Auth and Session Management"
description: "Clerk Core 3 as the auth layer for all SaaS projects. Middleware patterns for Hono on CF Workers, webhook sync to D1, RBAC with org-scoped roles, protected route patterns, session token handling. Clerk CLI (init/config/api), API Keys GA (machine auth), SCIM/Directory Sync (roadmap, not GA). Covers signup/login flows, user metadata sync, impersonation, and MFA enforcement."
updated: "2026-04-24"
---

# Auth and Session Management (Clerk)

## Middleware Pattern (Hono + CF Workers)
```typescript
// src/middleware/auth.ts
import { clerkMiddleware, getAuth } from '@clerk/backend';

export const authMiddleware = () => {
  return async (c, next) => {
    const auth = getAuth(c.req.raw, { secretKey: c.env.CLERK_SECRET_KEY });
    const { userId, orgId, orgRole, sessionClaims } = await auth;
    c.set('auth', { userId, orgId, orgRole, sessionClaims });
    await next();
  };
};

// Protected route helper
export const requireAuth = () => async (c, next) => {
  const { userId } = c.get('auth');
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);
  await next();
};

export const requireRole = (role: string) => async (c, next) => {
  const { orgRole } = c.get('auth');
  if (orgRole !== role) return c.json({ error: 'Forbidden' }, 403);
  await next();
};
```

## Route Protection Layers
```
Public:       /health, /api/webhooks/*, marketing pages
Auth-only:    /api/user/*, /api/projects/* (any logged-in user)
Role-gated:   /api/admin/* (org:admin), /api/billing/* (org:admin|org:billing)
Owner-only:   /api/projects/:id/* (resource.userId === auth.userId)
```

## Webhook Sync (Clerk → D1)
```typescript
// src/routes/webhooks/clerk.ts — handles user.created, user.updated, user.deleted, org.*
webhooks.post('/clerk', async (c) => {
  const payload = await c.req.json();
  const svix = new Webhook(c.env.CLERK_WEBHOOK_SECRET);
  const evt = svix.verify(await c.req.text(), {
    'svix-id': c.req.header('svix-id')!,
    'svix-timestamp': c.req.header('svix-timestamp')!,
    'svix-signature': c.req.header('svix-signature')!,
  });

  switch (evt.type) {
    case 'user.created':
    case 'user.updated':
      await c.env.DB.prepare(
        `INSERT INTO users (id, email, name, avatar_url, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT (id) DO UPDATE SET email=?2, name=?3, avatar_url=?4, updated_at=?5`
      ).bind(evt.data.id, evt.data.email_addresses[0]?.email_address,
        `${evt.data.first_name} ${evt.data.last_name}`.trim(),
        evt.data.image_url, new Date().toISOString()).run();
      break;
    case 'user.deleted':
      await c.env.DB.prepare('UPDATE users SET deleted_at = ? WHERE id = ?')
        .bind(new Date().toISOString(), evt.data.id).run();
      break;
  }
  return c.json({ received: true });
});
```

## D1 Users Table (Drizzle)
```typescript
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),              // Clerk user ID (user_xxx)
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  role: text('role').default('member'),     // App-level roles in D1, NOT Clerk metadata
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
  deletedAt: text('deleted_at'),
});
```

## RBAC Pattern
Roles stored in D1 (not Clerk metadata) for query flexibility. Clerk org roles for org-scoped access. Pattern: Clerk JWT → extract userId → D1 lookup for app role → authorize.

Org hierarchy: `org:admin` > `org:member` > `org:viewer`. App roles: `superadmin` (Brian only) > `admin` > `member` > `viewer`.

## Session Tokens on CF Workers
Clerk JWT verified per-request (no session store needed). Short-lived tokens (60s) auto-refresh. For WebSocket/DO: verify JWT on connect, cache userId in DO state, re-verify on reconnect.

## Frontend (Angular)
```typescript
// Clerk Angular SDK: @clerk/clerk-angular (or @clerk/elements for headless)
// Route guard: inject ClerkService → check isSignedIn$ observable
// Protect routes: canActivate: [ClerkAuthGuard]
// Get user: inject ClerkService → user$ observable
```

## Clerk CLI (Apr 22, 2026)
`clerk init` — framework detect + scaffold (Angular/React/Next/Remix). `clerk config` — auth settings from terminal. `clerk api` — direct BAPI access for scripting. `clerk deploy` coming.
Install: `npm i -g @clerk/cli` or `npx @clerk/cli init`.

## API Keys GA (Apr 17, 2026)
Machine auth: users create delegated API keys for programmatic access. Use for: CI/CD integration, external service auth, customer API access. Verify: `clerk.apiKeys.verify(apiKey)`. Billing active — counts toward MAU.

## SCIM / Directory Sync (Roadmap — NOT GA)
On Clerk's roadmap for enterprise orgs — auto user create/update/deactivate from IdP (Okta, Azure AD, OneLogin, Google Workspace). NOT yet generally available as of April 2026. When GA: custom attribute mapping into `publicMetadata`, role assignment from IdP groups, no extra charge with enterprise connection. For now: use Clerk webhooks (`organizationMembership.created`/`deleted`) for JIT provisioning from IdP.

## Clerk Core 3 (Mar 3, 2026)
Theme editor for custom auth UI. Keyless mode (no CLERK_PUBLISHABLE_KEY needed in dev). Modern React compat improvements. Upgrade path: `npx @clerk/upgrade` runs codemods automatically.

## Checklist
- [ ] `CLERK_SECRET_KEY` + `CLERK_PUBLISHABLE_KEY` in wrangler.toml [vars]
- [ ] `CLERK_WEBHOOK_SECRET` for svix verification
- [ ] Webhook endpoint registered in Clerk dashboard (user.*, org.*, session.*, organizationMembership.*)
- [ ] D1 users table with Clerk ID as PK
- [ ] Middleware applied to all /api/* except /api/webhooks/* and /health
- [ ] Frontend route guards on protected pages
- [ ] MFA enforced for admin roles (Clerk dashboard setting)
- [ ] SCIM directory connection configured for enterprise customers (when GA — currently roadmap)
- [ ] API Keys enabled for programmatic access use cases
- [ ] Test: expired JWT returns 401, wrong org returns 403, deleted user returns 401
