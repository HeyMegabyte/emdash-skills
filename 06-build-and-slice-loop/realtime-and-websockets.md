---
name: "Realtime and WebSockets"
version: "2.0.0"
updated: "2026-04-23"
description: "Cloudflare Durable Objects for WebSocket-based realtime features. DO class with session handling, broadcast, presence tracking, typing indicators, live cursors. Client reconnection with exponential backoff. Hibernation API for cost optimization. 32 MiB WebSocket message size limit."
---

# Realtime and WebSockets
## Durable Object WebSocket Handler
```typescript
// src/do/room.ts
import { DurableObject } from 'cloudflare:workers';

interface Session {
  ws: WebSocket;
  userId: string;
  name: string;
  cursor?: { x: number; y: number };
  lastSeen: number;
}

export class Room extends DurableObject {
  private sessions = new Map<WebSocket, Session>();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected WebSocket', { status: 426 });
      }
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const userId = url.searchParams.get('userId') || 'anon';
      const name = url.searchParams.get('name') || 'Anonymous';

      this.ctx.acceptWebSocket(server); // Hibernation API
      this.sessions.set(server, { ws: server, userId, name, lastSeen: Date.now() });

      // Announce join
      this.broadcast({ type: 'user:join', userId, name, users: this.getPresence() }, server);

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  // Hibernation API — only runs when messages arrive
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    const session = this.sessions.get(ws);
    if (!session) return;
    session.lastSeen = Date.now();

    const msg = JSON.parse(raw as string);

    switch (msg.type) {
      case 'chat':
        this.broadcast({ type: 'chat', userId: session.userId, name: session.name, text: msg.text, ts: Date.now() });
        break;
      case 'typing':
        this.broadcast({ type: 'typing', userId: session.userId, name: session.name }, ws);
        break;
      case 'cursor':
        session.cursor = msg.position;
        this.broadcast({ type: 'cursor', userId: session.userId, position: msg.position }, ws);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    const session = this.sessions.get(ws);
    if (session) {
      this.sessions.delete(ws);
      this.broadcast({ type: 'user:leave', userId: session.userId, users: this.getPresence() });
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws);
  }

  private broadcast(msg: unknown, exclude?: WebSocket): void {
    const data = JSON.stringify(msg);
    for (const [ws] of this.sessions) {
      if (ws !== exclude && ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }

  private getPresence(): Array<{ userId: string; name: string }> {
    return [...this.sessions.values()].map(({ userId, name }) => ({ userId, name }));
  }
}
```

## Wrangler Config
```toml
[[durable_objects.bindings]]
name = "ROOM"
class_name = "Room"

[[migrations]]
tag = "v1"
new_classes = ["Room"]
```

## Worker Router (connect client to DO)
```typescript
// src/routes/realtime.ts
import { Hono } from 'hono';

const realtime = new Hono<{ Bindings: Env }>();

realtime.get('/room/:roomId', async (c) => {
  const roomId = c.req.param('roomId');
  const id = c.env.ROOM.idFromName(roomId);
  const stub = c.env.ROOM.get(id);
  // Forward the WebSocket upgrade request to the DO
  return stub.fetch(new Request(new URL(`/ws?${new URL(c.req.url).searchParams}`, c.req.url), {
    headers: c.req.raw.headers,
  }));
});

export { realtime };
```

## Client Reconnection with Exponential Backoff
```typescript
// realtime.service.ts — Angular 20 signals
import { Injectable, OnDestroy, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectAttempt = 0;
  private maxReconnect = 5;
  private destroyed = false;

  readonly connected = signal(false);
  readonly lastMessage = signal<unknown>(null);
  readonly presence = signal<Array<{ userId: string; name: string }>>([]);
  readonly userCount = computed(() => this.presence().length);

  connect(roomId: string, userId: string, name: string): void {
    this.doConnect(roomId, userId, name);
  }

  send(msg: unknown): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    this.destroyed = true;
    this.ws?.close();
    this.connected.set(false);
  }

  ngOnDestroy(): void { this.disconnect(); }

  private doConnect(roomId: string, userId: string, name: string): void {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const url = `${protocol}//${location.host}/api/realtime/room/${roomId}?userId=${userId}&name=${encodeURIComponent(name)}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => { this.reconnectAttempt = 0; this.connected.set(true); };

    this.ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === 'pong') return;
      this.lastMessage.set(msg);
      if (msg.users) this.presence.set(msg.users);
    };

    this.ws.onclose = () => {
      this.connected.set(false);
      if (this.destroyed || this.reconnectAttempt >= this.maxReconnect) return;
      const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30000);
      this.reconnectAttempt++;
      setTimeout(() => this.doConnect(roomId, userId, name), delay);
    };

    this.ws.onerror = () => this.ws?.close();

    // Keepalive ping every 30s
    const ping = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(ping);
      }
    }, 30000);
  }
}
```

## Typing Indicator Pattern
```typescript
// Component usage
private typingTimeout: ReturnType<typeof setTimeout> | null = null;

onInput(): void {
  this.realtime.send({ type: 'typing' });
  // Auto-clear after 2s of no typing
  if (this.typingTimeout) clearTimeout(this.typingTimeout);
  this.typingTimeout = setTimeout(() => this.realtime.send({ type: 'stop-typing' }), 2000);
}

// Display: "Alice is typing..." with 3s auto-dismiss
```

## Live Cursors Pattern
```typescript
// Track mouse position, throttle to 50ms
@HostListener('mousemove', ['$event'])
onMouseMove(e: MouseEvent): void {
  this.throttledSend({ type: 'cursor', position: { x: e.clientX, y: e.clientY } });
}

// Render other users' cursors as colored SVG arrows with name labels
// Each user gets a unique color from a predefined palette
```

## Hibernation API Cost Optimization
```
Hibernation API: DO "sleeps" when no messages pending.
- No compute charge during hibernation
- webSocketMessage/webSocketClose wake the DO on demand
- Use ctx.acceptWebSocket(ws) instead of manual ws.accept()
- State persists across hibernation cycles via ctx.storage
- Ideal for rooms with sporadic activity (most chat rooms)
```
