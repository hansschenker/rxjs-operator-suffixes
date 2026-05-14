import { firstValueFrom, of } from 'rxjs';
import type { HttpRequest } from '@marblejs/http';
import { resetStore, setTodos, getTodos } from './todo.store';
import { getAll$, create$, update$, delete$ } from './todo.effect';

const mockReq = (overrides: Partial<HttpRequest> = {}): HttpRequest =>
	({ params: {}, query: {}, body: {}, headers: {}, ...overrides } as unknown as HttpRequest);

describe('getAll$', () => {
	beforeEach(() => resetStore());

	it('returns all todos as body', async () => {
		const req$ = of(mockReq());
		const res = await firstValueFrom(getAll$(req$, undefined as any));
		expect(Array.isArray(res.body)).toBe(true);
		expect((res.body as any[]).length).toBeGreaterThan(0);
	});

	it('returns 200 status (default — status undefined means 200)', async () => {
		const req$ = of(mockReq());
		const res = await firstValueFrom(getAll$(req$, undefined as any));
		expect(res.status).toBeUndefined();
	});
});

describe('create$', () => {
	beforeEach(() => resetStore());

	it('creates a new todo and returns 201', async () => {
		const req$ = of(mockReq({ body: { title: 'New todo' } }));
		const res = await firstValueFrom(create$(req$, undefined as any));
		expect(res.status).toBe(201);
		expect((res.body as any).title).toBe('New todo');
		expect((res.body as any).completed).toBe(false);
		expect((res.body as any).id).toBeDefined();
	});

	it('appends the new todo to the store', async () => {
		const req$ = of(mockReq({ body: { title: 'Appended' } }));
		await firstValueFrom(create$(req$, undefined as any));
		expect(getTodos().some((t: any) => t.title === 'Appended')).toBe(true);
	});
});

describe('update$', () => {
	beforeEach(() => {
		resetStore();
		setTodos([{ id: '1', title: 'Original', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]);
	});

	it('updates the todo and returns it', async () => {
		const req$ = of(mockReq({ params: { id: '1' } as any, body: { completed: true } }));
		const res = await firstValueFrom(update$(req$, undefined as any));
		expect((res.body as any).completed).toBe(true);
		expect((res.body as any).title).toBe('Original');
	});

	it('persists the update to the store', async () => {
		const req$ = of(mockReq({ params: { id: '1' } as any, body: { title: 'Updated' } }));
		await firstValueFrom(update$(req$, undefined as any));
		expect(getTodos()[0].title).toBe('Updated');
	});
});

describe('delete$', () => {
	beforeEach(() => {
		resetStore();
		setTodos([{ id: '1', title: 'To delete', completed: false, createdAt: '2026-01-01T00:00:00.000Z' }]);
	});

	it('returns 204 with empty body', async () => {
		const req$ = of(mockReq({ params: { id: '1' } as any }));
		const res = await firstValueFrom(delete$(req$, undefined as any));
		expect(res.status).toBe(204);
	});

	it('removes the todo from the store', async () => {
		const req$ = of(mockReq({ params: { id: '1' } as any }));
		await firstValueFrom(delete$(req$, undefined as any));
		expect(getTodos()).toHaveLength(0);
	});
});
