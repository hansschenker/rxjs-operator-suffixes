import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const todos = sqliteTable('todos', {
	id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
	priority: integer('priority').notNull().default(2),
	createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const TodoSchema = createSelectSchema(todos);
export const CreateTodoSchema = createInsertSchema(todos).omit({ id: true, createdAt: true });
export const UpdateTodoSchema = createInsertSchema(todos)
	.omit({ id: true, createdAt: true })
	.partial();
