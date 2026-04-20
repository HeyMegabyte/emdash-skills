---
name: "Completeness Verification"
description: "Continuously loop through AI-powered visual inspection of every page, every breakpoint, every interaction state until the AI finds zero remaining issues. This is the done detector that prevents premature completion."---

# Skill 56 — Completeness Verification Loop

> **Purpose**: Continuously loop through AI-powered visual inspection of every page, every breakpoint, every interaction state until the AI finds zero remaining issues. This is the "done detector" — the skill that prevents premature completion.

## Core Principle

**A project is NOT complete until a vision AI model examines every page and finds nothing to improve.**

The completeness verification loop runs AFTER all features are implemented. It is the final quality gate that catches visual bugs, design inconsistencies, missing content, broken layouts, accessibility issues, and UX problems that code-level tests cannot detect.

## The Loop (MANDATORY — runs until convergence)

```
REPEAT {
  1. ENUMERATE all routes in the application
  2. For each route:
     a. Screenshot at 6 breakpoints (375, 390, 768, 1024, 1280, 1920)
     b. Screenshot interaction states (hover, focus, error, loading, empty, success)
     c. Send screenshots to GPT-4o vision with structured analysis prompt
     d. If GPT-4o fails → fall back to Anthropic Claude vision
     e. Parse recommendations into actionable items
  3. IMPLEMENT all recommendations
  4. Re-screenshot changed pages
  5. Re-analyze with GPT-4o
  6. IF new issues found → CONTINUE loop
  7. IF zero issues found → mark route as VERIFIED
} UNTIL all routes are VERIFIED
```

## Vision Analysis Prompt (use verbatim)

```
You are a Principal UI/UX Engineer reviewing a production web application.

Analyze this screenshot and report issues in these categories:
1. LAYOUT: Alignment, spacing, overflow, responsive breaks
2. TYPOGRAPHY: Font size, weight, line-height, readability, hierarchy
3. COLOR: Contrast ratios, brand consistency, dark theme quality
4. CONTENT: Placeholder text, missing content, truncation, spelling
5. INTERACTION: Missing hover states, focus indicators, cursor styles
6. ACCESSIBILITY: Missing alt text, contrast failures, focus management
7. POLISH: Rough edges, inconsistent borders, shadow/glow issues
8. COMPLETENESS: Missing sections, placeholder UI, stub content

For each issue, provide:
- Category (one of the 8 above)
- Severity (critical / major / minor / cosmetic)
- Location (describe where on the page)
- Fix (specific CSS/HTML change needed)

If the page looks PRODUCTION READY with no issues, respond with:
{"status": "verified", "issues": []}

Otherwise respond with:
{"status": "needs_fixes", "issues": [...]}
```

## Provider Priority

| Priority | Provider | Model | Use Case |
|----------|----------|-------|----------|
| 1 (primary) | OpenAI | gpt-4o | Visual inspection, screenshot analysis |
| 2 (fallback) | Anthropic | claude-sonnet-4-20250514 | Fallback when GPT-4o fails or rate-limited |
| NEVER | Any | Any | Do NOT use Anthropic as primary for vision — GPT-4o is superior for visual analysis |

**The build pipeline strictly relies on Claude Code** — that is not affected by this skill. This skill only governs the INSPECTION layer (screenshots → analysis → recommendations).

## Breakpoints (from CONVENTIONS.md)

```typescript
const BREAKPOINTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
```

## Routes to Inspect (projectsites.dev frontend)

Every route in app.routes.ts MUST be inspected:
- `/` — Homepage (hero, social proof, features, pricing, FAQ, footer)
- `/search` — Business search with results
- `/signin` — Magic link + Google OAuth
- `/create` — Site creation form
- `/waiting` — Build progress
- `/admin` — Dashboard (12 child sections)
- `/admin/editor` — Site editor iframe
- `/admin/analytics` — Charts and stats
- `/admin/billing` — Stripe integration
- `/admin/settings` — Domain management
- `/admin/audit` — Log viewer
- `/blog` — Blog listing
- `/blog/:slug` — Individual post
- `/changelog` — Release timeline
- `/status` — System health
- `/privacy`, `/terms`, `/content` — Legal pages
- `/error` — 500 page
- `/offline` — Offline page
- `/**` — 404 page

## Interaction States to Inspect

For each page, ALSO screenshot:
- **Empty state**: No data loaded yet
- **Loading state**: Skeleton/spinner visible
- **Error state**: API failure displayed
- **Success state**: Action completed
- **Hover state**: Interactive element hovered (buttons, cards, links)
- **Focus state**: Element focused via keyboard

## Convergence Criteria

The loop STOPS when ALL of the following are true:
1. Every route has been screenshotted at all 6 breakpoints
2. GPT-4o returns `{"status": "verified"}` for EVERY screenshot
3. All E2E tests pass
4. No new issues have been found in the last complete iteration
5. The human reviewer (Brian) has not flagged additional issues
6. The "Zero Recommendations" test passes: when asked "How can I improve this app more?", 
   the AI genuinely has no reasonable recommendations. If it does → implement → re-verify → re-ask.
   This is the ULTIMATE convergence test. The loop doesn't stop because a checklist passed — 
   it stops because the AI's own critical judgment says "this is genuinely complete."

## Implementation Pattern

```typescript
// Pseudocode for the completeness loop
async function completenessLoop(routes: string[], breakpoints: Breakpoint[]) {
  const verified = new Set<string>();
  let iteration = 0;
  
  while (verified.size < routes.length * breakpoints.length) {
    iteration++;
    console.warn(`[completeness] Iteration ${iteration}, ${verified.size}/${routes.length * breakpoints.length} verified`);
    
    for (const route of routes) {
      for (const bp of breakpoints) {
        const key = `${route}@${bp.width}`;
        if (verified.has(key)) continue;
        
        // 1. Screenshot
        const screenshot = await takeScreenshot(route, bp);
        
        // 2. Analyze with GPT-4o (Anthropic fallback)
        const analysis = await analyzeWithVision(screenshot);
        
        if (analysis.status === 'verified') {
          verified.add(key);
        } else {
          // 3. Implement fixes
          for (const issue of analysis.issues) {
            await implementFix(issue);
          }
          // Don't mark as verified — will re-check next iteration
        }
      }
    }
    
    // Safety: max 10 iterations to prevent infinite loops
    if (iteration >= 10) {
      console.warn('[completeness] Max iterations reached, stopping');
      break;
    }
  }
}
```

## Integration with Other Skills

| Skill | Relationship |
|-------|-------------|
| 07 Quality | Completeness verification is the FINAL gate after quality checks |
| 08 Deploy | Run completeness loop AFTER deploy, against production URL |
| 10 Design | Use design system tokens to validate visual consistency |
| 11 Motion | Verify animations are smooth, not janky or missing |
| 20 Accessibility | Verify axe-core passes + visual inspection of focus states |
| 28 SEO | Verify meta tags, structured data via Playwright assertions |
| 31 Error Pages | Verify error pages match brand, are not default browser errors |
| 48 Empty States | Verify empty states are shown, not blank screens |

## Anti-Patterns

- **DO NOT** skip breakpoints to save time
- **DO NOT** mark a page verified without actually sending the screenshot to GPT-4o
- **DO NOT** implement fixes without re-verifying
- **DO NOT** use GPT-4o for code generation (use Claude Code for that)
- **DO NOT** stop the loop because "it's probably fine"
- **DO NOT** use Anthropic as primary for vision (GPT-4o is required as primary)

## Cost Management

Each GPT-4o vision call costs ~$0.01-0.03 depending on image size.
- 20 routes x 6 breakpoints = 120 screenshots per iteration
- At $0.02/call = ~$2.40 per iteration
- Budget: max 10 iterations = $24 total
- This is a BARGAIN compared to shipping broken UI to production

## Trigger Conditions

Run the completeness loop when:
1. User says "verify", "inspect", "check everything", "is it done?"
2. After any prompt that says "complete" or "everything"
3. After deploy to production
4. After implementing a design change that affects multiple pages
5. When the user asks "are we done?"

## Output Format

After the loop completes, output a verification report:

```markdown
## Completeness Verification Report

**Iteration count**: N
**Routes inspected**: N/N
**Screenshots analyzed**: N
**Issues found**: N (N critical, N major, N minor, N cosmetic)
**Issues fixed**: N
**Remaining issues**: N

### Verified Routes
- [x] / (all 6 breakpoints)
- [x] /search (all 6 breakpoints)
- ...

### Remaining Issues (if any)
| Route | Breakpoint | Category | Severity | Description |
|-------|-----------|----------|----------|-------------|
```
