---
name: "Microcopy Library"
version: "2.0.0"
updated: "2026-04-23"
description: "Canonical brand-voice microcopy dictionary. Eliminates generic AI copy ('An error occurred', 'Submit', 'Loading...') with punchy, irreverent, on-brand alternatives. Covers buttons, errors, empty states, loading, success, tooltips, forms, confirmations, 404, and auth flows."
---

# Microcopy Library

Brand-voice microcopy for every UI surface. Flesch>=60, active voice, no "please," no corporate tone. Irreverent but professional. Every string must feel like a human wrote it, not a framework.

## Dictionary

```json
{
  "buttons": {
    "submit": "Let's go",
    "cancel": "Nope, go back",
    "save": "Save it",
    "confirm": "Yep, delete it",
    "next": "Keep going",
    "previous": "Back up",
    "close": "Done here",
    "retry": "Try again",
    "upgrade": "Level up",
    "download": "Grab it",
    "share": "Spread the word",
    "copy": "Snag that",
    "create": "Make it happen",
    "edit": "Tweak it",
    "publish": "Ship it",
    "archive": "Stash it",
    "invite": "Bring them in",
    "connect": "Hook it up",
    "disconnect": "Pull the plug",
    "export": "Take it with you",
    "import": "Bring it in",
    "enable": "Turn it on",
    "disable": "Kill it"
  },

  "errors": {
    "generic": "Something broke. We're on it.",
    "request_failed": "That didn't work — try again?",
    "network": "Lost connection. Check your internet and retry.",
    "timeout": "Took too long. Give it another shot.",
    "rate_limit": "Whoa, slow down. Try again in a sec.",
    "forbidden": "You don't have access to this.",
    "not_found": "We looked. It's not here.",
    "validation": "Something's off. Check the fields below.",
    "conflict": "Someone else just changed this. Refresh and try again.",
    "server": "Our bad. We're looking into it.",
    "upload_failed": "Upload didn't make it. Try a smaller file or different format.",
    "payment_failed": "Payment didn't go through. Double-check your card details."
  },

  "empty_states": {
    "generic": "Nothing here yet. Create your first one?",
    "no_results": "Quiet day — check back later.",
    "search_empty": "No matches. Try different keywords.",
    "inbox_empty": "All caught up. Nice work.",
    "notifications_empty": "No notifications. Enjoy the silence.",
    "team_empty": "Just you so far. Invite your crew.",
    "activity_empty": "No activity yet. Things will show up here.",
    "files_empty": "No files uploaded. Drop one in.",
    "comments_empty": "No comments yet. Start the conversation.",
    "analytics_empty": "No data yet. Give it a day."
  },

  "loading": {
    "generic": "Hang tight...",
    "processing": "Almost there...",
    "saving": "Saving your stuff...",
    "uploading": "Sending it up...",
    "generating": "Cooking something up...",
    "deploying": "Shipping it live...",
    "syncing": "Getting in sync...",
    "searching": "Digging through the data...",
    "calculating": "Crunching numbers...",
    "connecting": "Making the connection..."
  },

  "success": {
    "generic": "Done. Nailed it.",
    "complete": "You're all set.",
    "saved": "Saved. You're good.",
    "deleted": "Gone. No coming back.",
    "updated": "Updated. Looking fresh.",
    "sent": "Sent. It's on its way.",
    "published": "Live. The world can see it now.",
    "copied": "Copied to clipboard.",
    "connected": "Hooked up and ready.",
    "imported": "Brought it all in. Check your data.",
    "deployed": "Deployed. It's live.",
    "invited": "Invite sent. Ball's in their court."
  },

  "tooltips": {
    "required_field": "This one's required.",
    "password_strength": "Mix letters, numbers, and symbols. 12+ chars.",
    "file_size": "Max {{maxSize}}. Keep it lean.",
    "keyboard_shortcut": "Shortcut: {{key}}",
    "feature_locked": "Upgrade to unlock this.",
    "auto_save": "We save as you go.",
    "markdown_support": "Markdown works here.",
    "drag_to_reorder": "Drag to rearrange.",
    "click_to_copy": "Click to copy.",
    "external_link": "Opens in a new tab."
  },

  "form_labels": {
    "email": "Your email",
    "password": "Pick a password",
    "confirm_password": "One more time",
    "name": "Your name",
    "company": "Where you work",
    "phone": "Phone number",
    "message": "What's on your mind?",
    "subject": "Quick summary",
    "url": "Link",
    "search": "Search for anything",
    "username": "Pick a username",
    "bio": "A few words about you",
    "address": "Street address",
    "city": "City",
    "zip": "ZIP code"
  },

  "confirmations": {
    "delete": "This can't be undone. You sure?",
    "discard_changes": "You've got unsaved changes. Ditch them?",
    "leave_page": "You'll lose your work if you leave.",
    "cancel_subscription": "You'll lose access at the end of this billing period.",
    "remove_member": "Remove {{name}} from the team?",
    "publish": "This goes live immediately. Ready?",
    "disconnect": "Disconnect {{service}}? You can reconnect later.",
    "bulk_delete": "Delete {{count}} items? Can't undo this."
  },

  "not_found": {
    "page": "Lost? This page doesn't exist.",
    "page_alt": "We looked everywhere. Not here.",
    "resource": "Whatever was here is gone now.",
    "link_expired": "This link expired. Request a fresh one."
  },

  "auth": {
    "login_heading": "Hey, welcome back",
    "signup_heading": "Join us",
    "logout_confirm": "Heading out?",
    "forgot_password": "Forgot your password?",
    "reset_sent": "Check your inbox. Reset link's on the way.",
    "password_changed": "Password updated. You're secure.",
    "verify_email": "Check your email and click the link.",
    "session_expired": "Your session timed out. Sign in again.",
    "account_locked": "Too many tries. Wait {{minutes}} minutes.",
    "magic_link_sent": "Magic link sent. Check your inbox.",
    "sso_redirect": "Taking you to {{provider}}...",
    "welcome_new": "You're in. Let's get you set up."
  },

  "status": {
    "online": "Connected",
    "offline": "Offline",
    "maintenance": "Back in a few. Doing some maintenance.",
    "degraded": "Running slower than usual. We're on it.",
    "beta": "Beta — things might get weird.",
    "deprecated": "Going away soon. Migrate when you can."
  }
}
```

## Usage Rules

1. **Never use generic framework defaults.** Every user-facing string must come from this dictionary or match its tone.
2. **Contractions always.** "You're" not "You are." "It's" not "It is." "Can't" not "Cannot."
3. **No "please."** Direct without being rude. "Enter your email" not "Please enter your email."
4. **No exclamation marks on errors.** Save excitement for success states only.
5. **Template variables** use `{{variable}}` syntax. Keep them minimal — one per string max.
6. **Sentence case everywhere.** "Save your changes" not "Save Your Changes." Exception: product names, proper nouns.
7. **Max length:** Buttons 20 chars. Tooltips 60 chars. Errors 80 chars. Empty states 60 chars.
8. **Test readability:** If you'd cringe reading it aloud, rewrite it.

## Implementation Pattern

```typescript
// src/lib/microcopy.ts
const copy = {
  buttons: { submit: "Let's go", cancel: 'Nope, go back', save: 'Save it' },
  errors: { generic: "Something broke. We're on it.", network: 'Lost connection. Check your internet and retry.' },
  empty: { generic: 'Nothing here yet. Create your first one?' },
  loading: { generic: 'Hang tight...' },
  success: { generic: 'Done. Nailed it.' },
} as const;

type CopyKey = keyof typeof copy;
type SubKey<K extends CopyKey> = keyof (typeof copy)[K];

function t<K extends CopyKey>(category: K, key: SubKey<K>, vars?: Record<string, string>): string {
  let text = copy[category][key] as string;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(`{{${k}}}`, v);
    }
  }
  return text;
}

export { copy, t };
```

## Angular Integration

```typescript
// In components, use the t() function directly:
import { t } from '../lib/microcopy';

@Component({
  template: `<button (click)="save()">{{ saveLabel }}</button>`,
})
export class SaveComponent {
  saveLabel = t('buttons', 'save');
}
```
