---
name: "CI/CD Pipeline"
version: "1.2.0"
updated: "2026-04-23"
description: "Workers Builds (native, preferred) + GitHub Actions fallback. Auto-deploy on main push, E2E on PR, branch previews, Lighthouse audit, auto-merge on passing PRs."
---

# CI/CD Pipeline
## Note on Usage
Brian deploys live from CLI (`npx wrangler deploy`). This pipeline exists for:
- Future contributors who use PRs
- Safety net: auto-test on push
- Branch previews for review
- Lighthouse tracking over time

## GitHub Actions Workflow
### `.github/workflows/deploy.yml`
```yaml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --max-warnings=0
      - run: npx prettier --check .
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Run E2E tests
        run: npx playwright test
        env:
          PROD_URL: ${{ secrets.PROD_URL }}

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Deploy to Cloudflare
        run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Purge Cache
        run: |
          curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${{ secrets.CF_ZONE_ID }}/purge_cache" \
            -H "Authorization: Bearer ${{ secrets.CLOUDFLARE_API_TOKEN }}" \
            --data '{"purge_everything":true}'

  lighthouse:
    needs: deploy
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: ${{ secrets.PROD_URL }}
          uploadArtifacts: true
```

## Required GitHub Secrets
```
CLOUDFLARE_API_TOKEN — Wrangler deploy token
CF_ZONE_ID — For cache purge
PROD_URL — https://domain.com
```

Set via: `gh secret set CLOUDFLARE_API_TOKEN --body "..."` or through GitHub UI.

## Branch Preview Deploys (Optional)
```yaml
  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Deploy Preview
        run: npx wrangler deploy --env preview
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '🚀 Preview deployed: https://preview.domain.com'
            });
```

## MCP Tools Available
### GitHub MCP (`mcp__github-mcp__*`)
| Tool | Purpose |
|------|---------|
| `mcp__github-mcp__list_pull_requests` | Check open PRs and their CI status |
| `mcp__github-mcp__pull_request_read` | Read PR details including check results |
| `mcp__github-mcp__create_pull_request` | Create PRs programmatically for feature branches |
| `mcp__github-mcp__merge_pull_request` | Auto-merge PRs that pass all checks |
| `mcp__github-mcp__add_issue_comment` | Comment CI results on PRs |
| `mcp__github-mcp__search_code` | Search for workflow files across repos |
| `mcp__github-mcp__create_or_update_file` | Create/update `.github/workflows/*.yml` files |
| `mcp__github-mcp__push_files` | Push workflow changes in a single commit |

### Playwright MCP (`mcp__playwright__*`) — for E2E in CI verification
| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to preview/production URL post-deploy |
| `mcp__playwright__browser_take_screenshot` | Screenshot pages for visual regression |
| `mcp__playwright__browser_snapshot` | Get accessibility tree for a11y checks |
| `mcp__playwright__browser_console_messages` | Check for JS errors on deployed pages |
| `mcp__playwright__browser_network_requests` | Verify API calls succeed (no 4xx/5xx) |

### Cloudflare MCP — for deployment verification
| Tool | Purpose |
|------|---------|
| `mcp__claude_ai_Cloudflare_Developer_Platform__workers_get_worker` | Verify Worker deployed successfully |
| `mcp__claude_ai_Cloudflare_Developer_Platform__workers_list` | List all Workers and their status |

## Deployment Verification Patterns
### Post-Deploy Smoke Test (run after `wrangler deploy` in CI)
```yaml
  verify:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - name: Wait for edge propagation
        run: sleep 5
      - name: Smoke test production
        run: |
          npx playwright test tests/smoke.spec.ts
        env:
          PROD_URL: ${{ secrets.PROD_URL }}
      - name: Check health endpoint
        run: |
          STATUS=$(curl -s -o /dev/null -w '%{http_code}' "${{ secrets.PROD_URL }}/health")
          if [ "$STATUS" != "200" ]; then
            echo "Health check failed with status $STATUS"
            exit 1
          fi
```

### PR Check Workflow (gate merges on quality)
```yaml
  pr-checks:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx vitest run --coverage
      - name: Playwright E2E
        run: npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

## Computer Use Integration
Use `mcp__computer-use__*` for debugging CI failures visually:

1. **GitHub Actions UI** — Screenshot the Actions tab to see failed job steps when log parsing is insufficient
2. **Preview deploy verification** — Open the preview URL and screenshot at multiple viewports to verify the deploy looks correct before merging
3. **Cloudflare dashboard** — Screenshot Workers & Pages dashboard to verify deployment status and error rates

## Acceptance Criteria
| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | CI runs on every push to main | GitHub Actions shows a workflow run for every main branch commit |
| 2 | CI runs on every PR | PRs show check status (pass/fail) before merge |
| 3 | TypeScript compilation passes | `npx tsc --noEmit` exits 0 in CI |
| 4 | E2E tests pass in CI | Playwright test job exits 0, report artifact uploaded |
| 5 | Deploy only happens on main push | Deploy job has correct `if` condition, no deploy on PRs |
| 6 | Lighthouse score tracked | Lighthouse CI job runs on main, scores uploaded as artifacts |
| 7 | Health endpoint verified post-deploy | Smoke test confirms `/health` returns 200 |
| 8 | Preview deploys comment on PR | PR has a bot comment with preview URL |
| 9 | Secrets configured | `gh secret list` shows CLOUDFLARE_API_TOKEN, CF_ZONE_ID, PROD_URL |
| 10 | Failed CI blocks merge | Branch protection requires CI to pass before merge is allowed |
