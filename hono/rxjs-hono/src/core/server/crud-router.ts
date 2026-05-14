import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { eq } from 'drizzle-orm';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core';
import type { ZodSchema } from 'zod';

const IdParamSchema  = z.object({ id: z.string().openapi({ example: 'uuid-here' }) });
const NotFoundSchema = z.object({ message: z.string() });

export function createCrudRouter(
	db:      BetterSQLite3Database<any>,
	table:   SQLiteTableWithColumns<any>,
	schemas: { select: ZodSchema; create: ZodSchema; update: ZodSchema },
): OpenAPIHono {
	const { select, create, update } = schemas;

	const listRoute = createRoute({
		method: 'get', path: '/',
		responses: { 200: { content: { 'application/json': { schema: z.array(select) } }, description: 'OK' } },
	});
	const createRoute_ = createRoute({
		method: 'post', path: '/',
		request: { body: { content: { 'application/json': { schema: create } }, required: true } },
		responses: { 201: { content: { 'application/json': { schema: select } }, description: 'Created' } },
	});
	const updateRoute = createRoute({
		method: 'put', path: '/{id}',
		request: {
			params: IdParamSchema,
			body:   { content: { 'application/json': { schema: update } }, required: true },
		},
		responses: {
			200: { content: { 'application/json': { schema: select } }, description: 'Updated' },
			404: { content: { 'application/json': { schema: NotFoundSchema } }, description: 'Not found' },
		},
	});
	const deleteRoute = createRoute({
		method: 'delete', path: '/{id}',
		request: { params: IdParamSchema },
		responses: {
			204: { description: 'Deleted' },
			404: { content: { 'application/json': { schema: NotFoundSchema } }, description: 'Not found' },
		},
	});

	// (table as any).id is safe — every entity schema is required to define an `id` text primary key
	const idCol = (table as any).id;

	return new OpenAPIHono({
		defaultHook: (result, c) => {
			if (!result.success) return c.json({ message: 'Validation error', errors: result.error }, 422);
		},
	})
		.openapi(listRoute, (c) => {
			return c.json(db.select().from(table).all() as any, 200);
		})
		.openapi(createRoute_, (c) => {
			const body  = c.req.valid('json');
			const [row] = db.insert(table).values(body as any).returning().all();
			return c.json(row as any, 201);
		})
		.openapi(updateRoute, (c) => {
			const { id } = c.req.valid('param');
			const body   = c.req.valid('json');
			const [row]  = db.update(table).set(body as any).where(eq(idCol, id)).returning().all();
			if (!row) return c.json({ message: 'Not found' }, 404);
			return c.json(row as any, 200);
		})
		.openapi(deleteRoute, (c) => {
			const { id }    = c.req.valid('param');
			const [deleted] = db.delete(table).where(eq(idCol, id)).returning().all();
			if (!deleted) return c.json({ message: 'Not found' }, 404);
			return c.newResponse(null, 204);
		});
}
