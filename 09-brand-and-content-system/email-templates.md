---
name: "Email Templates"
version: "1.1.0"
updated: "2026-04-23"
description: "Branded HTML transactional email: dark gradient header, clean body, dark mode. Contact confirmations, newsletter welcome, donation receipts. Resend via verified megabyte.space."
---

# Email Templates
## Design Principles (Source: Litmus, Really Good Emails)
- **Dark mode support** — emails must look great in both light and dark email clients
- **Max width: 560px** — optimal reading width across all clients
- **System fonts** — `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Single-column** — simplest, most reliable across email clients
- **Minimal images** — email clients often block images by default
- **Text-first** — key information must be readable without images loading

## Template Structure
```
┌─────────────────────────────┐
│  Dark gradient header (#060610 → #0a0a1a)  │
│  Logo (center, max 120px wide)              │
├─────────────────────────────┤
│  White body (padding: 32px)                 │
│  Content (16px, line-height: 1.6)          │
│  CTA button (brand gradient, centered)     │
├─────────────────────────────┤
│  Light footer (#f5f5f5)                    │
│  Unsubscribe link + address                │
└─────────────────────────────┘
```

## Base HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Email Subject</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; padding: 0; background: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 560px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #060610, #0a0a1a); padding: 24px; text-align: center; border-radius: 12px 12px 0 0; }
    .header img { max-width: 120px; height: auto; }
    .body { background: #ffffff; padding: 32px; font-size: 16px; line-height: 1.6; color: #333333; }
    .body h1 { font-size: 22px; color: #060610; margin-top: 0; }
    .cta { display: inline-block; background: linear-gradient(135deg, #00E5FF, #50AAE3); color: #060610; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 16px 0; }
    .divider { border: none; border-top: 1px solid #50AAE3; margin: 24px 0; opacity: 0.3; }
    .footer { background: #f5f5f5; padding: 20px 32px; font-size: 12px; color: #999999; text-align: center; border-radius: 0 0 12px 12px; }
    .footer a { color: #50AAE3; }
    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      body { background: #1a1a2e !important; }
      .body { background: #0f0f1f !important; color: #e0e0e5 !important; }
      .body h1 { color: #f0f0f5 !important; }
      .footer { background: #060610 !important; color: #666680 !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <img src="https://domain.com/logo.png" alt="Brand Name">
    </div>
    <div class="body">
      <!-- Content here -->
    </div>
    <div class="footer">
      <p>Brand Name — brian@megabyte.space</p>
      <p><a href="{{{unsubscribe}}}">Unsubscribe</a> · <a href="https://domain.com/privacy">Privacy</a></p>
    </div>
  </div>
</body>
</html>
```

## Email Types
### 1. Contact Form Confirmation
**Subject:** "Got it — we'll be in touch"
```
Hi {{name}},

Thanks for reaching out. We received your message and will get back to you shortly.

Here's what you sent:
— Subject: {{subject}}
— Message: {{message}}

If this is urgent, reply directly to this email.

Best,
Brian
```

### 2. Newsletter Welcome
**Subject:** "You're in 🎉"
```
Welcome to the [Brand] newsletter.

Here's what to expect:
- Updates on our mission and impact
- New features and improvements
- Stories from the community

No spam. Unsubscribe anytime.

[CTA: Visit Our Site]
```

### 3. Donation Receipt
**Subject:** "Thank you — here's your receipt"
```
Thank you for your generous donation of ${{amount}}.

Date: {{date}}
Transaction ID: {{transaction_id}}
Tax-deductible: This receipt may be used for tax purposes.

Your support directly funds [specific impact].

[CTA: Share with Friends]
```

### 4. Volunteer Signup
**Subject:** "Welcome aboard"
```
You're officially signed up to volunteer.

Next steps:
1. We'll reach out within 48 hours with scheduling
2. Bring: comfortable clothes and a willingness to help
3. Location: [address]

Questions? Reply to this email.
```

### 5. Goal Reached Celebration
**Subject:** "We did it! Goal reached."
```
Thanks to people like you, we've reached our ${{goal}} goal!

{{raised}} raised from {{donor_count}} supporters.

This means [specific impact statement].

[CTA: See the Impact]
```

## Sending via Resend
```typescript
import { Resend } from 'resend';

const resend = new Resend(env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Brian <brian@megabyte.space>',
  to: [recipient],
  subject: 'Subject line',
  html: renderedTemplate,
  reply_to: 'brian@megabyte.space',
});
```

- Verified domain: megabyte.space
- API key: shared key pool (05/shared-api-pool)
- Rate limit: 100 emails/day on free tier
- For bulk: use Listmonk on Cloudflare Containers

## Testing Checklist
```
[ ] Renders correctly in Gmail (web + mobile)
[ ] Renders correctly in Apple Mail
[ ] Dark mode displays properly
[ ] Logo loads (and email is readable without it)
[ ] CTA button is tappable on mobile (min 44px height)
[ ] Unsubscribe link works
[ ] Links are absolute URLs (not relative)
[ ] No broken images
[ ] Subject line < 50 characters
[ ] Preview text is meaningful (not "View in browser")
```
