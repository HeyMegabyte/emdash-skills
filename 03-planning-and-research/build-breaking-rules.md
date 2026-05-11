---
name: "03 build-breaking planning+research rules"
description: "Universal parallelism + research gates: every build's task graph MUST be parallelized via fan-out architecture (research+brand+media+content concurrent), parallel research agents by era/topic, critical path optimization with concurrency floor, assumption-driven slicing with confidence-tracked decisions. Migrated from prompt-improvements brainstorm 2026-05-10."
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

# 03 — Build-Breaking Planning + Research Rules

Initialized from prompt-improvements brainstorm 2026-05-10 — 4 parallelism rules (#9-12) that bind planning + research phase.

## Every build (***PARALLELISM #1 — FAN-OUT ARCHITECTURE FROM PROMPT-ZERO — UNIVERSAL — BUILD-BREAKING***)
Build orchestrator MUST spawn ALL boot-time tasks concurrently at prompt-zero — research, brand extraction, media pre-fetch, content corpus crawl, route discovery, sitemap fetch, source-site Wayback lookup — never sequentially. Pipeline: orchestrator boots → in single `Promise.all([...])` block launches `research_task | brand_extraction_task | media_prefetch_task | corpus_crawl_task | route_discovery_task | wayback_task | competitor_scan_task` → all must complete before `content_synthesis_task` fires. Concurrency floor = 7 boot tasks. Validator (`validate-parallel-boot.mjs`): parse `_build_trace.json`, assert ≥7 tasks have overlapping `started_at` windows within 5s of orchestrator boot AND `content_synthesis_task.started_at >= max(boot_tasks.ended_at)`. Reference: prompt-improvements brainstorm rec #9 (2026-05-10) — sequential boot collapses build to single-threaded LLM-bound waiting; LMG iter-4 wasted 8 of 35 min on sequential phases that could have been parallel.

## Every build (***PARALLELISM #2 — DEEP-RESEARCH AGENTS PER ERA/TOPIC — UNIVERSAL — BUILD-BREAKING***)
Any site with >50yr history OR >10 content categories OR >100 source-corpus pages MUST split research into ≥3 parallel deep-research agents — never single-agent serial crawl. Era-based: pre-1900 | 1900-1970 | 1970-present (for institutions). Topic-based: products | team | press | case-studies | careers | engineering-blog (for orgs). Each agent returns its own `research/<era|topic>-<slug>.json` matching `njsk-timeline-v1` schema (events[] + refs[] + uncertainties[] + verbatim_quotes[]). Merge → dedupe → typecheck → render. Validator (`validate-parallel-research.mjs`): assert `research/` directory contains ≥3 era/topic-segmented JSON files AND their `started_at` windows overlap within 30s. Reference: prompt-improvements brainstorm rec #10 (2026-05-10) + `~/.claude/rules/historically-rich.md` — single-agent timelines stall at 24 events of generic depth; 3-agent fan-out produced 103 events / 46 APA refs on njsk.org rebuild.

## Every build (***PARALLELISM #3 — CRITICAL-PATH OPTIMIZATION + CONCURRENCY FLOOR — UNIVERSAL — BUILD-BREAKING***)
Build planner MUST emit `_critical_path.json` before any build phase fires — listing every phase, its dependencies, max-concurrency-at-each-step, and projected wall-clock. Phase ordering MUST optimize critical path (longest dependency chain) — never serialize independent tasks. Concurrency floor per phase: phase 0 (boot) ≥7 | phase 1 (synthesis) ≥3 (page-by-page parallel) | phase 2 (media fill) ≥10 (DALL-E batch) | phase 3 (validation) ≥5 (parallel validators) | phase 4 (deploy) ≥1. Total wall-clock target: 10min for 5-page site, 15min for 20-page site, 25min for 100-page site. Validator (`validate-critical-path.mjs`): assert `_critical_path.json` exists with all phases declared + concurrency floors met in `_build_trace.json` AND total duration ≤ projected wall-clock × 1.5. Reference: prompt-improvements brainstorm rec #11 (2026-05-10) — LMG iter-4 ran sequentially across 35min when critical path optimization would have shipped in ~10min.

## Every build (***PARALLELISM #4 — ASSUMPTION-DRIVEN SLICING WITH CONFIDENCE-TRACKED DECISIONS — UNIVERSAL — BUILD-BREAKING***)
Every build plan MUST decompose into vertical slices where each slice carries explicit assumption + confidence (0-1) + fallback. Format: `_slice_plan.json[i] = { slice_id, task, parallel_with: [slice_ids], depends_on: [slice_ids], assumption: "...", confidence: 0.X, fallback_if_violated: "..." }`. Confidence <0.7 = slice MUST emit fact-check sub-task before main task fires. Confidence ≥0.7 + low-risk = auto-execute. Assumptions discovered violated during build → slice rolls back to fallback + logs to `_assumption_violations.json`. Validator (`validate-slice-confidence.mjs`): assert `_slice_plan.json` has all 5 fields per slice AND no slice with confidence <0.7 lacks fact-check sub-task AND no assumption violation went unlogged. Reference: prompt-improvements brainstorm rec #12 (2026-05-10) + `~/.claude/CLAUDE.md` "Confidence: architecture decisions state 0-1. Below 0.7→research more." Codifies confidence tracking that already exists in PROJECT_BRIEF.md format into binding gate.
