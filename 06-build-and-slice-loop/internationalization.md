---
name: "Internationalization"
version: "2.0.0"
updated: "2026-04-23"
description: "Multi-language support via URL parameter (?lang=es) or dropdown. Minimum English + Spanish on every site. AI translates all content at deploy time. Includes SEO hreflang tags, locale-aware structured data, RTL support detection, and language selector in navbar. Stored in KV for fast edge delivery."
---

# Internationalization (i18n)
## Architecture
```
User visits ?lang=es → Worker checks KV for Spanish content → serves translated page
User selects from dropdown → sets cookie + URL param → all future pages in that language
```

### Translation Storage (KV)
```
i18n:en:hero_title     → "Feed a family today"
i18n:es:hero_title     → "Alimenta a una familia hoy"
i18n:en:hero_subtitle  → "Your donation makes a real difference"
i18n:es:hero_subtitle  → "Tu donación marca una diferencia real"
```

### Translation at Deploy Time
AI translates all content strings during the build/deploy process:
```typescript
// At deploy time: translate all strings
const strings = extractAllStrings(htmlContent); // Find all translatable text
for (const [key, enValue] of Object.entries(strings)) {
  // Use Claude or another AI to translate
  const esValue = await translate(enValue, 'en', 'es');
  await env.KV.put(`i18n:es:${key}`, esValue);
  await env.KV.put(`i18n:en:${key}`, enValue);
}
```

## Language Selector (Navbar)
```html
<div class="lang-selector" role="listbox" aria-label="Select language">
  <button class="lang-current" aria-expanded="false">
    <span class="lang-flag">🇺🇸</span> EN
  </button>
  <ul class="lang-dropdown" hidden>
    <li><a href="?lang=en">🇺🇸 English</a></li>
    <li><a href="?lang=es">🇪🇸 Español</a></li>
  </ul>
</div>
```

Position: top-right of navbar, before any CTA button.

## Middleware
```typescript
app.use('*', async (c, next) => {
  // Detect language: URL param > cookie > Accept-Language header > default
  const lang = c.req.query('lang')
    || getCookie(c, 'lang')
    || c.req.header('accept-language')?.split(',')[0]?.split('-')[0]
    || 'en';

  // Validate language
  const supported = ['en', 'es'];
  const resolvedLang = supported.includes(lang) ? lang : 'en';

  // Set cookie for future requests
  setCookie(c, 'lang', resolvedLang, { path: '/', maxAge: 86400 * 365 });

  // Make available to templates
  c.set('lang', resolvedLang);
  await next();
});
```

## Translation Helper
```typescript
async function t(key: string, lang: string, env: Env): Promise<string> {
  const value = await env.KV.get(`i18n:${lang}:${key}`);
  if (value) return value;
  // Fallback to English
  return await env.KV.get(`i18n:en:${key}`) || key;
}

// Usage in templates
const title = await t('hero_title', lang, env);
```

## SEO: hreflang Tags
```html
<link rel="alternate" hreflang="en" href="https://domain.com/?lang=en">
<link rel="alternate" hreflang="es" href="https://domain.com/?lang=es">
<link rel="alternate" hreflang="x-default" href="https://domain.com/">
```

Include on EVERY page. Tells Google which language version to show in each country.

## Structured Data (Locale-Aware)
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "inLanguage": "es",
  "name": "Alimenta a una familia hoy",
  "url": "https://domain.com/?lang=es"
}
```

## RTL Support Detection
```typescript
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
const isRtl = rtlLanguages.includes(lang);
// Set <html dir="rtl"> and load RTL CSS if needed
```

## What Gets Translated
- All visible text (headings, paragraphs, buttons, labels)
- Meta tags (title, description)
- Alt text on images
- Error messages and success messages
- Legal pages (privacy, terms)
- Form labels and placeholders

## What Does NOT Get Translated
- Code snippets
- Brand names and product names
- URLs and slugs
- Email addresses and phone numbers
- Technical identifiers

## Playwright Test
```typescript
test('Spanish translation works', async ({ page }) => {
  await page.goto('/?lang=es');
  // Verify Spanish content is present
  const h1 = await page.locator('h1').textContent();
  expect(h1).not.toMatch(/^[A-Za-z\s]+$/); // Should contain Spanish characters or words
  // Verify hreflang tags
  const hreflang = await page.locator('link[hreflang="es"]').getAttribute('href');
  expect(hreflang).toContain('lang=es');
});
```
