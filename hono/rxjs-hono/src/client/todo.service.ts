import { hc } from 'hono/client';
import { type Observable, from } from 'rxjs';
import type { AppType } from '../server/app';
import type { z } from 'zod';
import type { TodoSchema, CreateTodoSchema, UpdateTodoSchema } from '../server/db/schema';

// Types flow from the Drizzle schema — single source of truth, no shared/types.ts needed
export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodoBody = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoBody = z.infer<typeof UpdateTodoSchema>;

const client = hc<AppType>('/api/');

export const getAll$ = (): Observable<Todo[]> =>
	from(client.todos.$get().then(r => r.json() as Promise<Todo[]>));

export const create$ = (body: CreateTodoBody): Observable<Todo> =>
	from(client.todos.$post({ json: body }).then(r => r.json() as Promise<Todo>));

export const update$ = (id: string, body: UpdateTodoBody): Observable<Todo> =>
	from(client.todos[':id'].$put({ param: { id }, json: body }).then(r => r.json() as Promise<Todo>));

export const remove$ = (id: string): Observable<void> =>
	from(client.todos[':id'].$delete({ param: { id } }).then(() => undefined));
