# Routing Gaps Report

Analysis of routing inconsistencies, missing references, and count mismatches.
Audit date: 2026-04-19

---

## 1. Skill Count Mismatch (CRITICAL)

Different documents claim different totals:

| Source | Claimed Count | Evidence |
|--------|--------------|----------|
| `~/.claude/CLAUDE.md` (global) | **56** | Line 73: "56 skills at ~/.agentskills/" |
| `~/.agentskills/README.md` | **50** | Title: "50-Skill Autonomous Product-Building System" |
| `~/.agentskills/_router.md` | **55** | Line 27: "ALL skills (55)" for full project |
| `~/.agentskills/SKILL_PROFILES.md` | **49** | Line 1: "Not all 49 skills apply to every project" |
| `~/.agentskills/QUICK_REF.md` | **49** | Line 65: "Loading all 49 skills for a simple fix" |
| `CLAUDE.md` (in system prompt context) | **49** | Line listing: "Skills (49 skills, see /Users/apple/.agentskills/README.md)" |

### Actual Filesystem Count

**Numbered skill directories on disk:** 49 (01-57, with gaps at 21, 22, 23, 25)
**Unnumbered skill directories:** 1 (gh-fix-ci)
**Total skill directories:** 50

### Gap Numbers (missing from filesystem)

| Number | Status | Notes |
|--------|--------|-------|
| 21 | **Missing** | No `21-*` directory exists. Gap between 20 and 24. |
| 22 | **Missing** | No `22-*` directory exists. |
| 23 | **Missing** | No `23-*` directory exists. |
| 25 | **Missing** | No `25-*` directory exists. Gap between 24 and 26. |

### Diagnosis

The filesystem has exactly **50 active skills** (49 numbered + gh-fix-ci). The count claims range from 49 to 56.

- **49** = old count from before skills 53-57 were added (SKILL_PROFILES.md, QUICK_REF.md never updated)
- **50** = README.md title (accurate for the numbered-skills-only count at time of writing, before gh-fix-ci was considered)
- **55** = _router.md "ALL skills" (off by 5 from reality)
- **56** = CLAUDE.md global (most inflated; possibly counting planned but unimplemented skills)

**Correct answer: 50 active skills on disk.** All documents should say 50.

---

## 2. Skills NOT Referenced in _router.md Task-Type Table

The router's "By Task Type" table (lines 19-35) and "By File Being Edited" table (lines 37-49) list which skills to ADD beyond always-active. These skills are NEVER mentioned in either table:

| Skill | In Always-Active? | In Task Table? | In File Table? | Status |
|-------|-------------------|----------------|----------------|--------|
| 02-goal-and-brief | No | Yes (New project) | No | OK |
| 03-planning-and-research | No | No | No | **GAP** |
| 04-preference-and-memory | No | No | No | **GAP** |
| 14-independent-idea-engine | No | No | No | **GAP** |
| 19-email-templates | No | No | No | **GAP** |
| 26-shared-api-pool | No | Yes (Infrastructure) | No | OK |
| 27-social-automation | No | No | No | **GAP** |
| 38-uptime-and-health | No | No | No | **GAP** |
| 39-changelog-and-releases | No | No | No | **GAP** |
| 40-backup-and-disaster-recovery | No | No | No | **GAP** |
| 41-user-feedback-collection | No | No | No | **GAP** |
| 50-coolify-docker-proxmox | No | Yes (Infrastructure) | No | OK |
| 57-ai-technology-integration | No | No | No | **GAP** |

**Total gaps:** 9 skills are neither always-active NOR referenced in ANY task-type or file-pattern row.

These skills can ONLY be loaded via:
1. "Full project / autonomous" (loads ALL)
2. Profile-based loading (SKILL_PROFILES.md)
3. Manual invocation

**Recommendation:** Add rows for:
- Content/email tasks: add 19, 27
- Analytics/monitoring tasks: add 38, 39
- Research/ideation tasks: add 03, 04, 14
- Backup/recovery tasks: add 40
- AI-powered features: add 57
- Feedback/NPS tasks: add 41

---

## 3. Skills NOT in Any Profile in SKILL_PROFILES.md

The profiles file defines 6 profiles: Marketing Site, SaaS Application, Nonprofit/Donation, API Service, Developer Tool/OSS, Micro-SaaS.

Skills that appear in ZERO profiles:

| Skill | In Any Profile? | Notes |
|-------|-----------------|-------|
| 03-planning-and-research | Yes (SaaS only) | OK |
| 04-preference-and-memory | Yes (SaaS only) | OK |
| 26-shared-api-pool | Yes (API Service) | OK |
| 27-social-automation | **NO** | Never listed in any profile |
| 35-ci-cd-pipeline | Yes (Dev Tool) | OK |
| 38-uptime-and-health | Yes (API Service) | OK |
| 39-changelog-and-releases | Yes (Dev Tool) | OK |
| 40-backup-and-disaster-recovery | Yes (API Service) | OK |
| 41-user-feedback-collection | **NO** | Never listed in any profile |
| 43-ai-chat-widget | Conditional (Nonprofit) | Partial |
| 50-coolify-docker-proxmox | **NO** | Never listed in any profile |
| 52-mcp-and-cloud-integrations | Yes (SaaS, API) | OK |
| 53-autonomous-orchestrator | **NO** | Never listed — but it IS the orchestrator |
| 54-computer-use-automation | **NO** | Never listed in any profile |
| 55-chrome-and-browser-workflows | **NO** | Never listed in any profile |
| 56-completeness-verification | **NO** | Never listed in any profile |
| 57-ai-technology-integration | **NO** | Never listed in any profile |

**Total missing from all profiles:** 8 skills

**Note:** Skills 53-57 were added AFTER SKILL_PROFILES.md was written. The profiles file still reflects the pre-53 era. Skills 27 and 41 are simply overlooked.

**Recommendation:**
- Add 53, 54, 55, 56, 57 to the SaaS Application profile (they're always-active in _router.md anyway).
- Add 27 (Social) to all profiles that involve public-facing sites (Marketing, SaaS, Nonprofit, Dev Tool).
- Add 41 (Feedback) to SaaS and Nonprofit profiles.
- Add 50 (Coolify) to API Service profile.
- Update the profile count to acknowledge these additions.

---

## 4. Router Always-Active Count Discrepancy

### What _router.md claims:

Line 9-14 lists these always-active skills:
```
01, 05, 06, 07, 08, 09, 10, 12, 13, 20, 24, 28, 29, 30, 31, 32, 37, 42, 43, 44, 48, 51, 52, 53, 54, 55, 56
+ CONVENTIONS.md, STYLE_GUIDES.md
```

Line 17: "(27 skills = 49% always loaded)"

### Actual count of listed items:

Counting the skills on lines 9-14:
01, 05, 06, 07, 08, 09, 10, 12, 13, 20, 24, 28, 29, 30, 31, 32, 37, 42, 43, 44, 48, 51, 52, 53, 54, 55, 56

**Count: 27 skills** (correct, matches the claim)

### Missing from always-active that probably should be:

| Skill | Currently | Should Be Always-Active? | Rationale |
|-------|-----------|--------------------------|-----------|
| 02-goal-and-brief | Task-specific | Maybe | Loaded for every NEW project, but not bug fixes |
| 04-preference-and-memory | Not listed | Maybe | VoC is referenced by 01 as part of re-synthesis |
| 11-motion-and-interaction | Task-specific | No | Only needed for visual work |
| 14-idea-engine | Not listed | No | Only after features are complete |
| 57-ai-technology | Not listed | Maybe | Visual TDD is mandatory on every deploy |

### Skills in always-active that may not need to be:

| Skill | Lines | Justification for Always? |
|-------|-------|---------------------------|
| 37-site-search | 491 | Only SaaS/large sites need search. Expensive at 491 lines. |
| 43-ai-chat-widget | 172 | Only products need a chat widget. Not bug fixes. |
| 44-drizzle-orm | 207 | Only projects with databases. Not marketing sites. |
| 54-computer-use | 258 | Only native app work. Rarely needed. |
| 55-chrome-and-browser | 228 | Only browser automation tasks. |

**Total token cost of always-active skills:** ~8,400 lines loaded every session regardless of task.

**Recommendation:** Consider moving 37, 43, 44, 54, 55 from always-active to task-specific. This would save ~1,356 lines (~3,400 tokens) on non-build sessions. The router could be:
- Always-active: 22 skills (core set)
- Build-active: +5 (37, 43, 44, 54, 55) — loaded for ANY build task
- Task-specific: the rest

---

## 5. Decision Tree Discrepancies

### _router.md Decision Tree (lines 93-104) vs actual always-active count

The decision tree says:
```
Always-active (21) + New Project extras (28 total)
Always-active (21) + gh-fix-ci (22 total)
Always-active (21) + 11, 15 (23 total)
Always-active (21) + task-specific (22-30 total)
```

But the always-active list has **27** skills, not 21. The decision tree was written when always-active was smaller and was never updated.

**Recommendation:** Update the decision tree numbers to match the actual always-active count of 27.

---

## 6. Profile vs Router Contradictions

| Profile | Skills According to SKILL_PROFILES.md | Skills According to _router.md |
|---------|--------------------------------------|-------------------------------|
| Marketing Site | 21 skills listed | "Always-active + 11, 15, 33, 34 (25 total)" |
| SaaS Application | 35 skills listed | "ALL 50 skills" |
| Nonprofit/Donation | 23 skills listed | "Always-active + 11, 15, 18, 19, 33, 34, 41, 43 (29 total)" |
| API Service | 16 skills listed | "Always-active + 26, 38, 40, 45, 50, 52 (27 total)" |
| Developer Tool/OSS | 23 skills listed | "Always-active + 33, 35, 37, 39, 47 (26 total)" |

**Discrepancies:**
1. Marketing Site: SKILL_PROFILES lists 21 skills explicitly, but does NOT include many skills that _router.md loads via always-active (e.g., 13, 44, 48, 52, 53, 54, 55, 56 are always-active but NOT in the Marketing Site profile). This means _router.md would load MORE skills than the profile intends.

2. SaaS: SKILL_PROFILES lists 35 skills. _router.md says "ALL 50." These cannot both be correct.

3. Nonprofit: _router.md says 29 total. SKILL_PROFILES lists 23. The always-active base (27) + 8 extras = 35, not 29.

**Root cause:** SKILL_PROFILES.md was written BEFORE the always-active set was expanded to 27. Its skill lists assume a much smaller base. The router was updated independently.

**Recommendation:** Reconcile by choosing one as authoritative:
- Make _router.md the routing authority (what to load)
- Make SKILL_PROFILES.md the feature-checklist authority (what features to implement)
- Document clearly that the profile's "Included Skills" list is the FEATURE checklist, not the loading list

---

## 7. Numbering Gap Investigation

The numbering jumps from 20 to 24, and from 24 to 26:

| Missing # | Likely Original Intent | Evidence |
|-----------|----------------------|----------|
| 21 | Performance Optimization? | rules/quality-metrics.md has detailed performance budgets that have no skill home |
| 22 | Security Hardening? | Security checks are scattered across 07 (inline) with no dedicated skill |
| 23 | Analytics Configuration? | GA4/GTM setup is in 13 but could warrant its own skill |
| 25 | Newsletter/Listmonk? | Listmonk is in 13 but referenced separately elsewhere |

These gaps suggest skills that were planned but never created, or were merged into other skills during v4 development.

**Recommendation:** Either:
- Create placeholder skills at 21-23, 25 to fill the gaps (reduces confusion)
- Document the gaps in README.md explaining why they're intentionally empty
- Renumber (disruptive — many cross-references would break)

---

## 8. Commands (Slash Commands) Coverage

Only 13 of 50 skills have slash command symlinks in `~/.claude/commands/`:

| Has Command | Skill |
|-------------|-------|
| Yes | 01, 07, 08, 10, 12, 13, 18, 20, 28, 34, 44, 51, gh-fix-ci |
| No | All other 37 skills |

**High-value missing commands:**
- `/build` -> 06-build-and-slice-loop
- `/test` -> 07 (already exists as quality-gate)
- `/search` -> 37-site-search
- `/i18n` -> 42-internationalization
- `/verify` -> 56-completeness-verification
- `/orchestrate` -> 53-autonomous-orchestrator

---

## 9. _router.md Internal Consistency Issues

| Issue | Location | Details |
|-------|----------|---------|
| Count says "49%" | Line 17 | 27/50 = 54%, not 49%. Math is wrong. |
| Parallel Agent table missing skills | Lines 61-71 | No agent gets skills 14, 19, 26, 41. These are never distributed to any agent. |
| "ALL skills (55)" | Line 27 | Should be 50, not 55. |
| Decision tree says "21" | Lines 98-103 | Should be 27 (current always-active count). |
| SaaS profile says "ALL 50" | Line 56 | But SKILL_PROFILES.md only lists 35 for SaaS. Contradiction. |

---

## Summary of Actions

### Priority 1: Fix count mismatches
- Update README.md title: "50-Skill" (correct)
- Update CLAUDE.md: "50 skills" (not 56)
- Update _router.md: "ALL skills (50)" not (55)
- Update SKILL_PROFILES.md: "Not all 50 skills" (not 49)
- Update QUICK_REF.md: "Loading all 50 skills" (not 49)
- Update _router.md line 17: "27 skills = 54%" (not 49%)
- Update _router.md decision tree: "27" not "21"

### Priority 2: Add missing routing entries
- Add 9 unrouted skills to _router.md task-type table
- Add 8 missing skills to SKILL_PROFILES.md profiles

### Priority 3: Reconcile router vs profiles
- Decide: profiles = feature checklist, router = loading list
- Document this distinction at the top of SKILL_PROFILES.md

### Priority 4: Address numbering gaps
- Document gaps 21-23, 25 in README.md with explanation
- Or create the missing skills (security, performance, analytics, newsletter)
