# Skills System Changelog

## 2026-04-20 — v5.1 14-Category Re-Architecture

### Architecture
- Consolidated 57 skills into 14 parent categories with submodule files
- 44 child skills moved as .md files into parent folders, zero data loss
- Deleted stale: system-audit/, system-redesign/, .emdash/, migration scripts

### Meta Files
- _router.md v2 (submodule routing, always-load-all-14)
- MASTER_PROMPT.md v5.1, SKILL_PROFILES.md, QUICK_REF.md, CONVENTIONS.md updated

### ChatGPT Data Integration
- Processed 3,102 conversations (428MB): tech, feedback, product, personal, design, AI workflow
- Created 3 new memory files, updated 8 existing with quantified data
- Updated rules (brian-preferences, copy-writing, code-style) and skills (05, 09, 10)

### Token Efficiency
- Rules: 344→280 lines. Skills: 57→14 discovered (reduced auto-discovery overhead)

## 2026-04-18 — v4.4 Self-Improving System

- Added continuous skill maintenance (per-prompt, per-5-prompts, per-project)
- Added MEMORY.md pending updates accumulation + batch-apply
- Added self-healing, CLAUDE.md/MEMORY.md auto-enhancement
- Added source freshness verification, contradiction detection, skill telemetry
- Added cross-project learning, pre-flight checklist, time budgets
- Enhanced _router.md, SKILL_PROFILES.md, CONVENTIONS.md, QUICK_REF.md

## 2026-04-19 — v4.3 Final Optimization

- Merged 5 overlapping skills. Created _router, CONVENTIONS, QUICK_REF, SKILL_PROFILES, llms.txt
- Added scripts/discover-secrets.sh, self-improvement/research protocols
- Scanned GitHub starred repos. 53→49 skills, ~12,200 lines

## 2026-04-19 — v4.2 Psychology and Integration

- Created Wisdom skill (30 Laws of UX, Cialdini, Kahneman)
- Created MCP Integrations skill (16 servers, secrets discovery)
- Enhanced 9 skills with psychology, mapped 181 secrets, verified 50+ keys

## 2026-04-19 — v4.1 Product Completeness

- Created skills 31-50 + 28-30. Added Flesch, Yoast, keyword APIs. 14→53 skills

## 2026-04-18 — v4.0 Initial Architecture

- Restructured from 24 flat (v3) to 14 numbered categories
- YAML frontmatter, MASTER_PROMPT.md, media templates, archived v3
