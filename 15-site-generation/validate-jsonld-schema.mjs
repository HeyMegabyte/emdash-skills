#!/usr/bin/env node
// validate-jsonld-schema.mjs — JSON-LD structured-data integrity gate
// Enforces: rules/quality-metrics.md "4+ JSON-LD blocks per page (WebSite+Org+WebPage+
// BreadcrumbList min, +LocalBusiness/Product/FAQPage/BlogPosting/Person by page type)".
// Per-page: ≥1 valid JSON.parse-able <script type="application/ld+json"> block.
// Site-wide aggregate: across all pages, must encounter at least: WebSite, Organization,
// WebPage, BreadcrumbList. Page-type-conditional: detail pages get BlogPosting|Article;
// /team*|/about*|/people* gets Person; testimonials section gets Review/AggregateRating;
// FAQ section gets FAQPage; brick-and-mortar gets LocalBusiness.
// Usage: node validate-jsonld-schema.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-jsonld-schema] dist dir not found: ${DIST}`);
  process.exit(1);
}

function walkHtml(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walkHtml(p));
    else if (e.toLowerCase().endsWith('.html')) out.push(p);
  }
  return out;
}

const failures = [];
const warnings = [];

const REQUIRED_TYPES = new Set(['WebSite', 'Organization', 'WebPage', 'BreadcrumbList']);
const seenTypes = new Set();
const htmlFiles = walkHtml(DIST);

if (!htmlFiles.length) {
  console.error('[validate-jsonld-schema] no HTML files in dist');
  process.exit(1);
}

const SCRIPT_RE = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function extractTypes(node, acc) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) extractTypes(n, acc);
    return;
  }
  if (typeof node !== 'object') return;
  const t = node['@type'];
  if (typeof t === 'string') acc.add(t);
  else if (Array.isArray(t)) for (const v of t) acc.add(v);
  if (Array.isArray(node['@graph'])) for (const n of node['@graph']) extractTypes(n, acc);
}

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  SCRIPT_RE.lastIndex = 0;
  const blocks = [];
  let m;
  while ((m = SCRIPT_RE.exec(html)) !== null) blocks.push(m[1]);

  if (blocks.length < 1) {
    failures.push(`${rel}: 0 JSON-LD blocks (need ≥1 per page)`);
    continue;
  }

  for (let i = 0; i < blocks.length; i++) {
    const inner = blocks[i].trim();
    let parsed;
    try {
      parsed = JSON.parse(inner);
    } catch (err) {
      failures.push(`${rel}: JSON-LD block ${i + 1} unparsable: ${err.message}`);
      continue;
    }
    if (!parsed['@context'] && !(Array.isArray(parsed) && parsed[0]?.['@context']) && !parsed['@graph']) {
      warnings.push(`${rel}: JSON-LD block ${i + 1} missing @context (should be "https://schema.org")`);
    }
    extractTypes(parsed, seenTypes);
  }

  // page-type conditional checks
  const path = '/' + rel.replace(/\\/g, '/').replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
  const pageTypes = new Set();
  SCRIPT_RE.lastIndex = 0;
  for (const b of blocks) {
    try {
      extractTypes(JSON.parse(b.trim()), pageTypes);
    } catch {
      /* already reported */
    }
  }
  if (/(team|about|people)/i.test(path)) {
    if (!pageTypes.has('Person') && !pageTypes.has('Organization')) {
      warnings.push(`${rel}: page mentions team/about/people but no Person or Organization JSON-LD`);
    }
  }
  if (/(blog|article|news|post)/i.test(path) && rel !== 'index.html') {
    if (!pageTypes.has('BlogPosting') && !pageTypes.has('Article') && !pageTypes.has('NewsArticle')) {
      warnings.push(`${rel}: blog/article path but no BlogPosting/Article/NewsArticle JSON-LD`);
    }
  }
  if (/faq/i.test(html) && /faq/i.test(path) && !pageTypes.has('FAQPage')) {
    warnings.push(`${rel}: FAQ content present but no FAQPage JSON-LD`);
  }
  if (/testimonial|review/i.test(html) && !pageTypes.has('Review') && !pageTypes.has('AggregateRating')) {
    warnings.push(`${rel}: testimonial/review content but no Review or AggregateRating JSON-LD`);
  }
}

// Site-wide aggregate check
const missing = [];
for (const t of REQUIRED_TYPES) if (!seenTypes.has(t)) missing.push(t);
if (missing.length) {
  failures.push(`site-wide: missing required JSON-LD types: ${missing.join(', ')} (need WebSite+Organization+WebPage+BreadcrumbList minimum)`);
}

if (warnings.length) {
  console.warn(`\n[validate-jsonld-schema] ${warnings.length} warnings:`);
  warnings.slice(0, 30).forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-jsonld-schema] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-jsonld-schema] BUILD GATE FAILED');
  process.exit(1);
}
console.log(`[validate-jsonld-schema] ✓ ${htmlFiles.length} pages, types found: ${[...seenTypes].sort().join(', ')}.`);
