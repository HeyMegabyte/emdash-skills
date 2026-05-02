# Always
Every page: Keyphrase FIRST→title 50-60 chars→meta desc 120-156 chars→one H1 in HTML shell (prerender)→canonical. 4+ JSON-LD (WebSite+Organization+WebPage+BreadcrumbList min, +LocalBusiness/Product/FAQPage/BlogPosting/Person by page type), OG 1200x630 ≤100KB branded card (NOT scraped photo), 2+ internal links, 1+ outbound, Yoast GREEN, `<meta name="color-scheme">` present, DNS-prefetch+preconnect for fonts/analytics, font woff2 preload for primary display+body.
Every site: site.webmanifest+robots.txt+humans.txt+sitemap.xml(every <url> has <lastmod>)+browserconfig.xml+.well-known/security.txt+favicon.ico+favicon-16x16.png+favicon-32x32.png+apple-touch-icon.png(180×180)+og-image (REQUIRED). Every internal asset ref must resolve to a real file in build output (asset existence gate). PNG>200KB→re-encode WebP/JPEG before upload. JS chunks ≤250KB gzip via route code-splitting (React.lazy+manualChunks).
Every site (interactive): full-featured Lightbox component mounted in Layout, ALL major image groups wrapped in `[data-gallery="<id>"]` (services/gallery/team/blog hero/testimonials/before-after). Bundle MUST contain `data-zoomable` AND `data-gallery` strings — verified by build_validators.ts. Lightbox: Esc/←→/Home/End/Tab focus-trap, swipe (Pointer Events ≥40px), pinch-zoom, double-tap, neighbor preload via `<link rel="preload" as="image">`, role="dialog"+aria-modal+aria-label+aria-live counter, prefers-reduced-motion. Custom hostname canonical when `primary_hostname` set (not the default `*.projectsites.dev`). For local businesses: `tel:` link in nav.
Every clickable entity (***UNIVERSAL — NO EXCEPTIONS***): every email→`<a href="mailto:user@domain">`|every phone→`<a href="tel:+1NNNNNNNNNN">` (E.164, strip formatting)|every street/PO Box address→`<a href="https://www.google.com/maps/dir/?api=1&destination=<urlencoded>">` (street) or `…/maps/search/?api=1&query=<urlencoded>` (PO Box/no-direction-target)|every URL→`<a href>` with `target="_blank" rel="noopener noreferrer"` for external|every named institution/org/journal/conference/publication mentioned in body copy→hyperlinked to its canonical URL using the institution name as anchor (never bare "click here"|"learn more")|every product/service/feature mentioned with a dedicated route→`<Link>` to that route|every SKU/EIN/DOI/ISBN/arXiv-id→linked to authoritative registry. If a string can be linked AND linking aids the reader, IT MUST BE LINKED. Plain-text contact info=build fail. Validator: `validate-hyperlinks.mjs` greps dist/ HTML for unlinked `[\w.+-]+@[\w-]+\.[\w.-]+` (email regex) AND `(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})` (US phone) AND `(P\.?O\.? Box \d+|\d+ [A-Z][a-z]+ (Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr))` (address) — any match outside an `<a>` ancestor=fail.
Every form: Turnstile(invisible, `data-appearance="interaction-only"`, NEVER visible widgets)+Zod+Resend.
Post-work: Deploy+test+purge. Update CLAUDE.md. Remove dead code/comments/imports. Stale docs=bugs.
Ethics (IEEE EAD|ACM|W3C|UNESCO|EFF|Humane by Design|Ethical OS|Copenhagen Letter|Berkman Klein): Well-being>engagement/revenue. Never design for addiction|deception|control. Data agency: users own data, export/delete/port anytime, privacy by default, minimum collection, encrypt at rest. Transparency: explain AI in plain language, open-source by default. Accessibility: WCAG 2.2 AA non-negotiable (9 new criteria incl. dragging alternatives, focus appearance, consistent help), ADA 2027/2028 deadlines, disability-first. Proportionality: don't use AI where simpler works. Accountability: own mistakes publicly, audit trail. Interoperability: open APIs, standard formats, no lock-in. Pre-ship harm scan (Ethical OS 8 zones+OWASP 2025): disinformation|addiction|inequality|bias|surveillance|data exploitation|trust gaps|bad actors|supply chain(#3)|exceptional conditions(#10). Empowerment: increase user capability+autonomy, finite experiences, protect vulnerable users.

## End Every Response With This Report (render as markdown in chat, NOT via bash)
After EVERY response, render directly in text output as styled markdown:
```
---
**⚡ {project}** · `{branch}` · {time}

**Changes:**
- {change 1}
- {change 2}
- ...

**Next:** → {step} — {url}

**Recs:**
- ◆ {rec 1}
- ◆ {rec 2}

**Config:** {list each ~/.agentskills/ and ~/.claude/ file edited + brief summary; "none" if nothing}
**Repos:** {list each non-current repo modified + brief summary; "none" if nothing}
**Links:** [Repo]({url}) · [CF]({url}) · [Skills](https://github.com/heymegabyte/claude-skills)
```
Config/Repos lines ALWAYS present (print "none" if no changes). Every URL: FULL deeplinked. Also run `source ~/.claude/hooks/prompt-report.sh && emdash_report` via Bash (bg).
