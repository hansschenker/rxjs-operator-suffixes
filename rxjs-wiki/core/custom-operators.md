---
title: "Custom Operators and pipe()"
category: core
tags: [core, operators, custom, pipe, composition, reusability, higher-order]
related: [operators.md, Observable.md, ../patterns/index.md]
sources: 2
updated: 2026-04-08
---

# Custom Operators and pipe()

> `pipe()` is both a composition function and the foundation of custom operators. Any named combination of existing operators is a custom operator — a reusable, type-safe pipeline fragment.

## pipe() — The Composition Operator

`pipe()` chains multiple operators left-to-right. Instead of nesting:

```typescript
// ✗ Unreadable nesting — right-to-left execution order
const result$ = skip(1)(filter(x => x > 0)(map(x => x * 2)(source$)));

// ✓ pipe() — left-to-right, readable, declarative
const result$ = source$.pipe(
	map(x => x * 2),
	filter(x => x > 0),
	skip(1),
);
```

`pipe()` is also exported as a standalone function from `rxjs`, which enables custom operator composition **without** an Observable instance:

```typescript
import { pipe } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Standalone pipe() — returns an OperatorFunction
const doubleAndFilter = pipe(
	map((x: number) => x * 2),
	filter((x: number) => x > 10),
);
```

## Creating a Custom Operator with pipe()

A custom operator is a function that returns an `OperatorFunction<T, R>`. The simplest form uses `pipe()` to compose existing operators:

```typescript
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

// Custom operator: add 1, then multiply by 2
function addOneAndMultiplyTwo(): OperatorFunction<number, number> {
	return pipe(
		map(x => x + 1),
		map(x => x * 2),
	);
}

// Usage — just like a built-in operator
import { of } from 'rxjs';

of(5).pipe(
	addOneAndMultiplyTwo(),
).subscribe(console.log); // 12  (5 + 1 = 6, 6 * 2 = 12)
```

### With Parameters

Custom operators become parametric when the factory function accepts arguments:

```typescript
import { pipe } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

// Parametric custom operator
function scaleAndFilter(
	multiplier: number,
	threshold: number,
): OperatorFunction<number, number> {
	return pipe(
		map(x => x * multiplier),
		filter(x => x > threshold),
	);
}

source$.pipe(
	scaleAndFilter(3, 15),
).subscribe(console.log);
```

## Real-World Custom Operators

### Search Input

A canonical example — debounce + deduplicate + trim, reusable across all search fields:

```typescript
import { pipe } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

function searchInput(debounceMs = 300): OperatorFunction<string, string> {
	return pipe(
		debounceTime(debounceMs),
		map(s => s.trim()),
		distinctUntilChanged(),
		filter(s => s.length >= 2),
	);
}

// Reused on multiple inputs — same behaviour, single definition
searchInput$.pipe(searchInput()).subscribe(query => search(query));
tagInput$.pipe(searchInput(150)).subscribe(tag => filterByTag(tag));
```

### Select (Pluck a Slice of State)

```typescript
import { pipe } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

function select<T, K extends keyof T>(key: K): OperatorFunction<T, T[K]> {
	return pipe(
		map(state => state[key]),
		distinctUntilChanged(),
	);
}

// Used as a selector on a BehaviorSubject state stream
const name$ = state$.pipe(select('name'));
const count$ = state$.pipe(select('count'));
```

### Retry with Exponential Backoff

```typescript
import { pipe, timer } from 'rxjs';
import { retry, catchError, switchMap } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';

function retryWithBackoff<T>(
	maxRetries = 3,
	initialDelay = 1000,
): OperatorFunction<T, T> {
	return pipe(
		retry({
			count: maxRetries,
			delay: (error, retryIndex) => timer(initialDelay * Math.pow(2, retryIndex - 1)),
		}),
	);
}

ajax.getJSON('/api/data').pipe(
	retryWithBackoff(3, 500),
).subscribe(data => render(data));
```

## Low-Level: Custom Operator with new Observable

When pipe() composition isn't enough — you need to control the subscription lifecycle directly:

```typescript
import { Observable } from 'rxjs';
import { OperatorFunction } from 'rxjs';

function multiplyByTwo(): OperatorFunction<number, number> {
	return (source: Observable<number>) =>
		new Observable<number>(subscriber => {
			const sub = source.subscribe({
				next: value => subscriber.next(value * 2),
				error: err => subscriber.error(err),
				complete: () => subscriber.complete(),
			});
			// Return teardown
			return () => sub.unsubscribe();
		});
}
```

This pattern is necessary when:
- You need to manage an internal subscription explicitly
- You need to buffer, delay, or alter the completion semantics
- You are building a higher-order operator that subscribes to inner Observables

For composing existing operators, always prefer the `pipe()` factory pattern — it is simpler and eliminates teardown boilerplate.

## Type Safety

Custom operators should always declare explicit input and output types:

```typescript
import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';

// Changes the type: T → R
function transform<T, R>(fn: (v: T) => R): OperatorFunction<T, R> {
	return pipe(map(fn));
}

// Keeps the same type: T → T
function logAndPass<T>(label: string): MonoTypeOperatorFunction<T> {
	return pipe(tap(v => console.log(`[${label}]`, v)));
}
```

`MonoTypeOperatorFunction<T>` is an alias for `OperatorFunction<T, T>` — use it for operators that don't change the value type.

## The Operator Signature Contract

Every RxJS operator satisfies:

```
OperatorFunction<Input, Output> = (source: Observable<Input>) => Observable<Output>
```

This means:
- **Output type of operator N** must match **input type of operator N+1**
- TypeScript enforces this at compile time in `pipe()` chains
- Custom operators are first-class — they slot into `pipe()` identically to built-ins

## Related

- [operators](operators.md) — built-in operator reference; the eight policies
- [operator-policies](operator-policies.md) — formal Eight-Policy specification for operators
- [Observable](Observable.md) — the `OperatorFunction` type and pipe() chain model
- [index](../patterns/index.md) — recipes combining custom operators
