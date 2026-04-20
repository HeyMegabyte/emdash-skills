---
name: "Drizzle ORM and Migrations"
description: "Drizzle ORM as the database abstraction layer for D1 (SQLite) and Neon (PostgreSQL). Schema-first design with auto-generated migrations, type-safe queries, and the Drizzle → D1/Neon setup pattern. Covers schema conventions, relation patterns, migration workflow, and seed data."---

# Drizzle ORM and Migrations

> Type-safe database access. Schema as code. Migrations that don't break.

---

## Why Drizzle
- Type-safe queries (no raw SQL strings with unknown types)
- Schema defined in TypeScript (single source of truth)
- Auto-generated migrations via `drizzle-kit`
- Works with D1 (SQLite) and Neon (PostgreSQL)
- Lightweight — no heavy runtime, perfect for Workers

## Setup

### Install
```bash
npm install drizzle-orm
npm install -D drizzle-kit
```

### drizzle.config.ts
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite', // or 'postgresql' for Neon
  driver: 'd1-http',
});
```

### Worker Binding
```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

app.use('*', async (c, next) => {
  c.set('db', drizzle(c.env.DB, { schema }));
  await next();
});
```

## Schema Conventions

### Standard Columns (Every Table)
```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ULID for ordered primary keys (better D1 insert performance)
// See: https://github.com/ulid/spec
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // ULID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`).notNull(),
  deletedAt: text('deleted_at'), // Soft delete — null means active
});
```

### Naming Rules
- Tables: plural snake_case (`users`, `blog_posts`, `donation_records`)
- Columns: snake_case (`created_at`, `stripe_customer_id`)
- TypeScript: camelCase (`createdAt`, `stripeCustomerId`) — Drizzle maps automatically
- Indexes: `idx_{table}_{column}` (`idx_users_email`)
- Foreign keys: `{referenced_table}_id` (`user_id`, `post_id`)

### Relations
```typescript
import { relations } from 'drizzle-orm';

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id),
  publishedAt: text('published_at'),
  createdAt: text('created_at').default(sql`(datetime('now'))`).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

### Indexes
```typescript
import { index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
  // ... columns
}, (table) => ({
  slugIdx: uniqueIndex('idx_posts_slug').on(table.slug),
  authorIdx: index('idx_posts_author').on(table.authorId),
  publishedIdx: index('idx_posts_published').on(table.publishedAt),
}));
```

## Migration Workflow

### Generate Migration
```bash
npx drizzle-kit generate
# Creates: drizzle/0001_initial.sql
```

### Apply to D1
```bash
npx wrangler d1 migrations apply DB --local  # Test locally first
npx wrangler d1 migrations apply DB          # Apply to production
```

### Migration Best Practices
- Always generate, never hand-write SQL
- Test locally before applying to production
- Never rename columns in production (add new, migrate data, drop old)
- Add indexes AFTER initial data load for speed
- Use `PRAGMA optimize` after bulk writes

## Common Query Patterns

### Select with Relations
```typescript
const postsWithAuthor = await db.query.posts.findMany({
  with: { author: true },
  where: isNotNull(posts.publishedAt),
  orderBy: [desc(posts.publishedAt)],
  limit: 10,
});
```

### Insert
```typescript
import { ulid } from 'ulid';

await db.insert(users).values({
  id: ulid(),
  email: parsed.email,
  name: parsed.name,
});
```

### Update
```typescript
await db.update(users)
  .set({ name: parsed.name, updatedAt: sql`datetime('now')` })
  .where(eq(users.id, userId));
```

### Soft Delete
```typescript
await db.update(users)
  .set({ deletedAt: sql`datetime('now')` })
  .where(eq(users.id, userId));

// Always filter out soft-deleted in queries
const activeUsers = await db.query.users.findMany({
  where: isNull(users.deletedAt),
});
```

### Transaction
```typescript
await db.batch([
  db.insert(donations).values({ id: ulid(), amount: 5000, userId }),
  db.update(campaigns).set({ raised: sql`raised + 5000` }).where(eq(campaigns.id, campaignId)),
]);
```

## Seed Data

```typescript
// src/db/seed.ts — run after migrations
async function seed(db: DrizzleD1Database) {
  await db.insert(users).values([
    { id: ulid(), email: 'brian@megabyte.space', name: 'Brian Zalewski', role: 'admin' },
  ]);
}
```

## Neon (PostgreSQL) Variant

When D1 isn't enough (complex joins, full-text search, > 5GB):

```typescript
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

const sql = neon(env.DATABASE_URL);
const db = drizzle(sql, { schema });
```

Schema uses `pgTable` instead of `sqliteTable`, `serial` instead of manual IDs, and `timestamp` instead of `text` for dates.
