---
name: "Blog and Content Engine"
version: "2.0.0"
updated: "2026-04-23"
description: "SEO-driven blog system on Cloudflare Workers: markdown-to-HTML rendering, RSS feed, reading time, social sharing, related posts, categories, pagination. Every post targets a longtail keyword. Generates 3-5 seed posts on first build for immediate SEO value. Stored in D1 or as static markdown files."
---

# Blog and Content Engine
## Architecture
```
/blog                → Blog index (paginated, 10 per page)
/blog/[slug]         → Individual post
/blog/rss.xml        → RSS feed
/blog/category/[cat] → Category archive
```

### Storage Options
- **Static markdown** — files in `/content/blog/` compiled at deploy time
- **D1 database** — for dynamic content with admin editing
- **Hybrid** — markdown for seed posts, D1 for future posts

### Markdown Post Format
```markdown
title: "How to Deploy Docker Without Kubernetes"
slug: "deploy-docker-without-kubernetes"
date: "2026-04-19"
category: "guides"
description: "Ship containers to production in 30 seconds without the Kubernetes overhead."
keywords: ["docker hosting", "deploy docker", "no kubernetes"]
image: "/images/blog/docker-no-k8s.webp"
readingTime: 5
Your markdown content here...
```

## SEO Integration (skill 28)
Every blog post targets a longtail keyword:
- **Title tag** contains the keyword phrase
- **H1** matches the title (or is a close variation)
- **First paragraph** mentions the keyword naturally
- **H2s** use semantic variations
- **Meta description** includes keyword + CTA
- **URL slug** contains keyword in hyphens
- **Image alt text** includes keyword where natural

### Seed Posts (3-5 on First Build)
Generate 3-5 posts targeting longtail keywords from skill 28 research:
```
1. "How to [solve problem] with [our product]" (tutorial)
2. "[Product category] comparison: [us] vs alternatives" (comparison)
3. "[Industry] guide to [relevant topic]" (guide)
4. "Why we built [product] on [technology]" (behind the scenes)
5. "[Common question] answered" (FAQ-style, targets PAA)
```

## Post Template (Hono HTML Rendering)
```typescript
function renderPost(post: BlogPost): string {
  return `
    <article itemscope itemtype="https://schema.org/BlogPosting">
      <meta itemprop="datePublished" content="${post.date}">
      <meta itemprop="author" content="Brian Zalewski">

      <header>
        <time datetime="${post.date}">${formatDate(post.date)}</time>
        <span class="reading-time">${post.readingTime} min read</span>
        <h1 itemprop="headline">${post.title}</h1>
        <p class="description" itemprop="description">${post.description}</p>
      </header>

      ${post.image ? `<img src="${post.image}" alt="${post.title}" width="1200" height="675" loading="eager" itemprop="image">` : ''}

      <div class="content" itemprop="articleBody">
        ${post.html}
      </div>

      <footer>
        <div class="share">
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(post.url)}" target="_blank" rel="noopener">Share on X</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(post.url)}" target="_blank" rel="noopener">Share on LinkedIn</a>
        </div>
        ${renderRelatedPosts(post.related)}
      </footer>
    </article>
  `;
}
```

## RSS Feed
```typescript
app.get('/blog/rss.xml', async (c) => {
  const posts = await getAllPosts(c.env);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Brand Blog</title>
    <link>https://domain.com/blog</link>
    <description>Latest from Brand</description>
    <atom:link href="https://domain.com/blog/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map(p => `
    <item>
      <title>${escapeXml(p.title)}</title>
      <link>https://domain.com/blog/${p.slug}</link>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <guid>https://domain.com/blog/${p.slug}</guid>
    </item>`).join('')}
  </channel>
</rss>`;
  return c.text(rss, 200, { 'Content-Type': 'application/rss+xml' });
});
```

## Reading Time
```typescript
function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 250)); // 250 WPM average
}
```

## Structured Data (per post)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Post Title",
  "datePublished": "2026-04-19",
  "dateModified": "2026-04-19",
  "author": { "@type": "Person", "name": "Brian Zalewski" },
  "publisher": { "@type": "Organization", "name": "Brand", "logo": { "@type": "ImageObject", "url": "https://domain.com/logo.png" } },
  "description": "Meta description",
  "image": "https://domain.com/images/blog/post.webp",
  "mainEntityOfPage": "https://domain.com/blog/post-slug"
}
```
