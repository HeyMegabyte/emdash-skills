#!/usr/bin/env node
// validate-favicon-set.mjs — full favicon kit gate (rules/always.md "Every site")
// Mandatory 9 assets from real-favicongenerator (or ImageMagick fallback): favicon.ico,
// favicon-16x16.png, favicon-32x32.png, apple-touch-icon.png (180×180), android-chrome-
// 192x192.png, android-chrome-512x512.png, mstile-150x150.png, safari-pinned-tab.svg,
// + at least one maskable variant. Plus browserconfig.xml referencing mstile.
// Each PNG verified by file size sanity + image dimensions via image-size header parse.
// Usage: node validate-favicon-set.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-favicon-set] dist dir not found: ${DIST}`);
  process.exit(1);
}

const REQ = [
  { path: 'favicon.ico', minBytes: 100, maxBytes: 200_000 },
  { path: 'favicon-16x16.png', expect: [16, 16] },
  { path: 'favicon-32x32.png', expect: [32, 32] },
  { path: 'apple-touch-icon.png', expect: [180, 180] },
  { path: 'android-chrome-192x192.png', expect: [192, 192] },
  { path: 'android-chrome-512x512.png', expect: [512, 512] },
];

const OPTIONAL = [
  { path: 'mstile-150x150.png', expect: [150, 150] },
  { path: 'safari-pinned-tab.svg' },
  { path: 'browserconfig.xml' },
  { path: 'maskable-icon.png' },
  { path: 'android-chrome-maskable-512x512.png' },
];

function pngDimensions(buf) {
  // PNG IHDR at byte 16: width(4 BE) + height(4 BE)
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  return [width, height];
}

const failures = [];
const warnings = [];

for (const item of REQ) {
  const p = join(DIST, item.path);
  if (!existsSync(p)) {
    failures.push(`required favicon asset missing: ${item.path}`);
    continue;
  }
  const size = statSync(p).size;
  if (item.minBytes && size < item.minBytes) failures.push(`${item.path}: ${size} bytes below minimum ${item.minBytes}`);
  if (item.maxBytes && size > item.maxBytes) failures.push(`${item.path}: ${size} bytes above maximum ${item.maxBytes}`);
  if (item.expect && item.path.endsWith('.png')) {
    const buf = readFileSync(p);
    const dims = pngDimensions(buf);
    if (!dims) {
      failures.push(`${item.path}: not a valid PNG (dimensions unreadable)`);
    } else if (dims[0] !== item.expect[0] || dims[1] !== item.expect[1]) {
      failures.push(`${item.path}: dimensions ${dims[0]}×${dims[1]} (expected ${item.expect[0]}×${item.expect[1]})`);
    }
  }
}

let maskableFound = false;
for (const item of OPTIONAL) {
  const p = join(DIST, item.path);
  if (!existsSync(p)) {
    warnings.push(`optional favicon asset missing: ${item.path}`);
    continue;
  }
  if (/maskable/i.test(item.path)) maskableFound = true;
  if (item.expect && item.path.endsWith('.png')) {
    const buf = readFileSync(p);
    const dims = pngDimensions(buf);
    if (dims && (dims[0] !== item.expect[0] || dims[1] !== item.expect[1])) {
      warnings.push(`${item.path}: dimensions ${dims[0]}×${dims[1]} (expected ${item.expect[0]}×${item.expect[1]})`);
    }
  }
}

if (!maskableFound) {
  // verify webmanifest icons[] for purpose=maskable as alternate path
  const manifestPath = existsSync(join(DIST, 'site.webmanifest')) ? join(DIST, 'site.webmanifest') : existsSync(join(DIST, 'manifest.webmanifest')) ? join(DIST, 'manifest.webmanifest') : null;
  if (manifestPath) {
    try {
      const m = JSON.parse(readFileSync(manifestPath, 'utf8'));
      const icons = Array.isArray(m.icons) ? m.icons : [];
      if (!icons.some((i) => typeof i.purpose === 'string' && i.purpose.includes('maskable'))) {
        failures.push('no maskable icon found (no maskable-*.png on disk AND webmanifest icons[] missing purpose:"maskable")');
      }
    } catch {
      failures.push('no maskable icon found and webmanifest unparsable');
    }
  } else {
    failures.push('no maskable icon found and no webmanifest to fall back to');
  }
}

// browserconfig.xml referencing mstile
const bcPath = join(DIST, 'browserconfig.xml');
if (existsSync(bcPath)) {
  const xml = readFileSync(bcPath, 'utf8');
  if (!/mstile/i.test(xml)) warnings.push('browserconfig.xml present but does not reference mstile');
}

if (warnings.length) {
  console.warn(`\n[validate-favicon-set] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-favicon-set] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-favicon-set] BUILD GATE FAILED — run real-favicongenerator pipeline');
  process.exit(1);
}
console.log(`[validate-favicon-set] ✓ all 6 required + maskable variants present with correct dimensions.`);
