---
name: "source-fidelity-loop"
description: "Source-vs-rebuild visual fidelity loop. Capture source homepage, capture rebuild homepage, GPT-4o scores logo+colors+typography+hero against source, fixer regenerates on fail. Prevents brand drift on rebuilds."
updated: "2026-05-10"
---

# Source-Fidelity Loop

Every site rebuild MUST visually mirror the source brand: same logo, same colors, same typography, same hero structure. "Improvement" means motion+layout+performance — NEVER substituting the brand identity. The lonemountainglobal Poppins+Hind regression and the njsk.org burgundy-loss incident both shipped as "passing" because no gate compared rebuild→source. This loop closes that gap.

## Phase 1: Capture Source Screenshot (`_source_screenshot.png`)

Before generation starts, the Worker captures the source-domain homepage. Three capture paths in priority order: (1) live source URL via `@cloudflare/puppeteer` headless Chrome at viewport 1280×800, full-page=false, REAL_UA mandatory (see rules/fetch-defaults.md) — preferred when source resolves 200. (2) Wayback Machine snapshot — `https://web.archive.org/web/2YYY/https://source.tld` resolves to nearest crawl, screenshot via puppeteer; needed when source is gone, paywalled, behind Bot Fight, or the rebuild is replacing a defunct property. (3) Operator-supplied screenshot upload to R2 at `sites/{slug}/_source_screenshot.png` — last resort for owner-provided brand decks where no public source exists.

Output: `_source_screenshot.png` saved to build dir + R2 archive at `sites/{slug}/build-context/_source_screenshot.png` (versioned). Also extract palette + fonts from this screenshot via GPT-4o vision into `_brand.json` (see skill 09 brand-extraction). `_brand.json.fonts.heading` + `_brand.json.fonts.body` + `_brand.json.primary` + `_brand.json.secondary` become the authority — generation prompts MUST receive them and the build MUST honor them.

When `_source_screenshot.png` cannot be captured (no source exists, owner is starting from scratch, source is private), validator no-ops with `[validate-source-fidelity] _source_screenshot.png not found — skipping (no source to compare)` exit-0. Greenfield builds skip the loop entirely; rebuilds fail-closed.

## Phase 2: Capture Rebuild Screenshot (`_rebuild_screenshot.png`)

After staging deploy succeeds (Worker URL responds 200), capture the rebuilt homepage under identical viewport (1280×800, full-page=false). Run AFTER all media generation completes — early capture catches placeholder gray boxes and produces false fidelity failures. Use `@cloudflare/puppeteer` against the staging worker URL `https://{slug}-staging.{account}.workers.dev/` with REAL_UA, wait for `networkidle` + `prefers-reduced-motion: reduce` to suppress entrance animations, then `page.screenshot({ fullPage: false, type: 'png' })`.

Output: `_rebuild_screenshot.png` saved alongside `_source_screenshot.png` in build dir. Re-capture on every rebuild iteration (do NOT cache — the comparison must reflect the latest deploy). Cache key in `validate-source-fidelity.mjs` is sha256(source_buf + rebuild_buf), so byte-identical rebuilds short-circuit; any visual change re-scores.

## Phase 3: GPT-4o Score (`validate-source-fidelity.mjs`)

Validator sends BOTH images + brand hint (`_brand.json.fonts` + `_brand.json.primary`) to GPT-4o with this rubric:

```json
{
  "logo_match": <bool>,
  "color_match": <0-10>,
  "typography_match": <0-10>,
  "hero_structure": <0-10>,
  "overall_fidelity": <0-10>,
  "missing_elements": ["..."],
  "notes": "<≤200 chars>"
}
```

Pass threshold: `logo_match===true` AND `color_match≥7` AND `typography_match≥7` AND `hero_structure≥7` AND `overall_fidelity≥8`. Any failure = exit-1, build halts. `missing_elements[]` becomes warnings (don't fail build, but are surfaced to fixer agent in Phase 4).

Result cached in `.source-fidelity-cache.json` keyed by sha256(source_buf+rebuild_buf). Re-runs on identical screenshots no-op.

## Phase 4: Fixer Loop (max 3 iterations)

On fail, project agent `source-fidelity-fixer` (declared in `apps/project-sites/.claude/agents/source-fidelity-fixer.md` — task #35) reads `result.notes`, `result.missing_elements`, and the per-axis scores, then issues TARGETED regenerations:

**`logo_match=false`** → re-run skill 12 logo extraction from source (favicon → about page → header SVG → Wayback header). NEVER auto-generate via Ideogram unless source logo is genuinely unrecoverable. If Ideogram fallback fires, log `_brand.json.warnings[].logo_synthesized=true` so operator knows.

**`color_match<7`** → re-extract palette from `_source_screenshot.png` via GPT-4o vision (skill 09 brand-color-extraction), overwrite `_brand.json.primary`/`secondary`/`accent`, regenerate `tokens.css` + Tailwind config, redeploy. Common cause: build prompt guessed "burgundy" when source was actually crimson `#A81F32` — exact hex matters, not category.

**`typography_match<7`** → cross-check `_brand.json.fonts.heading`/`body` against fonts actually loaded in `_rebuild_screenshot.png` (Computed Style via puppeteer `getComputedStyle(document.querySelector('h1')).fontFamily`). If fonts on disk match `_brand.json` but rebuild is loading different stack, the issue is missing `<link>` preload or Tailwind theme override — fix font preload + theme. If `_brand.json.fonts` themselves are wrong, re-extract via skill 09 (vision sees the actual letterforms — Poppins vs Inter is distinguishable).

**`hero_structure<7`** → regenerate hero block. Provide GPT-4o-extracted hero spec from source (image-on-right vs image-on-left vs full-bleed-photo vs gradient-only, headline length, CTA count) to the build prompt. Common drift: source had photo background + dark scrim + 4-word headline; rebuild produced gradient + 12-word headline + 2 CTAs.

**`overall_fidelity<8`** with sub-scores all ≥7 → typically means cumulative drift (each axis is "close enough" but the gestalt is off). Trigger one full hero re-render with `_source_screenshot.png` passed as a few-shot reference image to GPT Image 1.5 (skill 12 image-generation supports image-conditioning).

After each fix, redeploy staging, recapture `_rebuild_screenshot.png`, re-run `validate-source-fidelity.mjs`. Max 3 iterations. Iteration 4 = escalate to operator with side-by-side diff in `_source_fidelity_report.html`.

## Phase 5: Escalation (iteration 4)

Generate `_source_fidelity_report.html` with: source screenshot + latest rebuild screenshot side-by-side at 100%, 50%, 25% scales; per-axis scores from each iteration (showing trajectory); GPT-4o `notes` field per iteration; raw `_brand.json` + extracted-from-source palette + extracted-from-rebuild palette; suggested manual interventions (top 3). Email to operator via Resend (skill 13 notifications) with subject `Source-fidelity gate failed after 3 attempts: {slug}`. Build state moves from `building` → `error` with `audit_logs.reason='source_fidelity_3x_fail'`. Site stays unpublished — better unshipped than shipped wrong.

## Anti-patterns (***NEVER***)

Skipping the loop because "the rebuild looks better than the source." Improvement is bonus; fidelity is the contract. Owner agreed to a rebuild of THEIR brand — not your taste. Operator can manually approve a deviation post-fact, but the AI never decides unilaterally.

Auto-generating a logo when source logo extraction fails on first try. Try favicon → about page → header SVG → Wayback header → R2 archive of prior crawls before falling back to Ideogram. Synthetic logos drift from the original signature shape and ship as "passing" because GPT-4o is more forgiving than the human owner.

Caching `_rebuild_screenshot.png` across deploys. The screenshot MUST be re-captured after every deploy or the cache lies. Cache `_source_screenshot.png` aggressively (source rarely changes); re-capture rebuild every iteration.

Treating sub-scores ≥7 as "good enough" when overall<8. If the gestalt is off, fix the gestalt — usually hero re-render with image-conditioning, not piecemeal tweaks.

## Canonical Incidents This Gate Prevents

**lonemountainglobal (2026-04)**: Source used Poppins (heading) + Hind (body) — both Google Fonts. Build prompt guessed Inter (default Tailwind stack), passed all OTHER validators because Inter loaded fine and contrast was AAA. Owner immediately spotted the substitution. Fix: `_brand.json.fonts` extraction via GPT-4o vision; `validate-source-fidelity.mjs` flags `typography_match<7` when extracted-rebuild stack ≠ `_brand.json.fonts`.

**njsk.org (2026-03)**: Source brand burgundy `#7B1F2F`. Build prompt category-inferred "non-profit warm earth tones" → produced muddy maroon `#923B3B` + tan `#C4A57B`. All other gates passed. Owner reaction: "this isn't our brand at all." Fix: `_brand.json.primary` extracted from source pixels via GPT-4o, never inferred from category. `validate-brand-colors.mjs` (skill 09) cross-checks rendered hex against extracted hex within ΔE2000 ≤ 5; `validate-source-fidelity.mjs` catches the gestalt color drift.

**Generic 2025 portfolio rebuilds**: Hero "improvement" from full-bleed photo + scrim → animated gradient + lottie. Owner: "where's the photo of me?" Fix: hero structure score against source — if source has a photographic hero, rebuild MUST keep a photographic hero (skill 10 hero-system).

## Operator Override

`_source_fidelity_override.json` in build dir, written by operator (never AI), bypasses the gate for a single build:

```json
{
  "approved_by": "owner-email@example.com",
  "approved_at": "2026-05-10T14:22:00Z",
  "reason": "Owner approved rebrand — primary color intentionally changed from burgundy to teal",
  "axes_waived": ["color_match", "logo_match"]
}
```

Validator reads override, logs `[validate-source-fidelity] override active for [...] — gate bypassed`, exits 0. Override is single-use (deleted after build) and audit-logged. AI never writes the override file.

## See also

- `validate-source-fidelity.mjs` — the gate itself
- skill 09 `brand-color-extraction` — `_brand.json` palette+fonts via GPT-4o vision
- skill 12 `media-acquisition.md` — logo extraction priority chain
- skill 12 `image-generation.md` — GPT Image 1.5 image-conditioning for hero re-render
- `apps/project-sites/.claude/agents/source-fidelity-fixer.md` (task #35) — fixer agent
- `rules/always.md` "Every site rebuild source site exists logo walks + theme match + brand-splash" — universal rule this loop enforces
