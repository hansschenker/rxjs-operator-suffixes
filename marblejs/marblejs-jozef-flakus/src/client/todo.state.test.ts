import type { Todo } from '../shared/types';
import { reducer, initialState } from './todo.state';

const mockTodo: Todo = {
	id: '1',
	title: 'Test todo',
	completed: false,
	createdAt: '2026-01-01T00:00:00.000Z',
};

describe('reducer', () => {
	it('LOAD_SUCCESS replaces todos', () => {
		const state = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
		expect(state.todos).toEqual([mockTodo]);
		expect(state.error).toBeNull();
	});

	it('CREATE_SUCCESS appends todo', () => {
		const state = reducer(initialState, { type: 'CREATE_SUCCESS', todo: mockTodo });
		expect(state.todos).toHaveLength(1);
		expect(state.todos[0]).toEqual(mockTodo);
	});

	it('UPDATE_SUCCESS replaces matching todo', () => {
		const start = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
		const updated = { ...mockTodo, completed: true };
		const state = reducer(start, { type: 'UPDATE_SUCCESS', todo: updated });
		expect(state.todos[0].completed).toBe(true);
	});

	it('DELETE_SUCCESS removes matching todo', () => {
		const start = reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
		const state = reducer(start, { type: 'DELETE_SUCCESS', id: '1' });
		expect(state.todos).toHaveLength(0);
	});

	it('SET_ERROR sets error message', () => {
		const state = reducer(initialState, { type: 'SET_ERROR', message: 'Network error' });
		expect(state.error).toBe('Network error');
	});

	it('is a pure function — does not mutate input state', () => {
		const before = { ...initialState };
		reducer(initialState, { type: 'LOAD_SUCCESS', todos: [mockTodo] });
		expect(initialState).toEqual(before);
	});
});
