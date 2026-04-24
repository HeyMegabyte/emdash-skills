---
name: "deploy-and-runtime-verification"
description: "MANDATORY deploy after every code change. Typecheck → deploy → purge CDN → E2E on production → visual verify → fix-forward loop. Workers Builds native CI/CD, D1 Time Travel PIT recovery, D1→R2 long-term backups, wrangler rollback, wrangler secrets management, structured observability, cross-browser smoke tests, rollback procedures, and GitHub auto-configuration."
metadata:
  version: "2.2.0"
  updated: "2026-04-23"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
submodules:
  - launch-day-sequence.md
  - ci-cd-pipeline.md
  - uptime-and-health.md
  - changelog-and-releases.md
  - backup-and-disaster-recovery.md
  - gh-fix-ci.md
  - service-worker.md
  - font-subsetting.md
  - critical-css.md
---

# 08 — Deploy and Runtime Verification

Submodules: launch-day-sequence (go-live checklist, sitemap, social) | ci-cd-pipeline (GH Actions, PR tests, previews) | uptime-and-health (endpoints, UptimeRobot, /status) | changelog-and-releases (conventional commits, semver) | backup-and-disaster-recovery (D1 Time Travel, D1→R2, KV dump, restore) | gh-fix-ci (debug failing PR checks) | service-worker (Workbox cache strategies, offline fallback, background sync, push) | font-subsetting (glyphhanger, WOFF2, self-host R2, preload, budget ≤100KB) | critical-css (critters inline above-fold CSS, Angular built-in, Hono SSR, LCP ≤2.5s).

## Mandatory Deploy Rule
Triggers: any code/content/config change. Does NOT: reading, memory writes, analysis, planning.
Exceptions: user says don't | missing credentials (warn) | no wrangler.toml.

## Deploy Sequence
1. `tsc --noEmit` 2. lint (`eslint --fix && prettier --write`) 3. build (if exists) 4. `wrangler deploy` 5. purge cache 6. wait 3-5s 7. Playwright E2E 8. visual verify 1280+375px 9. fix if needed, loop.

## Workers Builds (Native CI/CD — Preferred)
Connect GitHub/GitLab in CF dashboard → auto-build+deploy on push. No self-hosted Git required. Config via `wrangler.toml` `[build]` section:
```toml
[build]
command = "npm run build"
watch_dir = "src"

[build.upload]
format = "modules"
main = "./dist/worker.js"
```
Env-specific builds: separate `[env.staging]` + `[env.production]` blocks. Deploy hooks: `CF_PAGES_BRANCH`, `CF_PAGES_COMMIT_SHA` env vars auto-set. Preview URLs auto-generated per branch. Workers Builds preferred over GH Actions for standard repos.

## GitHub Actions (External — Full Control)
`cloudflare/wrangler-action@v3` with `CLOUDFLARE_API_TOKEN` → deploy → purge → smoke test. Gate: lint+typecheck+vitest before deploy job. Use when: monorepo, custom build steps, cross-service orchestration.

## Wrangler Best Practices
Secrets: `wrangler secret put KEY` (never in source) | `.dev.vars` local (gitignored) | `--secrets-file` for CI batch. Set `compatibility_date` to today on new projects. Run `wrangler types` to generate binding types (never hand-write Env). Each env = separate Worker with distinct bindings. `nodejs_compat` flag for Node built-ins. Version: check `wrangler --version` ≥ 3.4.0 for Time Travel support.

## Workers Observability
Enable logs+traces before first production deploy. Structured JSON: `console.log({event, userId, duration})` — searchable+filterable in CF dashboard. Use `console.error`/`console.warn` for severity. Control cost via `head_sampling_rate`. Never `passThroughOnException()` — explicit try/catch only. Never store request-scoped data in module-level globals (isolate reuse = cross-request leaks). Tail Workers for real-time log streaming.

## Cache Strategy
Purge everything after every deploy. Static: `max-age=31536000, immutable`. HTML: `max-age=0, must-revalidate`. API: `no-store`. Use CF Cache API + KV for edge caching. Purge:
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" --data '{"purge_everything":true}'
```

## D1 Time Travel (Always-On PIT Recovery)
No config needed. Paid: 30-day lookback. Free: 7-day. CLI commands (requires Wrangler ≥3.4.0):
```bash
# List bookmarks (timestamps available for restore)
wrangler d1 time-travel info DB_NAME

# Restore to specific timestamp (destructive — overwrites in place)
wrangler d1 time-travel restore DB_NAME --timestamp=UNIX_EPOCH_SECONDS

# Restore to bookmark ID
wrangler d1 time-travel restore DB_NAME --bookmark=BOOKMARK_ID

# Save current state as named bookmark before risky migration
wrangler d1 time-travel info DB_NAME  # note current bookmark, pass to restore if migration fails
```
Returns previous bookmark for undo. No clone/fork support. Use for: accidental deletes, bad migrations, data corruption.

## D1 → R2 Long-Term Backup
Retention beyond 30 days: Cron trigger (`0 0 * * *`) → Workflow calls D1 export endpoint → polls for signed URL → streams SQL dump to R2 `d1-backups/{date}/`. Built-in Workflow retries. R2 lifecycle rules auto-delete after 90 days. Zero egress on restore.
```bash
# Manual export
wrangler d1 export DB_NAME --output=backup-$(date +%Y%m%d).sql

# Restore from exported SQL
wrangler d1 execute DB_NAME --file=backup-20260101.sql
```

## Rollback
Fix forward (default): small, quick, no corruption, no active user impact. Rollback trigger: critical (auth/payments), corruption risk, complex, active users.
```bash
# List recent deployments
wrangler deployments list

# Rollback to specific deployment (last stable = omit [deployment-id])
wrangler rollback [deployment-id]

# Rollback specific environment
wrangler rollback --env production [deployment-id]
```
P1 auto-rollback: Sentry alert → Inngest → `wrangler rollback` → Slack+SMS.

## Wrangler Secrets Management
```bash
# Set secret (interactive prompt for value)
wrangler secret put SECRET_NAME

# Set secret for specific env
wrangler secret put SECRET_NAME --env production

# Batch secrets from file in CI
wrangler secret bulk .secrets.json

# List secrets (names only, values never exposed)
wrangler secret list

# Delete secret
wrangler secret delete SECRET_NAME
```
Never commit secrets. `.dev.vars` = local only (gitignored). CI: use GitHub Secrets → `--secrets-file` or individual `wrangler secret put`.

## Post-Deploy Checklist (MUST RUN BEFORE REPORTING)
Immediate: Playwright 200 (not 403/challenge) | no "Just a moment" | newest feature tested E2E | AI visual screenshot | all pages 200 | images/CSS/JS load | no console errors | JSON-LD+OG+favicon+analytics | a11y (skip link, landmarks, focus-visible, reduced-motion) | manifest validates | PWA screenshots | humans.txt | security.txt | cross-site links.
Visual: layout 1280+375px correct | no h-scroll/overlap/cutoff | footer bottom | brand colors | typography | crisp images | hover states.
Functional: nav | forms | auth | APIs | error pages | rate limiting | CSP | CORS | `/health` returns 200+JSON.

## Post-Deploy Automation (CI)
```yaml
- run: curl -sf "$PROD_URL/health" | jq .status
- run: npx playwright test tests/smoke.spec.ts
- run: curl -X POST .../purge_cache --data '{"purge_everything":true}'
```
Cross-browser: Chromium every deploy. Firefox+WebKit first deploy only. Playwright `toHaveScreenshot()` for visual regression baseline.

## Environment Parity
Watch: CSP | CORS | CDN caching | DNS | TLS | env vars | rate limiting | Worker size. Always test prod. Env-specific secrets: `wrangler secret put KEY --env staging`.

## Workflows v2 Awareness
Rearchitected control plane (April 2026): higher concurrency + creation rate limits. Use for: D1 exports, long-running multi-step jobs, auto-remediation pipelines. Queues for single-step fan-out. `ctx.waitUntil()` for background work after response (30s limit).

## Post-Build Critique (MANDATORY)
Generate self-critique (visual, content, performance, a11y, SEO, security). Deliver to: /admin dashboard | email (Resend to brian@megabyte.space) | top 3 in conversation.

### /admin (MANDATORY every site)
AI chat | build history | critique history | quick actions (purge, tests, analytics). Protected by API key or CF Access.

## Third-Party Health (every deploy)
YouTube embeds | Google Maps | Stripe sessions | GA4/GTM fires.

## GitHub Auto-Config (first deploy)
`gh repo edit --description/--homepage/--add-topic`
