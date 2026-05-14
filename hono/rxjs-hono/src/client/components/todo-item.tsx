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

export function TodoItem(props: Props): HTMLElement {
	const { todo, onToggle, onDelete } = props as unknown as TodoItemProps;
	return (
		<li>
			<input type='checkbox' checked={todo.completed} onChange={onToggle} />
			<span style={todo.completed ? 'text-decoration:line-through' : ''}>{todo.title}</span>
			<button onClick={onDelete}>Delete</button>
		</li>
	);
}
