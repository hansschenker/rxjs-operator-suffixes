import { mkdirSync } from 'fs';
import { serve } from '@hono/node-server';
import { db } from './db/index';
import { createApp } from './app';

mkdirSync('db', { recursive: true });

const app = createApp(db);

serve({ fetch: app.fetch, port: 3000 }, () => {
	console.log('Server: http://localhost:3000');
	console.log('API docs: http://localhost:3000/docs');
});
