import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as todosSchema    from '../../entities/todos/schema';
import * as productsSchema from '../../entities/products/schema';

const dbPath = process.env['DATABASE_PATH'] ?? 'db/todos.db';
const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema: { ...todosSchema, ...productsSchema } });
export type Db  = typeof db;
