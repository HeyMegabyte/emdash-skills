---
name: "AI-Native Coding"
description: "Code patterns optimized for AI agents, not human habits. Explicit over implicit, flat over nested, self-documenting names, co-located context. AI should build complete full-stack systems with tight integration across all docs (CLAUDE.md, MEMORY.md, skills). Pushes beyond human coding patterns that limit AI capability."---

# AI-Native Coding

> AI was trained on human code, but it does not need to code like a human. Break the habits. Build complete systems.

---

## The Core Problem

AI models learned to code from human codebases. Humans:
- Write code in small increments over weeks
- Rely on memory and context not in the files
- Leave implicit knowledge in their heads
- Write partial solutions and "come back to it later"
- Under-document because they "know what it does"
- Use clever abstractions that require tribal knowledge
- Name things based on internal jokes or shorthand

**AI must not inherit these habits.** AI can write complete systems in one pass. It should.

---

## AI-Native Principles

### 1. Explicit Over Implicit
```typescript
// HUMAN HABIT: relies on knowing the convention
const u = await db.get(id);

// AI-NATIVE: self-documenting, no context needed
const user = await database.getUserById(userId);
```

Everything a future AI (or human) needs to understand the code should be IN the code. Not in someone's head. Not in a Slack thread. Not in a meeting note.

### 2. Flat Over Nested
```typescript
// HUMAN HABIT: deeply nested conditionals
if (user) {
  if (user.plan) {
    if (user.plan.isActive) {
      // finally do the thing
    }
  }
}

// AI-NATIVE: early returns, flat structure
if (!user) return notFound();
if (!user.plan) return noPlan();
if (!user.plan.isActive) return planExpired();
// do the thing
```

AI reads linearly. Flat code with early returns is faster to parse and less error-prone to modify.

### 3. Co-Located Context
```typescript
// HUMAN HABIT: magic number, meaning elsewhere
const LIMIT = 10;

// AI-NATIVE: meaning is right here
/** Max form submissions per IP per 60 seconds (Cloudflare KV rate limiter) */
const RATE_LIMIT_MAX_REQUESTS = 10;
```

Put the "why" next to the "what." AI does not have the benefit of overhearing the design discussion.

### 4. Complete Over Incremental
AI can write 500 lines in one pass. It should not write 50 lines and say "I'll add the rest later." Every function should be complete:
- All error cases handled
- All edge cases covered
- All types defined
- All validation present
- All documentation written

### 5. Connected Over Isolated
Every part of the system should know about the other parts through documentation:
- CLAUDE.md describes the system
- README.md describes the product
- Code comments link to related code
- JSDoc `@see` links to API docs
- Skills reference each other by number

---

## Full-Stack Integration Pattern

When AI builds a feature, it touches ALL layers in one pass:

```
1. Schema     → D1 migration with types
2. Validation → Zod schema (shared between client and server)
3. API        → Hono route with JSDoc
4. UI         → HTML/component with data binding
5. Test       → E2E test proving it works
6. SEO        → Meta tags, structured data, keywords
7. Analytics  → PostHog event tracking
8. Docs       → CLAUDE.md update, README if relevant
9. Deploy     → wrangler deploy + verify
```

No layer gets left incomplete. The feature is done-done or it does not ship.

---

## Documentation as Code

### CLAUDE.md is a Living File
```
Every session that changes architecture → update CLAUDE.md
Every new pattern established → add to CLAUDE.md Key Patterns
Every file deleted or moved → remove from CLAUDE.md
Every refactor → reflect in CLAUDE.md
```

### MEMORY.md Captures Cross-Session Intelligence
```
Preferences learned → save to memory
Patterns that work → save to memory
User corrections → save as feedback memory
Project decisions → save as project memory
```

### Skills Evolve with the System
```
New capability discovered → update the relevant skill
New best practice found → add to the relevant skill with source
Pattern deprecated → remove from skill, note why
User teaches a new approach → incorporate and credit
```

---

## AI-Optimized File Structure

### File Size Limits
- Source files: < 300 lines (split at 200)
- Test files: < 200 lines per test file
- Config files: as small as possible
- CLAUDE.md: < 200 lines

**Why:** AI works best with focused, single-purpose files. Large files cause context dilution.

### Naming for AI Scanability
```
src/
├── routes/
│   ├── api-checkout.ts       ← clear domain + function
│   ├── api-webhooks.ts
│   ├── pages-home.ts
│   └── pages-pricing.ts
├── services/
│   ├── stripe-service.ts     ← clear service name
│   ├── email-service.ts
│   └── user-service.ts
├── db/
│   ├── schema.sql            ← single source of truth
│   ├── queries-users.ts      ← queries grouped by entity
│   └── queries-payments.ts
└── types.ts                  ← all shared types in one place
```

### Import Organization
```typescript
// 1. External packages
import { Hono } from 'hono';
import { z } from 'zod';

// 2. Internal modules (absolute paths)
import { createCheckout } from '../services/stripe-service';
import { UserSchema } from '../types';

// 3. Types (type-only imports)
import type { Context } from 'hono';
```

---

## AI Creative Integration

### Where to Use AI (Without Breaking the Bank)

| Use Case | Model | Cost | Skill |
|----------|-------|------|-------|
| Image generation | GPT Image 1.5 | ~$0.04/image | 12 |
| Logo design | Ideogram v3 | ~$0.03/image | 12 |
| Video generation | Sora 2 | ~$0.10/video | 12 |
| Content writing | Claude (this agent) | Included | 09 |
| Code generation | Claude (this agent) | Included | 30 |
| Keyword research | Google Autocomplete | Free | 28 |
| Analytics | PostHog (self-hosted) | Free | 13 |
| Error tracking | Sentry (self-hosted) | Free | 13 |
| Search | SearXNG (self-hosted) | Free | 26 |
| Web scraping | FireCrawl (self-hosted) | Free | 26 |

### Creative AI Uses That Don't Break the Bank
1. **Auto-generated OG images** per page (one-time cost, cached forever)
2. **AI-written alt text** for images (runs locally in Claude, free)
3. **AI-curated stock photos** (search 10, pick best, free APIs)
4. **AI-generated favicon sets** from one Ideogram logo ($0.03)
5. **AI-translated content** for multi-language (runs in Claude, free)
6. **AI-written meta descriptions** per page (runs in Claude, free)
7. **AI keyword research** via autocomplete scraping (free)
8. **AI accessibility audit** via axe-core (free, automated)

### Expensive AI Uses (Worth It for Key Assets)
1. **Hero image** — one per site, $0.04, massive visual impact
2. **Product demo video** — one per product, $0.10-0.50, high conversion
3. **Custom illustrations** — 3-5 per site, $0.12-0.20 total
4. **Social preview images** — one per page, $0.04 each

### AI Uses to AVOID (Wasteful)
- AI-generated background patterns (use CSS instead)
- AI-generated icons (use Lucide/Heroicons, free SVG)
- AI for simple text formatting (just write it)
- AI image generation for stock photo use cases (use Pexels/Unsplash)

---

## Readability Rules (Flesch >= 60 Everywhere)

### Code Comments
- Write like you're explaining to a smart colleague who just joined
- Short sentences. Active voice. Concrete nouns.
- "This validates the email format" not "The following code performs validation of the electronic mail address format"

### Documentation
- README: Flesch 65+ (accessible to all)
- CLAUDE.md: Flesch 60+ (technical but clear)
- Legal pages: Flesch 60+ (plain English, not legalese)
- User-facing copy: Flesch 60+ (skill 09)
- Error messages: Flesch 70+ (crystal clear)

### Testing Your Writing
```bash
# Quick Flesch check in CI
echo "Your text here" | npx textstat-cli flesch
# Or use the inline calculator from skill 28
```

---

## Research-Backed AI Development Patterns (2026 Sources)

### Four Patterns of AI-Native Development (Source: InfoQ)
1. **Producer to Manager** — review AI output, don't write code. Set up auto-commit with rollback.
2. **Implementation to Intent** — write specs in markdown. Keep code modular so agents don't merge files.
3. **Delivery to Discovery** — generate multiple variants. Use git worktrees for parallel agent runs.
4. **Content to Knowledge** — build knowledge bases from incidents and lessons. Let agents suggest doc updates.

### CLAUDE.md Best Practices (Source: HumanLayer, Builder.io)
- Keep under 200 lines (60 is ideal). For each line ask: "Would removing this cause Claude to make mistakes?"
- Structure: WHAT (stack, structure) → WHY (business purpose) → HOW (commands)
- Use `file:line` pointers instead of code snippets (snippets go stale)
- Put specialized knowledge in skills, not root CLAUDE.md
- Layer: `~/.claude/CLAUDE.md` (global) > `./CLAUDE.md` (team) > `./CLAUDE.local.md` (personal)

### Spec-Driven Development (Source: Addy Osmani)
- Create `spec.md` before coding: requirements, architecture, data models, test strategy
- Break code into small single-purpose files (one function per file where sensible)
- Commit after each small task — granular git history acts as AI-readable changelog

### Code Comments for Agents (Source: Stack Overflow)
- Create `agents.md` in VCS: comment placement, indent rules, detail level, format
- Include gold standard reference file showing all conventions applied
- Show both correct AND incorrect examples
- Comment the WHY not the WHAT — agents can read code but cannot infer business reasoning

### Modern CSS for AI Projects (Source: Smashing Magazine 2026)
- `corner-shape: squircle` — iOS-style rounded rects natively (no SVG hacks)
- Temporal API — replaces Moment.js natively, ships in all browsers now
- CSS scroll-driven animations — zero JS, compositor-thread, always 60fps

### llms.txt Standard (Source: llms.txt spec)
Add `/llms.txt` to every site for AI discovery:
```
# Project Name
> One-line description

## Quick Start
- Install: npm install
- Build: npm run build
- Deploy: npx wrangler deploy

## Architecture
- Backend: Hono on Cloudflare Workers
- Database: D1
- Auth: Clerk
```

---

## Context Window Management (Critical for Performance)

### Token Budget Awareness
The AI has a finite context window. Every token of skill content loaded is a token NOT available for code. Manage this actively:

1. **Use _router.md FIRST** — load only the skills needed for this task type
2. **Reference CONVENTIONS.md instead of duplicating** — breakpoints, CSP headers, brand tokens, JSON-LD templates are defined ONCE in CONVENTIONS.md. Never copy them into skill files.
3. **Prefer file:line pointers over code blocks** — when referencing existing code, point to it (`src/index.ts:42`) instead of pasting it into context
4. **Summarize before loading** — if a skill is 500+ lines, mentally summarize the 3-5 key directives before consuming the full text
5. **Offload to MEMORY.md** — project-specific decisions go in MEMORY.md, not in re-derived context every prompt

### Deduplication Rules
These patterns appear in multiple skills. Reference the canonical location instead:
- Breakpoints → CONVENTIONS.md
- CSP headers → CONVENTIONS.md
- Hono starter → CONVENTIONS.md
- Error envelope → CONVENTIONS.md
- Turnstile pattern → CONVENTIONS.md
- Deploy command → CONVENTIONS.md
- JSON-LD templates → CONVENTIONS.md
- Form test matrix → skill 07 (Quality)
- SEO audit → skill 07 + 28
- Visual checklist → skill 07

### Incremental Context Loading
For multi-step tasks, load skills progressively:
```
Step 1: Load 01 + _router.md → determine path
Step 2: Load CONVENTIONS.md + SKILL_PROFILES.md → get constants + skill set
Step 3: Load phase-specific skills → build/test/deploy
Step 4: Unload irrelevant skills → free context for code
```

## What This Skill Owns
- AI-native coding patterns
- Full-stack integration requirements
- Documentation-as-code philosophy
- AI-optimized file structure
- Creative AI cost management
- Cross-system documentation sync
- Readability enforcement across all text
- Context window management strategy
- See STYLE_GUIDES.md for Google TS + Node.js rules

## What This Skill Must Never Own
- Specific implementation details (→ 06)
- Testing strategy (→ 07)
- Deployment (→ 08)
- Visual design (→ 10)
- SEO specifics (→ 28)
