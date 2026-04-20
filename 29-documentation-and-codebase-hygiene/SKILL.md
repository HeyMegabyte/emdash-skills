---
name: "Documentation and Codebase Hygiene"
description: "Keep the entire codebase in sync: README.md (install.doctor template with divider PNGs, shields.io badges), CLAUDE.md, MEMORY.md, JSDoc/TypeDoc, code comments with references, and cross-project documentation. Remove stale code/comments. Style READMEs with branded dividers and status buttons. Runs continuously."
layer: "capability-pack"
canonical-owner-of:
  - "readme-template"
  - "claude-md-standards"
  - "code-comment-hygiene"
  - "jsdoc-documentation"
  - "stale-code-removal"
model: "haiku"
---

# Documentation and Codebase Hygiene

> Every file tells the truth. Every comment earns its place. Every doc stays current.

---

## Core Rule

The entire codebase — code, comments, markdown, configs — must stay in sync at all times. Stale docs are worse than no docs. Old comments that describe removed code are bugs.

---

## README.md Standard (install.doctor Template)

Every project gets a branded README styled after the install.doctor template.

### Structure
```markdown
<div align="center">
  <a href="https://domain.com">
    <img src="https://raw.githubusercontent.com/org/repo/master/.config/assets/logo.png" width="148" height="148" />
  </a>
  <h1>Project Name</h1>
  <p><em>One-line description</em></p>
</div>

<div align="center">

<!-- Status badges -->
[![Build](https://img.shields.io/github/actions/workflow/status/org/repo/deploy.yml?style=flat-square)](https://github.com/org/repo/actions)
[![License](https://img.shields.io/github/license/org/repo?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fdomain.com&style=flat-square)](https://domain.com)
[![Cloudflare](https://img.shields.io/badge/Hosted%20on-Cloudflare-orange?style=flat-square&logo=cloudflare)](https://domain.com)

</div>

<!-- Divider -->
<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Overview

Short description of what this project does and who it's for.

<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Features

- Feature 1 — brief description
- Feature 2 — brief description
- Feature 3 — brief description

<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Quick Start

\```bash
git clone https://github.com/org/repo
cd repo
npm install
npx wrangler deploy
\```

<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Hosting | Cloudflare Workers |
| Backend | Hono |
| Database | D1 |
| Auth | Clerk |
| Analytics | PostHog + GA4 |
| Errors | Sentry |

<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## Documentation

- [CLAUDE.md](CLAUDE.md) — AI coding context
- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) — Product thesis

<img src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" width="100%" />

## License

[MIT](LICENSE) © [Brian Zalewski](https://megabyte.space)
```

### Badge Selection (Per Project Type)

Pick from these shields.io badges (install.doctor uses `for-the-badge` style):

```markdown
<!-- Universal (for-the-badge style like install.doctor) -->
[![Website](https://img.shields.io/website?down_color=%23FF4136&down_message=Down&label=Homepage&logo=home-assistant&logoColor=white&up_color=%232ECC40&up_message=Up&url=https%3A%2F%2FDOMAIN&style=for-the-badge)]()
[![Build](https://img.shields.io/github/actions/workflow/status/ORG/REPO/deploy.yml?style=for-the-badge)]()
[![License](https://img.shields.io/github/license/ORG/REPO?style=for-the-badge)]()

<!-- Platform -->
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)]()
[![Hono](https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()

<!-- Quality -->
[![Playwright](https://img.shields.io/badge/E2E-Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)]()
[![WCAG](https://img.shields.io/badge/WCAG-AA-0074D9?style=for-the-badge)]()

<!-- Community (install.doctor style) -->
[![Slack](https://img.shields.io/badge/Slack-Chat-e01e5a?logo=slack&logoColor=white&style=for-the-badge)]()
[![GitHub](https://img.shields.io/badge/Mirror-GitHub-333333?logo=github&style=for-the-badge)]()
```

### Divider Image
Store a branded divider PNG at `.config/assets/divider.png` in each repo.
Generate a subtle gradient line (cyan → blue → purple, 1px height, full width).
Use throughout README to separate sections visually.

---

## CLAUDE.md Standards

Every project maintains a CLAUDE.md that serves as AI context.

### Required Sections
```markdown
# Project Context

## What This Is
[1-2 sentence product description]

## Tech Stack
[Table of technologies used]

## Project Structure
[Directory tree of key folders]

## Key Patterns
[Code conventions, naming, architecture decisions]

## Commands
[Build, deploy, test commands]

## Current State
[What's built, what's in progress, known issues]
```

### Update Rules
- Update "Current State" after every session
- Update "Key Patterns" when new conventions are established
- Remove references to deleted files or deprecated patterns
- Keep it under 200 lines (concise, not exhaustive)

---

## Code Comments Standards

### When to Comment
- **Why** something is done (not what)
- Complex algorithms or non-obvious logic
- Workarounds with linked issue/PR numbers
- API contracts and interface boundaries
- Security-sensitive decisions

### When NOT to Comment
- Self-explanatory code (`// increment counter` above `counter++`)
- Comments that restate the code
- TODO/FIXME without a linked issue
- Commented-out code (delete it, git has history)

### Comment Quality Rules
```typescript
// BAD: Restates the code
// Set the user name
user.name = name;

// GOOD: Explains why
// Clerk webhook sends display_name, but our DB schema uses name
user.name = clerkUser.display_name;

// GOOD: Links to reference
// Rate limit: 10 req/60s per IP (Cloudflare KV-based)
// See: https://developers.cloudflare.com/kv/
if (!await rateLimit(c, ip, 10, 60)) return c.json({ error: 'Rate limited' }, 429);

// GOOD: Documents a non-obvious decision
// We use ULID instead of UUID because D1 benefits from ordered primary keys
// for insert performance. See: https://github.com/ulid/spec
const id = ulid();
```

### JSDoc Standards (TypeScript)
```typescript
/**
 * Create a Stripe checkout session for a subscription or one-time payment.
 *
 * @param priceId - Stripe Price ID from the pricing table
 * @param mode - 'subscription' for recurring, 'payment' for one-time
 * @returns Checkout session URL to redirect the user to
 *
 * @example
 * const url = await createCheckout('price_123', 'subscription');
 * // Redirect user to url
 *
 * @see https://docs.stripe.com/api/checkout/sessions/create
 */
async function createCheckout(priceId: string, mode: 'subscription' | 'payment'): Promise<string> {
```

### JSDoc Rules
- Every exported function gets JSDoc
- Include `@param`, `@returns`, `@example`, `@see` (with URL)
- Link to external API docs with `@see`
- Include usage examples for complex functions
- Keep descriptions under 2 sentences

---

## Stale Code Removal

### What to Remove
- Commented-out code blocks (git has the history)
- Unused imports
- Dead functions (not called anywhere)
- Deprecated patterns that have been replaced
- TODO/FIXME comments older than 30 days without linked issues
- Console.log debugging statements
- Old migration files that have been applied

### What to Keep
- Code the user specifically wrote or prompted for
- Documented workarounds with issue links
- Feature flags that are actively being evaluated
- Test fixtures and helpers (even if not used in every test)

### Removal Rules
- Never remove something the user explicitly created without asking
- Run `npx knip` or manual grep for unused exports before removing
- Check git blame: if the user wrote it recently, ask before removing
- If in doubt, ask: "I found unused code at X. OK to remove?"

---

## Cross-Project Documentation Sync

### On Every Session
1. Verify README.md matches current project state
2. Verify CLAUDE.md reflects current architecture
3. Update "Current State" section
4. Remove references to deleted files
5. Add references to new files

### On Feature Completion
1. Update README features list
2. Update CLAUDE.md key patterns if new convention
3. Update any relevant skill files
4. Update PROJECT_BRIEF.md current truth section

### On Refactor
1. Update all affected documentation
2. Rename references in comments, docs, and configs
3. Run search for old names to catch stragglers
4. Update CLAUDE.md project structure

---

## TypeDoc / API Documentation

### For Projects with Public APIs
```bash
# Generate API docs
npx typedoc --entryPoints src/index.ts --out docs/api
```

### Configuration (typedoc.json)
```json
{
  "entryPoints": ["src/index.ts"],
  "out": "docs/api",
  "theme": "default",
  "readme": "none",
  "excludePrivate": true,
  "excludeInternal": true
}
```

### For Shell Scripts (shdoc)
```bash
# @description Deploy the project and purge cache
# @param $1 Environment (production|staging)
# @example deploy production
deploy() {
  local env="${1:-production}"
  npx wrangler deploy --env "$env"
}
```

---

## AI-Readable Formatting

### File Headers
Every source file starts with a brief header:
```typescript
/**
 * @module api/checkout
 * @description Stripe checkout session creation and webhook handling.
 * @see https://docs.stripe.com/api/checkout
 */
```

### Consistent Naming
- Files: kebab-case (`checkout-session.ts`)
- Functions: camelCase (`createCheckoutSession`)
- Types/Interfaces: PascalCase (`CheckoutSession`)
- Constants: SCREAMING_SNAKE (`MAX_RETRY_COUNT`)
- Database columns: snake_case (`created_at`)

### Directory README Files
Every directory with 3+ files gets a brief README:
```markdown
# /src/routes

API route handlers organized by domain.

- `api.ts` — Public API endpoints
- `pages.ts` — HTML page routes
- `webhooks.ts` — Stripe and Clerk webhook handlers
```

---

## Quality Checks (Automated)

```bash
# Check for stale TODOs
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" | head -20

# Check for console.log debugging
grep -rn "console\.log" src/ --include="*.ts" | grep -v "// keep" | head -20

# Check for commented-out code (heuristic: 3+ consecutive commented lines)
awk '/^[[:space:]]*\/\//{c++} !/^[[:space:]]*\/\//{if(c>=3)print FILENAME":"NR-c"-"NR-1": "c" consecutive comment lines"; c=0}' src/*.ts

# Check for unused exports
npx knip --reporter compact 2>/dev/null || echo "Install knip for unused export detection"
```

---

## What This Skill Owns
- README.md template and maintenance
- CLAUDE.md standards and sync
- Code comment quality and hygiene
- JSDoc/TypeDoc documentation
- Stale code and comment removal
- Cross-project documentation sync
- AI-readable code formatting
- Directory-level documentation

## What This Skill Must Never Own
- Content writing (→ 09, 22)
- Implementation (→ 06)
- Testing (→ 07)
- Deployment (→ 08)
