---
name: "06 build-breaking build+slice loop rules"
description: "Universal template-leverage gates: every build's slice loop MUST start from template.projectsites.dev clone (not from scratch), homepage-first vertical slicing, anti-placeholder enforcement (no lorem/TODO/gray-box), incremental visual checkpoints per slice, slice budget gate. Migrated from prompt-improvements brainstorm 2026-05-10."
metadata:
  version: "1.0.0"
  updated: "2026-05-10"
  effort: "high"
  context: "fork"
license: "Rutgers"
compatibility:
  claude-code: ">=2.0.0"
  agentskills: ">=1.0.0"
---

# 06 — Build-Breaking Build + Slice Loop Rules

Initialized from prompt-improvements brainstorm 2026-05-10 — 8 template-leverage rules (#1-8) that bind every build's slice loop.

## Every build (***TEMPLATE LEVERAGE #1 — START FROM `template.projectsites.dev` CLONE — UNIVERSAL — BUILD-BREAKING***)
Every new site build MUST initialize by cloning the canonical template at `template.projectsites.dev` (R2 bucket `project-sites-template/`) — NEVER scaffold from-scratch via `npm create vite`. Template includes: PWA shell (manifest+sw.js+offline.html), 9 favicon assets, `_creativity_preamble.txt`+`_mission_preamble.txt`, 4-layer CSS cascade, analytics auto-provisioning, GTM+PostHog+Sentry+GA4 stubs wired, Turnstile widget, Resend stub, route metadata template, JSON-LD generators. Pipeline: orchestrator boot → `wrangler r2 object get project-sites-template/dist.tar.gz` → extract → site-specific overrides applied → slice loop begins. Validator (`validate-template-origin.mjs`): assert `dist/.template-version` file exists matching current `template.projectsites.dev` SHA AND ≥80% of template files preserved in initial slice 0. Reference: prompt-improvements brainstorm rec #1 (2026-05-10) — LMG iter-4 scaffolded from-scratch wasting 12min on baseline scaffolding that template would have provided in 30s.

## Every build (***TEMPLATE LEVERAGE #2 — HOMEPAGE-FIRST VERTICAL SLICING — UNIVERSAL — BUILD-BREAKING***)
Every build's slice loop MUST start with homepage slice (`/`) before any secondary route — NEVER parallel-render all routes from prompt-zero. Homepage owns: hero, primary CTA, trust signals, value prop, navigation. Slice 0=template clone+brand override. Slice 1=homepage hero+nav+footer (deployable). Slice 2=homepage feature sections (deployable). Slice 3=/about route. Slice 4=/contact route. Slice N=remaining routes in priority order. Each slice ships independently — partial site is better than full-site-broken. Validator (`validate-homepage-first.mjs`): assert `_slice_log.json[0].route === "/"` AND homepage at HEAD-200 before any other route in build trace. Reference: prompt-improvements brainstorm rec #2 (2026-05-10) + `~/.agentskills/06-build-and-slice-loop/SKILL.md` "always starting with homepage".

## Every slice (***TEMPLATE LEVERAGE #3 — ANTI-PLACEHOLDER ENFORCEMENT — UNIVERSAL — BUILD-BREAKING***)
Every slice MUST ship zero placeholders: no `lorem ipsum`, no `TODO`/`FIXME`/`XXX`, no gray-box image fallbacks, no `placeholder.com` URLs, no `Coming Soon` labels, no `[Your Name]` template strings, no `https://example.com` references. Pipeline: post-slice grep gate before deploy. Validator (`validate-anti-placeholder.mjs`): grep `dist/**/*.{html,css,js,json}` for forbidden patterns (`/lorem ipsum|TODO|FIXME|XXX|placeholder\.com|coming soon|\[your |\bexample\.com\b/i`) — any match = slice FAIL. Reference: prompt-improvements brainstorm rec #3 (2026-05-10) + `~/.agentskills/06-build-and-slice-loop/SKILL.md` "no lorem ipsum, no TODO stubs, no gray boxes".

## Every slice (***TEMPLATE LEVERAGE #4 — INCREMENTAL VISUAL CHECKPOINT — UNIVERSAL — BUILD-BREAKING***)
Every slice MUST end with Playwright screenshot at 1280×720 + GPT-4o visual review scoring 0-10 before next slice fires. Below 8/10 → regenerate slice. Pipeline: slice complete → deploy to staging URL → Playwright screenshot → GPT-4o vision call with prompt template `(slice_role, brand_palette, target_aesthetic) → score + critique` → if <8/10 apply critique + regenerate (max 2 attempts) → if still <8/10 log to `_visual_failures.json` and continue. Validator (`validate-slice-visual-checkpoint.mjs`): assert every slice in `_slice_log.json` has `visual_score >= 8` OR documented `visual_failures` entry. Reference: prompt-improvements brainstorm rec #4 (2026-05-10) — convergence requires per-slice visual quality, not just final-build verification.

## Every slice (***TEMPLATE LEVERAGE #5 — SLICE TIME BUDGET (10min HOMEPAGE / 5min ROUTE) — UNIVERSAL — BUILD-BREAKING***)
Every slice MUST complete within budget: homepage slice ≤10min wall-clock, secondary-route slice ≤5min, polish slice ≤3min. Exceeding budget = cut scope, ship MVP slice, surface remainder as recommendation. Pipeline: slice timer starts on slice begin → at budget-80% checkpoint, orchestrator forces scope-cut (drop optional sections, defer to next iteration) → at budget-100%, slice MUST ship deployable state. Validator (`validate-slice-budget.mjs`): assert every `_slice_log.json[i].duration_ms` ≤ budget for its slice type AND scope-cuts logged when triggered. Reference: prompt-improvements brainstorm rec #5 (2026-05-10) — LMG iter-4 spent 35min total; budget pressure forces template leverage + parallelism.

## Every slice (***TEMPLATE LEVERAGE #6 — DEPLOYABLE-AT-EVERY-SLICE GATE — UNIVERSAL — BUILD-BREAKING***)
Every slice MUST end in deployable state — never half-broken HTML, never JS errors in console, never broken internal links. Pipeline: slice complete → `wrangler deploy --env staging` → Playwright headless visits 6 breakpoints → console-error count must be 0 → broken-link count must be 0. Failures roll back to previous slice. Validator (`validate-deployable-slice.mjs`): assert post-slice staging deploy returns 200 + console-errors === 0 + broken-links === 0 across all 6 breakpoints. Reference: prompt-improvements brainstorm rec #6 (2026-05-10) — incremental deployment = always-shippable + easier debugging than big-bang reveal.

## Every slice (***TEMPLATE LEVERAGE #7 — REAL CONTENT FROM RESEARCH ARTIFACTS — UNIVERSAL — BUILD-BREAKING***)
Every slice MUST source its copy + media from build's pre-research artifacts (`_research.json`, `_corpus.json`, `_media_extraction.json`, `_brand.json`) — NEVER LLM-fabricated content. Pipeline: slice prompt receives `(slice_role, route, research_artifacts[]) → renders only with provided facts`. LLM may rephrase + condense + structure, never invent. Pipeline gate: every quantitative claim in slice output (%, $, N, dates) MUST cite `_research.json.refId` per `~/.claude/rules/citations.md`. Validator (`validate-real-content.mjs`): assert every `<section data-slice="X">` has at least one cite reference into `_research.json` OR `_corpus.json` AND no quantitative claim ships uncited. Reference: prompt-improvements brainstorm rec #7 (2026-05-10) + Brian-voice "Sourced facts (***NON-NEGOTIABLE***)".

## Every slice (***TEMPLATE LEVERAGE #8 — SLICE LOG AS BUILD-OUTPUT ARTIFACT — UNIVERSAL — BUILD-BREAKING***)
Every build MUST emit `_slice_log.json` capturing per-slice metadata: `{slice_id, route, role, started_at, ended_at, duration_ms, files_changed[], visual_score, console_errors[], broken_links[], scope_cuts[], cite_count, recommendations_emitted[]}`. Log surfaced under `/admin/build-trace` route post-deploy for owner inspection. Validator (`validate-slice-log.mjs`): assert `_slice_log.json` exists + has entry per slice + all 12 fields populated. Reference: prompt-improvements brainstorm rec #8 (2026-05-10) — slice log enables progressive-rebuild diff per `~/.claude/projects/-Users-apple-emdash-projects-projectsites-dev/memory/project_progressive_rebuild.md`.
