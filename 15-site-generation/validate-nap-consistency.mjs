#!/usr/bin/env node
// validate-nap-consistency.mjs — build gate for projectsites.dev local-business NAP integrity
// Verifies: business.name + business.formatted_address + business.formatted_phone_number from
//           _research.json appear on EVERY user-facing dist/**/*.html page (header/body/footer).
//           Phone is normalized (digits-only compare) so "(973) 555-0123" matches "+1 973 555 0123".
//           Optional GPT-4o vision check confirms <iframe src*="google.com/maps"> address matches research.
// Usage: node validate-nap-consistency.mjs <build-dir>
//   build-dir must contain _research.json AND dist/**/*.html
// Env: OPENAI_API_KEY required for vision map verification (skipped with warning if missing)
// Exit 0 = pass, exit 1 = fail (build break). Skips entirely when business.type !== "local-business".

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const RESEARCH_PATH = join(BUILD, '_research.json');
const DIST_DIR = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;

if (!existsSync(RESEARCH_PATH)) {
  console.error(`[validate-nap-consistency] _research.json not found at ${RESEARCH_PATH}`);
  process.exit(1);
}
if (!existsSync(DIST_DIR)) {
  console.error(`[validate-nap-consistency] dist directory not found at ${DIST_DIR}`);
  process.exit(1);
}

const research = JSON.parse(readFileSync(RESEARCH_PATH, 'utf8'));
const business = research.business || research.profile || {};
const failures = [];
const warnings = [];

// Gate 0 — only enforce on local-business mode
const mode = research.mode || business.type || business.business_type || '';
const isLocalBusiness =
  mode === 'local-business' ||
  /restaurant|salon|barber|medical|dental|clinic|store|shop|gym|fitness|spa/i.test(
    business.business_type || business.category || '',
  );
if (!isLocalBusiness) {
  console.log(`[validate-nap-consistency] mode="${mode}" — not a local business, skipping NAP gate`);
  process.exit(0);
}

// Gate 1 — required _research.json fields
const name = (business.name || '').trim();
const address = (business.formatted_address || business.address || '').trim();
const phone = (business.formatted_phone_number || business.phone || '').trim();
if (!name) failures.push('_research.json.business.name missing — NAP gate cannot run');
if (!address) failures.push('_research.json.business.formatted_address missing — NAP gate cannot run');
if (!phone) failures.push('_research.json.business.formatted_phone_number missing — NAP gate cannot run');
if (failures.length) {
  console.error(`\n[validate-nap-consistency] ${failures.length} pre-flight failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  process.exit(1);
}

// Helpers
const normPhone = (s) => (s || '').replace(/\D/g, '');
const normText = (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
const RESEARCH_PHONE_DIGITS = normPhone(phone);
const RESEARCH_NAME_LOWER = normText(name);
const RESEARCH_ADDRESS_LOWER = normText(address);
// Address can be split across header/footer (street + city/state/zip on different lines)
// so we also accept the street fragment alone as a partial match.
const ADDRESS_STREET = normText(address.split(',')[0] || '');

function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      // Skip utility / admin trees the same way build_validators.ts does
      if (/^(admin|node_modules|\.git)$/i.test(entry)) continue;
      walkHtml(full, acc);
    } else if (/\.html?$/i.test(entry) && !/^(404|500|offline)\.html?$/i.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const htmlFiles = walkHtml(DIST_DIR);
if (!htmlFiles.length) {
  console.error(`[validate-nap-consistency] no user-facing HTML files found under ${DIST_DIR}`);
  process.exit(1);
}

// Gate 2 — every page contains the canonical NAP triple
const perPageMisses = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const lower = normText(html);
  const digits = normPhone(html);
  const rel = relative(BUILD, file);
  const miss = [];
  if (!lower.includes(RESEARCH_NAME_LOWER)) miss.push(`name="${name}"`);
  if (!lower.includes(RESEARCH_ADDRESS_LOWER) && !lower.includes(ADDRESS_STREET)) miss.push(`address="${address}"`);
  if (!digits.includes(RESEARCH_PHONE_DIGITS)) miss.push(`phone="${phone}" (digits=${RESEARCH_PHONE_DIGITS})`);
  if (miss.length) perPageMisses.push({ file: rel, miss });
}
if (perPageMisses.length) {
  for (const { file, miss } of perPageMisses) {
    failures.push(`NAP missing on ${file}: ${miss.join(' | ')}`);
  }
}

// Gate 3 — phone format consistency: every <a href="tel:..."> digits-only must equal research phone digits
const TEL_RE = /<a[^>]+href=["']tel:([^"']+)["']/gi;
const telMismatch = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(BUILD, file);
  for (const match of html.matchAll(TEL_RE)) {
    const dialed = normPhone(match[1]);
    if (dialed && dialed.replace(/^1/, '') !== RESEARCH_PHONE_DIGITS.replace(/^1/, '')) {
      telMismatch.push(`${rel}: <a href="tel:${match[1]}"> dials ${dialed} but research phone is ${RESEARCH_PHONE_DIGITS}`);
    }
  }
}
if (telMismatch.length) failures.push(...telMismatch.map((m) => `tel: link mismatch — ${m}`));

// Gate 4 — every street-address render is hyperlinked to Google Maps (per always.md "Every X" rule)
const ADDRESS_LITERAL_RE = new RegExp(
  address
    .split(',')[0]
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\s+/g, '\\s+'),
  'i',
);
const HAS_MAPS_LINK_RE = /href=["']https?:\/\/(www\.)?google\.com\/maps[^"']*["']/i;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const rel = relative(BUILD, file);
  if (ADDRESS_LITERAL_RE.test(html) && !HAS_MAPS_LINK_RE.test(html)) {
    warnings.push(`${rel}: street address rendered but no Google Maps hyperlink found on page`);
  }
}

// Gate 5 — vision check: when iframe map widget present, address overlay must match research
async function verifyMapAddress() {
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set — skipping Google Maps iframe vision verification');
    return;
  }
  const homepageCandidates = [join(DIST_DIR, 'index.html'), join(DIST_DIR, 'contact.html'), join(DIST_DIR, 'contact', 'index.html')];
  const target = homepageCandidates.find(existsSync);
  if (!target) {
    warnings.push('no index.html or contact.html found — skipping vision verification');
    return;
  }
  const html = readFileSync(target, 'utf8');
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']*google\.com\/maps[^"']*)["']/i);
  if (!iframeMatch) return;
  const mapSrc = iframeMatch[1];
  // Extract `q=` or `query=` param and ensure it contains research address fragment
  const params = new URL(mapSrc.startsWith('http') ? mapSrc : `https:${mapSrc}`);
  const q = (params.searchParams.get('q') || params.searchParams.get('query') || '').toLowerCase();
  if (q && !q.includes(ADDRESS_STREET.split(' ')[0])) {
    failures.push(
      `MAP IFRAME ADDRESS MISMATCH: iframe q="${q}" does not reference research address "${address}". A wrong-pin map is worse than no map.`,
    );
  } else {
    console.log(`[validate-nap-consistency] ✓ map iframe q-param references research address`);
  }
}

await verifyMapAddress();

// Report
if (warnings.length) {
  console.warn(`\n[validate-nap-consistency] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-nap-consistency] ${failures.length} failures across ${htmlFiles.length} pages:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-nap-consistency] BUILD GATE FAILED');
  process.exit(1);
}
console.log(
  `[validate-nap-consistency] ✓ name + address + phone consistent across ${htmlFiles.length} pages (phone digits=${RESEARCH_PHONE_DIGITS})`,
);
