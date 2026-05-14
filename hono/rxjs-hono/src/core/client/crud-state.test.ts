import { describe, test, expect } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { skip } from 'rxjs/operators';
import { createCrudState } from './crud-state';

type Item = { id: string; name: string };

const a: Item = { id: '1', name: 'Alpha' };
const b: Item = { id: '2', name: 'Beta' };

describe('createCrudState<T>', () => {
	test('initial state has empty items and no error', async () => {
		const { state$ } = createCrudState<Item>();
		const state = await firstValueFrom(state$);
		expect(state.items).toEqual([]);
		expect(state.error).toBeNull();
	});

	test('LOAD_SUCCESS replaces items and clears error', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'SET_ERROR', message: 'old' });
		dispatch({ type: 'LOAD_SUCCESS', items: [a] });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items).toEqual([a]);
		expect(state.error).toBeNull();
	});

	test('CREATE_SUCCESS appends item', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'CREATE_SUCCESS', item: a });
		const state = await firstValueFrom(state$.pipe(skip(1)));
		expect(state.items).toHaveLength(1);
		expect(state.items[0]).toEqual(a);
	});

	test('UPDATE_SUCCESS replaces matching item by id', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'UPDATE_SUCCESS', item: { id: '1', name: 'Alpha Updated' } });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items[0].name).toBe('Alpha Updated');
		expect(state.items[1]).toEqual(b);
	});

	test('UPDATE_SUCCESS leaves non-matching items unchanged', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'UPDATE_SUCCESS', item: { id: '1', name: 'Alpha Updated' } });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items[1]).toEqual(b);
	});

	test('DELETE_SUCCESS removes item by id', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a, b] });
		dispatch({ type: 'DELETE_SUCCESS', id: '1' });
		const state = await firstValueFrom(state$.pipe(skip(2)));
		expect(state.items).toHaveLength(1);
		expect(state.items[0]).toEqual(b);
	});

	test('SET_ERROR records message', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'SET_ERROR', message: 'Network error' });
		const state = await firstValueFrom(state$.pipe(skip(1)));
		expect(state.error).toBe('Network error');
	});

	test('reducer is pure — does not mutate frozen input', async () => {
		const { state$, dispatch } = createCrudState<Item>();
		dispatch({ type: 'LOAD_SUCCESS', items: [a] });
		const snapshot = await firstValueFrom(state$.pipe(skip(1)));
		Object.freeze(snapshot);
		Object.freeze(snapshot.items);
		expect(() => dispatch({ type: 'DELETE_SUCCESS', id: '1' })).not.toThrow();
	});
});
