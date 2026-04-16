---
module: 1
lesson: "1.4"
title: The Unified Type — why Observable absorbs Arrays, Promises, and Events
key_insight: Observable is not one of many async types — it subsumes all of them. An Array is an Observable that completes synchronously; a Promise is an Observable that emits exactly once.
related: ["1.3", "2.5"]
---

## Hook

Before RxJS, a JavaScript codebase typically juggled three completely different async APIs: callbacks or `EventEmitter` for DOM events, Promises for single async results, and arrays with their own synchronous operator set for collections. Three vocabularies, three mental models, three sets of edge cases to remember. RxJS replaces all three with one type — and that unification is not a design preference. It is a mathematical consequence of the duality you saw in Lesson 1.2.

## Insight

Every data source can be placed on a two-axis grid. One axis is timing: synchronous (all values available now) versus asynchronous (values arrive over time). The other axis is arity: a single value versus multiple values. This gives four cells:

- Synchronous + single value: a plain `T` — just a variable.
- Synchronous + multiple values: `Array<T>` — all values in memory at once.
- Asynchronous + single value: `Promise<T>` — one value, delivered later.
- Asynchronous + multiple values: `Observable<T>` — the bottom-right cell.

Observable sits in the bottom-right quadrant, and critically, it subsumes every other cell. A synchronous single value is an Observable that emits once and completes immediately. An array is an Observable that emits all values synchronously and then completes. A Promise is an Observable that emits exactly one value asynchronously and then completes. An event stream is an Observable that emits indefinitely and never completes on its own.

Because every source maps onto the same `Observable<T>` type, the same operator vocabulary — `map`, `filter`, `switchMap`, `debounceTime` — applies to all of them without modification. You learn the operators once and apply them to any source.

## Example

The 2×2 grid, then four creation calls each using the same `pipe` chain — demonstrating that operators are indifferent to the source type.

```
┌───────────────────┬──────────────────┬───────────────────┐
│                   │  Single value    │  Multiple values  │
├───────────────────┼──────────────────┼───────────────────┤
│  Synchronous      │  T               │  Array<T>         │
├───────────────────┼──────────────────┼───────────────────┤
│  Asynchronous     │  Promise<T>      │  Observable<T> ◄  │
└───────────────────┴──────────────────┴───────────────────┘
```

```typescript
import { from, fromEvent, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';

const double = <T extends number>(source$: ReturnType<typeof of<T>>) =>
	source$.pipe(
		filter((x: number) => x > 1),
		map((x: number) => x * 2),
	);

// From a single value
of(3).pipe(filter((x: number) => x > 1), map((x: number) => x * 2));

// From an array
from([1, 2, 3]).pipe(filter((x: number) => x > 1), map((x: number) => x * 2));

// From a Promise
from(fetch('/api/value').then((r) => r.json() as Promise<number>)).pipe(
	filter((x: number) => x > 1),
	map((x: number) => x * 2),
);

// From a DOM event (numeric input value)
fromEvent<Event>(document.querySelector('input')!, 'input').pipe(
	map((e: Event) => Number((e.target as HTMLInputElement).value)),
	filter((x: number) => x > 1),
	map((x: number) => x * 2),
);
```

Same two operators, four completely different source types. One vocabulary.

## Summary

- The 2×2 grid (sync/async × single/multiple) shows Observable as the bottom-right cell — the one type that covers all quadrants
- `from()` converts `Array`, `Promise`, or `Iterable` to Observable; `of()` wraps a single value; `fromEvent()` converts DOM events — all produce the same `Observable<T>`
- One type plus one operator vocabulary means no more switching between async APIs mid-codebase

## Pitfall

Wrapping a Promise in `new Observable(...)` instead of using `from(promise)`. The unified type already handles Promises, Arrays, and iterables via `from`. Manual wrapping is error-prone (forgetting to call `complete()`) and unnecessary — it is the wheel RxJS already invented.
