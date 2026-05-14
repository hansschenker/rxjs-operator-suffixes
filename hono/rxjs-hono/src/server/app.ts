import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import type { Db } from './db/index';
import { createCrudRouter } from '../core/server/crud-router';
import {
	todos,
	TodoSchema,
	CreateTodoSchema,
	UpdateTodoSchema,
} from '../entities/todos/schema';
import {
	products,
	ProductSchema,
	CreateProductSchema,
	UpdateProductSchema,
} from '../entities/products/schema';

export function createApp(db: Db) {
	const app = new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json({ message: 'Validation error', errors: result.error }, 422);
			}
		},
	});

	app.route('/todos', createCrudRouter(db, todos, {
		select: TodoSchema,
		create: CreateTodoSchema,
		update: UpdateTodoSchema,
	}));

	app.route('/products', createCrudRouter(db, products, {
		select: ProductSchema,
		create: CreateProductSchema,
		update: UpdateProductSchema,
	}));

	app.doc('/openapi.json', {
		openapi: '3.0.0',
		info:    { title: 'Generic CRUD API', version: '2.0.0' },
	});
	app.get('/docs', swaggerUI({ url: '/openapi.json' }));

	return app;
}

export type AppType = ReturnType<typeof createApp>;
