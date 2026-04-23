---
name: "Backup and Disaster Recovery"
version: "1.2.0"
updated: "2026-04-23"
description: "Single-zip restore plan: D1 Time Travel (30-day) + D1→R2 export, KV dump, wrangler.toml + secrets list. Cron-based automated backups. Recovery runbook."
---

# Backup and Disaster Recovery

## Single-Zip Restore Plan
```
backup-domain-YYYY-MM-DD.zip
├── db/database.sql            # D1 export
├── kv/kv-dump.json            # KV pairs
├── r2/manifest.json           # R2 object list
├── config/wrangler.toml, secrets.txt (NAMES only), dns-records.json
├── src/                       # Full source
├── restore.sh                 # One-command restore
└── README.md                  # Recovery instructions
```

## Backup Commands
```bash
npx wrangler d1 export DB --output=backup/db/database.sql
npx wrangler r2 object list BUCKET --json > backup/r2/manifest.json
curl "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" -H "Authorization: Bearer $CF_API_TOKEN" | jq '.result' > backup/config/dns-records.json
```

## Restore Script
```bash
#!/bin/bash
set -e
npm install && npx wrangler deploy                    # 1. Deploy Worker
npx wrangler d1 execute DB --file=backup/db/database.sql  # 2. Restore D1
# 3. Restore KV (iterate kv-dump.json)
# 4. Manual: re-enter secrets from password manager
# 5. Purge cache
```

## Automated Backups (Worker Cron)
```toml
[triggers] crons = ["0 3 * * *"]  # Daily 3AM UTC
```
Export D1 tables + KV dump to R2 at `backups/daily/{date}/`.

## Retention Policy
| Tier | Retention |
|------|-----------|
| Daily | 7 days |
| Weekly (Sunday) | 12 weeks |
| Monthly (1st) | 12 months |

Cleanup: delete daily backups older than 7 days after each run.

## Recovery Runbook
| Scenario | Fix |
|----------|-----|
| Worker deleted | `npx wrangler deploy` |
| D1 corrupted | Restore from R2 backup |
| KV lost | Restore from R2 backup |
| DNS lost | Re-create from dns-records.json |
| Secrets lost | Re-enter from password manager |
| Total loss | Run restore.sh |

## MCP Tools for Backups
- `mcp__coolify__database_backups` — trigger Coolify DB backups
- `mcp__coolify__diagnose_server` — check disk space
- `mcp__claude_ai_Cloudflare_Developer_Platform__d1_database_query` — export D1
- `mcp__claude_ai_Cloudflare_Developer_Platform__kv_namespace_get` — read KV
- `mcp__claude_ai_Cloudflare_Developer_Platform__r2_buckets_list` — list R2

## R2 Storage Structure
```
r2://backups/{daily|weekly|monthly}/{date}/{db|kv|coolify|config}/
```

## Acceptance Criteria
Daily backup runs automatically, D1 row count matches, KV key count matches, Coolify DBs triggered, retention enforced, restore.sh works end-to-end, size <100MB (alert on 10x spike), secrets list has names only, DNS records valid.
