---
module: 10
lesson: "10.1"
title: Alias and Wrap Pattern
exercise: Wrap four raw RxJS operators in domain-named functions so a product search pipeline reads as pure business language.
difficulty: intermediate
---

## Scenario

A product search pipeline is readable by RxJS engineers but not by domain experts or product managers. The goal is to give each operator a name that describes its business intent, not its technical mechanism. The same operator inside, a completely different vocabulary outside.

## Starter Code

```typescript
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { of, Observable, OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { ajax } from 'rxjs/ajax';

interface Product { id: number; name: string; category: string; }

// Raw pipeline — readable by RxJS experts only:
// query$.pipe(
//   debounceTime(300),
//   distinctUntilChanged(),
//   switchMap(q => searchProducts(q)),
//   catchError(() => of([])),
// );

// EXERCISE: wrap each operator in a domain-named function

// Wraps debounceTime(300)
function waitForUserPause(): MonoTypeOperatorFunction<string> {
	return /* ??? */;
}

// Wraps distinctUntilChanged()
function ignoreRepeatQuery(): MonoTypeOperatorFunction<string> {
	return /* ??? */;
}

// Wraps switchMap(q => apiFn(q))
function loadMatchingProducts(
	apiFn: (query: string) => Observable<Product[]>,
): OperatorFunction<string, Product[]> {
	return /* ??? */;
}

// Wraps catchError(() => of([]))
function handleSearchFailure(): MonoTypeOperatorFunction<Product[]> {
	return /* ??? */;
}

declare const query$: Observable<string>;
declare function searchProducts(q: string): Observable<Product[]>;

// EXERCISE: use your domain functions — the pipeline body must have zero raw RxJS names:
const results$ = query$.pipe(
	/* ??? */,
	/* ??? */,
	/* ??? */,
	/* ??? */,
);
```

## Task

1. Implement each of the four wrapper functions returning the correct `OperatorFunction` or `MonoTypeOperatorFunction`.
2. Complete the final `results$` pipeline using only the four domain functions — no raw RxJS operator names in the `pipe()` call.
3. Explain in one sentence how `loadMatchingProducts(searchProducts)` makes the operator unit-testable in isolation.

## Hint

The wrapper function is the seam — the domain name is what business people read, the RxJS operator inside is what engineers maintain. The injectable `apiFn` parameter is what makes it testable.
