import { map } from 'rxjs/operators';
import type { HttpEffect } from '@marblejs/http';
import { requestValidator$ } from '@marblejs/middleware-io';
import type { Todo } from '../../shared/types';
import { getTodos, setTodos } from './todo.store';
import { CreateTodoCodec, UpdateTodoCodec } from './todo.validator';
import type { CreateTodoInput, UpdateTodoInput } from './todo.validator';

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
				title: (req.body as CreateTodoInput).title,
				completed: false,
				createdAt: new Date().toISOString(),
			};
			setTodos([...getTodos(), todo]);
			return { status: 201 as const, body: todo };
		})
	);

export const update$: HttpEffect = req$ =>
	req$.pipe(
		requestValidator$({ body: UpdateTodoCodec }),
		map(req => {
			const id = (req.params as { id: string }).id;
			const body = req.body as UpdateTodoInput;
			const updated = getTodos().map(t =>
				t.id === id ? { ...t, ...body } : t
			);
			setTodos(updated);
			return { body: updated.find(t => t.id === id) };
		})
	);

export const delete$: HttpEffect = req$ =>
	req$.pipe(
		map(req => {
			const id = (req.params as { id: string }).id;
			setTodos(getTodos().filter(t => t.id !== id));
			return { status: 204 as const, body: {} };
		})
	);
