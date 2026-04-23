---
name: "File Uploads and Storage"
version: "2.0.0"
updated: "2026-04-23"
description: "Uppy (@uppy/core, @uppy/dashboard, @uppy/tus, @uppy/aws-s3) with Cloudflare R2 for resumable file uploads. Angular 20 wrapper component with signals, presigned URL generation via Hono Worker, file validation, progress tracking, and R2 bucket configuration."
---

# File Uploads and Storage
## R2 Bucket Setup (wrangler.toml)
```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "uploads"
preview_bucket_name = "uploads-preview"

[vars]
R2_PUBLIC_URL = "https://cdn.example.com"
```

## Presigned URL Generator (Hono)
```typescript
// src/routes/uploads.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AwsClient } from 'aws4fetch';

const uploads = new Hono<{ Bindings: Env }>();

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().regex(/^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf|video\/mp4)$/),
  size: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
});

uploads.post('/presign', zValidator('json', uploadSchema), async (c) => {
  const { filename, contentType, size } = c.req.valid('json');
  const key = `${crypto.randomUUID()}/${filename}`;

  const r2 = new AwsClient({
    accessKeyId: c.env.R2_ACCESS_KEY_ID,
    secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
  });

  const url = new URL(`https://${c.env.R2_BUCKET}.${c.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`);
  url.searchParams.set('X-Amz-Expires', '3600');

  const signed = await r2.sign(new Request(url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'Content-Length': String(size) },
  }), { aws: { signQuery: true } });

  return c.json({ key, uploadUrl: signed.url, publicUrl: `${c.env.R2_PUBLIC_URL}/${key}` });
});

// Worker proxy for direct R2 upload (no presigned URL needed)
uploads.put('/direct/:key{.+}', async (c) => {
  const key = c.req.param('key');
  const contentType = c.req.header('content-type') || 'application/octet-stream';
  const body = await c.req.arrayBuffer();

  await c.env.R2.put(key, body, {
    httpMetadata: { contentType },
    customMetadata: { uploadedAt: new Date().toISOString() },
  });

  return c.json({ key, publicUrl: `${c.env.R2_PUBLIC_URL}/${key}` });
});

// List/delete
uploads.get('/files', async (c) => {
  const list = await c.env.R2.list({ limit: 100 });
  return c.json({ objects: list.objects.map((o) => ({ key: o.key, size: o.size, uploaded: o.uploaded })) });
});

uploads.delete('/files/:key{.+}', async (c) => {
  await c.env.R2.delete(c.req.param('key'));
  return c.json({ deleted: true });
});

export { uploads };
```

## Angular Uppy Wrapper Component
```typescript
// uppy-uploader.component.ts
import { Component, OnDestroy, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import AwsS3 from '@uppy/aws-s3';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';

interface UploadResult { key: string; publicUrl: string; filename: string; size: number }

@Component({
  selector: 'app-uppy-uploader',
  standalone: true,
  template: `<div #uppyDashboard></div>`,
})
export class UppyUploaderComponent implements AfterViewInit, OnDestroy {
  @ViewChild('uppyDashboard', { static: true }) dashboardEl!: ElementRef;
  @Input() maxFiles = 10;
  @Input() maxFileSize = 100 * 1024 * 1024; // 100MB
  @Input() allowedTypes = ['image/*', 'application/pdf', 'video/mp4'];
  @Output() uploaded = new EventEmitter<UploadResult>();
  @Output() error = new EventEmitter<Error>();

  private uppy!: Uppy;

  ngAfterViewInit(): void {
    this.uppy = new Uppy({
      restrictions: {
        maxFileSize: this.maxFileSize,
        maxNumberOfFiles: this.maxFiles,
        allowedFileTypes: this.allowedTypes,
      },
      autoProceed: false,
    });

    this.uppy.use(Dashboard, {
      inline: true,
      target: this.dashboardEl.nativeElement,
      width: '100%',
      height: 350,
      theme: 'dark',
      proudlyDisplayPoweredByUppy: false,
    });

    // S3-compatible presigned upload to R2
    this.uppy.use(AwsS3, {
      async getUploadParameters(file) {
        const res = await fetch('/api/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            size: file.size,
          }),
        });
        const { uploadUrl, key } = await res.json();
        return { method: 'PUT', url: uploadUrl, fields: {}, headers: { 'Content-Type': file.type! } };
      },
    });

    this.uppy.on('upload-success', (file, response) => {
      this.uploaded.emit({
        key: file!.meta['key'] as string,
        publicUrl: response.uploadURL!,
        filename: file!.name!,
        size: file!.size!,
      });
    });

    this.uppy.on('upload-error', (file, error) => {
      this.error.emit(error);
    });
  }

  ngOnDestroy(): void {
    this.uppy?.destroy();
  }
}
```

## Tus Resumable Upload (large files)
```typescript
import Tus from '@uppy/tus';

// Replace AwsS3 with Tus for resumable uploads
this.uppy.use(Tus, {
  endpoint: '/api/uploads/tus',
  chunkSize: 5 * 1024 * 1024, // 5MB chunks
  retryDelays: [0, 1000, 3000, 5000],
  headers: { Authorization: `Bearer ${token}` },
});

// Worker-side tus handler (use tusker or cf-tus library)
// Stores chunks in R2 multipart upload, assembles on completion
```

## File Type Validation (server-side)
```typescript
const ALLOWED_MAGIC: Record<string, readonly number[]> = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'video/mp4': [0x00, 0x00, 0x00], // ftyp box at offset 4
};

function validateMagicBytes(buffer: ArrayBuffer, claimed: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 8));
  const expected = ALLOWED_MAGIC[claimed];
  if (!expected) return false;
  return expected.every((b, i) => bytes[i] === b);
}
```

## D1 File Metadata Table
```sql
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,        -- R2 object key
  filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_by TEXT NOT NULL,        -- Clerk user ID
  public_url TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_files_user ON files(uploaded_by);
```

## Usage Pattern
```typescript
// In any feature component
<app-uppy-uploader
  [maxFiles]="5"
  [allowedTypes]="['image/jpeg', 'image/png', 'image/webp']"
  (uploaded)="onFileUploaded($event)"
  (error)="onUploadError($event)"
/>
```
