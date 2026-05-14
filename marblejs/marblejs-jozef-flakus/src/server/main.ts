import { createServer } from '@marblejs/http';
import { listener } from './listener';

const main = async () => {
	const server = await createServer({
		port: 3000,
		listener,
	});

	await server();
	console.log('Server running on http://localhost:3000');
};

main().catch(console.error);
