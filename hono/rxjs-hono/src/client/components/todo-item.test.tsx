import { describe, test, expect, vi } from 'vitest';
import { h } from '../h';
import type { Todo } from '../todo.service';

// h must be in scope for JSX transform
void h;

const mockTodo: Todo = {
	id: '1',
	title: 'Test todo',
	completed: false,
	priority: 2,
	dueDate: null,
	createdAt: '2026-01-01T00:00:00.000Z',
};

describe('TodoItem', () => {
	test('renders the todo title', async () => {
		const { TodoItem } = await import('./todo-item');
		const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
		expect(el.textContent).toContain('Test todo');
	});

	test('checkbox reflects completed state — false', async () => {
		const { TodoItem } = await import('./todo-item');
		const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
		const cb = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(cb.checked).toBe(false);
	});

	test('checkbox reflects completed state — true', async () => {
		const { TodoItem } = await import('./todo-item');
		const completed = { ...mockTodo, completed: true };
		const el = <TodoItem todo={completed} onToggle={() => {}} onDelete={() => {}} />;
		const cb = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(cb.checked).toBe(true);
	});

	test('calls onToggle when checkbox changes', async () => {
		const { TodoItem } = await import('./todo-item');
		const onToggle = vi.fn();
		const el = <TodoItem todo={mockTodo} onToggle={onToggle} onDelete={() => {}} />;
		const cb = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
		cb.dispatchEvent(new Event('change'));
		expect(onToggle).toHaveBeenCalledOnce();
	});

	test('calls onDelete when delete button is clicked', async () => {
		const { TodoItem } = await import('./todo-item');
		const onDelete = vi.fn();
		const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={onDelete} />;
		const btn = el.querySelector('button') as HTMLButtonElement;
		btn.click();
		expect(onDelete).toHaveBeenCalledOnce();
	});
});
