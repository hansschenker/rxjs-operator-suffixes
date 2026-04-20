---
operator: windowToggle
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `windowToggle<T, O>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<unknown>)`

> Opens a new **inner Observable** window each time the `openings` notifier emits and closes it when the Observable returned by `closingSelector` emits — the streaming counterpart of `bufferToggle`, supporting overlapping windows.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but notifiers are typically time-based |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values that arrive during an open window are forwarded; values outside all windows are discarded by design |
| **Completion required** | No — emits windows as they open; works correctly on infinite sources |

**Completion behaviour** — `windowToggle` subscribes to the `openings` Observable. Each time it emits, a new inner Observable is emitted by the outer Observable and `closingSelector` is called with the opening value to get the closing Observable. When the closing Observable emits, the corresponding inner Observable completes. Multiple windows can be open simultaneously. When the source completes, all open inner Observables complete.

**Lossy behaviour** — not lossy within open windows. Values that arrive when no window is open are permanently discarded — this is the intended contract.

---

#### Marble Diagram

```
source:   --a--b--c--d--e--f--g--|
openings: --x-----------y--------|
closing:  x → timer(30), y → timer(20)
          windowToggle(openings, () => timer(30))
output:   w1----------w2---------|
          w1: --a--b--c|          (opened at x, closed 30ms later)
          w2:           --e--f|   (opened at y, closed 20ms later)
          (d falls outside both windows — discarded)
```

Overlapping windows:
```
source:   --a--b--c--d--e--|
openings: --x--y-----------|
closing:  x → timer(40), y → timer(20)
output:   w1-w2------------|
          w1: --a--b--c--d|
          w2:    --b--c|
```

---

#### Signature

```typescript
windowToggle<T, O>(
	openings: ObservableInput<O>,
	closingSelector: (value: O) => ObservableInput<unknown>
): OperatorFunction<T, Observable<T>>
```

---

#### When to Use

- Stream events to multiple independent pipelines simultaneously during specific UI phases (e.g. forward mouse events to two different handlers with different lifetimes).
- Capture overlapping slices of a data stream where each window performs a different aggregation.
- Record interactions only during a "recording active" state that can be toggled, where each recording session can have a different duration.
- Build time-overlapping analytics windows — e.g. sliding 10-minute windows that open every minute.

---

#### Code Example

```typescript
import { fromEvent, interval } from 'rxjs'
import { windowToggle, mergeMap, toArray, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface MousePosition {
	x: number
	y: number
}

// Record mouse path only while mouse button is held
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
	map((e: MouseEvent): MousePosition => ({ x: e.clientX, y: e.clientY }))
)

const mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown')
const mouseUp$   = fromEvent<MouseEvent>(document, 'mouseup')

const paths$ = mouseMove$.pipe(
	windowToggle(mouseDown$, () => mouseUp$),
	mergeMap((win$: Observable<MousePosition>) => win$.pipe(toArray()))
)

paths$.subscribe((path: MousePosition[]) => {
	console.log(`Path captured: ${path.length} points`)
	renderPath(path)
})
```

Overlapping analytics windows:

```typescript
import { interval } from 'rxjs'
import { windowToggle, mergeMap, reduce, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface SensorReading {
	value: number
	timestamp: number
}

// Open a 60-second analytics window every 10 seconds (overlapping)
const sensor$ = interval(100).pipe(
	map((i: number): SensorReading => ({ value: Math.random() * 100, timestamp: Date.now() + i * 100 }))
)

const windowOpen$ = interval(10_000) // open a new window every 10s
type OpenValue = number

const analytics$ = sensor$.pipe(
	windowToggle(windowOpen$, (_: OpenValue) => timer(60_000)),
	mergeMap((win$: Observable<SensorReading>) =>
		win$.pipe(
			reduce((acc: { sum: number; count: number }, r: SensorReading) =>
				({ sum: acc.sum + r.value, count: acc.count + 1 }),
				{ sum: 0, count: 0 }
			),
			map((r: { sum: number; count: number }) => r.sum / r.count)
		)
	)
)

analytics$.subscribe((avg: number) => console.log(`60s window avg: ${avg.toFixed(2)}`))
```

---

#### Gotchas

1. **Values outside open windows are discarded** — unlike `window` (which forwards all values), `windowToggle` only forwards values while a window is explicitly open. This is intentional — use `window` if you need all values.

2. **`windowToggle` vs `bufferToggle`** — both have identical open/close semantics; `bufferToggle` emits complete arrays, `windowToggle` emits inner Observables. Use `windowToggle` when you need operator-composable streaming access to each window.

3. **`mergeMap` is almost always correct for window processing** — since multiple windows can be open simultaneously, `concatMap` would queue them sequentially, which can cause growing backpressure. `mergeMap` processes all windows concurrently.

4. **`closingSelector` receives the opening value** — use this to vary the window duration based on what triggered the opening (e.g. different durations for different event types).

5. **Must subscribe to or flatten each inner Observable** — like all window operators, unflattened inner Observables lose their values. Always use a flattening operator downstream.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferToggle` | Emits complete arrays | You need the final array, not streaming access |
| `window` | Single boundary notifier; sequential non-overlapping windows | All values collected; simple event-driven boundaries |
| `windowWhen` | Closing factory, no separate opening; sequential windows | Sequential adaptive windows |
| `windowCount` | Count-based boundaries | Windows close after N values |
| `windowTime` | Fixed-time boundaries | Windows close after a fixed interval |

---

#### Decision Rule

> Use `windowToggle` when windows need **explicit independent open and close signals**, especially for **overlapping windows** or when window duration depends on what triggered the opening. Use `window` for simpler sequential event-driven windows.
