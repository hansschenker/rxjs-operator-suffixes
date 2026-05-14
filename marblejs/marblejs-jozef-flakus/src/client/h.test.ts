import { h } from './h';

describe('h() — element creation', () => {
	it('creates element with correct tag', () => {
		const el = h('div', null);
		expect(el.tagName).toBe('DIV');
	});

	it('sets className from props', () => {
		const el = h('span', { className: 'active' });
		expect(el.className).toBe('active');
	});

	it('sets arbitrary attribute from props', () => {
		const el = h('input', { type: 'checkbox' });
		expect(el.getAttribute('type')).toBe('checkbox');
	});

	it('sets boolean DOM property checked correctly', () => {
		const el = h('input', { type: 'checkbox', checked: true }) as HTMLInputElement;
		expect(el.checked).toBe(true);
	});

	it('sets boolean DOM property checked=false correctly', () => {
		const el = h('input', { type: 'checkbox', checked: false }) as HTMLInputElement;
		expect(el.checked).toBe(false);
	});

	it('attaches event listener from onX prop', () => {
		let clicked = false;
		const el = h('button', { onClick: () => { clicked = true; } });
		el.click();
		expect(clicked).toBe(true);
	});

	it('appends string children as text nodes', () => {
		const el = h('p', null, 'Hello');
		expect(el.textContent).toBe('Hello');
	});

	it('appends element children', () => {
		const child = h('span', null, 'inner');
		const parent = h('div', null, child);
		expect(parent.firstChild).toBe(child);
	});

	it('ignores null and undefined children', () => {
		const el = h('div', null, null, undefined, 'visible');
		expect(el.textContent).toBe('visible');
		expect(el.childNodes).toHaveLength(1);
	});

	it('calls function components with props and children', () => {
		const MyComp = (props: { label: string } | null) =>
			h('span', { className: 'comp' }, props?.label ?? '');
		const el = h(MyComp, { label: 'test' });
		expect(el.tagName).toBe('SPAN');
		expect(el.textContent).toBe('test');
	});
});
