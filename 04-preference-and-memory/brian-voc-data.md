---
name: "brian-voc-data"
description: "Voice of the Customer data for Brian Zalewski extracted from 3,102 ChatGPT conversations. Exact language, dissatisfaction signals, aspiration signals, and interaction velocity patterns."
---

# Brian's VoC Data (from 10,255 messages)

## Exact Language (use these words, not synonyms)
- "re-write" not "revise" or "edit"
- "make it shorter" not "condense" or "summarize"
- "more appealing" not "more engaging"
- "drop-in replacement" not "complete version"
- "the whole thing" not "full output"
- "fix this" (pastes error, expects fix — not explanation)
- "come up with" (wants creative generation)
- "make it work on both" (always means cross-platform)

## Dissatisfaction Signals (ranked by frequency)
1. "too long" / "shorter" (99 rejections) — cut 50% immediately
2. "re-write" / "redo" (80 rejections) — full replacement, never patch
3. "more appealing" (35 rejections) — default output feels bland/corporate
4. "no text, just code" (10 rejections) — zero prose around code blocks
5. "don't make stuff up" (5 rejections) — use real software, real data
6. "drop-in replacement" (8 rejections) — config/code must be paste-ready

## Aspiration Signals
- "pixel-perfect" — quality benchmark
- "best-in-class" — competitive standard
- "premium" — design aspiration
- "anti-AI-slop" — distinctiveness requirement
- "open-source wizardry" — identity
- "simpler is better" — universal refinement direction

## Interaction Velocity
- 49% of interactions are one-shot (get it right first time)
- Average corrections per task: 2-4
- Average correction length: 3-15 words
- Approval = silence + next instruction
- Typical flow: request → "make it shorter" → "also include X" → "now make it Y" → done

## Prompt Patterns
1. **"Re-write" pattern** (40%): "Re-write this and make it shorter/more appealing"
2. **"Given That" pattern**: Front-loads numbered context (up to 17 items) before the ask
3. **"Iterative Tightening"**: Long → "shorter" → "under 500 chars" → "under 2000 but at least 420"
4. **"Don't Remove Anything"**: After AI over-summarizes, demands original content preserved
5. **"Fix This"**: Pastes error, expects diagnosis + fix, not explanation

## Domain-Specific Patterns
- **Resume writing**: always "make it shorter" after first draft, quantified achievements, paragraphs over bullets
- **Technical config**: full drop-in replacement, include all inline, never truncate
- **Marketing copy**: 100-160 chars, lead with benefit, "more appealing" = add energy
- **Home Assistant**: extremely detailed requirements (10+ numbered items), error-resistant, YAML preferred
- **Infrastructure**: full configs, security hardening suggestions proactively, cross-platform always
