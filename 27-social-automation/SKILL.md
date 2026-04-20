---
name: "Social Automation"
description: "Auto-post to social media via Postiz (self-hosted on Coolify) when significant updates are deployed. Supports X/Twitter, LinkedIn, Reddit, GitHub, Threads, Facebook, TikTok, Pinterest, and more. Generates platform-specific copy in Brian's voice, includes OG images, verifies posts rendered correctly via Playwright."
layer: "capability-pack"
canonical-owner-of:
  - "social-media-automation"
  - "postiz-integration"
  - "platform-specific-copy"
---

# Social Automation via Postiz

## Postiz Instance
URL: https://postiz.megabyte.space
Connected platforms: X/Twitter, LinkedIn, Reddit, GitHub, Threads, Facebook,
TikTok, Pinterest, Dribbble, Discord, Slack, Mastodon, Telegram, Beehiiv

## When to Auto-Post
- New product launch (first deploy of a domain)
- Major feature additions (new sections, new integrations)
- Milestone achievements (donation goals met, impact numbers)
- NOT for: bug fixes, style tweaks, skill updates, internal changes

## Post Generation
1. Summarize the change in 1-2 sentences (Brian's voice: sharp, punchy)
2. Include the site URL
3. Include the OG image URL for visual preview
4. Add relevant hashtags (max 5)
5. Customize per platform:
   - X/Twitter: 280 chars max, punchy, 2-3 hashtags
   - LinkedIn: professional tone, 1-2 paragraphs, link in body
   - Reddit: subreddit-appropriate title, link post
   - Facebook: casual, include image, tag @HeyMegabyte

## Postiz API
```bash
# Create a post
curl -X POST "https://postiz.megabyte.space/api/posts" \
  -H "Authorization: Bearer POSTIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Post text here",
    "platforms": ["twitter", "linkedin"],
    "media": ["https://domain.com/og-image.png"],
    "schedule": "now"
  }'
```

## Quality Verification
After posting, verify the post rendered correctly:
1. Get the public share URL from the Postiz API response
2. Use Playwright to screenshot the share URL
3. Visual inspection: verify image loaded, text not truncated, link works
4. If issues found: debug, fix, repost

## Iterative Improvement
Track which posts get engagement. Over time:
- Which platforms drive the most traffic?
- Which post formats get the most engagement?
- What time of day performs best?
Log this in PostHog for analysis.

## Coolify Access
Postiz runs on Coolify. If the API is down:
1. Check Coolify status: curl coolify.megabyte.space/api/v1/services
2. Restart the service if needed via Coolify API
3. Log the outage for future reference

---

## MCP Tools Available

### Postiz MCP (`mcp__postiz__*`)
| Tool | Purpose |
|------|---------|
| `mcp__postiz__integrationSchedulePostTool` | Schedule a post to connected platforms with date/time |
| `mcp__postiz__integrationList` | List all connected platform integrations |
| `mcp__postiz__integrationSchema` | Get schema for a specific integration (required fields, limits) |
| `mcp__postiz__generateImageTool` | Generate social preview images with AI |
| `mcp__postiz__generateVideoTool` | Generate short video clips for social |
| `mcp__postiz__generateVideoOptions` | Get available video generation options |
| `mcp__postiz__videoFunctionTool` | Execute video processing functions |
| `mcp__postiz__triggerTool` | Trigger immediate post (bypass scheduling) |
| `mcp__postiz__ask_postiz` | Ask Postiz AI for post copy suggestions |

### Coolify MCP (`mcp__coolify__*`) — for Postiz service health
| Tool | Purpose |
|------|---------|
| `mcp__coolify__diagnose_app` | Diagnose Postiz service health |
| `mcp__coolify__get_service` | Get Postiz service details |
| `mcp__coolify__control` | Restart Postiz if it's down |

### PostHog MCP (`mcp__posthog__*`) — for engagement tracking
| Tool | Purpose |
|------|---------|
| `mcp__posthog__authenticate` | Connect to PostHog for social analytics |

## Posting Workflows

### Launch Day Social Sequence
When a new site launches, execute this sequence:
1. **T+0 min** — Post to X/Twitter (highest immediacy audience)
2. **T+15 min** — Post to LinkedIn (professional framing)
3. **T+30 min** — Post to Reddit (relevant subreddit, link post)
4. **T+1 hr** — Post to Facebook, Threads (broader reach)
5. **T+2 hr** — Post to Discord, Slack channels

```typescript
// Example: Schedule the full launch sequence
const platforms = ['twitter', 'linkedin', 'reddit', 'facebook', 'threads'];
const delays = [0, 15, 30, 60, 120]; // minutes

for (let i = 0; i < platforms.length; i++) {
  const scheduleTime = new Date(Date.now() + delays[i] * 60000);
  // Use mcp__postiz__integrationSchedulePostTool with platform + scheduleTime
}
```

### Social Preview Image Generation
Before posting, generate an OG-quality social image:
1. Call `mcp__postiz__generateImageTool` with site title + tagline
2. If custom image exists (OG image from site), use that instead
3. Verify image dimensions: 1200x630 for OG, 1080x1080 for Instagram/Threads
4. Fallback: screenshot the hero section via Playwright at 1200x630

## Computer Use Integration

Use `mcp__computer-use__*` tools for visual verification of posted content:

1. **Post verification** — After scheduling via MCP, open the platform in browser and screenshot to confirm the post rendered with correct image, text, and link
2. **Engagement monitoring** — Screenshot Postiz dashboard at `https://postiz.megabyte.space` to check engagement metrics after 24 hours
3. **Platform-specific debugging** — If a post looks wrong on a specific platform, screenshot the live post to diagnose formatting issues

```
Workflow: Post → Wait 60s → Screenshot platform → AI visual check → Flag issues
```

## Acceptance Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | Post reaches all specified platforms | `mcp__postiz__integrationList` confirms connected, API returns 200 per platform |
| 2 | OG image renders correctly | Playwright screenshot of share URL shows image loaded (not broken/missing) |
| 3 | Text not truncated | Post text is within platform character limits (280 X, 3000 LinkedIn, 300 Reddit title) |
| 4 | Link is clickable and resolves | Fetch the URL in the post body, confirm 200 response |
| 5 | Hashtags present and relevant | 2-5 hashtags per post, no banned/spam tags |
| 6 | Launch sequence timing correct | Posts staggered per the launch day sequence (not all simultaneous) |
| 7 | No duplicate posts | Check Postiz post history — no identical content within 24 hours |
| 8 | PostHog event tracked | `social_post_published` event fires with platform + URL properties |
