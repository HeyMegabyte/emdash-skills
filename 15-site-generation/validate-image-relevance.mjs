#!/usr/bin/env node
// validate-image-relevance.mjs — image topic-relevance + semantic-match gate (GPT-4o vision)
// Every page-rendered image must score ≥8/10 on topic relevance to the page subject AND
// pass business-type semantic match (rules/always.md "Every image business-type semantic
// mismatch gate"). Skips logo/icon/favicon. Caches results in .image-relevance-cache.json
// keyed by sha256(image bytes + page slug) so re-runs only re-score new images.
// When OPENAI_API_KEY is unset, validator no-ops with warning. When set, scores every
// image and fails on any <8/10 with the page slug + image src + reason.
// Usage: node validate-image-relevance.mjs <build-dir>
// Exit 0 = pass (or skipped), exit 1 = fail.

import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, basename } from 'node:path';
import { createHash } from 'node:crypto';

const BUILD = resolve(process.argv[2] || '.');
const DIST = existsSync(join(BUILD, 'dist')) ? join(BUILD, 'dist') : BUILD;
const CACHE_PATH = join(BUILD, '.image-relevance-cache.json');
const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!existsSync(DIST)) {
  console.error(`[validate-image-relevance] dist dir not found: ${DIST}`);
  process.exit(1);
}
if (!OPENAI_KEY) {
  console.warn('[validate-image-relevance] OPENAI_API_KEY unset — skipping (set to enable vision scoring)');
  process.exit(0);
}

const cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};

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

function pageContext(html) {
  const titleM = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const descM = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2M = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  return [titleM?.[1] ?? '', descM?.[1] ?? '', (h1M?.[1] ?? '').replace(/<[^>]+>/g, '').trim(), (h2M?.[1] ?? '').replace(/<[^>]+>/g, '').trim()].filter(Boolean).join(' | ');
}

function imageRefs(html) {
  const out = [];
  const IMG_RE = /<img\s+[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/gi;
  let m;
  while ((m = IMG_RE.exec(html)) !== null) {
    out.push({ src: m[1], alt: m[2] ?? '' });
  }
  return out;
}

function isSkippableSrc(src) {
  return /(?:^|\/)(?:logo|icon|favicon|sprite|loader|spinner|placeholder)/i.test(src) || /\.(?:svg)(?:\?|$)/i.test(src);
}

async function scoreImage(absPath, pageCtx, alt) {
  const buf = readFileSync(absPath);
  const ext = basename(absPath).split('.').pop()?.toLowerCase() ?? 'png';
  const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' }[ext] ?? 'image/png';
  const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: `Page context: "${pageCtx}". Image alt: "${alt}". Score this image 0-10 on topic relevance to the page subject AND business-type semantic match. Return ONLY JSON: {"score":<0-10>,"semantic_match":<bool>,"reason":"<≤120 chars>"}` },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });
  if (!resp.ok) throw new Error(`OpenAI ${resp.status}: ${await resp.text()}`);
  const j = await resp.json();
  const txt = j.choices?.[0]?.message?.content ?? '';
  const jsonM = txt.match(/\{[\s\S]*\}/);
  if (!jsonM) throw new Error(`unparsable response: ${txt.slice(0, 100)}`);
  return JSON.parse(jsonM[0]);
}

const failures = [];
const warnings = [];
const htmlFiles = walkHtml(DIST);
let scored = 0;
let cached = 0;

for (const file of htmlFiles) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  const ctx = pageContext(html);
  const imgs = imageRefs(html);
  for (const { src, alt } of imgs) {
    if (isSkippableSrc(src)) continue;
    if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) continue;
    const abs = src.startsWith('/') ? join(DIST, src) : join(DIST, src);
    if (!existsSync(abs)) {
      failures.push(`${rel}: image src "${src}" not found at ${abs}`);
      continue;
    }
    const buf = readFileSync(abs);
    const key = createHash('sha256').update(buf).update(rel).digest('hex');
    let score = cache[key];
    if (score) {
      cached++;
    } else {
      try {
        score = await scoreImage(abs, ctx, alt);
        cache[key] = score;
        scored++;
      } catch (err) {
        warnings.push(`${rel}: scoring "${src}" failed: ${err.message}`);
        continue;
      }
    }
    if (score.score < 8) {
      failures.push(`${rel}: image "${src}" scored ${score.score}/10 — ${score.reason}`);
    }
    if (score.semantic_match === false) {
      failures.push(`${rel}: image "${src}" failed business-type semantic match — ${score.reason}`);
    }
  }
}

writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));

if (warnings.length) {
  console.warn(`\n[validate-image-relevance] ${warnings.length} warnings:`);
  warnings.slice(0, 20).forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures.length) {
  console.error(`\n[validate-image-relevance] ${failures.length} failures (${scored} new + ${cached} cached scores):`);
  failures.slice(0, 30).forEach((f) => console.error(`  ✗ ${f}`));
  if (failures.length > 30) console.error(`  ...+${failures.length - 30} more`);
  console.error('\n[validate-image-relevance] BUILD GATE FAILED — re-generate offending images via skill 12');
  process.exit(1);
}
console.log(`[validate-image-relevance] ✓ ${scored + cached} images scored ≥8/10 (${scored} new, ${cached} cached) across ${htmlFiles.length} pages.`);
