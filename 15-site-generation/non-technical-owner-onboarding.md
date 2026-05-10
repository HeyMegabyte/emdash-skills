---
name: "non-technical-owner-onboarding"
description: "Zero-code onboarding for projectsites.dev. Owner enters business name + domain, AI builds entire site in one shot. No git, no terminal, no editor. Self-service updates via email/SMS, magic-link admin. Ultimate UX for small-business owners."
updated: "2026-05-10"
---

# Non-Technical Owner Onboarding

The projectsites.dev pipeline must work for owners who have never opened a terminal, never used GitHub, and don't know what "deployment" means. The product promise: paste a business name (or domain), choose a starting style, click ONE button, walk away. Twenty minutes later, an email arrives with a live URL + admin link. This file is the spec for that experience.

## Onboarding Flow (***THREE SCREENS, ZERO JARGON***)

**Screen 1 — Tell us about your business** (`/start`):
Single text input: "Business name or website" (placeholder: "Mario's Pizza" or "mariospizza.com"). On blur, Worker fires Google Places `findplacefromtext` → returns business object preview card. Owner sees: business photo, name, address, phone, hours, rating. Single button: "Yes, that's us → Continue." If wrong match, "Search again" reveals 3 alternates from Places. NO field-by-field form. NO multi-step wizard. NO password creation.

**Screen 2 — Pick a starting style** (`/start/style`):
Three side-by-side previews. Each preview is a 1280×720 screenshot of the actual home page that will ship — pre-rendered overnight by skill 12 from the same business data the owner just confirmed (so previews show THEIR photos, THEIR colors, THEIR copy). Labels: "Classic" (warm photo hero, serif headlines, light theme) | "Bold" (dark theme, bold sans, motion-forward) | "Minimal" (white space, editorial photography, no animation). Owner clicks one. NO color picker, NO font picker, NO theme builder. Picking happens in 3 seconds; refinement happens after launch via email.

**Screen 3 — Where should we send your site?** (`/start/finish`):
Single email field. On submit: Worker fires Inngest job → site-generation Workflow starts (skill 15 SKILL.md pipeline) → owner sees confetti + "We're building. We'll email you in ~20 minutes." Inngest emits 4 progress emails (5%, 25%, 60%, 100%) — each with a screenshot preview attached so owner sees the build evolving. Email at 100%: subject "Your site is live: {custom-or-projectsites-domain}", body "Here's the link: ... Here's your admin link (no password needed, click and you're in): ..., Reply to this email anytime to update copy/photos/hours."

## What's Assumed Without Asking

Owner is NEVER asked: domain registration (we offer free `{slug}.projectsites.dev` subdomain by default + paid custom domain at $12/yr passthrough Cloudflare Registrar) | hosting choice | CMS choice | analytics setup (we wire PostHog + GA4 + Sentry by default) | email provider (we wire Resend by default) | payment processor (Stripe Standard, owner KYC happens later only when they activate booking/donation) | logo upload (Ideogram generates from name + business type if no source logo exists; owner can replace later) | colors (extracted from primary photo via GPT-4o vision; owner can override via "make it more blue" email) | fonts (chosen by mode + business type — small-business mode defaults: Classic=Playfair Display + Source Sans 3, Bold=Sora + Inter, Minimal=DM Serif Display + DM Sans) | content (auto-generated from Google Places photos + reviews + competitor analysis; every claim cites Google Places + first-party data per rules/citations.md) | SEO setup (per-route metadata + JSON-LD baked in by validators) | accessibility (WCAG 2.2 AA enforced by skill 07 axe-core gate) | legal pages (Privacy/Terms/Accessibility statement auto-scaffolded with owner-business name; review prompted in admin within 7 days).

The only owner-supplied data is: business name, email, style choice, OPTIONAL custom domain. Everything else is inferred or asked-later.

## Magic-Link Admin (`/admin`)

Owner clicks the admin link in their welcome email → Worker validates Clerk magic-link → renders `/admin` SPA. Single-page admin with FOUR cards:

**Card 1: Update business info.** Pre-filled fields from Google Places (read-only with "Edit on Google Business Profile →" link — Google is the CMS, not us). Override fields owner controls in our admin: tagline (1 sentence), about-us paragraph (3-5 sentences via TipTap), team bios (when ≥2 staff), custom service descriptions. Save → Inngest re-deploys affected pages within 60 seconds.

**Card 2: Photos.** Drag-drop uploader (Uppy bundled per skill 06). Files go straight to R2, GPT-4o tags + scores relevance per skill 12 image-relevance gate, owner sees rejected uploads with "this looks more like a sunset than your restaurant — try another?" Owner can also star Google Places photos to feature.

**Card 3: Bookings & payments.** ONE-CLICK Stripe onboarding (Stripe Express embedded onboarding, no manual KYC form), Cal.com calendar connection (OAuth, one click), enable booking widget on site. After connection, owner sees "Receive payments" toggle + "Receive bookings" toggle. NO API key paste. NO webhook URL configuration.

**Card 4: Get help.** "Email Brian" (mailto:hey@megabyte.space), "Schedule 15min call" (Cal.com link), "Live status of my site" (last deploy, last analytics ping, last cron success). FAQ: 10 most-common questions answered.

NO code editor in admin. NO file tree. NO terminal. Owner who wants to write a blog post types `/blog new` in the email subject → AI extracts post title from email body, owner replies with content, AI commits + redeploys.

## Reply-by-Email Editing (***DEFAULT INTERFACE***)

The single most-used "admin interface" is replying to any auto-email with a free-text edit request. Inbound mailbox: `edits@projectsites.dev` (Resend inbound webhook → Inngest job). AI parses the request, identifies affected files via embedded site-context, makes the change, runs validators, deploys to staging, runs source-fidelity loop, deploys to production, replies with a screenshot diff + "live now."

Examples that work end-to-end via email today:
- "change our hours — Sunday 11-7 not closed" → updates `_research.json.business.opening_hours` + dispatches Google Business Profile update via Places API patch + redeploys
- "make the headline say 'Family-owned for 22 years'" → updates home page H1, runs source-fidelity loop, redeploys
- "add a blog post titled 'How we make our marinara' — [content]" → creates new blog post, generates featured image via skill 12, redeploys
- "the photo on the team page of my husband is wrong — use this one [attached]" → uploads attachment to R2, swaps team-page hero image
- "we're now offering catering, add a page" → creates `/services/catering` per pSEO scaffold, redeploys

Examples that escalate to operator review:
- pricing changes (need owner confirmation via reply-yes)
- new payment processor (Stripe onboarding required)
- domain change (Cloudflare Registrar transfer process)
- legal page edits (lawyer review recommended)
- design overhauls ("make it look totally different") — escalate to a 15-min call

## Default Key Bundle (Pre-Provisioned)

Owner never sees an API key. Worker uses platform-level keys for all owner sites: `OPENAI_API_KEY` (image generation, vision, embeddings — billed to platform, included in flat $9/mo or $19/mo plan) | `ANTHROPIC_API_KEY` (build pipeline) | `GOOGLE_PLACES_API_KEY` + `GOOGLE_MAPS_API_KEY` (NAP + map widget — keys are domain-restricted to *.projectsites.dev + custom domains owner verifies) | `RESEND_API_KEY` (transactional email — uses noreply@projectsites.dev with reply-to set to owner's email) | `IDEOGRAM_API_KEY` (logo gen) | `CLOUDFLARE_*` (deploy + DNS) | `STRIPE_*` (platform standard fee bypass — owner connects their own Stripe Standard account at admin time when they enable payments).

When owner upgrades to a paid plan that includes "use your own API keys" (rare, only enterprise-scale local chains), platform keys are replaced via admin → "Advanced settings" → key paste form. NEVER asked at onboarding.

## What Owner Pays

Three plans, one screen during onboarding (after Screen 3, before site goes live — non-blocking, owner can defer with "I'll decide later" + 14-day trial):
- **Free trial (14 days)**: full feature, `{slug}.projectsites.dev` subdomain, projectsites.dev footer credit. After 14 days, free tier downgrade keeps site live but freezes content updates until plan picked.
- **Local ($19/mo)**: custom domain, no footer credit, all features, unlimited replies, Stripe Standard payouts. Includes Google Places sync, source-fidelity loop, all validators, monthly Lighthouse + axe report email.
- **Premium ($49/mo)**: everything in Local + multi-location support (≥2 NAP triplets) + monthly content review (Brian personally reviews + suggests improvements via email) + priority email turnaround (≤2hr business hours).

Stripe Checkout (no card-field embed; redirect to Stripe-hosted page). 14-day trial extension via reply-by-email if owner asks.

## Failure Modes Owner Should Never See

- Build errors during initial generation: Worker retries 3x, then escalates to brian@megabyte.space with full `_audit_log.json`. Owner gets generic email "We're polishing — give us a few more minutes" + Brian fixes manually within 1 hour business hours. Pipeline-health-check protocol applies (rules/failed-pipeline-protocol.md).
- API quota exceeded (OpenAI rate limit, Cloudflare account limits, Google Places daily cap): platform monitoring (skill 13) alerts ops; owner gets retry email with no jargon.
- Domain DNS misconfiguration: admin shows "Domain status: setting up" with copy-paste records (CNAME `projectsites.dev`) + "Need help? Reply to this email." Owner is NEVER asked to log into a registrar without a guided walkthrough.
- Stripe KYC required: admin shows green-banner "Almost there — Stripe needs one more thing: [link to embedded Stripe form]." NEVER raw Stripe error codes.

## Discovery Surface

Onboarding entry points (mode-inferred from referrer + UTM):
- Direct: `projectsites.dev` marketing home → "Build your site" CTA → `/start`
- pSEO landing pages (skill 13): `projectsites.dev/website-for-pizza-restaurants`, `/website-for-dentists`, `/website-for-plumbers` — pre-fill business type to skill 15 mode-inference
- Local-business referral pSEO: `projectsites.dev/{city}/{business-type}` — geo-relevant city + type pre-fills location signals (e.g., `/portland-oregon/coffee-shop`)
- Cal.com booking → 15-min "is projectsites.dev right for me?" call → I onboard live during the call (zero-typing onboarding)
- Email forwarding from existing owners: "I made my site at projectsites.dev — try it" → onboard with referrer-attribution credit ($10 off first month for both)

## Acceptance Test (this UX MUST pass)

A friend's parent (60+, has used Gmail and Google Maps but not GitHub) opens projectsites.dev on a phone, completes onboarding without asking for help, gets a working site that they're happy with, and successfully updates their hours via email reply within the first week. If any step requires explanation, that step gets simplified or removed. Tested quarterly with rotating non-technical reviewers.

## See also

- `small-business-mode.md` — what gets built under the hood when owner picks "local business" path
- `source-fidelity-loop.md` — when owner uploads existing site, fidelity gate runs
- skill 13 `observability-and-growth` — onboarding funnel events (start, style, email, plan, first-deploy, first-edit, paid-conversion)
- skill 04 `preference-and-memory` — Voice of the Customer model captures owner's exact language for AI to mirror in copy
- `apps/project-sites/CLAUDE.md` PART 6+18 — Email infrastructure (Resend/SendGrid) wiring this experience uses
