---
name: "Domain Provisioning"
description: "Auto-provision new domains with CF Worker, DNS, SSL, and a gorgeous animated placeholder — NOT a boring 'coming soon.' Full dark theme with gradient mesh, animated orbs, newsletter signup, meta tags, favicon set, Easter egg, multi-language support, and Megabyte Labs branding. Triggers when new project folder appears."
layer: "capability-pack"
canonical-owner-of:
  - "domain-provisioning"
  - "animated-placeholder-pages"
  - "dns-ssl-automation"
---

# Domain Provisioning

> Every new domain gets a gorgeous placeholder in under 5 minutes. Not a boring "coming soon" — a statement.

---

## Placeholder Requirements

The placeholder is NOT a placeholder — it's the first impression. It must be:

### Visual
- Full-screen dark theme (#060610 background)
- Animated gradient mesh with floating cyan/blue orbs (CSS only, no libraries)
- Domain name in Space Grotesk 700 as hero headline
- "Something extraordinary is being built." subtext in Sora 400
- Subtle particle effect or noise overlay
- Responsive at 375px and 1280px

### Functional
- Newsletter signup form (connected to Listmonk via skill 13)
- Turnstile captcha on the form (skill 05)
- Contact: brian@megabyte.space (mailto link)
- Megabyte Labs logo in footer
- Easter egg (skill 15 — AI chooses what)
- Language selector (EN + ES minimum, skill 01)

### SEO & Meta
- Full OG tags (title, description, image)
- Twitter Card (summary_large_image)
- Favicon set (generated via Ideogram, skill 12)
- JSON-LD: Organization + WebSite
- robots.txt and sitemap.xml (skill 24)
- site.webmanifest (skill 24)

### Performance
- Zero external JS dependencies
- Inline CSS (no external stylesheet requests)
- Total page weight < 100KB (excluding favicon)
- LCP < 1 second

## Setup Steps

### 1. Initialize Project
```bash
mkdir -p src public
npm init -y
npm install hono wrangler --save-dev
```

### 2. Create wrangler.toml
```toml
name = "domain-name"
main = "src/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
account_id = "84fa0d1b16ff8086dd958c468ce7fd59"

routes = [
  { pattern = "domain.com", custom_domain = true },
  { pattern = "www.domain.com", custom_domain = true }
]
```

### 3. Create Worker (src/index.ts)
```typescript
import { Hono } from 'hono';
const app = new Hono();

app.get('*', (c) => {
  // Return gorgeous placeholder HTML
  return c.html(placeholderHTML, 200, {
    'Content-Security-Policy': "default-src 'self'; style-src 'unsafe-inline'; ...",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000',
  });
});

export default app;
```

### 4. Generate Brand Assets
- Logo via Ideogram (3 variations, pick best)
- Favicon set via Pillow processing
- OG image (1200x630, domain name + brand colors)

### 5. Deploy
```bash
npx wrangler deploy
# Purge cache
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  --data '{"purge_everything":true}'
```

### 6. Configure DNS (if new subdomain)
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"subdomain","content":"domain-name.workers.dev","proxied":true}'
```

### 7. Verify
- Visit the live URL
- Test newsletter signup form
- Take screenshots at 1280px and 375px
- Verify meta tags with social card validators
- Run axe-core accessibility audit

## Animated Background CSS (No Libraries)

```css
.orbs {
  position: fixed; inset: 0; z-index: 0; overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}
.orb:nth-child(1) {
  width: 400px; height: 400px;
  background: #00E5FF;
  top: -10%; left: -5%;
  animation-delay: 0s;
}
.orb:nth-child(2) {
  width: 300px; height: 300px;
  background: #50AAE3;
  bottom: -5%; right: -5%;
  animation-delay: -7s;
}
.orb:nth-child(3) {
  width: 250px; height: 250px;
  background: #8B5CF6;
  top: 40%; left: 50%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

@media (prefers-reduced-motion: reduce) {
  .orb { animation: none; }
}
```

## GitHub Auto-Config (First Deploy)
After first deploy, automatically:
1. Set repo description: `gh repo edit --description "Meta description text"`
2. Set homepage URL: `gh repo edit --homepage "https://domain.com"`
3. Add topics: `gh repo edit --add-topic "cloudflare,hono,emdash"`
4. Generate README.md from site content
