import { r, httpListener } from '@marblejs/http';
import { bodyParser$ } from '@marblejs/middleware-body';
import { getAll$, create$, update$, delete$ } from './todos/todo.effect';

export const listener = httpListener({
	middlewares: [bodyParser$()],
	effects: [
		r.pipe(r.matchPath('/todos'),     r.matchType('GET'),    r.useEffect(getAll$)),
		r.pipe(r.matchPath('/todos'),     r.matchType('POST'),   r.useEffect(create$)),
		r.pipe(r.matchPath('/todos/:id'), r.matchType('PUT'),    r.useEffect(update$)),
		r.pipe(r.matchPath('/todos/:id'), r.matchType('DELETE'), r.useEffect(delete$)),
	],
});
