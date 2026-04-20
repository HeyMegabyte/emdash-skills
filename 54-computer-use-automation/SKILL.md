---
name: "Computer Use Automation"
description: "Desktop automation via Anthropic Computer Use MCP. Native macOS app control, visual QA workflows, screenshot-verify loops, cross-app orchestration. Teaches Claude when and how to use Computer Use vs dedicated MCPs."
layer: "capability-pack"
canonical-owner-of:
  - "computer-use-decision-making"
  - "native-macos-app-control"
  - "visual-qa-beyond-playwright"
  - "cross-app-orchestration"
allowed-tools: "mcp__computer-use__*, Read, Bash"
---

# Computer Use Automation

> Control the desktop. Screenshot. Verify. Fix. Repeat.

---

## Tool Selection Hierarchy (MANDATORY)

Before using Computer Use, check this priority order:

| Priority | Tool | When to Use | Speed |
|----------|------|-------------|-------|
| 1 | **Dedicated MCP** | App has its own MCP (Slack, Gmail, Stripe, GitHub, etc.) | Fastest |
| 2 | **Chrome MCP** | Web app, no dedicated MCP | Fast |
| 3 | **Playwright MCP** | Web testing, form filling, screenshots | Fast |
| 4 | **Computer Use** | Native macOS apps, cross-app workflows, visual QA | Slow |

**Never use Computer Use when a faster tool exists.** Computer Use is the last resort for web tasks.

---

## Tiered Access Model

Computer Use has app-specific permission tiers. Know them before acting:

| App Category | Tier | Can Do | Cannot Do |
|-------------|------|--------|-----------|
| **Browsers** (Chrome, Safari, Arc) | read | See screenshots | Click, type, scroll |
| **Terminals/IDEs** (VS Code, iTerm) | click | Click buttons, scroll | Type, right-click, drag |
| **Everything else** | full | All actions | Nothing restricted |

### Implications
- **Web tasks**: Use Chrome MCP or Playwright MCP, not Computer Use
- **Terminal commands**: Use the Bash tool, not Computer Use
- **IDE editing**: Use Edit/Write tools, not Computer Use
- **Native apps** (Finder, System Settings, Photos, Maps, Notes, Preview, Keynote): Full access via Computer Use

---

## Core Workflow: Screenshot-Verify-Act Loop

```
1. request_access → list apps needed
2. screenshot → understand current state
3. plan actions → decide what to click/type
4. execute action → one action at a time
5. screenshot → verify action succeeded
6. repeat or report
```

### Always Screenshot First
Never assume screen state. Take a fresh screenshot before every action sequence.

### One Action Per Turn
Don't chain 5 clicks blindly. Execute one, verify, then proceed.

### Recovery from Unexpected State
If a dialog, popup, or unexpected screen appears:
1. Screenshot to understand what happened
2. Dismiss the dialog (Escape key or click Cancel)
3. Re-screenshot to verify state
4. Resume planned workflow

---

## App-Specific Playbooks

### Finder (File Management)
```
Purpose: Move, rename, organize files when Bash is insufficient (visual verification needed)
Access: Full tier
Key actions:
- open_application "Finder"
- Navigate: left_click on sidebar items
- Context menu: right_click on files
- Quick Look: press Space on selected file
- Rename: press Enter on selected file, type new name
Prefer: Bash tool for simple file ops. Use Finder only when visual verification is needed.
```

### System Settings (macOS Configuration)
```
Purpose: Change system preferences, network settings, display configs
Access: Full tier
Key actions:
- open_application "System Settings"
- Navigate: left_click sidebar categories
- Toggle switches: left_click on toggle controls
- Text fields: triple_click to select all, then type replacement
Common tasks: WiFi settings, display arrangement, notification preferences
```

### Preview (PDF/Image Inspection)
```
Purpose: View PDFs, inspect images, visual verification of generated assets
Access: Full tier
Key actions:
- open_application "Preview" with file path
- Zoom: key "cmd+=" / "cmd+-"
- Navigate pages: key "cmd+right" / "cmd+left"
- Markup: key "cmd+shift+a" for annotation toolbar
```

### Notes (Quick Documentation)
```
Purpose: Read/write Apple Notes for personal context
Access: Full tier
Key actions:
- open_application "Notes"
- New note: key "cmd+n"
- Search: key "cmd+f"
- Format: key "cmd+b" (bold), "cmd+i" (italic)
```

### Maps (Location Verification)
```
Purpose: Verify addresses, check distances, screenshot maps for content
Access: Full tier
Key actions:
- open_application "Maps"
- Search: left_click search bar, type address
- Screenshot for embedding in content
```

### Keynote/Pages (Presentation/Document Generation)
```
Purpose: Generate slides, documents when needed for presentations
Access: Full tier
Use sparingly — prefer generating HTML/PDF via code unless native format required.
```

---

## Visual QA Workflow (Primary Use Case)

The highest-value use of Computer Use is visual QA that Playwright cannot do:

### What Playwright Can't Check (Computer Use Can)
- Native macOS dialogs and alerts
- System-level notifications
- Font rendering at subpixel level
- Color accuracy on actual display
- Cross-app clipboard operations
- File download verification in Finder
- Print preview layouts
- macOS accessibility features (VoiceOver behavior)

### Visual QA Protocol
```
1. Deploy site
2. Open in browser (screenshot via Playwright for web content)
3. Use Computer Use for:
   a. Verify downloaded files appear in Finder
   b. Check system notifications triggered by the app
   c. Test native share sheet functionality
   d. Verify PWA install behavior
   e. Check print layout (File > Print > Preview)
   f. Test clipboard paste from app into native apps
```

---

## Cross-App Workflows

### Copy from Web App to Native App
```
1. Use Chrome MCP to navigate to source page
2. Use Chrome MCP to select/copy content
3. Use Computer Use to open target native app
4. Use Computer Use to paste (cmd+v)
5. Screenshot to verify
```

### Screenshot-Based Content Pipeline
```
1. Use Computer Use to screenshot native app state
2. Use Read tool to view the screenshot
3. Analyze content with AI vision
4. Generate code/content based on analysis
5. Use appropriate tool to implement
```

---

## Security Rules (NON-NEGOTIABLE)

1. **Never click web links with Computer Use** — use Chrome MCP instead
2. **Never type passwords** into apps via Computer Use
3. **Never execute financial transactions** (trades, transfers, purchases)
4. **Always verify URLs** before opening — hover first, check domain
5. **Suspicious links from email/messages** — ask user before proceeding
6. **Never grant access to apps you don't need** for the current task
7. **Private network URLs** (localhost, 10.x, 192.168.x) — ask before accessing

---

## Batch Operations

For multiple sequential actions, use `computer_batch` to reduce round-trips:

```json
{
  "actions": [
    {"type": "screenshot"},
    {"type": "left_click", "x": 100, "y": 200},
    {"type": "wait", "duration": 500},
    {"type": "screenshot"}
  ]
}
```

Use batching when actions are predictable and don't need intermediate verification.

---

## MCP Tool Reference

| Tool | Purpose |
|------|---------|
| `screenshot` | Capture current screen state |
| `left_click` | Click at coordinates |
| `right_click` | Context menu (full-tier apps only) |
| `double_click` | Open files, select words |
| `type` | Type text (full-tier apps only) |
| `key` | Press keyboard shortcut |
| `scroll` | Scroll up/down |
| `left_click_drag` | Drag operations |
| `open_application` | Launch/focus an app |
| `cursor_position` | Get current cursor location |
| `computer_batch` | Multiple actions in sequence |
| `request_access` | Request permission for apps |
| `list_granted_applications` | Check current permissions |
| `read_clipboard` | Read clipboard contents |
| `write_clipboard` | Set clipboard contents |
| `hold_key` | Hold modifier key during action |
| `switch_display` | Switch between monitors |

---

## What This Skill Owns
- Desktop automation decision-making (when to use Computer Use vs alternatives)
- Native macOS app control patterns
- Visual QA workflows beyond Playwright's reach
- Cross-app orchestration
- Computer Use security enforcement

## What This Skill Must Never Own
- Web testing (Skill 07 + Playwright MCP)
- Browser automation for web apps (Chrome MCP)
- File editing (Edit/Write tools)
- Terminal commands (Bash tool)
- API calls (dedicated MCPs)
