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
