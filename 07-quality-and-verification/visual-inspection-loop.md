---
name: "Visual Inspection Loop"
description: "Screenshot → AI Critique → Fix → Re-Screenshot → Verify loop. Mandatory on every deploy. Covers AI critique protocol, GPT-4o vision integration, Stagehand browser testing, and vision-vs-accessibility-tree decision matrix."
---

# Visual Inspection Loop

> **Purpose**: Every deployment triggers a screenshot → AI critique → fix → re-screenshot loop until the AI has zero remaining critiques.

## The Loop: Screenshot → AI Critique → Fix → Re-Screenshot → Verify

Every deployment triggers this loop until the AI has zero remaining critiques:

```
1. Deploy to production
2. Take Playwright screenshots at all 6 breakpoints
3. AI reads each screenshot (using Read tool on the image file)
4. AI critiques: layout, typography, spacing, color, broken elements, alignment
5. If issues found → fix them → re-deploy → goto step 2
6. If no issues → proceed to TDD verification
```

## Screenshot Capture Template
```typescript
const BREAKPOINTS = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'iPhone-14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad-Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

// Capture ALL pages at ALL breakpoints
async function captureAllScreenshots(page: Page, pages: string[], outputDir: string) {
  for (const route of pages) {
    await page.goto(`${PROD_URL}${route}`);
    await page.waitForLoadState('networkidle');
    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(300); // Let animations settle
      await page.screenshot({
        path: `${outputDir}/${route.replace(/\//g, '_')}_${bp.name}.png`,
        fullPage: true,
      });
    }
  }
}
```

## AI Critique Protocol

For each screenshot, the AI inspects for:

### Layout Issues
- Horizontal overflow (elements wider than viewport)
- Overlapping text or elements
- Broken grid alignment
- Footer not at page bottom
- Content cut off at viewport edges
- Uneven spacing between sections

### Typography Issues
- Text too small to read (< 14px on mobile)
- Line length too long (> 75 characters)
- Poor contrast (text blending with background)
- Inconsistent font usage
- Orphaned words or widows in headings

### Visual Quality
- Broken or missing images
- Blurry or pixelated images
- Inconsistent padding/margins
- Missing hover/focus states (check interactive elements)
- Brand color inconsistency
- Generic/AI-slop appearance

### Functional Issues
- Missing navigation elements
- Missing footer
- Missing CTA buttons
- Forms without labels
- Buttons without visible text

## AI Browser Interaction Testing (Stagehand)

For AI-driven browser interaction testing, use Stagehand (22K+ stars, browserbase/stagehand) alongside Playwright MCP. Stagehand adds three AI primitives -- `act()`, `extract()`, `observe()` -- on top of a standard Playwright page object. It uses accessibility trees (not screenshots) for 10-100x faster, 4x cheaper testing than vision-based approaches. Use Playwright for the 80% of predictable steps and Stagehand for the 20% requiring AI understanding (dynamic content, layout changes, natural-language assertions).

## Critique → Fix → Verify Cycle
```
MAX_CRITIQUE_ROUNDS = 3

for round in 1..MAX_CRITIQUE_ROUNDS:
  screenshots = capture_all_screenshots()
  critiques = ai_inspect_each_screenshot(screenshots)

  if critiques.length == 0:
    break  # Perfect — move on

  for critique in critiques:
    implement_fix(critique)

  deploy()
  purge_cache()

# After 3 rounds, report remaining issues but don't block
```

---

## AI Visual Critique via GPT-4o Vision

For design critique beyond layout checking, use GPT-4o Vision to evaluate screenshots with a structured prompt:

### Visual Critique Prompt Template
```
Analyze this website screenshot. Score 1-10 on each:

1. VISUAL HIERARCHY: Is the most important element immediately obvious?
2. TYPOGRAPHY: Is text readable, consistent, and well-spaced?
3. COLOR HARMONY: Do colors work together and match the brand?
4. SPACING RHYTHM: Is whitespace consistent and intentional?
5. INTERACTION SIGNALS: Can you tell what's clickable?
6. MOBILE READINESS: Would this work on a phone?
7. TRUST SIGNALS: Does this feel professional and trustworthy?
8. ANTI-SLOP: Does this look AI-generated or human-crafted?

For any score below 8, provide a specific CSS fix.
Return as JSON: { scores: { ... }, fixes: [ { issue, css } ] }
```

### Integration Pattern
```typescript
async function aiVisualCritique(screenshotPath: string): Promise<CritiqueResult> {
  const imageData = fs.readFileSync(screenshotPath, { encoding: 'base64' });
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getSecret('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: VISUAL_CRITIQUE_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${imageData}` } },
        ],
      }],
      response_format: { type: 'json_object' },
    }),
  });
  return response.json();
}
```

### When to Use Vision vs Accessibility Tree
| Check | Use Vision (GPT-4o) | Use Accessibility Tree (Stagehand/MCP) |
|-------|---------------------|---------------------------------------|
| Does it look good? | Yes | No |
| Is the layout broken? | Yes | No |
| Does the button work? | No | Yes |
| Is the color on-brand? | Yes | No |
| Can a screen reader use it? | No | Yes |
| Is there visual hierarchy? | Yes | No |
| Does the form submit? | No | Yes |
| Would Apple approve this? | Yes | No |

**Use both.** Stagehand for functional verification (fast, cheap). GPT-4o Vision for aesthetic critique (slower, costs ~$0.01/screenshot).
