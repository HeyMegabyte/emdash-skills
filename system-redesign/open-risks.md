# Open Risks & Future Work

## Remaining Risks

### 1. ChatGPT Deep Scan Incomplete
400MB of conversation history was only surface-scanned. A dedicated 1-4 hour session with 32 parallel agents (one per file) should extract 50+ additional skill modifications. Currently encoded: technology preferences, communication style, iteration patterns, the Completeness Paradox. NOT yet encoded: every individual decision with context, every praised/rejected output pattern, every client-specific workflow.

### 2. Skill Content Still Varies in Quality
Some skills (07, 12, 28) are 300-1000 lines with rich code examples. Others (38, 39) are under 100 lines. A quality normalization pass should bring all skills to 150-300 lines with code templates, checklists, and integration points.

### 3. Frontmatter Not Yet Driving Routing
The frontmatter schema is defined and being applied, but the router still uses a manual `_router.md` file. The ideal future state: a script parses frontmatter at session start and generates the load set dynamically. This eliminates router drift.

### 4. No Automated Skill Testing
No mechanism verifies that skill descriptions actually trigger for the right prompts. A test suite (10 prompts per skill, verify correct activation) would catch description drift.

### 5. Project-Level CLAUDE.md Template Missing
When starting a new project, there's no auto-generated project-specific CLAUDE.md that inherits from global and adds domain/keyphrase/brief context.

## Completed (This Session)

- [x] Canonical ownership established
- [x] Skill 01 deduplicated (565→364)
- [x] Skill 53 deduplicated (414→294)
- [x] Skills 21, 22, 23, 25 created
- [x] All counts fixed to 58
- [x] Flesch threshold unified to 60
- [x] 9 artifact templates created
- [x] 4-layer architecture documented
- [x] Frontmatter schema defined
- [x] .archive/v3 removed (94KB saved)
- [x] Router rebuilt with correct always-active set
- [x] Settings.json fully leveraged (sandbox, auto-mode, hooks, concurrency)
- [x] 8 custom agents defined
- [x] Cross-tool symlinks (Claude, Codex, Gemini)
- [x] GitHub plugin published (HeyMegabyte/emdash-skills)
- [x] Deep preference analysis from 10,255 ChatGPT messages
- [x] 107 quantitative quality metrics cataloged
- [x] Recursive Self-Improvement Protocol in CLAUDE.md
