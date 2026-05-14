import { describe, test, expect, vi, afterEach } from 'vitest';
import { z } from 'zod';
import { mountEntityPanel } from './entity-panel';

const TestSchema = z.object({
	name:   z.string(),
	active: z.boolean().default(true),
	score:  z.number().default(0),
});

type TestItem = { id: string; name: string; active: boolean; score: number };
const mockItem: TestItem = { id: '1', name: 'Widget', active: true, score: 42 };

function stubFetch(data: unknown, status = 200) {
	vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
		new Response(JSON.stringify(data), {
			status,
			headers: { 'Content-Type': 'application/json' },
		}),
	));
}

afterEach(() => { vi.unstubAllGlobals(); });

function flush() { return new Promise<void>(r => setTimeout(r, 0)); }

describe('mountEntityPanel', () => {
	test('renders a text input for string fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="name"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('text');
	});

	test('renders a checkbox for boolean fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="active"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('checkbox');
	});

	test('renders a number input for number fields', () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="score"]');
		expect(input).not.toBeNull();
		expect(input!.type).toBe('number');
	});

	test('renders a date input for string fields with "date" in the key', () => {
		stubFetch([]);
		const schema = z.object({ dueDate: z.string() });
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema });
		const input = el.querySelector<HTMLInputElement>('input[data-field="dueDate"]');
		expect(input!.type).toBe('date');
	});

	test('loaded items appear in the list after fetch resolves', async () => {
		stubFetch([mockItem]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });
		await flush();
		expect(el.querySelectorAll('li').length).toBe(1);
	});

	test('form submit POSTs field values to basePath', async () => {
		stubFetch([]);
		const el = document.createElement('div');
		mountEntityPanel({ el, basePath: '/api/items', schema: TestSchema });

		const createResponse = new Response(JSON.stringify(mockItem), {
			status: 201, headers: { 'Content-Type': 'application/json' },
		});
		(fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(createResponse);

		const nameInput = el.querySelector<HTMLInputElement>('input[data-field="name"]')!;
		nameInput.value = 'Widget';
		el.querySelector('form')!.dispatchEvent(new Event('submit'));
		await flush();

		const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls as [string, RequestInit][];
		const postCall = calls.find(([, init]) => init?.method === 'POST');
		expect(postCall).toBeTruthy();
		expect(JSON.parse(postCall![1].body as string).name).toBe('Widget');
	});
});
