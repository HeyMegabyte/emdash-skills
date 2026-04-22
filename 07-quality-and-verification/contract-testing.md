---
name: "Contract Testing"
description: "Zod schema validation against live Hono API endpoints. Runtime type checking for API responses. Define schema → fetch endpoint → validate → fail on mismatch. Vitest integration for automated contract suites."
---

# Contract Testing

## Core Pattern
Zod schemas are source of truth (05/api-design). Contract tests verify live endpoints conform at runtime. No mocks — hit the real API, validate the real response.

```
Define Zod schema → fetch live endpoint → z.parse(response) → fail on mismatch
```

## Schema-First Contract Definition
```typescript
// contracts/api-contracts.ts
import { z } from 'zod';

// Health endpoint contract
export const HealthContract = z.object({
  status: z.enum(['ok', 'degraded', 'down']),
  version: z.string(),
  timestamp: z.string().datetime(),
});

// Error envelope contract (all error responses)
export const ErrorContract = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

// Paginated list contract factory
export function paginatedContract<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonneg(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
    hasMore: z.boolean(),
  });
}

// Example: User contract
export const UserContract = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
  role: z.enum(['user', 'admin']),
});

export const UserListContract = paginatedContract(UserContract);
```

## Contract Test Runner
```typescript
// tests/contracts/contract-runner.ts
import { z } from 'zod';

interface ContractTestCase {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  expectedStatus: number;
  schema: z.ZodType;
}

const BASE_URL = process.env.PROD_URL ?? 'http://localhost:8787';

export async function runContractTest(tc: ContractTestCase): Promise<{
  passed: boolean;
  errors?: z.ZodError;
  response?: unknown;
}> {
  const res = await fetch(`${BASE_URL}${tc.path}`, {
    method: tc.method,
    headers: {
      'Content-Type': 'application/json',
      ...tc.headers,
    },
    body: tc.body ? JSON.stringify(tc.body) : undefined,
  });

  if (res.status !== tc.expectedStatus) {
    return {
      passed: false,
      errors: new z.ZodError([{
        code: 'custom',
        path: ['status'],
        message: `Expected ${tc.expectedStatus}, got ${res.status}`,
      }]),
    };
  }

  const json = await res.json();
  const result = tc.schema.safeParse(json);

  return result.success
    ? { passed: true, response: result.data }
    : { passed: false, errors: result.error, response: json };
}
```

## Vitest Contract Suite
```typescript
// tests/contracts/api.contract.test.ts
import { describe, it, expect } from 'vitest';
import { runContractTest } from './contract-runner';
import {
  HealthContract,
  ErrorContract,
  UserListContract,
} from '../../contracts/api-contracts';

const PROD_URL = process.env.PROD_URL;

describe('API Contract Tests', () => {
  it('GET /health returns valid health response', async () => {
    const result = await runContractTest({
      name: 'health',
      method: 'GET',
      path: '/health',
      expectedStatus: 200,
      schema: HealthContract,
    });
    expect(result.passed, `Contract violation: ${result.errors?.message}`).toBe(true);
  });

  it('GET /api/nonexistent returns error envelope', async () => {
    const result = await runContractTest({
      name: 'not-found',
      method: 'GET',
      path: '/api/nonexistent-route-xyz',
      expectedStatus: 404,
      schema: ErrorContract,
    });
    expect(result.passed, `Error envelope mismatch: ${result.errors?.message}`).toBe(true);
  });

  it('GET /api/users returns paginated user list', async () => {
    const result = await runContractTest({
      name: 'user-list',
      method: 'GET',
      path: '/api/users?page=1&pageSize=10',
      expectedStatus: 200,
      schema: UserListContract,
      headers: { Authorization: `Bearer ${process.env.TEST_API_TOKEN}` },
    });
    expect(result.passed, `Contract violation: ${result.errors?.message}`).toBe(true);
  });

  it('POST /api/users with invalid body returns 400 + error envelope', async () => {
    const result = await runContractTest({
      name: 'user-create-invalid',
      method: 'POST',
      path: '/api/users',
      body: { invalid: true },
      expectedStatus: 400,
      schema: ErrorContract,
      headers: { Authorization: `Bearer ${process.env.TEST_API_TOKEN}` },
    });
    expect(result.passed, `Error envelope mismatch: ${result.errors?.message}`).toBe(true);
  });
});
```

## Hono RPC Type Safety
When using hc<AppType>, TypeScript already catches client-side mismatches at compile time. Contract tests add runtime verification against the deployed API:
```typescript
// Compile-time: hc<AppType> catches wrong paths/params/body shapes
// Runtime: contract tests catch server returning unexpected shapes
// Both needed: server could deploy schema changes without client rebuild
```

## Shared Schema Pattern
```
src/shared/schemas.ts     ← Zod schemas (source of truth)
  ├── used by Hono route  ← @hono/zod-validator
  ├── used by Angular     ← z.infer<typeof Schema> for types
  └── used by contracts   ← contract test validation
```

## CI Integration
```json
// package.json
{
  "scripts": {
    "test:contracts": "vitest run tests/contracts/ --reporter=verbose",
    "test:contracts:watch": "vitest tests/contracts/"
  }
}
```

## When to Run
Pre-deploy: never (schemas may not match yet). Post-deploy: always (verify live API). PR checks: against staging URL. Nightly: against production.

## Anti-Patterns
Never: mock API responses in contract tests (defeats the purpose)|skip error envelope validation|hardcode test data that changes|test against localhost in CI.
Always: test both success and error paths|validate pagination contracts|include auth header tests (401/403)|run against real deployed URL.
