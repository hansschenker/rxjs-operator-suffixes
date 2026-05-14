# Generic Runtime CRUD Layer — Design Spec

**Date:** 2026-05-14
**Status:** Approved

## Goal

A developer adds one schema file per domain entity. Everything else — server routes, handlers, OpenAPI spec, client state, service, and UI — generates automatically from the Drizzle table definition at runtime. No routes file, no handler file, no state file, no service file, no component file per entity.

---

## Architecture

Two layers:

1. **Generic core** (`src/core/`) — written once, never touched per entity
2. **Entity definitions** (`src/entities/<name>/schema.ts`) — one file per domain object

```
src/
  core/
    server/
      crud-router.ts        # createCrudRouter(db, table, schemas) → Hono router
    client/
      crud-state.ts         # createCrudState<T>() → action$, reducer, state$, dispatch
      crud-service.ts       # createCrudService<T>(basePath) → CRUD observables
      entity-panel.ts       # mountEntityPanel(config) → list + form from Zod shape
  entities/
    todos/
      schema.ts             # existing table (refactored to use core)
    products/               # example new entity
      schema.ts
  server/
    app.ts                  # registers each entity router
  client/
    main.tsx                # mounts each entity panel
```

The `todos` entity is refactored to consume the generic core, validating it before any new entity is added.

---

## Server: `createCrudRouter`

```typescript
// src/core/server/crud-router.ts
export function createCrudRouter(
  db: Db,
  table: SQLiteTableWithColumns<any>,
  schemas: { select: ZodSchema; create: ZodSchema; update: ZodSchema }
): Hono
```

Generates 4 routes mounted relative to the caller's path:

| Method | Path  | Description         |
|--------|-------|---------------------|
| GET    | `/`   | List all rows       |
| POST   | `/`   | Create a row        |
| PUT    | `/:id`| Update a row by id  |
| DELETE | `/:id`| Delete a row by id  |

- Uses `createRoute()` from `@hono/zod-openapi` for each route — OpenAPI spec auto-generated
- Handlers use sync Drizzle API (`.all()`, `.returning().all()`)
- `eq(table.id, id)` for WHERE clauses — assumes every table has an `id` text primary key
- Returns 404 JSON `{ message: 'Not found' }` when update/delete finds no row
- 422 validation errors handled by the parent `OpenAPIHono` `defaultHook`

**Registration in `app.ts`:**
```typescript
app.route('/todos',    createCrudRouter(db, todos,    { select: TodoSchema,    create: CreateTodoSchema,    update: UpdateTodoSchema }));
app.route('/products', createCrudRouter(db, products, { select: ProductSchema, create: CreateProductSchema, update: UpdateProductSchema }));
```

---

## Client: `createCrudState`

```typescript
// src/core/client/crud-state.ts
export type CrudAction<T> =
  | { type: 'LOAD_SUCCESS';   items: T[] }
  | { type: 'CREATE_SUCCESS'; item: T }
  | { type: 'UPDATE_SUCCESS'; item: T }
  | { type: 'DELETE_SUCCESS'; id: string }
  | { type: 'SET_ERROR';      message: string };

export interface CrudState<T> {
  items: T[];
  error: string | null;
}

export function createCrudState<T extends { id: string }>() {
  const action$ = new Subject<CrudAction<T>>();
  const state$  = action$.pipe(
    scan(crudReducer<T>, { items: [], error: null }),
    startWith({ items: [], error: null } as CrudState<T>),
    shareReplay(1),
  );
  const dispatch = (action: CrudAction<T>): void => action$.next(action);
  return { action$, state$, dispatch };
}
```

Pure `crudReducer<T>` handles all 5 action types. Identical logic to the existing todo reducer, parameterized on `T`.

---

## Client: `createCrudService`

```typescript
// src/core/client/crud-service.ts
export function createCrudService<T extends { id: string }>(basePath: string) {
  return {
    getAll$: (): Observable<T[]>                    => from(fetch(basePath).then(r => r.json())),
    create$: (body: unknown): Observable<T>         => from(fetch(basePath, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())),
    update$: (id: string, body: unknown): Observable<T> => from(fetch(`${basePath}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json())),
    remove$: (id: string): Observable<void>         => from(fetch(`${basePath}/${id}`, { method: 'DELETE' }).then(() => undefined)),
  };
}
```

---

## Client: `mountEntityPanel`

```typescript
// src/core/client/entity-panel.ts
export interface EntityPanelConfig {
  el: HTMLElement;          // container element
  basePath: string;         // e.g. '/api/products'
  schema: z.ZodObject<any>; // CreateSchema — drives form field generation
}

export function mountEntityPanel(config: EntityPanelConfig): void
```

Internally:
1. Calls `createCrudState<T>()` and `createCrudService<T>(basePath)`
2. Renders a `<form>` with inputs generated from `schema.shape`
3. Wires `fromEvent(form, 'submit')` → `exhaustMap(create$)` → dispatch
4. Subscribes to `state$` → re-renders list

### Field introspection

Walks `schema.shape` to pick the right input type per field:

| Zod type                         | Input rendered          |
|----------------------------------|-------------------------|
| `ZodBoolean`                     | `<input type="checkbox">` |
| `ZodNumber`                      | `<input type="number">`   |
| `ZodString` with key `*date*`    | `<input type="date">`     |
| `ZodString` (default)            | `<input type="text">`     |
| `ZodNullable` / `ZodOptional`    | unwrapped, then above     |

Column names are converted to display labels: `due_date` → "Due Date", `inStock` → "In Stock".

List rendering walks the same shape to display each field's value (checkbox for booleans, raw string otherwise). Toggle and delete buttons are added to every row.

---

## Adding a New Entity — Full Walkthrough

**1. Create `src/entities/products/schema.ts`:**
```typescript
export const products = sqliteTable('products', {
  id:      text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:    text('name').notNull(),
  price:   integer('price').notNull().default(0),
  inStock: integer('in_stock', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
export const ProductSchema       = createSelectSchema(products);
export const CreateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const UpdateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }).partial();
```

**2. Register on server (`app.ts`):**
```typescript
app.route('/products', createCrudRouter(db, products, {
  select: ProductSchema, create: CreateProductSchema, update: UpdateProductSchema,
}));
```

**3. Mount on client (`main.tsx`):**
```typescript
mountEntityPanel({ el: document.getElementById('products')!, basePath: '/api/products', schema: CreateProductSchema });
```

**4. Add container to HTML (`index.html`):**
```html
<div id="products"></div>
```

**5. Push schema:**
```bash
npm run db:push
```

Done. Full CRUD with Swagger docs and live UI — zero additional files.

---

## Non-Goals (this phase)

- Custom field ordering or labels per entity
- Custom renderers per field type
- Relations / foreign keys between entities
- Pagination or filtering
- Authentication / authorization

---

## Testing Strategy

- **`createCrudRouter`** — same pattern as `todo.handler.test.ts`: in-memory SQLite + `app.request()`
- **`createCrudState`** — pure reducer unit tests, parameterized on a test type
- **`createCrudService`** — `vi.stubGlobal('fetch', ...)` + `firstValueFrom`, same as `todo.service.test.ts`
- **`mountEntityPanel`** — jsdom integration test: mount with a test schema, submit form, verify list renders
- **Todos refactor** — existing 33 tests must still pass after todos is migrated to the core
