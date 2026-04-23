---
name: "Documentation and Codebase Hygiene"
version: "1.1.0"
updated: "2026-04-23"
description: "Keep codebase in sync: README (install.doctor template, shields.io badges), CLAUDE.md, MEMORY.md, JSDoc/TypeDoc, stale code removal. Stale docs = bugs. Runs continuously."
---

# Documentation and Codebase Hygiene

Stale docs are bugs. The entire codebase (code, comments, markdown, configs) stays in sync at all times.

## README.md (install.doctor Template)
```markdown
<div align="center">
  <img src=".config/assets/logo.png" width="148" height="148" />
  <h1>Project Name</h1>
  <p><em>One-line description</em></p>
</div>

<!-- Badges (for-the-badge style) -->
[![Build](https://img.shields.io/github/actions/workflow/status/ORG/REPO/deploy.yml?style=for-the-badge)]()
[![Website](https://img.shields.io/website?url=https%3A%2F%2FDOMAIN&style=for-the-badge)]()
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare)]()

<!-- Dividers between sections -->
<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Overview | ## Features | ## Quick Start | ## Tech Stack | ## Documentation | ## License
```

## CLAUDE.md Standards
Required: What This Is, Tech Stack, Project Structure, Key Patterns, Commands, Current State. Keep <200 lines. Update after every session.

## Code Comments
**When:** WHY (not what), complex algorithms, workarounds with issue links, API contracts, security decisions.
**Never:** Restating code, TODO without issue link, commented-out code (git has history).

```typescript
// GOOD: Clerk webhook sends display_name, but our DB schema uses name
user.name = clerkUser.display_name;

// GOOD: Rate limit: 10 req/60s per IP (CF KV-based). See: https://...
```

## JSDoc
Every exported function: `@param`, `@returns`, `@example`, `@see` (with URL). Descriptions <2 sentences.

## Stale Code Removal
**Remove:** Commented-out code, unused imports, dead functions, TODO >30 days without issue, console.log debug, old applied migrations.
**Keep:** User-written code, documented workarounds with links, active feature flags.
**Rule:** Never remove user code without asking. Use `npx knip` for unused exports.

## Sync Protocol
**Every session:** README matches reality, CLAUDE.md current, remove deleted file refs.
**Feature completion:** Update README features, CLAUDE.md patterns, relevant skills.
**Refactor:** Update all docs, rename refs, grep for old names, update project structure.

## Naming Conventions
Files: kebab-case. Functions: camelCase. Types: PascalCase. Constants: SCREAMING_SNAKE. DB columns: snake_case.

## Quality Checks
```bash
grep -rn "TODO\|FIXME" src/ --include="*.ts" | head -20
grep -rn "console\.log" src/ --include="*.ts" | grep -v "// keep"
npx knip --reporter compact
```

## Ownership
**Owns:** README template, CLAUDE.md standards, code comment quality, JSDoc, stale code removal, cross-project sync, AI-readable formatting.
**Never owns:** Content writing (->09,22), implementation (->06), testing (->07), deployment (->08).
