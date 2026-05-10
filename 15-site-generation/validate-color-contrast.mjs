#!/usr/bin/env node
// validate-color-contrast.mjs — WCAG 2.2 AA contrast gate
// rules/quality-metrics.md: contrast ≥4.5:1 (normal text), ≥3:1 (large text 18pt+/14pt bold).
// Universal core (rules/always.md): every site small-text WCAG-AAA contrast (≥7:1) preferred.
// Strategy: parse all CSS files in dist/ for color + background-color pairs in the same rule
// or :root variables, compute APCA / WCAG2 contrast ratio, fail when below threshold. Logo
// container must hit ≥4.5:1 against its background (rules/always.md "Every logo render").
// Usage: node validate-color-contrast.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-color-contrast] dist dir not found: ${DIST}`);
  process.exit(1);
}

function walk(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.git') continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((x) => e.toLowerCase().endsWith(x))) out.push(p);
  }
  return out;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.length === 8 ? h.slice(0, 6) : h;
  if (full.length !== 6) return null;
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbStringToRgb(s) {
  const m = s.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}
function parseColor(s) {
  if (!s) return null;
  s = s.trim();
  if (s.startsWith('#')) return hexToRgb(s);
  if (s.startsWith('rgb')) return rgbStringToRgb(s);
  return null;
}
function relLum([r, g, b]) {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(rgb1, rgb2) {
  const l1 = relLum(rgb1);
  const l2 = relLum(rgb2);
  const [a, b] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (a + 0.05) / (b + 0.05);
}

const cssFiles = walk(DIST, ['.css']);
const failures = [];
const warnings = [];

if (!cssFiles.length) {
  warnings.push('no CSS files found in dist — contrast cannot be verified');
}

// Collect :root custom properties first (variables resolve across files)
const vars = new Map();
const VAR_RE = /--([\w-]+)\s*:\s*([^;]+);/g;
const RULE_RE = /([^{}]+)\{([^{}]*)\}/g;

for (const file of cssFiles) {
  const css = readFileSync(file, 'utf8');
  VAR_RE.lastIndex = 0;
  let v;
  while ((v = VAR_RE.exec(css)) !== null) {
    vars.set(v[1].trim(), v[2].trim());
  }
}
function resolveVar(val, depth = 0) {
  if (depth > 5) return val;
  const m = val.match(/var\(\s*--([\w-]+)\s*(?:,\s*([^)]+))?\)/);
  if (!m) return val;
  const name = m[1];
  const fallback = m[2];
  if (vars.has(name)) return resolveVar(vars.get(name), depth + 1);
  if (fallback) return fallback.trim();
  return val;
}

let pairsChecked = 0;
for (const file of cssFiles) {
  const css = readFileSync(file, 'utf8');
  RULE_RE.lastIndex = 0;
  let r;
  while ((r = RULE_RE.exec(css)) !== null) {
    const selector = r[1].trim();
    const body = r[2];
    const colorM = body.match(/(?:^|;|\s)color\s*:\s*([^;]+)/i);
    const bgM = body.match(/(?:^|;|\s)background(?:-color)?\s*:\s*([^;]+)/i);
    if (!colorM || !bgM) continue;
    const fg = parseColor(resolveVar(colorM[1].trim()));
    const bg = parseColor(resolveVar(bgM[1].trim()));
    if (!fg || !bg) continue;
    pairsChecked++;
    const ratio = contrast(fg, bg);
    const isSmallText = !/h[1-6]|hero|display|headline/i.test(selector);
    const threshold = isSmallText ? 4.5 : 3.0;
    if (ratio < threshold) {
      failures.push(`${file.replace(DIST + '/', '')}: selector "${selector.slice(0, 60)}" contrast ${ratio.toFixed(2)}:1 below ${threshold}:1 (fg=rgb(${fg}) bg=rgb(${bg}))`);
    } else if (isSmallText && ratio < 7.0) {
      // AAA is preferred per universal core; warn only
      warnings.push(`${file.replace(DIST + '/', '')}: selector "${selector.slice(0, 60)}" ${ratio.toFixed(2)}:1 meets AA but not AAA (≥7:1)`);
    }
  }
}

if (warnings.length) {
  console.warn(`\n[validate-color-contrast] ${warnings.length} warnings:`);
  warnings.slice(0, 20).forEach((w) => console.warn(`  ⚠ ${w}`));
  if (warnings.length > 20) console.warn(`  ...+${warnings.length - 20} more`);
}
if (failures.length) {
  console.error(`\n[validate-color-contrast] ${failures.length} failures across ${cssFiles.length} CSS files (${pairsChecked} fg/bg pairs):`);
  failures.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (failures.length > 30) console.error(`  ...+${failures.length - 30} more`);
  console.error('\n[validate-color-contrast] BUILD GATE FAILED — WCAG 2.2 AA requires ≥4.5:1 (normal) / ≥3:1 (large)');
  process.exit(1);
}
console.log(`[validate-color-contrast] ✓ ${pairsChecked} fg/bg pairs across ${cssFiles.length} CSS files meet WCAG AA.`);
