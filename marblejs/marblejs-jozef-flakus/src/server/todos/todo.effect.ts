import { map } from 'rxjs/operators';
import type { HttpEffect } from '@marblejs/http';
import { requestValidator$ } from '@marblejs/middleware-io';
import type { Todo } from '../../shared/types';
import { getTodos, setTodos } from './todo.store';
import { CreateTodoCodec } from './todo.validator';

export const getAll$: HttpEffect = req$ =>
	req$.pipe(
		map(() => ({ body: getTodos() }))
	);

export const create$: HttpEffect = req$ =>
	req$.pipe(
		requestValidator$({ body: CreateTodoCodec }),
		map(req => {
			const todo: Todo = {
				id: crypto.randomUUID(),
				title: (req.body as { title: string }).title,
				completed: false,
				createdAt: new Date().toISOString(),
			};
			setTodos([...getTodos(), todo]);
			return { status: 201 as const, body: todo };
		})
	);
