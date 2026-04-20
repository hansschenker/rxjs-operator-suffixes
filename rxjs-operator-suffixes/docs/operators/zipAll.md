---
operator: zipAll
family: Combination
lossy: false
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `zipAll<T>(project?: (...values: T[]) => R)`

> Collects all inner Observables emitted by the source (a higher-order Observable), waits for the **outer source to complete**, then zips all the inner Observables together positionally — emitting a tuple of their nth emissions for each position.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — pairing is positional, not temporal |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — every nth emission from every inner is paired and emitted |
| **Completion required** | Yes — the outer source **must complete** before `zipAll` subscribes to any of the collected inner Observables |

**Completion behaviour** — `zipAll` buffers all inner Observables emitted by the outer source without subscribing to them yet. Only when the outer source completes does `zipAll` subscribe to all collected inners simultaneously and begin zipping their emissions positionally. If the outer source never completes, `zipAll` never subscribes to any inner and never emits.

**Lossy behaviour** — not lossy during operation: every nth emission from every inner is used exactly once. Surplus values from longer inners are discarded when the shortest inner completes, exactly as with `zip`.

---

#### Marble Diagram

```
outer:    --[a$]--[b$]--|   (must complete)
inner a$:  1--2--3|
inner b$:  10-20-30|
           zipAll()
           (subscribes to a$ and b$ simultaneously after outer completes)
output:   -[1,10]-[2,20]-[3,30]-|
```

If outer never completes:
```
outer:    --[a$]--[b$]---...  (never completes)
           zipAll()
output:   (never emits)
```

---

#### Signature

```typescript
zipAll<T>(): OperatorFunction<ObservableInput<T>, T[]>
zipAll<T, R>(project: (...values: T[]) => R): OperatorFunction<ObservableInput<T>, R>
```

---

#### When to Use

- Zip a dynamically determined set of Observables when you do not know the count ahead of time.
- Combine a variable-length array of parallel streams positionally after all streams are known.
- Use when the number of inner Observables is determined at runtime (e.g. from an API response) and positional pairing is required.

---

#### Code Example

```typescript
import { of, interval } from 'rxjs'
import { map, zipAll, take } from 'rxjs/operators'

// Dynamically create N timer streams and zip them positionally
const streams$ = of(1, 2, 3).pipe(
	map((multiplier: number) =>
		interval(multiplier * 100).pipe(
			take(3),
			map((i: number) => i * multiplier)
		)
	)
)

// zipAll waits for of(1,2,3) to complete, then zips the 3 interval streams
const zipped$ = streams$.pipe(zipAll())

zipped$.subscribe((tuple: number[]) => {
	console.log(tuple)
})
// [0, 0, 0]
// [1, 2, 3]
// [2, 4, 6]
```

---

#### Gotchas

1. **Outer source must complete first** — this is the critical constraint that distinguishes `zipAll` from `zip`. If the outer source never completes (e.g. a `Subject` or `interval`), `zipAll` collects inner Observables indefinitely but never subscribes to any of them and never emits. This is the most common source of `zipAll` bugs.

2. **All inners are subscribed simultaneously** — `zipAll` subscribes to all collected inners at the moment the outer completes. Any emissions from inners that occurred before the outer completed are missed, since the inners were not subscribed to yet. Ensure inner Observables are cold (replay their emissions from the start on each subscription) or delay their data until after the outer completes.

3. **Rarely the right tool** — in most cases where the count of sources is known, use `zip(...sources)` directly. `zipAll` is for scenarios where the inner Observables are themselves emitted by a dynamic source.

4. **Memory usage** — inner Observables are collected (not subscribed to) until the outer completes. If the outer emits many inners slowly, they accumulate in memory before any processing begins.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `zip` (static) | Zips a statically known set of sources | You know the sources at compile time |
| `combineLatestAll` | Higher-order combineLatest — also requires outer completion; emits on every inner emission using latest values | You want reactive combination instead of strict positional pairing |
| `mergeAll` | Subscribes to all inners concurrently as they arrive; no positional pairing | You want a flat stream, not tuples |
| `forkJoin` (via `toArray` + `mergeMap`) | Waits for all sources to complete and emits final values | You need the last value from each inner, not step-by-step pairing |

---

#### Decision Rule

> Use `zipAll` when you have a **dynamic higher-order Observable** and need **positional pairing** of all its inner Observables — and the outer source will definitely complete. Prefer static `zip` when the sources are known at compile time.
