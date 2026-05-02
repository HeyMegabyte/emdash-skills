# Emdash Skills — Agent Instructions

This repository contains 14 skill categories, 18 agents, and 94 reference docs for autonomous product building.

## Stack
CF Workers + Hono | Angular 21 + Ionic 8 + PrimeNG 21 | D1/Neon | Drizzle v1 | Clerk | Stripe | Inngest | Resend | Bun | Playwright v1.59+ | PostHog | Sentry

## Usage
Load skills on demand via the skill router (`_router.md`). Each category has a `SKILL.md` with submodules listed in frontmatter.

## Key Files
- `CONVENTIONS.md` — shared constants, patterns, stack config
- `_router.md` — routes prompts to smallest useful skill subset
- `SKILL_PROFILES.md` — default bundles by product type (SaaS, API, Marketing, etc.)
- `llms.txt` — LLM-optimized index of all skills

## For AI Coding Tools
This repo is compatible with the agentskills.io open standard. Skills work in Claude Code, OpenAI Codex, Cursor, GitHub Copilot, VS Code, Windsurf, Augment, OpenHands, Gemini CLI, and 30+ other tools.

## Platform Variants (30 total)
Modern formats: `.cursor/rules/` (MDC) | `.windsurf/rules/` (trigger frontmatter) | `.augment/rules/` (type frontmatter) | `.github/instructions/` (applyTo frontmatter) | `.openhands/microagents/` | `.aiassistant/rules/` | `.kiro/steering/` | `.void/rules/`
Legacy formats: `.cursorrules` | `.windsurfrules` | `.clinerules` | `.rules` | `.augment-guidelines` | `.aider-conventions.md` | `.github/copilot-instructions.md`
Named formats: `AGENTS.md` | `GEMINI.md` | `AMP.md` | `CODEX.md` | `QODO.MD` | `replit.md`
Directory formats: `.amazonq/rules/` | `.junie/` | `.trae/rules/` | `.tabnine/guidelines/` | `.kilo/rules/` | `.roo/rules/` | `.continue/rules/` | `.agents/skills/` | `.bolt/` | `.cursor/BUGBOT.md`

Install: `claude plugin install heymegabyte/claude-skills`
Codex: Clone into `~/.codex/skills/` or `.agents/skills/`
npm: `npm i @heymegabyte/claude-skills`
