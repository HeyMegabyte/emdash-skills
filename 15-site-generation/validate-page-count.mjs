#!/usr/bin/env node
// validate-page-count.mjs — page-count floor + 1:N source-mapping gate
// Floor: every site ≥4 pages (Home + About + Services + Contact). Even 1-page source
// rebuilds get the 4-page floor (rules/build-breaking — site-rebuild full-corpus mandate).
// 1:N: when source sitemap has N pages (12, 80, 750), rebuild has ≥N pages. Cap at 1000
// for runaway crawls. Page count is NEVER capped at 5-8.
// Usage: node validate-page-count.mjs <build-dir>
//   build-dir: contains _scraped_content.json (source routes) + dist/ (rebuilt pages)
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const SCRAPED = join(BUILD, '_scraped_content.json');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-page-count] dist dir not found: ${DIST}`);
  process.exit(1);
}

function walkHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p));
    else if (entry.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

const failures = [];
const warnings = [];

const builtHtml = walkHtml(DIST);
const builtCount = builtHtml.length;

// Floor: ≥4 pages
const FLOOR = 4;
if (builtCount < FLOOR) {
  failures.push(`page count ${builtCount} below ≥${FLOOR} floor (Home/About/Services/Contact minimum)`);
}

// 1:N mapping when source sitemap available
let sourceCount = 0;
if (existsSync(SCRAPED)) {
  const scraped = JSON.parse(readFileSync(SCRAPED, 'utf8'));
  const routes = scraped.routes ?? scraped.urls ?? scraped.pages ?? [];
  sourceCount = Array.isArray(routes) ? routes.length : 0;
  if (sourceCount > FLOOR) {
    if (builtCount < sourceCount) {
      failures.push(
        `source has ${sourceCount} routes, rebuild has only ${builtCount} HTML pages — 1:N mapping violated (lost ${sourceCount - builtCount} routes)`,
      );
    } else if (builtCount > 1000) {
      warnings.push(`built ${builtCount} pages — exceeds 1000 sanity ceiling, possible runaway crawl`);
    }
  }
} else {
  warnings.push(`_scraped_content.json absent — cannot verify 1:N source-mapping`);
}

// Sitemap.xml lastmod check
const sitemap = join(DIST, 'sitemap.xml');
if (existsSync(sitemap)) {
  const xml = readFileSync(sitemap, 'utf8');
  const urls = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  let missingLastmod = 0;
  for (const u of urls) {
    if (!u.includes('<lastmod>')) missingLastmod++;
  }
  if (missingLastmod) {
    failures.push(`sitemap.xml: ${missingLastmod}/${urls.length} <url> entries missing <lastmod>`);
  }
  if (urls.length < builtCount) {
    warnings.push(`sitemap.xml lists ${urls.length} URLs but ${builtCount} HTML pages exist — sitemap incomplete`);
  }
}

// Required floor pages (Home + About + Services + Contact) — by URL or filename presence
const FLOOR_PAGES = [
  { name: 'home', match: /^index\.html$|^\/$/ },
  { name: 'about', match: /about/i },
  { name: 'services|programs|menu|portfolio', match: /services|programs|menu|portfolio|work|products/i },
  { name: 'contact', match: /contact|donate|book|reach|appointment/i },
];
const builtPaths = builtHtml.map((f) => relative(DIST, f).toLowerCase());
for (const fp of FLOOR_PAGES) {
  const found = builtPaths.some((p) => fp.match.test(p));
  if (!found) {
    warnings.push(`floor page "${fp.name}" not found among ${builtCount} built pages`);
  }
}

if (warnings.length) {
  console.warn(`\n[validate-page-count] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-page-count] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-page-count] BUILD GATE FAILED');
  process.exit(1);
}
console.log(`[validate-page-count] ✓ ${builtCount} pages (floor=${FLOOR}, source=${sourceCount || 'unknown'}).`);
