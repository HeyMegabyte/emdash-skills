#!/usr/bin/env node
// validate-source-fidelity.mjs — source-vs-rebuild visual fidelity gate (GPT-4o vision)
// rules/always.md "Every site rebuild source site exists logo walks + theme match + brand-
// splash". Compares source-site screenshot (saved as _source_screenshot.png) against rebuilt
// homepage screenshot (saved as _rebuild_screenshot.png) and asks GPT-4o to score:
//   logo_match (bool), color_match (0-10), typography_match (0-10), hero_structure (0-10),
//   overall_fidelity (0-10), missing_elements (string[]).
// Pass requires: logo_match=true, all scores ≥7, overall ≥8. References lonemountainglobal
// Poppins+Hind regression incident — fonts/colors/structure must mirror source.
// Caches result in .source-fidelity-cache.json keyed by sha256(source_png + rebuild_png).
// Usage: node validate-source-fidelity.mjs <build-dir>
//   build-dir: contains _source_screenshot.png + _rebuild_screenshot.png
// Exit 0 = pass (or skipped — no source to compare), exit 1 = fail.

import { readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const BUILD = resolve(process.argv[2] || '.');
const SOURCE_PNG = join(BUILD, '_source_screenshot.png');
const REBUILD_PNG = join(BUILD, '_rebuild_screenshot.png');
const CACHE_PATH = join(BUILD, '.source-fidelity-cache.json');
const BRAND_PATH = join(BUILD, '_brand.json');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.warn('[validate-source-fidelity] OPENAI_API_KEY unset — skipping');
  process.exit(0);
}
if (!existsSync(SOURCE_PNG)) {
  console.warn(`[validate-source-fidelity] _source_screenshot.png not found — skipping (no source to compare)`);
  process.exit(0);
}
if (!existsSync(REBUILD_PNG)) {
  console.error(`[validate-source-fidelity] _rebuild_screenshot.png missing — capture the rebuilt homepage before running this gate`);
  process.exit(1);
}

const sourceBuf = readFileSync(SOURCE_PNG);
const rebuildBuf = readFileSync(REBUILD_PNG);
const cacheKey = createHash('sha256').update(sourceBuf).update(rebuildBuf).digest('hex');
const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};

let result = cache[cacheKey];
if (!result) {
  const sourceUrl = `data:image/png;base64,${sourceBuf.toString('base64')}`;
  const rebuildUrl = `data:image/png;base64,${rebuildBuf.toString('base64')}`;
  const brand = existsSync(BRAND_PATH) ? JSON.parse(readFileSync(BRAND_PATH, 'utf8')) : {};
  const fontsHint = brand.fonts ? `Source fonts: heading=${brand.fonts.heading ?? '?'} body=${brand.fonts.body ?? '?'}.` : '';
  const colorsHint = brand.primary ? `Source primary=${brand.primary} secondary=${brand.secondary ?? '?'}.` : '';

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Image 1 = SOURCE site homepage. Image 2 = REBUILT homepage. ${fontsHint} ${colorsHint} The rebuild MUST recreate source brand identity: same logo, same colors, same typography, same hero structure. Score 0-10 each. Return ONLY JSON:\n{\n  "logo_match": <bool>,\n  "color_match": <0-10>,\n  "typography_match": <0-10>,\n  "hero_structure": <0-10>,\n  "overall_fidelity": <0-10>,\n  "missing_elements": ["..."],\n  "notes": "<≤200 chars>"\n}` },
            { type: 'image_url', image_url: { url: sourceUrl } },
            { type: 'image_url', image_url: { url: rebuildUrl } },
          ],
        },
      ],
    }),
  });
  if (!resp.ok) {
    console.error(`[validate-source-fidelity] OpenAI error ${resp.status}: ${await resp.text()}`);
    process.exit(1);
  }
  const j = await resp.json();
  const txt = j.choices?.[0]?.message?.content ?? '';
  const jsonM = txt.match(/\{[\s\S]*\}/);
  if (!jsonM) {
    console.error(`[validate-source-fidelity] unparsable response: ${txt.slice(0, 300)}`);
    process.exit(1);
  }
  result = JSON.parse(jsonM[0]);
  cache[cacheKey] = result;
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

const failures = [];
const warnings = [];
if (result.logo_match === false) failures.push(`logo_match=false — rebuild logo does not match source. Notes: ${result.notes ?? ''}`);
if (typeof result.color_match === 'number' && result.color_match < 7) failures.push(`color_match=${result.color_match}/10 (must be ≥7) — colors drifted from source brand. Notes: ${result.notes ?? ''}`);
if (typeof result.typography_match === 'number' && result.typography_match < 7) failures.push(`typography_match=${result.typography_match}/10 (must be ≥7) — fonts substituted. Cross-check _brand.json.fonts. Notes: ${result.notes ?? ''}`);
if (typeof result.hero_structure === 'number' && result.hero_structure < 7) failures.push(`hero_structure=${result.hero_structure}/10 (must be ≥7) — hero layout diverges from source.`);
if (typeof result.overall_fidelity === 'number' && result.overall_fidelity < 8) failures.push(`overall_fidelity=${result.overall_fidelity}/10 (must be ≥8) — rebuild fails source-fidelity gate.`);
if (Array.isArray(result.missing_elements) && result.missing_elements.length > 0) {
  warnings.push(`missing elements from source: ${result.missing_elements.join(', ')}`);
}

if (warnings.length) {
  console.warn(`\n[validate-source-fidelity] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-source-fidelity] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-source-fidelity] BUILD GATE FAILED — see lonemountainglobal Poppins+Hind regression');
  process.exit(1);
}
console.log(`[validate-source-fidelity] ✓ rebuild matches source: logo=${result.logo_match} color=${result.color_match}/10 type=${result.typography_match}/10 hero=${result.hero_structure}/10 overall=${result.overall_fidelity}/10.`);
