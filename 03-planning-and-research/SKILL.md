---
name: "planning-and-research"
description: "Deep web research, competitor scanning, technology evaluation, and implementation planning. Decomposes work into vertical slices, identifies parallel workstreams, tracks assumptions with confidence levels, and designs the critical path for minimum wall-clock time."
context: fork
agent: Explore
submodules:
  - competitive-analysis.md
---

## Submodules

| File | Description |
|------|-------------|
| competitive-analysis.md | Before building any product: WebSearch for 3-5 competitors, scrape their homepages and pricing pages, extract features, pricing tiers, design patterns, and copy tone. |

# 03 — Planning and Research

## Research Through Three Goals
1. End-user value: what do users need? What frustrates them about existing solutions?
2. Business psychology: what conversion patterns work? What pricing anchors exist?
3. Brand positioning: how does this differentiate projectsites.dev?

### Aggressive API/Service Discovery
During planning, scan: MCP servers (05/mcp-integrations), API keys (05/shared-api-pool), Coolify services, AI APIs (OpenAI, Workers AI, Ideogram), communication APIs (Slack, Discord), automation hooks (Zapier, n8n).

## Research Protocol

**When:** New domain, unfamiliar tech, design decisions, performance optimization, verifiable claims, idea engine needs evidence.

**Methods:** Web search, documentation, codebase archaeology, API exploration, visual research (competitor screenshots).

**Output:** Findings + implications + recommendations + confidence (high/medium/low) + sources.

## Planning Framework

```
Goal → Approach (2-3 sentences) → Vertical Slices → Parallel Workstreams → Critical Path → Assumptions (with confidence) → Risks (with mitigation) → Open Questions
```

### Decomposition Rules
- Vertical slices delivering visible, testable value (never horizontal layers)
- Smallest correct slice working end-to-end
- Dependencies explicit, parallel opportunities marked

## Assumption Tracking

| Confidence | Treatment |
|-----------|-----------|
| High (evidence from user/domain) | Proceed without asking |
| Medium (reasonable inference) | Proceed but document |
| Low + high impact | Ask the user |
| Low + low impact | Proceed, easy to change |

## Technology Evaluation

1. Works on Cloudflare? (mandatory) 2. Simplest solution? (prefer) 3. Well-maintained? 4. Performant? 5. Team experience? 6. Better option exists?

Output: chosen + why, rejected + why, migration path, performance expectations.

## Prioritization (MoSCoW)

Must (product broken without) → Should (expected, significant value) → Could (nice, polish) → Won't (out of scope). Sequence: Musts first, then Shoulds, then Coulds.

## Parallel Work Design

**Safe to parallelize:** Independent features, frontend+backend for different features, TDD (test+impl), media gen+code, docs+testing, logo+infra, analytics+features.

**Must be sequential:** Schema before data-dependent features, auth before auth-dependent, deploy config before first deploy, API design before frontend integration.

## Pre-Flight Checklist (before EVERY build)

```
[ ] Domain → product type inferred
[ ] SKILL_PROFILES.md → correct profile loaded
[ ] CONVENTIONS.md loaded
[ ] Previous MEMORY.md scanned for reusable patterns
[ ] API keys discovered (scripts/discover-secrets.sh)
[ ] Competitor screenshots (3 min for new products)
[ ] Keyword research (1 primary + 2 longtail per page)
[ ] Parallel workstreams identified
[ ] Critical path identified → longest-pole starts first
```

## Time Budget (typical new build)

| Phase | % | Activities |
|-------|---|------------|
| Research + Planning | 10% | Competitors, keywords, architecture |
| Infrastructure | 10% | Worker, schema, auth, deploy config |
| Core Build | 40% | Homepage + features, real content/images |
| Media + Content | 15% | Logo, hero, OG, copy, translations |
| Quality + Polish | 15% | Tests, a11y, SEO, visual QA, motion |
| Deploy + Verify | 10% | Production deploy, E2E, fix-forward, docs |

Wall clock target: 30-45min marketing site, 45-90min SaaS app.
