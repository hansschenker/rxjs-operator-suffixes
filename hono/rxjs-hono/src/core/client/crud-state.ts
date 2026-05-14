import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

export type CrudAction<T> =
	| { type: 'LOAD_SUCCESS'; items: T[] }
	| { type: 'CREATE_SUCCESS'; item: T }
	| { type: 'UPDATE_SUCCESS'; item: T }
	| { type: 'DELETE_SUCCESS'; id: string }
	| { type: 'SET_ERROR'; message: string };

export interface CrudState<T> {
	items: T[];
	error: string | null;
}

function crudReducer<T extends { id: string }>(
	state: CrudState<T>,
	action: CrudAction<T>,
): CrudState<T> {
	switch (action.type) {
		case 'LOAD_SUCCESS':
			return { ...state, items: action.items, error: null };
		case 'CREATE_SUCCESS':
			return { ...state, items: [...state.items, action.item] };
		case 'UPDATE_SUCCESS':
			return {
				...state,
				items: state.items.map(i => (i.id === action.item.id ? action.item : i)),
			};
		case 'DELETE_SUCCESS':
			return { ...state, items: state.items.filter(i => i.id !== action.id) };
		case 'SET_ERROR':
			return { ...state, error: action.message };
	}
}

export function createCrudState<T extends { id: string }>() {
	const action$ = new Subject<CrudAction<T>>();
	const state$ = action$.pipe(
		scan(crudReducer<T>, { items: [], error: null }),
		startWith({ items: [], error: null } as CrudState<T>),
		shareReplay(),
	);

	// Eagerly subscribe to ensure emissions are processed
	state$.subscribe();

	const dispatch = (action: CrudAction<T>): void => action$.next(action);
	return { action$, state$, dispatch };
}
