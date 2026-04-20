---
name: "Build and Slice Loop"
description: "Implements features in vertical slices, always starting with homepage. Enforces anti-placeholder rules — no lorem ipsum, no TODO stubs, no gray boxes. Real content, real images, real interactions. TypeScript strict mode, Zod validation, and structured file organization."
layer: "product-compiler"
canonical-owner-of:
  - "vertical-slice-planning"
  - "anti-placeholder-enforcement"
  - "implementation-standards"
  - "content-generation-rules"
---

# 06 — Build and Slice Loop

> Implement in vertical slices. Ship working increments. Never write placeholder code.

---

## Core Principle

**Every implementation increment must deliver visible, testable, end-to-end value.** No horizontal layers. No stubs. No "coming soon." Each slice cuts through the full stack — from database to UI — and works when it's done.

### Strategic Slice Priorities
Every slice should advance at least one of these goals:
1. **End-user value** — does this slice make the user's life tangibly better?
2. **Conversion psychology** — does this slice move users toward purchase/action? (skill 51)
3. **Brand quality** — does this slice make projectsites.dev look world-class?

### AI-Enriched Slices
Every slice should ask: "Can AI make this better?"
- Static images → AI-generated images (GPT Image 1.5, Ideogram)
- Manual text → AI-generated alt text, meta descriptions, translations
- Basic search → AI-powered semantic search (Vectorize + Workers AI)
- Generic recommendations → AI-driven personalization
- Manual support → AI chat widget (Workers AI RAG, skill 43)
- No video → AI-generated hero video (Sora 2, skill 12)

---

## Vertical Slice Rules

### What Makes a Good Slice
- Touches all relevant layers (data → API → UI)
- Produces a visible, testable result
- Can be deployed and verified independently
- Is the smallest unit that delivers real value
- Has clear acceptance criteria

### What Makes a Bad Slice
- "Set up the database" (horizontal layer)
- "Build the component library" (premature abstraction)
- "Add error handling everywhere" (cross-cutting without features)
- "Scaffold the project" (infrastructure without value)

### Slice Sequencing
```
Slice 1: Homepage with real content, working navigation, deployed
Slice 2: Core feature #1, end-to-end, tested
Slice 3: Core feature #2, end-to-end, tested
Slice N: Polish, edge cases, documentation
```

### First Slice Is Always the Homepage
Unless explicitly directed otherwise, the first vertical slice is:
1. A complete, beautiful homepage
2. With real content (not lorem ipsum)
3. With real images (generated or sourced)
4. With working navigation
5. Deployed to production
6. Verified with Playwright

---

## Anti-Placeholder Rules

### Never Ship
- `// TODO: implement this`
- `Lorem ipsum` or placeholder text
- Gray boxes instead of images
- `console.log('not implemented')`
- Empty pages behind navigation links
- Broken links to unbuilt pages
- Form submissions that go nowhere
- Buttons that don't work

### Instead
- Implement the real thing, even if minimal
- Use real copy (infer from product type if not provided)
- Generate or source real images
- Build working interactions
- If a page isn't ready, don't link to it
- If a form isn't wired up, make it capture to KV or D1
- "Coming soon" badges are DEFECTS, not placeholders — they are unfinished features shipped to production. Remove them by implementing the real feature or removing the section entirely.

---

## Implementation Patterns

### New Project Bootstrap
```
1. Create wrangler.toml with project name from domain
2. Create src/index.ts with Hono app
3. Build first page with full HTML (not template)
4. Add real CSS (not a framework default)
5. Add real content (infer from domain/product type)
6. Generate logo and favicon set
7. Add structured data (JSON-LD)
8. Add meta tags (OG, Twitter, canonical)
9. Add analytics snippet
10. Deploy and verify
→ Then build features in slices
```

### Feature Implementation Pattern
```
1. Write the E2E test first (what should the user see?)
2. Build the data layer (Drizzle schema + migration — skill 44)
3. Build the API endpoint (Hono route, Zod validation)
4. Build the UI (page or component)
5. Wire everything together
6. Run the test
7. Fix until green
8. Deploy and verify live
```

### Parallel Implementation
When multiple features are independent:
```
Agent 1: Feature A (data → API → UI → test)
Agent 2: Feature B (data → API → UI → test)
Agent 3: Media generation (logo, hero, section images)
Agent 4: Analytics and observability setup
→ Merge when all complete
→ Integration test
→ Deploy
```

---

## Code Quality Standards

### TypeScript Strictness
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Validation
- All external input validated with Zod at the boundary
- API request bodies: Zod schema
- URL parameters: Zod schema
- Environment variables: Zod schema at Worker start
- Never trust client data inside the Worker

### Error Handling
- Meaningful error messages (not "something went wrong")
- Consistent error envelope: `{ error: string, code?: string, details?: unknown }`
- Log errors with context (method, path, user ID if available)
- Never expose stack traces to clients
- Report to Sentry in production

### File Organization (Worker)
```
src/
├── index.ts          # Hono app entry, routes
├── routes/           # Route handlers by domain
│   ├── api.ts
│   └── pages.ts
├── middleware/        # Auth, CORS, rate limiting
├── services/         # Business logic
├── db/               # Schema, migrations, queries
├── lib/              # Shared utilities
├── types.ts          # Shared types
└── env.ts            # Zod env validation
```

### File Organization (Angular + Nx)
```
apps/
├── web/              # Angular app
│   └── src/
│       ├── app/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── services/
│       │   └── guards/
│       ├── assets/
│       └── environments/
└── api/              # Hono Worker
    └── src/
packages/
├── shared/           # Zod schemas, types, utils
└── ui/               # Shared Angular components
```

---

## Content Generation Rules

### Real Copy
- Infer headlines from product type and domain
- Write benefit-oriented subheadings
- Use specific, concrete language (not generic marketing)
- Include social proof (even templated: "Trusted by X developers")
- Include clear CTAs with specific actions

### Real Images
- Generate hero images via imagegen or Sora
- Source stock from Unsplash/Pexels for supporting images
- Generate logos via Ideogram
- Create social preview images (OG)
- Compress all images (WebP, appropriate dimensions)

### Structured Data
Every page gets relevant JSON-LD:
- `Organization` — on all pages
- `WebSite` — on homepage
- `WebPage` — on every page
- `FAQPage` — if FAQ section exists
- `Product` — if selling something
- `SoftwareApplication` — if it's a tool
- `BreadcrumbList` — on subpages

---

## Iterative Completion

### Per-Slice Checklist
```
[ ] Feature works end-to-end
[ ] E2E test passes
[ ] Real content (no placeholders)
[ ] Real images (no gray boxes)
[ ] Responsive (1280px + 375px)
[ ] Accessible (keyboard, screen reader, contrast)
[ ] Performance acceptable (< 3s LCP)
[ ] Error states handled
[ ] Loading states present
[ ] Empty states designed (new/zero-data views show helpful CTAs, not blank space)
[ ] Transactional emails implemented (confirmation, receipt, notification — not just the UI)
[ ] Webhook handlers are idempotent (use idempotency keys; handle retries without duplicates)
[ ] Graceful degradation for third-party failures (Stripe.js, Turnstile, analytics CDN)
[ ] Deployed and verified live
[ ] Skill 24 web property requirements met:
    - site.webmanifest with screenshots (wide + narrow form_factor), shortcuts with 96px icons
    - humans.txt, .well-known/security.txt present
    - Cross-site alternate links and JSON-LD sameAs
    - All meta tags (og:*, twitter:*, msapplication-*, apple-mobile-web-app-*, color-scheme)
[ ] MANDATORY EXIT GATE: Skill 56 visual verification passes on ALL pages affected by this slice.
    Screenshot every affected page at 6 breakpoints → GPT-4o analysis → fix → re-verify.
    No slice is marked DONE until AI vision confirms zero issues.
[ ] Feature Completeness Engine (FCE) scan returns zero findings on affected routes.
```

### Per-Project Completion Checklist
```
[ ] All features implemented and tested
[ ] Homepage visually complete and polished
[ ] All navigation links work
[ ] All forms submit correctly
[ ] All images load and are optimized
[ ] Structured data on all pages
[ ] OG/social preview images set
[ ] Analytics firing
[ ] Error tracking active
[ ] Legal pages present (privacy, terms)
[ ] favicon and touch icons set
[ ] PWA manifest if applicable
[ ] robots.txt and sitemap.xml
[ ] CSP headers configured
[ ] Performance: Lighthouse >= 90
[ ] Accessibility: skip link, focus rings, ARIA
[ ] Mobile: no breaks at 375px
```

---

## Trigger Conditions
- Implementation phase of any build task
- User requests a new feature
- User requests a fix or improvement

## Stop Conditions
- All slices in the plan are complete
- Per-project checklist passes
- Deployed and verified

## Cross-Skill Dependencies
- **Reads from:** 03-planning-and-research (implementation plan), 05-architecture-and-stack (what to build with), 02-goal-and-brief (what to build)
- **Feeds into:** 07-quality-and-verification (code to test), 08-deploy-and-runtime (code to deploy), 12-media-orchestration (media needs)

---

## Completeness Guarantee (verify EVERY feature against this full-stack checklist)

Before marking ANY feature slice as "done," verify every layer. Incomplete slices compound into broken products. This checklist is the rubber-duck test — if you can't check every box, the feature is not finished.

```
[ ] Data layer complete     — Drizzle schema defined, migration runs clean, seed data if needed
[ ] API endpoint complete   — Hono route implemented, Zod validation on all inputs, error envelope returned
[ ] UI complete             — HTML rendered, CSS styled, all interactions wired, empty/loading/error states handled
[ ] Tests complete          — E2E test for happy path + error path, form matrix (8 tests) if form exists
[ ] SEO complete            — Page has unique title, meta description, H1, JSON-LD, OG tags, canonical URL
[ ] Analytics complete      — PostHog event fires on key actions (page view, form submit, CTA click, purchase)
[ ] Error handling complete — Loading spinners, error messages (specific, not generic), empty states with helpful CTAs, 404/500 branded pages
[ ] Mobile complete         — No horizontal overflow at 375px, touch targets >= 44px, text readable without zoom
[ ] Docs complete           — JSDoc on exported functions, code comments explain WHY not WHAT, CLAUDE.md updated
```

### Strict TDD Workflow (MANDATORY — from Skill 01)
Every feature slice follows Red → Green → Refactor → Verify:
1. Write a Spec (Given/When/Then acceptance criteria)
2. Write a failing Playwright E2E test based on the spec
3. Run it — confirm it fails (Red)
4. Implement the minimum code to make it pass (Green)
5. Refactor while keeping tests green
6. Run FCE scan — zero findings required
7. Run Skill 56 visual verification — verified required
8. Deploy — only after all gates pass

### Continuous Self-Healing
When an E2E test fails during implementation:
1. Read the FULL error (not just the first line)
2. Diagnose root cause
3. Fix the code
4. Re-run the test
5. Loop until green (max 5 attempts)
6. NEVER skip a failing test or mark it .skip

### Self-Verification (Rubber Duck Gate)
Before moving to the next slice, explain the completed feature in one sentence: "A user can [action] which [result] because [implementation]." If any part of that sentence is vague, the slice is incomplete. This forced self-explanation catches gaps that code reviews miss (source: GitHub Rubber Duck pattern, April 2026).

---

## OpenSaaS Feature Parity Checklist (Source: wasp-lang/open-saas, 14K stars)

Every SaaS product built by this system must match or exceed OpenSaaS features:

| Feature | OpenSaaS | Our Implementation | Skill |
|---------|----------|-------------------|-------|
| Auth (email + social) | Wasp built-in | Clerk | 05 |
| Payments | Stripe/Lemon Squeezy/Polar | Stripe + Stripe Link | 18 |
| Analytics (server-side) | Plausible + cron stats | PostHog (self-hosted) + CF Cron | 13 |
| Admin Dashboard | TailAdmin components | Custom /admin + bolt.diy editor | 46 |
| File Uploads | S3 presigned URLs | R2 presigned URLs | 05 |
| Email Templates | SendGrid/Mailgun | Resend (branded HTML) | 19 |
| Background Jobs | PgBoss cron | Inngest / CF Workflows v2 / Queues | 05 |
| SEO | Sitemap + meta | Full web property (24) + keyword targeting (28) | 24, 28 |
| Cookie Consent | Modal | Not needed (PostHog self-hosted = cookie-free) | — |
| AI/Vibe Coding | AGENTS.md + plugin | 50-skill system + rules + agents | All |
| Landing Page | Pre-built template | AI-generated with anti-slop design | 10 |
| Blog | Built-in | Markdown + RSS + seed posts | 33 |
| Contact Form | Basic | Turnstile + Zod + Resend + 8-point test | 32 |
| Error Pages | Basic 404 | Branded 404/500/503/offline | 31 |
| i18n | Not included | EN+ES + AI translate + hreflang | 42 |
| Search | Not included | CF AI Search multi-tenant RAG | 37 |
| Easter Eggs | Not included | Mandatory hidden delights | 15 |
| Notifications | Not included | OneSignal + in-app bell | 49 |
| Keyboard Shortcuts | Not included | Cmd+K command palette | 47 |

**We exceed OpenSaaS on 8 features they don't have.** This is our competitive advantage.

## What This Skill Owns
- Vertical slice planning and sequencing
- Implementation patterns and standards
- Anti-placeholder enforcement
- Code quality standards
- Content generation rules
- File organization conventions
- Iterative completion tracking
- See STYLE_GUIDES.md for TypeScript + Angular conventions

## What This Skill Must Never Own
- Technology selection (→ 05)
- Testing execution (→ 07)
- Deployment (→ 08)
- Visual design specifics (→ 10)
- Media generation (→ 12)

---

## Rapid Start Protocol (New Project in < 5 minutes)

When a new project folder is empty, get to first deploy in under 5 minutes:

```
Minute 0-1: Infer product type from domain → load SKILL_PROFILES.md profile
Minute 1-2: Generate wrangler.toml + src/index.ts with Hono from CONVENTIONS.md starter
Minute 2-3: Build homepage HTML with real inferred content + meta tags + JSON-LD
Minute 3-4: Add CSS (brand tokens from CONVENTIONS.md), favicon placeholder
Minute 4-5: wrangler deploy → purge cache → verify 200 OK
```

This gives you a live URL in 5 minutes. Then iterate with features.

**Parallel at minute 2:** Launch media agent (logo gen via Ideogram, hero via GPT Image).
**Parallel at minute 3:** Launch content agent (keyword research, copy writing).

## Reuse Index (check before building)

Before implementing any feature, check if it already exists in another emdash project:
```
~/emdash-projects/*/src/                  # Source code
~/emdash-projects/*/e2e/                  # Test patterns
~/emdash-projects/*/wrangler.toml         # Config patterns
```

Common reusable patterns across projects:
- Contact form with Turnstile (skill 32 template)
- Stripe checkout session (skill 18 template)
- Clerk auth middleware (skill 05 pattern)
- Error pages (skill 31 template)
- Analytics setup (skill 13 pattern)
- CSP headers (CONVENTIONS.md)

**Copy and adapt instead of writing from scratch.** The AI advantage is speed through reuse.
