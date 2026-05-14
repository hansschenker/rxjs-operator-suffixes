import { from } from 'rxjs';
import type { Observable } from 'rxjs';
import type { Todo, CreateTodoBody, UpdateTodoBody } from '../shared/types';

const BASE = '/api/todos';

export const getAll$ = (): Observable<Todo[]> =>
	from(fetch(BASE).then(r => r.json() as Promise<Todo[]>));

export const create$ = (body: CreateTodoBody): Observable<Todo> =>
	from(
		fetch(BASE, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}).then(r => r.json() as Promise<Todo>),
	);

export const update$ = (id: string, body: UpdateTodoBody): Observable<Todo> =>
	from(
		fetch(`${BASE}/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}).then(r => r.json() as Promise<Todo>),
	);

export const remove$ = (id: string): Observable<void> =>
	from(fetch(`${BASE}/${id}`, { method: 'DELETE' }).then(() => undefined));
