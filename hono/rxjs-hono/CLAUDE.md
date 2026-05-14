# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

This is a full-stack Todos demo app — **Hono on the server, RxJS MVU on the client** — mirroring the pattern in `../../marblejs/marblejs-jozef-flakus` but replacing Marble.js with Hono. Use `hono-doc.txt` and `Hono_API_Blueprint.pdf` as reference material for the Hono stack.

## Reference Implementation

Study `../../marblejs/marblejs-jozef-flakus/` for the exact structure to replicate:

| Concern | Marble.js project | Hono equivalent |
|---|---|---|
| Server framework | `@marblejs/http` + `r.pipe` effects | Hono `app.get/post/put/delete` |
| Body validation | `io-ts` codecs + `requestValidator$` | Zod schemas + `@hono/zod-openapi` |
| In-memory store | `BehaviorSubject` in `todo.store.ts` | Same pattern |
| Client state | `action$` + `scan` reducer in `todo.state.ts` | Same pattern — no changes |
| Client service | `fromFetch` wrappers in `todo.service.ts` | Same pattern — no changes |
| JSX factory | Custom `h()` in `h.ts` | Same — reuse or copy |
| Entry point | `main.tsx` wires form + state$ render loop | Same pattern |

## Planned Stack

**Server (port 3000)**
- Hono with `@hono/zod-openapi` for typed routes
- Zod schemas for request validation (replaces io-ts codecs)
- In-memory `BehaviorSubject` store (no database for this demo)
- Scalar or Swagger UI for interactive docs at `/docs`
- `hono/cors` middleware for Vite dev proxy

**Client (port 5173 via Vite)**
- RxJS MVU: `action$` Subject → `scan(reducer)` → `state$` BehaviorSubject chain with `shareReplay(1)`
- `fromFetch` service layer, `exhaustMap` for form submit, `switchMap` for queries
- Custom `h()` JSX factory (no React) — `tsconfig` sets `jsxFactory: "h"`
- State-driven render loop: `state$.subscribe(render)`

## Commands (once project is scaffolded)

```bash
npm run dev:server   # tsx watch src/server/main.ts  (port 3000)
npm run dev:client   # vite                           (port 5173)
npm run test         # vitest run
npm run typecheck    # tsc --noEmit
```

## Architecture

```
src/
  shared/
    types.ts          # Todo, CreateTodoBody, UpdateTodoBody interfaces
  server/
    main.ts           # createServer, bind port 3000
    app.ts            # Hono app instance + route registration
    todos/
      todo.routes.ts  # createRoute() contracts (method + Zod schemas)
      todo.handler.ts # AppRouteHandler implementations
      todo.store.ts   # BehaviorSubject in-memory store
  client/
    h.ts              # Custom JSX factory
    h.test.ts
    todo.state.ts     # action$, reducer, state$, dispatch
    todo.state.test.ts
    todo.service.ts   # fromFetch wrappers returning Observable<T>
    todo.service.test.ts
    main.tsx          # Boot: getAll$, form submit exhaustMap, state$ render loop
    components/
      todo-item.tsx
      todo-item.test.tsx
```

## Key Hono Patterns

**Route contract (separate from handler):**
```typescript
export const listTodosRoute = createRoute({
  method: 'get',
  path: '/todos',
  responses: {
    200: { content: { 'application/json': { schema: z.array(TodoSchema) } }, description: 'OK' },
  },
});
```

**Handler tied to contract:**
```typescript
export const listTodosHandler: AppRouteHandler<typeof listTodosRoute> = (c) => {
  return c.json(getTodos(), 200);
};
```

**App assembly:**
```typescript
const app = new OpenAPIHono();
app.openapi(listTodosRoute, listTodosHandler);
app.doc('/openapi.json', { openapi: '3.0.0', info: { title: 'Todos API', version: '1.0' } });
app.route('/docs', apiReference({ spec: { url: '/openapi.json' } }));
```

## Vite Proxy Config

Vite dev server proxies `/api/*` → `http://localhost:3000/*` (strip `/api` prefix). Client service calls use `BASE = '/api/todos'`.

## TypeScript

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
    "jsxFragmentFactory": "null"
  }
}
```
