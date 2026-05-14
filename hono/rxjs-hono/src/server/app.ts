import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
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
	});

	app.openapi(listTodosRoute, makeListTodosHandler(db));
	app.openapi(createTodoRoute, makeCreateTodoHandler(db));
	app.openapi(updateTodoRoute, makeUpdateTodoHandler(db));
	app.openapi(deleteTodoRoute, makeDeleteTodoHandler(db));

	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info: { title: 'Todos API', version: '1.0.0' },
	});

	app.get('/docs', apiReference({ spec: { url: '/openapi.json' } }));

	return app;
}
