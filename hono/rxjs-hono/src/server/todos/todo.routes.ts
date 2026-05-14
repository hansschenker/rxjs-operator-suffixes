import { createRoute, z } from '@hono/zod-openapi';
import { TodoSchema, CreateTodoSchema, UpdateTodoSchema } from '../db/schema';

const IdParamSchema = z.object({
	id: z.string().openapi({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' }),
});

const NotFoundSchema = z.object({ message: z.string() });

export const listTodosRoute = createRoute({
	method: 'get',
	path: '/todos',
	responses: {
		200: {
			content: { 'application/json': { schema: z.array(TodoSchema) } },
			description: 'List of todos',
		},
	},
});

export const createTodoRoute = createRoute({
	method: 'post',
	path: '/todos',
	request: {
		body: {
			content: { 'application/json': { schema: CreateTodoSchema } },
			required: true,
		},
	},
	responses: {
		201: {
			content: { 'application/json': { schema: TodoSchema } },
			description: 'Created todo',
		},
	},
});

export const updateTodoRoute = createRoute({
	method: 'put',
	path: '/todos/{id}',
	request: {
		params: IdParamSchema,
		body: {
			content: { 'application/json': { schema: UpdateTodoSchema } },
			required: true,
		},
	},
	responses: {
		200: {
			content: { 'application/json': { schema: TodoSchema } },
			description: 'Updated todo',
		},
		404: {
			content: { 'application/json': { schema: NotFoundSchema } },
			description: 'Not found',
		},
	},
});

export const deleteTodoRoute = createRoute({
	method: 'delete',
	path: '/todos/{id}',
	request: {
		params: IdParamSchema,
	},
	responses: {
		204: { description: 'Deleted' },
		404: {
			content: { 'application/json': { schema: NotFoundSchema } },
			description: 'Not found',
		},
	},
});
