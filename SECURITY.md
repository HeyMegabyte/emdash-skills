# Security Policy

## Reporting Vulnerabilities

Email security concerns to **hey@megabyte.space** with subject "claude-skills security".

Do not open a public issue for security vulnerabilities. We'll respond within 48 hours and coordinate disclosure.

## Scope

Claude Skills are prompt instructions, not executable code. Security concerns typically involve:

- Skills that could cause AI tools to exfiltrate data
- Instructions that bypass safety guardrails inappropriately
- Convention files that inject malicious behavior
- Supply chain risks in the npm/JSR packages

## Supported Versions

| Version | Supported |
|---------|-----------|
| 7.x     | Yes       |
| < 7.0   | No        |
