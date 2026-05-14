import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Db } from './db/index';
import {
	listTodosRoute,
	createTodoRoute,
	updateTodoRoute,
	deleteTodoRoute,
} from './todos/todo.routes';
import {
	makeListTodosHandler,
	makeCreateTodoHandler,
	makeUpdateTodoHandler,
	makeDeleteTodoHandler,
} from './todos/todo.handler';

export function createApp(db: Db) {
	const app = new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ message: 'Validation error', errors: result.error }, 422);
			}
		},
	})
		.openapi(listTodosRoute, makeListTodosHandler(db))
		.openapi(createTodoRoute, makeCreateTodoHandler(db))
		.openapi(updateTodoRoute, makeUpdateTodoHandler(db))
		.openapi(deleteTodoRoute, makeDeleteTodoHandler(db));

	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info: { title: 'Todos API', version: '1.0.0' },
	});

	app.get('/docs', swaggerUI({ url: '/openapi.json' }));

	return app;
}

export type AppType = ReturnType<typeof createApp>;
