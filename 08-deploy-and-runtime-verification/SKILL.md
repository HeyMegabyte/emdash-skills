---
name: "deploy-and-runtime-verification"
version: "2.1.0"
updated: "2026-04"
description: "MANDATORY deploy after every code change. Typecheck → deploy → purge CDN → E2E on production → visual verify → fix-forward loop. Workers Builds native CI/CD, D1 Time Travel PIT recovery, D1→R2 long-term backups, wrangler secrets management, structured observability, cross-browser smoke tests, rollback procedures, and GitHub auto-configuration."
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

Submodules: launch-day-sequence (go-live checklist, sitemap, social), ci-cd-pipeline (GH Actions, PR tests, previews), uptime-and-health (endpoints, UptimeRobot, /status), changelog-and-releases (conventional commits, semver), backup-and-disaster-recovery (D1 Time Travel, D1→R2, KV dump, restore), gh-fix-ci (debug failing PR checks), service-worker (Workbox cache strategies, offline fallback, background sync, push notifications), font-subsetting (glyphhanger, WOFF2, self-host R2, preload, budget ≤100KB), critical-css (critters inline above-fold CSS, Angular built-in, Hono SSR, LCP ≤2.5s).

## Mandatory Deploy Rule

**Triggers:** Any code/content/config change. **Does NOT:** Reading, memory writes, analysis, planning.
**Exceptions:** User says don't, missing credentials (warn), no wrangler.toml.

## Deploy Sequence
1. `tsc --noEmit` 2. lint (`npm run lint` or `eslint --fix && prettier --write`) 3. build (if exists) 4. `wrangler deploy` 5. purge cache 6. wait 3-5s 7. Playwright E2E 8. visual verify 1280+375px 9. fix if needed, loop.

## CI/CD Options
**Workers Builds** (native): Connect GitHub/GitLab in CF dashboard → auto-build+deploy on push. Best for standard repos; no self-hosted Git. **GitHub Actions** (external, full control): `cloudflare/wrangler-action@v3` with `CLOUDFLARE_API_TOKEN` secret → deploy → purge → smoke test. Gate: lint+typecheck+vitest before deploy job.

## Wrangler Best Practices
Secrets: `wrangler secret put KEY` (never in source); `.dev.vars` local (gitignored); `--secrets-file` for CI batch. Set `compatibility_date` to today on new projects. Run `wrangler types` to generate binding types (never hand-write Env). Each env = separate Worker with distinct bindings. `nodejs_compat` flag for Node built-ins.

## Workers Observability
Enable logs+traces before first production deploy. Structured JSON via `console.log({...})` — searchable+filterable. Use `console.error`/`console.warn` for severity. Control cost via `head_sampling_rate`. Never `passThroughOnException()` — explicit try/catch only. Never store request-scoped data in module-level globals (isolate reuse = cross-request leaks).

## Cache Strategy
Purge everything after every deploy. Static: `max-age=31536000, immutable`. HTML: `max-age=0, must-revalidate`. API: `no-store`. Use CF Cache API + KV for edge caching. Purge via `POST /zones/{zone}/purge_cache {"purge_everything":true}`.

## D1 Time Travel (Always-On PIT Recovery)
No config needed. Paid: 30-day lookback. Free: 7-day. Restore: `wrangler d1 time-travel restore DB --timestamp=UNIX_TS` (requires Wrangler v3.4.0+). Destructive — overwrites in place; returns prev bookmark for undo. No clone/fork support. Use for: accidental deletes, bad migrations, data corruption.

## D1 → R2 Long-Term Backup
For retention beyond 30 days: Cron trigger (`0 0 * * *`) → Workflow calls D1 export endpoint → polls for signed URL → streams SQL dump to R2 `d1-backups/`. Built-in Workflow retries. R2 lifecycle rules auto-delete after 90 days. Zero egress on restore.

## Post-Deploy Checklist (MUST RUN BEFORE REPORTING)

**Immediate:** Playwright 200 (not 403/challenge), no "Just a moment", newest feature tested E2E, AI visual screenshot, all pages 200, images/CSS/JS load, no console errors, JSON-LD+OG+favicon+analytics, a11y (skip link, landmarks, focus-visible, reduced-motion), manifest validates, PWA screenshots, humans.txt, security.txt, cross-site links.

**Visual:** Layout 1280+375px correct, no h-scroll/overlap/cutoff, footer bottom, brand colors, typography, crisp images, hover states.

**Functional:** Nav, forms, auth, APIs, error pages, rate limiting, CSP, CORS, `/health` returns 200+JSON.

## Post-Deploy Automation (CI)
```yaml
- run: curl -sf "$PROD_URL/health" | jq .status
- run: npx playwright test tests/smoke.spec.ts
- run: curl -X POST .../purge_cache --data '{"purge_everything":true}'
```
Cross-browser: Chromium every deploy. Firefox+WebKit first deploy only. Playwright `toHaveScreenshot()` for visual regression baseline.

## Environment Parity
Watch: CSP, CORS, CDN caching, DNS, TLS, env vars, rate limiting, Worker size. Always test prod. Env-specific secrets: `wrangler secret put KEY --env staging`.

## Rollback
Fix forward (default): small, quick, no corruption, no active user impact. Rollback trigger: critical (auth/payments), corruption risk, complex, active users. `wrangler deployments list` → `wrangler rollback [deployment-id]`. P1 auto-rollback: Sentry alert → Inngest → `wrangler rollback` → Slack+SMS.

## Workflows v2 Awareness
Rearchitected control plane (April 2026): higher concurrency + creation rate limits. Use for D1 exports, long-running multi-step jobs, auto-remediation pipelines. Queues for single-step fan-out. `ctx.waitUntil()` for background work after response (30s limit).

## Post-Build Critique (MANDATORY)
Generate self-critique (visual, content, performance, a11y, SEO, security). Deliver to: /admin dashboard, email (Resend to brian@megabyte.space), top 3 in conversation.

### /admin (MANDATORY every site)
AI chat, build history, critique history, quick actions (purge, tests, analytics). Protected by API key or CF Access.

## Third-Party Health (every deploy)
YouTube embeds, Google Maps, Stripe sessions, GA4/GTM fires.

## GitHub Auto-Config (first deploy)
`gh repo edit --description/--homepage/--add-topic`
