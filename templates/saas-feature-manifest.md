# SaaS Feature Manifest

Every SaaS built with Emdash must ship with ALL of these. This is the SPEC.md template.
Check each item as acceptance criteria. Each unchecked item = a failing test = not done.

## 1. Authentication (Clerk)
- [ ] Email + password signup/login
- [ ] Google Sign-In (one-click)
- [ ] Magic email link (passwordless)
- [ ] User profile page (name, email, avatar, timezone)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Session management (active sessions, revoke)
- [ ] Account deletion (GDPR right to erasure)
- [ ] Protected routes (redirect to login if unauthenticated)
- [ ] Role-based access (user, admin, superadmin)

## 2. Billing (Stripe)
- [ ] Free tier (no credit card required)
- [ ] Pro tier ($50/mo — adjustable)
- [ ] Stripe Checkout (hosted, PCI compliant)
- [ ] Stripe Customer Portal (manage subscription, invoices, payment method)
- [ ] Stripe webhooks (subscription.created, updated, deleted, invoice.paid, payment_failed)
- [ ] Webhook signature verification + idempotency (KV dedup)
- [ ] Trial period (14 days, configurable)
- [ ] Usage-based metering (if applicable — API calls, storage, seats)
- [ ] Proration on plan changes
- [ ] Dunning emails (payment failed → retry → warn → cancel)
- [ ] Revenue dashboard in admin (MRR, churn, ARPU)
- [ ] Stripe Link for one-click payment
- [ ] Coupon/promo code support
- [ ] Annual billing option (2 months free)

## 3. Landing Page
- [ ] Hero section (4-8 word headline, 100-160 char description, primary CTA)
- [ ] Feature grid (3-6 features with icons, headlines, descriptions)
- [ ] Pricing table (free vs pro, feature comparison, toggle monthly/annual)
- [ ] Testimonials/social proof (3+ quotes or logo bar)
- [ ] FAQ accordion (5+ questions)
- [ ] Final CTA section (above footer)
- [ ] Footer (nav links, social icons, legal links, newsletter signup)
- [ ] Trust badges (security, uptime, customer count)
- [ ] Animated hero (CSS-only, not library-dependent)
- [ ] Mobile-responsive at all 6 breakpoints

## 4. Dashboard (authenticated)
- [ ] Overview cards (key metrics — usage, plan status, recent activity)
- [ ] Activity feed (last 10 actions with timestamps)
- [ ] Quick actions (primary workflows accessible in 1 click)
- [ ] Settings page (profile, notifications, billing, API keys, danger zone)
- [ ] Plan usage indicator (how much of quota used, upgrade prompt at 80%)
- [ ] Skeleton loading states (no blank screens)
- [ ] Empty states with action prompts (never "No data")
- [ ] Breadcrumb navigation
- [ ] Responsive sidebar (collapsible on mobile)
- [ ] Dark theme (default, matches brand)

## 5. API (Hono RPC)
- [ ] RESTful CRUD endpoints for core resources
- [ ] Hono RPC mode with type-safe client (hc<AppType>)
- [ ] @hono/zod-validator on ALL request bodies
- [ ] Centralized error handler (app.onError + app.notFound)
- [ ] Error envelope: { error: string, code?: string, details?: unknown }
- [ ] Rate limiting (KV-based per-IP, 100 req/min default)
- [ ] Auth middleware (JWT verification on protected routes)
- [ ] Pagination (cursor-based, limit/offset fallback)
- [ ] API versioning (/v1/ prefix)
- [ ] Health endpoint (GET /health → { status, version, timestamp })
- [ ] OpenAPI spec auto-generation
- [ ] CORS (explicit origins, never wildcard in production)
- [ ] Request/response logging (structured JSON)

## 6. Database (Drizzle + D1/Neon)
- [ ] Schema-first design with Drizzle ORM
- [ ] Auto-generated migrations
- [ ] Seed data script for development
- [ ] Indexes on frequently queried columns
- [ ] Soft deletes (deletedAt timestamp, never hard delete user data)
- [ ] Audit trail (createdAt, updatedAt, createdBy on all tables)
- [ ] Type-safe queries (no raw SQL)
- [ ] Connection pooling (Neon) or binding (D1)

## 7. Onboarding
- [ ] Welcome modal on first login (value proposition, 3 steps)
- [ ] Guided tour with tooltips (3-5 key features)
- [ ] Progress checklist (sidebar, tracks completion %)
- [ ] Welcome email (branded, links to docs/support)
- [ ] Activation tracking via PostHog (funnel: signup→onboarding→first-value→retained)
- [ ] Time to value < 60 seconds (user sees core value in first minute)
- [ ] Skip option (never force, but encourage)

## 8. Email (Resend)
- [ ] Welcome email (on signup)
- [ ] Email verification (magic link)
- [ ] Password reset email
- [ ] Payment receipt (after successful charge)
- [ ] Payment failed notification
- [ ] Subscription cancelled confirmation
- [ ] Weekly/monthly digest (opt-in)
- [ ] All emails: branded dark header, clean body, light footer, dark mode support
- [ ] Unsubscribe link in every email
- [ ] From: hey@[domain] (verified domain)

## 9. Notifications
- [ ] In-app notification bell with unread count badge
- [ ] Notification preferences per user (email, push, in-app)
- [ ] Real-time updates (WebSocket or polling)
- [ ] Push notifications via OneSignal (opt-in)
- [ ] Email fallback for offline users
- [ ] Notification types: system, billing, activity, marketing
- [ ] Mark all as read
- [ ] Notification history page

## 10. Admin Panel (/admin)
- [ ] User management (list, search, view, suspend, delete)
- [ ] Feedback/testimonial moderation queue
- [ ] Revenue dashboard (MRR, churn, ARPU, growth chart)
- [ ] System health (uptime, error rate, response time)
- [ ] Feature flags (enable/disable per user or globally)
- [ ] Blog post management (CRUD, publish/draft)
- [ ] Newsletter subscriber management
- [ ] Webhook event log (last 100, status, retry)
- [ ] API key management
- [ ] Protected by admin role check

## 11. SEO & Content
- [ ] Per-page keyphrase research (holy-grail + 2 longtail)
- [ ] Title 50-60 chars (keyphrase at start)
- [ ] Meta description 120-156 chars
- [ ] One H1 per page, canonical URL
- [ ] 4+ JSON-LD blocks (Organization, WebSite, WebPage, domain-specific)
- [ ] OG image 1200x630 per page
- [ ] Internal links (2+ per page), outbound link (1+ per page)
- [ ] Sitemap.xml (auto-generated, submitted to GSC)
- [ ] robots.txt
- [ ] Blog with 3-5 seed posts targeting longtail keywords
- [ ] RSS feed
- [ ] Flesch Reading Ease >= 60 on all user-facing text
- [ ] Yoast GREEN on all checks

## 12. Accessibility (WCAG AA)
- [ ] axe-core: 0 violations
- [ ] Lighthouse Accessibility >= 95
- [ ] Skip-to-content link
- [ ] All images have meaningful alt text
- [ ] ARIA landmarks (header, nav, main, footer)
- [ ] Focus rings (2px solid cyan, 3px offset — beautiful, not just compliant)
- [ ] Keyboard navigation for all interactions
- [ ] Color contrast >= 4.5:1 (normal), >= 3:1 (large)
- [ ] Touch targets >= 44x44px
- [ ] prefers-reduced-motion respected on all animations
- [ ] Screen reader tested (heading hierarchy, form labels, button text)

## 13. Performance
- [ ] Lighthouse Performance >= 75 (>=90 preferred)
- [ ] LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] JS bundle < 200KB compressed
- [ ] CSS < 50KB compressed
- [ ] Images: WebP, < 200KB each, width+height attributes set
- [ ] Fonts < 100KB total, display: swap
- [ ] Lazy loading on below-fold images
- [ ] Preconnect to critical origins

## 14. Security
- [ ] CSP headers (script-src, style-src, img-src, connect-src, frame-src)
- [ ] HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] Zod validation on ALL external input at boundaries
- [ ] No eval(), innerHTML, document.write()
- [ ] Turnstile CAPTCHA on all public forms
- [ ] Rate limiting on auth endpoints (5 req/min)
- [ ] Secrets in wrangler secrets (never in code or repo)
- [ ] CORS: explicit origins only
- [ ] Webhook signature verification
- [ ] SQL injection prevention (parameterized queries via Drizzle)
- [ ] XSS prevention (escape all user content in HTML output)
- [ ] CSRF protection on state-changing endpoints

## 15. PWA & Web Manifest
- [ ] manifest.json with screenshots (wide + narrow), shortcuts (96px icons)
- [ ] display_override, edge_side_panel
- [ ] Service worker (offline page)
- [ ] Favicon set (16, 32, 180, 512)
- [ ] Apple touch icon
- [ ] humans.txt, security.txt, opensearch.xml, browserconfig.xml

## 16. Internationalization
- [ ] English + Spanish minimum
- [ ] Language selector in navbar/footer
- [ ] AI-translated content at deploy time
- [ ] hreflang tags for SEO
- [ ] Locale-aware dates, numbers, currency
- [ ] RTL support detection

## 17. Search
- [ ] Cmd+K command palette (Linear/Notion style)
- [ ] Keyboard shortcut overlay (press ? for help)
- [ ] Full-text search across user data
- [ ] AI-powered semantic search (CF AI Search or Vectorize)
- [ ] Recent searches, keyboard navigation

## 18. Error Handling
- [ ] Custom 404 page (branded, helpful navigation)
- [ ] Custom 500 page (branded, "Something broke on our end")
- [ ] Custom 503 page (maintenance mode)
- [ ] Offline page (PWA)
- [ ] Form validation errors (inline, specific, helpful)
- [ ] Toast notifications for async errors
- [ ] Sentry error tracking (auto-capture, source maps)
- [ ] Graceful degradation (third-party script fails → fallback)

## 19. Analytics & Observability
- [ ] GA4 via GTM (14-step automation)
- [ ] PostHog (product analytics, session recording, feature flags)
- [ ] Sentry (error tracking, performance monitoring)
- [ ] Event taxonomy (signup, login, upgrade, feature_used, error)
- [ ] Funnel tracking (landing→signup→onboarding→activation→payment)
- [ ] Scroll depth + engagement tracking
- [ ] Health endpoint monitored by UptimeRobot or Better Stack

## 20. Social & Marketing
- [ ] OG tags on every page (title, description, image, type, URL)
- [ ] Twitter Card meta tags
- [ ] Social share buttons on blog posts
- [ ] Newsletter signup (footer + dedicated section)
- [ ] Auto-post to social media on deploy via Postiz
- [ ] Changelog page (/changelog, auto-generated from commits)

## 21. Legal & Compliance
- [ ] Privacy Policy page (GDPR/CCPA compliant)
- [ ] Terms of Service page
- [ ] Cookie policy (if applicable — PostHog self-hosted = no cookies)
- [ ] Data deletion endpoint (GDPR right to erasure)
- [ ] Age verification (if required by domain)
- [ ] Accessibility statement
- [ ] PCI compliance via Stripe Checkout (never handle raw cards)

## 22. Developer Experience
- [ ] CLAUDE.md in project root (project-specific context)
- [ ] README.md (install.doctor template, shields.io badges, dividers)
- [ ] TypeScript strict mode
- [ ] Biome auto-formatting
- [ ] JSDoc on all exported functions
- [ ] E2E tests for every feature (~1min per file, 6 breakpoints)
- [ ] CI/CD via GitHub Actions (deploy on push to main)
- [ ] Environment variables documented
- [ ] Local development instructions
- [ ] Conventional commits

## 23. Easter Egg
- [ ] At least one hidden delight (via URL parameter)
- [ ] Canvas-based, full-screen, dismissible
- [ ] Contextually appropriate and genuinely fun

## 24. AI Integration
- [ ] AI chat widget (Workers AI + Vectorize RAG, trained on site content)
- [ ] AI-generated content (alt text, translations, meta descriptions)
- [ ] AI-powered search (semantic, not just keyword)
- [ ] Copilot features for power users (CopilotKit integration if applicable)

## 25. Backup & Recovery
- [ ] D1 database exports (scheduled, to R2)
- [ ] Configuration backup (wrangler.toml, secrets list)
- [ ] Restore script that rebuilds from backup
- [ ] Rollback procedure documented
- [ ] Data retention policy

---

**Total: 25 categories, ~200 acceptance criteria.**
Each unchecked item = a Playwright test that must pass on production.
DONE = all checked + GPT-4o zero issues + zero recommendations.
