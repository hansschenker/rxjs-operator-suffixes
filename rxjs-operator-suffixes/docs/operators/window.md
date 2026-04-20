---
operator: window
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `window<T>(windowBoundaries: ObservableInput<unknown>)`

> Emits a new **inner Observable** each time a boundary notifier fires — the streaming counterpart of `buffer`, where each window is a live Observable you can compose with operators rather than a static array.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but the boundary notifier is often time-based |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values are forwarded through exactly one inner window Observable |
| **Completion required** | No — emits a new inner Observable on each boundary; works correctly on infinite sources |

**Completion behaviour** — `window` opens the first inner Observable immediately on subscription. Each time the boundary notifier emits, the current inner Observable completes and a new one is emitted. When the source completes, the current inner Observable completes and the outer Observable completes. If the source never completes, `window` runs indefinitely, emitting a new inner Observable on each boundary tick.

**Lossy behaviour** — not lossy. Every source value is forwarded to exactly one inner window Observable. No values are dropped.

---

#### Marble Diagram

```
source:   --a--b--c--d--e--f--|
boundary: ------x--------x---|
          window(boundary)
output:   w1----w2-----------w3--|
          w1:   --a--b
          w2:         --c--d--e
          w3:                  --f--|
```

---

#### Signature

```typescript
window<T>(
	windowBoundaries: ObservableInput<unknown>
): OperatorFunction<T, Observable<T>>
```

The outer Observable emits `Observable<T>` values (inner windows). Each inner Observable emits `T` values.

---

#### When to Use

- Apply operators to each window's stream independently while values are still arriving (e.g. `take(3)` on each window, or `reduce` on each window).
- Implement rate-limiting with per-window logic — e.g. only the first N events per time window.
- Compute rolling statistics (sum, average, max) over successive windows without collecting all values into an array first.
- Use `window` over `buffer` when the per-window operation can be expressed as an operator pipeline (streaming); use `buffer` when you need the complete array.

---

#### Code Example

```typescript
import { fromEvent, interval } from 'rxjs'
import { window, mergeAll, take, map, toArray } from 'rxjs/operators'

interface ClickEvent {
	x: number
	y: number
}

// Count clicks per second
const click$ = fromEvent<MouseEvent>(document, 'click').pipe(
	map((e: MouseEvent): ClickEvent => ({ x: e.clientX, y: e.clientY }))
)

const clicksPerSecond$ = click$.pipe(
	window(interval(1000)),
	mergeMap((win$: Observable<ClickEvent>) => win$.pipe(
		toArray(),
		map((clicks: ClickEvent[]) => clicks.length)
	))
)

clicksPerSecond$.subscribe((count: number) =>
	console.log(`Clicks this second: ${count}`)
)
```

Rate-limit per window — only forward the first 3 events per 500 ms window:

```typescript
import { fromEvent, interval } from 'rxjs'
import { window, mergeAll, take } from 'rxjs/operators'

// Allow at most 3 button presses per 500 ms
const press$ = fromEvent(button, 'click').pipe(
	window(interval(500)),
	mergeMap((win$: Observable<Event>) => win$.pipe(take(3)))
)

press$.subscribe(() => handleButtonPress())
```

---

#### Gotchas

1. **`window` vs `buffer`** — `buffer` collects all window values into an array and emits once when the window closes; `window` emits a live inner Observable immediately when the window opens. Use `window` when you need to apply operators like `take`, `filter`, `reduce`, or `toArray` to each window as a stream; use `buffer` for simpler array-based processing.

2. **Must subscribe to (or compose) each inner Observable** — unlike `buffer`, `window` emits Observables. If you ignore the inner Observables without subscribing or flattening, their values are lost. Always use `mergeMap`, `switchMap`, `concatMap`, or `exhaustMap` on the outer Observable to process each window.

3. **Inner Observable completes when the window closes** — each window Observable terminates when the next boundary arrives. Operators that require completion (e.g. `toArray`, `reduce`, `last`) work naturally on window Observables because they complete on schedule.

4. **`mergeMap` vs `concatMap` for window processing** — `mergeMap` processes all windows concurrently (usually correct since each window is a fixed time slice); `concatMap` queues windows, which can cause backpressure if a window operator takes longer than the window duration.

5. **Boundary Observable must outlive the source** — if the boundary Observable completes before the source, no further windowing occurs and all remaining source values flow into the last (never-closing) window. Ensure the boundary Observable has a lifetime equal to or longer than the source.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `buffer` | Emits complete arrays instead of inner Observables | You need the complete array; no streaming per-window operators |
| `windowCount` | Count-based window boundaries | Windows close after N values |
| `windowTime` | Fixed-time window boundaries | Windows close after a fixed interval |
| `windowToggle` | Separate open/close notifiers; overlapping windows | Windows overlap or the opening is event-driven |
| `windowWhen` | Closing factory called per window | Each window has a different or stateful closing condition |
| `groupBy` | Groups by key, not by time/count | Partitioning a stream by value attribute |

---

#### Decision Rule

> Use `window` when you need to **apply operator pipelines to each time/event window as a live stream**. Use `buffer` when you only need the final collected array from each window.
