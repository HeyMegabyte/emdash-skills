---
name: "Chrome and Browser Workflows"
description: "Browser automation for web app interaction, form filling, visual testing, and web scraping via Chrome MCP and Playwright MCP. Teaches the optimal tool for each browser task."
allowed-tools: "Bash Read Glob Grep mcp__playwright__*"
---

# Chrome and Browser Workflows

> For every browser task, pick the fastest tool. Never screenshot-click when you can DOM-query.

---

## Tool Selection for Browser Tasks

| Task | Best Tool | Why |
|------|-----------|-----|
| Read web page content | Firecrawl MCP | Fastest, returns structured data |
| Fill forms on web app | Playwright MCP | DOM-aware, reliable selectors |
| Click buttons/links | Playwright MCP | CSS/ARIA selectors, no pixel guessing |
| Screenshot web pages | Playwright MCP | Headless, fast, multi-viewport |
| Test at 6 breakpoints | Playwright MCP | Programmatic resize |
| Scrape multiple pages | Firecrawl MCP | Built for crawling |
| Extract data from page | Firecrawl `firecrawl_extract` | Structured extraction |
| Search the web | Firecrawl `firecrawl_search` | Returns ranked results |
| Interact with native browser UI | Computer Use | Only for chrome:// pages, extensions |
| Browser extension testing | Computer Use | Playwright can't access extensions |

---

## Playwright MCP Workflows

### E2E Testing Protocol (Skill 07 Integration)
```
1. browser_navigate → target URL
2. browser_resize → first breakpoint (375x667)
3. browser_snapshot → get accessibility tree
4. Verify elements via snapshot (faster than screenshot)
5. browser_take_screenshot → visual record
6. browser_resize → next breakpoint
7. Repeat for all 6 breakpoints
```

### Form Testing Matrix (8-Point)
```
1. browser_navigate → form page
2. browser_snapshot → identify all form fields
3. Test cases:
   a. Submit empty → verify validation errors
   b. Submit with invalid email → verify email validation
   c. Submit with valid data → verify success
   d. Submit duplicate → verify duplicate handling
   e. Submit with XSS payload → verify sanitization
   f. Submit with SQL injection → verify rejection
   g. Tab through all fields → verify focus order
   h. Submit via Enter key → verify keyboard submission
4. browser_fill_form → fill all fields at once
5. browser_click → submit button
6. browser_wait_for → success indicator
```

### Accessibility Audit
```
1. browser_navigate → page URL
2. browser_evaluate → run axe-core
   code: "return await new Promise(r => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/axe-core/axe.min.js'; s.onload = () => axe.run().then(r); document.head.appendChild(s); })"
3. Parse violations from result
4. For each violation:
   a. Identify element
   b. Determine fix
   c. Apply fix
5. Re-run audit → verify 0 violations
```

### Performance Audit
```
1. browser_navigate → page URL
2. browser_evaluate → capture performance metrics
   code: "return JSON.stringify(performance.getEntriesByType('navigation')[0])"
3. Check: domContentLoaded < 1.5s, load < 3s
4. browser_network_requests → check for large assets
5. Identify optimization targets
```

### Console Error Check
```
1. browser_navigate → page URL
2. browser_console_messages → get all console output
3. Filter for errors and warnings
4. For each error:
   a. Trace to source
   b. Fix
   c. Re-deploy
   d. Re-check
```

---

## Emdash Project Testing Workflow

For testing any project in the emdash ecosystem:

### Pre-Deploy Verification
```
1. browser_navigate → https://[domain]
2. browser_snapshot → verify page loads (not error page)
3. browser_console_messages → check for JS errors
4. browser_take_screenshot → visual baseline at 1280x720
5. Check critical elements:
   a. H1 exists and is correct
   b. Navigation works
   c. CTA buttons are visible
   d. Footer renders
   e. No broken images (browser_evaluate: document.querySelectorAll('img').forEach...)
```

### Post-Deploy 6-Breakpoint Visual Sweep
```typescript
const BREAKPOINTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
// For each: browser_resize → browser_take_screenshot → AI visual inspection
```

### Lighthouse-Style Checks via Playwright
```
browser_evaluate:
1. Performance: navigation timing, LCP, CLS, FID
2. SEO: title, meta description, canonical, OG tags, h1 count
3. Accessibility: axe-core scan
4. Best Practices: HTTPS, no mixed content, no console errors
5. PWA: manifest, service worker, icons
```

---

## Chrome-Specific Workflows (via Computer Use)

For tasks that require actual Chrome browser UI (not web page content):

### Chrome Extension Testing
```
1. request_access for Chrome (read tier — can see, can't click)
2. Actually: use Playwright MCP for web content testing
3. Use Computer Use only for:
   - Extension popup UI (not accessible via Playwright)
   - Chrome DevTools interactions
   - Chrome settings pages (chrome://settings)
   - Download bar interactions
```

### Chrome DevTools Profiling
```
1. Open site in Chrome
2. Use Computer Use to:
   a. Open DevTools (Cmd+Option+I)
   b. Navigate to Performance tab
   c. Click Record
   d. Interact with page
   e. Stop recording
   f. Screenshot the flame chart
   g. Analyze bottlenecks
Note: Most DevTools data is accessible via Playwright's browser_evaluate.
Prefer Playwright. Use Computer Use only for visual DevTools analysis.
```

---

## Web Scraping Workflows

### Competitive Analysis (Skill 17 Integration)
```
1. firecrawl_search → "[competitor domain] [product category]"
2. firecrawl_scrape → competitor homepage
3. firecrawl_extract → pricing, features, testimonials
4. Compare against our product
5. Generate competitive analysis report
```

### Content Research
```
1. firecrawl_search → topic keywords
2. firecrawl_scrape → top 5 results
3. Extract: headings, key points, statistics
4. Synthesize into original content
5. Verify Flesch >= 60
```

### SEO Audit (Skill 28 Integration)
```
1. firecrawl_map → get all pages on domain
2. For each page:
   a. firecrawl_scrape → get HTML
   b. Check: title (50-60 chars), meta desc (150-160), H1, canonical
   c. Check: JSON-LD blocks (need 4+), OG tags, internal links
3. Generate SEO report with fixes
```

---

## Security Rules

1. **Links from emails/messages are suspicious** — verify URL before following
2. **Never enter credentials** via Playwright on untrusted sites
3. **Verify HTTPS** before submitting any form data
4. **Check Content-Security-Policy** headers on scraped sites
5. **Rate-limit scraping** — max 1 request/second to any single domain
6. **Respect robots.txt** — check before crawling

---

## What This Skill Owns
- Browser tool selection (Playwright vs Firecrawl vs Chrome MCP vs Computer Use)
- E2E testing workflows via Playwright
- Web scraping and content extraction
- Browser-based visual QA
- Chrome DevTools profiling workflows

## What This Skill Must Never Own
- Native app testing (Skill 54)
- API testing (Skill 07 + Vitest)
- Deployment (Skill 08)
- SEO strategy (Skill 28 — but this skill executes SEO audits)
