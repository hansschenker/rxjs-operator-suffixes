import { h } from '../h';
import { TodoItem } from './todo-item';
import type { Todo } from '../../shared/types';

const mockTodo: Todo = {
	id: '1',
	title: 'Buy milk',
	completed: false,
	createdAt: '2026-01-01T00:00:00.000Z',
};

describe('TodoItem', () => {
	it('renders todo title', () => {
		const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
		expect(el.textContent).toContain('Buy milk');
	});

	it('checkbox is unchecked when todo.completed is false', () => {
		const el = <TodoItem todo={mockTodo} onToggle={() => {}} onDelete={() => {}} />;
		const checkbox = el.querySelector('input[type="checkbox"]') as HTMLInputElement;
		expect(checkbox.checked).toBe(false);
	});

	it('adds completed class when todo.completed is true', () => {
		const el = (
			<TodoItem
				todo={{ ...mockTodo, completed: true }}
				onToggle={() => {}}
				onDelete={() => {}}
			/>
		);
		expect(el.className).toContain('completed');
	});

	it('calls onToggle when checkbox changes', () => {
		let toggled = false;
		const el = (
			<TodoItem
				todo={mockTodo}
				onToggle={() => {
					toggled = true;
				}}
				onDelete={() => {}}
			/>
		);
		const checkbox = el.querySelector('input') as HTMLInputElement;
		checkbox.dispatchEvent(new Event('change'));
		expect(toggled).toBe(true);
	});

	it('calls onDelete when delete button clicked', () => {
		let deleted = false;
		const el = (
			<TodoItem
				todo={mockTodo}
				onToggle={() => {}}
				onDelete={() => {
					deleted = true;
				}}
			/>
		);
		const btn = el.querySelector('button') as HTMLButtonElement;
		btn.click();
		expect(deleted).toBe(true);
	});
});
