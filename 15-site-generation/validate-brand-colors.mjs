#!/usr/bin/env node
// validate-brand-colors.mjs — build gate for projectsites.dev brand color extraction
// Verifies: _brand.json color_source !== "industry_default" when source logo extractable;
//           theme-color + mask-icon meta tags === _brand.json.primary;
//           GPT-4o vision re-runs against logo and primary hex passes ΔE ≤ 30 against logo dominant.
// Usage: node validate-brand-colors.mjs <build-dir>
//   build-dir must contain _brand.json AND dist/index.html (or index.html at root)
// Env: OPENAI_API_KEY required for vision re-verification (skipped with warning if missing)
// Exit 0 = pass, exit 1 = fail (build break).

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUILD = resolve(process.argv[2] || '.');
const BRAND_PATH = join(BUILD, '_brand.json');
const HTML_CANDIDATES = [
  join(BUILD, 'dist', 'index.html'),
  join(BUILD, 'index.html'),
];
const HTML_PATH = HTML_CANDIDATES.find(existsSync);

if (!existsSync(BRAND_PATH)) {
  console.error(`[validate-brand-colors] _brand.json not found at ${BRAND_PATH}`);
  process.exit(1);
}
if (!HTML_PATH) {
  console.error(`[validate-brand-colors] no dist/index.html or index.html at ${BUILD}`);
  process.exit(1);
}

const brand = JSON.parse(readFileSync(BRAND_PATH, 'utf8'));
const html = readFileSync(HTML_PATH, 'utf8');
const failures = [];
const warnings = [];

const HEX = /^#[0-9a-fA-F]{6}$/;
const norm = (h) => (typeof h === 'string' ? h.toLowerCase() : '');

// Gate 1 — required _brand.json fields
const required = ['primary', 'secondary', 'color_source'];
for (const k of required) {
  if (!brand[k]) failures.push(`_brand.json missing required field: ${k}`);
}
if (brand.primary && !HEX.test(brand.primary)) failures.push(`_brand.json.primary not a 6-digit hex: ${brand.primary}`);
if (brand.secondary && !HEX.test(brand.secondary)) failures.push(`_brand.json.secondary not a 6-digit hex: ${brand.secondary}`);

// Gate 2 — when source logo extractable, color_source MUST NOT be industry_default
const logoUrl = brand?.logo?.original_url || brand?.logo?.original_icon_url;
const sourceLogoExtractable = !!logoUrl;
if (sourceLogoExtractable && brand.color_source === 'industry_default') {
  failures.push(
    `BRAND COLOR FALLBACK: source logo is reachable (${logoUrl}) but color_source="industry_default" — vision extraction must run`,
  );
}

// Gate 3 — theme-color meta tag === _brand.json.primary
const themeMatch = html.match(/<meta\s+name=["']theme-color["']\s+content=["'](#[0-9a-fA-F]{6})["']/i);
if (!themeMatch) {
  failures.push('dist/index.html missing <meta name="theme-color" content="#hex">');
} else if (norm(themeMatch[1]) !== norm(brand.primary)) {
  failures.push(
    `theme-color META MISMATCH: html=${themeMatch[1]} vs _brand.json.primary=${brand.primary} — single source of truth violated`,
  );
}

// Gate 4 — mask-icon color === _brand.json.primary (single source of truth)
const maskMatch = html.match(/<link\s+rel=["']mask-icon["'][^>]*color=["'](#[0-9a-fA-F]{6})["']/i);
if (maskMatch && norm(maskMatch[1]) !== norm(brand.primary)) {
  failures.push(
    `mask-icon color MISMATCH: html=${maskMatch[1]} vs _brand.json.primary=${brand.primary} — pick one brand primary, not two`,
  );
}

// Gate 5 — confidence threshold for vision-extracted colors
if (brand.color_source === 'logo_vision_extraction' && (brand.confidence ?? 0) < 0.7) {
  failures.push(`logo_vision_extraction confidence (${brand.confidence}) < 0.7 — extraction unreliable`);
}

// Gate 6 — vision re-verification (optional, requires OPENAI_API_KEY)
async function verifyVisionMatch() {
  if (!process.env.OPENAI_API_KEY) {
    warnings.push('OPENAI_API_KEY not set — skipping ΔE vision re-verification');
    return;
  }
  if (!sourceLogoExtractable) return;
  if (!brand.primary) return;

  try {
    const body = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Look at this logo image. Is the color "${brand.primary}" visually present as a dominant or accent color in the logo? Answer ONLY with strict JSON: {"present": true|false, "closest_logo_hex": "#xxxxxx", "delta_e_estimate": <0-100>, "reasoning": "<1 sentence>"}. delta_e_estimate is your visual ΔE2000 estimate between "${brand.primary}" and the closest logo color.`,
            },
            { type: 'image_url', image_url: { url: logoUrl, detail: 'high' } },
          ],
        },
      ],
      max_tokens: 200,
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
      warnings.push(`vision verification failed (HTTP ${res.status}) — skipping`);
      return;
    }
    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content);
    if (!parsed.present || (parsed.delta_e_estimate ?? 100) > 30) {
      failures.push(
        `BRAND PRIMARY NOT IN LOGO: claimed primary=${brand.primary} not visually present in logo (closest=${parsed.closest_logo_hex}, ΔE≈${parsed.delta_e_estimate}). Reason: ${parsed.reasoning}`,
      );
    } else {
      console.log(
        `[validate-brand-colors] ✓ vision re-verification passed (ΔE≈${parsed.delta_e_estimate}, closest=${parsed.closest_logo_hex})`,
      );
    }
  } catch (err) {
    warnings.push(`vision verification error: ${err.message}`);
  }
}

await verifyVisionMatch();

// Report
if (warnings.length) {
  console.warn(`\n[validate-brand-colors] ${warnings.length} warnings:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-brand-colors] ${failures.length} failures:`);
  failures.forEach((f) => console.error(`  ✗ ${f}`));
  console.error('\n[validate-brand-colors] BUILD GATE FAILED');
  process.exit(1);
}
console.log(`[validate-brand-colors] ✓ primary=${brand.primary} secondary=${brand.secondary} source=${brand.color_source}`);
