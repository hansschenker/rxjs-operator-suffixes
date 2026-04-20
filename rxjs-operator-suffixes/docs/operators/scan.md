---
operator: scan
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-24
---

### `scan<T, R>(accumulator: (acc: R, value: T, index: number) => R, seed?: R)`

> Applies a reducer function to each source value and emits every intermediate accumulated result — the streaming equivalent of `Array.reduce`, but it emits after every step rather than waiting for the end.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — reacts to values arriving, not when they arrive |
| **Value-sensitive** | Yes — the accumulator inspects every value to compute the next state |
| **Lossy** | No — every source value is processed and an accumulated result is emitted for each one |
| **Completion required** | No — emits on every source value; works correctly on infinite streams |

**Completion behaviour** — `scan` emits a new accumulated value synchronously after every source emission. It does not buffer or wait. If the source never completes (e.g. `Subject`, `interval()`), `scan` keeps emitting indefinitely — this is the normal, intended use. On source completion, `scan` completes too without any final extra emission.

**Lossy behaviour** — `scan` is non-lossy. Every value emitted by the source triggers exactly one emission from `scan`. No values are dropped, delayed, or combined silently.

---

#### Marble Diagram

```
source:  --1--2--3--4--|
         scan((acc, v) => acc + v, 0)
output:  --1--3--6--10-|

source:  --a--b--c--|
         scan((acc, v) => [...acc, v], [])
output:  --[a]--[a,b]--[a,b,c]--|
```

---

#### Signature

```typescript
// Overload 1 — seed provided, accumulator and output types can differ
scan<V, A>(accumulator: (acc: A, value: V, index: number) => A, seed: A): OperatorFunction<V, A>

// Overload 2 — no seed, accumulator and value type must match
scan<V>(accumulator: (acc: V, value: V, index: number) => V): OperatorFunction<V, V>

// Overload 3 — seed typed separately (type widening)
scan<V, A, S>(accumulator: (acc: A | S, value: V, index: number) => A, seed: S): OperatorFunction<V, A>
```

Use overload 1 in practice — always provide an explicit seed. Overload 2 is a footgun: the first emission is used as the seed, skipping the accumulator on that value.

---

#### When to Use

- Build a running total, counter, or score that updates in real time as events arrive
- Implement an MVU reducer: fold a stream of `Action` values into a stream of `State` snapshots
- Accumulate items into a growing list (e.g. append incoming WebSocket messages to a log)
- Undo/redo — store each state snapshot in an accumulated history array
- Compute a rolling average, min, or max without waiting for source completion
- Track how many times an event has fired (e.g. retry count, click count)

---

#### Code Example

```typescript
import { Subject } from 'rxjs'
import { scan, startWith, distinctUntilChanged, shareReplay } from 'rxjs/operators'

// --- MVU pattern: Action → State via scan + reducer ---

interface Musician {
	id: string
	name: string
}

type Action =
	| { type: 'ADD'; payload: Musician }
	| { type: 'REMOVE'; payload: { id: string } }
	| { type: 'RESET' }

interface State {
	musicians: Musician[]
	count: number
}

const initialState: State = { musicians: [], count: 0 }

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'ADD':
			return {
				musicians: [...state.musicians, action.payload],
				count: state.count + 1,
			}
		case 'REMOVE':
			return {
				musicians: state.musicians.filter(m => m.id !== action.payload.id),
				count: state.count - 1,
			}
		case 'RESET':
			return initialState
	}
}

const action$ = new Subject<Action>()

// scan replaces NgRx Store: pure reducer, emits every intermediate state
const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	distinctUntilChanged(),
	shareReplay(1),
)

// Derived state — no extra store selectors needed
const count$ = state$.pipe(
	scan((acc, state) => state.count, 0),
	distinctUntilChanged(),
)

// Dispatch
action$.next({ type: 'ADD', payload: { id: '1', name: 'Miles Davis' } })
action$.next({ type: 'ADD', payload: { id: '2', name: 'John Coltrane' } })
action$.next({ type: 'REMOVE', payload: { id: '1' } })
```

---

#### Gotchas

1. **No seed = first value is silently used as seed** — Without a seed, `scan` passes the first source value directly to the output and starts accumulating from the second. This means the accumulator runs `n-1` times for `n` values. Always provide an explicit seed to avoid off-by-one bugs and type errors.

2. **Accumulator must be pure** — `scan` is called once per emission. If the accumulator mutates the `acc` object (e.g. `acc.items.push(v)`) instead of returning a new reference, `distinctUntilChanged()` downstream will never detect changes, and change-detection in frameworks will miss updates. Always return a new object: `{ ...acc, items: [...acc.items, v] }`.

3. **State persists across retry/repeat** — If the source errors and you use `retry()`, `scan` resubscribes but the internal accumulated value resets to the seed. This is correct but surprising if you expect state to survive an error boundary — in that case, hold state externally in a `BehaviorSubject`.

4. **`scan` vs `reduce` confusion** — `reduce` emits only once on source completion; `scan` emits on every value. Using `reduce` on an infinite stream produces nothing. Using `scan` where you only need the final total is wasteful but not incorrect.

5. **Index parameter is zero-based from the first emission** — The third accumulator argument `index` starts at `0` for the first value after the seed, not after it. If you use index to gate logic (e.g. `if (index === 0) doSetup()`), verify whether you mean "first value" or "second value".

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `reduce(acc, seed)` | Emits only the **final** accumulated value on source completion | You need one summary value from a finite stream (total, max, joined string) |
| `mergeScan(fn, seed)` | Accumulator returns an **Observable** instead of a plain value — inner Observables are merged | Each reduction step requires async work (e.g. HTTP call per action) |
| `expand(fn)` | Recursively projects each emission into an Observable, subscribing to each result | Tree traversal, recursive async expansion |
| `pairwise()` | Emits `[previous, current]` — a fixed two-element accumulation | You only need to compare consecutive values, not a running aggregate |

---

#### Decision Rule

> Use `scan` when you need a **running accumulated state that updates on every emission** — particularly as the core of an MVU reducer. Prefer `reduce` instead when the source is finite and you only care about the **single final result**.

---

#### MVU Note

`scan` is the single most important operator in an Elm-like MVU architecture. The entire state layer collapses to:

```typescript
const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1),
)
```

`action$` is the message bus, `reducer` is pure, and `state$` is a derived stream. No store library needed. `shareReplay(1)` ensures late subscribers (e.g. a component mounting after the first action) receive the current state immediately.
