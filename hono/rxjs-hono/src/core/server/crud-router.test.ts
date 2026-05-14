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
