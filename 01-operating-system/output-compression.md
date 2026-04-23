---
name: Output Compression
description: Token-efficient output patterns reducing response size 40-65% without losing information density
version: "2.0.0"
updated: "2026-04-23"
---

# Output Compression

## Core Technique: Caveman-Style Output
Strip articles, prepositions, filler words from technical output. "The function returns a list of the available configurations" → "fn returns available configs list." Reference: 44K-star caveman repo pattern — same info, 40-65% fewer tokens.

## Abbreviation Table
config→cfg | function→fn | application→app | repository→repo | dependency→dep | environment→env | development→dev | production→prod | authentication→auth | authorization→authz | parameter→param | argument→arg | directory→dir | command→cmd | document→doc | template→tmpl | library→lib | message→msg | request→req | response→res | database→db | middleware→mw | specification→spec | implementation→impl

## Symbol Grammar
`→` leads to/becomes | `|` or/separator | `+` and/with | `>` preferred over | `<` less than | `::` maps to/defines | `~` approximately | `!=` not equal/differs from | `&&` both required | `||` either works | `**text**` emphasis | `` `code` `` inline reference

## Compression Techniques

### 1. Pipe-Delimited Fragments
```
# BAD (67 tokens):
- The first step is to configure the environment
- Then you need to install the dependencies
- After that, run the test suite
- Finally, deploy to production

# GOOD (23 tokens):
cfg env → install deps → run tests → deploy prod
```

### 2. Tables Over Paragraphs
```
# BAD: "WebP quality should be set to 80 which gives SSIM of 0.98 and is visually lossless.
#       AVIF quality should be 70 for the same perceptual quality but 30-50% smaller."

# GOOD:
| Format | Quality | SSIM | Size |
|--------|---------|------|------|
| WebP   | 80      | 0.98 | baseline |
| AVIF   | 70      | 0.98 | -30-50%  |
```

### 3. Code Over Prose
```typescript
// BAD: "You should create an interface with name, email, and optional phone fields"
// GOOD:
interface User { name: string; email: string; phone?: string; }
```

### 4. Skip Prefixes
Never: "Let me...", "I'll now...", "Here's what I found...", "Based on my analysis..."
Just output the result directly.

### 5. Batch Tool Calls
Parallel independent calls in single response. 3-5 tool calls/response when no dependencies.

### 6. Single-Line Lists
```
# BAD:
# - First item
# - Second item
# - Third item

# GOOD:
first | second | third
```

## When NOT to Compress
User-facing copy (marketing, UI text, docs) — use full natural language. Error messages — be specific+helpful. Explanations to non-technical users — clarity>brevity. Legal/compliance text — precision required.

## Density Targets
Rules files: pipe-delimited one-liners, `→` and `|` separators, no prose wrappers. Skill files: dense paragraphs, abbreviations, match sibling density. Chat responses: 2 sentences, 100-160 chars for descriptions. Code comments: intent not mechanics, JSDoc for public API only.

## Ownership
**Owns:** Token efficiency, output formatting, compression patterns, abbreviation standards, density targets.
**Never owns:** Content quality (→09), code style (→code-style rule), copy writing (→copy-writing rule).
