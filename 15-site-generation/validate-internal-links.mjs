#!/usr/bin/env node
// validate-internal-links.mjs — every internal <a href> resolves to a real route
// Enforces: every clickable internal link points to a route that ships, AND every body
// paragraph has at least 2 internal links + 1 outbound (rules/always.md "Every page").
// Builds KNOWN_ROUTES from the dist filesystem (one HTML per route or SPA index.html with
// route manifest); fails on dangling /foo links or routes that 404 in the published site.
// Usage: node validate-internal-links.mjs <dist-dir> [routes-manifest.json]
//   routes-manifest.json optional — if absent, auto-derives from filesystem
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DIST = resolve(process.argv[2] || 'dist');
const MANIFEST = process.argv[3] ? resolve(process.argv[3]) : null;

if (!existsSync(DIST)) {
  console.error(`[validate-internal-links] dist dir not found: ${DIST}`);
  process.exit(1);
}

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => entry.toLowerCase().endsWith(e))) out.push(p);
  }
  return out;
}

function deriveRoutesFromFs(dist) {
  const routes = new Set(['/']);
  const html = walk(dist, ['.html']);
  for (const f of html) {
    const rel = '/' + relative(dist, f).replace(/\\/g, '/');
    routes.add(rel.replace(/\/index\.html$/i, '/').replace(/\.html$/i, ''));
  }
  return routes;
}

let knownRoutes;
if (MANIFEST && existsSync(MANIFEST)) {
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  knownRoutes = new Set((manifest.routes ?? []).map((r) => (typeof r === 'string' ? r : r.path)));
} else {
  knownRoutes = deriveRoutesFromFs(DIST);
}
// Always allow root + home variants
knownRoutes.add('/');
knownRoutes.add('');

const failures = [];
const warnings = [];
const htmlFiles = walk(DIST, ['.html']);

const A_HREF = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  let internalCount = 0;
  let outboundCount = 0;
  let m;
  A_HREF.lastIndex = 0;
  while ((m = A_HREF.exec(html)) !== null) {
    const href = m[1];
    const anchor = m[2].replace(/<[^>]+>/g, '').trim();
    if (!href) continue;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) continue;
    if (href.startsWith('http://') || href.startsWith('https://')) {
      outboundCount++;
      // Discourage "click here" / "learn more" / "read more" anchors (rules/copy-writing.md)
      if (/^(click here|learn more|read more|here|more)$/i.test(anchor)) {
        warnings.push(`${rel}: outbound link uses generic anchor text "${anchor}" — use descriptive name`);
      }
      continue;
    }
    // Internal link
    internalCount++;
    const path = href.split('?')[0].split('#')[0];
    const normalized = path.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
    if (!knownRoutes.has(normalized) && !knownRoutes.has(normalized + '/')) {
      failures.push(`${rel}: dangling internal link "${href}" — not in KNOWN_ROUTES (${knownRoutes.size} known)`);
    }
    if (/^(click here|learn more|read more|here|more)$/i.test(anchor)) {
      warnings.push(`${rel}: internal link uses generic anchor text "${anchor}" — use page name`);
    }
  }
  if (internalCount < 2) {
    warnings.push(`${rel}: only ${internalCount} internal links (rules/always.md requires ≥2 per page)`);
  }
  if (outboundCount < 1) {
    warnings.push(`${rel}: 0 outbound links (rules/always.md requires ≥1 per page)`);
  }
}

if (warnings.length) {
  console.warn(`\n[validate-internal-links] ${warnings.length} warnings:`);
  warnings.slice(0, 30).forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-internal-links] ${failures.length} failures:`);
  failures.slice(0, 50).forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-internal-links] BUILD GATE FAILED');
  process.exit(1);
}
console.log(`[validate-internal-links] ✓ ${htmlFiles.length} routes, ${knownRoutes.size} known routes, no dangling internal links.`);
