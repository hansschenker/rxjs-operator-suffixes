---
module: 10
lesson: "10.2"
title: Hexagonal Architecture
exercise: Refactor a component that imports RxJS operators directly so all RxJS logic moves into a domain facade, leaving the component with zero RxJS imports.
difficulty: advanced
---

## Scenario

A `SearchComponent` imports `switchMap`, `combineLatest`, `shareReplay`, and `catchError` directly from RxJS. When the team decides to upgrade to a different streaming library, every component file must be touched. After refactoring to a facade, only the facade layer changes — components remain untouched.

## Starter Code

```typescript
// search.component.ts — BUG: direct RxJS imports break hexagonal boundary
import { fromEvent, combineLatest } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged, catchError, shareReplay, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

interface SearchResult { id: number; title: string; }
interface UserContext { userId: number; region: string; }

const searchInput = document.getElementById('search') as HTMLInputElement;
const currentUser$ = ajax.getJSON<UserContext>('/api/me').pipe(shareReplay(1));

const results$ = fromEvent<Event>(searchInput, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((query: string) =>
		combineLatest([of(query), currentUser$]).pipe(
			switchMap(([q, user]: [string, UserContext]) =>
				ajax.getJSON<SearchResult[]>(`/api/search?q=${q}&region=${user.region}`).pipe(
					catchError(() => of([] as SearchResult[])),
				),
			),
		),
	),
);
```

## Task

1. Create a `search.facade.ts` file that exports `searchWithContext(input: HTMLInputElement): Observable<SearchResult[]>` — move all RxJS logic there.
2. Rewrite `search.component.ts` so it has zero imports from `'rxjs'` or `'rxjs/operators'`.
3. Identify the one import that may still appear in the component — `Observable` type — and explain how TypeScript's `import type` makes it zero-cost at runtime.

## Hint

The hexagonal boundary means: components import domain functions, not RxJS operators. The facade is the adapter between the domain language and the infrastructure (RxJS).
