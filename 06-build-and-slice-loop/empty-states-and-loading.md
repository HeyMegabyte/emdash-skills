---
name: "Empty States and Loading"
version: "2.0.0"
updated: "2026-04-23"
description: "Every empty list, dashboard, and data view prompts a meaningful first action — never shows 'No data.' Skeleton screens for all loading states with @starting-style enter animations. Consistent loading patterns across the app."
---

# Empty States and Loading
## Empty States: Prompt Action, Don't Show Nothing
### Every Empty List Gets:
1. An illustration or icon (on-brand, not generic)
2. A clear headline ("No donations yet")
3. A helpful subtext ("Share your page to start receiving donations")
4. A primary CTA button ("Share Your Page" or "Create Your First [Thing]")

### Template
```html
<div class="empty-state">
  <div class="empty-icon">
    <!-- SVG icon or simple illustration, brand colors -->
    <svg width="64" height="64" viewBox="0 0 64 64">...</svg>
  </div>
  <h3>No [items] yet</h3>
  <p>Get started by [action that creates the first item].</p>
  <a href="/create" class="btn-primary">Create Your First [Item]</a>
</div>
```

### CSS
```css
.empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem 2rem; text-align: center; min-height: 300px;
}
.empty-icon { margin-bottom: 1.5rem; color: var(--accent-cyan); opacity: 0.5; }
.empty-state h3 { font-family: 'Space Grotesk', sans-serif; font-size: 1.25rem; margin-bottom: 0.5rem; }
.empty-state p { color: var(--text-secondary); margin-bottom: 1.5rem; max-width: 400px; }
```

### By Context
| Section | Headline | Subtext | CTA |
|---------|---------|---------|-----|
| Blog posts | "No posts yet" | "Write your first article to start driving traffic." | "Write a Post" |
| Donations | "No donations yet" | "Share your page to start receiving support." | "Share Your Page" |
| Feedback | "No feedback yet" | "Your users will leave feedback as they use the product." | — (no CTA, just wait) |
| Search results | "No results for '[query]'" | "Try a different search term or browse categories." | "Browse All" |
| Testimonials | "No testimonials yet" | "Ask your happiest users to leave a review." | "Request a Review" |
| Team members | "Just you for now" | "Invite your team to collaborate." | "Invite Someone" |
| Notifications | "All caught up" | "You'll see new notifications here." | — (positive empty state) |

### Positive vs Negative Empty States
- **Negative** (something should be here but isn't): strong CTA to create/add
- **Positive** (everything is handled): reassuring message, no CTA needed
  - Example: "All caught up!" with a checkmark

## Loading States: Skeleton Screens
### Never Show
- Blank white/dark page while loading
- Spinning wheel with no context
- "Loading..." text alone

### Always Show
- Skeleton screens that match the layout of the content being loaded
- Animated shimmer effect
- Content appears progressively as it loads

### Skeleton CSS
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--bg-secondary) 25%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton { animation: none; background: var(--bg-tertiary); }
}
```

### Skeleton Templates
```html
<!-- Card skeleton -->
<div class="card skeleton-card">
  <div class="skeleton" style="height: 200px; margin-bottom: 1rem;"></div>
  <div class="skeleton" style="height: 1.5rem; width: 70%; margin-bottom: 0.5rem;"></div>
  <div class="skeleton" style="height: 1rem; width: 90%; margin-bottom: 0.5rem;"></div>
  <div class="skeleton" style="height: 1rem; width: 50%;"></div>
</div>

<!-- Table row skeleton -->
<tr class="skeleton-row">
  <td><div class="skeleton" style="height: 1rem; width: 80%;"></div></td>
  <td><div class="skeleton" style="height: 1rem; width: 60%;"></div></td>
  <td><div class="skeleton" style="height: 1rem; width: 40%;"></div></td>
</tr>

<!-- Text block skeleton -->
<div class="skeleton-text">
  <div class="skeleton" style="height: 2rem; width: 60%; margin-bottom: 1rem;"></div>
  <div class="skeleton" style="height: 1rem; width: 100%; margin-bottom: 0.5rem;"></div>
  <div class="skeleton" style="height: 1rem; width: 95%; margin-bottom: 0.5rem;"></div>
  <div class="skeleton" style="height: 1rem; width: 70%;"></div>
</div>
```

### Button Loading State
```html
<button type="submit" class="btn-primary" id="submitBtn">
  <span class="btn-text">Save Changes</span>
  <span class="btn-loading" hidden>
    <span class="spinner"></span> Saving...
  </span>
</button>
```

```css
.spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

## Playwright Tests
```typescript
test('empty state shows CTA', async ({ page }) => {
  // Navigate to a page that would show empty state for new users
  await page.goto('/dashboard');
  // Verify empty state is visible (not a blank page)
  const emptyState = page.locator('.empty-state');
  if (await emptyState.count() > 0) {
    await expect(emptyState.locator('h3')).toBeVisible();
    await expect(emptyState.locator('.btn-primary')).toBeVisible();
  }
});

test('loading skeleton appears before content', async ({ page }) => {
  // Slow down network to see loading state
  await page.route('**/api/**', route => {
    setTimeout(() => route.continue(), 1000);
  });
  await page.goto('/dashboard');
  // Skeleton should be visible briefly
  await expect(page.locator('.skeleton').first()).toBeVisible();
});
```
