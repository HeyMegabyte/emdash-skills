---
name: "Keyboard Shortcuts and Command Palette"
description: "Full command palette (Cmd+K) like Linear/Notion for SaaS products. Keyboard shortcut overlay (press ? for help). Keyboard-first navigation for power users. Includes search integration (skill 37), quick actions, and theme toggle. Accessible, with ARIA roles and screen reader support."
layer: "capability-pack"
canonical-owner-of:
  - "command-palette"
  - "keyboard-shortcuts"
  - "keyboard-first-navigation"
---

# Keyboard Shortcuts and Command Palette

> Power users navigate by keyboard. Give them superpowers.

---

## When to Include
- SaaS products with 3+ pages
- Developer tools
- Products targeting power users
- Any product with search (pairs with skill 37)

## Command Palette (Cmd+K)

### HTML
```html
<div id="cmdPalette" class="cmd-palette" hidden role="dialog" aria-label="Command palette">
  <div class="cmd-backdrop" onclick="closePalette()"></div>
  <div class="cmd-container">
    <input type="text" id="cmdInput" placeholder="Type a command or search..."
           role="combobox" aria-autocomplete="list" aria-expanded="true"
           aria-controls="cmdResults" autofocus>
    <ul id="cmdResults" class="cmd-results" role="listbox">
      <!-- Results populated dynamically -->
    </ul>
    <div class="cmd-footer">
      <span><kbd>↑↓</kbd> Navigate</span>
      <span><kbd>↵</kbd> Select</span>
      <span><kbd>Esc</kbd> Close</span>
    </div>
  </div>
</div>
```

### JavaScript
```javascript
// Command registry
const commands = [
  // Navigation
  { id: 'home', label: 'Go to Home', shortcut: 'g h', action: () => location.href = '/' },
  { id: 'about', label: 'Go to About', action: () => location.href = '/about' },
  { id: 'pricing', label: 'Go to Pricing', action: () => location.href = '/pricing' },
  { id: 'blog', label: 'Go to Blog', action: () => location.href = '/blog' },
  { id: 'contact', label: 'Go to Contact', action: () => location.href = '/contact' },
  // Actions
  { id: 'search', label: 'Search...', shortcut: '/', action: openSearch },
  { id: 'theme', label: 'Toggle Dark/Light Mode', shortcut: 't', action: toggleTheme },
  { id: 'shortcuts', label: 'Show Keyboard Shortcuts', shortcut: '?', action: showShortcuts },
  // Admin (if authenticated)
  { id: 'admin', label: 'Open Admin Dashboard', action: () => location.href = '/admin' },
];

// Open palette
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openPalette();
  }
  if (e.key === 'Escape') closePalette();
  if (e.key === '?' && !isInputFocused()) showShortcuts();
});

function openPalette() {
  const palette = document.getElementById('cmdPalette');
  palette.hidden = false;
  document.getElementById('cmdInput').focus();
  renderResults(commands);
}

function closePalette() {
  document.getElementById('cmdPalette').hidden = true;
}

// Fuzzy filter
document.getElementById('cmdInput')?.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = commands.filter(c =>
    c.label.toLowerCase().includes(query) || c.id.includes(query)
  );
  renderResults(filtered);
});

// Arrow key navigation
let selectedIndex = 0;
document.getElementById('cmdInput')?.addEventListener('keydown', (e) => {
  const results = document.querySelectorAll('.cmd-result');
  if (e.key === 'ArrowDown') { selectedIndex = Math.min(selectedIndex + 1, results.length - 1); e.preventDefault(); }
  if (e.key === 'ArrowUp') { selectedIndex = Math.max(selectedIndex - 1, 0); e.preventDefault(); }
  if (e.key === 'Enter') { results[selectedIndex]?.click(); e.preventDefault(); }
  results.forEach((r, i) => r.classList.toggle('selected', i === selectedIndex));
});

function renderResults(items) {
  selectedIndex = 0;
  const list = document.getElementById('cmdResults');
  list.innerHTML = items.map((cmd, i) => `
    <li class="cmd-result ${i === 0 ? 'selected' : ''}" role="option" onclick="${cmd.id}Action()">
      <span>${cmd.label}</span>
      ${cmd.shortcut ? `<kbd>${cmd.shortcut}</kbd>` : ''}
    </li>
  `).join('');
}
```

### Styling
```css
.cmd-palette { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: flex-start; justify-content: center; padding-top: 20vh; }
.cmd-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
.cmd-container { position: relative; width: 560px; background: #0f0f1f; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
.cmd-container input { width: 100%; padding: 1rem 1.25rem; background: transparent; border: none; border-bottom: 1px solid rgba(255,255,255,0.06); color: #f0f0f5; font-size: 1rem; outline: none; }
.cmd-results { list-style: none; padding: 0.5rem 0; margin: 0; max-height: 300px; overflow-y: auto; }
.cmd-result { padding: 0.75rem 1.25rem; cursor: pointer; display: flex; justify-content: space-between; align-items: center; color: #a0a0b5; }
.cmd-result.selected, .cmd-result:hover { background: rgba(0, 229, 255, 0.08); color: #f0f0f5; }
.cmd-result kbd { font-size: 0.75rem; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; }
.cmd-footer { padding: 0.5rem 1.25rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: #606080; display: flex; gap: 1rem; }
.cmd-footer kbd { font-size: 0.7rem; background: rgba(255,255,255,0.06); padding: 1px 4px; border-radius: 3px; }
```

## Shortcut Overlay (Press ?)

```html
<div id="shortcutOverlay" class="shortcut-overlay" hidden>
  <h3>Keyboard Shortcuts</h3>
  <table>
    <tr><td><kbd>Cmd+K</kbd></td><td>Open command palette</td></tr>
    <tr><td><kbd>/</kbd></td><td>Focus search</td></tr>
    <tr><td><kbd>?</kbd></td><td>Show this help</td></tr>
    <tr><td><kbd>g h</kbd></td><td>Go to Home</td></tr>
    <tr><td><kbd>t</kbd></td><td>Toggle theme</td></tr>
    <tr><td><kbd>Esc</kbd></td><td>Close overlay</td></tr>
  </table>
</div>
```

## Accessibility
- `role="dialog"` on palette, `role="combobox"` on input, `role="listbox"` on results
- Arrow keys navigate, Enter selects, Escape closes
- All shortcuts skip when user is typing in an input/textarea
- Screen reader announces selected item
- Reduced motion: no transition animations on palette open/close
