---
module: 4
lesson: "4.1"
title: The three primitives — map, filter, flatMap
key_insight: Every value-based operator in RxJS is a composition of three primitives — map, filter, and flatMap. Master these three and you can derive all 60+ value operators from first principles.
---

## Hook

RxJS ships with over 100 operators. That number stops being scary the moment you realize you do not need to learn 100 things. You need to learn three things, and recognize everything else as a special case of those three. The entire value-transformation surface of RxJS reduces to `map`, `filter`, and `flatMap` — and that reduction is not a simplification, it is the actual mathematical structure.

## Insight

`map` is 1-to-1: every emission in produces exactly one emission out. The value is transformed but the count is preserved. `filter` is 1-to-0-or-1: every emission either passes through unchanged or is dropped entirely. The count may decrease but values are never synthesized. `flatMap` — also called `mergeMap` in RxJS — is 1-to-many: every emission produces an inner Observable, and every value emitted by those inner Observables is forwarded downstream. The count may grow without bound.

All other value operators are compositions or specializations of these three. `tap` is `map` that ignores its return value and is used only for its side effect. `take(n)` is `filter` with a counter that terminates the stream after `n` passes. `scan` is `map` with accumulated state — each emission becomes the input to a reducer that also receives the previous output. `switchMap`, `concatMap`, and `exhaustMap` are all `flatMap` with different policies for managing concurrent inner Observables.

Understanding this reduction changes how you read unfamiliar operators. When you encounter one you have never seen, ask: "is this map, filter, flatMap, or a combination?" The answer tells you its cardinality, its cost, and its composability immediately — before you read a single line of documentation.

## Example

`distinctUntilChanged` looks like a specialized operator, but it is just a stateful `filter` using a closure to remember the previous emission. Here is the full reimplementation:

```typescript
const UNSET = Symbol('unset');

function myDistinctUntilChanged<T>() {
	return (source$: Observable<T>): Observable<T> => {
		let last: T | typeof UNSET = UNSET;
		return source$.pipe(
			filter((value: T): boolean => {
				if (last === UNSET || value !== last) {
					last = value;
					return true;
				}
				return false;
			}),
		);
	};
}
```

The entire behavior — suppress consecutive duplicates — is expressed as a `filter` with one variable of state. No new primitive is needed. This is the pattern: when RxJS gives you a named operator, what it is really giving you is a named composition of the three primitives, packaged for readability.

## Summary

- `map` = 1:1 transform; `filter` = 1:0-or-1 pass/drop; `flatMap` = 1:many with inner Observables
- Every value operator in RxJS is a composition or specialization of these three primitives
- Reduce unfamiliar operators to their primitive form to predict cardinality, cost, and behavior before reading docs
