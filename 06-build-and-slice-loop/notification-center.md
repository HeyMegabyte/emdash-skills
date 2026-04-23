---
name: "Notification Center"
version: "2.0.0"
updated: "2026-04-23"
description: "Novu for multi-channel notifications: in-app bell, push, email (via Resend), SMS. Notification center component, preference management, workflow triggers from Hono, subscriber management, template variables, digest/batching, and Angular 20 integration."
---

# Notification Center
## Novu Setup (Server-Side)
```typescript
// src/services/notifications.ts
import { Novu } from '@novu/node';

function createNovu(env: Env): Novu {
  return new Novu(env.NOVU_API_KEY);
}

// Create/update subscriber on user signup
async function syncSubscriber(user: { id: string; email: string; name: string; phone?: string }, env: Env): Promise<void> {
  const novu = createNovu(env);
  await novu.subscribers.identify(user.id, {
    email: user.email,
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    phone: user.phone,
    data: { plan: 'free' },
  });
}

// Trigger notification workflow
async function notify(subscriberId: string, workflowId: string, payload: Record<string, unknown>, env: Env): Promise<void> {
  const novu = createNovu(env);
  await novu.trigger(workflowId, {
    to: { subscriberId },
    payload,
  });
}

// Trigger to multiple subscribers (e.g. team notification)
async function notifyMany(subscriberIds: string[], workflowId: string, payload: Record<string, unknown>, env: Env): Promise<void> {
  const novu = createNovu(env);
  await novu.trigger(workflowId, {
    to: subscriberIds.map((id) => ({ subscriberId: id })),
    payload,
  });
}
```

## Hono Notification Routes
```typescript
// src/routes/notifications.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const notifications = new Hono<{ Bindings: Env }>();

// Trigger notification from API
notifications.post('/send', zValidator('json', z.object({
  subscriberId: z.string(),
  workflow: z.string(),
  payload: z.record(z.unknown()).optional(),
})), async (c) => {
  const { subscriberId, workflow, payload } = c.req.valid('json');
  await notify(subscriberId, workflow, payload || {}, c.env);
  return c.json({ sent: true });
});

// Get notification preferences
notifications.get('/preferences/:subscriberId', async (c) => {
  const novu = createNovu(c.env);
  const prefs = await novu.subscribers.getPreference(c.req.param('subscriberId'));
  return c.json(prefs.data);
});

// Update preferences
notifications.patch('/preferences/:subscriberId', zValidator('json', z.object({
  templateId: z.string(),
  channel: z.object({
    email: z.boolean().optional(),
    inApp: z.boolean().optional(),
    push: z.boolean().optional(),
    sms: z.boolean().optional(),
  }),
})), async (c) => {
  const novu = createNovu(c.env);
  const { templateId, channel } = c.req.valid('json');
  await novu.subscribers.updatePreference(c.req.param('subscriberId'), templateId, { channel });
  return c.json({ updated: true });
});

export { notifications };
```

## Notification Workflows (Novu Dashboard or code)
```typescript
// Workflow: welcome-email
// Channel: Email (via Resend integration)
// Template variables: {{firstName}}, {{productName}}, {{loginUrl}}

// Workflow: invoice-paid
// Channels: In-App + Email
// Digest: batch per subscriber, 1hr window
// Template: "{{count}} invoices paid totaling {{totalAmount}}"

// Workflow: team-invite
// Channels: Email + In-App
// Template: "{{inviterName}} invited you to {{teamName}}"

// Workflow: usage-alert
// Channels: In-App + Email + Push
// Template: "You've used {{percentage}}% of your {{resource}} quota"
```

## Novu + Resend Email Integration
```typescript
// In Novu Dashboard: Integrations → Email → Custom (Resend)
// Or configure via API:
async function setupResendIntegration(env: Env): Promise<void> {
  const novu = createNovu(env);
  await novu.integrations.create({
    providerId: 'resend',
    channel: 'email',
    credentials: { apiKey: env.RESEND_API_KEY, from: 'notifications@example.com' },
    active: true,
  });
}
```

## Angular In-App Notification Center
```typescript
// notification-bell.component.ts
import { Component, OnInit, signal, computed } from '@angular/core';

interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  cta?: { url: string; label: string };
}

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  template: `
    <button (click)="toggle()" class="bell-btn" [attr.aria-label]="'Notifications (' + unreadCount() + ' unread)'">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      @if (unreadCount() > 0) {
        <span class="badge">{{ unreadCount() > 99 ? '99+' : unreadCount() }}</span>
      }
    </button>
    @if (open()) {
      <div class="notification-panel" role="dialog" aria-label="Notifications">
        <div class="panel-header">
          <h3>Notifications</h3>
          <button (click)="markAllRead()">Mark all read</button>
        </div>
        <div class="panel-body">
          @for (n of notifications(); track n.id) {
            <div class="notification-item" [class.unread]="!n.read" (click)="onNotificationClick(n)">
              <strong>{{ n.title }}</strong>
              <p>{{ n.body }}</p>
              <time>{{ n.createdAt | date:'short' }}</time>
            </div>
          } @empty {
            <p class="empty">No notifications yet</p>
          }
        </div>
      </div>
    }
  `,
})
export class NotificationBellComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  open = signal(false);
  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  async ngOnInit(): Promise<void> {
    await this.fetchNotifications();
    // Poll every 30s or use WebSocket from realtime skill
    setInterval(() => this.fetchNotifications(), 30000);
  }

  toggle(): void { this.open.update((v) => !v); }

  async markAllRead(): Promise<void> {
    await fetch('/api/notifications/mark-read', { method: 'POST' });
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  onNotificationClick(n: Notification): void {
    if (n.cta?.url) window.location.href = n.cta.url;
    if (!n.read) this.markRead(n.id);
  }

  private async fetchNotifications(): Promise<void> {
    const res = await fetch('/api/notifications/feed');
    const data = await res.json();
    this.notifications.set(data.notifications);
  }

  private async markRead(id: string): Promise<void> {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    this.notifications.update((list) => list.map((n) => n.id === id ? { ...n, read: true } : n));
  }
}
```

## Digest/Batching Pattern
```typescript
// Novu workflow with digest step:
// 1. Trigger event fires per-item (e.g. each comment)
// 2. Digest step collects events for 1 hour
// 3. Single notification sent: "You have 5 new comments on Project X"
// Configure in Novu Dashboard: Add Digest Step → Regular → 1 hour
// Access digested events in template: {{#each events}} {{payload.comment}} {{/each}}
```
