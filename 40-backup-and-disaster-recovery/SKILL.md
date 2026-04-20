---
name: "Backup and Disaster Recovery"
description: "Single-zip infrastructure restore plan: D1 database exports, R2 bucket sync, KV namespace dumps, wrangler.toml + secrets list, and a restore script that rebuilds everything from one archive. Cron-based automated backups to R2. Recovery runbook for when things go wrong."
layer: "capability-pack"
canonical-owner-of:
  - "backup-automation"
  - "disaster-recovery-runbook"
  - "infrastructure-restore"
---

# Backup and Disaster Recovery

> One zip file restores the entire infrastructure.

---

## The Single-Zip Restore Plan

Every project can be rebuilt from a single archive containing:

```
backup-domain-2026-04-19.zip
├── db/
│   └── database.sql          # D1 export (all tables)
├── kv/
│   └── kv-dump.json          # All KV key-value pairs
├── r2/
│   └── manifest.json         # R2 object list (actual files in R2, too large for zip)
├── config/
│   ├── wrangler.toml         # Worker configuration
│   ├── secrets.txt           # List of secret NAMES (not values)
│   └── dns-records.json      # DNS record export
├── src/                      # Full source code
│   └── ...
├── restore.sh                # One-command restore script
└── README.md                 # Recovery instructions
```

## Backup Scripts

### D1 Database Export
```bash
# Export all tables
npx wrangler d1 export DB --output=backup/db/database.sql

# Or via API for automation
curl "https://api.cloudflare.com/client/v4/accounts/$CF_ACCOUNT_ID/d1/database/$DB_ID/export" \
  -H "Authorization: Bearer $CF_API_TOKEN" > backup/db/database.sql
```

### KV Namespace Dump
```typescript
// Worker endpoint to dump KV
app.get('/admin/backup/kv', async (c) => {
  // Auth check required
  const keys = await c.env.KV.list();
  const data: Record<string, string> = {};
  for (const key of keys.keys) {
    data[key.name] = await c.env.KV.get(key.name) || '';
  }
  return c.json(data);
});
```

### R2 Manifest
```bash
# List all R2 objects
npx wrangler r2 object list BUCKET_NAME --json > backup/r2/manifest.json
```

### DNS Records Export
```bash
curl "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result' > backup/config/dns-records.json
```

## Restore Script (restore.sh)

```bash
#!/bin/bash
set -e
echo "🔄 Restoring infrastructure for $DOMAIN..."

# 1. Deploy Worker
echo "Deploying Worker..."
npm install
npx wrangler deploy

# 2. Restore D1
echo "Restoring database..."
npx wrangler d1 execute DB --file=backup/db/database.sql

# 3. Restore KV
echo "Restoring KV..."
cat backup/kv/kv-dump.json | jq -r 'to_entries[] | "\(.key)\t\(.value)"' | \
  while IFS=$'\t' read -r key value; do
    npx wrangler kv:key put --namespace-id=$KV_ID "$key" "$value"
  done

# 4. Restore secrets (manual — values not in backup)
echo "⚠️  Restore secrets manually:"
cat backup/config/secrets.txt
echo "Run: npx wrangler secret put SECRET_NAME"

# 5. Purge cache
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" --data '{"purge_everything":true}'

echo "✅ Restore complete. Verify at https://$DOMAIN"
```

## Automated Backups (Cron)

```typescript
// wrangler.toml: [triggers] crons = ["0 3 * * *"]  # Daily at 3 AM UTC
export default {
  async scheduled(event, env, ctx) {
    const date = new Date().toISOString().split('T')[0];
    // Export D1 to R2
    const tables = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    for (const table of tables.results) {
      const data = await env.DB.prepare(`SELECT * FROM ${table.name}`).all();
      await env.R2.put(`backups/${date}/db/${table.name}.json`, JSON.stringify(data.results));
    }
    // Export KV keys to R2
    const keys = await env.KV.list();
    const kvData: Record<string, string> = {};
    for (const key of keys.keys) {
      kvData[key.name] = await env.KV.get(key.name) || '';
    }
    await env.R2.put(`backups/${date}/kv/dump.json`, JSON.stringify(kvData));
  },
};
```

## Recovery Runbook

| Scenario | Steps |
|----------|-------|
| Worker deleted | `npx wrangler deploy` from source |
| D1 corrupted | Restore from latest R2 backup |
| KV lost | Restore from latest R2 backup |
| Domain DNS lost | Re-create from `dns-records.json` |
| Secrets lost | Re-enter from password manager |
| R2 bucket lost | Re-upload from local or generate fresh |
| Total loss | Run `restore.sh` from backup zip |

---

## MCP Tools Available

### Coolify MCP (`mcp__coolify__*`) — for self-hosted service backups
| Tool | Purpose |
|------|---------|
| `mcp__coolify__database_backups` | List/trigger backups for Coolify-managed databases |
| `mcp__coolify__get_database` | Get database details (type, size, connection info) |
| `mcp__coolify__list_databases` | List all databases across Coolify projects |
| `mcp__coolify__diagnose_server` | Check server disk space before/after backups |
| `mcp__coolify__get_infrastructure_overview` | Full inventory of what needs backing up |
| `mcp__coolify__list_applications` | List all apps (each may have associated data to back up) |
| `mcp__coolify__list_services` | List all services (Postiz, Listmonk, PostHog, etc.) |
| `mcp__coolify__env_vars` | Export environment variables for a service (names only, not values) |

### Cloudflare MCP (`mcp__claude_ai_Cloudflare_Developer_Platform__*`) — for CF resource backups
| Tool | Purpose |
|------|---------|
| `mcp__claude_ai_Cloudflare_Developer_Platform__d1_databases_list` | List all D1 databases |
| `mcp__claude_ai_Cloudflare_Developer_Platform__d1_database_query` | Query D1 for export (SELECT * FROM table) |
| `mcp__claude_ai_Cloudflare_Developer_Platform__kv_namespaces_list` | List all KV namespaces |
| `mcp__claude_ai_Cloudflare_Developer_Platform__kv_namespace_get` | Read KV values for backup |
| `mcp__claude_ai_Cloudflare_Developer_Platform__r2_buckets_list` | List all R2 buckets |
| `mcp__claude_ai_Cloudflare_Developer_Platform__r2_bucket_get` | Get R2 bucket details |
| `mcp__claude_ai_Cloudflare_Developer_Platform__workers_list` | List all Workers to include in backup inventory |

## R2 Backup Patterns

### Backup Storage Structure in R2
```
r2://backups/
├── daily/
│   ├── 2026-04-19/
│   │   ├── d1/
│   │   │   ├── main-db.json          # D1 full export
│   │   │   └── analytics-db.json     # Secondary D1 if exists
│   │   ├── kv/
│   │   │   └── main-kv.json          # KV namespace dump
│   │   ├── coolify/
│   │   │   ├── postiz-db.sql.gz      # Postiz PostgreSQL dump
│   │   │   ├── listmonk-db.sql.gz    # Listmonk PostgreSQL dump
│   │   │   └── posthog-db.sql.gz     # PostHog PostgreSQL dump
│   │   └── config/
│   │       ├── wrangler.toml
│   │       ├── secrets-list.txt       # Secret NAMES only
│   │       └── dns-records.json
│   ├── 2026-04-18/
│   └── ...
├── weekly/                            # Sunday snapshots, kept 12 weeks
└── monthly/                           # 1st of month snapshots, kept 12 months
```

### Retention Policy
| Tier | Frequency | Retention | Trigger |
|------|-----------|-----------|---------|
| Daily | Every day at 03:00 UTC | 7 days | Worker cron |
| Weekly | Every Sunday at 03:00 UTC | 12 weeks | Worker cron (day check) |
| Monthly | 1st of month at 03:00 UTC | 12 months | Worker cron (date check) |

### Cleanup Script (runs after daily backup)
```typescript
async function cleanupOldBackups(env: Env) {
  const now = Date.now();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

  const objects = await env.R2.list({ prefix: 'backups/daily/' });
  for (const obj of objects.objects) {
    const dateStr = obj.key.split('/')[2]; // e.g., "2026-04-12"
    const objDate = new Date(dateStr).getTime();
    if (now - objDate > SEVEN_DAYS) {
      await env.R2.delete(obj.key);
    }
  }
}
```

### Coolify Database Backup Workflow
```
1. mcp__coolify__list_databases → get all managed databases
2. mcp__coolify__database_backups → trigger backup for each
3. mcp__coolify__diagnose_server → verify disk space after backup
4. Download backup files via Coolify API
5. Upload compressed backups to R2: backups/daily/{date}/coolify/
```

## Computer Use Integration

Use `mcp__computer-use__*` for backup verification:

1. **Coolify dashboard** — Screenshot `https://coolify.megabyte.space` database backup status to confirm backups completed
2. **R2 dashboard** — Screenshot Cloudflare R2 bucket to visually verify backup objects exist with expected sizes
3. **Restore dry-run** — After a restore test, screenshot the running application to verify data integrity visually

## Acceptance Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | Daily backup runs automatically | R2 has `backups/daily/{today}` folder with all expected files |
| 2 | D1 export is complete | D1 backup JSON row count matches `SELECT COUNT(*) FROM table` |
| 3 | KV dump is complete | KV backup key count matches `KV.list()` total |
| 4 | Coolify DB backups triggered | `mcp__coolify__database_backups` shows recent backup per database |
| 5 | Retention policy enforced | No daily backups older than 7 days in R2 |
| 6 | Restore script works end-to-end | Run `restore.sh` on clean environment → site fully operational |
| 7 | Backup size is reasonable | Daily backup total < 100MB (alert if sudden 10x increase) |
| 8 | Secrets list (not values) included | `secrets-list.txt` exists, contains only names, no actual secret values |
| 9 | DNS records exported | `dns-records.json` has valid Cloudflare DNS records |
| 10 | Weekly/monthly snapshots retained | R2 has weekly backups for 12 weeks, monthly for 12 months |
