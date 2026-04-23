---
name: "Service Worker and Offline"
version: "1.2.0"
updated: "2026-04-23"
description: "Workbox cache strategies: CacheFirst static (30-day), NetworkFirst API/HTML, offline fallback, background sync, push via Novu, Angular ngsw integration, CF Workers edge+client SW coordination."
---

# Service Worker and Offline
## Workbox Configuration (workbox-config.js)
```javascript
// workbox-config.js — Vite/webpack plugin feeds this
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,woff2,ico,png,svg}'],
  swDest: 'dist/sw.js',
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:js|css|woff2)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 100 },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxAgeSeconds: 90 * 24 * 60 * 60, maxEntries: 200 },
      },
    },
    {
      urlPattern: /\/api\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-responses',
        expiration: { maxAgeSeconds: 5 * 60, maxEntries: 50 },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: /\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages',
        expiration: { maxAgeSeconds: 24 * 60 * 60, maxEntries: 30 },
        networkTimeoutSeconds: 3,
      },
    },
  ],
};
```

## Service Worker Entry (sw.ts)
```typescript
// src/sw.ts — compiled by Workbox webpack/vite plugin
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// Precache critical shell (auto-injected by Workbox build)
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Static assets: CacheFirst, 30-day TTL
registerRoute(
  ({ request }) => ['script', 'style', 'font'].includes(request.destination),
  new CacheFirst({
    cacheName: 'static-v1',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 100 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// Images: CacheFirst, 90-day TTL (R2 URLs are content-addressed)
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-v1',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 90 * 24 * 60 * 60, maxEntries: 200 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
);

// API responses: NetworkFirst, 5-minute TTL
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-v1',
    networkTimeoutSeconds: 3,
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 5 * 60, maxEntries: 50 })],
  })
);

// Non-critical API: StaleWhileRevalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/public/'),
  new StaleWhileRevalidate({
    cacheName: 'api-public-v1',
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 15 * 60, maxEntries: 30 })],
  })
);

// HTML pages: NetworkFirst, fallback to cached shell
const htmlStrategy = new NetworkFirst({
  cacheName: 'pages-v1',
  networkTimeoutSeconds: 3,
  plugins: [new ExpirationPlugin({ maxAgeSeconds: 24 * 60 * 60, maxEntries: 30 })],
});

const navigationRoute = new NavigationRoute(htmlStrategy, {
  denylist: [/\/api\//, /\/admin\//],
});
registerRoute(navigationRoute);

// Background sync: queue failed form submissions, retry when online
const bgSyncPlugin = new BackgroundSyncPlugin('form-submissions', {
  maxRetentionTime: 24 * 60, // 24 hours in minutes
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
      } catch {
        await queue.unshiftRequest(entry);
        throw new Error('Replay failed');
      }
    }
  },
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/forms/'),
  new NetworkFirst({ plugins: [bgSyncPlugin] }),
  'POST'
);

// Offline fallback page
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html') as Promise<Response>)
    );
  }
});

// Immediate activation: skipWaiting + clients.claim
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
```

## Offline Fallback Page (offline.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline — Megabyte Labs</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #060610; color: #fff; font-family: 'Space Grotesk', system-ui; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-family: 'Sora', system-ui; font-size: 2rem; margin-bottom: 1rem; }
    p { color: #A0A0B8; margin-bottom: 2rem; }
    .accent { color: #00E5FF; }
    button { background: #00E5FF; color: #060610; border: none; padding: 12px 32px; font-size: 1rem; font-weight: 700; border-radius: 8px; cursor: pointer; }
    button:hover { background: #50AAE3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You're <span class="accent">offline</span></h1>
    <p>Check your connection and try again. Cached pages are still available.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>
```

## Angular Integration (ngsw-config.json)
```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "shell",
      "installMode": "prefetch",
      "updateMode": "prefetch",
      "resources": {
        "files": ["/index.html", "/main*.js", "/polyfills*.js", "/styles*.css"],
        "urls": ["/assets/fonts/*.woff2"]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "lazy",
      "resources": {
        "files": ["/assets/**", "/**/*.png", "/**/*.svg", "/**/*.ico"]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-fresh",
      "urls": ["/api/**"],
      "cacheConfig": { "strategy": "freshness", "maxAge": "5m", "maxSize": 50, "timeout": "3s" }
    },
    {
      "name": "api-cached",
      "urls": ["/api/public/**"],
      "cacheConfig": { "strategy": "performance", "maxAge": "15m", "maxSize": 30 }
    }
  ],
  "navigationUrls": ["/**", "!/api/**", "!/admin/**"],
  "navigationRequestStrategy": "freshness"
}
```

## Push Notifications (Novu Integration)
```typescript
// src/sw-push.ts — append to sw.ts or separate push handler
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'Megabyte Labs', body: 'New notification' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/icons/icon-192.png',
      badge: '/assets/icons/badge-72.png',
      data: { url: data.url || '/' },
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});
```

```typescript
// Server-side: trigger push via Novu
import { Novu } from '@novu/node';
const novu = new Novu(env.NOVU_API_KEY);

await novu.trigger('push-notification', {
  to: { subscriberId: userId },
  payload: { title: 'Update Available', body: 'New features shipped.', url: '/changelog' },
});
```

## SW Registration (main.ts)
```typescript
// Register service worker in Angular main.ts
if ('serviceWorker' in navigator && environment.production) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('/sw.js');
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
          // New version available — prompt user or auto-reload
          if (confirm('New version available. Reload?')) window.location.reload();
        }
      });
    });
  });
}
```

## CF Workers + Client SW Coordination
Edge Worker handles: routing, auth, cache headers, HTML streaming, API. Client SW handles: offline fallback, asset caching, background sync, push. No overlap — edge sets `Cache-Control`, client SW respects it. Edge never caches HTML (max-age=0), client SW caches shell for offline. Edge handles /api/ auth + rate limiting, client SW caches safe GET responses.

## Vite Plugin Setup
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      injectManifest: { globPatterns: ['**/*.{html,js,css,woff2,ico,png,svg}'] },
    }),
  ],
});
```
