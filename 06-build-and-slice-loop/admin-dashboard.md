---
name: "Admin Dashboard"
version: "2.0.0"
updated: "2026-04-23"
description: "Lightweight /admin panel for content moderation and data review. Embedded bolt.diy editor (editor.projectsites.dev) iframe for code management. D1-backed with basic auth or Clerk. Manages testimonials, feedback, blog posts, newsletter subscribers, and webhook logs. Not a full CMS — just enough to moderate and review."
---

# Admin Dashboard
## Philosophy
This is NOT a full CMS or code editor. Code management happens through the embedded bolt.diy editor at editor.projectsites.dev. The admin dashboard is for:
- Moderating user-submitted content (testimonials, feedback)
- Reviewing webhook event logs
- Managing newsletter subscribers
- Quick data overview (donation totals, user counts)
- Blog post draft review (if blog uses D1)

## Architecture
```
/admin          → Dashboard overview (auth-protected)
/admin/feedback → Manage feedback submissions
/admin/testimonials → Approve/reject testimonials
/admin/webhooks → View webhook event log
/admin/subscribers → Newsletter subscriber list
/admin/editor   → Embedded bolt.diy iframe
```

## Auth Protection
```typescript
// Simple admin auth middleware
app.use('/admin/*', async (c, next) => {
  // Option 1: Clerk — check admin role
  const clerkUser = await verifyClerkToken(c);
  if (clerkUser?.role !== 'admin') return c.redirect('/');

  // Option 2: Basic auth (simpler projects)
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Basic ${btoa(`admin:${c.env.ADMIN_PASSWORD}`)}`) {
    return c.text('Unauthorized', 401, { 'WWW-Authenticate': 'Basic' });
  }

  await next();
});
```

## Dashboard Overview
```typescript
app.get('/admin', async (c) => {
  const db = drizzle(c.env.DB);
  const stats = {
    totalUsers: await db.select({ count: sql`count(*)` }).from(users).then(r => r[0].count),
    pendingFeedback: await db.select({ count: sql`count(*)` }).from(feedback).where(eq(feedback.status, 'pending')).then(r => r[0].count),
    pendingTestimonials: await db.select({ count: sql`count(*)` }).from(testimonials).where(eq(testimonials.status, 'pending')).then(r => r[0].count),
    totalDonations: await db.select({ sum: sql`sum(amount)` }).from(donations).then(r => r[0].sum || 0),
    recentWebhooks: await db.select().from(webhookEvents).orderBy(desc(webhookEvents.processedAt)).limit(5),
  };
  return c.html(renderAdminDashboard(stats));
});
```

## Content Moderation
### Feedback Review
```typescript
app.get('/admin/feedback', async (c) => {
  const items = await db.select().from(feedback).orderBy(desc(feedback.createdAt)).limit(50);
  return c.html(renderFeedbackList(items));
});

app.post('/admin/feedback/:id/approve', async (c) => {
  await db.update(feedback).set({ status: 'approved' }).where(eq(feedback.id, c.req.param('id')));
  return c.redirect('/admin/feedback');
});

app.post('/admin/feedback/:id/reject', async (c) => {
  await db.update(feedback).set({ status: 'rejected' }).where(eq(feedback.id, c.req.param('id')));
  return c.redirect('/admin/feedback');
});
```

### Testimonial Moderation
Same pattern. Approved testimonials display on the homepage (skill 09 social proof).

## Embedded AI Editor
```html
<!-- /admin/editor page -->
<div class="editor-container" style="height: calc(100vh - 60px);">
  <iframe
    src="https://editor.projectsites.dev?project=${encodeURIComponent(domain)}"
    style="width: 100%; height: 100%; border: none;"
    allow="clipboard-read; clipboard-write"
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  ></iframe>
</div>
```

All code changes, feature additions, and refactors go through this editor. The admin dashboard just handles data moderation.

## Design
- Dark theme matching the site (#060610 background)
- Simple table layouts with approve/reject action buttons
- No heavy frameworks — server-rendered HTML from Hono
- Mobile-friendly (responsive tables collapse to cards)
- Navigation sidebar: Overview, Chat, Feedback, Testimonials, Webhooks, Subscribers, Editor

## AI Chat Interface (Build Critique Assistant)
Every admin dashboard includes an AI chat for discussing post-build critiques.

### Features
- Claude-powered responses via Cloudflare Worker proxy to Anthropic API
- Pre-loaded with the latest post-build critique as the first message
- User can ask follow-up questions about quality issues
- Supports markdown rendering in responses
- Message history stored in D1

### Implementation
```typescript
app.post('/admin/chat', async (c) => {
  const key = c.req.query('key');
  if (key !== c.env.ADMIN_KEY) return c.json({ error: 'Unauthorized' }, 401);

  const { message, history } = await c.req.json();
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': c.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are the build assistant for this website. Help the admin understand and act on post-build critiques.',
      messages: history,
    }),
  });
  return c.json(await response.json());
});
```

### Quick Actions Panel
- Purge CDN cache (Cloudflare API)
- Run Playwright tests
- View latest Lighthouse report
- View analytics dashboard link (PostHog)

### Post-Build Notification
After every deploy, send critique email via Resend:
- Include link to admin dashboard for follow-up
- Severity levels: CRITICAL (blocks launch), WARNING (should fix), INFO (nice to have)
