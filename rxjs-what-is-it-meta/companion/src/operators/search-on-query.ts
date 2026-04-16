import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import type { SearchResult } from '../types';

// Simulated API — replace with real fetch in a production app
function mockSearch(query: string): Observable<SearchResult[]> {
	if (!query.trim()) return of([]);
	return new Observable<SearchResult[]>(subscriber => {
		const timer = setTimeout(() => {
			const results: SearchResult[] = [
				{ id: 1, title: `${query} result 1`, category: 'docs' },
				{ id: 2, title: `${query} result 2`, category: 'api' },
			];
			subscriber.next(results);
			subscriber.complete();
		}, 400);
		return () => clearTimeout(timer);
	});
}

export function searchOnQuery(
	apiFn: (query: string) => Observable<SearchResult[]> = mockSearch,
) {
	return (source$: Observable<string>): Observable<SearchResult[]> =>
		source$.pipe(
			switchMap(query =>
				apiFn(query).pipe(catchError(() => of([] as SearchResult[]))),
			),
		);
}
