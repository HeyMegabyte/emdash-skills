---
name: "preference-and-memory"
description: "Captures and evolves user preferences with confidence levels. Maintains Voice of the Customer model with exact language, dissatisfaction and aspiration signals. Handles promotion/demotion of preferences, global vs project scoping, and Omi wearable data integration."
submodules:
  - wisdom-and-human-psychology.md
  - brian-voc-data.md
---

## Submodules

| File | Description |
|------|-------------|
| wisdom-and-human-psychology.md | Timeless principles from behavioral psychology, philosophy, and self-help classics applied to product building. Ethical persuasion only. |
| brian-voc-data.md | Voice of the Customer data from 3,102 ChatGPT conversations — exact language, dissatisfaction signals, interaction velocity, prompt patterns. |

---

# 04 — Preference and Memory

> Capture what the user values. Evolve toward their standards. Never turn weak signals into permanent law.

---

## Core Principle

**The system must learn the user's preferences and converge toward their standards over time.** But preferences are not all equal — some are durable principles, some are situational, and some are experiments. Handle each with appropriate confidence.

---

## Voice of the Customer (VoC)

### What VoC Captures
The exact language, concerns, frustrations, ambitions, and standards of the user:
- What they consider weak, shallow, slow, ugly, incomplete, or unacceptable
- What they consider elite, complete, beautiful, useful, fast, and worth shipping
- Repeated wording and phrases that signal deep preferences
- Emotional emphasis and intensity markers

### VoC Model Structure

```markdown
## Voice of the Customer — [Project/Global]

### Desired Outcome
[What the user is ultimately trying to achieve]

### Dissatisfaction Signals
- [Exact quotes or paraphrases of what frustrates them]
- [Patterns of correction — what they keep fixing]

### Aspiration Signals
- [What they describe as ideal]
- [What they praise when they see it]
- [Standards they reference]

### Product Implications
[How VoC shapes what we build]

### UX Implications
[How VoC shapes how it feels]

### Copy Implications
[How VoC shapes what we say]

### Architecture Implications
[How VoC shapes technical decisions]

### Completeness Implications
[How VoC shapes how much we build per prompt]

### Speed Implications
[How VoC shapes how fast we work]

### Refinement Implications
[How VoC shapes how much we polish]
```

### VoC Capture Rules
- Capture exact language when it's specific and revealing
- Infer implications but label them as inferences
- Never fabricate customer voice — only record what was expressed
- Distinguish literal statements from inferred implications
- Update whenever the user materially changes priorities, corrects the system, redefines "done", adds strong emphasis, or writes ***PROCESS THIS***

### VoC Storage
- Global VoC: `/Users/apple/.claude/projects/-Users-apple-emdash-projects-megabyte-space/memory/voc_global.md`
- Project VoC: `PROJECT_BRIEF.md` VoC section or dedicated `VOC.md` in project root

### VoC Usage
Apply VoC when it helps:
- Product direction and prioritization
- Onboarding and first-run experience design
- Trust and proof surface design
- Media direction and art style
- Motion direction and interaction feel
- Page hierarchy and information architecture
- Growth surfaces and conversion
- Documentation tone and depth
- Autonomous idea generation and filtering

---

## Preference Taxonomy

### Confidence Levels
| Level | Definition | Treatment |
|-------|-----------|-----------|
| **Confirmed** | User explicitly stated or repeatedly demonstrated | Always follow |
| **Strong** | User confirmed a non-obvious choice without pushback | Follow by default |
| **Inferred** | Consistent pattern across multiple interactions | Follow but verify if stakes are high |
| **Weak** | Single observation, could be situational | Note but don't rely on |
| **Experimental** | User is trying something, hasn't committed | Apply in context, don't propagate |

### Preference Scope
| Scope | Applies To | Storage |
|-------|-----------|---------|
| **Global** | All projects | Memory system |
| **Project** | One project | Project CLAUDE.md or brief |
| **Session** | Current conversation | In-context only |
| **Experimental** | Trial period | Memory with expiry note |

---

## Preference Evolution Rules

### Promotion Path
```
Weak signal → repeated observation → Inferred preference → user confirmation → Confirmed preference
```

### Promotion Triggers
- User repeats the same correction 2+ times → promote to Inferred
- User explicitly states a preference → immediately Confirmed
- User accepts a non-obvious choice without pushback → Strong
- Inferred preference confirmed by user → Confirmed

### Demotion Triggers
- User contradicts a preference → re-evaluate, possibly demote
- Context changes (new project type) → scope-check, may not apply
- Long time since last observation → note staleness, verify before applying

### What Must Never Be Promoted to Confirmed Without Explicit Statement
- Technology choices (user might be flexible)
- Design aesthetics beyond stated principles
- Business model assumptions
- Feature scope preferences

### What Can Be Promoted Based on Pattern Alone
- Code style preferences (consistently demonstrated)
- Communication style (terse vs verbose)
- Review depth expectations
- Testing thoroughness expectations

---

## Preference Capture Triggers

Capture preferences when:
- User corrects the system ("no, not that", "don't do X")
- User confirms a non-obvious approach ("yes exactly", "perfect")
- User expresses frustration or delight
- User uses emphasized text (***TEXT***)
- User writes ***PROCESS THIS***
- User explicitly asks to remember something

### What to Capture
- The rule itself (what to do or not do)
- Why (the reason, if given — past incident, strong preference)
- How to apply (when/where this guidance kicks in)
- Scope (global, project, session, experimental)
- Confidence level

### What NOT to Capture as Preference
- One-time debugging decisions
- Project-specific technical details derivable from code
- Temporary workarounds
- Information already in CLAUDE.md

---

## Memory Integration

### Reading Memory
Before starting work:
1. Check memory for relevant preferences
2. Check memory for VoC signals
3. Check memory for project history
4. Apply confirmed and strong preferences automatically
5. Note inferred preferences for context-aware application

### Writing Memory
After significant interactions:
1. New preferences discovered → write to memory
2. Existing preferences confirmed → update confidence
3. Preferences contradicted → update or remove
4. VoC signals captured → update VoC model
5. New patterns observed → document with appropriate confidence

### Memory Hygiene
- Remove stale preferences (not observed in 30+ days with no confirmation)
- Merge duplicate entries
- Verify file paths and function names before recommending from memory
- Distinguish "memory says X existed" from "X exists now"

### Cross-Project Learning
When starting a new project, scan MEMORY.md files from the 3 most recent projects for:
- **Reusable patterns:** code snippets, configurations, or approaches that worked well
- **Avoided mistakes:** errors or bad decisions that should not be repeated
- **Preference drift:** if the user's preferences evolved across projects, use the latest version
- **Skill gaps:** if certain skills consistently needed manual intervention, flag them for update

Storage locations to scan:
```
~/.claude/projects/*/MEMORY.md           # Project-specific memories
~/.claude/MEMORY.md                       # Global memory
~/emdash-projects/*/CLAUDE.md            # Project configs
```

### MEMORY.md Template (standard sections)
Every project MEMORY.md should contain:
```markdown
## Confirmed Preferences
[Things the user explicitly asked for in this project]

## Patterns That Worked
[Successful approaches worth reusing]

## Mistakes to Avoid
[Things that went wrong and the fix]

## Pending Skill Updates
[Accumulated improvement suggestions — format: YYYY-MM-DD Skill##: description — priority]

## Skill Usage Heatmap
[Which skills were activated and how often]
```

---

## Trigger Conditions
- Start of every session (load preferences)
- User corrects or confirms behavior
- User uses emphasis signals
- VoC refresh needed
- ***PROCESS THIS*** received

## Stop Conditions
- Preferences loaded and applied
- No new preference signals detected

## Cross-Skill Dependencies
- **Reads from:** 01-operating-system (emphasis rules), 02-goal-and-brief (project context)
- **Feeds into:** All skills (preferences shape execution), 14-independent-idea-engine (VoC guides idea quality)

---

## What This Skill Owns
- User preference capture and evolution
- Voice of the Customer modeling
- Preference confidence levels and promotion rules
- Global vs project vs session scoping
- Memory integration for preferences

## What This Skill Must Never Own
- Project goal definition (→ 02)
- Implementation decisions (→ 06)
- Technology choices (→ 05)
- Design specifics (→ 10)

## Omi Wearable Data Integration

Brian uses an Omi AI wearable that records conversations and extracts:
- Action items (things he said he'd do)
- Memories (key facts about his life and projects)
- People (contacts and relationships)

### Key People (from Omi)
- **Katie** — works at St. John's Soup Kitchen, knows Brian well, key contact
- **Michael/Mikwel** — blind man at Penn Station, featured on mission site
- **Nick Buckwick** — close ally

### Scan Protocol
When `~/Downloads/omi-export.json` exists, scan it for:
1. Action items mentioning "build", "create", "deploy", "website", "app"
2. Memories about products, tools, integrations
3. People who should be featured or contacted
4. New product ideas mentioned in conversations

### Products Brian Uses Daily
Square Terminal, Omi wearable, Home Assistant, GQ EMF-390,
AI coding tools, Cloudflare, Stripe, Resend, Ideogram
