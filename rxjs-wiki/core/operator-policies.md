---
title: "Operator Policies — Eight-Policy Framework"
category: core
tags: [core, operators, policies, specification, type-safety, composition, reducer, action]
related: [operators.md, custom-operators.md, Observable.md, ../patterns/state-management.md, ../testing/marble-testing.md]
sources: 1
updated: 2026-04-08
---

# Operator Policies — Eight-Policy Framework

> Every RxJS operator can be fully specified by eight policies. These policies describe the complete lifecycle, type contract, and composition rules — making implicit operator behaviour explicit.

## The Eight Policies

| # | Policy | The question it answers |
|---|--------|------------------------|
| 1 | **Start** | When does the operator begin producing output? |
| 2 | **Emit** | Under what conditions does it call `next()`? |
| 3 | **Completion** | When does it call `complete()`? |
| 4 | **State** | What internal state does it maintain? |
| 5 | **Cancellation** | What happens when the subscriber unsubscribes? |
| 6 | **Error** | How does it handle upstream errors? |
| 7 | **Output Type** | What is the type of values it emits? `Observable<R>` |
| 8 | **Input Type** | What type must the upstream source emit? `Observable<T>` |

Policies 7 and 8 together enforce the **type chain rule**:

```
Output type of operator(n) === Input type of operator(n+1)
```

TypeScript enforces this at compile time in `pipe()` chains.

## Example: `map` Through the Eight Policies

```typescript
// map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>
```

| Policy | map |
|--------|-----|
| Start | Immediately on source subscription |
| Emit | For every `next` from source — applies `project`, emits result |
| Completion | Completes when source completes |
| State | `index` counter (increments per emission) |
| Cancellation | Unsubscribes from source |
| Error | Forwards source errors; errors thrown in `project` also error the stream |
| Output Type | `Observable<R>` — `R` is the return type of `project` |
| Input Type | `Observable<T>` — any type |

## Example: `switchMap` Through the Eight Policies

```typescript
// switchMap<T, R>(project: (value: T, index: number) => ObservableInput<R>): OperatorFunction<T, R>
```

| Policy | switchMap |
|--------|-----------|
| Start | Immediately on source subscription |
| Emit | Emits values from the **current** inner Observable |
| Completion | Completes when source completes **and** current inner completes |
| State | Reference to the current inner subscription |
| Cancellation | Unsubscribes from source and current inner |
| Error | Source error or inner error propagates to output; errors in `project` error the stream |
| Output Type | `Observable<R>` — inner Observable's emitted type |
| Input Type | `Observable<T>` — any type; `project` must return `ObservableInput<R>` |

## The Type Chain Rule (Policy 7 → 8)

The critical constraint: **every operator's output type must match the next operator's input type**.

```typescript
// TypeScript infers this chain at compile time:
of(1, 2, 3)                          // Observable<number>
	.pipe(
		map(x => x * 2),             // OperatorFunction<number, number>
		map(x => x.toString()),      // OperatorFunction<number, string>
		map(s => s.length),          // OperatorFunction<string, number>
		filter(n => n > 0),          // OperatorFunction<number, number>
	);
// Final type: Observable<number>
```

A type mismatch is a compile error:

```typescript
of(1, 2, 3).pipe(
	map(x => x.toUpperCase()), // ✗ TypeScript error: number has no toUpperCase
);
```

### Type Constraint Categories

| Category | Example type | Operators that require it |
|----------|-------------|--------------------------|
| Any Type | `T` | `map`, `filter`, `tap`, `take` |
| Specific Type | `number` | `max`, `min`, `sum` |
| Object with properties | `T extends object` | `pluck` (deprecated), `groupBy` with key |
| Comparable | `T extends Comparable` | `max`, `min` |
| Observable | `Observable<T>` | `mergeAll`, `switchAll`, `concatAll` |
| Array / Iterable | `T[]` or `Iterable<T>` | `from`, operators expecting iterables |
| Union | `A \| B` | narrow in `filter`, `partition` |

## Strongly Typed Actions and Reducers

The Eight-Policy Framework naturally extends to the Action/Reducer pattern. Renaming the generic `Input` to `Action` makes the semantics explicit:

```typescript
type Reducer<State, Action> = (state: State, action: Action) => State;

// Strongly typed discriminated union of actions
type AppAction =
	| { type: 'INCREMENT'; payload: number }
	| { type: 'DECREMENT'; payload: number }
	| { type: 'RESET' };

// State type
interface AppState {
	count: number;
}

// Reducer — exhaustively handles all action types
const reducer: Reducer<AppState, AppAction> = (state, action) => {
	switch (action.type) {
		case 'INCREMENT':
			return { ...state, count: state.count + action.payload };
		case 'DECREMENT':
			return { ...state, count: state.count - action.payload };
		case 'RESET':
			return { count: 0 };
		default:
			return state;
	}
};

// scan applies the reducer to an action stream
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

const action$ = new Subject<AppAction>();

const state$ = action$.pipe(
	scan(reducer, { count: 0 }),
	startWith({ count: 0 }),
	shareReplay(1),
);
```

**Benefits of the `Action` naming:**
- Semantic clarity: generic parameter name reflects its role
- Discriminated unions enable exhaustive type checking
- TypeScript narrows the `action` type in each `case` branch
- Adding a new action type forces the reducer to handle it (with `noImplicitReturns`)

## Applying the Framework When Choosing Operators

Use the policies as a checklist when selecting an operator:

```
1. Start    — Do I need immediate output or triggered output?
2. Emit     — One value per input? Accumulated? Rate-limited?
3. Completion — Complete with source? After N? On external signal?
4. State    — Do I need memory of prior values?
5. Cancellation — Is cleanup important? (always yes for async)
6. Error    — Should I retry? Catch? Let it propagate?
7. Output   — What type do I need to produce?
8. Input    — What type am I receiving? Does it match?
```

## Policy Comparison: scan vs reduce

| Policy | `scan` | `reduce` |
|--------|--------|----------|
| Start | Immediately | Immediately |
| Emit | After every source `next` | Only on source `complete` |
| Completion | When source completes | When source completes |
| State | Running accumulator | Running accumulator |
| Cancellation | Unsubscribes from source | Unsubscribes from source |
| Error | Forwards source error | Forwards source error |
| Output Type | `Observable<Acc>` — same as seed type | `Observable<Acc>` — same as seed type |
| Input Type | `Observable<T>` — any type | `Observable<T>` — any type |

The **only** difference is in the Emit policy: `scan` emits after every step (streaming); `reduce` waits for completion (final result only).

## Related

- [operators](operators.md) — operator reference with all families
- [custom-operators](custom-operators.md) — building type-safe custom operators with `pipe()`
- [Observable](Observable.md) — the `OperatorFunction<T, R>` contract
- [state-management](../patterns/state-management.md) — Reducer + Action + scan pattern
- [marble-testing](../testing/marble-testing.md) — testing operator behaviour with marble diagrams
