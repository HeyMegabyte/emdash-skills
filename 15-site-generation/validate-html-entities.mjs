#!/usr/bin/env node
// validate-html-entities.mjs — banned HTML entity gate (rules/copy-writing.md typography rule)
// JSX entity decoding only fires for JSX text children, NOT for JS string literals piped
// through {variable} or stored in data arrays — those render the literal `&apos;` to the user.
// This validator greps both source (.tsx/.jsx/.ts) AND build output (.html) and fails on any
// match. Use raw Unicode: ' " " … – — · (U+00A0) instead.
// Usage: node validate-html-entities.mjs <build-dir>
//   build-dir: project root (scans src/ + dist/) or dist (scans dist only)
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(process.argv[2] || '.');
if (!existsSync(ROOT)) {
  console.error(`[validate-html-entities] dir not found: ${ROOT}`);
  process.exit(1);
}

const SCAN_DIRS = ['src', 'dist', 'public'].filter((d) => existsSync(join(ROOT, d)));
const SOURCE_EXTS = ['.tsx', '.jsx', '.ts', '.js', '.mjs'];
const HTML_EXTS = ['.html'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', '.vite', '.turbo']);

const BANNED_ENTITIES = [
  '&apos;', '&middot;', '&amp;', '&ldquo;', '&rdquo;', '&hellip;',
  '&ndash;', '&mdash;', '&nbsp;', '&quot;', '&lsquo;', '&rsquo;',
  '&#39;', '&#34;', '&#160;', '&#8217;', '&#8220;', '&#8221;', '&#8230;',
];

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => entry.toLowerCase().endsWith(e))) out.push(p);
  }
  return out;
}

const failures = [];
let scanned = 0;

for (const sub of SCAN_DIRS) {
  const dir = join(ROOT, sub);
  const exts = sub === 'src' ? SOURCE_EXTS : sub === 'public' ? HTML_EXTS : [...HTML_EXTS, ...SOURCE_EXTS];
  const files = walk(dir, exts);
  for (const file of files) {
    scanned++;
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip CSS @import statements (rare false positives) and JSDoc comments
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
      for (const ent of BANNED_ENTITIES) {
        const idx = line.indexOf(ent);
        if (idx === -1) continue;
        // For .tsx/.jsx files, allow entities ONLY in JSX text content.
        // Heuristic: if entity appears inside a JS string literal (quotes or backticks)
        // or inside a {} expression interpolation, that's the bug we want to flag.
        // For .html files, all entities are flagged.
        failures.push(`${relative(ROOT, file)}:${i + 1}: banned entity "${ent}" — use raw Unicode`);
        break; // one report per line
      }
    }
  }
}

if (failures.length) {
  console.error(`\n[validate-html-entities] ${failures.length} occurrences across ${scanned} files:`);
  failures.slice(0, 50).forEach((f) => console.error(`  ✗ ${f}`));
  if (failures.length > 50) console.error(`  ... +${failures.length - 50} more`);
  console.error('\n[validate-html-entities] BUILD GATE FAILED — replace with raw Unicode (U+2019 ‘ U+201C " U+2026 …)');
  process.exit(1);
}
console.log(`[validate-html-entities] ✓ ${scanned} files scanned, no banned entities found.`);
