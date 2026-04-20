---
operator: combineLatest
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-26
---

### `combineLatest(observables: ObservableInput<T>[]): Observable<T[]>`

> Combines multiple source Observables by emitting an array (or projected value) of the **most recent value from each** source whenever any source emits — but only after all sources have emitted at least once.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — reacts to *which* source emits, not *when* |
| **Value-sensitive** | No — emits regardless of value content |
| **Lossy** | No — every value is captured as "latest"; intermediate values overwrite the slot but the slot is always forwarded on the next emission |
| **Completion required** | No — emits on every source emission once all slots are filled; continues until all sources complete |

**Completion behaviour** — `combineLatest` does not require sources to complete to emit. It emits each time any source emits, provided all sources have emitted at least once. A single source completing does not stop the operator — the last value from the completed source remains in its slot indefinitely. The combined Observable completes only when **all** sources have completed.

**Lossy behaviour** — `combineLatest` is effectively non-lossy at the *combined* level: every emission from any source triggers an output emission using the latest values of all others. However, if two sources emit in rapid succession before a subscriber processes the combined output, intermediate slot states are overwritten — you will not see every unique combination. This is by design: it always reflects the *current state* of all inputs.

---

#### Marble Diagram

```
a$:      --1-------3---5--|
b$:      ----10--20---30--|
         combineLatest([a$, b$])
output:  ----[1,10]-[1,20]-[3,20]-[3,30]-[5,30]--|
```

Note the first emission `[1,10]` only occurs once both `a$` and `b$` have emitted.

---

#### Signature

```typescript
// Static creation operator (RxJS 7)
combineLatest<T extends readonly unknown[]>(
  sources: readonly [...ObservableInputTuple<T>]
): Observable<T>

// With result selector (deprecated in favour of map)
combineLatest<T extends readonly unknown[], R>(
  sources: readonly [...ObservableInputTuple<T>],
  resultSelector: (...values: T) => R
): Observable<R>

// Pipeable variant (added RxJS 7)
combineLatestWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, Readonly<[T, ...A]>>
```

---

#### When to Use

- Derive a view-model that depends on multiple independent state streams (e.g. user preferences + filter query + pagination).
- Compute a value that is always "current filter × current data", re-running whenever either changes.
- Build an MVU selector that combines slices of a `BehaviorSubject`-held state with UI event streams.
- React to configuration changes: whenever either a settings stream or a data stream updates, re-render.
- Combine multiple async lookups that are independent of each other (prefer `forkJoin` if you only need the final result after all complete).

---

#### Code Example

```typescript
import { combineLatest, BehaviorSubject } from 'rxjs'
import { map, startWith, debounceTime } from 'rxjs/operators'

interface Musician { id: number; name: string; genre: string }
interface FilterState { query: string; genre: string }

// Two independent state streams
const musicians$ = new BehaviorSubject<Musician[]>([])
const filter$ = new BehaviorSubject<FilterState>({ query: '', genre: '' })

// Derived view-model: re-computed whenever musicians OR filter changes
const filteredMusicians$ = combineLatest([musicians$, filter$]).pipe(
	map(([musicians, filter]: [Musician[], FilterState]) =>
		musicians.filter(m =>
			m.name.toLowerCase().includes(filter.query.toLowerCase()) &&
			(filter.genre === '' || m.genre === filter.genre)
		)
	)
)

// In an MVU effect pipeline — sample both streams when a save action fires
import { Subject } from 'rxjs'
import { withLatestFrom, exhaustMap } from 'rxjs/operators'

const save$ = new Subject<void>()

// Note: for "sample on trigger", prefer withLatestFrom over combineLatest
const saveEffect$ = save$.pipe(
	withLatestFrom(combineLatest([musicians$, filter$])),
	exhaustMap(([_, [musicians, filter]]) =>
		saveToApi(musicians, filter)
	)
)
```

---

#### Gotchas

1. **Startup stall — no emission until all sources have emitted** — If one source is slow or never emits (e.g. an HTTP request that errors), the combined Observable produces nothing. Protect with `startWith(null)` or an initial value on optional streams.

2. **BehaviorSubject sources emit immediately** — Combining `BehaviorSubject` streams causes an immediate synchronous emission on subscription. This is usually desirable for state, but can surprise you if you expect a delay.

3. **RxJS 6 → 7 breaking change: no result selector** — In RxJS 6, `combineLatest` accepted a result selector function as its last argument. In RxJS 7 this was removed; use `.pipe(map(...))` instead.

4. **N sources × M rapid emissions = N×M output events** — If multiple sources emit synchronously in the same tick (common with `BehaviorSubject`s initialised in sequence), you get one combined emission per individual source emission. Use `debounceTime(0)` or `auditTime(0)` downstream to coalesce synchronous bursts.

5. **Never completes until ALL sources complete** — A long-lived stream (e.g. a `Subject` or `interval`) will keep the combined Observable alive even after other sources have completed. This can prevent garbage collection if you forget `takeUntil`.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `forkJoin` | Emits **once**, after **all** sources complete | One-shot parallel async calls (HTTP); you only need the final values |
| `zip` | Pairs emissions **positionally** (1st with 1st, 2nd with 2nd) | Strict turn-by-turn pairing; sources emit at the same logical rate |
| `withLatestFrom` | Samples other streams **only when the primary emits** | You have a clear "trigger" stream and want to read current state from others |
| `combineLatestWith` | Pipeable version of `combineLatest` (RxJS 7) | Same semantics; preferred inside an existing `pipe()` chain |
| `merge` | Emits each source value **independently**, no combining | You want a union of events, not a combined snapshot |

---

#### Decision Rule

> Use `combineLatest` when you need a **continuously updated snapshot** of several independent streams — any change to any input should re-derive the output. Prefer `withLatestFrom` instead when only one stream drives the logic and the others are read as current state.
