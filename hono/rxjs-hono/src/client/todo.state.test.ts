import { describe, test, expect } from 'vitest';
import { reducer, initialState } from './todo.state';
import type { Todo } from './todo.service';

const mockTodo: Todo = {
	id: '1',
	title: 'Learn Hono',
	completed: false,
	priority: 2,
	dueDate: null,
	createdAt: '2026-01-01T00:00:00.000Z',
};

describe('reducer', () => {
	test('LOAD_SUCCESS replaces todos and clears error', () => {
		const state = reducer(
			{ ...initialState, error: 'old error' },
			{ type: 'LOAD_SUCCESS', todos: [mockTodo] },
		);
		expect(state.todos).toEqual([mockTodo]);
		expect(state.error).toBeNull();
	});

	test('CREATE_SUCCESS appends todo', () => {
		const state = reducer(initialState, { type: 'CREATE_SUCCESS', todo: mockTodo });
		expect(state.todos).toHaveLength(1);
		expect(state.todos[0]).toEqual(mockTodo);
	});

	test('UPDATE_SUCCESS replaces matching todo by id', () => {
		const updated = { ...mockTodo, completed: true };
		const state = reducer(
			{ ...initialState, todos: [mockTodo] },
			{ type: 'UPDATE_SUCCESS', todo: updated },
		);
		expect(state.todos[0].completed).toBe(true);
	});

	test('UPDATE_SUCCESS leaves non-matching todos unchanged', () => {
		const other: Todo = { ...mockTodo, id: '2', title: 'Other' };
		const state = reducer(
			{ ...initialState, todos: [mockTodo, other] },
			{ type: 'UPDATE_SUCCESS', todo: { ...mockTodo, completed: true } },
		);
		expect(state.todos[1]).toEqual(other);
	});

	test('DELETE_SUCCESS removes todo by id', () => {
		const state = reducer(
			{ ...initialState, todos: [mockTodo] },
			{ type: 'DELETE_SUCCESS', id: '1' },
		);
		expect(state.todos).toHaveLength(0);
	});

	test('SET_ERROR sets error message', () => {
		const state = reducer(initialState, { type: 'SET_ERROR', message: 'Network error' });
		expect(state.error).toBe('Network error');
	});

	test('reducer is pure — does not mutate input state', () => {
		const frozen = Object.freeze({ ...initialState, todos: [mockTodo] });
		expect(() =>
			reducer(frozen, { type: 'DELETE_SUCCESS', id: '1' })
		).not.toThrow();
	});
});
