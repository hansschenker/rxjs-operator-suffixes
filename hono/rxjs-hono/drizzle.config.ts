import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema:        './src/entities/*/schema.ts',
	out:           './drizzle/migrations',
	dialect:       'sqlite',
	dbCredentials: { url: './db/todos.db' },
});
