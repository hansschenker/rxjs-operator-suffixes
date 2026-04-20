---
operator: merge
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `merge<T>(...observables: ObservableInput<T>[], concurrent?: number)`

> Subscribes to multiple Observables simultaneously and emits all their values in arrival order — a flat union of streams.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — does not react to *when* values arrive relative to each other; all values pass through immediately |
| **Value-sensitive** | No — does not inspect value content; all values are forwarded unconditionally |
| **Lossy** | No — every value from every source is forwarded to the output |
| **Completion required** | No — emits as each source emits; the output completes only when *all* source Observables complete |

**Completion behaviour** — `merge` emits on every source emission from any subscribed Observable. The output completes only when every input source has completed; if any one source never completes, the output never completes either. The optional `concurrent` parameter limits how many sources are subscribed at once — additional sources are queued and subscribed as active ones complete.

**Lossy behaviour** — `merge` is not lossy. Every value emitted by any source Observable is immediately forwarded to the output in the order it arrives. No values are dropped, buffered, or withheld.

---

#### Marble Diagram

```
source1: --a-----c-----e--|
source2: ----b--------d---|
         merge()
output:  --a-b---c----de--|
```

With `concurrent: 1` (serialised):
```
source1: --a--b--|
source2: --------c--d--|
         merge(source1$, source2$, 1)
output:  --a--b--c--d--|
```

---

#### Signature

```typescript
// Static creation function
merge<T>(...observables: ObservableInput<T>[]): Observable<T>
merge<T>(...observables: [...ObservableInput<T>[], number]): Observable<T>
// The trailing number is the optional `concurrent` parameter
```

---

#### When to Use

- Combine multiple event streams (button clicks, keyboard events, WebSocket messages) into a single stream to handle uniformly.
- Fan-in multiple independently running effect pipelines into a single `actions$` stream in an MVU architecture.
- Subscribe to several data sources concurrently and process their emissions as they arrive.
- Stream results from multiple API requests in parallel and process each as it completes.

---

#### Code Example

```typescript
import { merge, fromEvent, Subject } from 'rxjs'
import { map } from 'rxjs/operators'

interface Action {
	type: string
	payload?: unknown
}

// Fan-in multiple action sources into one actions$ stream
const buttonClick$ = fromEvent<MouseEvent>(document.getElementById('btn')!, 'click').pipe(
	map((): Action => ({ type: 'BUTTON_CLICKED' }))
)

const keyPress$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
	map((e: KeyboardEvent): Action => ({ type: 'KEY_PRESSED', payload: e.key }))
)

const wsMessage$ = new Subject<Action>()

const actions$ = merge(buttonClick$, keyPress$, wsMessage$)

actions$.subscribe((action: Action) => {
	console.log('Action dispatched:', action)
})
```

**MVU context** — `merge` is the canonical way to fan multiple action sources into a single `actions$` stream:

```typescript
import { merge } from 'rxjs'
import { scan, startWith, shareReplay } from 'rxjs/operators'

const actions$ = merge(
	uiActions$,
	timerActions$,
	effectOutputActions$
)

const state$ = actions$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay(1)
)
```

---

#### Gotchas

1. **`merge` vs `concat`** — `merge` subscribes to all sources immediately (concurrent). `concat` subscribes to them one at a time, waiting for each to complete. Using `merge` when ordering matters (e.g. init → fetch) will produce interleaved results.

2. **Output completes only when all sources complete** — if you merge a finite Observable with an infinite one (e.g. `interval()`), the merged output never completes. This is correct behaviour but surprises people who expect early completion.

3. **`concurrent` parameter position** — the optional `concurrent` number must be the last argument: `merge(a$, b$, c$, 2)`. Passing it as a named option is not supported.

4. **`merge` is a static function, not a pipeable operator** — use `mergeWith` for the pipeable equivalent inside a `pipe()` chain.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `concat` | Serialises sources — subscribes to the next only when the previous completes | Order matters (e.g. init sequence) |
| `mergeWith` | Pipeable instance version of `merge` | You need to merge inside a `pipe()` chain |
| `combineLatest` | Waits for all sources to emit at least once, then emits combined latest values | You need the current value from each source together |
| `race` | Emits only from whichever source emits first, ignores the rest | You want the fastest response from multiple candidates |

---

#### Decision Rule

> Use `merge` when you need a flat union of multiple streams and **order between sources does not matter**. Prefer `concat` when sources must be subscribed in sequence.
