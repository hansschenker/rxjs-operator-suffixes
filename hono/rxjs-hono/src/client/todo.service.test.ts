import { describe, test, expect, vi, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import type { Todo } from '../shared/types';

const mockTodo: Todo = {
	id: '1',
	title: 'Test todo',
	completed: false,
	priority: 2,
	createdAt: '2026-01-01T00:00:00.000Z',
};

function stubFetch(data: unknown, status = 200) {
	// HTTP 204 No Content must have no body (jsdom rejects 204 with a body)
	const isNoContent = status === 204;
	vi.stubGlobal(
		'fetch',
		vi.fn().mockResolvedValue(
			new Response(isNoContent ? null : JSON.stringify(data), {
				status: isNoContent ? 200 : status,
				headers: isNoContent ? {} : { 'Content-Type': 'application/json' },
			}),
		),
	);
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('getAll$()', () => {
	test('GETs /api/todos and returns the array', async () => {
		stubFetch([mockTodo]);
		const { getAll$ } = await import('./todo.service');
		const todos = await firstValueFrom(getAll$());
		expect(todos).toEqual([mockTodo]);
	});
});

describe('create$()', () => {
	test('POSTs to /api/todos with JSON body and returns created todo', async () => {
		stubFetch(mockTodo, 201);
		const { create$ } = await import('./todo.service');
		const todo = await firstValueFrom(create$({ title: 'Test todo' }));
		expect(todo).toEqual(mockTodo);
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/todos');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toEqual({ title: 'Test todo' });
	});
});

describe('update$()', () => {
	test('PUTs to /api/todos/:id with JSON body and returns updated todo', async () => {
		const updated = { ...mockTodo, completed: true };
		stubFetch(updated);
		const { update$ } = await import('./todo.service');
		const todo = await firstValueFrom(update$('1', { completed: true }));
		expect(todo.completed).toBe(true);
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/todos/1');
		expect(init.method).toBe('PUT');
	});
});

describe('remove$()', () => {
	test('DELETEs /api/todos/:id', async () => {
		stubFetch(null, 204);
		const { remove$ } = await import('./todo.service');
		await firstValueFrom(remove$('1'));
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/todos/1');
		expect((init as RequestInit).method).toBe('DELETE');
	});
});
