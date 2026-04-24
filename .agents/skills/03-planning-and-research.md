---
name: "planning-and-research"
description: "Deep web research, competitor scanning, technology evaluation, and implementation planning. Decomposes work into vertical slices, identifies parallel workstreams, tracks assumptions with confidence levels, and designs the critical path for minimum wall-clock time."
version: "2.0.0"
updated: "2026-04-23"
context: fork
agent: Explore
submodules:
  - competitive-analysis.md
---

## Submodules

| File | Description |
|------|-------------|
| competitive-analysis.md | WebSearch 3-5 competitors → Firecrawl/WebFetch scrape homepage+pricing → Playwright screenshots 375+1280px → comparison table → winning patterns. Stagehand for dynamic competitor sites. |

# 03 — Planning and Research

## Research Through Three Goals
1. End-user value: what do users need? What frustrates them about existing solutions?
2. Business psychology: what conversion patterns work? What pricing anchors exist?
3. Brand positioning: how does this differentiate vs. the competitive field?

### Aggressive API/Service Discovery
During planning, scan: MCP servers (05/mcp-and-cloud-integrations), API keys (05/shared-api-pool), Coolify services, AI APIs (OpenAI, Workers AI, Ideogram), communication APIs (Slack, Discord), automation hooks (Zapier, n8n, Inngest).

## Research Protocol

**When:** New domain, unfamiliar tech, design decisions, performance optimization, verifiable claims, idea engine needs evidence, GEO/AI-search positioning, competitor site analysis.

**Methods:** WebSearch, documentation, codebase archaeology, API exploration, visual research (competitor screenshots), programmatic SEO keyword analysis, Stagehand for JS-heavy competitor sites, Firecrawl for bulk multi-page scraping.

**Output:** Findings + implications + recommendations + confidence (high/medium/low) + sources. Return ≤200 words from subagents — never raw file dumps.

## Agent Orchestration for Research

Single agent matches or outperforms multi-agent on 64% of tasks (MASS framework: optimize agent prompts and topology jointly). Use multi-agent only for 4+ independent parallel tasks where fan-out cuts wall-clock time by 75%.

| Pattern | When to use |
|---------|-------------|
| Single agent | Most research tasks, sequential dependencies, context needed across steps |
| Fan-out/fan-in | 4+ independent parallel tracks (competitor scrape ×5, keyword ×5, screenshot ×5) |
| Writer/reviewer | Fresh-context code review: writer implements, separate reviewer session critiques without bias |
| Orchestrator-worker | Cross-functional workflows; orchestrator on claude-opus-4-6, workers on claude-sonnet-4-6 (40-60% cost reduction) |

Subagents explore in separate context windows and report summaries back — keep main context clean. Use `context: fork` + `agent: Explore` for read-only research (this skill's own setting).

## Planning Framework

```
Goal → Approach (2-3 sentences) → Vertical Slices → Parallel Workstreams → Critical Path → Assumptions (with confidence) → Risks (with mitigation) → Open Questions
```

### Decomposition Rules
- Vertical slices delivering visible, testable value (never horizontal layers)
- Smallest correct slice working end-to-end
- Dependencies explicit, parallel opportunities marked
- MASS: optimize agent prompts and topology jointly, not separately

## Assumption Tracking

| Confidence | Treatment |
|-----------|-----------|
| High (evidence from user/domain) | Proceed without asking |
| Medium (reasonable inference) | Proceed but document |
| Low + high impact | Ask the user |
| Low + low impact | Proceed, easy to change |

## Technology Evaluation

1. Works on Cloudflare? (mandatory) 2. Simplest solution? (prefer) 3. Well-maintained? 4. Performant? 5. Team experience? 6. Better option exists?

Output: chosen + why, rejected + why, migration path, performance expectations, confidence level (0–1). Below 0.7 → research more before deciding.

## GEO: AI Search Optimization Research

AI search (ChatGPT, Perplexity, Google AI Overviews) surfaces content differently from traditional SEO. Research checklist for any content page:
- JSON-LD structured data present? (LLM accuracy jumps 16% → 54% with structured data)
- Schema types: Organization, WebSite, SoftwareApplication, FAQPage, HowTo, BreadcrumbList
- Content structured for extraction: question–answer pairs, numbered steps, comparative tables
- Quotable answer blocks 40-60 words — LLMs cite these directly
- Citations from authoritative sources (AI search amplifies domain authority signals)
- Freshness signals: updated dates in schema, changelogs, recent data
- ai.robots.txt: audit competitor GEO permissions with scanner

## Programmatic SEO Research Methodology

Identify seed terms with high variation potential → build template library → populate from DB/API → monitor indexing via GSC. Research phase tasks:
1. Keyword gap analysis: competitors' top organic pages via Ahrefs/Semrush
2. Template patterns: `{App} + {Tool} Integration`, `{App} vs {Competitor}`, `{App} for {Industry}`, `How to {Action}`, `{Task} template`
3. Volume triage: 80% automated pages at 100-1K search volume, 20% cornerstone content at 1K+
4. Quality floor: every programmatic page needs unique value — conversion alignment + 2+ internal links
5. Tools: AirOps (AI generation), Surfer SEO (optimization), n8n (data pipelines), Firecrawl (competitor scrape), Stagehand (dynamic sites)

## Prioritization (MoSCoW)

Must (product broken without) → Should (expected, significant value) → Could (nice, polish) → Won't (out of scope). Sequence: Musts first, then Shoulds, then Coulds.

## Parallel Work Design

**Safe to parallelize:** Independent features, frontend+backend for different features, TDD (test+impl), media gen+code, docs+testing, logo+infra, analytics+features, competitor scraping (fan-out to 3-5 agents).

**Must be sequential:** Schema before data-dependent features, auth before auth-dependent, deploy config before first deploy, API design before frontend integration, GEO schema before content publishing.

## Competitor Scanning Tools (2026)

| Tool | Use case |
|------|----------|
| WebSearch | Discover competitors, find pricing pages, market research |
| WebFetch | Public homepage/pricing/features scrape (static sites) |
| Stagehand | JS-heavy competitor sites, dynamic content, SPA scraping |
| Firecrawl (firecrawl.megabyte.space) | Deep crawl, 50-page limit, markdown output, 1req/sec/domain |
| Playwright MCP | Screenshot at 375+1280px, visual analysis, interactive flows |
| BuiltWith / Wappalyzer | Tech stack detection |
| Ahrefs / Semrush | Keyword gap, backlink profile, top pages |
| ai.robots.txt scanner | GEO permissions audit |

## Pre-Flight Checklist (before EVERY build)

```
[ ] Domain → product type inferred (SKILL_PROFILES.md)
[ ] SKILL_PROFILES.md → correct profile loaded
[ ] CONVENTIONS.md loaded
[ ] Previous MEMORY.md scanned for reusable patterns
[ ] API keys discovered (scripts/discover-secrets.sh or get-secret)
[ ] Competitor screenshots (3 min for new products via Stagehand or Playwright)
[ ] Keyword research (1 primary + 2 longtail per page)
[ ] GEO schema types identified (4+ JSON-LD per page)
[ ] Programmatic SEO templates needed? (if content site)
[ ] Parallel workstreams identified + worktrees planned
[ ] Critical path identified → longest-pole starts first
[ ] Agent count justified: 1 unless 4+ independent tracks
[ ] ToolSearch bulk-load if computer-use tools deferred
```

## Research Output Format

Bad: dump raw file contents, paste full competitor HTML, return 2000-token findings. Good: ≤200 words, structured as: **Finding** | **Implication** | **Recommended action** | **Confidence**. Subagents summarize; main thread decides.

## Time Budget (typical new build)

| Phase | % | Activities |
|-------|---|------------|
| Research + Planning | 10% | Competitors, keywords, GEO schema, architecture |
| Infrastructure | 10% | Worker, schema, auth, deploy config |
| Core Build | 40% | Homepage + features, real content/images |
| Media + Content | 15% | Logo, hero, OG, copy, translations |
| Quality + Polish | 15% | Tests, a11y, SEO, visual QA, motion |
| Deploy + Verify | 10% | Production deploy, E2E, fix-forward, docs |

Wall clock target: 30-45min marketing site, 45-90min SaaS app.
