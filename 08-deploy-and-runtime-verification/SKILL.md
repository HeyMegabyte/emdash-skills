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

> Deploy after every code change. Verify live behavior. Never trust local-only testing.

## Submodules

- **launch-day-sequence.md** — The go-live checklist that runs after the first successful deploy: submit sitemap, unblock robots.txt, announce on social, send launch email, verify every link, run full quality gate.
- **ci-cd-pipeline.md** — GitHub Actions for auto-deploy on push to main, E2E tests on PR, branch preview deploys. Includes Playwright in CI, Lighthouse audit, and auto-merge for passing PRs.
- **uptime-and-health.md** — Health endpoints on every Worker, external uptime monitoring via free services (UptimeRobot, Better Stack). Public status page at /status.
- **changelog-and-releases.md** — Auto-generate changelog from git commits using conventional commits format. Public /changelog page. GitHub Releases with release notes. Semantic versioning.
- **backup-and-disaster-recovery.md** — Single-zip infrastructure restore plan: D1 database exports, R2 bucket sync, KV namespace dumps, wrangler.toml + secrets list, and a restore script.
- **gh-fix-ci.md** — Debug or fix failing GitHub PR checks that run in GitHub Actions; inspect checks and logs, summarize failure context, draft a fix plan.

---

## Core Principle

**Every code change deploys to production. Every deployment is verified live.** Local development is for iteration speed. Production is for truth. The deploy-verify loop is not optional — it is the heartbeat of the system.

---

## Mandatory Deploy Rule

### What Triggers Deployment
- Any code change (HTML, CSS, JS, TS, config)
- Any content change (copy, images, structured data)
- Any configuration change (wrangler.toml, env vars)

### What Does NOT Trigger Deployment
- Reading files or exploring code
- Writing to memory or skills
- Analysis-only tasks
- Planning tasks

### Exceptions (skip deploy when)
- User explicitly says "don't deploy"
- Missing credentials (warn user)
- No wrangler.toml exists (project not CF-configured yet)

---

## Deploy Sequence

```
1. Typecheck         → npx tsc --noEmit
2. Lint              → npx eslint . (if configured)
3. Build             → npm run build (if build step exists)
4. Deploy            → npx wrangler deploy (or wrangler pages deploy)
5. Purge Cache       → curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
                         -H "Authorization: Bearer {api_token}" \
                         -H "Content-Type: application/json" \
                         --data '{"purge_everything":true}'
6. Wait              → 3-5 seconds for edge propagation
7. E2E Tests         → npx playwright test --config=e2e/playwright.config.ts
8. Visual Verify     → Screenshot at 1280px + 375px, inspect
9. Fix if needed     → Loop back to step 1
```

### Quick Deploy Template
```bash
# Typecheck + deploy
npx tsc --noEmit && npx wrangler deploy

# Purge cache (replace ZONE_ID and TOKEN)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Run production E2E
PROD_URL=https://domain.com npx playwright test
```

---

## Cache Purge Strategy

### When to Purge
- After every deployment (always purge everything)
- After DNS changes
- After changing cached assets (images, CSS, JS)

### Purge Methods
| Method | When |
|--------|------|
| Purge everything | After deploy (default) |
| Purge by URL | After single asset change |
| Purge by tag | After tagged asset group change |
| Purge by prefix | After path-based changes |

### Cache Headers
```typescript
// Static assets: cache aggressively
c.header('Cache-Control', 'public, max-age=31536000, immutable');

// HTML pages: revalidate always
c.header('Cache-Control', 'public, max-age=0, must-revalidate');

// API responses: no cache by default
c.header('Cache-Control', 'no-store');
```

---

## Production Verification Checklist

### Immediate Post-Deploy (automated — MUST RUN BEFORE REPORTING COMPLETION)
```
[ ] REAL BROWSER E2E: Playwright navigates to production URL, gets 200 (not 403/challenge)
[ ] REAL BROWSER E2E: Page body does NOT contain "Just a moment" or CF challenge text
[ ] REAL BROWSER E2E: Newest feature is tested end-to-end in production
[ ] VISUAL: Screenshot taken and inspected via AI vision (Read tool)
[ ] Homepage returns 200
[ ] All linked pages return 200
[ ] Images load (no broken images)
[ ] CSS loads (page is styled)
[ ] JS loads (interactions work)
[ ] No console errors
[ ] Structured data present in source
[ ] OG meta tags present
[ ] Favicon loads
[ ] Analytics snippet fires
[ ] ACCESSIBILITY: Playwright a11y tests pass (see 07/accessibility)
[ ] ACCESSIBILITY: skip link, landmarks, focus-visible, reduced-motion all present
[ ] site.webmanifest validates with 0 Chrome DevTools warnings (06/web-manifest)
[ ] PWA screenshots present (wide + narrow form_factor)
[ ] humans.txt and .well-known/security.txt accessible (200 status)
[ ] Cross-site alternate links verified (rel="alternate", JSON-LD sameAs)
```

### Visual Post-Deploy (screenshot + inspect)
```
[ ] Layout correct at 1280px
[ ] Layout correct at 375px
[ ] No horizontal scrollbar
[ ] No overlapping text
[ ] No cut-off content
[ ] Footer at page bottom
[ ] Brand colors correct
[ ] Typography renders correctly
[ ] Images are crisp (not blurry/stretched)
[ ] Interactive elements have hover states
```

### Functional Post-Deploy
```
[ ] Navigation works (all links)
[ ] Forms submit correctly
[ ] Auth flow works (if applicable)
[ ] API endpoints return correct data
[ ] Error pages render (404, 500)
[ ] Rate limiting active on public endpoints
[ ] CSP headers present
[ ] CORS configured correctly
```

---

## Environment Parity

### Production vs Development Differences to Watch
| Concern | Why It Matters |
|---------|----------------|
| CSP headers | Browsers enforce in production |
| CORS | Cross-origin requests may fail |
| CDN caching | Stale content served |
| DNS resolution | Custom domains vs *.workers.dev |
| TLS | Mixed content warnings |
| Environment variables | Missing secrets |
| Rate limiting | May block legitimate traffic |
| Worker size limits | May exceed in production |

### Always Test Production Because
- CDN caching can serve stale content
- CSP violations only appear in production
- DNS and TLS issues are environment-specific
- Third-party integrations may have domain restrictions
- Performance characteristics differ from local

---

## Rollback and Fix-Forward

### When to Fix Forward (default)
- Bug is small and obvious
- Fix is quick (< 5 minutes)
- No data corruption risk
- Users are not actively affected

### When to Rollback
- Critical functionality broken (auth, payments)
- Data corruption possible
- Fix is complex or risky
- Multiple users actively affected

### Rollback Procedure
```bash
# Find last good deployment
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback

# Verify rollback
curl -s https://domain.com | head -20
```

---

## Post-Deploy Enhancement Loop

After basic verification passes, check:
```
[ ] Can any images be further compressed?
[ ] Are all links verified (no 404s)?
[ ] Is structured data complete and valid?
[ ] Are there console warnings to address?
[ ] Can Lighthouse score be improved?
[ ] Are error tracking and analytics confirmed firing?
```

---

## Post-Build Criticism & Notification (MANDATORY)

After every deployment, the system MUST generate a self-critique and deliver it to the user.

### Self-Critique Process
After deployment + verification, generate a structured critique covering:
1. **Visual issues:** layout problems, spacing inconsistencies, color mismatches
2. **Content gaps:** missing sections, thin copy, placeholder text still present
3. **Performance:** Lighthouse scores, image sizes, load times
4. **Accessibility:** any WCAG violations found during testing
5. **SEO:** missing meta tags, weak page titles, missing structured data
6. **Security:** CSP gaps, exposed endpoints, missing rate limiting

### Delivery Channels
1. **Admin Dashboard:** Post critique to the site's `/admin` dashboard AI chat (see below)
2. **Email:** Send critique summary via Resend to brian@megabyte.space
3. **In-conversation:** Report top 3 most impactful findings to the user

### Admin Dashboard (MANDATORY for every site)
Every Emdash site MUST include an `/admin` route with:
- AI-powered chat interface for post-build discussions
- Build history log with timestamps
- Critique history (what was flagged, what was fixed)
- Quick actions: purge cache, run tests, view analytics
- Protected by a simple auth mechanism (API key or Cloudflare Access)

### Critique Email Template
Subject: "[Site] Post-Build Critique — [date]"
Body: Structured HTML with sections for each critique category, severity levels (critical/warning/info), and direct links to the affected pages.

---

## Wrangler Configuration Patterns

### Simple Worker
```toml
name = "project-name"
main = "src/index.ts"
compatibility_date = "2024-09-25"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "KV"
id = "..."

[[d1_databases]]
binding = "DB"
database_name = "project-db"
database_id = "..."

[[r2_buckets]]
binding = "R2"
bucket_name = "project-assets"
```

### Worker with Custom Domain
```toml
name = "project-name"
main = "src/index.ts"
compatibility_date = "2024-09-25"

routes = [
  { pattern = "domain.com", custom_domain = true },
  { pattern = "www.domain.com", custom_domain = true }
]
```

---

## Trigger Conditions
- Every code change completion
- User requests deployment
- Quality gate passes (→ 07)
- Feature slice complete (→ 06)

## Stop Conditions
- Deployed and verified
- All post-deploy checks pass
- Enhancement loop complete

## Cross-Skill Dependencies
- **Reads from:** 06-build-and-slice-loop (code to deploy), 07-quality-and-verification (quality gate pass)
- **Feeds into:** 07-quality-and-verification (production URL for testing), 13-observability-and-growth (verify instrumentation live)

---

## What This Skill Owns
- Deployment execution and automation
- Cache purge strategy
- Production verification
- Environment parity awareness
- Rollback and fix-forward decisions
- Post-deploy enhancement loop
- Wrangler configuration patterns

## What This Skill Must Never Own
- Code implementation (→ 06)
- Test writing (→ 07)
- Architecture decisions (→ 05)
- Visual design (→ 10)

## Third-Party Integration Health (on every deploy)

After deploying, verify ALL third-party integrations are working:

```typescript
// YouTube embeds load (not Error 153)
const ytFrame = page.locator('iframe[src*="youtube"]');
if (await ytFrame.count() > 0) {
  const box = await ytFrame.first().boundingBox();
  expect(box.width).toBeGreaterThan(300);
}

// Google Maps render (not blocked by CSP)
const mapDiv = page.locator('[id*="Map"], [id*="map"]');
if (await mapDiv.count() > 0) {
  // Verify map tiles loaded (not empty div)
}

// Stripe checkout creates session
// Hit /api/checkout with test data, verify redirect URL returned

// GA4/GTM fires
// Verify gtm.js loaded in network requests
```

## Cross-Browser Smoke (first deploy + periodic)

On FIRST deploy of any project, run full test suite on:
- Chromium (primary, every deploy)
- Firefox (first deploy only)
- WebKit/Safari (first deploy only)

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { browserName: 'chromium' } },
  { name: 'firefox', use: { browserName: 'firefox' } },  // first deploy
  { name: 'webkit', use: { browserName: 'webkit' } },    // first deploy
]
```

## GitHub Auto-Configuration

On first deploy, automatically:
1. Set repo description via `gh repo edit --description "..."`
2. Generate README.md from site content
3. Set homepage URL via `gh repo edit --homepage "https://domain.com"`
4. Add topics via `gh repo edit --add-topic "cloudflare,angular,nonprofit"`
