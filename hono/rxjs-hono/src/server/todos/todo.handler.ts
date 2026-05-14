import { eq } from 'drizzle-orm';
import type { Db } from '../db/index';
import { todos } from '../db/schema';
import type { AppRouteHandler } from '../types';
import type {
	listTodosRoute,
	createTodoRoute,
	updateTodoRoute,
	deleteTodoRoute,
} from './todo.routes';

export const makeListTodosHandler = (db: Db): AppRouteHandler<typeof listTodosRoute> =>
	(c) => {
		const rows = db.select().from(todos).all();
		return c.json(rows, 200);
	};

export const makeCreateTodoHandler = (db: Db): AppRouteHandler<typeof createTodoRoute> =>
	(c) => {
		const body = c.req.valid('json');
		const [todo] = db.insert(todos).values(body).returning().all();
		return c.json(todo, 201);
	};

export const makeUpdateTodoHandler = (db: Db): AppRouteHandler<typeof updateTodoRoute> =>
	(c) => {
		const { id } = c.req.valid('param');
		const body = c.req.valid('json');
		const [todo] = db.update(todos).set(body).where(eq(todos.id, id)).returning().all();
		if (!todo) return c.json({ message: 'Not found' }, 404);
		return c.json(todo, 200);
	};

export const makeDeleteTodoHandler = (db: Db): AppRouteHandler<typeof deleteTodoRoute> =>
	(c) => {
		const { id } = c.req.valid('param');
		const [deleted] = db.delete(todos).where(eq(todos.id, id)).returning().all();
		if (!deleted) return c.json({ message: 'Not found' }, 404);
		return c.newResponse(null, 204);
	};
