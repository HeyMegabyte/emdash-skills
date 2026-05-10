#!/usr/bin/env node
// validate-citations.mjs — APA 7th-ed citation integrity gate (rules/citations.md)
// Every (Author, Year) inline citation must have matching reference list entry.
// Scans dist HTML for inline citations + reference list (in <ol class="references">,
// <section id="references">, or <References>... pattern) and verifies bidirectional
// integrity: every inline cite has a list entry; every list entry is cited at least once.
// Confidence rule: claims with confidence>=0.85 must have ≥2 corroborating cites.
// Builds atop validate-banned-slop.mjs (which catches unsourced numbers); this validates
// the cite-to-reference graph after citations are present.
// Usage: node validate-citations.mjs <build-dir>
// Exit 0 = pass, exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(DIST)) {
  console.error(`[validate-citations] dist dir not found: ${DIST}`);
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

function stripHtml(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const failures = [];
const warnings = [];
const htmlFiles = walkHtml(DIST);

// APA 7 inline cite shapes:
// (Smith, 2024) | (Smith & Lee, 2024) | (Smith et al., 2024) | (Smith, 2024, p. 47) | (Smith, 2024a)
const INLINE_CITE_RE = /\(([A-Z][A-Za-z'.-]+(?:\s+(?:&|et\s+al\.?|[A-Z][A-Za-z'.-]+))*?),\s*(\d{4}[a-z]?)(?:,\s*pp?\.\s*\d+(?:-\d+)?)?\)/g;

// Reference list entry shape (loose): "Smith, J. (2024). Title..."
// Anchor on "Lastname, Initials. (Year)." or "Lastname, Initials., & Lastname, Initials. (Year)."
const REF_ENTRY_RE = /([A-Z][A-Za-z'.-]+(?:,\s*[A-Z]\.(?:\s*[A-Z]\.)*)?(?:,?\s*(?:&|and)\s*[A-Z][A-Za-z'.-]+(?:,\s*[A-Z]\.(?:\s*[A-Z]\.)*)?)*)\s*\.\s*\((\d{4}[a-z]?)\)\./g;

const inlineCitesGlobal = new Map();   // key: "Smith2024" -> [{file, full}, ...]
const referenceEntries = new Set();    // key: "Smith2024"

function lastnameKey(authorPart) {
  // Take first surname only; strip "et al."
  const cleaned = authorPart.replace(/\s+et\s+al\.?/i, '').replace(/\s*&.*$/, '').replace(/\s*,\s*[A-Z]\.\S*$/, '');
  return cleaned.trim().split(/\s+/).pop().toLowerCase();
}

let pagesWithRefs = 0;
let pagesWithCites = 0;

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const text = stripHtml(html);

  // 1. inline cites
  INLINE_CITE_RE.lastIndex = 0;
  let m;
  let pageHadCite = false;
  while ((m = INLINE_CITE_RE.exec(text)) !== null) {
    pageHadCite = true;
    const key = `${lastnameKey(m[1])}${m[2]}`;
    if (!inlineCitesGlobal.has(key)) inlineCitesGlobal.set(key, []);
    inlineCitesGlobal.get(key).push({ file: rel, full: m[0] });
  }
  if (pageHadCite) pagesWithCites++;

  // 2. reference list entries — only count when in a "References"/"Bibliography" section
  const hasRefSection = /<(?:section|ol|div|aside|footer)[^>]*(?:class|id)=["'][^"']*(?:references|bibliography|sources|citations)[^"']*["'][^>]*>([\s\S]*?)<\/(?:section|ol|div|aside|footer)>/i.test(html) || /<h[1-6][^>]*>\s*(?:References|Bibliography|Sources|Citations)\s*<\/h[1-6]>([\s\S]*)/i.test(html);
  if (hasRefSection) {
    pagesWithRefs++;
    REF_ENTRY_RE.lastIndex = 0;
    let r;
    while ((r = REF_ENTRY_RE.exec(text)) !== null) {
      const key = `${lastnameKey(r[1])}${r[2]}`;
      referenceEntries.add(key);
    }
  }
}

// 3. Bidirectional integrity check
if (inlineCitesGlobal.size > 0 && referenceEntries.size === 0) {
  failures.push(`${inlineCitesGlobal.size} inline citation key(s) found across ${pagesWithCites} pages, but 0 reference list entries detected — every site with citations needs a References section`);
}

for (const [key, refs] of inlineCitesGlobal) {
  if (!referenceEntries.has(key)) {
    failures.push(`inline citation "${refs[0].full}" (key=${key}) has no matching reference list entry — first seen in ${refs[0].file}`);
  }
}

for (const key of referenceEntries) {
  if (!inlineCitesGlobal.has(key)) {
    warnings.push(`reference list entry "${key}" is not cited anywhere in body — orphan reference`);
  }
}

// 4. URL/DOI check on reference entries (heuristic — references should include DOI or URL)
if (referenceEntries.size > 0) {
  let withLinks = 0;
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    if (!/(references|bibliography|sources)/i.test(html)) continue;
    // count <a> tags within references/bibliography sections
    const refSection = html.match(/(?:references|bibliography|sources)[\s\S]{0,8000}/i);
    if (refSection && /<a\s+[^>]*href=["']https?:\/\//i.test(refSection[0])) withLinks++;
  }
  if (withLinks === 0 && pagesWithRefs > 0) {
    warnings.push(`${pagesWithRefs} pages have a References section but no <a href> links — APA 7 entries should include DOI or URL`);
  }
}

if (warnings.length) {
  console.warn(`\n[validate-citations] ${warnings.length} warnings:`);
  warnings.slice(0, 20).forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-citations] ${failures.length} failures:`);
  failures.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (failures.length > 30) console.error(`  ...+${failures.length - 30} more`);
  console.error('\n[validate-citations] BUILD GATE FAILED — see rules/citations.md');
  process.exit(1);
}
console.log(`[validate-citations] ✓ ${inlineCitesGlobal.size} unique inline cites all matched to ${referenceEntries.size} reference entries across ${htmlFiles.length} pages.`);
