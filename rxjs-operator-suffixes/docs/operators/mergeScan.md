---
operator: mergeScan
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `mergeScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed: R, concurrent?: number)`

> Like `scan`, but the accumulator returns an Observable — each inner Observable is merged (subscribed to concurrently) and its emissions are forwarded as the running accumulated output.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — reacts to source values and inner emissions, not their timing |
| **Value-sensitive** | Yes — the accumulator inspects every source value to produce the next inner Observable |
| **Lossy** | No — all inner emissions are forwarded; all source values are processed |
| **Completion required** | No — emits on every inner emission as it arrives; works on infinite sources |

**Completion behaviour** — `mergeScan` subscribes to the inner Observable returned by the accumulator on every source emission, forwarding all inner emissions to the output. The last emission of each inner becomes the `acc` seed for the next accumulator call. The output does not complete until the source completes AND all active inner subscriptions have finished.

**Lossy behaviour** — not lossy. Every source value triggers an accumulator call, the resulting inner Observable is subscribed to (possibly in parallel, controlled by `concurrent`), and all inner emissions are forwarded.

---

#### Marble Diagram

```
source:      --a-----------b--------|
acc(seed,a): ---r1--r2|
acc(r2,b):              ---r3-r4|
             mergeScan(accumulator, seed)
output:      -----r1-r2------r3-r4--|
```

The last emission of each inner (`r2`, `r4`) becomes the `acc` argument for the next call.

---

#### Signature

```typescript
mergeScan<T, R>(
	accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
	seed: R,
	concurrent?: number
): OperatorFunction<T, R>
```

---

#### When to Use

- Accumulate state where each transition is an async operation (e.g. appending pages of data from an API as a user clicks "Load More").
- Implement optimistic updates where each dispatched action resolves to an Observable that produces the new state.
- Build a running aggregate where computing each step requires an HTTP call or other async side effect.
- Any scenario where `scan` would work but the reducer needs to be async.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { mergeScan, map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface Item {
	id: number
	title: string
}

// Pagination: each "Load More" click fetches the next page and appends to the accumulated list
let page = 0

const loadMore$ = fromEvent(document.getElementById('load-more')!, 'click')

const allItems$ = loadMore$.pipe(
	mergeScan(
		(acc: Item[], _event: Event) => {
			page++
			return ajax.getJSON<Item[]>(`/api/items?page=${page}`).pipe(
				map((newItems: Item[]) => [...acc, ...newItems])
			)
		},
		[] as Item[]
	)
)

allItems$.subscribe((items: Item[]) => {
	renderList(items)
})
```

Sequential async accumulation (use `concurrent: 1` for scan-like ordering):

```typescript
import { Subject } from 'rxjs'
import { mergeScan } from 'rxjs/operators'

interface AppState {
	count: number
}

const action$ = new Subject<string>()

// Each action triggers an async state transition; serialised with concurrent: 1
const state$ = action$.pipe(
	mergeScan(
		(state: AppState, action: string) => applyActionAsync$(state, action),
		{ count: 0 },
		1  // sequential — equivalent to concatScan (which doesn't exist in RxJS)
	)
)
```

---

#### Gotchas

1. **The `acc` passed to the next call is the *last* emission of the inner Observable** — intermediate emissions from the inner are forwarded to output subscribers but only the final emission is threaded as the new accumulator value. If the inner completes without emitting, `acc` is unchanged.

2. **`concurrent` default is `Infinity`** — multiple inner Observables may run in parallel. If accumulator calls must be sequential to avoid race conditions on shared state, set `concurrent: 1`.

3. **Seed type must match accumulator return type** — the seed and the type returned by the accumulator must both be `R`. TypeScript will catch mismatches but be explicit with the generic if inference fails.

4. **Prefer `scan` for synchronous transitions** — `mergeScan` adds complexity. If the accumulator does not need to be async, use `scan` for clarity.

5. **No `concatScan` in RxJS** — the pattern `mergeScan(fn, seed, 1)` is the idiomatic way to get sequential async accumulation. Document this with a comment, as it is non-obvious.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `scan` | Accumulator returns a plain value (synchronous) | State transitions are synchronous |
| `mergeMap` | Projects to inner Observable but does not thread accumulated state | You do not need to carry state between steps |
| `expand` | Recursively projects each emission to an Observable | You need recursive or tree-structured expansion |
| `reduce` | Like `scan` but emits only the final accumulated value | You need only the end result, not intermediate states |

---

#### Decision Rule

> Use `mergeScan` when you need **`scan`-like accumulated state but each transition is async** (returns an Observable). For synchronous state use `scan`. For sequential async accumulation, use `mergeScan(fn, seed, 1)`.
