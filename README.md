<div align="center">
  <a href="https://github.com/megabytespace/claude-skills">
    <img width="148" alt="Emdash Skills" src="https://raw.githubusercontent.com/megabytespace/claude-skills/master/logo.png" />
  </a>
  <h1>Emdash Skills — Claude Code Plugin</h1>
  <p><strong>Autonomous product-building OS. One-line prompts to deployed products on Cloudflare Workers.</strong></p>
</div>

<div align="center">
  <a href="https://megabyte.space"><img alt="Homepage" src="https://img.shields.io/website?down_color=%23FF4136&down_message=Down&label=Homepage&logo=home-assistant&logoColor=white&up_color=%232ECC40&up_message=Up&url=https%3A%2F%2Fmegabyte.space&style=for-the-badge" /></a>
  <a href="https://github.com/megabytespace/claude-skills/blob/master/LICENSE"><img alt="License: Rutgers" src="https://img.shields.io/badge/License-Rutgers-7C3AED?logo=open-source-initiative&logoColor=white&style=for-the-badge" /></a>
  <a href="https://github.com/megabytespace/claude-skills"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/megabytespace/claude-skills?logo=github&logoColor=white&style=for-the-badge&color=060610" /></a>
</div>

<br/>

> 14 categories | 66 submodules | 15 agents | 12 templates

## Install

```bash
# Plugin (recommended)
claude plugin install megabytespace/claude-skills

# Manual
git clone https://github.com/megabytespace/claude-skills ~/.agentskills
ln -sf ~/.agentskills ~/.claude/skills
```

## Categories

| # | Category | Sub | Handles |
|---|----------|:---:|---------|
| 01 | Operating System | 3 | Policy, autonomy, parallelization, AI-native patterns |
| 02 | Goal & Brief | 0 | Product thesis from domain name, business model inference |
| 03 | Planning & Research | 1 | Competitor analysis, task decomposition, parallel workstreams |
| 04 | Preference & Memory | 3 | Voice of Customer, user preferences, behavioral psych |
| 05 | Architecture & Stack | 8 | CF Workers, Hono, Drizzle, Coolify, MCP, API design |
| 06 | Build & Slice Loop | 20 | Forms, search, blog, i18n, PWA, webhooks, admin, data tables |
| 07 | Quality & Verification | 15 | E2E, a11y, security, perf, visual QA, adversarial, AI testing |
| 08 | Deploy & Runtime | 6 | CI/CD, launch day, uptime, backup, changelog, GitHub CI |
| 09 | Brand & Content | 4 | SEO engine, copy system, email templates, social automation |
| 10 | Design System | 0 | Anti-slop design, dark-first, bold typography, CSS patterns |
| 11 | Motion & Interaction | 0 | CSS scroll animations, View Transitions, reduced-motion |
| 12 | Media Orchestration | 2 | Image/video gen, compression pipeline, social previews |
| 13 | Growth & Observability | 3 | Stripe billing, GA4/PostHog analytics, user feedback |
| 14 | Idea Engine | 0 | Autonomous research, evidence-backed improvement proposals |

## Agents

| Agent | Model | Purpose |
|-------|-------|---------|
| architect | Opus | Repo-map, task graphs, architectural seams |
| code-simplifier | Sonnet | Reduce complexity, preserve functionality |
| completeness-checker | Opus | Zero Recommendations Gate |
| computer-use-operator | Sonnet | Native macOS app automation via Computer Use MCP |
| content-writer | Sonnet | Copy, microcopy, alt text, SEO content |
| dependency-auditor | Sonnet | Package security, license compliance, update strategy |
| deploy-verifier | Sonnet | Post-deploy smoke tests at 6 breakpoints |
| incident-responder | Opus | Production incident triage, rollback, post-mortem |
| meta-orchestrator | Opus | Cross-agent coordination, task graph execution |
| migration-agent | Sonnet | Framework/DB/API migration with rollback safety |
| performance-profiler | Sonnet | CWV analysis, bundle audit, runtime profiling |
| security-reviewer | Opus | OWASP Top 10, secrets exposure, CSP audit |
| seo-auditor | Haiku | Title, meta, H1, JSON-LD, OG, sitemap |
| test-writer | Sonnet | Vitest unit + Playwright E2E, no sleeps, stable selectors |
| visual-qa | Opus | Screenshot at all breakpoints, AI vision layout detection |

## Hard Gates

Every deploy must pass: Playwright E2E 0 failures at 6bp | GPT-4o Vision >= 8/10 | SEO GREEN | Lighthouse A11y >= 95 | axe-core 0 violations | 0 console errors | 0 placeholders | Flesch >= 60.

## Stack

Hosting: CF Workers. Backend: Hono RPC. Frontend: Angular 19+Ionic+PrimeNG or vanilla. DB: D1/Neon. Cache: KV/Upstash. Auth: Clerk. Payments: Stripe. Email: Resend+Listmonk. Testing: Playwright+Vitest. Lint: Biome. Runtime: Bun.

## Philosophy

**Distribution > Technology.** Auto-create repos for new skills and tools. Integrate into every ecosystem. Broadcast widely. The best tool nobody knows about is the worst tool.

## License

Copyright (c) 2024-2026 [Brian Zalewski](https://megabyte.space) / [Megabyte Labs](https://megabyte.space). [Rutgers License](LICENSE).
