# Generic Runtime CRUD Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace per-entity routes/handlers/state/service/component files with a generic core layer — developer adds one `src/entities/<name>/schema.ts` file and gets full CRUD (server routes, OpenAPI spec, client state, service, UI) automatically.

**Architecture:** A `src/core/` layer provides three generic factories (`createCrudRouter`, `createCrudState<T>`, `createCrudService<T>`) and one panel orchestrator (`mountEntityPanel`). The `todos` entity is migrated first to validate the core; `products` is added as the proof-of-concept second entity.

**Tech Stack:** Hono + @hono/zod-openapi (server), Drizzle ORM + better-sqlite3 (database), Zod (schema + runtime introspection), RxJS (client state), Vitest + jsdom (tests)

---

## File Map

**Create (core):**
- `src/core/server/crud-router.ts` + `src/core/server/crud-router.test.ts`
- `src/core/client/crud-state.ts` + `src/core/client/crud-state.test.ts`
- `src/core/client/crud-service.ts` + `src/core/client/crud-service.test.ts`
- `src/core/client/entity-panel.ts` + `src/core/client/entity-panel.test.ts`

**Create (entities):**
- `src/entities/todos/schema.ts` — todos table + Zod schemas (moved from `src/server/db/schema.ts`)
- `src/entities/products/schema.ts` — products table + Zod schemas

**Modify:**
- `src/server/app.ts` — use `createCrudRouter`; register both entities
- `src/server/db/index.ts` — import schema from entities, not from `db/schema.ts`
- `src/server/todos/todo.handler.test.ts` — update schema import path
- `drizzle.config.ts` — glob schema path to cover all entities
- `index.html` — replace hand-crafted form with entity container divs
- `src/client/main.tsx` — two `mountEntityPanel` calls

**Delete (after migration compiles cleanly):**
- `src/server/db/schema.ts`
- `src/server/todos/todo.routes.ts`
- `src/server/todos/todo.handler.ts`
- `src/client/todo.state.ts` + `src/client/todo.state.test.ts`
- `src/client/todo.service.ts` + `src/client/todo.service.test.ts`
- `src/client/components/todo-item.tsx` + `src/client/components/todo-item.test.tsx`

---

## Task 1: `src/core/server/crud-router.ts`

**Files:**
- Create: `src/core/server/crud-router.test.ts`
- Create: `src/core/server/crud-router.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/core/server/crud-router.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { OpenAPIHono } from '@hono/zod-openapi';
import { createCrudRouter } from './crud-router';

const items = sqliteTable('items', {
	id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name:      text('name').notNull(),
	done:      integer('done', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
const ItemSchema       = createSelectSchema(items);
const CreateItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });
const UpdateItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true }).partial();

type Item = { id: string; name: string; done: boolean; createdAt: string };

function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.exec(`
		CREATE TABLE items (
			id         TEXT PRIMARY KEY NOT NULL,
			name       TEXT NOT NULL,
			done       INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL
		)
	`);
	return drizzle(sqlite);
}

describe('createCrudRouter', () => {
	let router: OpenAPIHono;

	beforeEach(() => {
		router = createCrudRouter(createTestDb(), items, {
			select: ItemSchema, create: CreateItemSchema, update: UpdateItemSchema,
		});
	});

	test('GET / returns 200 with empty array', async () => {
		const res = await router.request('/');
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual([]);
	});

	test('POST / creates item and returns 201', async () => {
		const res = await router.request('/', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ name: 'Widget' }),
		});
		expect(res.status).toBe(201);
		const item = await res.json() as Item;
		expect(item.name).toBe('Widget');
		expect(item.done).toBe(false);
		expect(typeof item.id).toBe('string');
	});

	test('POST / returns 422 for missing required field', async () => {
		const res = await router.request('/', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({}),
		});
		expect(res.status).toBe(422);
	});

	test('PUT /:id updates item and returns 200', async () => {
		const created = await (await router.request('/', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ name: 'Widget' }),
		})).json() as Item;

		const res = await router.request(`/${created.id}`, {
			method:  'PUT',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ done: true }),
		});
		expect(res.status).toBe(200);
		const updated = await res.json() as Item;
		expect(updated.done).toBe(true);
		expect(updated.name).toBe('Widget');
	});

	test('PUT /:id returns 404 for unknown id', async () => {
		const res = await router.request('/nonexistent', {
			method:  'PUT',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ done: true }),
		});
		expect(res.status).toBe(404);
	});

	test('DELETE /:id removes item and returns 204', async () => {
		const created = await (await router.request('/', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ name: 'Widget' }),
		})).json() as Item;

		const del = await router.request(`/${created.id}`, { method: 'DELETE' });
		expect(del.status).toBe(204);

		const list = await (await router.request('/')).json() as Item[];
		expect(list).toHaveLength(0);
	});

	test('DELETE /:id returns 404 for unknown id', async () => {
		const res = await router.request('/nonexistent', { method: 'DELETE' });
		expect(res.status).toBe(404);
	});
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `npm test -- src/core/server/crud-router.test.ts`
Expected: FAIL — `Cannot find module './crud-router'`

- [ ] **Step 3: Implement `createCrudRouter`**

```typescript
// src/core/server/crud-router.ts
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import type { ZodSchema } from 'zod';
import type { Db } from '../../server/db/index';

const IdParamSchema  = z.object({ id: z.string().openapi({ example: 'uuid-here' }) });
const NotFoundSchema = z.object({ message: z.string() });

export function createCrudRouter(
	db:      Db,
	table:   SQLiteTableWithColumns<any>,
	schemas: { select: ZodSchema; create: ZodSchema; update: ZodSchema },
): OpenAPIHono {
	const { select, create, update } = schemas;

	const listRoute = createRoute({
		method: 'get', path: '/',
		responses: { 200: { content: { 'application/json': { schema: z.array(select) } }, description: 'OK' } },
	});
	const createRoute_ = createRoute({
		method: 'post', path: '/',
		request: { body: { content: { 'application/json': { schema: create } }, required: true } },
		responses: { 201: { content: { 'application/json': { schema: select } }, description: 'Created' } },
	});
	const updateRoute = createRoute({
		method: 'put', path: '/{id}',
		request: {
			params: IdParamSchema,
			body:   { content: { 'application/json': { schema: update } }, required: true },
		},
		responses: {
			200: { content: { 'application/json': { schema: select } }, description: 'Updated' },
			404: { content: { 'application/json': { schema: NotFoundSchema } }, description: 'Not found' },
		},
	});
	const deleteRoute = createRoute({
		method: 'delete', path: '/{id}',
		request: { params: IdParamSchema },
		responses: {
			204: { description: 'Deleted' },
			404: { content: { 'application/json': { schema: NotFoundSchema } }, description: 'Not found' },
		},
	});

	// (table as any).id is safe — every entity schema is required to define an `id` text primary key
	const idCol = (table as any).id;

	return new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) return c.json({ message: 'Validation error', errors: result.error }, 422);
		},
	})
		.openapi(listRoute, (c) => {
			return c.json(db.select().from(table).all() as any, 200);
		})
		.openapi(createRoute_, (c) => {
			const body  = c.req.valid('json');
			const [row] = db.insert(table).values(body as any).returning().all();
			return c.json(row as any, 201);
		})
		.openapi(updateRoute, (c) => {
			const { id } = c.req.valid('param');
			const body   = c.req.valid('json');
			const [row]  = db.update(table).set(body as any).where(eq(idCol, id)).returning().all();
			if (!row) return c.json({ message: 'Not found' }, 404);
			return c.json(row as any, 200);
		})
		.openapi(deleteRoute, (c) => {
			const { id }    = c.req.valid('param');
			const [deleted] = db.delete(table).where(eq(idCol, id)).returning().all();
			if (!deleted) return c.json({ message: 'Not found' }, 404);
			return c.newResponse(null, 204);
		});
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npm test -- src/core/server/crud-router.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Commit**

```bash
git add src/core/server/crud-router.ts src/core/server/crud-router.test.ts
git commit -m "feat: add createCrudRouter — generic OpenAPIHono router factory"
```

---

## Task 2: `src/core/client/crud-state.ts`

**Files:**
- Create: `src/core/client/crud-state.test.ts`
- Create: `src/core/client/crud-state.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/core/client/crud-state.test.ts
import { describe, test, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { createCrudState } from './crud-state';

type Item = { id: string; name: string };

const a: Item = { id: '1', name: 'Alpha' };
const b: Item = { id: '2', name: 'Beta' };

describe('createCrudState<T>', () => {
	test('initial state has empty items and no error', async () => {
		const { state$ } = createCrudState<Item>();
		const state = await firstValueFrom(state$);
		expect(state.items).toEqual([]);
		expect(state.error).toBeNull();
	});

	test('LOAD_SUCCESS replaces items and clears error', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'SET_ERROR', message: 'old' });
		dispatch({ type: 'LOAD_SUCCESS', items: [a] });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items).toEqual([a]);
		expect(state.error).toBeNull();
	});

	test('CREATE_SUCCESS appends item', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'CREATE_SUCCESS', item: a });
		const state = await firstValueFrom(state$.pipe(skip(1)));
		expect(state.items).toHaveLength(1);
		expect(state.items[0]).toEqual(a);
	});

	test('UPDATE_SUCCESS replaces matching item by id', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'UPDATE_SUCCESS', item: { id: '1', name: 'Alpha Updated' } });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items[0].name).toBe('Alpha Updated');
		expect(state.items[1]).toEqual(b);
	});

	test('UPDATE_SUCCESS leaves non-matching items unchanged', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'UPDATE_SUCCESS', item: { id: '1', name: 'Alpha Updated' } });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items[1]).toEqual(b);
	});

	test('DELETE_SUCCESS removes item by id', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'DELETE_SUCCESS', id: '1' });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items).toHaveLength(1);
		expect(state.items[0]).toEqual(b);
	});

	test('SET_ERROR records message', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'SET_ERROR', message: 'Network error' });
		const state = await firstValueFrom(state$.pipe(skip(1)));
		expect(state.error).toBe('Network error');
	});

	test('reducer is pure — does not mutate frozen input', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a] });
		const snapshot = await firstValueFrom(state$.pipe(skip(1)));
		Object.freeze(snapshot);
		Object.freeze(snapshot.items);
		expect(() => dispatch({ type: 'DELETE_SUCCESS', id: '1' })).not.toThrow();
	});
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test -- src/core/client/crud-state.test.ts`
Expected: FAIL — `Cannot find module './crud-state'`

- [ ] **Step 3: Implement `createCrudState`**

```typescript
// src/core/client/crud-state.ts
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

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

function crudReducer<T extends { id: string }>(
	state:  CrudState<T>,
	action: CrudAction<T>,
): CrudState<T> {
	switch (action.type) {
		case 'LOAD_SUCCESS':   return { ...state, items: action.items, error: null };
		case 'CREATE_SUCCESS': return { ...state, items: [...state.items, action.item] };
		case 'UPDATE_SUCCESS': return { ...state, items: state.items.map(i => i.id === action.item.id ? action.item : i) };
		case 'DELETE_SUCCESS': return { ...state, items: state.items.filter(i => i.id !== action.id) };
		case 'SET_ERROR':      return { ...state, error: action.message };
	}
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

- [ ] **Step 4: Run test to confirm it passes**

Run: `npm test -- src/core/client/crud-state.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: Commit**

```bash
git add src/core/client/crud-state.ts src/core/client/crud-state.test.ts
git commit -m "feat: add createCrudState — generic RxJS MVU state factory"
```

---

## Task 3: `src/core/client/crud-service.ts`

**Files:**
- Create: `src/core/client/crud-service.test.ts`
- Create: `src/core/client/crud-service.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/core/client/crud-service.test.ts
import { describe, test, expect, vi, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { createCrudService } from './crud-service';

type Item = { id: string; name: string };
const mockItem: Item = { id: '1', name: 'Widget' };

function stubFetch(data: unknown, status = 200) {
	const isNoContent = status === 204;
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
		new Response(isNoContent ? null : JSON.stringify(data), {
			status:  isNoContent ? 200 : status,
			headers: isNoContent ? {} : { 'Content-Type': 'application/json' },
		}),
	));
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('createCrudService', () => {
	test('getAll$ GETs basePath and returns array', async () => {
		stubFetch([mockItem]);
		const { getAll$ } = createCrudService<Item>('/api/items');
		const items = await firstValueFrom(getAll$());
		expect(items).toEqual([mockItem]);
		const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
		expect(url).toBe('/api/items');
	});

	test('create$ POSTs to basePath with JSON body', async () => {
		stubFetch(mockItem, 201);
		const { create$ } = createCrudService<Item>('/api/items');
		const item = await firstValueFrom(create$({ name: 'Widget' }));
		expect(item).toEqual(mockItem);
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toEqual({ name: 'Widget' });
	});

	test('update$ PUTs to basePath/:id with JSON body', async () => {
		stubFetch({ ...mockItem, name: 'Widget Updated' });
		const { update$ } = createCrudService<Item>('/api/items');
		const item = await firstValueFrom(update$('1', { name: 'Widget Updated' }));
		expect(item.name).toBe('Widget Updated');
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items/1');
		expect(init.method).toBe('PUT');
		expect(JSON.parse(init.body as string)).toEqual({ name: 'Widget Updated' });
	});

	test('remove$ DELETEs basePath/:id', async () => {
		stubFetch(null, 204);
		const { remove$ } = createCrudService<Item>('/api/items');
		await firstValueFrom(remove$('1'));
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items/1');
		expect((init as RequestInit).method).toBe('DELETE');
	});
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test -- src/core/client/crud-service.test.ts`
Expected: FAIL — `Cannot find module './crud-service'`

- [ ] **Step 3: Implement `createCrudService`**

```typescript
// src/core/client/crud-service.ts
import { from, type Observable } from 'rxjs';

export function createCrudService<T extends { id: string }>(basePath: string) {
	return {
		getAll$: (): Observable<T[]> =>
			from(fetch(basePath).then(r => r.json() as Promise<T[]>)),

		create$: (body: unknown): Observable<T> =>
			from(fetch(basePath, {
				method:  'POST',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify(body),
			}).then(r => r.json() as Promise<T>)),

		update$: (id: string, body: unknown): Observable<T> =>
			from(fetch(`${basePath}/${id}`, {
				method:  'PUT',
				headers: { 'Content-Type': 'application/json' },
				body:    JSON.stringify(body),
			}).then(r => r.json() as Promise<T>)),

		remove$: (id: string): Observable<void> =>
			from(fetch(`${basePath}/${id}`, { method: 'DELETE' }).then(() => undefined)),
	};
}
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `npm test -- src/core/client/crud-service.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/core/client/crud-service.ts src/core/client/crud-service.test.ts
git commit -m "feat: add createCrudService — generic fetch-based CRUD service factory"
```

---

## Task 4: `src/core/client/entity-panel.ts`

**Files:**
- Create: `src/core/client/entity-panel.test.ts`
- Create: `src/core/client/entity-panel.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/core/client/entity-panel.test.ts
import { describe, test, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { mountEntityPanel } from './entity-panel';

const TestSchema = z.object({
	name:   z.string(),
	active: z.boolean().default(true),
	score:  z.number().default(0),
});

type TestItem = { id: string; name: string; active: boolean; score: number };
const mockItem: TestItem = { id: '1', name: 'Widget', active: true, score: 42 };

function stubFetch(data: unknown, status = 200) {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
		new Response(JSON.stringify(data), {
			status,
			headers: { 'Content-Type': 'application/json' },
		}),
	));
}

afterEach(() => { vi.unstubAllGlobals(); });

function flush() { return new Promise<void>(r => setTimeout(r, 0)); }

describe('mountEntityPanel', () => {
	test('renders a text input for string fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="name"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('text');
	});

	test('renders a checkbox for boolean fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="active"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('checkbox');
	});

	test('renders a number input for number fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="score"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('number');
	});

	test('renders a date input for string fields with "date" in the key', () => {
		stubFetch([]);
		const schema = z.object({ dueDate: z.string() });
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="dueDate"]');
		expect(input!.type).toBe('date');
	});

	test('loaded items appear in the list after fetch resolves', async () => {
		stubFetch([mockItem]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		await flush();
		expect(el.querySelectorAll('li').length).toBe(1);
	});

	test('form submit POSTs field values to basePath', async () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });

		const createResponse = new Response(JSON.stringify(mockItem), {
			status: 201, headers: { 'Content-Type': 'application/json' },
		});
		(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(createResponse);

		const nameInput = el.querySelector<HTMLInputElement>('input[data-field="name"]')!;
		nameInput.value = 'Widget';
		el.querySelector('form')!.dispatchEvent(new Event('submit'));
		await flush();

		const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
		const postCall = calls.find(([, init]) => init?.method === 'POST');
		expect(postCall).toBeTruthy();
		expect(JSON.parse(postCall![1].body as string).name).toBe('Widget');
	});
});
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test -- src/core/client/entity-panel.test.ts`
Expected: FAIL — `Cannot find module './entity-panel'`

- [ ] **Step 3: Implement `entity-panel.ts`**

```typescript
// src/core/client/entity-panel.ts
import { EMPTY, fromEvent } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { z } from 'zod';
import { createCrudState } from './crud-state';
import { createCrudService } from './crud-service';

export interface EntityPanelConfig {
	el:       HTMLElement;
	basePath: string;
	schema:   z.ZodObject<any>;
}

function unwrap(type: z.ZodTypeAny): z.ZodTypeAny {
	if (type instanceof z.ZodNullable || type instanceof z.ZodOptional) {
		return unwrap(type.unwrap());
	}
	return type;
}

function inputTypeFor(key: string, type: z.ZodTypeAny): 'checkbox' | 'number' | 'date' | 'text' {
	const inner = unwrap(type);
	if (inner instanceof z.ZodBoolean) return 'checkbox';
	if (inner instanceof z.ZodNumber)  return 'number';
	if (inner instanceof z.ZodString && key.toLowerCase().includes('date')) return 'date';
	return 'text';
}

function toLabel(key: string): string {
	return key
		.replace(/_([a-z])/g, (_, c: string) => ' ' + c.toUpperCase())
		.replace(/([A-Z])/g, (c: string) => ' ' + c)
		.trim()
		.split(/\s+/)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

function buildForm(schema: z.ZodObject<any>): HTMLFormElement {
	const form = document.createElement('form');
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const label = document.createElement('label');
		label.style.marginRight = '0.5em';
		label.textContent = toLabel(key) + ': ';
		const input = document.createElement('input');
		input.type = inputTypeFor(key, type);
		input.dataset['field'] = key;
		label.appendChild(input);
		form.appendChild(label);
	});
	const btn = document.createElement('button');
	btn.type = 'submit';
	btn.textContent = 'Add';
	form.appendChild(btn);
	return form;
}

function readValues(form: HTMLFormElement, schema: z.ZodObject<any>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const el = form.querySelector<HTMLInputElement>(`[data-field="${key}"]`);
		if (!el) return;
		const kind = inputTypeFor(key, type);
		if (kind === 'checkbox') out[key] = el.checked;
		else if (kind === 'number') out[key] = el.value !== '' ? Number(el.value) : undefined;
		else out[key] = el.value || null;
	});
	return out;
}

type Row = Record<string, unknown> & { id: string };

function buildRow(
	item:     Row,
	schema:   z.ZodObject<any>,
	onToggle: (key: string) => void,
	onDelete: () => void,
): HTMLLIElement {
	const li = document.createElement('li');
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const kind = inputTypeFor(key, type);
		if (kind === 'checkbox') {
			const cb    = document.createElement('input');
			cb.type     = 'checkbox';
			cb.checked  = Boolean(item[key]);
			cb.addEventListener('change', () => onToggle(key));
			li.appendChild(cb);
		} else {
			const span       = document.createElement('span');
			span.textContent = String(item[key] ?? '');
			span.style.marginRight = '0.5em';
			li.appendChild(span);
		}
	});
	const del         = document.createElement('button');
	del.textContent   = 'Delete';
	del.addEventListener('click', onDelete);
	li.appendChild(del);
	return li;
}

export function mountEntityPanel(config: EntityPanelConfig): void {
	const { el, basePath, schema } = config;
	const { state$, dispatch }     = createCrudState<Row>();
	const service                  = createCrudService<Row>(basePath);

	const form    = buildForm(schema);
	const errorEl = document.createElement('p');
	errorEl.style.color = 'red';
	const listEl  = document.createElement('ul');
	el.appendChild(form);
	el.appendChild(errorEl);
	el.appendChild(listEl);

	service.getAll$().subscribe({
		next:  items => dispatch({ type: 'LOAD_SUCCESS', items }),
		error: ()    => dispatch({ type: 'SET_ERROR', message: `Failed to load ${basePath}` }),
	});

	fromEvent<SubmitEvent>(form, 'submit').pipe(
		tap(e => e.preventDefault()),
		map(() => readValues(form, schema)),
		exhaustMap(body =>
			service.create$(body).pipe(
				tap(item => dispatch({ type: 'CREATE_SUCCESS', item })),
				catchError(() => {
					dispatch({ type: 'SET_ERROR', message: 'Failed to create.' });
					return EMPTY;
				}),
			),
		),
	).subscribe();

	state$.subscribe(({ items, error }) => {
		errorEl.textContent = error ?? '';
		listEl.innerHTML    = '';
		items.forEach(item => {
			listEl.appendChild(buildRow(
				item,
				schema,
				(key) => {
					service.update$(item.id, { [key]: !item[key] })
						.pipe(catchError(() => EMPTY))
						.subscribe(updated => dispatch({ type: 'UPDATE_SUCCESS', item: updated }));
				},
				() => {
					service.remove$(item.id)
						.pipe(catchError(() => EMPTY))
						.subscribe(() => dispatch({ type: 'DELETE_SUCCESS', id: item.id }));
				},
			));
		});
	});
}
```

- [ ] **Step 4: Run test to confirm it passes**

Run: `npm test -- src/core/client/entity-panel.test.ts`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
git add src/core/client/entity-panel.ts src/core/client/entity-panel.test.ts
git commit -m "feat: add mountEntityPanel — wires state + service + Zod-driven form/list"
```

---

## Task 5: Create todos entity schema

**Files:**
- Create: `src/entities/todos/schema.ts`

- [ ] **Step 1: Create the entities directory and todos schema**

```typescript
// src/entities/todos/schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const todos = sqliteTable('todos', {
	id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	title:     text('title').notNull(),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	priority:  integer('priority').notNull().default(2),
	dueDate:   text('due_date'),
	createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const TodoSchema       = createSelectSchema(todos);
export const CreateTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true });
export const UpdateTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true }).partial();
```

- [ ] **Step 2: Run typecheck to confirm the schema compiles**

Run: `npm run typecheck`
Expected: No errors in `src/entities/todos/schema.ts`

---

## Task 6: Migrate server — refactor `app.ts`, `db/index.ts`, handler tests

**Files:**
- Modify: `src/server/db/index.ts`
- Modify: `src/server/app.ts`
- Modify: `src/server/todos/todo.handler.test.ts`
- Delete: `src/server/db/schema.ts`
- Delete: `src/server/todos/todo.routes.ts`
- Delete: `src/server/todos/todo.handler.ts`
- Modify: `drizzle.config.ts`

- [ ] **Step 1: Update `src/server/db/index.ts` to import from entities**

```typescript
// src/server/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as todosSchema from '../../entities/todos/schema';

const dbPath = process.env['DATABASE_PATH'] ?? 'db/todos.db';
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema: { ...todosSchema } });
export type Db  = typeof db;
```

- [ ] **Step 2: Refactor `src/server/app.ts` to use `createCrudRouter`**

```typescript
// src/server/app.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Db } from './db/index';
import { createCrudRouter } from '../core/server/crud-router';
import {
	todos,
	TodoSchema,
	CreateTodoSchema,
	UpdateTodoSchema,
} from '../entities/todos/schema';

export function createApp(db: Db) {
	const app = new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ message: 'Validation error', errors: result.error }, 422);
			}
		},
	});

	app.route('/todos', createCrudRouter(db, todos, {
		select: TodoSchema,
		create: CreateTodoSchema,
		update: UpdateTodoSchema,
	}));

	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info:    { title: 'Generic CRUD API', version: '2.0.0' },
	});
	app.get('/docs', swaggerUI({ url: '/openapi.json' }));

	return app;
}

export type AppType = ReturnType<typeof createApp>;
```

- [ ] **Step 3: Update `src/server/todos/todo.handler.test.ts` schema import path**

Replace the import line:
```typescript
// OLD:
import * as schema from '../db/schema';

// NEW:
import * as schema from '../../entities/todos/schema';
```

The full updated file:
```typescript
// src/server/todos/todo.handler.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../entities/todos/schema';
import { createApp } from '../app';
import type { z } from 'zod';

type Todo = z.infer<typeof schema.TodoSchema>;

function createTestDb() {
	const sqlite = new Database(':memory:');
	sqlite.exec(`
		CREATE TABLE todos (
			id         TEXT PRIMARY KEY NOT NULL,
			title      TEXT NOT NULL,
			completed  INTEGER NOT NULL DEFAULT 0,
			priority   INTEGER NOT NULL DEFAULT 2,
			due_date   TEXT,
			created_at TEXT NOT NULL
		)
	`);
	return drizzle(sqlite, { schema });
}

describe('GET /todos', () => {
	let app: ReturnType<typeof createApp>;
	beforeEach(() => { app = createApp(createTestDb()); });

	test('returns 200 with empty array when no todos exist', async () => {
		const res = await app.request('/todos');
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual([]);
	});
});

describe('POST /todos', () => {
	let app: ReturnType<typeof createApp>;
	beforeEach(() => { app = createApp(createTestDb()); });

	test('returns 201 with created todo', async () => {
		const res = await app.request('/todos', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ title: 'Buy milk' }),
		});
		expect(res.status).toBe(201);
		const todo = await res.json() as Todo;
		expect(todo.title).toBe('Buy milk');
		expect(todo.completed).toBe(false);
		expect(typeof todo.id).toBe('string');
		expect(typeof todo.createdAt).toBe('string');
	});

	test('returns 422 for missing title', async () => {
		const res = await app.request('/todos', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({}),
		});
		expect(res.status).toBe(422);
	});
});

describe('PUT /todos/:id', () => {
	let app: ReturnType<typeof createApp>;
	beforeEach(() => { app = createApp(createTestDb()); });

	test('returns 200 with updated todo', async () => {
		const created = await (await app.request('/todos', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ title: 'Buy milk' }),
		})).json() as Todo;

		const res = await app.request(`/todos/${created.id}`, {
			method:  'PUT',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ completed: true }),
		});
		expect(res.status).toBe(200);
		const updated = await res.json() as Todo;
		expect(updated.completed).toBe(true);
		expect(updated.title).toBe('Buy milk');
	});

	test('returns 404 for unknown id', async () => {
		const res = await app.request('/todos/nonexistent', {
			method:  'PUT',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ completed: true }),
		});
		expect(res.status).toBe(404);
	});
});

describe('DELETE /todos/:id', () => {
	let app: ReturnType<typeof createApp>;
	beforeEach(() => { app = createApp(createTestDb()); });

	test('returns 204 and removes the todo', async () => {
		const created = await (await app.request('/todos', {
			method:  'POST',
			headers: { 'Content-Type': 'application/json' },
			body:    JSON.stringify({ title: 'Buy milk' }),
		})).json() as Todo;

		const del = await app.request(`/todos/${created.id}`, { method: 'DELETE' });
		expect(del.status).toBe(204);

		const list = await (await app.request('/todos')).json() as Todo[];
		expect(list).toHaveLength(0);
	});

	test('returns 404 for unknown id', async () => {
		const res = await app.request('/todos/nonexistent', { method: 'DELETE' });
		expect(res.status).toBe(404);
	});
});
```

- [ ] **Step 4: Update `drizzle.config.ts` to glob all entity schemas**

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema:        './src/entities/*/schema.ts',
	out:           './drizzle/migrations',
	dialect:       'sqlite',
	dbCredentials: { url: './db/todos.db' },
});
```

- [ ] **Step 5: Delete the replaced server files**

```bash
del src\server\db\schema.ts
del src\server\todos\todo.routes.ts
del src\server\todos\todo.handler.ts
```

- [ ] **Step 6: Run all server tests to confirm they pass**

Run: `npm test -- src/server`
Expected: PASS — 7 tests in `todo.handler.test.ts`

- [ ] **Step 7: Commit**

```bash
git add src/entities/todos/schema.ts src/server/app.ts src/server/db/index.ts src/server/todos/todo.handler.test.ts drizzle.config.ts
git commit -m "refactor: migrate todos to entities; app.ts uses createCrudRouter"
```

---

## Task 7: Migrate client — `main.tsx` + delete old client files

**Files:**
- Modify: `src/client/main.tsx`
- Modify: `index.html`
- Delete: `src/client/todo.state.ts` + `src/client/todo.state.test.ts`
- Delete: `src/client/todo.service.ts` + `src/client/todo.service.test.ts`
- Delete: `src/client/components/todo-item.tsx` + `src/client/components/todo-item.test.tsx`

- [ ] **Step 1: Rewrite `src/client/main.tsx`**

```typescript
// src/client/main.tsx
import { mountEntityPanel } from '../core/client/entity-panel';
import { CreateTodoSchema } from '../entities/todos/schema';

mountEntityPanel({
	el:       document.getElementById('todos')!,
	basePath: '/api/todos',
	schema:   CreateTodoSchema,
});
```

- [ ] **Step 2: Rewrite `index.html` — replace hand-crafted form with entity containers**

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Generic CRUD — RxJS + Hono</title>
</head>
<body>
	<h1>Todos</h1>
	<div id="todos"></div>
	<script type="module" src="/src/client/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 3: Delete the replaced client files**

```bash
del src\client\todo.state.ts
del src\client\todo.state.test.ts
del src\client\todo.service.ts
del src\client\todo.service.test.ts
del src\client\components\todo-item.tsx
del src\client\components\todo-item.test.tsx
```

- [ ] **Step 4: Run typecheck to confirm no dangling imports**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: All tests pass (crud-router, crud-state, crud-service, entity-panel, todo.handler)

- [ ] **Step 6: Commit**

```bash
git add src/client/main.tsx index.html
git commit -m "refactor: replace todo-specific client files with mountEntityPanel"
```

---

## Task 8: Add `products` entity

**Files:**
- Create: `src/entities/products/schema.ts`
- Modify: `src/server/db/index.ts`
- Modify: `src/server/app.ts`
- Modify: `src/client/main.tsx`
- Modify: `index.html`

- [ ] **Step 1: Create `src/entities/products/schema.ts`**

```typescript
// src/entities/products/schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const products = sqliteTable('products', {
	id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name:      text('name').notNull(),
	price:     integer('price').notNull().default(0),
	inStock:   integer('in_stock', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const ProductSchema       = createSelectSchema(products);
export const CreateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const UpdateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }).partial();
```

- [ ] **Step 2: Update `src/server/db/index.ts` to include products schema**

```typescript
// src/server/db/index.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as todosSchema    from '../../entities/todos/schema';
import * as productsSchema from '../../entities/products/schema';

const dbPath = process.env['DATABASE_PATH'] ?? 'db/todos.db';
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema: { ...todosSchema, ...productsSchema } });
export type Db  = typeof db;
```

- [ ] **Step 3: Register `/products` route in `src/server/app.ts`**

```typescript
// src/server/app.ts
import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Db } from './db/index';
import { createCrudRouter } from '../core/server/crud-router';
import {
	todos,
	TodoSchema,
	CreateTodoSchema,
	UpdateTodoSchema,
} from '../entities/todos/schema';
import {
	products,
	ProductSchema,
	CreateProductSchema,
	UpdateProductSchema,
} from '../entities/products/schema';

export function createApp(db: Db) {
	const app = new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ message: 'Validation error', errors: result.error }, 422);
			}
		},
	});

	app.route('/todos', createCrudRouter(db, todos, {
		select: TodoSchema,
		create: CreateTodoSchema,
		update: UpdateTodoSchema,
	}));

	app.route('/products', createCrudRouter(db, products, {
		select: ProductSchema,
		create: CreateProductSchema,
		update: UpdateProductSchema,
	}));

	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info:    { title: 'Generic CRUD API', version: '2.0.0' },
	});
	app.get('/docs', swaggerUI({ url: '/openapi.json' }));

	return app;
}

export type AppType = ReturnType<typeof createApp>;
```

- [ ] **Step 4: Mount products panel in `src/client/main.tsx`**

```typescript
// src/client/main.tsx
import { mountEntityPanel } from '../core/client/entity-panel';
import { CreateTodoSchema }    from '../entities/todos/schema';
import { CreateProductSchema } from '../entities/products/schema';

mountEntityPanel({
	el:       document.getElementById('todos')!,
	basePath: '/api/todos',
	schema:   CreateTodoSchema,
});

mountEntityPanel({
	el:       document.getElementById('products')!,
	basePath: '/api/products',
	schema:   CreateProductSchema,
});
```

- [ ] **Step 5: Add products container to `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Generic CRUD — RxJS + Hono</title>
</head>
<body>
	<h1>Todos</h1>
	<div id="todos"></div>

	<h1>Products</h1>
	<div id="products"></div>

	<script type="module" src="/src/client/main.tsx"></script>
</body>
</html>
```

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 8: Commit**

```bash
git add src/entities/products/schema.ts src/server/db/index.ts src/server/app.ts src/client/main.tsx index.html
git commit -m "feat: add products entity — zero additional files beyond schema.ts"
```

---

## Task 9: Push schema to database and smoke test

**Files:** (no code changes — runtime verification)

- [ ] **Step 1: Push schema to SQLite**

Run: `npm run db:push`
Expected: drizzle-kit creates the `products` table in `db/todos.db` (todos table already exists)

- [ ] **Step 2: Start both dev servers**

In one terminal: `npm run dev:server`
In another terminal: `npm run dev:client`

- [ ] **Step 3: Verify the UI at `http://localhost:5173`**

Check:
- The Todos panel renders a form with Title, Completed, Priority, Due Date inputs
- Adding a todo creates a row in the list
- Delete button removes the row
- Checkbox toggle updates `completed`
- The Products panel renders a form with Name, Price, In Stock inputs
- Adding a product creates a row in the list

- [ ] **Step 4: Verify OpenAPI docs at `http://localhost:3000/docs`**

Check:
- `/todos` GET, POST, PUT, DELETE are documented
- `/products` GET, POST, PUT, DELETE are documented
- Try-it-out works for both entities

- [ ] **Step 5: Run final test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: verify generic CRUD layer — todos + products working end-to-end"
```

---

## Self-Review

**Spec coverage:**
- `createCrudRouter` returning OpenAPIHono with 4 routes ✅ (Task 1)
- `createCrudState<T>` pure reducer factory ✅ (Task 2)
- `createCrudService<T>` fetch factory ✅ (Task 3)
- `mountEntityPanel` wiring + Zod field introspection ✅ (Task 4)
- todos migrated to consume core ✅ (Tasks 5–7)
- products as second entity proof-of-concept ✅ (Task 8)
- OpenAPI spec auto-generated ✅ (createCrudRouter uses createRoute internally)
- "existing tests must still pass" ✅ (todo.handler.test.ts retained with updated import; core tests cover state/service/component)
- `db:push` step ✅ (Task 9)

**Placeholder scan:** No TBD/TODO in any step. All code blocks are complete.

**Type consistency:**
- `createCrudRouter` uses `OpenAPIHono` as return type throughout
- `createCrudState<T>` returns `{ action$, state$, dispatch }` — consumed by `entity-panel.ts`
- `createCrudService<T>` returns `{ getAll$, create$, update$, remove$ }` — consumed by `entity-panel.ts`
- `mountEntityPanel` accepts `EntityPanelConfig` — used identically in `main.tsx`
- `Db` type from `src/server/db/index` used in both `crud-router.ts` and `app.ts`
