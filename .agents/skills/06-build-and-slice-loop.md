---
name: "build-and-slice-loop"
version: "2.0.0"
updated: "2026-04-23"
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
  - chat-native-dashboard.md
  - rich-text-editor.md
  - data-tables.md
  - realtime-and-websockets.md
  - copilot-and-ai-features.md
  - notification-center.md
  - microcopy-library.md
---

Submodules: easter-eggs (hidden URL param Easter egg, canvas-based, dismissible), domain-provisioning (CF Worker+DNS+SSL auto-provision, animated placeholder), web-manifest-system (PWA manifest, screenshots, shortcuts, sitemap, robots, humans, security.txt), custom-error-pages (branded 404/500/503/offline, dark theme, navigation), contact-forms-and-endpoints (Turnstile+Zod+Resend, 8-point test matrix), blog-and-content-engine (markdown→HTML, RSS, reading time, social sharing, seed posts), onboarding-and-first-run (welcome modal, guided tour, progress checklist, activation tracking), site-search (CF AI Search: hybrid semantic+keyword, Cmd+K modal), internationalization (EN+ES minimum, AI translate at deploy), ai-chat-widget (Workers AI+Vectorize RAG, auto-indexes at deploy), webhook-system (Stripe/Clerk/GitHub webhooks, signature verify, D1 idempotency), admin-dashboard (/admin panel, content moderation, bolt.diy editor), keyboard-shortcuts-and-command-palette (Cmd+K palette, keyboard overlay), empty-states-and-loading (action-prompting empty states, skeleton screens), notification-system (OneSignal push+in-app bell), file-uploads-and-storage (Uppy+R2 resumable uploads, presigned URLs), chat-native-dashboard (native chat UI), rich-text-editor (Editor.js+Angular, block JSON, D1 storage), data-tables (AG Grid server-side pagination, CSV/Excel export), realtime-and-websockets (Durable Objects WebSocket, presence, typing, cursors, hibernation), copilot-and-ai-features (CopilotKit+Workers AI, in-app AI, CoAgents), notification-center (Novu multi-channel: in-app, push, email, SMS, digest), microcopy-library (brand-voice microcopy dictionary, anti-slop alternatives).

# 06 — Build and Slice Loop

## Vertical Slice Rules

Every increment: visible, testable, end-to-end value. No horizontal layers, stubs, or "coming soon."
**Good:** touches all layers (data/API/UI), visible/testable, deployable independently, smallest real value unit.
**Bad:** "set up DB" (horizontal), "build component library" (premature), "scaffold project" (no value).
**Sequence:** Slice 1 = homepage (real content, real images, deployed). Then core features. Then polish.

### Strategic Priorities
Every slice advances: end-user value, conversion psychology (04/wisdom), brand quality.

### AI-Enriched
Every slice: "can AI make this better?" Static images→AI-generated. Manual text→AI meta/alt/translations. Basic search→semantic. No support→AI chat. No video→AI hero video (Sora).

## Anti-Placeholder Rules (***MANDATORY***)

**Never ship:** TODO comments | lorem ipsum | gray boxes | console.log stubs | empty pages behind nav | broken links | non-functional forms/buttons | placeholder images | "coming soon" text. Any placeholder = DEFECT.
**Instead:** Real thing (even minimal) | real copy (infer from product) | generated/sourced images | working interactions.
**Enforcement:** FCE scan (07/slop-detection) runs post-build. Zero findings required. Automated grep for TODO|FIXME|lorem|placeholder|coming.soon in CI.

## Implementation Patterns

### New Project (<5 min)
0-1m: infer type, load profile. 1-2m: wrangler.jsonc+Hono. 2-3m: homepage+content+meta+JSON-LD. 3-4m: CSS+favicon. 4-5m: deploy+purge+verify.
Parallel: media agent (logo, hero) + content agent (keywords, copy).

### Feature Slice
E2E test first→data layer (Drizzle)→API (Hono+Zod)→UI→wire→test→fix until green→deploy+verify.

### Hono v4.12.12+ Patterns (pin >=4.12.12 for 5 CVE fixes: path traversal, cookie bypass, IP restriction bypass)
Inline handlers (type inference). Factory pattern: `createFactory()` from `hono/factory` for reusable middleware. Method chaining for RPC: `const app = new Hono().get(...).post(...)`. Export `AppType` for `hc<AppType>()`. `app.route('/path', subApp)` for splitting. `@hono/zod-validator` all bodies. Never destructure `c` (breaks ctx). Use `c.executionCtx.waitUntil()` for background work. Stream responses with `c.stream()` or `c.streamText()`.

### Angular 21 Patterns
Standalone-only (no NgModules). Signals: `signal()`, `computed()`, `effect()` (all stable). `linkedSignal()` for derived state with bidirectional binding. `resource()` / `HttpResource` for signal-based async data. `viewChild()`, `contentChildren()` signal queries (stable). `input()` signal inputs (stable). Zoneless change detection (developer preview). `@if`/`@for` control flow (not `*ngIf`/`*ngFor`). `inject()` over constructor injection. `providedIn:'root'` for tree-shakeable services. PrimeNG with design tokens. OnPush change detection on all components.

### Drizzle v1.0 + D1
`sqliteTable` schema definitions. RQBv2 for relational queries. `$inferSelect`/`$inferInsert` for type derivation. Zod integration: `createInsertSchema`/`createSelectSchema`. D1: no `BEGIN` transactions (use batch API). Prepared statements for repeated queries. snake_case DB columns, camelCase TS vars. Node.js compat polyfill in wrangler.jsonc. Foreign key constraints order matters in migrations.

### Workers Best Practices
Never destructure `ctx`—always `c.env.DB`, `c.env.KV`. `c.executionCtx.waitUntil()` for non-blocking work. Stream large responses. `GET /health` → `{status,version,timestamp}`. Error envelope: `{error,code?,details?}`. KV rate-limit public endpoints. Turnstile all forms.

## CSS Architecture (2026)

Cascade layers: `@layer reset, base, tokens, components, utilities, overrides`. Native nesting (Sass optional). Container queries replace many `@media`. `:has()` replaces JS for parent-based styling. Custom properties as design token layer. `@starting-style` for enter animations. Scroll-driven animations: `animation-timeline: scroll()|view()`. View Transitions API (baseline). `text-wrap: balance` headings, `pretty` paragraphs. OKLCH for perceptual color manipulation. `color-mix()` for blending tokens. Anchor positioning for tooltips/dropdowns. `@scope` for scoped styling.

## Code Quality

TypeScript strict: `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`. Zod on all external input. Sentry in prod. Functions <=50 lines. Cyclomatic <=10. Params <=3.

**File org (Worker):** src/ index.ts, routes/, middleware/, services/, db/, lib/, types.ts, env.ts
**File org (Angular+Nx):** apps/ web/(Angular), api/(Hono). packages/ shared/(Zod), ui/(components).

## Content Generation

Copy: infer from product/domain, benefit-oriented, social proof, clear CTAs. Images: imagegen/Sora hero, Unsplash/Pexels stock, Ideogram logos, WebP/AVIF compressed. Structured data: Organization, WebSite, WebPage, FAQPage, Product, SoftwareApplication, BreadcrumbList (4+ per page).

## Strict TDD (***MANDATORY***)
Spec (Given/When/Then)→failing E2E (Red)→minimum impl (Green)→refactor→FCE scan→visual verify→deploy.
Self-healing: read error→diagnose→fix→re-run→loop max 5. NEVER .skip.
Self-verify: "A user can [action] which [result] because [impl]." Vague=incomplete.

## Per-Slice Checklist
```
[ ] End-to-end working, E2E passes, real content/images
[ ] Responsive (1280+375px), accessible, performant (<2.5s LCP)
[ ] Error/loading/empty states, transactional emails, idempotent webhooks
[ ] Graceful degradation for 3rd-party failures
[ ] Deployed+verified, web-manifest requirements met
[ ] MANDATORY: 07/completeness visual verification (6 breakpoints)
[ ] FCE scan zero findings, zero console errors
```

## Per-Project Checklist
```
[ ] All features, homepage polished, all nav works, all forms submit
[ ] Images optimized (WebP/AVIF), JSON-LD (4+), OG images, analytics, error tracking
[ ] Legal pages, favicon, PWA manifest, robots.txt, sitemap.xml
[ ] CSP+HSTS+security headers, Lighthouse>=90, a11y>=95, mobile no breaks at 375px
[ ] prefers-reduced-motion on all animations, prefers-color-scheme support
```

## Completeness Guarantee
Before done: data layer, API, UI, tests, SEO, analytics, error handling, mobile, docs all complete.

## Reuse Index
Check ~/emdash-projects/*/src/ before building. Contact form, Stripe checkout, Clerk middleware, error pages, analytics, CSP, security headers all reusable. Copy+adapt > write from scratch.
