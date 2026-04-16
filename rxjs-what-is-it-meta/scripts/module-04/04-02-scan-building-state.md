---
module: 4
lesson: "4.2"
title: scan — building state from a stream
key_insight: scan is the Observable equivalent of Array.reduce — but it emits every intermediate accumulation, making it the natural primitive for reactive state management.
related: ["4.1", "4.3"]
---

## Hook

`Array.reduce` collapses an entire array into a single value. You give it a reducer and a seed, it processes every element, and at the end you get one result. `scan` does the same reduction — but emits every intermediate step as the stream progresses in real time. That single difference — emitting intermediates instead of only the final result — is the entire basis for reactive state management frameworks like NgRx, Akita, and Redux-Observable.

## Insight

`scan(reducer, seed)` works as follows: for every emission, it calls `reducer(accumulator, currentValue)` and emits the result as both the new accumulator and the next downstream value. The seed is the initial accumulator value, used before any emissions arrive.

The pattern `actions$.pipe(scan(reducer, initialState), shareReplay(1))` is a complete reactive store. Every time an action is dispatched, the reducer produces a new state snapshot — a pure function with no mutation — and that snapshot is immediately multicasted to all subscribers via `shareReplay(1)`. There is no setter method, no event bus, no imperative notification: the store is the `scan` operator.

This is structurally identical to how Redux and NgRx work. The NgRx store is `scan` with a shared `Subject` at the entry point, middleware support layered on top, and DevTools integration wired in. Strip those away and the core is one operator. Understanding `scan` means you understand the mechanism behind every Redux-style store — and you can build a fully functional one in five lines of RxJS.

`scan` also composes: you can derive multiple slices of state from the same action stream using separate `scan` calls, combine them with `combineLatest`, and project the combined result — all without a single imperative assignment.

## Example

A complete counter store using `scan`, `startWith`, and `shareReplay`:

```typescript
type CounterAction =
	| { type: 'increment' }
	| { type: 'decrement' }
	| { type: 'reset' };

function counterReducer(state: number, action: CounterAction): number {
	switch (action.type) {
		case 'increment': return state + 1;
		case 'decrement': return state - 1;
		case 'reset':     return 0;
	}
}

const action$ = new Subject<CounterAction>();

const state$ = action$.pipe(
	scan(counterReducer, 0),
	startWith(0),
	shareReplay(1),
);

state$.subscribe((count: number) => console.log('count:', count));

action$.next({ type: 'increment' }); // count: 1
action$.next({ type: 'increment' }); // count: 2
action$.next({ type: 'decrement' }); // count: 1
action$.next({ type: 'reset' });     // count: 0
```

`startWith(0)` ensures late subscribers receive the current state immediately. `shareReplay(1)` ensures all subscribers share one execution — the store is multicasted, not replayed from scratch.

## Summary

- `scan` = `reduce` that emits every intermediate accumulation, not only the final value
- `actions$.pipe(scan(reducer, initialState), shareReplay(1))` is a complete reactive store in one pipeline
- NgRx and Redux-Observable are `scan` plus a `Subject` entry point plus infrastructure — the mechanism is the same operator
