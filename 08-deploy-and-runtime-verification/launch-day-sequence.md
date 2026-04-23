---
name: "Launch Day Sequence"
version: "1.1.0"
updated: "2026-04-23"
description: "Go-live checklist: sitemap → GSC, robots.txt unblock, Postiz social, Resend launch email, full quality gate, uptime monitoring setup. Nothing forgotten."
---

# Launch Day Sequence
## Pre-Launch Verification
```
[ ] All pages return 200
[ ] All forms submit correctly (8-point test matrix — skill 32)
[ ] All images load (no broken images)
[ ] No placeholder content (Lorem, TODO, coming soon)
[ ] Mobile responsive at 375px
[ ] Desktop looks good at 1280px
[ ] Accessibility: axe-core 0 violations (skill 20)
[ ] SEO: Yoast checklist passes on all pages (skill 28)
[ ] Performance: Lighthouse report generated
[ ] Security: CSP headers, Turnstile on forms
[ ] Legal: privacy policy + terms present
[ ] Easter egg: at least one hidden delight (skill 15)
[ ] Error pages: branded 404 + 500 (skill 31)
[ ] Contact form: working and tested (skill 32)
[ ] Web property completeness (skill 24):
    - site.webmanifest validates in Chrome DevTools (0 warnings)
    - PWA screenshots taken with Playwright (wide + narrow form_factor)
    - 4+ JSON-LD blocks per page (Organization, WebSite+SearchAction, WebPage, domain-specific)
    - OG images at 1200x630, visually verified on Twitter Card Validator + Facebook Debugger
    - Infrastructure files: humans.txt, security.txt, browserconfig.xml, opensearch.xml
    - Cross-site alternate links present
    - Sitemap submitted to Google Search Console
```

## Launch Sequence (Automated)
### Step 1: Final Deploy + Purge
```bash
npx wrangler deploy
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" --data '{"purge_everything":true}'
sleep 5
```

### Step 2: Ensure Search Engines Can Crawl
```bash
# Verify robots.txt allows crawling
curl -s "https://domain.com/robots.txt" | grep "Allow: /"
# Verify sitemap exists and is valid XML
curl -s "https://domain.com/sitemap.xml" | head -5
```

### Step 3: Submit Sitemap to Google Search Console
```bash
# Via GSC API (GCP service account required)
curl -X PUT "https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fdomain.com/sitemaps/https%3A%2F%2Fdomain.com%2Fsitemap.xml" \
  -H "Authorization: Bearer $GSC_TOKEN"

# Or via ping (no auth needed)
curl "https://www.google.com/ping?sitemap=https://domain.com/sitemap.xml"
```

### Step 4: GitHub Auto-Config
```bash
gh repo edit --description "$(curl -s https://domain.com | grep -oP '(?<=<meta name="description" content=")[^"]*')"
gh repo edit --homepage "https://domain.com"
gh repo edit --add-topic "cloudflare,hono,emdash,typescript"
```

### Step 5: Generate README (skill 29)
Auto-generate branded README with install.doctor template, aqua dividers, badges.

### Step 6: Social Announcement (skill 27)
```bash
# Auto-post via Postiz
curl -X POST "https://postiz.megabyte.space/api/posts" \
  -H "Authorization: Bearer $POSTIZ_API_KEY" \
  -d '{
    "content": "Just shipped: domain.com — [product description]",
    "platforms": ["twitter", "linkedin"],
    "media": ["https://domain.com/og/homepage.png"],
    "schedule": "now"
  }'
```

### Step 7: Launch Email (skill 19)
Send branded launch announcement via Resend to newsletter subscribers (if Listmonk is set up).

### Step 8: Production E2E Suite
```bash
PROD_URL=https://domain.com npx playwright test
```

### Step 9: Cross-Browser Smoke (first deploy only)
```bash
npx playwright test --project=chromium --project=firefox --project=webkit
```

### Step 10: Final Report
```markdown
## Launch Report — domain.com
### Status: ✅ LIVE
- URL: https://domain.com
- Deploy: [timestamp]
- Lighthouse: [score]
- E2E: [pass/fail]
- Sitemap: submitted to GSC
- Social: posted to [platforms]
- README: generated

### What Was Built
- [feature list]

### Next Steps
- [improvements from idea engine — skill 14]
```

### Step 11: Notify Connected Services
```typescript
// Slack deploy notification
await notifySlack(env, `🚀 *${domain}* is LIVE\n<https://${domain}|Visit site>\nBuilt with projectsites.dev`);

// Discord community notification (if applicable)
await notifyDiscord(env, `${domain} launched!`, `Check it out: https://${domain}`);

// Zapier webhook (triggers any connected automations)
await triggerZapier(env, 'site_launched', { domain, url: `https://${domain}` });
```

### Step 12: Psychology-Optimized Launch (skill 51)
- **Peak-End Rule:** The launch announcement IS the peak moment. Make it count.
- **Social Proof:** Include user count or testimonial in the social post.
- **Reciprocity:** Share something valuable in the announcement (tip, insight, free tool).
- **Unity:** Frame as "we built this" not "I built this" — shared identity with community.

### Brand Amplification
Every launch amplifies the projectsites.dev brand:
- Social posts mention "Built with projectsites.dev" when appropriate
- README includes projectsites.dev badge
- Footer includes projectsites.dev attribution
- The quality of the launch IS the marketing
