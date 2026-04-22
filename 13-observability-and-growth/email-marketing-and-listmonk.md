---
name: "Email Marketing and Listmonk"
description: "Listmonk on Coolify for newsletters and campaigns. REST API for subscriber management and campaign creation, Go template system, webhook integration with Hono for subscription events, double opt-in flow, unsubscribe handling, and Neon PostgreSQL backend."---

# Email Marketing and Listmonk
## Coolify Deployment
```yaml
# Listmonk on Coolify: Docker compose
# Image: listmonk/listmonk:latest
# Database: Neon PostgreSQL (external)
# Domain: listmonk.megabyte.space (proxied via CF)
# Env vars:
#   LISTMONK_app__address: "0.0.0.0:9000"
#   LISTMONK_app__admin_username: (from Coolify secrets)
#   LISTMONK_app__admin_password: (from Coolify secrets)
#   LISTMONK_db__host: (Neon host)
#   LISTMONK_db__port: 5432
#   LISTMONK_db__user: (Neon user)
#   LISTMONK_db__password: (Neon password)
#   LISTMONK_db__database: listmonk
#   LISTMONK_db__ssl_mode: require
```

## Hono Worker Proxy (CF Worker → Listmonk)
```typescript
// src/routes/newsletter.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const newsletter = new Hono<{ Bindings: Env }>();

const listmonkFetch = async (env: Env, path: string, options?: RequestInit) => {
  const auth = btoa(`${env.LISTMONK_USER}:${env.LISTMONK_PASS}`);
  return fetch(`${env.LISTMONK_URL}/api${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
  });
};

// Subscribe (public endpoint — Turnstile protected)
newsletter.post('/subscribe', zValidator('json', z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100).optional(),
  listIds: z.array(z.number()).default([1]), // default newsletter list
  turnstileToken: z.string(),
})), async (c) => {
  const { email, name, listIds, turnstileToken } = c.req.valid('json');

  // Verify Turnstile
  const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: c.env.TURNSTILE_SECRET, response: turnstileToken }),
  });
  const turnstile = await turnstileRes.json() as { success: boolean };
  if (!turnstile.success) return c.json({ error: 'Verification failed' }, 400);

  // Create subscriber (double opt-in)
  const res = await listmonkFetch(c.env, '/subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email,
      name: name || email.split('@')[0],
      status: 'enabled',
      lists: listIds,
      preconfirm_subscriptions: false, // requires double opt-in confirmation
    }),
  });

  if (!res.ok) {
    const err = await res.json() as { message: string };
    if (err.message?.includes('already exists')) {
      return c.json({ message: 'Already subscribed' });
    }
    return c.json({ error: 'Subscription failed' }, 500);
  }

  return c.json({ message: 'Check your email to confirm' });
});

// Unsubscribe
newsletter.post('/unsubscribe', zValidator('json', z.object({
  email: z.string().email(),
})), async (c) => {
  const { email } = c.req.valid('json');

  // Find subscriber
  const search = await listmonkFetch(c.env, `/subscribers?query=subscribers.email='${encodeURIComponent(email)}'`);
  const { data } = await search.json() as { data: { results: Array<{ id: number }> } };
  if (!data.results?.length) return c.json({ message: 'Unsubscribed' });

  // Blocklist subscriber
  await listmonkFetch(c.env, `/subscribers/${data.results[0].id}/blocklist`, { method: 'PUT' });
  return c.json({ message: 'Unsubscribed' });
});

// List available newsletter lists (public)
newsletter.get('/lists', async (c) => {
  const res = await listmonkFetch(c.env, '/lists?page=1&per_page=50');
  const { data } = await res.json() as { data: { results: Array<{ id: number; name: string; description: string }> } };
  return c.json({ lists: data.results.map(({ id, name, description }) => ({ id, name, description })) });
});

export { newsletter };
```

## Campaign Creation via API
```typescript
// Create and send a campaign programmatically
async function createCampaign(env: Env, opts: {
  name: string;
  subject: string;
  body: string;
  listIds: number[];
  templateId?: number;
  sendAt?: string; // ISO date for scheduled send
}): Promise<number> {
  const res = await listmonkFetch(env, '/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      name: opts.name,
      subject: opts.subject,
      body: opts.body,
      content_type: 'richtext',
      lists: opts.listIds,
      template_id: opts.templateId || 1,
      type: 'regular',
      tags: ['automated'],
      send_at: opts.sendAt,
    }),
  });
  const { data } = await res.json() as { data: { id: number } };

  // Start the campaign
  await listmonkFetch(env, `/campaigns/${data.id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'running' }),
  });

  return data.id;
}
```

## Go Template System (Listmonk)
```html
<!-- Listmonk uses Go's text/template syntax -->
<!-- Available variables: .Subscriber, .Campaign, .UnsubscribeURL, .TrackLink -->

<!-- Campaign template -->
<h1>{{ .Campaign.Subject }}</h1>
<p>Hey {{ .Subscriber.FirstName }},</p>

{{ .Campaign.Body }}

<!-- Conditional content by subscriber attribute -->
{{ if eq .Subscriber.Attribs.plan "pro" }}
  <p>As a Pro member, you get early access.</p>
{{ else }}
  <p><a href="{{ TrackLink "https://example.com/upgrade" }}">Upgrade to Pro</a> for early access.</p>
{{ end }}

<!-- Tracked link -->
<a href="{{ TrackLink "https://example.com/feature" }}">Check out our new feature</a>

<!-- Unsubscribe (REQUIRED) -->
<p><a href="{{ .UnsubscribeURL }}">Unsubscribe</a></p>

<!-- Custom template with brand styling -->
<!-- Base template wraps all campaigns with header/footer/brand colors -->
```

## Webhook Integration (Listmonk → Hono)
```typescript
// src/routes/webhooks/listmonk.ts
// Listmonk webhook events: subscriber.created, subscriber.modified, subscriber.deleted
// campaign.sent, campaign.updated

const listmonkWebhook = new Hono<{ Bindings: Env }>();

listmonkWebhook.post('/listmonk', async (c) => {
  // Verify webhook secret
  const secret = c.req.header('X-Listmonk-Secret');
  if (secret !== c.env.LISTMONK_WEBHOOK_SECRET) {
    return c.json({ error: 'Invalid secret' }, 401);
  }

  const event = await c.req.json();

  switch (event.event) {
    case 'subscriber.created':
      // Sync to CRM, PostHog, etc.
      // posthog.capture('newsletter_signup', { email: event.data.email });
      break;
    case 'subscriber.modified':
      if (event.data.status === 'blocklisted') {
        // Track unsubscribe
        // posthog.capture('newsletter_unsubscribe', { email: event.data.email });
      }
      break;
    case 'campaign.sent':
      // Track campaign completion
      break;
  }

  return c.json({ received: true });
});

export { listmonkWebhook };
```

## Double Opt-In Flow
```
1. User submits email → POST /api/newsletter/subscribe
2. Listmonk creates subscriber (status: unconfirmed)
3. Listmonk sends confirmation email with unique link
4. User clicks confirmation link → status: confirmed
5. Subscriber receives future campaigns
6. No confirmation within 72h → auto-cleanup (Listmonk setting)
```

## Footer Newsletter Component
```html
<!-- Minimal newsletter signup for site footer -->
<form (submit)="subscribe($event)" class="newsletter-form">
  <input type="email" [(ngModel)]="email" placeholder="your@email.com" required />
  <button type="submit" [disabled]="submitting">Subscribe</button>
  <cf-turnstile [siteKey]="turnstileSiteKey" (resolved)="onTurnstile($event)" />
  @if (message) { <p class="feedback">{{ message }}</p> }
</form>
```

## Listmonk API Quick Reference
```
GET  /api/subscribers?query=...&page=1&per_page=50  — search subscribers
POST /api/subscribers                                 — create subscriber
PUT  /api/subscribers/:id                             — update subscriber
PUT  /api/subscribers/:id/blocklist                   — blocklist (unsubscribe)
GET  /api/lists                                       — list all lists
POST /api/campaigns                                   — create campaign
PUT  /api/campaigns/:id/status                        — start/pause/cancel campaign
GET  /api/campaigns/:id                               — campaign details + stats
POST /api/tx                                          — send transactional email
```
