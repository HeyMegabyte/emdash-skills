#!/usr/bin/env node
// validate-typography.mjs — typography extraction integrity gate
// _brand.json declares the source-extracted fonts (logo, heading, body) — those EXACT fonts
// must appear in the rebuild's <link rel="stylesheet"> imports or @import / font-family
// declarations. Generic substitution (Inter, Space Grotesk) when source has chosen with
// intent destroys brand identity (lonemountainglobal.com Poppins+Hind incident).
// Usage: node validate-typography.mjs <build-dir>
//   build-dir: contains _brand.json + dist/ with HTML+CSS
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const BRAND_PATH = join(BUILD, '_brand.json');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(BRAND_PATH)) {
  console.error(`[validate-typography] _brand.json not found at ${BRAND_PATH}`);
  process.exit(1);
}
if (!existsSync(DIST)) {
  console.error(`[validate-typography] dist dir not found: ${DIST}`);
  process.exit(1);
}

const brand = JSON.parse(readFileSync(BRAND_PATH, 'utf8'));
const fonts = brand.fonts ?? {};

if (!fonts.heading && !fonts.body) {
  console.warn('[validate-typography] _brand.json.fonts is empty — skipping (set fonts.{heading,body} during research)');
  process.exit(0);
}

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => entry.toLowerCase().endsWith(e))) out.push(p);
  }
  return out;
}

const files = [...walk(DIST, ['.html', '.css', '.js'])];
const allText = files.map((f) => readFileSync(f, 'utf8')).join('\n');

const failures = [];
const warnings = [];

const SUBSTITUTION_FONTS = [
  'Inter', 'Space Grotesk', 'Manrope', 'Poppins', 'Roboto', 'Open Sans',
  'system-ui', 'Sora', 'DM Sans', 'Cabinet Grotesk', 'General Sans',
];

function fontPresent(name) {
  if (!name) return false;
  // Match in CSS @import urls, <link href="...family=Name">, font-family: 'Name'
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const reCss = new RegExp(`font-family\\s*:\\s*[^;]*['"\`]?${escaped}['"\`]?`, 'i');
  const reLink = new RegExp(`fonts\\.googleapis\\.com[^"']*family=${escaped.replace(/ /g, '\\+')}`, 'i');
  const reAtImport = new RegExp(`@import[^;]*${escaped.replace(/ /g, '\\+')}`, 'i');
  return reCss.test(allText) || reLink.test(allText) || reAtImport.test(allText);
}

for (const slot of ['heading', 'body', 'logo']) {
  const declared = fonts[slot];
  if (!declared) continue;
  const isExtracted = fonts[`${slot}_source`] === 'extracted' || fonts.source === 'extracted';
  if (!fontPresent(declared)) {
    if (isExtracted) {
      failures.push(`source-extracted ${slot} font "${declared}" not found in dist HTML/CSS — substitution detected`);
    } else {
      warnings.push(`${slot} font "${declared}" declared in _brand.json but not used in build`);
    }
  }
  // If declared is extracted but a generic substitution font is also present, flag it
  if (isExtracted) {
    for (const sub of SUBSTITUTION_FONTS) {
      if (sub === declared) continue;
      if (fontPresent(sub)) {
        warnings.push(`${slot} declared "${declared}" (extracted) but generic "${sub}" also used — possible accidental fallback`);
      }
    }
  }
}

if (warnings.length) {
  console.warn(`\n[validate-typography] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-typography] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-typography] BUILD GATE FAILED — preserve source-extracted fonts');
  process.exit(1);
}
console.log(`[validate-typography] ✓ source fonts preserved (heading=${fonts.heading ?? '-'}, body=${fonts.body ?? '-'}, logo=${fonts.logo ?? '-'}).`);
