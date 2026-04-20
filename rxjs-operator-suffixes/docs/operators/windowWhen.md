---
operator: windowWhen
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `windowWhen<T>(closingSelector: () => ObservableInput<unknown>)`

> Emits a new **inner Observable** window immediately on subscription and after each previous window closes — where the closing condition is provided by a fresh Observable from `closingSelector` each time, the streaming counterpart of `bufferWhen`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but `closingSelector` typically returns a time-based Observable |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values are forwarded through exactly one window Observable; none are discarded |
| **Completion required** | No — emits windows on each close event; works correctly on infinite sources |

**Completion behaviour** — `windowWhen` opens the first inner Observable immediately on subscription and calls `closingSelector()` to get the closing Observable. When the closing Observable emits (first emission only), the current inner Observable completes, a new one is emitted by the outer Observable, and `closingSelector()` is called again. Windows are strictly sequential (non-overlapping). When the source completes, the current inner Observable completes.

**Lossy behaviour** — not lossy. Every source value is forwarded to exactly one inner Observable. No values are dropped.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--f--g--|
         windowWhen(() => timer(30))
         (each closing Observable fires after 30ms)
output:  w1----w2----w3----------w4|
         w1: --a--b|
         w2:        --c--d|
         w3:               --e--f|
         w4:                      --g--|
```

Adaptive windows — short if last window was large, long if small:
```
windowWhen(() => timer(condition ? 500 : 100))
→ window durations vary per window
```

---

#### Signature

```typescript
windowWhen<T>(
	closingSelector: () => ObservableInput<unknown>
): OperatorFunction<T, Observable<T>>
```

Note: unlike `windowToggle`, there is no opening signal — windows open immediately after the previous closes. `closingSelector` takes no arguments.

---

#### When to Use

- Apply operator pipelines to adaptive time windows where the window duration changes after each close (e.g. back-off strategy).
- Stream values to per-window processing operators when the closing condition is stateful or one-shot (a `Subject` or a one-time timer).
- Replace `window(notifier$)` when the closing Observable is finite (completes after first emission) and must be recreated per window.
- Build adaptive batching pipelines where each window's duration is informed by external metrics.

---

#### Code Example

```typescript
import { Subject, interval } from 'rxjs'
import { windowWhen, mergeMap, toArray, map, tap } from 'rxjs/operators'
import { timer } from 'rxjs'

interface Event {
	id: number
	type: string
}

const events$ = interval(50).pipe(
	map((i: number): Event => ({ id: i, type: i % 3 === 0 ? 'heavy' : 'light' }))
)

let lastWindowSize = 0

// Adaptive window — longer gap after large windows (back-off)
const windowed$ = events$.pipe(
	windowWhen(() => {
		const wait = lastWindowSize > 10 ? 1000 : 300
		return timer(wait)
	}),
	mergeMap((win$: Observable<Event>) =>
		win$.pipe(
			toArray(),
			tap((batch: Event[]) => { lastWindowSize = batch.length })
		)
	)
)

windowed$.subscribe((batch: Event[]) =>
	console.log(`Window closed: ${batch.length} events`)
)
```

Per-window stream processing:

```typescript
import { fromEvent, interval } from 'rxjs'
import { windowWhen, mergeMap, filter, count } from 'rxjs/operators'
import { timer } from 'rxjs'

// Count error events per 5-second window
const log$ = fromEvent<CustomEvent>(logger, 'entry')

const errorsPerWindow$ = log$.pipe(
	windowWhen(() => timer(5000)),
	mergeMap((win$: Observable<CustomEvent>) =>
		win$.pipe(
			filter((e: CustomEvent) => e.detail.level === 'error'),
			count()
		)
	)
)

errorsPerWindow$.subscribe((n: number) =>
	console.log(`Errors in last 5s: ${n}`)
)
```

---

#### Gotchas

1. **`windowWhen` vs `window`** — `window(notifier$)` subscribes to the notifier once and reuses it across all windows; `windowWhen(() => ...)` calls the factory fresh for each new window. Use `windowWhen` when the closing Observable is stateful, finite, or must vary between windows.

2. **`windowWhen` vs `bufferWhen`** — same semantics; `bufferWhen` emits complete arrays, `windowWhen` emits inner Observables. Use `windowWhen` when you need operator-composable streaming access.

3. **Must subscribe to or flatten inner Observables** — like all window operators, unsubscribed inner Observables lose their values. Always use a flattening operator (typically `mergeMap`) downstream.

4. **`mergeMap` is almost always correct here** — windows are sequential (non-overlapping), so `mergeMap` and `concatMap` behave identically in practice. `mergeMap` is conventional.

5. **Only the first emission of the closing Observable closes the window** — subsequent emissions from the same closing Observable instance are ignored. This is rarely a problem in practice since `timer(n)` emits once and completes.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferWhen` | Emits complete arrays | You need the final array, not streaming access |
| `window` | Reuses same boundary notifier; sequential | The closing condition is stateless and reusable |
| `windowCount` | Count-based boundaries | Windows close after N values |
| `windowTime` | Fixed-time boundaries built in | Fixed-interval windows |
| `windowToggle` | Separate open/close notifiers; overlapping windows | Windows overlap or opening is event-driven |

---

#### Decision Rule

> Use `windowWhen` when the **closing Observable must be recreated fresh for each window** — for adaptive, stateful, or one-shot boundaries. Use `window(notifier$)` when the same stateless notifier can be reused across all windows. Use `bufferWhen` when you only need the array, not streaming operator access.
