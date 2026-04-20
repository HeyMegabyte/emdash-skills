# Quick Reference

## Deploy
```
npx wrangler deploy && curl -sX POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache" -H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json" -d '{"purge_everything":true}'
```

## Test
```
PROD_URL=https://domain.com npx playwright test
npx tsc --noEmit && npx eslint .
```

## Secrets
```
get-secret SECRET_NAME
```

## Logo Generation
Ideogram v3: `get-secret IDEOGRAM_API_KEY`

## Image Generation
GPT Image 1.5: `get-secret OPENAI_API_KEY`

## Video Generation
Sora 2: `get-secret OPENAI_API_KEY` via `scripts/sora.py`

## Analytics Setup
GA4/GTM: GCP service account at `~/.config/emdash/gcp-service-account.json`
PostHog: `posthog.megabyte.space` + `get-secret POSTHOG_API_KEY`
Sentry: `sentry.megabyte.space` + `get-secret SENTRY_DSN`

## Stack Defaults
Hosting: CF Workers | Backend: Hono | Frontend: Angular 19 + Ionic
DB: D1 (simple) / Neon (complex) | Auth: Clerk | Pay: Stripe
Email: Resend | Validation: Zod | Test: Playwright + Vitest

## Colors
Black #060610 | Cyan #00E5FF | Blue #50AAE3

## Fonts
Headings: Sora | Body: Space Grotesk | Code: JetBrains Mono

## Quality Bar
E2E 0 failures | WCAG AA | CSP on | Flesch >= 60 | Yoast pass
Images < 200KB WebP | No placeholders | No dead forms

## Decision Shortcuts (14-category architecture)
- New project? → All 14 categories loaded, reference 05/coolify, 06/domain-provisioning
- Bug fix? → 07 Quality + 08 Deploy (load 08/gh-fix-ci submodule)
- Design issue? → 10 Design + 11 Motion + 06/easter-eggs
- "What else?" → 14 Idea Engine → research + propose

## Domain Due Diligence Shortcuts
| Domain Type | Must-Have Before Building |
|-------------|--------------------------|
| Payments/Donations | PCI compliance (use Stripe Checkout, never raw card fields), tax receipts, fee transparency, refund flow |
| Health/Medical | HIPAA notice, data encryption at rest, BAA with providers |
| Education | COPPA if minors, FERPA if student records |
| Any PII | GDPR/CCPA privacy policy, data deletion endpoint, cookie consent if EU |
| Marketplace | Stripe Connect for payouts, dispute handling, seller verification |
| Nonprofit | 501c3 verification display, donation receipts with EIN, state charity registration notice |

## Common Mistakes to Avoid
- Forgetting to purge CF cache after deploy (users see stale content)
- Using `innerHTML` instead of `textContent` (XSS vulnerability)
- Skipping Turnstile on forms (spam within hours)
- Not running `wrangler d1 migrations apply` after schema changes
- Using `sleep` in Playwright tests instead of `waitFor`

## Emergency Playbook
| Problem | Fix |
|---------|-----|
| Site down | `wrangler deployments list` → rollback to last working |
| D1 corruption | `wrangler d1 export DB --output backup.sql` (if possible) |
| Secret leaked | Rotate immediately: `wrangler secret put KEY` |
| CI stuck | `gh run cancel RUN_ID` → fix → re-push |
| Cache poisoned | Purge ALL: `purge_everything: true` |

## End-of-Prompt Report Template
```
## What was done
- [list changes]

## What was deployed
- URL: https://...
- Status: [passing/failing]

## Skill updates needed
- SKILL UPDATE NEEDED: [##] — [reason] (if any)

## Next steps
- [suggestions]
```
