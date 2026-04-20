---
operator: switchScan
family: Transformation
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `switchScan<T, R>(accumulator: (acc: R, value: T, index: number) => ObservableInput<R>, seed: R)`

> Like `scan`, but the accumulator returns an Observable — when a new source value arrives, the previous inner Observable is cancelled and a new one is subscribed, threading the last accumulated value as the seed for each subsequent call.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — switching is driven by new source values, not by timing |
| **Value-sensitive** | Yes — the accumulator inspects each source value to produce the next inner Observable |
| **Lossy** | Yes — any remaining emissions from the cancelled previous inner are discarded when a new source value arrives |
| **Completion required** | No — emits on every inner emission as it arrives; works on infinite sources |

**Completion behaviour** — `switchScan` subscribes to the inner Observable returned by the accumulator for each source value. If a new source value arrives before the current inner completes, the current inner is immediately unsubscribed and a new one is started with the last emitted accumulated value as `acc`. The output does not complete until the source completes AND the last active inner completes.

**Lossy behaviour** — lossy with respect to inner emissions from cancelled inners. When a new source value arrives, the previous inner is cancelled and any values it would have emitted are lost. However, the last *emitted* value from the cancelled inner is retained as the new `acc` seed.

---

#### Marble Diagram

```
source:      --a-----------b--------|
acc(seed,a): ---r1--r2--r3...
acc(r1,b):               ---r4-r5--|
             switchScan(accumulator, seed)
output:      ----r1-r2----r4-r5-----|
```

When `b` arrives, the inner started by `a` is cancelled — `r3` and any subsequent values are lost.
The `acc` passed for `b` is `r1` — the **last emitted** value from the cancelled inner, not the last *potential* value.

---

#### Signature

```typescript
switchScan<T, R>(
	accumulator: (acc: R, value: T, index: number) => ObservableInput<R>,
	seed: R
): OperatorFunction<T, R>
```

Added in RxJS 7.

---

#### When to Use

- Implement live search with accumulated context — e.g. a search that carries the previous result set as the basis for the next query.
- Build autocomplete where each new keystroke cancels the previous suggestion fetch and starts fresh with the current accumulated state.
- Manage transient async state that should restart when a new trigger arrives, carrying forward the last stable value as the starting point.
- Any scenario combining `switchMap` (cancel on new) with `scan` (thread accumulated state).

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { switchScan, map, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface SearchState {
	term: string
	results: string[]
	previousResults: string[]
}

const input = document.getElementById('search') as HTMLInputElement

// Search typeahead that carries the previous results as context while loading new ones
const search$ = fromEvent<Event>(input, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
	switchScan(
		(acc: SearchState, term: string) =>
			ajax.getJSON<string[]>(`/api/search?q=${encodeURIComponent(term)}`).pipe(
				map((results: string[]): SearchState => ({
					term,
					results,
					previousResults: acc.results
				}))
			),
		{ term: '', results: [], previousResults: [] }
	)
)

search$.subscribe((state: SearchState) => renderSearch(state))
```

---

#### Gotchas

1. **The `acc` on cancellation is the last *emitted* value, not the last potential value** — if the cancelled inner emitted `r1` then `r2` before being cancelled, `acc` for the next call is `r2`. If the inner was cancelled before emitting anything, `acc` remains unchanged from the previous call.

2. **Added in RxJS 7** — `switchScan` does not exist in RxJS 6. In RxJS 6, the equivalent pattern is `switchMap` combined with an external `BehaviorSubject` or `scan` feeding state into the projection.

3. **`mergeScan` vs `switchScan`** — `mergeScan` keeps all inner Observables running concurrently; `switchScan` cancels the previous inner when a new source value arrives. Use `switchScan` when only the latest async state transition matters.

4. **Prefer `scan` for synchronous transitions** — if the accumulator does not need to be async, `scan` is simpler and has no lossiness risk.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `scan` | Accumulator returns a plain value (synchronous) | State transitions are synchronous |
| `mergeScan` | All inner Observables run concurrently; no cancellation | All async transitions must complete; order does not matter |
| `switchMap` | Switches on new source values but does not thread accumulated state | You do not need to carry state between steps |
| `expand` | Recursively projects each emission to an Observable | You need recursive or tree-structured expansion |

---

#### Decision Rule

> Use `switchScan` when you need **`scan`-like accumulated state** where each async transition **cancels the previous** when a new source value arrives. Use `mergeScan` when all transitions must complete, and plain `scan` when transitions are synchronous.
