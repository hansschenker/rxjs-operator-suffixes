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
