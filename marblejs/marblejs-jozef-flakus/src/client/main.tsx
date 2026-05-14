import { h } from './h';
import { state$, dispatch } from './todo.state';
import { getAll$, create$, update$, remove$ } from './todo.service';
import { TodoItem } from './components/todo-item';
import { catchError, EMPTY, fromEvent } from 'rxjs';
import { exhaustMap, filter, map, tap } from 'rxjs/operators';

const listEl = document.getElementById('todo-list')!;
const errorEl = document.getElementById('error-msg')!;
const form = document.getElementById('add-form') as HTMLFormElement;
const titleInput = document.getElementById('title-input') as HTMLInputElement;

// Boot: load all todos on startup
getAll$().subscribe({
	next: todos => dispatch({ type: 'LOAD_SUCCESS', todos }),
	error: () => dispatch({ type: 'SET_ERROR', message: 'Failed to load todos.' }),
});

// Form submit: create a new todo
fromEvent<SubmitEvent>(form, 'submit').pipe(
	tap(e => e.preventDefault()),
	map(() => titleInput.value.trim()),
	filter(title => title.length > 0),
	exhaustMap(title =>
		create$({ title }).pipe(
			tap(todo => dispatch({ type: 'CREATE_SUCCESS', todo })),
			tap(() => { titleInput.value = ''; }),
			catchError(() => {
				dispatch({ type: 'SET_ERROR', message: 'Failed to create todo.' });
				return EMPTY;
			})
		)
	),
).subscribe();

// Reactive render loop — re-renders the list on every state$ emission
state$.subscribe(({ todos, error }) => {
	errorEl.textContent = error ?? '';
	listEl.innerHTML = '';

	todos.forEach(todo => {
		listEl.appendChild(
			<TodoItem
				todo={todo}
				onToggle={() => {
					update$(todo.id, { completed: !todo.completed })
						.pipe(catchError(() => EMPTY))
						.subscribe(updated => dispatch({ type: 'UPDATE_SUCCESS', todo: updated }));
				}}
				onDelete={() => {
					remove$(todo.id)
						.pipe(catchError(() => EMPTY))
						.subscribe(() => dispatch({ type: 'DELETE_SUCCESS', id: todo.id }));
				}}
			/>
		);
	});
});
