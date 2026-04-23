---
name: "Semgrep Codebase Rules"
version: "2.0.0"
updated: "2026-04-23"
description: "Custom Semgrep YAML rules per-project. Architecture, style, OWASP 2025 security, anti-patterns. Rules evolve as AI learns codebase. Deterministic enforcement via hooks+CI."
---

# Semgrep Codebase Rules
ESLint rules require JS authoring. Semgrep rules are YAML — AI writes in seconds, AST-matched (not text), fewer false positives. Per-project in `.semgrep/rules/`, versioned in git.
Setup: `brew install semgrep` → `mkdir -p .semgrep/rules/`.

## Core Rule Set (every Emdash project)
```yaml
rules:
  # Architecture (A01/A07 Broken Access Control)
  - id: no-direct-d1
    pattern: c.env.DB.prepare(...)
    message: "Use repository fns from src/db/. Direct D1 breaks data layer."
    severity: ERROR
    paths: { exclude: ["src/db/**"] }
  - id: missing-auth-middleware
    patterns:
      - pattern: app.get($PATH, async ($C) => { ... })
      - pattern-not: app.get($PATH, requireAuth(), ...)
    message: "API route missing requireAuth(). Add or document why public."
    severity: WARNING
    paths: { include: ["src/routes/**"], exclude: ["src/routes/webhooks/**","src/routes/health.ts"] }

  # Style
  - id: no-any-type
    pattern: "$X: any"
    message: "Use unknown. See code-style rule."
    severity: ERROR
    languages: [typescript]
  - id: no-console-log
    pattern: console.log(...)
    message: "Use Sentry breadcrumb or PostHog event."
    severity: WARNING
    paths: { exclude: ["**/*.test.*","**/*.spec.*","scripts/**"] }
  - id: error-envelope
    pattern: "c.json({ error: $MSG }, $STATUS)"
    fix: "c.json({ error: $MSG, code: 'UNKNOWN', details: null }, $STATUS)"
    message: "Use full error envelope: {error, code, details}."
    severity: WARNING

  # OWASP 2025 Security
  - id: hardcoded-secret  # A04 Cryptographic Failures
    patterns:
      - pattern: $KEY = "sk_..."
      - pattern: $KEY = "Bearer ..."
    message: "Hardcoded secret. Use get-secret or wrangler secret."
    severity: ERROR
  - id: missing-zod-validation  # A05 Injection
    patterns:
      - pattern: app.post($PATH, async ($C) => { const body = await $C.req.json(); ... })
      - pattern-not: app.post($PATH, zValidator(...), ...)
    message: "POST/PUT routes require @hono/zod-validator. No raw req.json()."
    severity: ERROR
  - id: cors-wildcard  # A01 Broken Access Control
    pattern-regex: "origin.*['\"]\\*['\"]"
    message: "Never CORS '*' in production. Use exact origins."
    severity: ERROR
    paths: { exclude: ["**/*.test.*"] }
  - id: no-eval  # A05 Injection
    patterns:
      - pattern: eval(...)
      - pattern: document.write(...)
      - pattern: innerHTML = $X
    message: "Use textContent. eval/innerHTML = XSS vector (OWASP A05:2025)."
    severity: ERROR
  - id: no-todo
    pattern-regex: "(TODO|FIXME|HACK|XXX|TEMP)"
    message: "Resolve before committing."
    severity: WARNING
    paths: { exclude: ["**/*.md"] }
```

## OWASP 2025 Coverage
A01→cors-wildcard+missing-auth | A03 Supply Chain→`npm audit` in CI | A04→hardcoded-secret | A05→missing-zod+no-eval | A07→missing-auth-middleware | A09→no-console-log | A10 Exceptional Conditions→try/catch enforcement (add rule when pattern found 3x).

## AI Rule Evolution
Same pattern fixed 3+ times → create rule. Architecture decision → enforce immediately.
```bash
cat > .semgrep/rules/new-rule.yaml << 'EOF'
rules:
  - id: descriptive-name
    pattern: the-pattern
    message: "Why wrong + what to do."
    severity: WARNING|ERROR
    languages: [typescript]
EOF
semgrep --config .semgrep/rules/new-rule.yaml src/  # test, refine if noisy
```
Lifecycle: Create→Test→Refine→Enforce→Evolve→Retire (0 hits in 30 days).

## Integration
Pre-commit: `- repo: https://github.com/semgrep/semgrep\n  rev: v1.95.0\n  hooks: [{id: semgrep, args: ['--config','.semgrep/rules/','--error']}]`
CI: `semgrep --config .semgrep/rules/ --error src/`
PostToolUse (format-on-save.sh): `semgrep --config .semgrep/rules/ --quiet "$FILE" 2>/dev/null`

Each session adds 1-3 rules. After 10 sessions: 30+ rules = codebase fingerprint. New agents read rules, instantly understand constraints without full conversation history.
