---
name: "Uptime and Health"
description: "Health endpoints on every Worker, external uptime monitoring via free services (UptimeRobot, Better Stack). Public status page at /status. Cron-based self-checks. Let external services handle alerting — we just expose the endpoints and set up the monitors."---

# Uptime and Health

> Every Worker has a health endpoint. External services handle alerting.

---

## Health Endpoint (EVERY Worker)

```typescript
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    version: c.env.VERSION || 'unknown',
    timestamp: new Date().toISOString(),
    region: c.req.header('cf-ray')?.split('-')[1] || 'unknown',
  });
});

// Deep health check (optional — checks dependencies)
app.get('/health/deep', async (c) => {
  const checks: Record<string, string> = {};

  // D1
  try {
    await c.env.DB.prepare('SELECT 1').first();
    checks.d1 = 'ok';
  } catch { checks.d1 = 'error'; }

  // KV
  try {
    await c.env.KV.get('__health');
    checks.kv = 'ok';
  } catch { checks.kv = 'error'; }

  // R2
  try {
    await c.env.R2.head('__health');
    checks.r2 = 'ok';
  } catch { checks.r2 = 'ok'; } // head returns null for missing, not error

  const allOk = Object.values(checks).every(v => v === 'ok');
  return c.json({ status: allOk ? 'ok' : 'degraded', checks }, allOk ? 200 : 503);
});
```

## External Monitoring (Let Others Handle It)

### UptimeRobot (Free — 50 monitors)
Set up via their dashboard or API:
- Monitor: `https://domain.com/health`
- Interval: 5 minutes
- Alert: email to brian@megabyte.space

### Better Stack (Free tier)
Better UI, incident management, status pages.
- Monitor: `https://domain.com/health`
- Status page: auto-generated

### Cloudflare Health Checks (Built-in)
If using Cloudflare Load Balancing, health checks are built in.

## Status Page (Optional)

```typescript
app.get('/status', async (c) => {
  const health = await fetch(`https://${c.env.DOMAIN}/health/deep`).then(r => r.json());
  return c.html(renderStatusPage(health));
});
```

Simple status page showing:
- Overall status (operational / degraded / down)
- Individual service checks (D1, KV, R2)
- Last checked timestamp
- Uptime percentage (from KV counter)

## Cron Self-Check (Optional)

```typescript
// wrangler.toml: [triggers] crons = ["*/5 * * * *"]
export default {
  async scheduled(event, env, ctx) {
    const res = await fetch(`https://${env.DOMAIN}/health`);
    if (!res.ok) {
      // Alert via Resend
      await new Resend(env.RESEND_API_KEY).emails.send({
        from: 'Monitor <alerts@megabyte.space>',
        to: ['brian@megabyte.space'],
        subject: `⚠️ ${env.DOMAIN} is down`,
        html: `Health check failed with status ${res.status}`,
      });
    }
  },
};
```

---

## MCP Tools Available

### Coolify MCP (`mcp__coolify__*`) — for self-hosted service health
| Tool | Purpose |
|------|---------|
| `mcp__coolify__diagnose_app` | Diagnose a Coolify-hosted app (Postiz, Listmonk, PostHog, etc.) |
| `mcp__coolify__diagnose_server` | Check overall server health (CPU, memory, disk) |
| `mcp__coolify__get_infrastructure_overview` | Full infrastructure summary — all apps, DBs, services |
| `mcp__coolify__application_logs` | Pull recent logs for a specific application |
| `mcp__coolify__find_issues` | Auto-detect issues across all services |
| `mcp__coolify__validate_server` | Validate server configuration and connectivity |
| `mcp__coolify__list_applications` | List all running applications with status |
| `mcp__coolify__control` | Start/stop/restart any Coolify service |

### Cloudflare MCP (`mcp__claude_ai_Cloudflare_Developer_Platform__*`)
| Tool | Purpose |
|------|---------|
| `mcp__claude_ai_Cloudflare_Developer_Platform__workers_list` | List all Workers to verify they're deployed |
| `mcp__claude_ai_Cloudflare_Developer_Platform__workers_get_worker` | Check a specific Worker's status |

### Playwright MCP (`mcp__playwright__*`) — for visual health verification
| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to `/health` or `/status` endpoint |
| `mcp__playwright__browser_take_screenshot` | Screenshot the status page for visual verification |

## Health Endpoint Schema (Strict)

Every Worker MUST return this exact JSON shape from `/health`:

```typescript
interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;          // semver from wrangler.toml or env
  timestamp: string;        // ISO 8601
  region: string;           // Cloudflare colo code from cf-ray header
  uptime?: number;          // seconds since last restart (optional)
}

interface DeepHealthResponse extends HealthResponse {
  checks: Record<string, 'ok' | 'error' | 'timeout'>;
  // Each key is a dependency: 'd1', 'kv', 'r2', 'stripe', 'postiz', etc.
}
```

Rules:
- `/health` returns 200 for `ok`, 503 for `degraded` or `error`
- Response time must be < 500ms (no heavy queries in shallow health)
- `/health/deep` may take up to 5s (checks external dependencies)
- Never expose secrets, internal IPs, or stack traces in health responses

## Monitoring Integration Patterns

### Pattern 1: Coolify + Cloudflare Workers (hybrid)
```
Coolify services (Postiz, Listmonk, PostHog)
  → mcp__coolify__diagnose_app per service
  → mcp__coolify__find_issues for cross-service problems

Cloudflare Workers (site, API)
  → fetch /health endpoint directly
  → mcp__claude_ai_Cloudflare_Developer_Platform__workers_get_worker for deploy status
```

### Pattern 2: Cron self-check with escalation
```
Every 5 min: Worker cron hits /health
  → OK: log to KV (increment uptime counter)
  → FAIL: send Resend alert + log to KV
  → 3 consecutive FAILs: escalate (post to Slack via mcp__claude_ai_Slack__slack_send_message)
```

## Computer Use Integration

Use `mcp__computer-use__*` for visual verification of monitoring dashboards:

1. **Better Stack dashboard** — Screenshot the status page to verify all monitors show green
2. **UptimeRobot dashboard** — Visual check that no monitors are in alert state
3. **Coolify dashboard** — Screenshot `https://coolify.megabyte.space` to see all service health at a glance

Best used during: incident investigation, post-deploy verification, weekly health audits.

## Acceptance Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | `/health` returns 200 with valid JSON | `curl /health` returns `{ status: 'ok', version, timestamp, region }` |
| 2 | `/health` responds in < 500ms | `curl -w '%{time_total}' /health` < 0.5 |
| 3 | `/health/deep` checks all dependencies | Response `checks` object has keys for every bound resource (D1, KV, R2) |
| 4 | 503 returned when any dependency is down | Kill a dependency, confirm status flips to `degraded` and HTTP 503 |
| 5 | Cron self-check fires every 5 minutes | Check KV uptime counter increments every 5 min |
| 6 | Alert email sent on failure | Simulate failure, confirm Resend email arrives within 5 minutes |
| 7 | External monitor configured | UptimeRobot or Better Stack has an active monitor for `/health` |
| 8 | Status page renders correctly | Playwright screenshot of `/status` shows current health, no errors |
