# Marble.js + RxJS Todos — Full-Stack Reactive Design

**Date:** 2026-05-14
**Status:** Approved
**Prototype for:** rxjs-full (production project — full RxJS on client and server)

---

## Purpose

A learning project demonstrating the architectural symmetry between Marble.js (server-side RxJS) and RxJS (client-side). The core thesis: both ends of the stack share the same primitive — `Observable<T>` — and HTTP is just the bridge between them.

The demo is a Todos CRUD app with server mutations, intentionally simple in domain so the architecture is the foreground.

---

## Architecture Overview

### Folder Structure

```
marble-rxjs-todos/
├── src/
│   ├── shared/
│   │   └── types.ts              # Shared TS interfaces — single source of truth
│   ├── server/
│   │   ├── main.ts               # createServer({ httpListener })
│   │   ├── listener.ts           # combineRoutes
│   │   └── todos/
│   │       ├── todo.effect.ts    # HttpEffects: getAll$, create$, update$, delete$
│   │       ├── todo.validator.ts # io-ts codecs + requestValidator$
│   │       └── todo.store.ts     # in-memory BehaviorSubject<Todo[]>
│   └── client/
│       ├── main.ts               # mounts app, boot subscription, render loop
│       ├── h.ts                  # custom TSX factory — h(tag, props, ...children)
│       ├── todo.service.ts       # RxJS service: fromFetch wrappers → Observable<T>
│       ├── todo.state.ts         # BehaviorSubject + scan(reducer) — MVU store
│       └── components/
│           └── todo-item.tsx     # TSX component using custom h
├── index.html                    # Vite client entry
├── vite.config.ts                # proxies /api → localhost:3000
├── tsconfig.json                 # jsxFactory: "h"
└── package.json
```

### Runtime Setup

- **Server:** `ts-node` / `tsx` on port 3000
- **Client:** Vite dev server on port 5173, `/api` proxied to server (no CORS)
- **Communication:** REST over HTTP — GET, POST, PUT, DELETE on `/api/todos`

Vite proxy rewrites the path — client calls `/api/todos`, proxy strips `/api` before forwarding to server:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      rewrite: path => path.replace(/^\/api/, ''),
    },
  },
},
```

---

## Shared Types

Single file imported by both server and client. No duplication, no drift.

```typescript
// src/shared/types.ts

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

**Boundary rule:** io-ts codecs live only on the server (where untrusted data enters). The client imports the plain TS interfaces and trusts validated server responses. This keeps the client free of fp-ts overhead while preserving compile-time safety from the shared contract.

---

## Server — Marble.js HttpEffects

### In-Memory Store

```typescript
// src/server/todos/todo.store.ts
const store$ = new BehaviorSubject<Todo[]>([
  { id: '1', title: 'Learn Marble.js', completed: false, createdAt: new Date().toISOString() },
]);

export const getTodos = () => store$.getValue();
export const setTodos = (todos: Todo[]) => store$.next(todos);
```

The server store is a `BehaviorSubject<Todo[]>` — the same reactive primitive used on the client. This is intentional: the symmetry is the point.

### io-ts Validators

```typescript
// src/server/todos/todo.validator.ts
import * as t from 'io-ts';

export const CreateTodoCodec = t.type({ title: t.string });
export const UpdateTodoCodec = t.partial({ title: t.string, completed: t.boolean });
```

The codecs are derived from the same shapes as the shared interfaces. `typeof CreateTodoCodec._A` equals `CreateTodoBody` — the codec is the runtime enforcement of the compile-time contract.

### HttpEffects

Every route is `(req$: Observable<HttpRequest>) => Observable<HttpEffectResponse>` — a pure function composing RxJS operators. Validation happens inside the stream via `use(requestValidator$(...))`, not before it.

```typescript
// src/server/todos/todo.effect.ts

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
        title: req.body.title,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setTodos([...getTodos(), todo]);
      return { status: 201, body: todo };
    })
  );

export const update$: HttpEffect = req$ =>
  req$.pipe(
    use(requestValidator$({ body: UpdateTodoCodec })),
    map(req => {
      const updated = getTodos().map(t =>
        t.id === req.params.id ? { ...t, ...req.body } : t
      );
      setTodos(updated);
      return { body: updated.find(t => t.id === req.params.id) };
    })
  );

export const delete$: HttpEffect = req$ =>
  req$.pipe(
    map(req => {
      setTodos(getTodos().filter(t => t.id !== req.params.id));
      return { status: 204, body: {} };
    })
  );
```

### Route Registration

```typescript
// src/server/listener.ts
export const httpListener = createHttpListener({
  effects: [
    r.pipe(r.matchPath('/todos'),     r.matchType('GET'),    r.useEffect(getAll$)),
    r.pipe(r.matchPath('/todos'),     r.matchType('POST'),   r.useEffect(create$)),
    r.pipe(r.matchPath('/todos/:id'), r.matchType('PUT'),    r.useEffect(update$)),
    r.pipe(r.matchPath('/todos/:id'), r.matchType('DELETE'), r.useEffect(delete$)),
  ],
});
```

---

## Client — RxJS Service Layer

Exported functions, not a class. Each returns `Observable<T>`, mirroring the server Effect signature. `switchMap` flattens the `fromFetch` Promise into the Observable chain.

```typescript
// src/client/todo.service.ts
import { fromFetch } from 'rxjs/fetch';
import { Observable, from } from 'rxjs';
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

---

## Client — Custom TSX Factory

JSX without React. The factory creates real DOM nodes directly — no virtual DOM, no reconciliation. The teaching point: JSX is syntax sugar for `h(tag, props, ...children)`; swapping `jsxFactory` in `tsconfig.json` exposes the seam.

```typescript
// src/client/h.ts

type Props = Record<string, any> | null;
type Child = HTMLElement | string | number | null | undefined;

export function h(
  tag: string | ((props: Props, ...children: HTMLElement[]) => HTMLElement),
  props: Props,
  ...children: Child[]
): HTMLElement {
  if (typeof tag === 'function') {
    const resolved = children.map(normalizeChild).filter(Boolean) as HTMLElement[];
    return tag(props, ...resolved);
  }

  const el = document.createElement(tag);

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'className') {
        el.className = value;
      } else {
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
```

`tsconfig.json` configuration:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "null"
  }
}
```

---

## Client — State Management (MVU)

`BehaviorSubject` + `scan(reducer, initial)` — the same pattern validated in rxjs-todo-mvu. Actions are a discriminated union; the reducer is a pure function with no side effects.

```typescript
// src/client/todo.state.ts
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';
import type { Todo } from '../shared/types';

type Action =
  | { type: 'LOAD_SUCCESS'; todos: Todo[] }
  | { type: 'CREATE_SUCCESS'; todo: Todo }
  | { type: 'UPDATE_SUCCESS'; todo: Todo }
  | { type: 'DELETE_SUCCESS'; id: string }
  | { type: 'SET_ERROR'; message: string };

interface State {
  todos: Todo[];
  error: string | null;
}

const initial: State = { todos: [], error: null };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOAD_SUCCESS':   return { ...state, todos: action.todos, error: null };
    case 'CREATE_SUCCESS': return { ...state, todos: [...state.todos, action.todo] };
    case 'UPDATE_SUCCESS': return {
      ...state,
      todos: state.todos.map(t => t.id === action.todo.id ? action.todo : t),
    };
    case 'DELETE_SUCCESS': return {
      ...state,
      todos: state.todos.filter(t => t.id !== action.id),
    };
    case 'SET_ERROR':      return { ...state, error: action.message };
  }
};

export const action$ = new Subject<Action>();

export const state$ = action$.pipe(
  scan(reducer, initial),
  startWith(initial),
  shareReplay(1),
);

export const dispatch = (action: Action) => action$.next(action);
```

---

## Client — Reactive UI Wiring

One subscription at the root. On every `state$` emission the list is cleared and rebuilt from the current `todos` array. No diffing — intentionally simple to keep the streaming architecture in focus.

```typescript
// src/client/main.ts
import { catchError } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

const listEl = document.getElementById('todo-list')!;

// Boot: load all todos
getAll$().subscribe({
  next: todos => dispatch({ type: 'LOAD_SUCCESS', todos }),
  error: () => dispatch({ type: 'SET_ERROR', message: 'Failed to load' }),
});

// Reactive render loop
state$.subscribe(({ todos, error }) => {
  listEl.innerHTML = '';
  if (error) {
    listEl.appendChild(document.createTextNode(error));
    return;
  }
  todos.forEach(todo => {
    listEl.appendChild(
      <TodoItem
        todo={todo}
        onToggle={() =>
          update$(todo.id, { completed: !todo.completed })
            .pipe(catchError(() => EMPTY))
            .subscribe(updated => dispatch({ type: 'UPDATE_SUCCESS', todo: updated }))
        }
        onDelete={() =>
          remove$(todo.id).subscribe(() =>
            dispatch({ type: 'DELETE_SUCCESS', id: todo.id })
          )
        }
      />
    );
  });
});
```

---

## Data Flow (Mutation Example: Create Todo)

```
user submits "Add" form
  → create$(body) subscribed
  → POST /api/todos via Marble.js HttpEffect
  → requestValidator$ (io-ts) validates body
  → todo appended to server BehaviorSubject<Todo[]>
  → 201 response with new Todo
  → client receives Todo
  → dispatch({ type: 'CREATE_SUCCESS', todo })
  → action$ emits → scan(reducer) → state$ emits new State
  → state$ subscriber clears and rebuilds list DOM
```

---

## Testing Strategy

### Server Effects
Marble.js effects are pure functions. Pass a mock `req$` Observable, assert the emitted response object. No running HTTP server required.

```typescript
// Example
it('getAll$ returns current todos', () => {
  const req$ = of({} as HttpRequest);
  getAll$(req$).subscribe(res => {
    expect(res.body).toEqual(expect.arrayContaining([expect.objectContaining({ title: 'Learn Marble.js' })]));
  });
});
```

### Client Reducer
`reducer(state, action)` is a pure function — plain Vitest unit tests, no DOM, no Observables needed.

### Client Service
Vitest + `vi.mock` on `fromFetch`, or `TestScheduler` marble tests for the Observable chains.

### Key Principle
Because both sides are pure functions + Observables, nothing in the core logic requires a running server or browser to unit test.

---

## The Symmetry — Summary Table

| Concern              | Server (Marble.js)                              | Client (RxJS)                               |
|----------------------|--------------------------------------------------|----------------------------------------------|
| Core abstraction     | `HttpEffect = (req$) => Observable<Response>`   | `service fn = () => Observable<T>`           |
| State primitive      | `BehaviorSubject<Todo[]>`                        | `BehaviorSubject<State>` via `shareReplay`   |
| Stream composition   | `req$.pipe(use(...), map(...), mergeMap(...))`   | `fromFetch().pipe(switchMap(...), map(...))`  |
| Type contract        | io-ts codec → TS type (runtime + compile-time)  | Shared TS interface (compile-time)           |
| Everything is a…     | function `(Observable) => Observable`            | function `() => Observable`                  |
| Transport            | —                                                | HTTP (the only non-Observable boundary)      |
