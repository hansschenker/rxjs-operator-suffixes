---
module: 4
lesson: "4.1"
title: The three primitives
exercise: Implement distinctUntilChanged and pairwise using only map, filter, and flatMap — proving they are compositions of the three primitives.
difficulty: advanced
---

## Scenario

A senior developer on your team claims that every RxJS operator is derivable from three primitives: `map`, `filter`, and `flatMap`. You are sceptical about `distinctUntilChanged` and `pairwise` because they seem to require memory of the previous value. This exercise proves the claim by implementing both operators without importing them from RxJS.

## Starter Code

```typescript
import { Observable } from 'rxjs';
import { map, filter, mergeMap } from 'rxjs/operators';
import type { MonoTypeOperatorFunction, OperatorFunction } from 'rxjs';

// Implement using ONLY map, filter, and mergeMap (flatMap).
// Do NOT import distinctUntilChanged or pairwise from rxjs.
// You MAY use closures to hold previous-value state.

function myDistinctUntilChanged<T>(): MonoTypeOperatorFunction<T> {
	return (source$: Observable<T>) => {
		// ??? implement here
		return source$; // placeholder — replace this
	};
}

function myPairwise<T>(): OperatorFunction<T, [T, T]> {
	return (source$: Observable<T>) => {
		// ??? implement here
		return source$ as unknown as Observable<[T, T]>; // placeholder — replace this
	};
}

// Smoke-test harness
import { of } from 'rxjs';

of(1, 1, 2, 2, 3).pipe(myDistinctUntilChanged()).subscribe(v => console.log('distinct:', v));
// Expected: 1, 2, 3

of('a', 'b', 'c', 'd').pipe(myPairwise()).subscribe(v => console.log('pair:', v));
// Expected: ['a','b'], ['b','c'], ['c','d']
```

## Task

1. Implement `myDistinctUntilChanged` using only `filter` (and a closure for the previous value). No `map` or `mergeMap` required — explain why.
2. Implement `myPairwise` using only `filter` and `map` (and a closure). Explain how the closure stores the sliding window.
3. Explain in two sentences why `flatMap` is the most powerful of the three primitives — and name one operator that genuinely requires it (cannot be implemented with just `map` and `filter`).

## Hint

A closure declared outside the Observable's subscriber function persists across emissions, giving your operator "memory." `filter` with a stateful predicate is all you need for `distinctUntilChanged`; `map` with a stateful transform gives you `pairwise`. `flatMap` is needed for operators that change the cardinality of the stream — turning one value into many Observables.
