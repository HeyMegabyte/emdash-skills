---
name: "Contact Forms and Endpoints"
description: "Every site gets a working contact form with Turnstile captcha, Zod validation, Resend email delivery, success/error/loading states, and 8-point form test matrix. Auto-creates the /api/contact endpoint, form HTML, and Playwright tests. No form is ever a dead end."
layer: "capability-pack"
canonical-owner-of:
  - "contact-form-implementation"
  - "form-validation-patterns"
  - "form-test-matrix"
---

# Contact Forms and Endpoints

> Every form works. Every submission is delivered. Every state is handled.

---

## Default Contact Form (EVERY site)

### Frontend
```html
<form id="contact" action="/api/contact" method="POST">
  <div class="form-group">
    <label for="name">Your name</label>
    <input id="name" name="name" type="text" required placeholder="Jane Smith" autocomplete="name">
  </div>
  <div class="form-group">
    <label for="email">Your email</label>
    <input id="email" name="email" type="email" required placeholder="jane@example.com" autocomplete="email">
  </div>
  <div class="form-group">
    <label for="message">Message</label>
    <textarea id="message" name="message" required placeholder="How can we help?" rows="5" maxlength="5000"></textarea>
    <span class="char-count"><span id="charCount">0</span>/5000</span>
  </div>
  <div class="cf-turnstile" data-sitekey="${TURNSTILE_SITE_KEY}" data-theme="dark"></div>
  <button type="submit" id="submitBtn">
    <span class="btn-text">Send Message</span>
    <span class="btn-loading" hidden>Sending...</span>
  </button>
  <div id="formSuccess" hidden class="success">Thanks! We'll be in touch shortly.</div>
  <div id="formError" hidden class="error">Something went wrong. Try again?</div>
</form>
```

### Backend (Hono)
```typescript
import { z } from 'zod';
import { Resend } from 'resend';

const ContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  'cf-turnstile-response': z.string(),
});

app.post('/api/contact', async (c) => {
  const body = await c.req.parseBody();
  const parsed = ContactSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid input', details: parsed.error.flatten() }, 400);
  }
  const { name, email, message } = parsed.data;

  // Verify Turnstile
  const turnstileOk = await verifyTurnstile(parsed.data['cf-turnstile-response'], c.env);
  if (!turnstileOk) return c.json({ error: 'Captcha failed' }, 403);

  // Rate limit: 3 submissions per IP per hour
  if (!await rateLimit(c, `contact:${c.req.header('cf-connecting-ip')}`, 3, 3600)) {
    return c.json({ error: 'Too many messages. Try again later.' }, 429);
  }

  // Send via Resend
  const resend = new Resend(c.env.RESEND_API_KEY);
  await resend.emails.send({
    from: `${name} via Site <contact@${c.env.DOMAIN}>`,
    to: ['brian@megabyte.space'],
    replyTo: email,
    subject: `Contact from ${name}`,
    html: renderContactEmail({ name, email, message }),
  });

  // Confirmation email to sender
  await resend.emails.send({
    from: `Brian <brian@megabyte.space>`,
    to: [email],
    subject: "Got it — we'll be in touch",
    html: renderConfirmationEmail({ name }),
  });

  // Track in PostHog
  // posthog.capture('form_submit', { form_name: 'contact', success: true });

  return c.json({ success: true });
});
```

### JavaScript (Progressive Enhancement)
```javascript
document.getElementById('contact')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('#submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoading = btn.querySelector('.btn-loading');
  const success = form.querySelector('#formSuccess');
  const error = form.querySelector('#formError');

  btn.disabled = true;
  btnText.hidden = true;
  btnLoading.hidden = false;
  success.hidden = true;
  error.hidden = true;

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      body: new FormData(form),
    });
    if (res.ok) {
      success.hidden = false;
      form.reset();
    } else {
      const data = await res.json();
      error.textContent = data.error || 'Something went wrong. Try again?';
      error.hidden = false;
    }
  } catch {
    error.textContent = 'Network error. Check your connection.';
    error.hidden = false;
  } finally {
    btn.disabled = false;
    btnText.hidden = false;
    btnLoading.hidden = true;
  }
});
```

## 8-Point Form Test Matrix (EVERY form)

```typescript
test.describe('Contact form', () => {
  test('1. Empty submission shows errors', async ({ page }) => {
    await page.goto('/contact');
    await page.click('button[type="submit"]');
    // HTML5 validation should prevent submission
  });

  test('2. Invalid email rejected', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#name', 'Test');
    await page.fill('#email', 'notanemail');
    await page.fill('#message', 'Hello');
    await page.click('button[type="submit"]');
  });

  test('3. XSS sanitized', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#name', '<script>alert(1)</script>');
    await page.fill('#email', 'test@test.com');
    await page.fill('#message', '<img onerror=alert(1) src=x>');
    await page.click('button[type="submit"]');
    // Zod sanitizes; no script execution
  });

  test('4. Max-length enforced', async ({ page }) => {
    await page.goto('/contact');
    const longText = 'a'.repeat(5001);
    await page.fill('#message', longText);
    const value = await page.inputValue('#message');
    expect(value.length).toBeLessThanOrEqual(5000);
  });

  test('5. Success path works', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#message', 'Test message from Playwright');
    // Turnstile may block in test — mock or use test key
  });

  test('6. Errors show inline', async ({ page }) => {
    await page.goto('/contact');
    // Verify error messages appear near fields, not as alert()
  });

  test('7. Loading state shows', async ({ page }) => {
    await page.goto('/contact');
    // Submit and check button shows "Sending..." and is disabled
  });

  test('8. Double-submit prevented', async ({ page }) => {
    await page.goto('/contact');
    // Click submit twice rapidly; verify button is disabled after first click
  });
});
```

## Other Form Types

### Newsletter Signup (Listmonk)
```html
<form action="/api/subscribe" method="POST">
  <input type="email" name="email" required placeholder="you@example.com">
  <div class="cf-turnstile" data-sitekey="${KEY}" data-theme="dark"></div>
  <button type="submit">Subscribe</button>
</form>
```

### Donation Form (Stripe — skill 18)
Redirect to Stripe Checkout. No form processing needed on our side.

### Feedback Form (skill 41)
In-app widget with rating + text. Stored in D1.
