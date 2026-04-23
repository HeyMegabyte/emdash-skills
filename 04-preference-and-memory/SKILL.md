---
name: "preference-and-memory"
description: "Captures and evolves user preferences with confidence levels. Maintains Voice of the Customer model with exact language, dissatisfaction and aspiration signals. Handles promotion/demotion, global vs project scoping, auto memory system, and Omi wearable data integration."
version: "2.0.0"
updated: "2026-04-23"
submodules:
  - wisdom-and-human-psychology.md
  - brian-voc-data.md
  - brian-decision-model.md
---

## Submodules
| File | Description |
|------|-------------|
| wisdom-and-human-psychology.md | Timeless principles from behavioral psychology, philosophy, and self-help classics applied to product building. Ethical persuasion only. |
| brian-voc-data.md | Voice of the Customer data from 3,102 ChatGPT conversations — exact language, dissatisfaction signals, interaction velocity, prompt patterns. |
| brian-decision-model.md | Decision-making patterns: how Brian evaluates tools, services, architecture, and vendors. Weighted criteria, rejection signals. |

# 04 — Preference and Memory

## Voice of the Customer (VoC)

Captures exact language, frustrations, ambitions, standards:
- What they consider weak/shallow/slow/ugly/incomplete/unacceptable
- What they consider elite/complete/beautiful/fast/worth shipping
- Repeated phrases signaling deep preferences, emotional intensity markers

### VoC Model Structure
Desired Outcome → Dissatisfaction Signals (exact quotes) → Aspiration Signals (praise/standards) → Implications for: Product, UX, Copy, Architecture, Completeness, Speed, Refinement

### VoC Rules
Capture exact language when specific; infer implications but label them | Never fabricate; distinguish literal from inferred | Update on: priority changes, corrections, redefined "done", strong emphasis, ***PROCESS THIS***

### VoC Storage
Global: `~/.claude/projects/-Users-apple-emdash-projects-megabyte-space/memory/voc_global.md` | Project: `PROJECT_BRIEF.md` VoC section or `VOC.md`

## Preference Taxonomy

| Confidence | Treatment |
|-----------|-----------|
| Confirmed (explicitly stated/demonstrated) | Always follow |
| Strong (confirmed without pushback) | Follow by default |
| Inferred (consistent pattern) | Follow, verify if high stakes |
| Weak (single observation) | Note, don't rely on |
| Experimental (trying, uncommitted) | Apply in context, don't propagate |

| Scope | Storage |
|-------|---------|
| Global | `~/.claude/memory/` or project memory dir |
| Project | Project CLAUDE.md or brief |
| Session | In-context only |
| Experimental | Memory with expiry note |

## Preference Evolution

**Promotion:** Weak → repeated → Inferred → user confirmation → Confirmed | User explicit statement → immediately Confirmed | Accepted non-obvious choice → Strong.

**Demotion:** User contradicts → re-evaluate | Context changes → scope-check | 30+ days unobserved → mark stale.

**Never promote on pattern alone:** tech choices, design aesthetics, business models, feature scope.

**Can promote on pattern alone:** code style, communication style, review depth, testing thoroughness.

## Capture Triggers

Capture when: user corrects, confirms, expresses frustration/delight, uses ***TEXT***, writes ***PROCESS THIS***, asks to remember.

Capture: the rule + why + how to apply + scope + confidence.

Don't capture: one-time debug decisions, derivable tech details, temporary workarounds, info already in CLAUDE.md.

## Auto Memory System

**Storage:** `~/.claude/projects/<project>/memory/` — `<project>` derived from git repo; all worktrees share one directory. Custom: `autoMemoryDirectory` setting (allowed in policy/local/user settings; NOT project settings).

**Directory structure:**
```
~/.claude/projects/<project>/memory/
├── MEMORY.md          # Index — loaded every session (first 200 lines or 25KB)
├── debugging.md       # Topic files — loaded on demand by Claude
├── api-conventions.md
└── voc_global.md
```

**Loading rules:** First 200 lines of MEMORY.md OR 25KB (whichever first) loaded at session start | Topic files NOT loaded at startup — Claude reads on demand | Keep MEMORY.md as index only; move detail to topic files.

**Auto Dream maintenance:** Converts relative dates→absolute | Deletes contradicted facts (e.g., Express→Fastify swap removes old entry) | Prevents memory decay over 20+ sessions.

**Toggle:** `/memory` command | `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` | Requires v2.1.59+.

### Subagent Memory Scopes
```yaml
memory: user     # ~/.claude/agent-memory/<name>/
memory: project  # .claude/agent-memory/<name>/
memory: local    # .claude/agent-memory-local/<name>/
```
First 200 lines or 25KB of each subagent's MEMORY.md loaded at startup. Read/Write/Edit tools auto-enabled when memory is active.

## Memory File Format

**MEMORY.md (index):** One-line descriptions linking to topic files. Never dump raw data here.
```markdown
- [Topic Name](topic-file.md) — one-line description of what's inside
```

**Topic files frontmatter:**
```yaml
---
name: "topic-name"
description: "What this file tracks"
type: preferences|patterns|mistakes|voc|reference
---
```

**MEMORY.md template sections:**
```
## Confirmed Preferences
## Patterns That Worked
## Mistakes to Avoid
## Pending Skill Updates (YYYY-MM-DD Skill##: desc — priority)
## Skill Usage Heatmap
```

**Hygiene:** Remove stale (30+ days unobserved) | Merge duplicates | Verify paths before recommending | Distinguish "memory says existed" from "exists now" | Scan 3 most recent project MEMORYs for reusable patterns.

**CLAUDE.md vs auto memory:** CLAUDE.md = your requirements (rules, enforced) | Auto memory = what Claude observed (patterns, emerged). Never put requirements in auto memory — they don't survive compaction reliably. CLAUDE.md survives `/compact`; auto memory survives as topic files.

## Omi Wearable Integration

Brian uses Omi AI wearable. Key people: Katie (SJSK), Michael/Mikwel (Penn Station), Nick Buckwick.

When `~/Downloads/omi-export.json` exists: scan for action items (build/create/deploy), product memories, people to feature, new product ideas. Keys in chezmoi; configured in `~/.claude.json`.

Products used daily: Square Terminal, Omi, Home Assistant, GQ EMF-390, AI coding tools, Cloudflare, Stripe, Resend, Ideogram.
