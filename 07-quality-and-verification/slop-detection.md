---
name: "Slop Detection"
version: "2.0.0"
updated: "2026-04-23"
description: "Automated detection of AI filler, placeholder content, and banned copy. Pre-commit hooks, codebase scanner with slop score, ESLint custom rules, GEO anti-slop patterns. Zero tolerance."
---

# Slop Detection

## Pattern Registry
```typescript
const AI_FILLER = [
  'leverage','utilize','in order to','it\'s important to note','I\'d be happy to','I cannot',
  'as an AI','delve','tapestry','unleash','game-changer','cutting-edge','revolutionize',
  'seamlessly','robust solution','comprehensive','streamline','empower','synergy','paradigm',
  'holistic','best-in-class','thought leader','circle back','move the needle','deep dive',
  'Welcome to','Discover our','Unleash your','innovative','state-of-the-art','next-generation',
  'world-class','turnkey','disrupt','facilitate','scalable','actionable insights','ecosystem',
  'transformative','value-added','unique proposition',
  // GEO anti-slop — reduces AI citation quality:
  'it\'s worth noting','needless to say','as mentioned above','in conclusion','to summarize',
  'in today\'s digital landscape','in the ever-evolving','plays a crucial role',
  'it goes without saying','firstly','secondly','thirdly',
];
const PLACEHOLDERS = ['lorem ipsum','dolor sit amet','TODO','FIXME','HACK','coming soon','TBD',
  'placeholder','example.com','test@test.com','John Doe','Jane Doe','foo bar','your name here',
  'your company','sample text','assets/placeholder','gray-box','/api/placeholder','placehold.co'];
const STRUCTURAL = [/\{\{.*?\}\}/,/\[.*?]\(#\)/,/src=["']#["']/,/href=["']#["']/,
  /background:\s*(#[89a-f]{6}|gray|grey)/i,/\.{3,}/];
```

## Pre-Commit Hook
```bash
#!/usr/bin/env bash
set -euo pipefail
SLOP=("lorem ipsum" "dolor sit amet" "TODO" "FIXME" "HACK" "coming soon" "TBD"
  "placeholder" "example\\.com" "leverage" "utilize" "in order to" "I'd be happy to"
  "Welcome to" "Discover our" "Unleash" "delve" "seamlessly" "comprehensive" "empower"
  "synergy" "paradigm" "holistic" "in today's digital landscape" "plays a crucial role")
STAGED=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|html|md|json)$' || true)
[ -z "$STAGED" ] && exit 0
VIOLATIONS=0
for p in "${SLOP[@]}"; do
  M=$(echo "$STAGED" | xargs grep -iln "$p" 2>/dev/null || true)
  [ -n "$M" ] && { echo "SLOP: \"$p\" in:"; echo "$M"|sed 's/^/  /'; VIOLATIONS=$((VIOLATIONS+1)); }
done
[ "$VIOLATIONS" -gt 0 ] && { echo "$VIOLATIONS slop pattern(s). Fix before committing."; exit 1; }
```

## Codebase Scanner
```typescript
// scripts/slop-scan.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
const EXTS=['.ts','.tsx','.html','.md','.json','.css'];
const IGNORE=['node_modules','.git','dist','.next','.angular'];
function scanFile(fp: string) {
  if (fp.includes('.spec.')||fp.includes('.test.')) return [];
  return readFileSync(fp,'utf-8').split('\n').flatMap((line,i) => {
    const h: string[]=[];
    [...AI_FILLER,...PLACEHOLDERS].forEach(p=>{if(line.toLowerCase().includes(p.toLowerCase()))h.push(`${fp}:${i+1} — "${p}"`)});
    STRUCTURAL.forEach(r=>{if(r.test(line))h.push(`${fp}:${i+1} — ${r.source}`)});
    return h;
  });
}
function scanDir(d: string): string[] {
  return readdirSync(d).flatMap(e=>{
    const f=join(d,e); if(IGNORE.includes(e)) return [];
    return statSync(f).isDirectory()?scanDir(f):EXTS.includes(extname(f))?scanFile(f):[];
  });
}
const hits=scanDir(process.cwd());
console.log(`Slop Score: ${Math.min(100,hits.length*2)}/100 (${hits.length} hits)`);
hits.forEach(h=>console.log(`  ${h}`));
process.exit(hits.length>0?1:0);
```

## GEO Anti-Slop (AI Search Optimization)
AI search engines (Perplexity/ChatGPT/Gemini) prefer quotable direct answers. Slop patterns reduce citation rate from 16%→54%.
Rules: lead paragraphs answer query directly|40-60 word quotable blocks|specific numbers not vague claims|FAQ/HowTo structured data|no "in conclusion/to summarize"|no hedging phrases.
Check: `grep -rn "it's worth noting\|in today's digital\|plays a crucial role" src/`.

## Package Scripts + Exceptions
`"lint:slop": "bun run scripts/slop-scan.ts"` — runs in CI, blocks merge on any hit.
Exceptions: test files|docs referencing banned patterns|node_modules|error messages quoting user input.
