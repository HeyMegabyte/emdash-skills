---
name: "Evidence Collection"
version: "2.0.0"
updated: "2026-04-23"
description: "Every automated form submission creates a complete evidence package: Playwright video, annotated screenshots, action log, manifest.json. R2 storage patterns with presigned URLs. Accessible from user dashboard."
---

# Evidence Collection Pattern

## Per-Submission Package
Every `fillForm()` call creates: EvidenceCollector instance→screenshots at each step→red circle overlays on button clicks (Node canvas, 30px radius rgba(255,0,0,0.9))→action log→manifest.json→video via Playwright `recordVideo` API. Package uploaded to R2 at `evidence/{echoId}/{appId}/{packageId}/`.

## R2 Storage Patterns
```typescript
// Upload evidence package to R2
async function uploadEvidencePackage(env: Env, pkg: EvidencePackage): Promise<string> {
  const prefix = `evidence/${pkg.echoId}/${pkg.appId}/${pkg.packageId}`;

  // Upload screenshots in parallel — never sequential
  await Promise.all(pkg.screenshots.map(async (ss, i) => {
    await env.R2.put(`${prefix}/screenshots/${i}-${ss.label}.png`, ss.buffer, {
      httpMetadata: { contentType: 'image/png' },
      customMetadata: { label: ss.label, timestamp: ss.timestamp, buttonClicked: ss.buttonClicked ?? '' },
    });
  }));

  // Upload video (WebM from Playwright recordVideo)
  if (pkg.videoPath) {
    const videoBuffer = await readFile(pkg.videoPath);
    await env.R2.put(`${prefix}/session.webm`, videoBuffer, {
      httpMetadata: { contentType: 'video/webm' },
    });
  }

  // Upload manifest last (signals package is complete)
  await env.R2.put(`${prefix}/manifest.json`, JSON.stringify(pkg.manifest), {
    httpMetadata: { contentType: 'application/json' },
  });

  return `${prefix}/manifest.json`;
}

// Generate presigned URL for user access (1hr expiry)
async function getEvidenceUrl(env: Env, key: string): Promise<string> {
  const obj = await env.R2.get(key);
  if (!obj) throw new Error(`Evidence not found: ${key}`);
  // R2 presigned URLs via Workers — return public URL pattern
  return `${env.R2_PUBLIC_URL}/${key}`;
}

// List all packages for an application
async function listEvidencePackages(env: Env, echoId: string, appId: string) {
  const prefix = `evidence/${echoId}/${appId}/`;
  const listed = await env.R2.list({ prefix, delimiter: '/' });
  return listed.delimitedPrefixes.map(p => p.replace(prefix, '').replace('/', ''));
}
```

## Video Recording
`context.newContext({ recordVideo: { dir, size: { width:1280, height:720 } } })` captures full session. Video finalized on `page.close()`. Uploaded to R2 as WebM. Public URL returned in API response + stored in application record.

## Manifest Schema
```typescript
interface EvidenceManifest {
  packageId: string; echoId: string; appId: string; program: string;
  startTime: string; endTime: string; status: 'success'|'partial'|'failed';
  screenshots: { index: number; label: string; timestamp: string; size: number; buttonClicked?: string }[];
  actions: { type: string; label: string; timestamp: string; selector?: string }[];
  videoKey?: string; // R2 key for WebM
}
```

## Access Patterns
Dashboard: status cards show video play button when videoUrl exists. Your Data panel: "Submission Videos" section lists all recordings with R2 presigned URLs. Chat: AI surfaces video via `application-video` widget. API: `GET /api/evidence/:appId` returns manifest+URLs.

## R2 Binding (wrangler.toml)
```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "evidence-bucket"
```
Public access: enable R2 public development URL or custom domain for `R2_PUBLIC_URL`. Retention: 90-day lifecycle rule on bucket (legal compliance without unbounded storage).
