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
