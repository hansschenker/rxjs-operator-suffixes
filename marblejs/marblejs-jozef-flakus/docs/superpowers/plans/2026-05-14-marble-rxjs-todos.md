# Marble.js + RxJS Todos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Todo CRUD demo with Marble.js (server) and RxJS + custom TSX factory (client), demonstrating that `Observable<T>` is the shared primitive across the entire stack.

**Architecture:** Flat single repo — `src/server/` (Marble.js HttpEffects, in-memory BehaviorSubject store, io-ts validation) and `src/client/` (RxJS fromFetch service layer, MVU BehaviorSubject state, custom `h()` TSX factory) share `src/shared/types.ts`. Vite proxies `/api` to the server on port 3000.

**Tech Stack:** `@marblejs/core` v3, `@marblejs/middleware-body`, `@marblejs/middleware-io`, `io-ts` v2, `fp-ts` v2, RxJS 7, TypeScript 5, Vite 5, Vitest 1, `tsx` (server runner)

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | deps, scripts |
| `tsconfig.json` | strict TS, jsx factory |
| `vite.config.ts` | client bundle, /api proxy |
| `vitest.config.ts` | jsdom test environment |
| `index.html` | Vite entry |
| `src/shared/types.ts` | `Todo`, `CreateTodoBody`, `UpdateTodoBody` interfaces |
| `src/server/todos/todo.store.ts` | `BehaviorSubject<Todo[]>` in-memory store, `getTodos`, `setTodos`, `resetStore` |
| `src/server/todos/todo.store.test.ts` | store unit tests |
| `src/server/todos/todo.validator.ts` | io-ts codecs: `CreateTodoCodec`, `UpdateTodoCodec` |
| `src/server/todos/todo.validator.test.ts` | codec decode tests |
| `src/server/todos/todo.effect.ts` | `getAll$`, `create$`, `update$`, `delete$` HttpEffects |
| `src/server/todos/todo.effect.test.ts` | effect unit tests (pure Observable assertions) |
| `src/server/listener.ts` | `httpListener` — registers all routes |
| `src/server/main.ts` | `createServer` entry point |
| `src/client/h.ts` | `h(tag, props, ...children)` — custom TSX factory |
| `src/client/h.test.ts` | h() DOM unit tests |
| `src/client/todo.state.ts` | `Action` union, `reducer`, `state$`, `dispatch` |
| `src/client/todo.state.test.ts` | reducer pure function tests |
| `src/client/todo.service.ts` | `getAll$`, `create$`, `update$`, `remove$` — fromFetch wrappers |
| `src/client/todo.service.test.ts` | service tests with vi.mock on fromFetch |
| `src/client/components/todo-item.tsx` | `TodoItem` TSX component |
| `src/client/components/todo-item.test.tsx` | TodoItem DOM tests |
| `src/client/main.ts` | boot subscription + reactive render loop |

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "marble-rxjs-todos",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev:server": "tsx watch src/server/main.ts",
    "dev:client": "vite",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@marblejs/core": "^3.10.0",
    "@marblejs/middleware-body": "^3.10.0",
    "@marblejs/middleware-io": "^3.10.0",
    "fp-ts": "^2.16.0",
    "io-ts": "^2.2.21",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.4.0",
    "tsx": "^4.7.0",
    "vite": "^5.2.0",
    "vitest": "^1.5.0",
    "jsdom": "^24.0.0",
    "@vitest/coverage-v8": "^1.5.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "null",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'null',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'null',
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Marble.js + RxJS Todos</title>
  </head>
  <body>
    <h1>Todos</h1>
    <form id="add-form">
      <input id="title-input" type="text" placeholder="New todo..." required />
      <button type="submit">Add</button>
    </form>
    <ul id="todo-list"></ul>
    <div id="error-msg" style="color:red"></div>
    <script type="module" src="/src/client/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: No output (no errors). If you see module resolution errors for `@marblejs/*`, continue — they resolve after effects are written.

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json vite.config.ts vitest.config.ts index.html
git commit -m "feat: scaffold marble-rxjs-todos project"
```

---

## Task 2: Shared Types

**Files:**
- Create: `src/shared/types.ts`

- [ ] **Step 1: Write the failing test**

Create `src/shared/types.test.ts`:

```typescript
import type { Todo, CreateTodoBody, UpdateTodoBody } from './types';

describe('shared types', () => {
  it('Todo has required fields', () => {
    const todo: Todo = {
      id: '1',
      title: 'Test',
      completed: false,
      createdAt: new Date().toISOString(),
    };
    expect(todo.id).toBe('1');
    expect(todo.completed).toBe(false);
  });

  it('CreateTodoBody requires only title', () => {
    const body: CreateTodoBody = { title: 'New todo' };
    expect(body.title).toBe('New todo');
  });

  it('UpdateTodoBody allows partial fields', () => {
    const partial: UpdateTodoBody = { completed: true };
    expect(partial.completed).toBe(true);
    expect(partial.title).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/shared/types.test.ts
```

Expected: FAIL — `Cannot find module './types'`

- [ ] **Step 3: Create src/shared/types.ts**

```typescript
export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface CreateTodoBody {
  title: string;
}

export interface UpdateTodoBody {
  title?: string;
  completed?: boolean;
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/shared/types.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/shared/types.ts src/shared/types.test.ts
git commit -m "feat: add shared Todo types"
```

---

## Task 3: Server In-Memory Store

**Files:**
- Create: `src/server/todos/todo.store.ts`
- Create: `src/server/todos/todo.store.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/server/todos/todo.store.test.ts`:

```typescript
import { getTodos, setTodos, resetStore } from './todo.store';

describe('todo.store', () => {
  beforeEach(() => resetStore());

  it('starts with seeded todo', () => {
    const todos = getTodos();
    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe('Learn Marble.js');
  });

  it('setTodos replaces the store', () => {
    setTodos([{ id: '2', title: 'Test', completed: true, createdAt: '2026-01-01T00:00:00.000Z' }]);
    expect(getTodos()).toHaveLength(1);
    expect(getTodos()[0].id).toBe('2');
  });

  it('getTodos returns a copy, not the reference', () => {
    const a = getTodos();
    const b = getTodos();
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/server/todos/todo.store.test.ts
```

Expected: FAIL — `Cannot find module './todo.store'`

- [ ] **Step 3: Create src/server/todos/todo.store.ts**

```typescript
import { BehaviorSubject } from 'rxjs';
import type { Todo } from '../../shared/types';

const seed: Todo[] = [
  { id: '1', title: 'Learn Marble.js', completed: false, createdAt: new Date().toISOString() },
];

const store$ = new BehaviorSubject<Todo[]>([...seed]);

export const getTodos = (): Todo[] => [...store$.getValue()];
export const setTodos = (todos: Todo[]): void => store$.next(todos);
export const resetStore = (): void => store$.next([...seed]);
```

Note: `getTodos` returns a shallow copy — mutations to the returned array do not affect the store.

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/server/todos/todo.store.test.ts
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/todos/todo.store.ts src/server/todos/todo.store.test.ts
git commit -m "feat: add server in-memory Todo store"
```

---

## Task 4: Server io-ts Validators

**Files:**
- Create: `src/server/todos/todo.validator.ts`
- Create: `src/server/todos/todo.validator.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/server/todos/todo.validator.test.ts`:

```typescript
import { isRight, isLeft } from 'fp-ts/Either';
import { CreateTodoCodec, UpdateTodoCodec } from './todo.validator';

describe('CreateTodoCodec', () => {
  it('accepts valid body', () => {
    const result = CreateTodoCodec.decode({ title: 'Buy milk' });
    expect(isRight(result)).toBe(true);
  });

  it('rejects missing title', () => {
    const result = CreateTodoCodec.decode({});
    expect(isLeft(result)).toBe(true);
  });

  it('rejects non-string title', () => {
    const result = CreateTodoCodec.decode({ title: 42 });
    expect(isLeft(result)).toBe(true);
  });
});

describe('UpdateTodoCodec', () => {
  it('accepts partial update with completed only', () => {
    const result = UpdateTodoCodec.decode({ completed: true });
    expect(isRight(result)).toBe(true);
  });

  it('accepts partial update with title only', () => {
    const result = UpdateTodoCodec.decode({ title: 'Updated' });
    expect(isRight(result)).toBe(true);
  });

  it('accepts empty object (no-op update)', () => {
    const result = UpdateTodoCodec.decode({});
    expect(isRight(result)).toBe(true);
  });

  it('rejects completed as non-boolean', () => {
    const result = UpdateTodoCodec.decode({ completed: 'yes' });
    expect(isLeft(result)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/server/todos/todo.validator.test.ts
```

Expected: FAIL — `Cannot find module './todo.validator'`

- [ ] **Step 3: Create src/server/todos/todo.validator.ts**

```typescript
import * as t from 'io-ts';

export const CreateTodoCodec = t.type({
  title: t.string,
});

export const UpdateTodoCodec = t.partial({
  title: t.string,
  completed: t.boolean,
});

export type CreateTodoInput = t.TypeOf<typeof CreateTodoCodec>;
export type UpdateTodoInput = t.TypeOf<typeof UpdateTodoCodec>;
```

`t.TypeOf<typeof CreateTodoCodec>` equals `{ title: string }` — same as `CreateTodoBody` from shared types. These are the same shape; the codec is the runtime enforcement of that contract.

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/server/todos/todo.validator.test.ts
```

Expected: PASS — 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/todos/todo.validator.ts src/server/todos/todo.validator.test.ts
git commit -m "feat: add io-ts codecs for Todo request validation"
```

---

## Task 5: Server HttpEffects — getAll$ and create$

**Files:**
- Create: `src/server/todos/todo.effect.ts`
- Create: `src/server/todos/todo.effect.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/server/todos/todo.effect.test.ts`:

```typescript
import { firstValueFrom, of } from 'rxjs';
import type { HttpRequest } from '@marblejs/core';
import { resetStore, setTodos } from './todo.store';
import { getAll$, create$ } from './todo.effect';

const mockReq = (overrides: Partial<HttpRequest> = {}): HttpRequest =>
  ({ params: {}, query: {}, body: {}, headers: {}, ...overrides } as unknown as HttpRequest);

describe('getAll$', () => {
  beforeEach(() => resetStore());

  it('returns all todos as body', async () => {
    const req$ = of(mockReq());
    const res = await firstValueFrom(getAll$(req$));
    expect(Array.isArray(res.body)).toBe(true);
    expect((res.body as any[]).length).toBeGreaterThan(0);
  });

  it('returns 200 status (default)', async () => {
    const req$ = of(mockReq());
    const res = await firstValueFrom(getAll$(req$));
    expect(res.status).toBeUndefined();
  });
});

describe('create$', () => {
  beforeEach(() => resetStore());

  it('creates a new todo and returns 201', async () => {
    const req$ = of(mockReq({ body: { title: 'New todo' } }));
    const res = await firstValueFrom(create$(req$));
    expect(res.status).toBe(201);
    expect((res.body as any).title).toBe('New todo');
    expect((res.body as any).completed).toBe(false);
    expect((res.body as any).id).toBeDefined();
  });

  it('appends the new todo to the store', async () => {
    const req$ = of(mockReq({ body: { title: 'Appended' } }));
    await firstValueFrom(create$(req$));
    const { getTodos } = await import('./todo.store');
    expect(getTodos().some(t => t.title === 'Appended')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/server/todos/todo.effect.test.ts
```

Expected: FAIL — `Cannot find module './todo.effect'`

- [ ] **Step 3: Create src/server/todos/todo.effect.ts with getAll$ and create$**

```typescript
import { map } from 'rxjs/operators';
import { use, HttpEffect } from '@marblejs/core';
import { requestValidator$ } from '@marblejs/middleware-io';
import type { Todo } from '../../shared/types';
import { getTodos, setTodos } from './todo.store';
import { CreateTodoCodec, UpdateTodoCodec } from './todo.validator';

export const getAll$: HttpEffect = req$ =>
  req$.pipe(
    map(() => ({ body: getTodos() }))
  );

export const create$: HttpEffect = req$ =>
  req$.pipe(
    use(requestValidator$({ body: CreateTodoCodec })),
    map(req => {
      const todo: Todo = {
        id: crypto.randomUUID(),
        title: req.body.title as string,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos([...getTodos(), todo]);
      return { status: 201, body: todo };
    })
  );
```

Note: `requestValidator$` validates the body against `CreateTodoCodec` and narrows `req.body` to the decoded type inside the stream. Requests with an invalid body are rejected before `map` runs.

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/server/todos/todo.effect.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/todos/todo.effect.ts src/server/todos/todo.effect.test.ts
git commit -m "feat: add getAll$ and create$ HttpEffects"
```

---

## Task 6: Server HttpEffects — update$ and delete$

**Files:**
- Modify: `src/server/todos/todo.effect.ts`
- Modify: `src/server/todos/todo.effect.test.ts`

- [ ] **Step 1: Add failing tests for update$ and delete$**

Append to `src/server/todos/todo.effect.test.ts`:

```typescript
import { update$, delete$ } from './todo.effect';

describe('update$', () => {
  beforeEach(() => {
    resetStore();
    setTodos([{ id: '1', title: 'Original', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]);
  });

  it('updates the todo and returns it', async () => {
    const req$ = of(mockReq({ params: { id: '1' } as any, body: { completed: true } }));
    const res = await firstValueFrom(update$(req$));
    expect((res.body as any).completed).toBe(true);
    expect((res.body as any).title).toBe('Original');
  });

  it('persists the update to the store', async () => {
    const req$ = of(mockReq({ params: { id: '1' } as any, body: { title: 'Updated' } }));
    await firstValueFrom(update$(req$));
    const { getTodos } = await import('./todo.store');
    expect(getTodos()[0].title).toBe('Updated');
  });
});

describe('delete$', () => {
  beforeEach(() => {
    resetStore();
    setTodos([{ id: '1', title: 'To delete', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]);
  });

  it('returns 204 with empty body', async () => {
    const req$ = of(mockReq({ params: { id: '1' } as any }));
    const res = await firstValueFrom(delete$(req$));
    expect(res.status).toBe(204);
  });

  it('removes the todo from the store', async () => {
    const req$ = of(mockReq({ params: { id: '1' } as any }));
    await firstValueFrom(delete$(req$));
    const { getTodos } = await import('./todo.store');
    expect(getTodos()).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/server/todos/todo.effect.test.ts
```

Expected: FAIL — `update$ is not exported` / `delete$ is not exported`

- [ ] **Step 3: Add update$ and delete$ to todo.effect.ts**

Append to `src/server/todos/todo.effect.ts`:

```typescript
export const update$: HttpEffect = req$ =>
  req$.pipe(
    use(requestValidator$({ body: UpdateTodoCodec })),
    map(req => {
      const id = req.params['id'] as string;
      const updated = getTodos().map(t =>
        t.id === id ? { ...t, ...req.body } : t
      );
      setTodos(updated);
      return { body: updated.find(t => t.id === id) };
    })
  );

export const delete$: HttpEffect = req$ =>
  req$.pipe(
    map(req => {
      const id = req.params['id'] as string;
      setTodos(getTodos().filter(t => t.id !== id));
      return { status: 204, body: {} };
    })
  );
```

- [ ] **Step 4: Run all effect tests — expect pass**

```bash
npm test -- src/server/todos/todo.effect.test.ts
```

Expected: PASS — 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/server/todos/todo.effect.ts src/server/todos/todo.effect.test.ts
git commit -m "feat: add update$ and delete$ HttpEffects"
```

---

## Task 7: Server Wiring — Listener and Entry Point

**Files:**
- Create: `src/server/listener.ts`
- Create: `src/server/main.ts`

No unit tests — wiring code is verified by the integration smoke test in Task 13.

- [ ] **Step 1: Create src/server/listener.ts**

```typescript
import { createHttpListener, r } from '@marblejs/core';
import { bodyParser$ } from '@marblejs/middleware-body';
import { getAll$, create$, update$, delete$ } from './todos/todo.effect';

export const httpListener = createHttpListener({
  middlewares: [bodyParser$()],
  effects: [
    r.pipe(r.matchPath('/todos'),     r.matchType('GET'),    r.useEffect(getAll$)),
    r.pipe(r.matchPath('/todos'),     r.matchType('POST'),   r.useEffect(create$)),
    r.pipe(r.matchPath('/todos/:id'), r.matchType('PUT'),    r.useEffect(update$)),
    r.pipe(r.matchPath('/todos/:id'), r.matchType('DELETE'), r.useEffect(delete$)),
  ],
});
```

`bodyParser$()` parses `application/json` request bodies so that `req.body` is available to effects.

- [ ] **Step 2: Create src/server/main.ts**

```typescript
import { createServer } from '@marblejs/core';
import { httpListener } from './listener';

const server = createServer({
  port: 3000,
  httpListener,
});

server.run();

console.log('Server running on http://localhost:3000');
```

- [ ] **Step 3: Verify the server starts**

```bash
npm run dev:server
```

Expected output:
```
Server running on http://localhost:3000
```

Test it manually with curl or a browser:
```bash
curl http://localhost:3000/todos
```

Expected:
```json
[{"id":"1","title":"Learn Marble.js","completed":false,"createdAt":"..."}]
```

Stop the server with `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add src/server/listener.ts src/server/main.ts
git commit -m "feat: wire Marble.js server with httpListener and routes"
```

---

## Task 8: Custom h() TSX Factory

**Files:**
- Create: `src/client/h.ts`
- Create: `src/client/h.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/client/h.test.ts`:

```typescript
import { h } from './h';

describe('h() — element creation', () => {
  it('creates element with correct tag', () => {
    const el = h('div', null);
    expect(el.tagName).toBe('DIV');
  });

  it('sets className from props', () => {
    const el = h('span', { className: 'active' });
    expect(el.className).toBe('active');
  });

  it('sets arbitrary attribute from props', () => {
    const el = h('input', { type: 'checkbox' });
    expect(el.getAttribute('type')).toBe('checkbox');
  });

  it('sets boolean DOM property checked correctly', () => {
    const el = h('input', { type: 'checkbox', checked: true }) as HTMLInputElement;
    expect(el.checked).toBe(true);
  });

  it('sets boolean DOM property checked=false correctly', () => {
    const el = h('input', { type: 'checkbox', checked: false }) as HTMLInputElement;
    expect(el.checked).toBe(false);
  });

  it('attaches event listener from onX prop', () => {
    let clicked = false;
    const el = h('button', { onClick: () => { clicked = true; } });
    el.click();
    expect(clicked).toBe(true);
  });

  it('appends string children as text nodes', () => {
    const el = h('p', null, 'Hello');
    expect(el.textContent).toBe('Hello');
  });

  it('appends element children', () => {
    const child = h('span', null, 'inner');
    const parent = h('div', null, child);
    expect(parent.firstChild).toBe(child);
  });

  it('ignores null and undefined children', () => {
    const el = h('div', null, null, undefined, 'visible');
    expect(el.textContent).toBe('visible');
    expect(el.childNodes).toHaveLength(1);
  });

  it('calls function components with props and children', () => {
    const MyComp = (props: { label: string } | null) =>
      h('span', { className: 'comp' }, props?.label ?? '');
    const el = h(MyComp, { label: 'test' });
    expect(el.tagName).toBe('SPAN');
    expect(el.textContent).toBe('test');
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/client/h.test.ts
```

Expected: FAIL — `Cannot find module './h'`

- [ ] **Step 3: Create src/client/h.ts**

```typescript
export type Props = Record<string, unknown> | null;
type Child = HTMLElement | string | number | null | undefined;

// Boolean DOM properties that must be set as property (not attribute)
const BOOL_PROPS = new Set(['checked', 'disabled', 'selected', 'multiple']);

export function h(
  tag: string | ((props: Props, ...children: HTMLElement[]) => HTMLElement),
  props: Props,
  ...children: Child[]
): HTMLElement {
  if (typeof tag === 'function') {
    const resolved = children.map(normalizeChild).filter((n): n is HTMLElement => n !== null);
    return tag(props, ...resolved);
  }

  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (key === 'className') {
        el.className = value as string;
      } else if (BOOL_PROPS.has(key)) {
        (el as unknown as Record<string, unknown>)[key] = Boolean(value);
      } else if (value !== undefined && value !== null) {
        el.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    const node = normalizeChild(child);
    if (node) el.appendChild(node);
  }

  return el;
}

function normalizeChild(child: Child): Node | null {
  if (child == null) return null;
  if (child instanceof Node) return child;
  return document.createTextNode(String(child));
}

// JSX namespace — tells TypeScript our JSX factory returns HTMLElement
declare global {
  namespace JSX {
    type Element = HTMLElement;
    interface IntrinsicElements {
      [tag: string]: Props;
    }
  }
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/client/h.test.ts
```

Expected: PASS — 10 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/client/h.ts src/client/h.test.ts
git commit -m "feat: add custom h() TSX factory"
```

---

## Task 9: Client MVU State

**Files:**
- Create: `src/client/todo.state.ts`
- Create: `src/client/todo.state.test.ts`

- [ ] **Step 1: Write failing tests for the reducer**

Create `src/client/todo.state.test.ts`:

```typescript
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

// Import reducer internals via a named export for testing
import { reducer, initialState } from './todo.state';
import type { Todo } from '../shared/types';

const mockTodo: Todo = {
  id: '1',
  title: 'Test todo',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('reducer', () => {
  it('LOAD_SUCCESS replaces todos', () => {
    const state = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
    expect(state.todos).toEqual([mockTodo]);
    expect(state.error).toBeNull();
  });

  it('CREATE_SUCCESS appends todo', () => {
    const state = reducer(initialState, { type: 'CREATE_SUCCESS', todo: mockTodo });
    expect(state.todos).toHaveLength(1);
    expect(state.todos[0]).toEqual(mockTodo);
  });

  it('UPDATE_SUCCESS replaces matching todo', () => {
    const start = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
    const updated = { ...mockTodo, completed: true };
    const state = reducer(start, { type: 'UPDATE_SUCCESS', todo: updated });
    expect(state.todos[0].completed).toBe(true);
  });

  it('DELETE_SUCCESS removes matching todo', () => {
    const start = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
    const state = reducer(start, { type: 'DELETE_SUCCESS', id: '1' });
    expect(state.todos).toHaveLength(0);
  });

  it('SET_ERROR sets error message', () => {
    const state = reducer(initialState, { type: 'SET_ERROR', message: 'Network error' });
    expect(state.error).toBe('Network error');
  });

  it('is a pure function — does not mutate input state', () => {
    const before = { ...initialState };
    reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
    expect(initialState).toEqual(before);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/client/todo.state.test.ts
```

Expected: FAIL — `Cannot find module './todo.state'`

- [ ] **Step 3: Create src/client/todo.state.ts**

```typescript
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';
import type { Todo } from '../shared/types';

export type Action =
  | { type: 'LOAD_SUCCESS'; todos: Todo[] }
  | { type: 'CREATE_SUCCESS'; todo: Todo }
  | { type: 'UPDATE_SUCCESS'; todo: Todo }
  | { type: 'DELETE_SUCCESS'; id: string }
  | { type: 'SET_ERROR'; message: string };

export interface State {
  todos: Todo[];
  error: string | null;
}

export const initialState: State = { todos: [], error: null };

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_SUCCESS':
      return { ...state, todos: action.todos, error: null };
    case 'CREATE_SUCCESS':
      return { ...state, todos: [...state.todos, action.todo] };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        todos: state.todos.map(t => (t.id === action.todo.id ? action.todo : t)),
      };
    case 'DELETE_SUCCESS':
      return { ...state, todos: state.todos.filter(t => t.id !== action.id) };
    case 'SET_ERROR':
      return { ...state, error: action.message };
  }
};

export const action$ = new Subject<Action>();

export const state$ = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1),
);

export const dispatch = (action: Action): void => action$.next(action);
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/client/todo.state.test.ts
```

Expected: PASS — 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/client/todo.state.ts src/client/todo.state.test.ts
git commit -m "feat: add client MVU state — reducer, action$, state$, dispatch"
```

---

## Task 10: Client Service Layer

**Files:**
- Create: `src/client/todo.service.ts`
- Create: `src/client/todo.service.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/client/todo.service.test.ts`:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

vi.mock('rxjs/fetch', () => ({
  fromFetch: vi.fn(),
}));

import { fromFetch } from 'rxjs/fetch';
import { of } from 'rxjs';
import { getAll$, create$, update$, remove$ } from './todo.service';
import type { Todo } from '../shared/types';

const mockTodo: Todo = { id: '1', title: 'Test', completed: false, createdAt: '2026-01-01T00:00:00.000Z' };

const mockResponse = (data: unknown) =>
  of({ json: () => Promise.resolve(data) } as unknown as Response);

beforeEach(() => vi.clearAllMocks());

describe('getAll$', () => {
  it('fetches GET /api/todos and returns Todo[]', async () => {
    vi.mocked(fromFetch).mockReturnValueOnce(mockResponse([mockTodo]) as any);
    const todos = await firstValueFrom(getAll$());
    expect(todos).toEqual([mockTodo]);
    expect(fromFetch).toHaveBeenCalledWith('/api/todos');
  });
});

describe('create$', () => {
  it('posts to /api/todos with JSON body and returns Todo', async () => {
    vi.mocked(fromFetch).mockReturnValueOnce(mockResponse(mockTodo) as any);
    const todo = await firstValueFrom(create$({ title: 'Test' }));
    expect(todo).toEqual(mockTodo);
    expect(fromFetch).toHaveBeenCalledWith('/api/todos', expect.objectContaining({ method: 'POST' }));
  });
});

describe('update$', () => {
  it('puts to /api/todos/:id and returns updated Todo', async () => {
    const updated = { ...mockTodo, completed: true };
    vi.mocked(fromFetch).mockReturnValueOnce(mockResponse(updated) as any);
    const result = await firstValueFrom(update$('1', { completed: true }));
    expect(result.completed).toBe(true);
    expect(fromFetch).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'PUT' }));
  });
});

describe('remove$', () => {
  it('sends DELETE to /api/todos/:id', async () => {
    vi.mocked(fromFetch).mockReturnValueOnce(mockResponse(null) as any);
    await firstValueFrom(remove$('1'));
    expect(fromFetch).toHaveBeenCalledWith('/api/todos/1', expect.objectContaining({ method: 'DELETE' }));
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/client/todo.service.test.ts
```

Expected: FAIL — `Cannot find module './todo.service'`

- [ ] **Step 3: Create src/client/todo.service.ts**

```typescript
import { Observable, from } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { switchMap, map } from 'rxjs/operators';
import type { Todo, CreateTodoBody, UpdateTodoBody } from '../shared/types';

const BASE = '/api/todos';

const json$ = <T>(res: Response): Observable<T> =>
  from(res.json() as Promise<T>);

export const getAll$ = (): Observable<Todo[]> =>
  fromFetch(BASE).pipe(switchMap(res => json$<Todo[]>(res)));

export const create$ = (body: CreateTodoBody): Observable<Todo> =>
  fromFetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).pipe(switchMap(res => json$<Todo>(res)));

export const update$ = (id: string, body: UpdateTodoBody): Observable<Todo> =>
  fromFetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).pipe(switchMap(res => json$<Todo>(res)));

export const remove$ = (id: string): Observable<void> =>
  fromFetch(`${BASE}/${id}`, { method: 'DELETE' }).pipe(map(() => undefined));
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/client/todo.service.test.ts
```

Expected: PASS — 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/client/todo.service.ts src/client/todo.service.test.ts
git commit -m "feat: add RxJS client service layer (fromFetch wrappers)"
```

---

## Task 11: TodoItem TSX Component

**Files:**
- Create: `src/client/components/todo-item.tsx`
- Create: `src/client/components/todo-item.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/client/components/todo-item.test.tsx`:

```typescript
import { h } from '../h';
import { TodoItem } from './todo-item';
import type { Todo } from '../../shared/types';

const mockTodo: Todo = { id: '1', title: 'Buy milk', completed: false, createdAt: '2026-01-01T00:00:00.000Z' };

describe('TodoItem', () => {
  it('renders todo title', () => {
    const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
    expect(el.textContent).toContain('Buy milk');
  });

  it('checkbox is unchecked when todo.completed is false', () => {
    const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
    const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('adds completed class when todo.completed is true', () => {
    const el = <TodoItem todo={{ ...mockTodo, completed: true }} onToggle={() => {}} onDelete={() => {}} />;
    expect(el.className).toContain('completed');
  });

  it('calls onToggle when checkbox changes', () => {
    let toggled = false;
    const el = <TodoItem todo={mockTodo} onToggle={() => { toggled = true; }} onDelete={() => {}} />;
    const checkbox = el.querySelector('input') as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change'));
    expect(toggled).toBe(true);
  });

  it('calls onDelete when delete button clicked', () => {
    let deleted = false;
    const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => { deleted = true; }} />;
    const btn = el.querySelector('button') as HTMLButtonElement;
    btn.click();
    expect(deleted).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npm test -- src/client/components/todo-item.test.tsx
```

Expected: FAIL — `Cannot find module './todo-item'`

- [ ] **Step 3: Create src/client/components/todo-item.tsx**

```tsx
import { h } from '../h';
import type { Todo } from '../../shared/types';

interface Props {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

export const TodoItem = ({ todo, onToggle, onDelete }: Props): HTMLElement => (
  <li className={todo.completed ? 'completed' : ''}>
    <input
      type="checkbox"
      checked={todo.completed}
      onChange={onToggle}
    />
    <span>{todo.title}</span>
    <button onClick={onDelete}>Delete</button>
  </li>
);
```

- [ ] **Step 4: Run test — expect pass**

```bash
npm test -- src/client/components/todo-item.test.tsx
```

Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/client/components/todo-item.tsx src/client/components/todo-item.test.tsx
git commit -m "feat: add TodoItem TSX component"
```

---

## Task 12: App Entry Point Wiring

**Files:**
- Create: `src/client/main.ts`

No unit tests — this is glue code connecting the layers. Verified by the integration smoke test.

- [ ] **Step 1: Create src/client/main.ts**

```typescript
import { h } from './h';
import { state$, dispatch } from './todo.state';
import { getAll$, create$, update$, remove$ } from './todo.service';
import { TodoItem } from './components/todo-item';
import { catchError, EMPTY } from 'rxjs';

const listEl = document.getElementById('todo-list')!;
const errorEl = document.getElementById('error-msg')!;
const form = document.getElementById('add-form') as HTMLFormElement;
const titleInput = document.getElementById('title-input') as HTMLInputElement;

// Boot: load all todos on startup
getAll$().subscribe({
  next: todos => dispatch({ type: 'LOAD_SUCCESS', todos }),
  error: () => dispatch({ type: 'SET_ERROR', message: 'Failed to load todos.' }),
});

// Form submit: create a new todo
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  create$({ title })
    .pipe(catchError(() => {
      dispatch({ type: 'SET_ERROR', message: 'Failed to create todo.' });
      return EMPTY;
    }))
    .subscribe(todo => {
      dispatch({ type: 'CREATE_SUCCESS', todo });
      titleInput.value = '';
    });
});

// Reactive render loop — re-renders the list on every state$ emission
state$.subscribe(({ todos, error }) => {
  errorEl.textContent = error ?? '';
  listEl.innerHTML = '';

  todos.forEach(todo => {
    listEl.appendChild(
      <TodoItem
        todo={todo}
        onToggle={() => {
          update$(todo.id, { completed: !todo.completed })
            .pipe(catchError(() => EMPTY))
            .subscribe(updated => dispatch({ type: 'UPDATE_SUCCESS', todo: updated }));
        }}
        onDelete={() => {
          remove$(todo.id)
            .pipe(catchError(() => EMPTY))
            .subscribe(() => dispatch({ type: 'DELETE_SUCCESS', id: todo.id }));
        }}
      />
    );
  });
});
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/client/main.ts
git commit -m "feat: wire client app entry point — boot, form, reactive render loop"
```

---

## Task 13: Integration Smoke Test

No automated test — manual verification that server and client work end-to-end.

- [ ] **Step 1: Start the server**

In terminal 1:
```bash
npm run dev:server
```

Expected:
```
Server running on http://localhost:3000
```

- [ ] **Step 2: Start the client**

In terminal 2:
```bash
npm run dev:client
```

Expected:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

- [ ] **Step 3: Load the app in the browser**

Open `http://localhost:5173` in a browser.

Expected: Page loads with one todo: "Learn Marble.js".

- [ ] **Step 4: Test Create**

Type "Buy groceries" in the input and click Add.

Expected: New todo appears in the list below "Learn Marble.js".

- [ ] **Step 5: Test Update (toggle)**

Click the checkbox on "Buy groceries".

Expected: The item gets the `completed` class (struck through if you add CSS) and the checkbox is checked.

- [ ] **Step 6: Test Delete**

Click Delete on "Learn Marble.js".

Expected: Only "Buy groceries" remains.

- [ ] **Step 7: Verify server-side persistence across page reload**

Refresh the browser.

Expected: The current state persists (the in-memory store survives a page refresh but not a server restart — this is expected behavior for the in-memory store).

- [ ] **Step 8: Run the full test suite one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 9: Final commit**

```bash
git add .
git commit -m "feat: complete Marble.js + RxJS Todos prototype"
```

---

## Architecture Symmetry — Reference Card

| Concern | Server (Marble.js) | Client (RxJS) |
|---|---|---|
| Core unit | `HttpEffect = (req$) => Observable<Response>` | `service fn = () => Observable<T>` |
| State store | `BehaviorSubject<Todo[]>` | `BehaviorSubject<State>` via `shareReplay` |
| Stream ops | `req$.pipe(use(...), map(...))` | `fromFetch().pipe(switchMap(...), map(...))` |
| Type contract | io-ts codec → TS type | Shared TS interface |
| Everything is a | pure function `(Observable) => Observable` | pure function `() => Observable` |
| Transport | — | HTTP (the only non-Observable boundary) |
