#!/usr/bin/env node
// validate-route-metadata.mjs — per-route SEO/OG/Twitter/JSON-LD/PWA meta gate
// Enforces: rules/per-route-metadata.md + rules/quality-metrics.md SEO strict block.
// Verifies (per HTML page): title 50-60 chars, meta description 120-156 chars,
//   canonical, robots, theme-color, application-name, apple-mobile-web-app-title (≤12),
//   manifest link, ≥1 icon link, apple-touch-icon link, og:type/title/description/url/
//   site_name/locale/image/image:secure_url/image:width/image:height/image:type/image:alt,
//   twitter:card/title/description/image/image:alt, ≥1 JSON-LD block.
// Uniqueness: title + meta-desc + og:title + og:description + twitter:title +
//   twitter:description must be unique across all routes (case-insensitive,
//   whitespace-normalized hash). Two routes sharing identical hash = build fail.
// Usage: node validate-route-metadata.mjs <dist-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DIST = resolve(process.argv[2] || 'dist');
if (!existsSync(DIST)) {
  console.error(`[validate-route-metadata] dist dir not found: ${DIST}`);
  process.exit(1);
}

function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p));
    else if (entry.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

const REQUIRED_TAGS = [
  { name: 'title', re: /<title[^>]*>([^<]+)<\/title>/i },
  { name: 'description', re: /<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i },
  { name: 'canonical', re: /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i },
  { name: 'robots', re: /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i },
  { name: 'theme-color', re: /<meta\s+name=["']theme-color["']\s+content=["']([^"']+)["']/i },
  { name: 'application-name', re: /<meta\s+name=["']application-name["']\s+content=["']([^"']+)["']/i },
  { name: 'apple-mobile-web-app-title', re: /<meta\s+name=["']apple-mobile-web-app-title["']\s+content=["']([^"']+)["']/i },
  { name: 'apple-mobile-web-app-capable', re: /<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']/i },
  { name: 'mobile-web-app-capable', re: /<meta\s+name=["']mobile-web-app-capable["']\s+content=["']yes["']/i },
  { name: 'manifest-link', re: /<link\s+rel=["']manifest["']\s+href=["'][^"']+["']/i },
  { name: 'icon-link', re: /<link\s+rel=["']icon["']/i },
  { name: 'apple-touch-icon', re: /<link\s+rel=["']apple-touch-icon["']/i },
  { name: 'og:type', re: /<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']/i },
  { name: 'og:title', re: /<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i },
  { name: 'og:description', re: /<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i },
  { name: 'og:url', re: /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i },
  { name: 'og:site_name', re: /<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']/i },
  { name: 'og:locale', re: /<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']/i },
  { name: 'og:image', re: /<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i },
  { name: 'og:image:secure_url', re: /<meta\s+property=["']og:image:secure_url["']/i },
  { name: 'og:image:width', re: /<meta\s+property=["']og:image:width["']\s+content=["']1200["']/i },
  { name: 'og:image:height', re: /<meta\s+property=["']og:image:height["']\s+content=["']630["']/i },
  { name: 'og:image:type', re: /<meta\s+property=["']og:image:type["']/i },
  { name: 'og:image:alt', re: /<meta\s+property=["']og:image:alt["']\s+content=["']([^"']+)["']/i },
  { name: 'twitter:card', re: /<meta\s+name=["']twitter:card["']\s+content=["']summary_large_image["']/i },
  { name: 'twitter:title', re: /<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i },
  { name: 'twitter:description', re: /<meta\s+name=["']twitter:description["']\s+content=["']([^"']+)["']/i },
  { name: 'twitter:image', re: /<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i },
  { name: 'twitter:image:alt', re: /<meta\s+name=["']twitter:image:alt["']\s+content=["']([^"']+)["']/i },
];

function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

const failures = [];
const htmlFiles = walkHtml(DIST);

if (!htmlFiles.length) {
  console.error(`[validate-route-metadata] no HTML files found under ${DIST}`);
  process.exit(1);
}

const seenTitles = new Map();
const seenDescriptions = new Map();
const seenOgTitles = new Map();
const seenOgDescriptions = new Map();
const seenTwitterTitles = new Map();
const seenTwitterDescriptions = new Map();

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const captured = {};

  for (const { name, re } of REQUIRED_TAGS) {
    const m = html.match(re);
    if (!m) {
      failures.push(`${rel}: missing ${name}`);
      continue;
    }
    captured[name] = m[1] ?? '';
  }

  // Length checks (HARD)
  const title = captured.title?.trim() ?? '';
  if (title && (title.length < 50 || title.length > 60)) {
    failures.push(`${rel}: title length ${title.length} (must be 50-60): "${title}"`);
  }
  const desc = captured.description?.trim() ?? '';
  if (desc && (desc.length < 120 || desc.length > 156)) {
    failures.push(`${rel}: description length ${desc.length} (must be 120-156): "${desc}"`);
  }
  const aTitle = captured['apple-mobile-web-app-title']?.trim() ?? '';
  if (aTitle && aTitle.length > 12) {
    failures.push(`${rel}: apple-mobile-web-app-title length ${aTitle.length} (must be ≤12): "${aTitle}"`);
  }

  // JSON-LD count (≥1)
  const jsonLdMatches = html.match(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]+?<\/script>/gi) ?? [];
  if (jsonLdMatches.length < 1) {
    failures.push(`${rel}: 0 JSON-LD blocks (need ≥1, see quality-metrics 4+ site-wide)`);
  } else {
    for (let i = 0; i < jsonLdMatches.length; i++) {
      const inner = jsonLdMatches[i].replace(/<script[^>]*>|<\/script>/gi, '').trim();
      try {
        JSON.parse(inner);
      } catch (err) {
        failures.push(`${rel}: JSON-LD block ${i + 1} unparsable: ${err.message}`);
      }
    }
  }

  // Uniqueness tracking
  const keys = [
    [title, seenTitles, 'title'],
    [desc, seenDescriptions, 'description'],
    [captured['og:title']?.trim(), seenOgTitles, 'og:title'],
    [captured['og:description']?.trim(), seenOgDescriptions, 'og:description'],
    [captured['twitter:title']?.trim(), seenTwitterTitles, 'twitter:title'],
    [captured['twitter:description']?.trim(), seenTwitterDescriptions, 'twitter:description'],
  ];
  for (const [val, map, label] of keys) {
    if (!val) continue;
    const k = normalize(val);
    if (map.has(k)) {
      failures.push(`${rel}: duplicate ${label} (also in ${map.get(k)}): "${val}"`);
    } else {
      map.set(k, rel);
    }
  }
}

if (failures.length) {
  console.error(`\n[validate-route-metadata] ${failures.length} failures across ${htmlFiles.length} routes:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-route-metadata] BUILD GATE FAILED');
  process.exit(1);
}
console.log(`[validate-route-metadata] ✓ ${htmlFiles.length} routes, all required fields present, lengths valid, copy unique.`);
