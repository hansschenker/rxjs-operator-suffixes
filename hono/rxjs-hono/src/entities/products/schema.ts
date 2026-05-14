// src/entities/products/schema.ts
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const products = sqliteTable('products', {
	id:        text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
	name:      text('name').notNull(),
	price:     integer('price').notNull().default(0),
	inStock:   integer('in_stock', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const ProductSchema       = createSelectSchema(products);
export const CreateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const UpdateProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true }).partial();
