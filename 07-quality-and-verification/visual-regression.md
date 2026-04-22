---
name: "Visual Regression Testing"
description: "Pixel-level screenshot diffing with pixelmatch. Baseline capture → compare on next run → fail if diff exceeds threshold. Integrates with visual-qa agent and CI pipelines."
---

# Visual Regression Testing

## Core Tool
pixelmatch (npm) — lightweight, zero-dependency PNG diffing. ~150 lines, no native bindings. Input: two PNG buffers + options. Output: diff count + diff image.

## Baseline Workflow
```
1. Capture screenshots at 6 breakpoints (see visual-inspection-loop.md)
2. First run: save as baselines → screenshots/baselines/{route}_{breakpoint}.png
3. Subsequent runs: capture → compare against baselines → diff images
4. Review diffs → accept changes (update baselines) or fix regressions
```

## Implementation
```typescript
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

interface DiffResult {
  route: string;
  breakpoint: string;
  diffPixels: number;
  totalPixels: number;
  diffPercent: number;
  passed: boolean;
  diffImagePath?: string;
}

const THRESHOLD = 0.1; // pixelmatch color threshold (0-1, lower = stricter)
const MAX_DIFF_PERCENT = 0.5; // fail if >0.5% pixels differ

function compareScreenshots(
  baselinePath: string,
  currentPath: string,
  diffOutputPath: string,
): DiffResult {
  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const current = PNG.sync.read(readFileSync(currentPath));

  // Handle size mismatches — immediate fail
  if (baseline.width !== current.width || baseline.height !== current.height) {
    return {
      route: '', breakpoint: '', diffPixels: -1, totalPixels: -1,
      diffPercent: 100, passed: false,
    };
  }

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    baseline.data, current.data, diff.data,
    width, height,
    { threshold: THRESHOLD, includeAA: false },
  );

  writeFileSync(diffOutputPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffPercent = (diffPixels / totalPixels) * 100;

  return {
    route: '', breakpoint: '', diffPixels, totalPixels,
    diffPercent: Math.round(diffPercent * 100) / 100,
    passed: diffPercent <= MAX_DIFF_PERCENT,
    diffImagePath: diffOutputPath,
  };
}
```

## Playwright Integration
```typescript
// e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';
import { compareScreenshots, captureAllScreenshots, BREAKPOINTS } from '../utils/visual-regression';

const PROD_URL = process.env.PROD_URL!;
const BASELINE_DIR = 'screenshots/baselines';
const CURRENT_DIR = 'screenshots/current';
const DIFF_DIR = 'screenshots/diffs';
const UPDATE_BASELINES = process.env.UPDATE_BASELINES === 'true';

const ROUTES = ['/', '/about', '/contact', '/pricing'];

test.describe('Visual Regression', () => {
  test('All pages match baselines at all breakpoints', async ({ page }) => {
    const failures: string[] = [];

    for (const route of ROUTES) {
      await page.goto(`${PROD_URL}${route}`);
      await page.waitForLoadState('networkidle');

      for (const bp of BREAKPOINTS) {
        await page.setViewportSize({ width: bp.width, height: bp.height });
        await page.waitForTimeout(300);

        const name = `${route.replace(/\//g, '_') || '_index'}_${bp.name}`;
        const currentPath = `${CURRENT_DIR}/${name}.png`;
        const baselinePath = `${BASELINE_DIR}/${name}.png`;
        const diffPath = `${DIFF_DIR}/${name}_diff.png`;

        await page.screenshot({ path: currentPath, fullPage: true });

        if (UPDATE_BASELINES) {
          // Copy current to baseline
          const { copyFileSync } = await import('fs');
          copyFileSync(currentPath, baselinePath);
          continue;
        }

        if (!existsSync(baselinePath)) {
          failures.push(`Missing baseline: ${name}`);
          continue;
        }

        const result = compareScreenshots(baselinePath, currentPath, diffPath);
        if (!result.passed) {
          failures.push(`${name}: ${result.diffPercent}% diff (${result.diffPixels}px)`);
        }
      }
    }

    expect(failures, `Visual regressions:\n${failures.join('\n')}`).toEqual([]);
  });
});
```

## Threshold Configuration
```typescript
// Per-route thresholds for pages with dynamic content
const ROUTE_THRESHOLDS: Record<string, number> = {
  '/': 0.5,          // Homepage — tight
  '/blog': 2.0,      // Blog — dynamic content, looser
  '/dashboard': 3.0, // Dashboard — data changes
};

// Per-element ignore regions (mask dynamic areas)
const IGNORE_REGIONS: Record<string, Array<{ x: number; y: number; w: number; h: number }>> = {
  '/': [{ x: 0, y: 0, w: 300, h: 50 }], // Mask timestamp header
};
```

## Visual QA Agent Integration
visual-regression feeds into the visual-qa agent (07/visual-inspection-loop.md):
```
1. Run pixelmatch diff → any failures?
2. Yes → send diff images + current screenshots to GPT-4o Vision
3. AI classifies: intentional change | regression | flaky (animation/timing)
4. Intentional → auto-update baselines
5. Regression → generate fix suggestions
6. Flaky → increase threshold or add ignore region
```

## CI Integration (GitHub Actions)
```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression
on: [pull_request]
jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: bun install
      - run: bunx playwright install --with-deps chromium
      - run: bun run test:visual
        env:
          PROD_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-diffs
          path: screenshots/diffs/
          retention-days: 7
```

## Commands
```bash
# Capture new baselines
UPDATE_BASELINES=true bun run test:visual

# Run visual regression tests
bun run test:visual

# Compare specific route
ROUTES="/" bun run test:visual
```

## Anti-Patterns
Never: screenshot in headful mode (font rendering differs)|compare across OS (Linux vs macOS renders differ)|skip networkidle (loading spinners cause false diffs)|use exact match (threshold:0 catches subpixel antialiasing).
Always: run in Docker/CI for consistent rendering|mask dynamic regions (dates, avatars)|store baselines in git (LFS for large repos)|review diff images before accepting.
