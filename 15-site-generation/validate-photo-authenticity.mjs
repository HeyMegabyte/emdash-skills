#!/usr/bin/env node
// validate-photo-authenticity.mjs — build gate against generic stock photos on team/about/gallery pages
// Verifies: every <img> on team*/about*/gallery*/staff* HTML pages scores ≥7/10 via GPT-4o vision on
//           "does this look like an actual person/location specific to {business_name}, or generic stock?"
// Usage: node validate-photo-authenticity.mjs <build-dir>
//   build-dir must contain _research.json AND dist/**/*.html
// Env: OPENAI_API_KEY required (no deterministic fallback — the gate IS the vision call).
//      VISION_BUDGET (default 30) caps total GPT-4o image scoring calls per build to prevent
//      runaway costs on photo-dense rebuilds. Excess images are sampled, not skipped.
//      AUTHENTICITY_THRESHOLD (default 7) is the per-image pass score on the 0-10 rubric.
// Exit 0 = pass, exit 1 = fail (build break). Logs every score for the audit trail.

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const RESEARCH_PATH = join(BUILD, '_research.json');
const DIST_DIR = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;
const REPORT_PATH = join(BUILD, '_photo_authenticity_report.json');
const BUDGET = Math.max(1, parseInt(process.env.VISION_BUDGET || '30', 10));
const THRESHOLD = Math.max(1, Math.min(10, parseInt(process.env.AUTHENTICITY_THRESHOLD || '7', 10)));

if (!existsSync(RESEARCH_PATH)) {
  console.error(`[validate-photo-authenticity] _research.json not found at ${RESEARCH_PATH}`);
  process.exit(1);
}
if (!existsSync(DIST_DIR)) {
  console.error(`[validate-photo-authenticity] dist directory not found at ${DIST_DIR}`);
  process.exit(1);
}

const research = JSON.parse(readFileSync(RESEARCH_PATH, 'utf8'));
const business = research.business || research.profile || {};
const businessName = business.name || 'this business';
const businessType = business.business_type || business.category || 'local business';
const businessLocation = business.formatted_address || business.address || '';
const failures = [];
const warnings = [];
const scores = [];

function walkHtml(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (/^(admin|node_modules|\.git)$/i.test(entry)) continue;
      walkHtml(full, acc);
    } else if (/\.html?$/i.test(entry) && !/^(404|500|offline)\.html?$/i.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const TARGET_PAGE_RE = /(team|about|gallery|staff|leadership|people|portfolio|projects)/i;
const targetPages = walkHtml(DIST_DIR).filter((p) => TARGET_PAGE_RE.test(relative(DIST_DIR, p)));
if (!targetPages.length) {
  console.log(
    '[validate-photo-authenticity] no team/about/gallery/staff pages found — skipping authenticity gate',
  );
  process.exit(0);
}

// Extract <img> sources, scoped to <main>/<section>/<article> (skip nav/footer/header sponsorship logos)
const IMG_RE = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
const SKIP_HOST_RE = /(facebook|twitter|instagram|linkedin|x\.com|cdn\.brandfetch|logo\.dev|favicon)/i;
const candidates = [];
for (const file of targetPages) {
  const html = readFileSync(file, 'utf8');
  // Crude main-content scope: drop everything inside <header> and <footer>
  const body = html
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');
  for (const m of body.matchAll(IMG_RE)) {
    const src = m[1];
    if (!src) continue;
    if (src.startsWith('data:')) continue;
    if (SKIP_HOST_RE.test(src)) continue;
    if (/\.svg(\?|$)/i.test(src)) continue;
    candidates.push({ file: relative(BUILD, file), src });
  }
}

if (!candidates.length) {
  console.log('[validate-photo-authenticity] no qualifying <img> tags found on team/about/gallery pages');
  process.exit(0);
}

// Sample down to budget if oversubscribed (deterministic — every Nth image)
let toScore = candidates;
if (candidates.length > BUDGET) {
  const stride = Math.ceil(candidates.length / BUDGET);
  toScore = candidates.filter((_, i) => i % stride === 0).slice(0, BUDGET);
  warnings.push(
    `${candidates.length} images exceed VISION_BUDGET=${BUDGET}; sampling every ${stride}th image (${toScore.length} scored)`,
  );
}

if (!process.env.OPENAI_API_KEY) {
  // No deterministic fallback — info-handoff per build_validators.ts photo.authenticity_unverified pattern
  console.warn(
    `[validate-photo-authenticity] ⚠ OPENAI_API_KEY not set — cannot verify ${candidates.length} candidate images. Emitting handoff to visual-qa subagent.`,
  );
  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      {
        ok: null,
        reason: 'OPENAI_API_KEY missing — vision gate skipped',
        candidates,
        threshold: THRESHOLD,
        handoff: 'visual-qa',
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const RUBRIC = `You are auditing a photo on a small-business website to detect generic stock vs. authentic owner-supplied imagery. The business is "${businessName}" (${businessType}${businessLocation ? `, ${businessLocation}` : ''}). Score on a 0-10 scale where:
- 10 = clearly an actual person from this business OR an actual photo of this specific location/product (storefront/menu item/team headshot/event)
- 7-9 = likely authentic (consistent setting, natural framing, business context visible)
- 4-6 = ambiguous (could be authentic or stock — over-polished but possibly real)
- 0-3 = obviously generic stock (stocky catalog smile, unrelated location, watermark, AI-generated face, "diverse-team-shaking-hands" cliché, food-on-white-plate stock)
Output STRICT JSON only:
{"score":<0-10>,"verdict":"authentic"|"likely_authentic"|"ambiguous"|"stock","reasoning":"<≤200 chars>","red_flags":["..."]}`;

async function scoreImage({ file, src }) {
  // Resolve relative URLs against the page they came from. The Worker's R2 host is in
  // `_research.json.deploy.preview_url` if present; otherwise we assume the build is hosted at /.
  let imageUrl = src;
  if (!/^https?:\/\//i.test(src)) {
    const baseUrl = research.deploy?.preview_url || research.deploy?.staging_url;
    if (baseUrl) {
      const u = new URL(src.replace(/^\//, ''), baseUrl.endsWith('/') ? baseUrl : baseUrl + '/');
      imageUrl = u.toString();
    } else {
      // Local file path — read from disk and convert to data URL
      const localPath = src.startsWith('/') ? join(DIST_DIR, src) : join(BUILD, dirname(file), src);
      if (existsSync(localPath)) {
        const buf = readFileSync(localPath);
        const mime = /\.png$/i.test(localPath)
          ? 'image/png'
          : /\.webp$/i.test(localPath)
            ? 'image/webp'
            : /\.gif$/i.test(localPath)
              ? 'image/gif'
              : 'image/jpeg';
        imageUrl = `data:${mime};base64,${buf.toString('base64')}`;
      } else {
        return { file, src, ok: false, error: `image not resolvable to URL or local file (${localPath})` };
      }
    }
  }

  try {
    const body = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: RUBRIC },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
          ],
        },
      ],
      max_tokens: 250,
      temperature: 0,
      response_format: { type: 'json_object' },
    };
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return { file, src, ok: false, error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content);
    return { file, src, ok: true, ...parsed };
  } catch (err) {
    return { file, src, ok: false, error: err.message };
  }
}

// Concurrency cap — 4 in flight at a time to respect rate limits
async function pool(items, n, fn) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

console.log(
  `[validate-photo-authenticity] scoring ${toScore.length} image(s) with GPT-4o (threshold ≥${THRESHOLD}/10, business="${businessName}")`,
);
const results = await pool(toScore, 4, scoreImage);

for (const r of results) {
  if (!r.ok) {
    warnings.push(`scoring failed for ${r.src} on ${r.file}: ${r.error}`);
    continue;
  }
  scores.push(r);
  const tag = `${r.score}/10 [${r.verdict}]`;
  if (r.score < THRESHOLD) {
    failures.push(
      `STOCK IMAGE on ${r.file}: ${r.src} scored ${tag} — ${r.reasoning}${
        r.red_flags?.length ? ` (red flags: ${r.red_flags.join(', ')})` : ''
      }`,
    );
  } else {
    console.log(`  ✓ ${r.file} :: ${r.src.slice(0, 80)} → ${tag}`);
  }
}

writeFileSync(
  REPORT_PATH,
  JSON.stringify(
    {
      ok: failures.length === 0,
      business: { name: businessName, type: businessType },
      threshold: THRESHOLD,
      budget: BUDGET,
      candidate_count: candidates.length,
      scored_count: scores.length,
      results: scores,
      warnings,
      failures,
    },
    null,
    2,
  ),
);

if (warnings.length) {
  console.warn(`\n[validate-photo-authenticity] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-photo-authenticity] ${failures.length} stock-image failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error(`\n[validate-photo-authenticity] BUILD GATE FAILED — report: ${REPORT_PATH}`);
  process.exit(1);
}
console.log(
  `[validate-photo-authenticity] ✓ ${scores.length}/${candidates.length} images authentic (threshold ≥${THRESHOLD}); report: ${REPORT_PATH}`,
);
