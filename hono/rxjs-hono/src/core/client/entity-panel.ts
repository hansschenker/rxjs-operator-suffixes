import { EMPTY, fromEvent } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { z } from 'zod';
import { createCrudState } from './crud-state';
import { createCrudService } from './crud-service';

export interface EntityPanelConfig {
	el:       HTMLElement;
	basePath: string;
	schema:   z.ZodObject<any>;
}

function unwrap(type: z.ZodTypeAny): z.ZodTypeAny {
	const inner = (type as any)._def?.innerType;
	if (inner) return unwrap(inner);
	return type;
}

function inputTypeFor(key: string, type: z.ZodTypeAny): 'checkbox' | 'number' | 'date' | 'text' {
	const inner = unwrap(type);
	if (inner instanceof z.ZodBoolean) return 'checkbox';
	if (inner instanceof z.ZodNumber)  return 'number';
	if (inner instanceof z.ZodString && key.toLowerCase().includes('date')) return 'date';
	return 'text';
}

function toLabel(key: string): string {
	return key
		.replace(/_([a-z])/g, (_, c: string) => ' ' + c.toUpperCase())
		.replace(/([A-Z])/g, (c: string) => ' ' + c)
		.trim()
		.split(/\s+/)
		.map(w => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

function buildForm(schema: z.ZodObject<any>): HTMLFormElement {
	const form = document.createElement('form');
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const label = document.createElement('label');
		label.style.marginRight = '0.5em';
		label.textContent = toLabel(key) + ': ';
		const input = document.createElement('input');
		input.type = inputTypeFor(key, type);
		input.dataset['field'] = key;
		label.appendChild(input);
		form.appendChild(label);
	});
	const btn = document.createElement('button');
	btn.type = 'submit';
	btn.textContent = 'Add';
	form.appendChild(btn);
	return form;
}

function readValues(form: HTMLFormElement, schema: z.ZodObject<any>): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const el = form.querySelector<HTMLInputElement>(`[data-field="${key}"]`);
		if (!el) return;
		const kind = inputTypeFor(key, type);
		if (kind === 'checkbox') out[key] = el.checked;
		else if (kind === 'number') out[key] = el.value !== '' ? Number(el.value) : undefined;
		else out[key] = el.value || null;
	});
	return out;
}

type Row = Record<string, unknown> & { id: string };

function buildRow(
	item:     Row,
	schema:   z.ZodObject<any>,
	onToggle: (key: string) => void,
	onDelete: () => void,
): HTMLLIElement {
	const li = document.createElement('li');
	Object.entries(schema.shape as Record<string, z.ZodTypeAny>).forEach(([key, type]) => {
		const kind = inputTypeFor(key, type);
		if (kind === 'checkbox') {
			const cb   = document.createElement('input');
			cb.type    = 'checkbox';
			cb.checked = Boolean(item[key]);
			cb.addEventListener('change', () => onToggle(key));
			li.appendChild(cb);
		} else {
			const span       = document.createElement('span');
			span.textContent = String(item[key] ?? '');
			span.style.marginRight = '0.5em';
			li.appendChild(span);
		}
	});
	const del       = document.createElement('button');
	del.textContent = 'Delete';
	del.addEventListener('click', onDelete);
	li.appendChild(del);
	return li;
}

export function mountEntityPanel(config: EntityPanelConfig): void {
	const { el, basePath, schema } = config;
	const { state$, dispatch }     = createCrudState<Row>();
	const service                  = createCrudService<Row>(basePath);

	const form    = buildForm(schema);
	const errorEl = document.createElement('p');
	errorEl.style.color = 'red';
	const listEl  = document.createElement('ul');
	el.appendChild(form);
	el.appendChild(errorEl);
	el.appendChild(listEl);

	service.getAll$().subscribe({
		next:  items => dispatch({ type: 'LOAD_SUCCESS', items }),
		error: ()    => dispatch({ type: 'SET_ERROR', message: `Failed to load ${basePath}` }),
	});

	fromEvent<SubmitEvent>(form, 'submit').pipe(
		tap(e => e.preventDefault()),
		map(() => readValues(form, schema)),
		exhaustMap(body =>
			service.create$(body).pipe(
				tap(item => dispatch({ type: 'CREATE_SUCCESS', item })),
				catchError(() => {
					dispatch({ type: 'SET_ERROR', message: 'Failed to create.' });
					return EMPTY;
				}),
			),
		),
	).subscribe();

	state$.subscribe(({ items, error }) => {
		errorEl.textContent = error ?? '';
		listEl.innerHTML    = '';
		items.forEach(item => {
			listEl.appendChild(buildRow(
				item,
				schema,
				(key) => {
					service.update$(item.id, { [key]: !item[key] })
						.pipe(catchError(() => EMPTY))
						.subscribe(updated => dispatch({ type: 'UPDATE_SUCCESS', item: updated }));
				},
				() => {
					service.remove$(item.id)
						.pipe(catchError(() => EMPTY))
						.subscribe(() => dispatch({ type: 'DELETE_SUCCESS', id: item.id }));
				},
			));
		});
	});
}
