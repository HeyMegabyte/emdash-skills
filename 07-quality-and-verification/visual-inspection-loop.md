---
name: "Visual Inspection Loop"
version: "3.0.0"
updated: "2026-05-12"
description: "Dual-vision protocol: Claude Vision (Sonnet 4.6 via Max 20x OAuth, FREE primary, fires everywhere) + GPT-4o Vision (METERED judge/arbiter, $0.50/build cap, hero/ATF + brand-fidelity + final pre-publish gate + disagreement arbitration). Screenshot → Tier 1 a11y tree+axe-core FREE → Tier 2 Claude Vision FREE → Tier 3 GPT-4o METERED. Three-round max."
related: completeness-verification.md (5-pass full-project), ui-completeness-sweep.md (pre-done placeholder detection), ~/.claude/rules/visual-inspection.md (canonical rule), ~/.claude/rules/auth-spawned-claude.md (Max 20x OAuth)
---

# Visual Inspection Loop (Dual-Vision)

## Canonical Rule
See `~/.claude/rules/visual-inspection.md` — supreme dual-vision doctrine. This skill implements that rule.

## Dual-Vision Stack
**Claude Vision (PRIMARY, FREE on Max 20x)**: Sonnet 4.6 image input via `~/.claude/.credentials.json` OAuth. Fires per-slice + per-section + per-route + per-iteration + 6bp. No marginal cost. Subject only to Max 20x 5hr/weekly rate windows.
**GPT-4o Vision (JUDGE, METERED, $0.50/build cap)**: Reserved for highest-value checkpoints — hero/ATF | brand-fidelity vs source | final pre-publish gate | arbitration when Claude Vision <8 OR Claude+a11y-tree disagree | most-critical user-facing surfaces.
**Consensus**: both ≥8/10 → ship | one <8 → fix → re-run | persistent disagreement → third pass (Computer-Use screenshot + checklist) | never override <8 with self-judgment.

## Cost-Risk Matrix (***BEFORE ANY GPT-4o CALL***)
Claude Vision: ZERO marginal cost. 6bp × N routes × every iteration — uncapped within Max 20x rate.
GPT-4o per-build cap: **$0.50 hard**. Allocation: ~$0.10 hero/ATF final | ~$0.15 brand-fidelity vs source | ~$0.10 final pre-publish 6bp homepage | ~$0.15 reserve for arbitration. Beyond cap → escalate to memory pin + ship with carryover, never silently overspend.
Cost-sensitive build (free-tier, paid-floor): Claude Vision ONLY, GPT-4o reserved for single final pre-publish call on homepage.
Brand-critical build (paying client, founder portfolio, flagship SaaS): full $0.50 GPT-4o budget + Claude Vision at every checkpoint.
Decision: code in `external_llm.ts` checks `site.pricing_tier` + `vision_budget_remaining_cents` before each GPT-4o call. Auto-degrade to Claude Vision when budget exhausted.

## Where Dual-Vision Fires
| Stage | Claude Vision | GPT-4o | Trigger |
|-------|---------------|--------|---------|
| Per-slice (skill 06) | YES (2bp: 375+1280) | NO | After slice deploys to preview |
| Per-section (skill 15) | YES (1bp: 1280) | NO | After section renders |
| Per-route 6bp (skill 15) | YES (6bp full) | NO (unless route=homepage) | After route assembles |
| Iteration diff (skill 15) | YES (compare prev+current screenshots) | NO | Progressive rebuild loop |
| Brand-fidelity vs source | YES (auxiliary) | **YES** (primary judge) | Once per build, hero/ATF |
| Hero/ATF final | YES | **YES** (judge) | Pre-publish gate |
| Final pre-publish homepage 6bp | YES (every route) | **YES** (homepage only) | Last gate before mark-published |
| Disagreement arbitration | — | **YES** (tiebreaker) | When Claude <8 or Claude+a11y disagree |

## Tier-1 → Tier-2 → Tier-3 Order (***ALWAYS THIS ORDER***)
1. **Tier 1 (FREE, FAST)**: Playwright a11y tree 6bp + axe-core scan + DOM-walker contrast (computed-bg ancestry) + computed-style overflow check. Catches ~80% of issues with zero token spend. Run FIRST every time.
2. **Tier 2 (FREE on Max 20x)**: Claude Vision on screenshots Tier 1 cannot resolve — aesthetics, brand match, hierarchy, motion presence, hero impact, "does it feel cinematic?".
3. **Tier 3 (METERED, CAPPED)**: GPT-4o on critical checkpoints + arbitration. Reserve budget for what Tier 1+2 cannot resolve.

## Loop (3-round max, $0.50 GPT-4o cap)
```
1. Deploy to production/staging
2. Tier 1 — Playwright a11y tree + axe-core + DOM-walker (FREE) ALL pages 6bp
3. Fix functional/a11y/contrast issues from step 2
4. Tier 2 — Claude Vision on ALL pages 6bp (FREE) — score+evidence per breakpoint
5. Fix issues scoring <8 from Claude Vision
6. Re-deploy + purge
7. Round 2: repeat Tier 1 → Tier 2 to verify fixes
8. Round 3 (if still <8): Tier 3 — GPT-4o arbiter on remaining surfaces + final pre-publish call
9. After round 3: report carryover to _iteration_log.json, ship (progressive rebuild catches next iteration)
```
Per round budget check: track GPT-4o spend in cents. When `vision_budget_remaining_cents < 10` → skip GPT-4o, ship with Claude Vision verdict.

## Screenshot Capture Template (Dual-Vision)
```typescript
const ALL_BREAKPOINTS = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'iPhone-14', width: 390, height: 844 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad-Landscape', width: 1024, height: 768 },
  { name: 'Laptop', width: 1280, height: 720 },
  { name: 'Desktop', width: 1920, height: 1080 },
];
// Claude Vision (FREE) — every breakpoint
const CLAUDE_VISION_BREAKPOINTS = ALL_BREAKPOINTS;
// GPT-4o (METERED) — homepage only at final gate
const GPT4O_BREAKPOINTS = ALL_BREAKPOINTS;
// GPT-4o brand-fidelity — single ATF screenshot
const BRAND_FIDELITY_BP = [{ name: 'ATF', width: 1280, height: 720 }];

async function captureAllScreenshots(page: Page, pages: string[], outputDir: string) {
  for (const route of pages) {
    await page.goto(`${PROD_URL}${route}`);
    await page.waitForLoadState('networkidle');
    for (const bp of ALL_BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${outputDir}/${route.replace(/\//g, '_')}_${bp.name}.png`,
        fullPage: true,
      });
    }
  }
}
```

## Claude Vision Call (PRIMARY — FREE on Max 20x)
Uses Anthropic Messages API with image content blocks. Auth via OAuth token (`~/.claude/.credentials.json.claudeAiOauth.accessToken`), NOT API key.
```typescript
async function claudeVisionCritique(screenshotPath: string, context: { route: string; breakpoint: string; brand?: BrandJson }): Promise<DualVisionResult> {
  const imageData = fs.readFileSync(screenshotPath, { encoding: 'base64' });
  const oauthToken = JSON.parse(fs.readFileSync(`${os.homedir()}/.claude/.credentials.json`, 'utf8')).claudeAiOauth.accessToken;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${oauthToken}`,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'oauth-2025-04-20',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      temperature: 0,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: imageData } },
          { type: 'text', text: DUAL_VISION_CRITIQUE_PROMPT(context) },
        ],
      }],
    }),
  });
  return JSON.parse((await response.json()).content[0].text);
}
```
Fallback (if OAuth refresh fails OR running outside Max 20x): `claude-sonnet-4-6` via API key — log `auth_mode=api-key` to D1 audit, alert.

## GPT-4o Vision Call (JUDGE — METERED, $0.50 cap)
```typescript
async function gpt4oVisionJudge(screenshotPath: string, context: { route: string; breakpoint: string; brand?: BrandJson; sourceScreenshot?: string }, budgetCents: number): Promise<DualVisionResult | null> {
  if (budgetCents < 10) return null; // skip, budget exhausted
  const imageData = fs.readFileSync(screenshotPath, { encoding: 'base64' });
  const sourceData = context.sourceScreenshot ? fs.readFileSync(context.sourceScreenshot, { encoding: 'base64' }) : null;
  const content: any[] = [{ type: 'text', text: DUAL_VISION_JUDGE_PROMPT(context) }];
  content.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${imageData}`, detail: 'high' } });
  if (sourceData) content.push({ type: 'image_url', image_url: { url: `data:image/png;base64,${sourceData}`, detail: 'high' } });
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${await getSecret('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content }],
      response_format: { type: 'json_object' },
      temperature: 0,
    }),
  });
  const r = await response.json();
  const costCents = Math.ceil(((r.usage?.prompt_tokens || 0) * 0.00025 + (r.usage?.completion_tokens || 0) * 0.001) / 10);
  await logVisionCall({ provider: 'gpt-4o', auth_mode: 'api-key', cost_cents: costCents, route: context.route, breakpoint: context.breakpoint });
  return JSON.parse(r.choices[0].message.content);
}
```

## DualVisionResult Schema
```typescript
interface DualVisionResult {
  score: number;                                   // 0-10 overall
  cinematic_floor: number;                         // 0-10 — see visual-qa agent doctrine
  latest_tech_flex: number;                        // 0-10 — advanced browser APIs visible
  brand_fidelity: number;                          // 0-10 — colors/type/logo match source
  hero_impact: number;                             // 0-10 — ATF wow factor
  issues: Array<{
    severity: 'critical' | 'major' | 'minor';
    category: 'layout' | 'brand' | 'hierarchy' | 'typography' | 'contrast' | 'motion' | 'a11y' | 'overflow' | 'image';
    breakpoint: '375' | '390' | '768' | '1024' | '1280' | '1920';
    selector: string | null;
    evidence: string;                              // MANDATORY — anti-hallucination
    fix_suggestion: string;
  }>;
  strengths: string[];
  provider: 'claude-vision' | 'gpt-4o';
  cost_cents: number;
}
```

## Consensus & Arbitration
```typescript
async function dualVisionGate(screenshot: string, ctx: VisionCtx, budget: BudgetState): Promise<{ pass: boolean; remediation: Issue[] }> {
  const claudeResult = await claudeVisionCritique(screenshot, ctx);
  // Default: Claude Vision verdict is enough
  if (claudeResult.score >= 8 && ctx.tier !== 'final-gate' && ctx.tier !== 'brand-fidelity' && ctx.tier !== 'hero-atf') {
    return { pass: true, remediation: [] };
  }
  // Critical checkpoint OR Claude flagged issues → invoke GPT-4o judge
  const gpt4oResult = budget.remainingCents >= 10 ? await gpt4oVisionJudge(screenshot, ctx, budget.remainingCents) : null;
  if (!gpt4oResult) {
    return { pass: claudeResult.score >= 8, remediation: claudeResult.issues.filter(i => i.severity !== 'minor') };
  }
  budget.remainingCents -= gpt4oResult.cost_cents;
  // Both ≥ 8 → ship
  if (claudeResult.score >= 8 && gpt4oResult.score >= 8) return { pass: true, remediation: [] };
  // Either < 8 → fail+remediate (merge issues)
  const merged = [...claudeResult.issues, ...gpt4oResult.issues];
  return { pass: false, remediation: dedupeIssues(merged) };
}
```

## Vision Prompt Template (Dual-Vision)
```
You are a senior visual QA engineer auditing this screenshot of route {{route}} at breakpoint {{breakpoint}} for site {{brand.name}}.

Brand: primary={{brand.colors.primary}}, accent={{brand.colors.accent}}, font_pair={{brand.typography.headlinePair}}.
{{#if sourceScreenshot}}Source site reference attached — score brand_fidelity by comparing rendered vs source: colors, type pairing, logo placement, image treatment.{{/if}}

Score 0-10 on each:
- score (overall)
- cinematic_floor (HBO opening / Vimeo Staff Picks energy — motion above the fold, narrative beats)
- latest_tech_flex (advanced browser APIs visible — View Transitions, scroll-driven, OKLCH, :has(), container queries, anchor positioning, popover)
- brand_fidelity (colors/typography/logo match source)
- hero_impact (ATF wow factor — would a CMO say "ship it"?)

For each issue you find, include MANDATORY evidence field (selector + breakpoint + visible defect description — no claim without evidence).

Return JSON: { score, cinematic_floor, latest_tech_flex, brand_fidelity, hero_impact, issues: [...], strengths: [...] }
```

## Dual-Strategy Coverage
AI vision: layout, brand, hierarchy, aesthetics, motion, cinematic feel (~57% a11y signal). axe-core + Playwright a11y tree: ARIA, screen reader, focus, keyboard (43% a11y signal). Never vision alone for WCAG 2.2 AA — always pair.

## When Vision vs Accessibility Tree
| Check | Claude Vision | GPT-4o | a11y Tree |
|-------|---------------|--------|-----------|
| Does it look good? | YES (free) | YES (judge) | NO |
| Layout broken? | YES (free) | YES (judge) | NO |
| Color on-brand? | YES (free) | YES (final) | NO |
| Brand-fidelity vs source? | YES (auxiliary) | YES (primary) | NO |
| Hero ATF impact? | YES (every iter) | YES (final) | NO |
| Visual hierarchy? | YES (every iter) | YES (final) | NO |
| Cinematic floor (motion)? | YES (every iter) | YES (final) | NO |
| Latest tech flex? | YES (every iter) | YES (final) | NO |
| Button works? | NO | NO | YES (Stagehand) |
| Screen reader usable? | NO | NO | YES (axe-core) |
| Form submits? | NO | NO | YES (Stagehand) |
| Apple-approved aesthetics? | YES (free, gate) | YES (final judge) | NO |

**Use ALL.** Tier 1 a11y tree (free, fast) → Tier 2 Claude Vision (free on Max 20x, every iter) → Tier 3 GPT-4o (metered, capped, judge).

## Auth Path
Container/spawned-CLI Claude Vision: Max 20x OAuth (NEVER API key — see auth-spawned-claude.md). Log `auth_mode` to D1 every call. API-key fallback alert.
GPT-4o: always API key (`OPENAI_API_KEY`). Log `cost_cents` per call.

## Reference Incidents
2026-05-09 LMG brand-fidelity regression — code review said OK, vision DIFF vs prior build caught regression. Lesson: iteration diff vision is mandatory.
2026-05-10 LMG white-on-white footer — token check passed, DOM-walker failed. Lesson: computed-DOM-walker + vision catches what static can't.
2026-05-12 cost discovery — container uses Max 20x OAuth, Claude Vision FREE. Doctrine: use it everywhere.
