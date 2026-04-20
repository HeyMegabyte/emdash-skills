<div align="center">
  <center>
    <a href="https://github.com/megabytespace/claude-skills">
      <img width="148" alt="Claude Skills logo" src="https://raw.githubusercontent.com/megabytespace/claude-skills/master/logo.png" />
    </a>
  </center>
</div>
<div align="center">
  <center><h1 align="center">Claude Skills</h1></center>
  <center><h4 style="color: #18c3d1;">An autonomous product-building OS for Claude Code</h4></center>
  <center><h4 style="color: #18c3d1;">Maintained by <a href="https://megabyte.space" target="_blank">Megabyte Labs</a></h4></center>
</div>

<div align="center">
  <a href="https://megabyte.space" title="Megabyte Labs homepage" target="_blank">
    <img alt="Homepage" src="https://img.shields.io/website?down_color=%23FF4136&down_message=Down&label=Homepage&logo=home-assistant&logoColor=white&up_color=%232ECC40&up_message=Up&url=https%3A%2F%2Fmegabyte.space&style=for-the-badge" />
  </a>
  <a href="https://github.com/megabytespace/claude-skills/blob/master/LICENSE" title="License" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-7C3AED?logo=open-source-initiative&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://github.com/megabytespace/claude-skills" title="GitHub" target="_blank">
    <img alt="GitHub Stars" src="https://img.shields.io/github/stars/megabytespace/claude-skills?logo=github&logoColor=white&style=for-the-badge&color=060610" />
  </a>
  <a href="https://github.com/megabytespace/claude-skills/tree/master/agents" title="Agents" target="_blank">
    <img alt="Agents" src="https://img.shields.io/badge/Agents-9-00E5FF?logo=anthropic&logoColor=white&style=for-the-badge" />
  </a>
  <a href="https://github.com/megabytespace/claude-skills" title="Skills" target="_blank">
    <img alt="Skills" src="https://img.shields.io/badge/Skills-14%20Categories-50AAE3?logo=bookstack&logoColor=white&style=for-the-badge" />
  </a>
</div>

> <br/><h4 align="center"><strong>14 skill categories, 58 submodules, and 9 agents that convert one-line prompts into fully deployed, production-ready products on Cloudflare Workers.</strong></h4><br/>

<a href="#table-of-contents" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
  - [Plugin Install](#plugin-install)
  - [Manual Install](#manual-install)
- [The 14 Categories](#the-14-categories)
- [Agents](#agents)
- [Architecture](#architecture)
  - [Execution Flow](#execution-flow)
  - [Hard Gates](#hard-gates)
  - [File Structure](#file-structure)
- [Default Stack](#default-stack)
- [Data-Driven Design](#data-driven-design)
- [Configuration](#configuration)
  - [Brand Tokens](#brand-tokens)
  - [Environment](#environment)
- [Contributing](#contributing)
- [License](#license)

<a href="#overview" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Overview

Claude Skills is a comprehensive skill system that transforms Claude Code from a code assistant into an autonomous product builder. Give it a domain name — it infers the product type, researches competitors, picks the architecture, builds the frontend and backend, deploys to Cloudflare, runs E2E tests, audits SEO and accessibility, generates media assets, and keeps improving until there's nothing left to improve.

The system is built around these principles:

1. **One-line prompts** — the folder name IS the domain, and everything else is inferred
2. **Parallel execution** — decompose into independent agents, each with its own context window
3. **Deploy first, fill later** — skeleton in 10 minutes, complete product in 30
4. **Zero Recommendations Gate** — keep improving until the AI genuinely cannot suggest anything more
5. **Anti-AI-slop** — every design decision is intentional, distinctive, and premium

Claude Skills is intended for:

1. **Solo builders** who want to ship complete products without a team
2. **Agencies** who want to prototype client sites in hours instead of weeks
3. **Open-source maintainers** who want professional documentation, CI/CD, and SEO from day one
4. **SaaS founders** who want auth, billing, analytics, and onboarding out of the box

<a href="#quick-start" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Quick Start

### Plugin Install

```bash
claude plugin install megabytespace/claude-skills
```

### Manual Install

```bash
git clone https://github.com/megabytespace/claude-skills ~/.agentskills
ln -sf ~/.agentskills ~/.claude/skills
```

Then open any project in Claude Code. The 14 skill categories auto-discover and load based on your task.

<a href="#the-14-categories" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## The 14 Categories

| # | Category | Submodules | What It Handles |
|---|----------|:---:|----------------|
| **01** | **Operating System** | 2 | Policy, autonomy, parallelization, AI-native coding patterns |
| **02** | **Goal & Brief** | 0 | Product thesis from domain name, business model inference |
| **03** | **Planning & Research** | 1 | Competitor analysis, task decomposition, parallel workstreams |
| **04** | **Preference & Memory** | 3 | Voice of Customer, user preferences, behavioral psychology |
| **05** | **Architecture & Stack** | 6 | CF Workers, Hono, Drizzle, Coolify, MCP, API design |
| **06** | **Build & Slice Loop** | 15 | Forms, search, blog, i18n, PWA, webhooks, easter eggs, admin |
| **07** | **Quality & Verification** | 10 | E2E tests, a11y, security, performance, visual QA, adversarial |
| **08** | **Deploy & Runtime** | 6 | CI/CD, launch day, uptime, backup, changelog, GitHub CI fix |
| **09** | **Brand & Content** | 4 | SEO engine, copy system, email templates, social automation |
| **10** | **Design System** | 0 | Anti-slop design, dark-first, bold typography, CSS patterns |
| **11** | **Motion & Interaction** | 0 | CSS scroll animations, View Transitions, reduced-motion |
| **12** | **Media Orchestration** | 2 | Image/video generation, compression pipeline, social previews |
| **13** | **Growth & Observability** | 3 | Stripe billing, GA4/PostHog analytics, user feedback |
| **14** | **Idea Engine** | 0 | Autonomous research, evidence-backed improvement proposals |

Each category has a main `SKILL.md` (under 500 lines) plus submodule `.md` files for specialized capabilities.

<a href="#agents" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Agents

9 purpose-built agents that Claude spawns as needed:

| Agent | Model | Purpose |
|-------|-------|---------|
| `architect` | Opus | Repo-map, task graphs, architectural seams — runs BEFORE implementation |
| `code-simplifier` | Sonnet | Brian's #1 refinement: reduce complexity, preserve functionality |
| `completeness-checker` | Opus | Zero Recommendations Gate — runs AFTER implementation |
| `deploy-verifier` | Sonnet | Post-deploy smoke tests at 6 breakpoints (375-1920px) |
| `security-reviewer` | Opus | OWASP Top 10 audit, secrets exposure, CSP. Read-only. |
| `seo-auditor` | Haiku | Title, meta, H1, JSON-LD, OG tags, internal links, sitemap |
| `test-writer` | Sonnet | Vitest unit tests + Playwright E2E. No sleeps, stable selectors. |
| `visual-qa` | Opus | Screenshot at all breakpoints, AI vision detects layout breaks |
| `computer-use-operator` | Sonnet | Native macOS app automation via Computer Use MCP |

<a href="#architecture" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Architecture

### Execution Flow

```
One-line prompt arrives (t=0)
  |
  v
[0-30s] Decompose into task-graph.json
  |
  v
[30s-2m] Spawn ALL agents simultaneously:
  |── Agent A: Homepage + hero + nav + footer → deploy immediately
  |── Agent B: Backend API + DB schema + auth
  |── Agent C: Remaining pages + content + SEO
  |── Agent D: Analytics + integrations + observability
  └── Agent E: Tests + accessibility + visual QA
  |
  v
[2-10m] Agent A deploys base. Others work in parallel.
  |
  v
[10-30m] Agents complete. Merge. Deploy full version.
  |
  v
[30m+] Visual TDD loop: screenshot → AI critique → fix → verify
  |
  v
DONE when Zero Recommendations Gate passes.
```

### Hard Gates

Nothing ships without passing ALL of these:

| Gate | Threshold |
|------|-----------|
| Playwright E2E | 0 failures at 6 breakpoints |
| GPT-4o Vision | >= 8/10, zero layout breaks |
| SEO (Yoast rules) | GREEN on all checks |
| Lighthouse Accessibility | >= 95 |
| axe-core | 0 violations |
| Console errors | 0 |
| Placeholders/TODO | 0 |
| Flesch Reading Ease | >= 60 |

### File Structure

```
claude-skills/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest for claude plugin install
├── .editorconfig                # Editor conventions
├── LICENSE                      # MIT
├── README.md                    # This file
├── _router.md                   # Skill routing by task type + file pattern
├── CHANGELOG.md                 # Version history
├── CONVENTIONS.md               # Brand tokens, deploy commands, shared patterns
├── MASTER_PROMPT.md             # Full system activation prompt
├── QUICK_REF.md                 # One-page cheat sheet
├── SKILL_PROFILES.md            # Project-type profiles (SaaS, nonprofit, API, OSS)
├── 01-operating-system/
│   ├── SKILL.md                 # Main skill (always loaded)
│   ├── ai-native-coding.md      # Submodule
│   └── autonomous-orchestrator.md
├── 02-goal-and-brief/
│   └── SKILL.md
├── ...                          # 14 categories, 58 submodules total
├── agents/                      # 9 bundled subagents
│   ├── architect.md
│   ├── code-simplifier.md
│   ├── completeness-checker.md
│   ├── computer-use-operator.md
│   ├── deploy-verifier.md
│   ├── security-reviewer.md
│   ├── seo-auditor.md
│   ├── test-writer.md
│   └── visual-qa.md
├── scripts/                     # Utility scripts (secrets discovery, visual TDD)
└── templates/                   # Project templates (brief, task-graph, acceptance criteria)
```

<a href="#default-stack" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Default Stack

Every project starts with this stack. Override only when requirements demand it.

| Layer | Default | Override When |
|-------|---------|---------------|
| **Hosting** | Cloudflare Workers | Never |
| **Backend** | Hono (RPC mode) | Complex GraphQL needs |
| **Frontend (simple)** | Vanilla HTML/CSS/JS | More than 3 interactive pages |
| **Frontend (complex)** | Angular 19 + Ionic + PrimeNG | Simple marketing site |
| **Database (simple)** | Cloudflare D1 (SQLite) | Complex joins/queries |
| **Database (complex)** | Neon PostgreSQL | D1 is sufficient |
| **Cache** | Cloudflare KV / Upstash Redis | - |
| **Auth** | Clerk | Custom auth flow requested |
| **Payments** | Stripe ($50/mo Pro tier) | Non-card payments |
| **Email** | Resend (transactional) / Listmonk (marketing) | - |
| **Testing** | Playwright + Vitest | Never Jest, never Cypress |
| **Linting** | Biome | Never ESLint + Prettier |
| **Runtime** | Bun | Node.js for incompatible packages |

<a href="#data-driven-design" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Data-Driven Design

This system isn't built on generic best practices. It's trained on **10,255 real messages** across **3,102 conversations** spanning 3 years of engineering work:

| Data Source | What It Extracted |
|-------------|------------------|
| **Voice of the Customer** | Exact language patterns, dissatisfaction signals (99x "too long", 35x "more appealing"), interaction velocity |
| **Decision Model** | 4-gate technology evaluation (CF compatible → TS/Bash → open-source → one-person manageable) |
| **Expertise Map** | Deep knowledge (Angular, TypeScript — never asks) vs learning areas (OPNsense — burst then independent) |
| **Communication DNA** | Cognitive style (associative, visual-spatial, big-picture-first), delegation hierarchy (40% content, 20% code) |
| **Platform Trajectory** | FROM self-hosted infrastructure → TOWARD Cloudflare edge computing |

<a href="#configuration" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Configuration

### Brand Tokens

| Token | Value |
|-------|-------|
| Background | `#060610` |
| Cyan (primary) | `#00E5FF` |
| Blue (secondary) | `#50AAE3` |
| Purple (cosmic only) | `#7C3AED` |
| Heading font | Sora |
| Body font | Space Grotesk |
| Mono font | JetBrains Mono |
| Handle | @megabytespace |
| Email | hey@megabyte.space |

### Environment

Claude Skills works with your existing Claude Code configuration. Key integrations:

| Integration | How |
|-------------|-----|
| **Secrets** | `get-secret KEY` (chezmoi) or `.env.local` |
| **Self-hosted services** | 30+ services on Coolify (Proxmox) via MCP |
| **MCP servers** | 26 pre-configured (Playwright, GitHub, Stripe, Slack, Gmail, etc.) |
| **Hooks** | 5 hooks across 6 events (Biome format, destructive command blocking, context re-injection) |

<a href="#contributing" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## Contributing

1. Fork the repository
2. Create a skill or submodule following the existing patterns
3. Keep `SKILL.md` files under 500 lines
4. Use lowercase-hyphenated names in frontmatter
5. Submit a PR

Skills require only two frontmatter fields: `name` (lowercase, max 64 chars) and `description` (max 1024 chars). Submodules go in the parent category folder as `kebab-case.md` files.

<a href="#license" style="width:100%"><img style="width:100%" src="https://gitlab.com/megabyte-labs/assets/-/raw/master/png/aqua-divider.png" /></a>

## License

Copyright (c) 2024-2026 [Brian Zalewski](https://megabyte.space) / [Megabyte Labs](https://megabyte.space)

Licensed under the [MIT License](LICENSE).

<div align="center">
  <br/>
  <a href="https://megabyte.space" target="_blank">
    <strong>megabyte.space</strong>
  </a>
  <br/><br/>
  <i>Open-source wizardry. 100% wizardry. 0% robes.</i>
  <br/><br/>
</div>
