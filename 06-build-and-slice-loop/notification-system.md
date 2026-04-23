---
name: "Notification System"
version: "2.0.0"
updated: "2026-04-23"
description: "OneSignal web push notifications for product updates, donation milestones, and new content. In-app notification bell for SaaS products with unread count badge. Notification preferences per user. Stored in D1, delivered via push + email fallback. Use when product has returning users who benefit from updates."
---

# Notification System
## When to Include
- SaaS products where users return regularly
- Donation campaigns with milestones
- Products with content updates (blog, features)
- NOT for: simple marketing sites with no return visitors

## Architecture
```
Event occurs → Create notification in D1 → Push via OneSignal + Email via Resend
                                         → Show in-app notification bell
```

## Web Push (OneSignal)
### Setup
```html
<!-- OneSignal SDK -->
<script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
<script>
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  OneSignalDeferred.push(async function(OneSignal) {
    await OneSignal.init({
      appId: "YOUR_ONESIGNAL_APP_ID",
      notifyButton: { enable: false }, // We use custom UI
      welcomeNotification: { disable: true },
    });
  });
</script>
```

### Request Permission (After Value Moment)
```javascript
// Don't ask on first visit — ask after the user gets value
async function requestPushPermission() {
  const permission = await OneSignal.Notifications.permission;
  if (!permission) {
    // Show custom prompt explaining value
    showPushPrompt();
  }
}

// Trigger after: first donation, first feature use, 3rd visit
function showPushPrompt() {
  const prompt = document.createElement('div');
  prompt.innerHTML = `
    <div class="push-prompt">
      <h4>Stay in the loop</h4>
      <p>Get notified about donation milestones and new features.</p>
      <button onclick="OneSignal.Notifications.requestPermission(); this.closest('.push-prompt').remove();">Enable Notifications</button>
      <button onclick="this.closest('.push-prompt').remove();">Not now</button>
    </div>
  `;
  document.body.appendChild(prompt);
}
```

### Send Push from Worker
```typescript
async function sendPushNotification(env: Env, title: string, message: string, url: string) {
  await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${env.ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: { en: title },
      contents: { en: message },
      url,
    }),
  });
}
```

## In-App Notification Bell
### D1 Schema
```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- null for broadcast notifications
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  url TEXT,
  read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_notifications_user ON notifications(user_id, read);
```

### API
```typescript
// Get unread notifications
app.get('/api/notifications', async (c) => {
  const userId = c.get('userId'); // from auth middleware
  const notifications = await db.select().from(notificationsTable)
    .where(and(
      or(eq(notificationsTable.userId, userId), isNull(notificationsTable.userId)),
      eq(notificationsTable.read, 0)
    ))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(20);
  return c.json({ notifications, unreadCount: notifications.length });
});

// Mark as read
app.post('/api/notifications/:id/read', async (c) => {
  await db.update(notificationsTable)
    .set({ read: 1 })
    .where(eq(notificationsTable.id, c.req.param('id')));
  return c.json({ success: true });
});
```

### Bell UI
```html
<button class="notification-bell" onclick="toggleNotifications()" aria-label="Notifications">
  🔔
  <span class="notification-badge" id="notifBadge" hidden>0</span>
</button>
<div id="notifDropdown" class="notif-dropdown" hidden>
  <div class="notif-header">
    <h4>Notifications</h4>
    <button onclick="markAllRead()">Mark all read</button>
  </div>
  <ul id="notifList" class="notif-list">
    <!-- Populated dynamically -->
  </ul>
</div>
```

## Notification Types
| Event | Push | In-App | Email |
|-------|------|--------|-------|
| Donation goal reached | Yes | Yes | Yes |
| New blog post | Yes | Yes | No |
| Feature update | Yes | Yes | No |
| Account activity | No | Yes | Yes |
| Weekly digest | No | No | Yes |
| Testimonial approved | No | Yes | Yes |

## User Preferences
Let users control what they receive:
```sql
CREATE TABLE notification_preferences (
  user_id TEXT PRIMARY KEY,
  push_enabled INTEGER DEFAULT 1,
  email_enabled INTEGER DEFAULT 1,
  push_milestones INTEGER DEFAULT 1,
  push_content INTEGER DEFAULT 1,
  email_digest INTEGER DEFAULT 1
);
```

## Best Practices
- Never ask for push permission on first visit (ask after value moment)
- Limit to 2-3 pushes per week maximum
- Always include an unsubscribe/preference link
- In-app notifications clear on click
- Badge count updates in real-time (or on page load)
- Email fallback for critical notifications when push is disabled
