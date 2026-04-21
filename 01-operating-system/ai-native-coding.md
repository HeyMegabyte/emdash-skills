---
name: "AI-Native Coding"
description: "Code patterns optimized for AI agents, not human habits. Explicit over implicit, flat over nested, self-documenting names, co-located context. AI should build complete full-stack systems with tight integration across all docs (CLAUDE.md, MEMORY.md, skills). Pushes beyond human coding patterns that limit AI capability."---

# AI-Native Coding

## Principles

### 1. Explicit Over Implicit
```typescript
// BAD: const u = await db.get(id);
// GOOD: const user = await database.getUserById(userId);
```
Everything needed to understand code is IN the code. Not in heads, Slack, or meetings.

### 2. Flat Over Nested
Early returns, flat structure. AI reads linearly. `if (!user) return notFound();` not nested ifs.

### 3. Co-Located Context
```typescript
// BAD: const LIMIT = 10;
// GOOD: /** Max form submissions per IP per 60s (CF KV rate limiter) */ const RATE_LIMIT_MAX_REQUESTS = 10;
```

### 4. Complete Over Incremental
AI writes 500 lines in one pass. Every function: all error cases, edge cases, types, validation, docs.

### 5. Connected Over Isolated
CLAUDE.md describes system, README describes product, code comments link related code, JSDoc @see links to API docs, skills reference each other.

## Full-Stack Integration (one pass per feature)
Schema(D1) -> Validation(Zod shared) -> API(Hono+JSDoc) -> UI(component) -> Test(E2E) -> SEO(meta+structured data) -> Analytics(PostHog event) -> Docs(CLAUDE.md) -> Deploy(wrangler)

## Documentation as Code
- CLAUDE.md: update on every architecture change. Remove stale refs on delete/move.
- MEMORY.md: preferences, patterns, corrections, project decisions.
- Skills: new capability->update skill. Deprecated->remove+note why.

## File Structure
- Source files: <300 lines (split at 200). Test files: <200 lines.
- Names for scanability: `api-checkout.ts`, `stripe-service.ts`, `queries-users.ts`
- Imports: 1) external packages, 2) internal modules, 3) type-only imports

## AI Cost Management
| Use Case | API | Cost |
|----------|-----|------|
| Image gen | GPT Image 1.5 | ~$0.04 |
| Logo | Ideogram v3 | ~$0.03 |
| Video | Sora 2 | ~$0.10 |
| Alt text, translations, meta, keywords, a11y | Workers AI / Claude | $0 |

**Avoid:** AI background patterns (use CSS), AI icons (use Lucide), AI for simple text formatting.

## Context Window Management
1. Use _router.md FIRST — load only needed skills
2. Reference CONVENTIONS.md (breakpoints, CSP, brand tokens, JSON-LD) — never duplicate
3. Prefer `file:line` pointers over pasting code blocks
4. Offload project decisions to MEMORY.md

### Deduplication (canonical locations)
Breakpoints, CSP, Hono starter, error envelope, Turnstile, deploy command, JSON-LD templates -> CONVENTIONS.md
Form test matrix, SEO audit, visual checklist -> skill 07

## Research-Backed Patterns (2026)

**AI-Native Development (InfoQ):** Producer-to-Manager (review, don't write), Implementation-to-Intent (specs in markdown), Delivery-to-Discovery (multiple variants via worktrees), Content-to-Knowledge (knowledge bases from incidents).

**CLAUDE.md Best Practices (HumanLayer):** <200 lines (60 ideal). WHAT->WHY->HOW. Use file:line not snippets. Layer: global > team > personal.

**Spec-Driven (Addy Osmani):** Create spec.md before coding. Small single-purpose files. Commit after each task.

**Code Comments for Agents:** Comment WHY not WHAT. Include gold standard reference. Show correct+incorrect examples.

**Modern CSS (2026):** `corner-shape: squircle`, Temporal API (replaces Moment.js), CSS scroll-driven animations (zero JS, 60fps).

**llms.txt:** Add `/llms.txt` to every site with Quick Start + Architecture summary for AI discovery.

## Ownership
**Owns:** AI-native patterns, full-stack integration, docs-as-code, AI-optimized structure, creative AI cost management, context window strategy. See STYLE_GUIDES.md for Google TS + Node.js rules.
**Never owns:** Implementation (->06), testing (->07), deployment (->08), design (->10), SEO (->28).
