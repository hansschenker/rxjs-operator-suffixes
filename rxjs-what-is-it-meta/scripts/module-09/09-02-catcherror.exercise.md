---
module: 9
lesson: "9.2"
title: catchError
exercise: Add inner catchError inside switchMap so a failed search does not kill the entire typeahead stream.
difficulty: intermediate
---

## Scenario

A typeahead search uses `switchMap` to fire HTTP requests on each debounced keystroke. When one request fails — a network error, a 500 response, or a timeout — the entire search Observable terminates. The user can no longer search at all until they refresh the page, even though every subsequent keystroke should work fine.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface SearchResult { id: number; title: string; }

const searchInput = document.getElementById('search') as HTMLInputElement;

const query$ = fromEvent<Event>(searchInput, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
);

// BUG: no inner catchError — one failed search kills the entire typeahead
const results$: Observable<SearchResult[]> = query$.pipe(
	switchMap((query: string) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`),
	),
);

results$.subscribe({
	next: (results: SearchResult[]) => renderResults(results),
	error: (err: unknown) => console.error('Search failed permanently:', err),
});
declare function renderResults(results: SearchResult[]): void;
```

## Task

1. Explain why a single failed HTTP request terminates the entire typeahead stream.
2. Add `catchError(() => of([] as SearchResult[]))` inside the `switchMap` callback — placed after `ajax.getJSON` — so a failed search returns an empty array without terminating the outer stream.
3. Update the `error` callback in `subscribe` — is it still reachable after your fix? What would trigger it?

## Hint

An error inside `switchMap`'s inner Observable propagates to the outer stream — unless the inner Observable handles it first. The inner `catchError` is the shield that keeps the outer stream alive.
