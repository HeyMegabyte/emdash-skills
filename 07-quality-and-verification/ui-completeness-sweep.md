---
name: "UI Completeness Sweep"
description: "Playwright + GPT-4o vision sweep that finds incomplete UI: disabled buttons, empty states, Coming soon, placeholder images, broken links, unfinished forms, missing error states. Runs BEFORE declaring done. Blocks completion until zero findings."
updated: "2026-04-23"
related: visual-inspection-loop.md (3-round per-page vision), completeness-verification.md (5-pass full-project)
---

# UI Completeness Sweep (***MANDATORY BEFORE DONE***)

## Why This Exists
AI builds 90% of a feature then declares done. The last 10% — empty states, error handling, loading skeletons, disabled buttons, placeholder text — is what users actually see. This sweep catches everything the AI skipped.

## The Sweep (Playwright + GPT-4o)

### Phase 1: Static Code Scan (fast, catches obvious)
```bash
# Run BEFORE visual sweep — catches what's in the code but not rendered
grep -rn --include="*.ts" --include="*.tsx" --include="*.html" --include="*.js" \
  -iE "coming soon|todo|fixme|placeholder|lorem|not implemented|stub|mock data|fake|dummy|sample|example\.com|TBD|WIP|hack|temp|untitled" \
  src/ | grep -v node_modules | grep -v ".spec." | grep -v ".test."
```
ANY match = not done. Fix every one.

### Phase 2: Playwright Interactive Sweep
```typescript
// Navigate every route as a real user would
// For EACH page:

// 1. Screenshot full page (all 6 breakpoints)
// 2. Find all buttons — click each one, verify something happens
for (const btn of await page.locator('button, [role="button"], a.btn').all()) {
  const text = await btn.textContent();
  const disabled = await btn.getAttribute('disabled');
  const ariaDisabled = await btn.getAttribute('aria-disabled');
  if (disabled || ariaDisabled) findings.push(`Disabled button: "${text}" — needs implementation or removal`);
  if (!disabled) {
    await btn.click({ timeout: 3000 }).catch(() => 
      findings.push(`Button "${text}" — click does nothing or errors`)
    );
  }
}

// 3. Find all forms — submit with valid AND invalid data
for (const form of await page.locator('form').all()) {
  // Submit empty → verify error messages appear
  // Submit valid → verify success state
  // Check: are all inputs labeled? Do errors clear on correction?
}

// 4. Find all links — verify none are dead
for (const link of await page.locator('a[href]').all()) {
  const href = await link.getAttribute('href');
  if (href && !href.startsWith('#') && !href.startsWith('javascript')) {
    const resp = await page.request.get(href).catch(() => null);
    if (!resp || resp.status() >= 400) findings.push(`Dead link: ${href}`);
  }
}

// 5. Find all images — verify none are broken or placeholder
for (const img of await page.locator('img').all()) {
  const src = await img.getAttribute('src');
  const alt = await img.getAttribute('alt');
  const natural = await img.evaluate(el => el.naturalWidth);
  if (!natural || natural === 0) findings.push(`Broken image: ${src}`);
  if (!alt) findings.push(`Missing alt text: ${src}`);
  if (src?.includes('placeholder') || src?.includes('via.placeholder')) 
    findings.push(`Placeholder image: ${src}`);
}

// 6. Check empty states — render pages with no data
// Clear localStorage, delete test data, navigate — what does the user see?
// If blank/broken → needs empty state design

// 7. Check loading states — throttle network, navigate
// await page.route('**/*', route => setTimeout(() => route.continue(), 3000));
// Screenshot during load — is there a skeleton/spinner or just blank?

// 8. Check error states — trigger failures
// Block API responses, submit bad data, revoke auth
// Does the UI handle it gracefully or crash?
```

### Phase 3: GPT-4o Vision Analysis
```
For each screenshot, ask GPT-4o:
"You are a QA engineer reviewing a deployed SaaS product. 
Look at this screenshot and identify:
1. Any UI element that looks unfinished, placeholder, or broken
2. Any button/link that appears non-functional (grayed out, no hover state)
3. Any section that looks empty or missing content
4. Any text that says Coming Soon, TODO, placeholder, sample, example
5. Any image that looks like a stock placeholder or is broken
6. Any form that appears incomplete (missing labels, no validation)
7. Any layout that breaks at this viewport width
8. Any element that a user would perceive as unfinished

Rate completeness 0-10. List every finding with exact location.
10 = ship it. Below 8 = not done."
```

### Phase 4: Fix Loop
```
findings = sweep()
while findings.length > 0 AND round < 5:
  for finding in findings:
    implement_fix(finding)
  deploy()
  findings = sweep()  // re-run the entire sweep
  round++
```

## What Specifically to Catch
| Pattern | Where | Fix |
|---------|-------|-----|
| Disabled buttons | UI | Implement the handler or remove the button |
| "Coming soon" text | Anywhere | Build the feature or remove the section |
| Empty arrays rendering blank | Lists, tables, feeds | Add empty state with CTA |
| Forms with no validation | Any form | Add Zod validation + error messages |
| Links to # or javascript:void | Nav, buttons | Wire to real routes |
| Console errors | Any page | Fix every error, zero tolerance |
| Missing loading states | Data-fetching pages | Add skeleton/spinner |
| Missing error boundaries | Every page | Add error UI with retry |
| 404 on internal routes | Navigation | Fix routing or remove link |
| Placeholder images | Hero, cards, avatars | Generate real images (Ideogram/Pexels/Unsplash) |
| Truncated text/overflow | Mobile breakpoints | Fix CSS, add text-overflow |
| Missing favicon | Browser tab | Generate and add via Ideogram |
| Missing OG image | Social sharing | Generate 1200x630 preview image |

## Integration Points
- completeness-checker agent runs this sweep
- visual-qa agent runs the GPT-4o analysis
- deploy-verifier agent runs post-deploy checks
- The orchestrator MUST run this before declaring any build task complete
- The Stop hook SHOULD verify this ran (check for sweep results in audit log)
