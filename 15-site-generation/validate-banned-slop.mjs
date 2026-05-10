#!/usr/bin/env node
// validate-banned-slop.mjs — anti-AI-slop copy gate (rules/copy-writing.md)
// Two banned lists: marketing-slop ("limitless|revolutionize|game-changing|...") and
// unsourced-authority ("studies show|research suggests|most users|...") — both fail build
// when present in dist HTML body text. Stripped of HTML tags, lowercased, exact-word match.
// Citation gate: any number-pattern (\d+%, $\d+[MBK], \d+x faster|more|times, since \d{4})
// must appear within 200 chars of a citation marker `(Author, Year)` or be in same block as
// a <cite>/<sup>/[refId] anchor. Unsourced numbers fail.
// Usage: node validate-banned-slop.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-banned-slop] dist dir not found: ${DIST}`);
  process.exit(1);
}

const MARKETING_SLOP = [
  'limitless', 'revolutionize', 'revolutionary', 'game-changing', 'cutting-edge', 'next-generation',
  'world-class', 'best-in-class', 'turnkey', 'synergy', 'disrupt', 'empower', 'seamless', 'robust',
  'scalable', 'leverage', 'utilize', 'facilitate', 'innovative', 'state-of-the-art', 'paradigm',
  'holistic', 'harness', 'foster', 'bolster', 'spearhead', 'delve', 'tapestry', 'landscape',
  'ecosystem', 'elevate', 'streamline', 'cornerstone', 'pivotal', 'myriad', 'plethora',
  'supercharge', 'unleash', 'unlock', 'transform', 'reimagine', 'redefine', 'transcend', 'boundless',
];

const UNSOURCED_AUTHORITY = [
  'studies show', 'research suggests', 'most users', 'industry-leading', 'trusted by', 'proven',
  'widely-recognized', 'leading provider', 'cutting-edge research', 'recent studies', 'experts agree',
  'countless', 'numerous', 'many users', 'some users', 'often', 'typically', 'generally',
];

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

function stripHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const failures = [];
const warnings = [];
const htmlFiles = walkHtml(DIST);

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const text = stripHtml(html);
  const lower = text.toLowerCase();

  for (const word of MARKETING_SLOP) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')}\\b`, 'i');
    if (re.test(lower)) failures.push(`${rel}: banned marketing-slop word "${word}"`);
  }
  for (const phrase of UNSOURCED_AUTHORITY) {
    if (lower.includes(phrase)) failures.push(`${rel}: banned unsourced-authority phrase "${phrase}"`);
  }

  // Citation gate — quantitative claims need (Author, Year) within 200 chars
  const NUM_PATTERNS = [
    /\b\d+(?:\.\d+)?%/g,
    /\$\d+(?:[.,]\d+)?[MBK]?\b/g,
    /\b\d+x\s+(?:faster|more|times|less)\b/gi,
    /\b\d+\+?\s+(?:users|customers|clients|members|patients)\b/gi,
    /\bsince\s+\d{4}\b/gi,
  ];
  const CITE_RE = /\([A-Z][A-Za-z .,&-]+,\s*\d{4}[a-z]?\)/;
  for (const pat of NUM_PATTERNS) {
    pat.lastIndex = 0;
    let m;
    while ((m = pat.exec(text)) !== null) {
      const start = Math.max(0, m.index - 200);
      const end = Math.min(text.length, m.index + m[0].length + 200);
      const window = text.slice(start, end);
      if (!CITE_RE.test(window) && !/\bcite\b|\[ref\d+\]|†|\[\d+\]/i.test(window)) {
        failures.push(`${rel}: unsourced quantitative claim "${m[0]}" — needs (Author, Year) APA citation within 200 chars`);
      }
    }
  }
}

if (warnings.length) {
  console.warn(`\n[validate-banned-slop] ${warnings.length} warnings:`);
  warnings.slice(0, 20).forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-banned-slop] ${failures.length} failures across ${htmlFiles.length} pages:`);
  failures.slice(0, 50).forEach((f) => console.error(`  ✗ ${f}`));
  if (failures.length > 50) console.error(`  ...+${failures.length - 50} more`);
  console.error('\n[validate-banned-slop] BUILD GATE FAILED — see rules/copy-writing.md + rules/citations.md');
  process.exit(1);
}
console.log(`[validate-banned-slop] ✓ ${htmlFiles.length} pages clean of banned slop + unsourced quantitative claims.`);
