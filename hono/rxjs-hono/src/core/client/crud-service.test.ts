import { describe, test, expect, vi, afterEach } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { createCrudService } from './crud-service';

type Item = { id: string; name: string };
const mockItem: Item = { id: '1', name: 'Widget' };

function stubFetch(data: unknown, status = 200) {
	const isNoContent = status === 204;
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
		new Response(isNoContent ? null : JSON.stringify(data), {
			status:  isNoContent ? 200 : status,
			headers: isNoContent ? {} : { 'Content-Type': 'application/json' },
		}),
	));
}

afterEach(() => { vi.unstubAllGlobals(); });

describe('createCrudService', () => {
	test('getAll$ GETs basePath and returns array', async () => {
		stubFetch([mockItem]);
		const { getAll$ } = createCrudService<Item>('/api/items');
		const items = await firstValueFrom(getAll$());
		expect(items).toEqual([mockItem]);
		const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
		expect(url).toBe('/api/items');
	});

	test('create$ POSTs to basePath with JSON body', async () => {
		stubFetch(mockItem, 201);
		const { create$ } = createCrudService<Item>('/api/items');
		const item = await firstValueFrom(create$({ name: 'Widget' }));
		expect(item).toEqual(mockItem);
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items');
		expect(init.method).toBe('POST');
		expect(JSON.parse(init.body as string)).toEqual({ name: 'Widget' });
	});

	test('update$ PUTs to basePath/:id with JSON body', async () => {
		stubFetch({ ...mockItem, name: 'Widget Updated' });
		const { update$ } = createCrudService<Item>('/api/items');
		const item = await firstValueFrom(update$('1', { name: 'Widget Updated' }));
		expect(item.name).toBe('Widget Updated');
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items/1');
		expect(init.method).toBe('PUT');
		expect(JSON.parse(init.body as string)).toEqual({ name: 'Widget Updated' });
	});

	test('remove$ DELETEs basePath/:id', async () => {
		stubFetch(null, 204);
		const { remove$ } = createCrudService<Item>('/api/items');
		await firstValueFrom(remove$('1'));
		const [url, init] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
		expect(url).toBe('/api/items/1');
		expect((init as RequestInit).method).toBe('DELETE');
	});
});
