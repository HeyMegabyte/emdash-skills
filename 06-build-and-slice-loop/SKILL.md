---
name: "build-and-slice-loop"
description: "Implements features in vertical slices, always starting with homepage. Enforces anti-placeholder rules — no lorem ipsum, no TODO stubs, no gray boxes. Real content, real images, real interactions. TypeScript strict mode, Zod validation, and structured file organization."
submodules:
  - easter-eggs.md
  - domain-provisioning.md
  - web-manifest-system.md
  - custom-error-pages.md
  - contact-forms-and-endpoints.md
  - blog-and-content-engine.md
  - onboarding-and-first-run.md
  - site-search.md
  - internationalization.md
  - ai-chat-widget.md
  - webhook-system.md
  - admin-dashboard.md
  - keyboard-shortcuts-and-command-palette.md
  - empty-states-and-loading.md
  - notification-system.md
  - file-uploads-and-storage.md
  - rich-text-editor.md
  - data-tables.md
  - realtime-and-websockets.md
  - copilot-and-ai-features.md
  - notification-center.md
---

## Submodules

| File | Description |
|------|-------------|
| easter-eggs.md | Hidden Easter egg via URL query parameter. Canvas-based, dismissible. |
| domain-provisioning.md | Auto-provision domains: CF Worker, DNS, SSL, animated placeholder. |
| web-manifest-system.md | PWA manifest, screenshots, shortcuts, sitemap, robots, humans, security.txt, meta tags. |
| custom-error-pages.md | Branded 404/500/503/offline pages. Dark theme, brand colors, navigation. |
| contact-forms-and-endpoints.md | Turnstile + Zod + Resend + 8-point form test matrix. |
| blog-and-content-engine.md | Markdown to HTML, RSS, reading time, social sharing, related posts, seed posts. |
| onboarding-and-first-run.md | Welcome modal, guided tour, progress checklist, welcome email, activation tracking. |
| site-search.md | CF AI Search: hybrid semantic+keyword, multi-tenant, Cmd+K modal. |
| internationalization.md | EN+ES minimum, URL param/dropdown, AI translate at deploy. |
| ai-chat-widget.md | Workers AI + Vectorize RAG chat trained on site data, auto-indexes at deploy. |
| webhook-system.md | Stripe/Clerk/GitHub webhooks: signature verify, routing, D1 idempotency. |
| admin-dashboard.md | /admin panel: content moderation, data review, bolt.diy editor. |
| keyboard-shortcuts-and-command-palette.md | Cmd+K palette like Linear/Notion, keyboard overlay. |
| empty-states-and-loading.md | Empty lists prompt first action. Skeleton screens for all loading. |
| notification-system.md | OneSignal push + in-app bell with unread badge. |
| file-uploads-and-storage.md | Uppy + R2: resumable uploads, presigned URLs, Angular wrapper, file validation. |
| rich-text-editor.md | Editor.js + Angular: block JSON, plugins, D1 storage, server-side rendering. |
| data-tables.md | AG Grid: server-side pagination, filtering, sorting, infinite scroll, CSV/Excel export. |
| realtime-and-websockets.md | Durable Objects WebSocket: presence, typing, cursors, hibernation API. |
| copilot-and-ai-features.md | CopilotKit + Workers AI: in-app AI, actions, embeddings, CoAgents. |
| notification-center.md | Novu multi-channel: in-app bell, push, email (Resend), SMS, digest/batching. |

# 06 — Build and Slice Loop

## Vertical Slice Rules

Every increment delivers visible, testable, end-to-end value. No horizontal layers, no stubs, no "coming soon."

**Good slice:** touches all layers (data/API/UI), visible/testable, deployable independently, smallest real value unit.
**Bad slice:** "set up DB" (horizontal), "build component library" (premature), "scaffold project" (no value).
**Sequence:** Slice 1 = homepage (real content, real images, deployed). Then core features. Then polish.

### Strategic Priorities
Every slice advances: end-user value, conversion psychology (04/wisdom), brand quality.

### AI-Enriched
Every slice: "can AI make this better?" Static images to AI-generated. Manual text to AI meta/alt/translations. Basic search to semantic. No support to AI chat. No video to AI hero video (Sora).

## Anti-Placeholder Rules

**Never ship:** TODO comments, lorem ipsum, gray boxes, console.log stubs, empty pages behind nav, broken links, non-functional forms/buttons. "Coming soon" = DEFECT.

**Instead:** Real thing (even minimal), real copy (infer from product), generated/sourced images, working interactions.

## Implementation Patterns

**New project:** wrangler.toml, src/index.ts (Hono), first page HTML, real CSS, real content, logo+favicon, JSON-LD, meta tags, analytics, deploy+verify, then features.

**Feature:** E2E test first, data layer (Drizzle), API (Hono+Zod), UI, wire, test, fix until green, deploy+verify.

## Code Quality

TypeScript strict (noUncheckedIndexedAccess, noImplicitReturns, noFallthroughCasesInSwitch). Zod on all external input. Error envelope `{ error, code?, details? }`. Sentry in prod.

**File org (Worker):** src/ index.ts, routes/, middleware/, services/, db/, lib/, types.ts, env.ts
**File org (Angular+Nx):** apps/ web/(Angular), api/(Hono). packages/ shared/(Zod), ui/(components).

## Content Generation

Copy: infer from product/domain, benefit-oriented, social proof, clear CTAs. Images: imagegen/Sora hero, Unsplash/Pexels stock, Ideogram logos, WebP compressed. Structured data: Organization, WebSite, WebPage, FAQPage, Product, SoftwareApplication, BreadcrumbList.

## Per-Slice Checklist
```
[ ] End-to-end working, E2E passes, real content/images
[ ] Responsive (1280+375px), accessible, performant (<3s LCP)
[ ] Error/loading/empty states, transactional emails, idempotent webhooks
[ ] Graceful degradation for 3rd-party failures
[ ] Deployed+verified, web-manifest requirements met
[ ] MANDATORY: 07/completeness visual verification (6 breakpoints)
[ ] FCE scan zero findings
```

## Per-Project Checklist
```
[ ] All features, homepage polished, all nav works, all forms submit
[ ] Images optimized, JSON-LD, OG images, analytics, error tracking
[ ] Legal pages, favicon, PWA manifest, robots.txt, sitemap.xml
[ ] CSP headers, Lighthouse>=90, a11y, mobile no breaks at 375px
```

## Strict TDD (MANDATORY)
Spec (Given/When/Then), failing E2E (Red), minimum impl (Green), refactor, FCE scan, visual verify, deploy.
Self-healing: read error, diagnose, fix, re-run, loop max 5. NEVER .skip.
Self-verify: "A user can [action] which [result] because [impl]." If vague = incomplete.

## Completeness Guarantee
Before done: data layer, API, UI, tests, SEO, analytics, error handling, mobile, docs all complete.

## OpenSaaS Parity+
Exceed OpenSaaS on 8 features: i18n, AI search, easter eggs, notifications, keyboard shortcuts, Cmd+K, AI chat, branded errors.

## Rapid Start (<5 min)
0-1m: infer type, load profile. 1-2m: wrangler.toml+Hono. 2-3m: homepage+content+meta+JSON-LD. 3-4m: CSS+favicon. 4-5m: deploy+purge+verify.
Parallel: media agent (logo, hero) + content agent (keywords, copy).

## Reuse Index
Check ~/emdash-projects/*/src/ before building. Contact form, Stripe checkout, Clerk middleware, error pages, analytics, CSP all reusable. Copy+adapt > write from scratch.
