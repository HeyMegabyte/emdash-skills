---
name: "Rich Text Editor"
description: "Editor.js (@editorjs/editorjs) integration with Angular. Block-based JSON output, core plugins (header, list, image, embed, table, code, quote), Angular wrapper with lifecycle management, saving/loading JSON to D1, and server-side block rendering for SEO."---

# Rich Text Editor
## Angular Editor.js Wrapper
```typescript
// editor.component.ts
import { Component, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import EditorJS, { type OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Table from '@editorjs/table';
import CodeTool from '@editorjs/code';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';

@Component({
  selector: 'app-editor',
  standalone: true,
  template: `<div #editorContainer id="editorjs"></div>`,
  styles: [`
    :host { display: block; }
    #editorjs { min-height: 300px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; }
  `],
})
export class EditorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) container!: ElementRef;
  @Input() data?: OutputData;
  @Input() placeholder = 'Start writing...';
  @Input() readOnly = false;
  @Output() saved = new EventEmitter<OutputData>();
  @Output() ready = new EventEmitter<void>();

  private editor!: EditorJS;

  ngAfterViewInit(): void {
    this.editor = new EditorJS({
      holder: this.container.nativeElement,
      data: this.data,
      placeholder: this.placeholder,
      readOnly: this.readOnly,
      tools: {
        header: { class: Header, config: { levels: [2, 3, 4], defaultLevel: 2 } },
        list: { class: List, inlineToolbar: true },
        image: {
          class: ImageTool,
          config: {
            endpoints: { byFile: '/api/uploads/direct', byUrl: '/api/uploads/fetch-url' },
            additionalRequestHeaders: { Authorization: `Bearer ${this.getToken()}` },
          },
        },
        embed: { class: Embed, config: { services: { youtube: true, vimeo: true, codepen: true } } },
        table: { class: Table, inlineToolbar: true },
        code: CodeTool,
        quote: { class: Quote, config: { quotePlaceholder: 'Enter a quote', captionPlaceholder: 'Author' } },
        delimiter: Delimiter,
        inlineCode: InlineCode,
        marker: Marker,
      },
      onReady: () => this.ready.emit(),
    });
  }

  async save(): Promise<OutputData> {
    const data = await this.editor.save();
    this.saved.emit(data);
    return data;
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  private getToken(): string {
    // Inject Clerk token from auth service
    return '';
  }
}
```

## Block JSON Format (Editor.js OutputData)
```json
{
  "time": 1714000000000,
  "blocks": [
    { "type": "header", "data": { "text": "Getting Started", "level": 2 } },
    { "type": "paragraph", "data": { "text": "This is <b>rich text</b> with <mark>highlights</mark>." } },
    { "type": "list", "data": { "style": "unordered", "items": ["Item one", "Item two"] } },
    { "type": "image", "data": { "file": { "url": "https://cdn.example.com/img.webp" }, "caption": "Screenshot", "withBorder": false, "stretched": true } },
    { "type": "code", "data": { "code": "const x = 42;" } },
    { "type": "quote", "data": { "text": "Ship it.", "caption": "Brian", "alignment": "left" } },
    { "type": "table", "data": { "content": [["Name", "Role"], ["Brian", "SE"]] } }
  ],
  "version": "2.29.1"
}
```

## D1 Schema for Content Storage
```sql
CREATE TABLE content_blocks (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,   -- 'post', 'page', 'doc'
  entity_id TEXT NOT NULL,
  blocks TEXT NOT NULL,         -- JSON (Editor.js OutputData)
  version INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT NOT NULL,     -- Clerk user ID
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_content_entity ON content_blocks(entity_type, entity_id);
```

## Hono API for Save/Load
```typescript
// src/routes/content.ts
const content = new Hono<{ Bindings: Env }>();

content.get('/:type/:id', async (c) => {
  const row = await c.env.DB.prepare(
    'SELECT blocks, version FROM content_blocks WHERE entity_type = ? AND entity_id = ? ORDER BY version DESC LIMIT 1'
  ).bind(c.req.param('type'), c.req.param('id')).first();
  if (!row) return c.json({ error: 'Not found' }, 404);
  return c.json({ blocks: JSON.parse(row.blocks as string), version: row.version });
});

content.put('/:type/:id', zValidator('json', z.object({
  blocks: z.object({ time: z.number(), blocks: z.array(z.any()), version: z.string() }),
})), async (c) => {
  const { blocks } = c.req.valid('json');
  const type = c.req.param('type');
  const id = c.req.param('id');
  const userId = c.get('userId'); // from Clerk middleware

  await c.env.DB.prepare(
    'INSERT INTO content_blocks (id, entity_type, entity_id, blocks, version, updated_by) VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(version),0)+1 FROM content_blocks WHERE entity_type=? AND entity_id=?), ?)'
  ).bind(crypto.randomUUID(), type, id, JSON.stringify(blocks), type, id, userId).run();

  return c.json({ saved: true });
});

export { content };
```

## Server-Side Block Renderer (HTML for SEO)
```typescript
function renderBlocks(data: OutputData): string {
  return data.blocks.map((block) => {
    switch (block.type) {
      case 'header': return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
      case 'paragraph': return `<p>${block.data.text}</p>`;
      case 'list': {
        const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
        const items = block.data.items.map((i: string) => `<li>${i}</li>`).join('');
        return `<${tag}>${items}</${tag}>`;
      }
      case 'image': return `<figure><img src="${block.data.file.url}" alt="${block.data.caption || ''}" loading="lazy"/>${block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : ''}</figure>`;
      case 'code': return `<pre><code>${block.data.code}</code></pre>`;
      case 'quote': return `<blockquote><p>${block.data.text}</p>${block.data.caption ? `<cite>${block.data.caption}</cite>` : ''}</blockquote>`;
      case 'table': {
        const rows = block.data.content.map((r: string[]) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
        return `<table>${rows}</table>`;
      }
      case 'delimiter': return '<hr/>';
      default: return '';
    }
  }).join('\n');
}
```

## Custom Block Creation
```typescript
class AlertBlock {
  static get toolbox() {
    return { title: 'Alert', icon: '<svg>...</svg>' };
  }

  constructor({ data }: { data: { type: string; message: string } }) {
    this.data = { type: data.type || 'info', message: data.message || '' };
  }

  render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('alert', `alert-${this.data.type}`);
    wrapper.contentEditable = 'true';
    wrapper.textContent = this.data.message;
    return wrapper;
  }

  save(el: HTMLElement) {
    return { type: this.data.type, message: el.textContent };
  }

  private data: { type: string; message: string };
}

// Register: tools: { alert: { class: AlertBlock } }
```
