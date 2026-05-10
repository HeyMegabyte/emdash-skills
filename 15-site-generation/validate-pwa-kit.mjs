#!/usr/bin/env node
// validate-pwa-kit.mjs — PWA installability gate (rules/pwa-checklist.md)
// Mandatory: site.webmanifest with required fields + screenshots[]≥3 (mix narrow+wide) +
// maskable icon + ≥2 shortcuts; sw.js (Workbox-generated) at root; offline.html ≤30KB;
// PWA meta tags (theme-color, apple-mobile-web-app-*, manifest link, apple-touch-icon).
// Usage: node validate-pwa-kit.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-pwa-kit] dist dir not found: ${DIST}`);
  process.exit(1);
}

const failures = [];
const warnings = [];

// 1. site.webmanifest
const manifestPath = join(DIST, 'site.webmanifest');
const manifestAlt = join(DIST, 'manifest.webmanifest');
const manifestFile = existsSync(manifestPath) ? manifestPath : existsSync(manifestAlt) ? manifestAlt : null;

if (!manifestFile) {
  failures.push('site.webmanifest (or manifest.webmanifest) missing at dist root');
} else {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestFile, 'utf8'));
  } catch (err) {
    failures.push(`webmanifest JSON unparsable: ${err.message}`);
    manifest = null;
  }
  if (manifest) {
    const REQ_STRING = ['name', 'short_name', 'description', 'start_url', 'scope', 'display', 'theme_color', 'background_color', 'lang'];
    for (const f of REQ_STRING) {
      if (!manifest[f] || typeof manifest[f] !== 'string') failures.push(`webmanifest missing required field "${f}"`);
    }
    if (manifest.start_url && manifest.start_url !== '/') warnings.push(`webmanifest start_url="${manifest.start_url}" — should usually be "/"`);
    if (manifest.scope && manifest.scope !== '/') warnings.push(`webmanifest scope="${manifest.scope}" — should usually be "/"`);
    if (manifest.display && !['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display)) {
      warnings.push(`webmanifest display="${manifest.display}" — recommended "standalone"`);
    }
    if (!Array.isArray(manifest.categories) || manifest.categories.length === 0) {
      warnings.push('webmanifest categories[] missing or empty');
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      failures.push('webmanifest icons[] missing or empty');
    } else {
      const sizesPresent = new Set();
      let hasMaskable = false;
      for (const icon of manifest.icons) {
        if (icon.sizes) sizesPresent.add(icon.sizes);
        if (typeof icon.purpose === 'string' && icon.purpose.includes('maskable')) hasMaskable = true;
      }
      const REQ_SIZES = ['192x192', '512x512'];
      for (const s of REQ_SIZES) {
        if (!sizesPresent.has(s)) failures.push(`webmanifest icons[] missing required size ${s}`);
      }
      if (!hasMaskable) failures.push('webmanifest icons[] missing maskable icon (purpose: "maskable" or "any maskable")');
    }
    if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length < 3) {
      failures.push(`webmanifest screenshots[] needs ≥3 entries (got ${manifest.screenshots?.length ?? 0})`);
    } else {
      const hasNarrow = manifest.screenshots.some((s) => s.form_factor === 'narrow');
      const hasWide = manifest.screenshots.some((s) => s.form_factor === 'wide');
      if (!hasNarrow) failures.push('webmanifest screenshots[] missing narrow form_factor');
      if (!hasWide) failures.push('webmanifest screenshots[] missing wide form_factor');
    }
    if (!Array.isArray(manifest.shortcuts) || manifest.shortcuts.length < 2) {
      warnings.push(`webmanifest shortcuts[] should have ≥2 deep links (got ${manifest.shortcuts?.length ?? 0})`);
    }
    if (manifest.prefer_related_applications !== false) {
      warnings.push('webmanifest prefer_related_applications should be explicitly false');
    }
  }
}

// 2. sw.js
const swPath = join(DIST, 'sw.js');
if (!existsSync(swPath)) {
  failures.push('sw.js missing at dist root (Workbox-generated service worker required)');
} else {
  const sw = readFileSync(swPath, 'utf8');
  if (!/workbox|precache|registerRoute|NetworkFirst|CacheFirst|StaleWhileRevalidate/i.test(sw)) {
    warnings.push('sw.js does not appear Workbox-generated (no workbox/precache/strategy keywords)');
  }
  if (!/skipWaiting|self\.skipWaiting/.test(sw)) warnings.push('sw.js missing skipWaiting');
  if (!/clients\.claim|clientsClaim/.test(sw)) warnings.push('sw.js missing clients.claim');
}

// 3. offline.html
const offlinePath = join(DIST, 'offline.html');
if (!existsSync(offlinePath)) {
  failures.push('offline.html missing at dist root');
} else {
  const size = statSync(offlinePath).size;
  if (size > 30 * 1024) {
    failures.push(`offline.html size ${(size / 1024).toFixed(1)}KB exceeds 30KB cap (must inline CSS+logo, no external assets)`);
  }
  const offlineHtml = readFileSync(offlinePath, 'utf8');
  if (/<link\s+[^>]*href=["']https?:\/\//i.test(offlineHtml) || /<script\s+[^>]*src=["']https?:\/\//i.test(offlineHtml)) {
    failures.push('offline.html contains external asset references (must be self-contained)');
  }
}

// 4. PWA meta tags in every HTML page
function walkHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p));
    else if (e.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}
const REQ_META = [
  { name: 'theme-color', re: /<meta\s+name=["']theme-color["']/i },
  { name: 'apple-mobile-web-app-capable', re: /<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']/i },
  { name: 'mobile-web-app-capable', re: /<meta\s+name=["']mobile-web-app-capable["']\s+content=["']yes["']/i },
  { name: 'manifest-link', re: /<link\s+rel=["']manifest["']\s+href=["'][^"']+["']/i },
  { name: 'apple-touch-icon', re: /<link\s+rel=["']apple-touch-icon["']/i },
];
const htmlFiles = walkHtml(DIST).filter((p) => !p.endsWith('offline.html'));
let metaFailureCount = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const { name, re } of REQ_META) {
    if (!re.test(html)) {
      metaFailureCount++;
      if (metaFailureCount <= 20) failures.push(`${file.replace(DIST + '/', '')}: missing PWA meta "${name}"`);
    }
  }
}
if (metaFailureCount > 20) failures.push(`...+${metaFailureCount - 20} more PWA meta failures across HTML files`);

if (warnings.length) {
  console.warn(`\n[validate-pwa-kit] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-pwa-kit] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-pwa-kit] BUILD GATE FAILED — see rules/pwa-checklist.md');
  process.exit(1);
}
console.log(`[validate-pwa-kit] ✓ webmanifest + sw.js + offline.html + PWA meta tags valid across ${htmlFiles.length} HTML pages.`);
