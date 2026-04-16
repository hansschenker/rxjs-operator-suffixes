---
module: 3
lesson: "3.5"
title: RxJS as a DSL
exercise: Wrap raw RxJS operators in domain-named functions so a search pipeline reads as pure business language.
difficulty: intermediate
---

## Scenario

The product search pipeline below is correct but reads like a list of RxJS implementation details. A new developer has to know what `debounceTime`, `distinctUntilChanged`, `switchMap`, and `catchError` do before they can understand the business intent. Wrapping each operator in a domain-named function makes the pipeline readable as a business rule without knowing any RxJS.

## Starter Code

```typescript
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

interface Product { id: number; name: string; price: number; }

declare function searchProducts(query: string): Observable<Product[]>;
declare const query$: Observable<string>;

// Before: pipeline reads as implementation details
const results$ = query$.pipe(
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((q: string) => searchProducts(q)),
	catchError(() => of<Product[]>([])),
);
```

## Task

1. Extract each operator invocation into a named domain function:
   - `waitForUserPause()` — wraps `debounceTime(300)`
   - `ignoreRepeatQuery()` — wraps `distinctUntilChanged()`
   - `loadMatchingProducts(searchFn: (q: string) => Observable<Product[]>)` — wraps `switchMap`
   - `handleSearchFailure()` — wraps `catchError(() => of([]))`
2. Rewrite `results$` using only the four domain functions — the pipeline body must contain zero raw RxJS operator names.
3. Add TypeScript return types to each domain function using `MonoTypeOperatorFunction` or `OperatorFunction` from RxJS. Explain in one sentence why this matters for composability.

## Hint

Each domain function returns an `OperatorFunction<In, Out>` — it is still a plain RxJS operator under the hood, but the name now communicates intent. The pipeline becomes documentation: "wait for user pause → ignore repeat query → load matching products → handle search failure."
