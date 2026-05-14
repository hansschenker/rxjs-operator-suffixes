import { h } from '../h';
import type { Props } from '../h';
import type { Todo } from '../../shared/types';

// h must be in scope for JSX transform
void h;

interface TodoItemProps {
	todo: Todo;
	onToggle: () => void;
	onDelete: () => void;
}

const PRIORITY_LABEL: Record<number, string> = { 1: '🔵 Low', 2: '🟡 Med', 3: '🔴 High' };

export function TodoItem(props: Props): HTMLElement {
	const { todo, onToggle, onDelete } = props as unknown as TodoItemProps;
	return (
		<li>
			<input type='checkbox' checked={todo.completed} onChange={onToggle} />
			<span style={todo.completed ? 'text-decoration:line-through' : ''}>{todo.title}</span>
			<small style='margin-left:0.5em;opacity:0.7'>{PRIORITY_LABEL[todo.priority] ?? String(todo.priority)}</small>
			<button onClick={onDelete}>Delete</button>
		</li>
	);
}
