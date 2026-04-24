---
name: "Sentry Alert Rules"
description: "Auto-configure Sentry alert rules at first deploy. Error spike detection, new issue alerts, unhandled rejection tracking, P95 latency monitoring, Slack integration, per-project rules, and deploy silence windows. All via Sentry API."
updated: "2026-04-23"
---

# Sentry Alert Rules

Every deployed project gets four alert rules automatically at first deploy. Per-project (not global) — each domain gets its own rules. All alerts route to Slack #emdash-alerts.

## Alert Rule Set

### 1. Error Spike (Critical)

Fires when error rate exceeds 5x the normal baseline within a 5-minute window.

```json
{
  "name": "[{project}] Error Spike",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 300,
  "conditions": [{
    "id": "sentry.rules.conditions.event_frequency.EventFrequencyPercentCondition",
    "interval": "5m",
    "value": 500,
    "comparisonType": "percent",
    "comparisonInterval": "1h"
  }],
  "actions": [{
    "id": "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
    "workspace": "{slack_workspace_id}",
    "channel": "#emdash-alerts",
    "tags": "environment,release,url"
  }],
  "environment": "production"
}
```

### 2. New Issue (Low Priority)

First occurrence of any new error. Grouped so repeat triggers don't spam.

```json
{
  "name": "[{project}] New Issue",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 1800,
  "conditions": [{
    "id": "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition"
  }],
  "filters": [{
    "id": "sentry.rules.filters.level.LevelFilter",
    "match": "gte",
    "level": "warning"
  }],
  "actions": [{
    "id": "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
    "workspace": "{slack_workspace_id}",
    "channel": "#emdash-alerts",
    "tags": "environment,browser,os"
  }],
  "environment": "production"
}
```

### 3. Unhandled Rejection (High Priority)

Any unhandled promise rejection or uncaught exception. Immediate notification.

```json
{
  "name": "[{project}] Unhandled Rejection",
  "actionMatch": "all",
  "filterMatch": "all",
  "frequency": 60,
  "conditions": [{
    "id": "sentry.rules.conditions.every_event.EveryEventCondition"
  }],
  "filters": [{
    "id": "sentry.rules.filters.tagged_event.TaggedEventFilter",
    "key": "mechanism",
    "match": "eq",
    "value": "unhandledrejection"
  }],
  "actions": [{
    "id": "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
    "workspace": "{slack_workspace_id}",
    "channel": "#emdash-alerts",
    "tags": "environment,url,release"
  }],
  "environment": "production"
}
```

### 4. P95 Latency (Warning)

P95 response time exceeds 500ms for 10 consecutive minutes.

```json
{
  "name": "[{project}] P95 Latency",
  "dataset": "transactions",
  "aggregate": "p95(transaction.duration)",
  "query": "",
  "timeWindow": 10,
  "triggers": [{
    "label": "critical",
    "alertThreshold": 500,
    "actions": [{
      "type": "slack",
      "targetIdentifier": "#emdash-alerts",
      "integrationId": "{slack_integration_id}"
    }]
  }, {
    "label": "resolved",
    "alertThreshold": 300,
    "actions": [{
      "type": "slack",
      "targetIdentifier": "#emdash-alerts",
      "integrationId": "{slack_integration_id}"
    }]
  }],
  "environment": "production"
}
```

## API Configuration

All rules created via Sentry API. Base URL: `https://sentry.megabyte.space` (self-hosted).

### Create Issue Alert

```bash
curl -X POST "https://sentry.megabyte.space/api/0/projects/{org}/{project}/rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...rule JSON...}'
```

### Create Metric Alert (P95 Latency)

```bash
curl -X POST "https://sentry.megabyte.space/api/0/projects/{org}/{project}/alert-rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...metric alert JSON...}'
```

Issue alerts → `/rules/`. Metric alerts → `/alert-rules/`. Different endpoints.

## Slack Integration Setup

```bash
# 1. Get integration ID (one-time, reuse across projects)
curl "https://sentry.megabyte.space/api/0/organizations/{org}/integrations/?provider_key=slack" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN"

# 2. Extract integrationId and workspace ID from response
# 3. Use in alert rule actions
```

Slack app must be installed in workspace first via Sentry Settings > Integrations > Slack.

## Orchestration Function

```typescript
async function configureSentryAlerts(project: string, org: string = 'emdash'): Promise<void> {
  const baseUrl = 'https://sentry.megabyte.space/api/0';
  const headers = {
    'Authorization': `Bearer ${env.SENTRY_AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Get Slack integration ID (cached after first call)
  const integrations = await fetch(`${baseUrl}/organizations/${org}/integrations/?provider_key=slack`, { headers });
  const slackIntegration = (await integrations.json())[0];
  const slackId = slackIntegration.id;
  const workspaceId = slackIntegration.externalId;

  // Create all 4 rules in parallel
  const issueRulesUrl = `${baseUrl}/projects/${org}/${project}/rules/`;
  const metricRulesUrl = `${baseUrl}/projects/${org}/${project}/alert-rules/`;

  await Promise.all([
    fetch(issueRulesUrl, { method: 'POST', headers, body: JSON.stringify(errorSpikeRule(project, workspaceId)) }),
    fetch(issueRulesUrl, { method: 'POST', headers, body: JSON.stringify(newIssueRule(project, workspaceId)) }),
    fetch(issueRulesUrl, { method: 'POST', headers, body: JSON.stringify(unhandledRejectionRule(project, workspaceId)) }),
    fetch(metricRulesUrl, { method: 'POST', headers, body: JSON.stringify(p95LatencyRule(project, slackId)) }),
  ]);
}
```

## Deploy Silence Windows

Suppress alerts during deploys to avoid false positives from cold starts and transient errors.

```typescript
async function silenceDuringDeploy(project: string, durationMinutes: number = 10): Promise<string> {
  const baseUrl = 'https://sentry.megabyte.space/api/0';
  const now = new Date();
  const until = new Date(now.getTime() + durationMinutes * 60000);

  // Mute all alert rules for the project during deploy window
  const rules = await fetch(`${baseUrl}/projects/emdash/${project}/rules/`, {
    headers: { 'Authorization': `Bearer ${env.SENTRY_AUTH_TOKEN}` },
  });
  const ruleList = await rules.json();

  for (const rule of ruleList) {
    await fetch(`${baseUrl}/projects/emdash/${project}/rules/${rule.id}/snooze/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.SENTRY_AUTH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'everyone', until: until.toISOString() }),
    });
  }

  return until.toISOString();
}
```

Deploy flow integration:

```
1. silenceDuringDeploy(project, 10)  — mute alerts
2. wrangler deploy                    — deploy Worker
3. purge CDN cache                    — clear stale responses
4. E2E tests on prod                  — verify
5. Alerts auto-unmute after window    — resume monitoring
```

## Per-Project Isolation

Every project gets its own alert rule set. Never use organization-wide alert rules — they cause noise from unrelated projects.

Naming convention: `[{project}] {Alert Name}` — square brackets make filtering easy in Slack.

When a project is decommissioned, delete its alert rules:

```bash
# List and delete all rules for a project
curl "https://sentry.megabyte.space/api/0/projects/{org}/{project}/rules/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN" | \
  jq '.[].id' | xargs -I{} curl -X DELETE \
  "https://sentry.megabyte.space/api/0/projects/{org}/{project}/rules/{}/" \
  -H "Authorization: Bearer $SENTRY_AUTH_TOKEN"
```

## Sentry SDK Setup (v10.50+ — Hono + Bun)
```typescript
// src/instrument.ts — dedicated @sentry/hono/bun entry point (Apr 2026)
import * as Sentry from '@sentry/hono/bun';

Sentry.init({
  dsn: 'https://KEY@sentry.megabyte.space/ID',
  environment: 'production',
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  release: env.VERSION,
  integrations: [
    Sentry.viewHierarchyIntegration(), // v10.50: DOM capture on error
  ],
});

// Apply to Hono app
import { sentryMiddleware } from '@sentry/hono';
app.use('*', sentryMiddleware());
```

### DO Alarm Tracing (v10.49)
```typescript
// Durable Object alarms auto-traced by Sentry v10.49+
// No extra config — alarm() calls get spans + error capture
```

### WorkerEntrypoint Support (v10.48)
```typescript
// Service bindings auto-instrumented via WorkerEntrypoint class
// import { WorkerEntrypoint } from 'cloudflare:workers';
// Sentry traces cross-worker calls automatically
```

Minimum version: `@sentry/hono@10.50.0` + `@sentry/bun@10.50.0`. Replaces `toucan-js` for new projects.

## Integration with 08-deploy Skill

After every first deploy, auto-run `configureSentryAlerts(projectSlug)`. The deploy skill checks if alert rules exist — if not, creates them. Subsequent deploys only trigger silence windows.
