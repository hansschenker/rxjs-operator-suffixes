import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';
import type { Action, AppState } from './types';

const initialState: AppState = {
	query: '',
	results: [],
	loading: false,
	error: null,
};

function reducer(state: AppState, action: Action): AppState {
	switch (action.type) {
		case 'QUERY_CHANGED':  return { ...state, query: action.query };
		case 'SEARCH_STARTED': return { ...state, loading: true, error: null };
		case 'SEARCH_SUCCESS': return { ...state, loading: false, results: action.results };
		case 'SEARCH_ERROR':   return { ...state, loading: false, error: action.error };
		case 'SEARCH_CLEARED': return { ...state, results: [], loading: false };
		default: return state;
	}
}

export const action$ = new Subject<Action>();

export const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	// refCount: true — source resets when all subscribers disconnect (e.g. test teardown).
	// For a long-lived SPA this is the correct choice; all subscribers stay active for the
	// app's lifetime. Use refCount: false only if you need post-completion replay.
	shareReplay({ bufferSize: 1, refCount: true }),
);
