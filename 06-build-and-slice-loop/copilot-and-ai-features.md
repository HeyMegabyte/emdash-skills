---
name: "Copilot and AI Features"
version: "2.0.0"
updated: "2026-04-23"
description: "CopilotKit for AI-powered UX with useCopilotReadable, useCopilotAction, CopilotTextarea, and CoAgents. Workers AI for edge inference and embeddings. CF Agents SDK with AIChatAgent for stateful AI. Patterns for in-app AI assistants, AI-assisted text input, context-aware suggestions, and intelligent automation."
---

# Copilot and AI Features
## CopilotKit Setup (Angular/React-compatible)
```typescript
// CopilotKit provides React hooks — for Angular, use the REST API + custom service
// Or embed CopilotKit React components via Angular elements wrapper

// copilot.service.ts (Angular — REST API approach)
import { Injectable } from '@angular/core';

interface CopilotAction {
  name: string;
  description: string;
  parameters: Array<{ name: string; type: string; description: string; required?: boolean }>;
  handler: (params: Record<string, unknown>) => Promise<unknown>;
}

@Injectable({ providedIn: 'root' })
export class CopilotService {
  private actions: CopilotAction[] = [];
  private context: Record<string, unknown> = {};

  /** Register app context the AI can read */
  addReadable(key: string, value: unknown): void {
    this.context[key] = value;
  }

  /** Register actions the AI can invoke */
  addAction(action: CopilotAction): void {
    this.actions.push(action);
  }

  /** Send user message with context + available actions to backend */
  async chat(message: string): Promise<string> {
    const res = await fetch('/api/copilot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context: this.context, actions: this.actions.map(({ handler, ...a }) => a) }),
    });
    const { response, actionCall } = await res.json();

    // Execute action if AI decided to call one
    if (actionCall) {
      const action = this.actions.find((a) => a.name === actionCall.name);
      if (action) await action.handler(actionCall.parameters);
    }

    return response;
  }
}
```

## CopilotKit React Hooks (reference — use in React or wrapped)
```tsx
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { CopilotTextarea } from '@copilotkit/react-textarea';
import { CopilotPopup } from '@copilotkit/react-ui';

// Make app state readable by AI
useCopilotReadable({
  description: 'Current user profile',
  value: { name: user.name, plan: user.plan, usage: user.usage },
});

useCopilotReadable({
  description: 'List of projects',
  value: projects.map((p) => ({ id: p.id, name: p.name, status: p.status })),
});

// Define actions AI can take
useCopilotAction({
  name: 'createProject',
  description: 'Create a new project with the given name and description',
  parameters: [
    { name: 'name', type: 'string', description: 'Project name', required: true },
    { name: 'description', type: 'string', description: 'Project description' },
  ],
  handler: async ({ name, description }) => {
    await api.createProject({ name, description });
  },
});

useCopilotAction({
  name: 'updateSettings',
  description: 'Update user notification or display settings',
  parameters: [
    { name: 'setting', type: 'string', description: 'Setting key' },
    { name: 'value', type: 'string', description: 'New value' },
  ],
  handler: async ({ setting, value }) => {
    await api.updateSetting(setting, value);
  },
});

// AI-assisted textarea with autocompletions
<CopilotTextarea
  placeholder="Describe your project..."
  autosuggestionsConfig={{
    textareaPurpose: 'Project description for a SaaS product',
    chatApiConfigs: { suggestionsApiConfig: { forwardedParams: { max_tokens: 50 } } },
  }}
/>

// Floating AI chat panel
<CopilotPopup
  labels={{ title: 'AI Assistant', initial: 'How can I help?' }}
  instructions="You help users manage their projects and settings."
/>
```

## Hono Copilot Backend (Workers AI)
```typescript
// src/routes/copilot.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const copilot = new Hono<{ Bindings: Env }>();

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(),
  actions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    parameters: z.array(z.object({ name: z.string(), type: z.string(), description: z.string() })),
  })).optional(),
});

copilot.post('/chat', zValidator('json', chatSchema), async (c) => {
  const { message, context, actions } = c.req.valid('json');

  const systemPrompt = `You are an AI assistant embedded in the app. Available context: ${JSON.stringify(context || {})}
Available actions you can call: ${JSON.stringify(actions || [])}
If the user's request matches an action, respond with JSON: {"actionCall":{"name":"...","parameters":{...}},"response":"..."}
Otherwise just respond naturally.`;

  const result = await c.env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message },
    ],
    max_tokens: 500,
  });

  // Parse potential action call from response
  let response = result.response;
  let actionCall = null;
  try {
    const parsed = JSON.parse(response);
    if (parsed.actionCall) {
      actionCall = parsed.actionCall;
      response = parsed.response;
    }
  } catch { /* plain text response */ }

  return c.json({ response, actionCall });
});

export { copilot };
```

## Workers AI: Embeddings + Semantic Search
```typescript
// Generate embeddings for content indexing
async function embedContent(text: string, env: Env): Promise<number[]> {
  const result = await env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [text] });
  return result.data[0];
}

// Store in Vectorize
async function indexDocument(doc: { id: string; text: string; metadata: Record<string, string> }, env: Env): Promise<void> {
  const embedding = await embedContent(doc.text, env);
  await env.VECTORIZE.upsert([{ id: doc.id, values: embedding, metadata: doc.metadata }]);
}

// Semantic search
async function searchSimilar(query: string, env: Env, topK = 5): Promise<VectorizeMatch[]> {
  const queryEmbedding = await embedContent(query, env);
  const results = await env.VECTORIZE.query(queryEmbedding, { topK, returnMetadata: 'all' });
  return results.matches;
}
```

## CoAgents Pattern (autonomous in-app agents)
```typescript
// CoAgent: multi-step task execution with tool use
// 1. User: "Set up my project for launch"
// 2. Agent plans: create checklist, verify settings, enable features
// 3. Agent executes each step via registered actions
// 4. Agent reports progress and results

// Backend: stateful agent loop
async function runCoAgent(goal: string, actions: CopilotAction[], env: Env): Promise<string[]> {
  const log: string[] = [];
  const messages = [
    { role: 'system' as const, content: `Execute this goal step by step. Call actions as needed. Actions: ${JSON.stringify(actions)}` },
    { role: 'user' as const, content: goal },
  ];

  for (let step = 0; step < 10; step++) {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages, max_tokens: 300 });
    log.push(result.response);

    if (result.response.includes('"done":true')) break;
    messages.push({ role: 'assistant' as const, content: result.response });
    messages.push({ role: 'user' as const, content: 'Continue to the next step.' });
  }

  return log;
}
```

## Wrangler Bindings
```toml
[ai]
binding = "AI"

[[vectorize]]
binding = "VECTORIZE"
index_name = "content-index"
```
