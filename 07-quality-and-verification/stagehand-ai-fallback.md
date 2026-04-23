---
name: "Stagehand AI Fallback"
description: "When Playwright CSS selectors fail on government forms, Stagehand SDK observes all form fields via AI, maps them to profile data, and fills them using act(). Lazy-loaded, LOCAL mode, OpenAI key only."
updated: "2026-04-23"
---

# Stagehand AI Fallback Pattern
## Integration
`@browserbasehq/stagehand` v3+ with `env: "LOCAL"` (no Browserbase account needed). Lazy-loaded on first CSS selector failure — never imported if selectors work. Requires only `OPENAI_API_KEY` (already available in form-automation-service).

## Observe-Cache-Act
Phase 1: `sh.observe({ instruction: 'Find all form fields...' })` returns array of `{ description, selector, type }`. Phase 2: Map descriptions to profile field values via keyword matching (first name→firstName, address→street, etc.). Phase 3: `sh.act({ action: 'Fill the "[description]" field with "[value]"' })` for each mapped field. Boolean flags (homeless|disabled|blind|deaf|veteran|children) handled as checkbox checks.

## Error Recovery Chain
Step fails → Stagehand observe+fill entire page → GPT-4o Vision screenshot analysis → alternative selector retry → abort with evidence. Three-tier fallback: CSS selectors (fast) → Stagehand AI (smart) → GPT-4o Vision (visual).

## Evidence Integration
Every Stagehand action logged to EvidenceCollector: stagehand_start|stagehand_observe|stagehand_fill|stagehand_check|stagehand_done|stagehand_error. Screenshot captured after AI fill for audit trail.
