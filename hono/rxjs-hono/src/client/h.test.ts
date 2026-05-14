import { describe, test, expect, vi } from 'vitest';
import { h } from './h';

describe('h() — intrinsic elements', () => {
	test('creates element with correct tag', () => {
		const el = h('div', null);
		expect(el.tagName).toBe('DIV');
	});

	test('sets attribute from props', () => {
		const el = h('input', { type: 'text', placeholder: 'Enter text' });
		expect(el.getAttribute('type')).toBe('text');
		expect(el.getAttribute('placeholder')).toBe('Enter text');
	});

	test('attaches event listener for onClick', () => {
		const onClick = vi.fn();
		const el = h('button', { onClick });
		el.click();
		expect(onClick).toHaveBeenCalledOnce();
	});

	test('sets boolean property for checked', () => {
		const el = h('input', { checked: true }) as HTMLInputElement;
		expect(el.checked).toBe(true);
	});

	test('skips className when undefined', () => {
		const el = h('div', { className: undefined });
		expect(el.className).toBe('');
	});

	test('sets className when defined', () => {
		const el = h('div', { className: 'my-class' });
		expect(el.className).toBe('my-class');
	});

	test('appends string children as text nodes', () => {
		const el = h('p', null, 'Hello world');
		expect(el.textContent).toBe('Hello world');
	});

	test('appends element children', () => {
		const child = h('span', null, 'child');
		const el = h('div', null, child);
		expect(el.firstElementChild?.tagName).toBe('SPAN');
	});

	test('ignores null and undefined children', () => {
		const el = h('div', null, null, undefined);
		expect(el.childNodes.length).toBe(0);
	});
});

describe('h() — function components', () => {
	test('calls function tag and returns its element', () => {
		const Btn = (props: Record<string, unknown> | null, ...children: HTMLElement[]) =>
			h('button', props, ...children);
		const el = h(Btn, { class: 'btn' }, h('span', null, 'Click'));
		expect(el.tagName).toBe('BUTTON');
		expect(el.firstElementChild?.tagName).toBe('SPAN');
	});
});
