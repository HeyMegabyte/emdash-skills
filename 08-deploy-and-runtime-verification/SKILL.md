---
name: "deploy-and-runtime-verification"
description: "MANDATORY deploy after every code change. Typecheck → deploy → purge CDN → E2E on production → visual verify → fix-forward loop. Third-party integration health checks, cross-browser smoke tests on first deploy, cache purge strategy, rollback procedures, and GitHub auto-configuration."
submodules:
  - launch-day-sequence.md
  - ci-cd-pipeline.md
  - uptime-and-health.md
  - changelog-and-releases.md
  - backup-and-disaster-recovery.md
  - gh-fix-ci.md
---

# 08 — Deploy and Runtime Verification

Submodules: launch-day-sequence (go-live checklist, sitemap, social), ci-cd-pipeline (GH Actions, PR tests, previews), uptime-and-health (endpoints, UptimeRobot, /status), changelog-and-releases (conventional commits, semver), backup-and-disaster-recovery (D1 export, R2 sync, KV dump, restore), gh-fix-ci (debug failing PR checks).

## Mandatory Deploy Rule

**Triggers:** Any code/content/config change. **Does NOT:** Reading, memory writes, analysis, planning.
**Exceptions:** User says don't, missing credentials (warn), no wrangler.toml.

## Deploy Sequence
1. tsc --noEmit 2. eslint (if configured) 3. build (if exists) 4. wrangler deploy 5. purge cache 6. wait 3-5s 7. Playwright E2E 8. visual verify 1280+375px 9. fix if needed, loop.

## Cache Strategy
Purge everything after every deploy. Static: max-age=31536000, immutable. HTML: max-age=0, must-revalidate. API: no-store.

## Post-Deploy Checklist (MUST RUN BEFORE REPORTING)

**Immediate:** Playwright 200 (not 403/challenge), no "Just a moment", newest feature tested E2E, AI visual screenshot, all pages 200, images/CSS/JS load, no console errors, JSON-LD+OG+favicon+analytics, a11y (skip link, landmarks, focus-visible, reduced-motion), manifest validates, PWA screenshots, humans.txt, security.txt, cross-site links.

**Visual:** Layout 1280+375px correct, no h-scroll/overlap/cutoff, footer bottom, brand colors, typography, crisp images, hover states.

**Functional:** Nav, forms, auth, APIs, error pages, rate limiting, CSP, CORS.

## Environment Parity
Watch: CSP, CORS, CDN caching, DNS, TLS, env vars, rate limiting, Worker size. Always test prod.

## Rollback
Fix forward (default): small, quick, no corruption, no active impact. Rollback: critical (auth/payments), corruption risk, complex, active users. `wrangler deployments list` then `wrangler rollback`.

## Post-Build Critique (MANDATORY)
Generate self-critique (visual, content, performance, a11y, SEO, security). Deliver to: /admin dashboard, email (Resend to brian@megabyte.space), top 3 in conversation.

### /admin (MANDATORY every site)
AI chat, build history, critique history, quick actions (purge, tests, analytics). Protected by API key or CF Access.

## Third-Party Health (every deploy)
YouTube embeds, Google Maps, Stripe sessions, GA4/GTM fires.

## Cross-Browser (first deploy)
Chromium every deploy. Firefox+WebKit first deploy only.

## GitHub Auto-Config (first deploy)
`gh repo edit --description/--homepage/--add-topic`
