---
name: "Slop Detection"
description: "Automated detection of AI-generated filler, placeholder content, and banned copy patterns. Pre-commit hooks, codebase scanner with slop score, and ESLint custom rules. Zero tolerance for generic content."
---

# Slop Detection

## Slop Patterns
Three categories: AI filler (LLM-generated prose), placeholder content (unfinished work), banned copy (brand violations).

### AI Filler
```typescript
const AI_FILLER = [
  'leverage', 'utilize', 'in order to', 'it\'s important to note',
  'I\'d be happy to', 'I cannot', 'as an AI', 'delve', 'tapestry',
  'unleash', 'game-changer', 'cutting-edge', 'revolutionize',
  'seamlessly', 'robust solution', 'comprehensive', 'streamline',
  'empower', 'synergy', 'paradigm', 'holistic', 'best-in-class',
  'thought leader', 'circle back', 'move the needle', 'deep dive',
  'at the end of the day', 'take it to the next level',
  'Welcome to', 'Discover our', 'Unleash your',
];
```

### Placeholder Content
```typescript
const PLACEHOLDERS = [
  'lorem ipsum', 'dolor sit amet', 'TODO', 'FIXME', 'HACK',
  'coming soon', 'TBD', 'placeholder', 'example.com',
  'test@test.com', 'John Doe', 'Jane Doe', 'foo bar',
  'your name here', 'your company', 'sample text',
  'assets/placeholder', 'gray-box', 'grey-box',
  '/api/placeholder', 'placehold.co', 'via.placeholder',
];
```

### Structural Slop
```typescript
const STRUCTURAL = [
  /\{\{.*?\}\}/, // Unresolved template vars
  /\[.*?]\(#\)/, // Markdown links to nowhere
  /src=["']#["']/, // Image src="#"
  /href=["']#["']/, // Links to "#" (excluding anchor nav)
  /background:\s*(#[89a-f]{6}|gray|grey)/i, // Gray placeholder backgrounds
  /\.{3,}/, // Ellipsis stubs "..."
];
```

## Pre-Commit Hook
```bash
#!/usr/bin/env bash
# .husky/pre-commit or .git/hooks/pre-commit
set -euo pipefail

SLOP_PATTERNS=(
  "lorem ipsum" "dolor sit amet" "TODO" "FIXME" "HACK"
  "coming soon" "TBD" "placeholder" "example\\.com"
  "leverage" "utilize" "in order to" "it's important to note"
  "I'd be happy to" "Welcome to" "Discover our" "Unleash"
  "delve" "seamlessly" "robust solution" "comprehensive"
  "empower" "synergy" "paradigm" "holistic"
)

STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|html|md|json)$' || true)
[ -z "$STAGED_FILES" ] && exit 0

VIOLATIONS=0
for pattern in "${SLOP_PATTERNS[@]}"; do
  MATCHES=$(echo "$STAGED_FILES" | xargs grep -iln "$pattern" 2>/dev/null || true)
  if [ -n "$MATCHES" ]; then
    echo "SLOP DETECTED: \"$pattern\" in:"
    echo "$MATCHES" | sed 's/^/  /'
    VIOLATIONS=$((VIOLATIONS + 1))
  fi
done

if [ "$VIOLATIONS" -gt 0 ]; then
  echo ""
  echo "Found $VIOLATIONS slop pattern(s). Fix before committing."
  echo "Override: git commit --no-verify (NOT recommended)"
  exit 1
fi
```

## Codebase Scanner
```typescript
// scripts/slop-scan.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const SCAN_EXTENSIONS = ['.ts', '.tsx', '.html', '.md', '.json', '.css'];
const IGNORE_DIRS = ['node_modules', '.git', 'dist', '.next', '.angular'];

interface SlopHit {
  file: string;
  line: number;
  pattern: string;
  text: string;
}

function scanFile(filePath: string): SlopHit[] {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const hits: SlopHit[] = [];

  const ALL_PATTERNS = [...AI_FILLER, ...PLACEHOLDERS];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments in test files
    if (filePath.includes('.spec.') || filePath.includes('.test.')) continue;

    for (const pattern of ALL_PATTERNS) {
      if (line.toLowerCase().includes(pattern.toLowerCase())) {
        hits.push({ file: filePath, line: i + 1, pattern, text: line.trim() });
      }
    }
    for (const regex of STRUCTURAL) {
      if (regex.test(line)) {
        hits.push({ file: filePath, line: i + 1, pattern: regex.source, text: line.trim() });
      }
    }
  }
  return hits;
}

function scanDirectory(dir: string): SlopHit[] {
  const hits: SlopHit[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (IGNORE_DIRS.includes(entry)) continue;
    if (statSync(full).isDirectory()) {
      hits.push(...scanDirectory(full));
    } else if (SCAN_EXTENSIONS.includes(extname(full))) {
      hits.push(...scanFile(full));
    }
  }
  return hits;
}

// Score: 0 = clean, 100 = heavily slopped
const hits = scanDirectory(process.cwd());
const score = Math.min(100, hits.length * 2);
console.log(`\nSlop Score: ${score}/100 (${hits.length} hits)`);
hits.forEach(h => console.log(`  ${h.file}:${h.line} — "${h.pattern}"`));
process.exit(score > 0 ? 1 : 0);
```

## ESLint Custom Rule
```typescript
// eslint-rules/no-slop.ts
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(() => '');

export const noSlop = createRule({
  name: 'no-slop',
  meta: {
    type: 'suggestion',
    docs: { description: 'Disallow AI-generated filler and placeholder content' },
    messages: {
      slopDetected: 'Slop detected: "{{pattern}}" — rewrite with specific, brand-aligned copy.',
      placeholderDetected: 'Placeholder content: "{{pattern}}" — replace with real content.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return;
        const val = node.value.toLowerCase();
        for (const p of AI_FILLER) {
          if (val.includes(p.toLowerCase())) {
            context.report({ node, messageId: 'slopDetected', data: { pattern: p } });
          }
        }
        for (const p of PLACEHOLDERS) {
          if (val.includes(p.toLowerCase())) {
            context.report({ node, messageId: 'placeholderDetected', data: { pattern: p } });
          }
        }
      },
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          const val = quasi.value.raw.toLowerCase();
          for (const p of [...AI_FILLER, ...PLACEHOLDERS]) {
            if (val.includes(p.toLowerCase())) {
              context.report({ node, messageId: 'slopDetected', data: { pattern: p } });
            }
          }
        }
      },
    };
  },
});
```

## Package.json Scripts
```json
{
  "scripts": {
    "lint:slop": "bun run scripts/slop-scan.ts",
    "lint:slop:fix": "echo 'Slop cannot be auto-fixed — rewrite with real content'"
  }
}
```

## Integration Points
Pre-commit hook: blocks commits with slop. CI: `bun run lint:slop` in PR checks. Build agent: runs scanner after generating any copy. Visual-qa agent: flags placeholder images/gray boxes in screenshots.

## Acceptable Exceptions
Test files checking for slop (the detector itself). Documentation referencing banned patterns. Third-party content in node_modules (auto-excluded). Error messages that quote user input.
