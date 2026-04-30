---
name: "Web Manifest System"
version: "2.0.0"
updated: "2026-04-23"
description: "MANDATORY: Every site gets full PWA manifest with screenshots, shortcuts (96px icons), display_override, edge_side_panel. Plus sitemap.xml, robots.txt, humans.txt, security.txt, opensearch.xml, browserconfig.xml. Comprehensive meta tags (copyright, HandheldFriendly, format-detection, color-scheme). Cross-site linking via rel=alternate. Per-page OG images. JSON-LD rich snippets. All files regenerated on every deploy."
---

# Web Manifest System
## Required Files (EVERY site, NO EXCEPTIONS)
| File | Purpose | Template Below |
|------|---------|---------------|
| `site.webmanifest` | PWA manifest with icons, screenshots, shortcuts | Yes |
| `sitemap.xml` | All public pages with lastmod + priority | Yes |
| `robots.txt` | Crawl directives + sitemap reference | Yes |
| `humans.txt` | Team, technology, tools | Yes |
| `.well-known/security.txt` | Security contact, expires, canonical | Yes |
| `browserconfig.xml` | MS tile configuration | Yes |
| `opensearch.xml` | Browser search bar integration | Yes |
| `icon-96x96.png` | Shortcut icon (required for PWA shortcuts) | Generate |
| `screenshots/desktop-*.png` | PWA install UI (wide, form_factor: wide) | Screenshot |
| `screenshots/mobile-*.png` | PWA install UI (narrow, form_factor: narrow) | Screenshot |

## site.webmanifest (COMPREHENSIVE — match install.doctor)
```json
{
  "name": "Full Product Name — Tagline",
  "short_name": "Short Name",
  "description": "150-char description with keywords",
  "lang": "en-US",
  "dir": "ltr",
  "id": "/?pwa=1",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone", "browser"],
  "orientation": "any",
  "background_color": "#060610",
  "theme_color": "#060610",
  "prefer_related_applications": false,
  "categories": ["nonprofit", "education", "social"],
  "icons": [
    { "src": "/favicon-16x16.png", "sizes": "16x16", "type": "image/png" },
    { "src": "/favicon-32x32.png", "sizes": "32x32", "type": "image/png" },
    { "src": "/icon-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop-1920x1080.png",
      "sizes": "1920x1080",
      "form_factor": "wide",
      "type": "image/png",
      "label": "Desktop view of the homepage"
    },
    {
      "src": "/screenshots/mobile-1080x1920.png",
      "sizes": "1080x1920",
      "form_factor": "narrow",
      "type": "image/png",
      "label": "Mobile view of the homepage"
    }
  ],
  "shortcuts": [
    {
      "name": "Shortcut Name",
      "short_name": "Short",
      "url": "/path-within-scope",
      "description": "What this shortcut does",
      "icons": [{ "src": "/icon-96x96.png", "sizes": "96x96", "type": "image/png" }]
    }
  ],
  "edge_side_panel": { "preferred_width": 480 },
  "related_applications": [
    { "platform": "webapp", "url": "https://related-site.example/site.webmanifest" }
  ]
}
```

### CRITICAL: Shortcut Rules (fixes Chrome DevTools errors)
- **url MUST be within scope** — no `tel:` links, no external URLs
- **Every shortcut MUST have a 96x96 icon** — generate `icon-96x96.png` from the 512px icon
- **url must start with `/`** — relative to the manifest scope
- Use `/#section` for same-page anchors

### CRITICAL: Screenshots (fixes "Richer PWA Install UI" warnings)
- **At least 1 screenshot with `form_factor: "wide"`** (desktop)
- **At least 1 screenshot with `form_factor: "narrow"`** or without form_factor (mobile)
- Take screenshots with Playwright: `npx playwright screenshot --viewport-size "1920,1080" URL output.png`
- Recommended sizes: 1920x1080 (wide), 1080x1920 (narrow)

## HTML `<head>` Meta Tags (COMPREHENSIVE — match install.doctor)
```html
<!-- Core -->
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta http-equiv="X-UA-Compatible" content="chrome=1">
<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
<meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">
<title>Page Title — Brand</title>
<meta name="description" content="120-156 char with CTA and keywords">
<meta name="keywords" content="comma, separated, keywords">
<meta name="author" content="Name">
<meta name="copyright" content="Company">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="generator" content="Product Name v1.0">
<meta name="format-detection" content="telephone=yes">
<meta name="HandheldFriendly" content="True">
<meta name="MobileOptimized" content="400">
<meta name="color-scheme" content="dark">

<!-- Geo -->
<meta name="geo.region" content="US-NJ">
<meta name="geo.placename" content="Newark">
<meta name="geography" content="USA">

<!-- Open Graph -->
<meta property="og:site_name" content="Brand">
<meta property="og:type" content="website">
<meta property="og:title" content="Page Title">
<meta property="og:description" content="Description">
<meta property="og:image" content="https://domain.com/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="Alt text for OG image">
<meta property="og:url" content="https://domain.com/">
<meta property="og:locale" content="en_US">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@handle">
<meta name="twitter:creator" content="@handle">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://domain.com/og-image.png">
<meta name="twitter:image:alt" content="Alt text">

<!-- Canonical & Cross-Site Links -->
<link rel="canonical" href="https://domain.com/">
<link type="text/plain" rel="author" href="/humans.txt">
<link rel="alternate" href="https://related-site.com" title="Related Site Title">

<!-- Theme & PWA -->
<meta name="theme-color" content="#060610" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#50AAE3" media="(prefers-color-scheme: light)">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Short Name">
<meta name="application-name" content="Full Name">
<meta name="msapplication-TileColor" content="#060610">
<meta name="msapplication-config" content="/browserconfig.xml">

<!-- Icons -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="shortcut icon" href="/favicon.ico">

<!-- Preconnect (fonts, analytics, CDN) -->
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

## Cross-Site Linking (MANDATORY for multi-site projects)
Every Megabyte Labs site must link to its siblings:
```html
<link rel="alternate" href="https://mission.megabyte.space" title="Megabyte Labs Mission">
<link rel="alternate" href="https://donate.megabyte.space" title="Donate">
<link rel="alternate" href="https://call.megabyte.space" title="St. John's Hotline / (262) 6UNIQUE">
```

Also add in JSON-LD `sameAs` array:
```json
"sameAs": [
  "https://mission.megabyte.space",
  "https://donate.megabyte.space",
  "https://call.megabyte.space",
  "https://megabyte.space",
  "https://github.com/HeyMegabyte"
]
```

## JSON-LD Structured Data (Rich Snippets)
Every page needs at minimum: Organization + WebSite + WebPage.
Additional types by page purpose:
- Donation page: `DonateAction`
- FAQ: `FAQPage` with `Question` + `Answer`
- Contact: `ContactPoint`
- Events: `Event`
- Blog: `BlogPosting`
- Products: `Product` with `Offer`
- Breadcrumbs: `BreadcrumbList` on all subpages

## Screenshot Generation Workflow
Use Playwright to capture real screenshots (not mockups):
```bash
# Desktop (wide) screenshot
npx playwright screenshot --browser chromium --viewport-size "1920,1080" "https://domain.com" screenshots/desktop.png

# Mobile (narrow) screenshot
npx playwright screenshot --browser chromium --viewport-size "390,844" "https://domain.com" screenshots/mobile.png

# Resize for manifest
python3 -c "
from PIL import Image
# Wide
img = Image.open('screenshots/desktop.png').crop((0,0,1920,1080))
img.save('screenshots/desktop-1920x1080.png')
# Narrow
img = Image.open('screenshots/mobile.png').resize((1080,1920), Image.LANCZOS)
img.save('screenshots/mobile-1080x1920.png')
"
```

## Verification Checklist (EVERY deploy)
```
[ ] site.webmanifest has screenshots (wide + narrow)
[ ] All shortcut URLs are within scope (no tel:, no external)
[ ] All shortcuts have 96x96 icons
[ ] display_override includes window-controls-overlay
[ ] icons include both "any" and "maskable" purpose
[ ] Cross-site alternate links present
[ ] humans.txt accessible
[ ] security.txt accessible at /.well-known/security.txt
[ ] robots.txt references sitemap
[ ] No Chrome DevTools manifest warnings
[ ] OG image exists at 1200x630 (≤100KB, branded)
[ ] apple-touch-icon.png at root (180x180, generated from logo)
[ ] color-scheme meta present (dark|light|dark light)
[ ] DNS-prefetch + preconnect for fonts/analytics
[ ] Font woff2 preload for primary display + body fonts
[ ] All JSON-LD validates at schema.org validator
[ ] 4+ JSON-LD blocks per page (WebSite + Org/LocalBusiness + WebPage + BreadcrumbList minimum)
[ ] sitemap.xml every <url> has <lastmod>
[ ] Lightbox component (src/components/lightbox.tsx) mounted in Layout
[ ] Major image groups wrapped in [data-gallery="<id>"]
```
