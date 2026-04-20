---
name: "Planning and Research"
description: "Deep web research, competitor scanning, technology evaluation, and implementation planning. Decomposes work into vertical slices, identifies parallel workstreams, tracks assumptions with confidence levels, and designs the critical path for minimum wall-clock time."
layer: "product-compiler"
canonical-owner-of:
  - "web-research-and-evidence"
  - "technology-evaluation"
  - "implementation-planning"
  - "work-decomposition"
  - "assumption-tracking"
---

# 03 — Planning and Research

> Research deeply. Plan broadly. Decompose aggressively. Parallelize everything safe.

---

## Core Principle

**Think before building. Research before assuming. Plan before coding.** The cost of 5 minutes of research is always less than the cost of rebuilding on wrong assumptions. But planning must serve speed — plan enough to parallelize, then execute.

### Research Through the Lens of the Three Goals
1. **End-user value:** What do users in this space actually need? What frustrates them about existing solutions? (Real user problems, not assumed ones.)
2. **Business psychology:** What conversion patterns work in this market? What pricing anchors do competitors set? What social proof exists? (Cialdini, Kahneman applied to market research.)
3. **Brand positioning:** How does this product differentiate projectsites.dev? What would make someone say "I need to use whatever built this"?

### Aggressive API and Service Discovery
During planning, scan for every possible integration:
- Available MCP servers (skill 52)
- Available API keys in the shared pool (skill 26)
- Self-hosted services on Coolify (skill 50)
- AI APIs that could enrich the product (OpenAI, Workers AI, Ideogram)
- Communication APIs (Slack, Discord, Twilio) for notifications
- Automation hooks (Zapier, n8n) for workflow connectivity

---

## Research Protocol

### When to Research
- New product domain (what do competitors look like?)
- Unfamiliar technology (what's the current best practice?)
- Design decisions (what patterns work best for this use case?)
- Performance optimization (what's the fastest approach?)
- User claims that seem verifiable (confirm before building on them)
- Independent idea engine needs evidence (→ 14)

### Research Methods
1. **Web search** — current best practices, competitor analysis, technology comparisons
2. **Documentation reading** — official docs for chosen technologies
3. **Codebase archaeology** — existing patterns in the project and similar projects
4. **API exploration** — what's available from services we're integrating
5. **Visual research** — screenshot competitor sites, analyze design patterns

### Research Output
Every research session produces:
- **Findings** — what was discovered
- **Implications** — what this means for our implementation
- **Recommendations** — what we should do differently
- **Confidence** — how sure we are (high/medium/low)
- **Sources** — where the information came from

---

## Planning Framework

### Implementation Plan Structure

```markdown
## Goal
[What we're building and why — from 02-goal-and-brief]

## Approach
[High-level strategy in 2-3 sentences]

## Vertical Slices
1. [Slice 1: smallest working increment]
2. [Slice 2: next increment]
3. [Slice N: ...]

## Parallel Workstreams
- Stream A: [independent work]
- Stream B: [independent work]
- Stream C: [depends on A completing]

## Critical Path
[The sequence that determines total time]

## Assumptions
- [Assumption 1] — confidence: high/medium/low
- [Assumption 2] — ...

## Risks
- [Risk 1] — mitigation: [approach]
- [Risk 2] — ...

## Open Questions
- [Question needing user input, if any]
```

### Decomposition Rules
1. **Vertical slices** — each slice delivers visible, testable value
2. **No horizontal layers** — never plan "build all models, then all APIs, then all UI"
3. **Smallest correct slice** — the minimum that works end-to-end
4. **Dependencies explicit** — mark what blocks what
5. **Parallel opportunities marked** — identify what can run concurrently

---

## Assumption Ledger

Track every assumption explicitly:

| Assumption | Confidence | Basis | Impact if Wrong |
|-----------|------------|-------|-----------------|
| Users want dark theme | High | Domain is tech product | Rework design |
| D1 sufficient for data | Medium | Simple schema | Migration to Neon |
| No auth needed | Low | User didn't mention it | Add Clerk later |

### Assumption Confidence Levels
- **High** — evidence from user, domain, or prior work
- **Medium** — reasonable inference, common pattern
- **Low** — guess, should verify or ask

### Assumption Resolution
- High confidence: proceed without asking
- Medium confidence: proceed but document
- Low confidence with high impact: ask the user
- Low confidence with low impact: proceed, easy to change

---

## Competitor and Market Research

### For New Products
1. Search for 3-5 competitors in the product space
2. Screenshot their homepages and key pages
3. Identify common features and patterns
4. Identify differentiation opportunities
5. Extract pricing models if relevant
6. Note UX patterns that work well
7. Feed findings into 09 (brand), 10 (design), 14 (ideas)

### For Rebuilds
1. Capture the existing site thoroughly (Wayback Machine if needed)
2. Extract the real brand (don't invent a new one)
3. Identify what works and what needs improvement
4. Preserve brand equity while improving execution

---

## Technology Evaluation

When choosing between technologies:

```
1. Does it work on Cloudflare? (mandatory)
2. Is it the simplest solution? (prefer)
3. Is it well-maintained? (verify)
4. Is it performant? (measure or research)
5. Does the team have experience? (check memory)
6. Is there a better option we haven't considered? (research)
```

### Evaluation Output
- **Chosen technology** and why
- **Rejected alternatives** and why
- **Migration path** if choice proves wrong
- **Performance expectations** with evidence

---

## Prioritization Framework

### MoSCoW for Features
- **Must** — product doesn't work without it
- **Should** — expected by users, significant value
- **Could** — nice to have, improves polish
- **Won't** — explicitly out of scope (non-goals)

### Priority Sequencing
1. Must-have features (vertical slices 1-N)
2. Should-have features (after Musts work)
3. Could-have features (if time and compute allow)
4. Polish and refinement (always, in parallel with later features)

---

## Parallel Work Design

### Safe to Parallelize
- Independent feature slices with no shared state
- Frontend and backend for different features
- Test writing and implementation (TDD)
- Media generation and code implementation
- Documentation and testing
- Logo/branding and technical infrastructure
- Analytics setup and feature development

### Must Be Sequential
- Schema design before data-dependent features
- Auth setup before auth-dependent features
- Deployment config before first deploy
- API design before frontend integration

### Parallel Agent Strategy
```
Agent 1: Core infrastructure (schema, auth, deploy config)
Agent 2: Frontend scaffolding and design system
Agent 3: Media generation (logo, hero, social previews)
Agent 4: Content and copy
→ Wait for Agent 1
Agent 5: Feature implementation (depends on infra)
Agent 6: Testing (in parallel with feature work via TDD)
Agent 7: Analytics and observability setup
```

---

## Trigger Conditions
- Beginning of any build task
- User requests research or planning
- Unfamiliar technology or domain
- Complex multi-step implementation
- Independent idea engine needs evidence (→ 14)

## Stop Conditions
- Plan is sufficient to begin parallel execution
- Research has answered the open questions
- Simple, well-understood task (skip formal planning)

## Cross-Skill Dependencies
- **Reads from:** 01-operating-system (policy), 02-goal-and-brief (what to build), 04-preference-and-memory (past decisions)
- **Feeds into:** 05-architecture-and-stack (technology choices), 06-build-and-slice-loop (implementation plan), 12-media-orchestration (media plan), 14-independent-idea-engine (research findings)

---

## What This Skill Owns
- Web research and evidence gathering
- Competitor analysis
- Technology evaluation
- Implementation planning
- Decomposition and prioritization
- Assumption tracking
- Parallel work design

## What This Skill Must Never Own
- Actual implementation (→ 06)
- Deployment (→ 08)
- Goal definition (→ 02)
- Stack defaults (→ 05)

---

## Pre-Flight Checklist (run before EVERY build)

Before writing a single line of code, verify:

```
[ ] Domain name resolved → product type inferred
[ ] SKILL_PROFILES.md consulted → correct skill subset loaded
[ ] _router.md consulted → correct execution path selected
[ ] CONVENTIONS.md loaded → no re-deriving brand tokens, CSP, breakpoints
[ ] Previous project MEMORY.md scanned → reusable patterns identified
[ ] API keys discovered → run scripts/discover-secrets.sh
[ ] Competitor screenshots captured (3 minimum for new products)
[ ] Keyword research done (1 primary + 2 longtail per page)
[ ] Parallel workstreams identified → agents assigned
[ ] Critical path identified → longest-pole work starts first
```

## Time Budget Allocation (for a typical new build)

| Phase | % of Total Time | Activities |
|-------|----------------|------------|
| Research + Planning | 10% | Competitors, keywords, architecture |
| Infrastructure | 10% | Worker setup, schema, auth, deploy config |
| Core Build | 40% | Homepage + features, real content, real images |
| Media + Content | 15% | Logo, hero, OG images, copy, translations |
| Quality + Polish | 15% | Tests, a11y, SEO audit, visual QA, motion |
| Deploy + Verify | 10% | Production deploy, E2E, fix-forward, docs |

Most phases overlap via parallelization. Total wall clock target: 30-45 minutes for a marketing site, 45-90 minutes for a SaaS app.
