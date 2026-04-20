---
name: "User Feedback Collection"
description: "In-app feedback widget: 5-star rating + text comment, stored in D1, reviewed at /admin/feedback. NPS survey at day 7 and day 30 via PostHog. Testimonial collection at /feedback for moderated display. Tracks satisfaction trends over time."---

# User Feedback Collection

> Listen to users. Measure satisfaction. Display the best as social proof.

---

## Feedback Widget (In-App)

### HTML
```html
<button id="feedbackBtn" class="feedback-trigger" aria-label="Give feedback">
  💬
</button>
<div id="feedbackModal" class="feedback-modal" hidden>
  <form id="feedbackForm">
    <h3>How's your experience?</h3>
    <div class="rating" role="radiogroup" aria-label="Rating">
      ${[1,2,3,4,5].map(n => `
        <button type="button" class="star" data-value="${n}" aria-label="${n} stars">
          ${'★'.repeat(n)}${'☆'.repeat(5-n)}
        </button>
      `).join('')}
    </div>
    <textarea name="comment" placeholder="Tell us more (optional)" rows="3" maxlength="1000"></textarea>
    <button type="submit">Send Feedback</button>
  </form>
</div>
```

### Backend
```typescript
const FeedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  page: z.string().optional(),
});

app.post('/api/feedback', async (c) => {
  const body = await c.req.json();
  const parsed = FeedbackSchema.parse(body);

  await c.env.DB.prepare(
    'INSERT INTO feedback (id, rating, comment, page, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(ulid(), parsed.rating, parsed.comment || null, parsed.page || c.req.header('referer'), new Date().toISOString()).run();

  posthog.capture('feedback_submitted', { rating: parsed.rating });
  return c.json({ success: true });
});
```

### D1 Schema
```sql
CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  page TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TEXT NOT NULL
);
```

## NPS Survey (PostHog)

### Day 7 + Day 30 Surveys
```javascript
// Trigger via PostHog surveys feature
posthog.init('PROJECT_KEY', {
  api_host: 'https://posthog.megabyte.space',
  surveys: true, // Enable surveys
});
```

Set up in PostHog dashboard:
- **Day 7 survey:** "How likely are you to recommend [Product]? (0-10)"
- **Day 30 survey:** Same question + "What could we improve?"
- Target: users who signed up 7/30 days ago

### NPS Scoring
- 9-10: Promoter
- 7-8: Passive
- 0-6: Detractor
- **NPS = % Promoters - % Detractors** (target: > 30)

## Testimonial Collection (/feedback)

Public-facing page for collecting testimonials:

```typescript
app.get('/feedback', (c) => c.html(renderFeedbackPage()));

app.post('/api/testimonial', async (c) => {
  const body = await c.req.json();
  const parsed = z.object({
    name: z.string().min(1).max(100),
    role: z.string().max(100).optional(),
    quote: z.string().min(10).max(500),
    rating: z.number().min(1).max(5),
  }).parse(body);

  await c.env.DB.prepare(
    'INSERT INTO testimonials (id, name, role, quote, rating, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(ulid(), parsed.name, parsed.role, parsed.quote, parsed.rating, 'pending', new Date().toISOString()).run();

  return c.json({ success: true, message: 'Thanks! Your testimonial will be reviewed.' });
});
```

**Moderation:** testimonials are `pending` until manually approved. Display approved ones on the homepage as social proof (skill 09).

## Admin View (/admin/feedback)
Simple table showing all feedback with approve/reject buttons.
Protected by auth or basic admin password.

---

## MCP Tools Available

### Notion MCP (`mcp__notion__*`) — for feedback storage and triage
| Tool | Purpose |
|------|---------|
| `mcp__notion__API-post-page` | Create a feedback entry in Notion database |
| `mcp__notion__API-query-data-source` | Query feedback database with filters (rating, status, date) |
| `mcp__notion__API-patch-page` | Update feedback status (pending → reviewed → actioned) |
| `mcp__notion__API-post-search` | Search feedback by keyword |
| `mcp__notion__API-retrieve-a-database` | Get feedback database schema |
| `mcp__notion__API-create-a-comment` | Add internal notes to feedback entries |

### Notion Feedback Database Schema
```
Database: "User Feedback"
Properties:
  - Rating (Number, 1-5)
  - Comment (Rich Text)
  - Page URL (URL)
  - Status (Select: Pending, Reviewed, Actioned, Dismissed)
  - Source (Select: Widget, NPS, Testimonial, Email)
  - User Email (Email, optional)
  - Created (Created Time)
  - Priority (Select: Low, Medium, High, Critical)
```

### PostHog MCP (`mcp__posthog__*`) — for feedback analytics
| Tool | Purpose |
|------|---------|
| `mcp__posthog__authenticate` | Connect to PostHog instance |

PostHog integration points:
- Track `feedback_submitted` event with rating + page properties
- Track `nps_response` event with score + segment (promoter/passive/detractor)
- Track `testimonial_submitted` event
- Create PostHog insight: "Average Rating Over Time" (line chart, weekly)
- Create PostHog insight: "NPS Score Trend" (line chart, monthly)
- Feature flag: `show_feedback_widget` — control which pages show the widget

### Playwright MCP (`mcp__playwright__*`) — for widget testing
| Tool | Purpose |
|------|---------|
| `mcp__playwright__browser_navigate` | Navigate to page with feedback widget |
| `mcp__playwright__browser_click` | Open feedback modal, click stars, submit |
| `mcp__playwright__browser_take_screenshot` | Screenshot widget at each state (closed, open, submitted) |
| `mcp__playwright__browser_snapshot` | Verify ARIA roles on rating component |

## Feedback Widget Implementation Details

### Angular Component (Standalone)
```typescript
@Component({
  selector: 'app-feedback-widget',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <button (click)="isOpen.set(true)" class="feedback-trigger"
            aria-label="Give feedback" data-testid="feedback-trigger">
      <span aria-hidden="true">💬</span>
    </button>
    @if (isOpen()) {
      <div class="feedback-modal" role="dialog" aria-label="Feedback form"
           data-testid="feedback-modal">
        <form [formGroup]="form" (ngSubmit)="submit()">
          <h3>How's your experience?</h3>
          <div role="radiogroup" aria-label="Rating">
            @for (n of [1,2,3,4,5]; track n) {
              <button type="button" [attr.aria-label]="n + ' stars'"
                      [class.active]="form.get('rating')?.value === n"
                      (click)="form.patchValue({ rating: n })"
                      data-testid="star-{{n}}">
                {{ n <= (form.get('rating')?.value || 0) ? '★' : '☆' }}
              </button>
            }
          </div>
          <textarea formControlName="comment" placeholder="Tell us more (optional)"
                    rows="3" maxlength="1000" data-testid="feedback-comment"></textarea>
          <button type="submit" [disabled]="!form.get('rating')?.value"
                  data-testid="feedback-submit">Send Feedback</button>
        </form>
      </div>
    }
  `
})
export class FeedbackWidgetComponent {
  isOpen = signal(false);
  form = new FormGroup({
    rating: new FormControl<number | null>(null),
    comment: new FormControl(''),
  });

  private http = inject(HttpClient);

  submit() {
    this.http.post('/api/feedback', {
      rating: this.form.value.rating,
      comment: this.form.value.comment,
      page: window.location.pathname,
    }).subscribe(() => {
      this.isOpen.set(false);
      this.form.reset();
    });
  }
}
```

## Computer Use Integration

Use `mcp__computer-use__*` for feedback triage workflows:

1. **Notion dashboard review** — Screenshot the Notion feedback database view to see pending feedback at a glance
2. **PostHog dashboards** — Screenshot the NPS trend and rating distribution insights for weekly review
3. **Widget visual testing** — Screenshot the feedback widget at 375px and 1280px to verify it doesn't obstruct content

## Acceptance Criteria

| # | Criterion | Measurement |
|---|-----------|-------------|
| 1 | Feedback widget visible on all pages | Playwright: `data-testid="feedback-trigger"` visible on homepage + 2 inner pages |
| 2 | Rating submission works | POST `/api/feedback` with rating 1-5 returns `{ success: true }` |
| 3 | Invalid ratings rejected | POST with rating 0 or 6 returns 400 error |
| 4 | Comment length enforced | POST with >1000 char comment returns 400 |
| 5 | Feedback stored in D1 | Query D1 `feedback` table — new row exists with correct rating + page |
| 6 | Feedback synced to Notion | `mcp__notion__API-query-data-source` returns matching entry |
| 7 | PostHog event fires | Check PostHog for `feedback_submitted` event with correct properties |
| 8 | NPS survey triggers at day 7 | User created 7 days ago sees NPS survey (PostHog survey targeting) |
| 9 | Testimonials require moderation | New testimonial has `status: 'pending'`, not shown on site until approved |
| 10 | Widget accessible | axe-core: 0 violations on feedback modal; keyboard navigable; ARIA roles correct |
| 11 | Admin view shows all feedback | `/admin/feedback` renders table with rating, comment, page, status, date |
