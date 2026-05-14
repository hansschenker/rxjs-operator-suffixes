import { vi, describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';

vi.mock('rxjs/fetch', () => ({
	fromFetch: vi.fn(),
}));

import { fromFetch } from 'rxjs/fetch';
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
