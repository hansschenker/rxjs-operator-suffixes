import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { action$, state$ } from './state';
import { searchOnQuery } from './operators/search-on-query';
import { getSearchInput, render } from './ui';
import type { Action } from './types';

const input = getSearchInput();

// Layer 1+2: value transformation + time-based rate limiting
const query$ = fromEvent<Event>(input, 'input').pipe(
	map(e => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
);

// Layer 4: flatten search requests with cancel-on-new semantics
query$.pipe(
	tap(query => {
		const a: Action = query
			? { type: 'SEARCH_STARTED' }
			: { type: 'SEARCH_CLEARED' };
		action$.next(a);
	}),
	searchOnQuery(),
).subscribe(results => action$.next({ type: 'SEARCH_SUCCESS', results }));

// Layer 3: shared state drives the UI
state$.subscribe(render);
