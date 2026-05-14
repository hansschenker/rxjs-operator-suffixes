import { firstValueFrom, of } from 'rxjs';
import type { HttpRequest } from '@marblejs/http';
import { resetStore, setTodos, getTodos } from './todo.store';
import { getAll$, create$ } from './todo.effect';

const mockReq = (overrides: Partial<HttpRequest> = {}): HttpRequest =>
	({ params: {}, query: {}, body: {}, headers: {}, ...overrides } as unknown as HttpRequest);

describe('getAll$', () => {
	beforeEach(() => resetStore());

	it('returns all todos as body', async () => {
		const req$ = of(mockReq());
		const res = await firstValueFrom(getAll$(req$));
		expect(Array.isArray(res.body)).toBe(true);
		expect((res.body as any[]).length).toBeGreaterThan(0);
	});

	it('returns 200 status (default — status undefined means 200)', async () => {
		const req$ = of(mockReq());
		const res = await firstValueFrom(getAll$(req$));
		expect(res.status).toBeUndefined();
	});
});

describe('create$', () => {
	beforeEach(() => resetStore());

	it('creates a new todo and returns 201', async () => {
		const req$ = of(mockReq({ body: { title: 'New todo' } }));
		const res = await firstValueFrom(create$(req$));
		expect(res.status).toBe(201);
		expect((res.body as any).title).toBe('New todo');
		expect((res.body as any).completed).toBe(false);
		expect((res.body as any).id).toBeDefined();
	});

	it('appends the new todo to the store', async () => {
		const req$ = of(mockReq({ body: { title: 'Appended' } }));
		await firstValueFrom(create$(req$));
		expect(getTodos().some((t: any) => t.title === 'Appended')).toBe(true);
	});
});
