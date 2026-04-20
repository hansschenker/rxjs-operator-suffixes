---
operator: bufferToggle
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `bufferToggle<T, O>(openings: ObservableInput<O>, closingSelector: (value: O) => ObservableInput<unknown>)`

> Collects source values between explicit **open** and **close** signals — producing potentially overlapping buffers whose start and end are independently controlled.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but notifiers are often time-based |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values that arrive during an open window are collected; values outside any open window are discarded by design |
| **Completion required** | No — emits each time a window closes; works correctly on infinite sources |

**Completion behaviour** — `bufferToggle` opens a new buffer each time the `openings` Observable emits. For each opening value, the `closingSelector` function is called to produce a closing Observable; when that closes, the accumulated buffer is emitted and the window is discarded. Multiple windows can be open simultaneously (overlapping). When the source completes, any open windows emit their accumulated values before the completion signal.

**Lossy behaviour** — not lossy within open windows. Values that arrive when no window is open are permanently discarded — this is intentional and part of the operator's contract.

---

#### Marble Diagram

```
source:   --a--b--c--d--e--f--g--|
openings: --x-----------y--------|
closing:  x → timer(30), y → timer(30)
          bufferToggle(openings, () => timer(30))
output:   -----[a,b,c]---y---[e,f]--|
          (window 1: opens at x, closes 30ms later → [a,b,c])
          (window 2: opens at y, closes 30ms later → [e,f])
          (d falls outside both windows — discarded)
```

Overlapping windows:
```
source:   --a--b--c--d--e--|
openings: --x--y-----------|
closing:  x → timer(40), y → timer(20)
output:   -------[a,b,c]---
          -----[b]----------
          (window from x: a,b,c; window from y: b)
```

---

#### Signature

```typescript
bufferToggle<T, O>(
	openings: ObservableInput<O>,
	closingSelector: (value: O) => ObservableInput<unknown>
): OperatorFunction<T, T[]>
```

---

#### When to Use

- Collect DOM events only during specific UI states (e.g. buffer mouse moves only while a drag is active).
- Record user interactions during a "recording mode" that can be toggled on and off.
- Capture messages from a WebSocket stream only during specific phases of a workflow.
- Create overlapping time windows where each window captures a different duration based on what triggered the opening.
- Implement A/B recording — open multiple windows with different closing conditions and compare the collected values.

---

#### Code Example

```typescript
import { fromEvent, Subject } from 'rxjs'
import { bufferToggle, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface MousePosition {
	x: number
	y: number
}

// Record mouse movements only while the mouse button is held down
const mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
	map((e: MouseEvent): MousePosition => ({ x: e.clientX, y: e.clientY }))
)

const mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown')
const mouseUp$   = fromEvent<MouseEvent>(document, 'mouseup')

const drag$ = mouseMove$.pipe(
	bufferToggle(mouseDown$, () => mouseUp$)
)

drag$.subscribe((positions: MousePosition[]) => {
	console.log(`Drag captured ${positions.length} positions`)
	drawPath(positions)
})
```

Multiple overlapping windows with different durations:

```typescript
import { interval } from 'rxjs'
import { bufferToggle, map } from 'rxjs/operators'
import { timer } from 'rxjs'

interface Event {
	id: number
	priority: 'low' | 'high'
}

type OpeningEvent = { windowMs: number }

// Each opening event determines its own window duration
const events$ = interval(100).pipe(map((i: number): Event => ({
	id: i,
	priority: i % 5 === 0 ? 'high' : 'low'
})))

const openings$ = interval(500).pipe(
	map((i: number): OpeningEvent => ({ windowMs: i % 2 === 0 ? 200 : 400 }))
)

const windowed$ = events$.pipe(
	bufferToggle(openings$, (o: OpeningEvent) => timer(o.windowMs))
)

windowed$.subscribe((batch: Event[]) => console.log('Batch:', batch.length))
```

---

#### Gotchas

1. **Values outside open windows are discarded** — unlike `buffer` (which collects everything between notifier ticks), `bufferToggle` only collects values while a window is explicitly open. Values that arrive when no window is active are permanently lost. This is intentional — if you need all values, use `buffer` instead.

2. **Overlapping windows produce duplicate values** — if multiple windows are open simultaneously, the same source value will appear in all open windows. This is the feature, not a bug: `bufferToggle` is the standard way to create overlapping windows.

3. **`bufferToggle` vs `windowToggle`** — `bufferToggle` emits complete arrays; `windowToggle` emits inner Observables. Use `windowToggle` when you need to apply operators to each window's stream while it is still open; use `bufferToggle` when you need the complete array.

4. **`closingSelector` is called with the opening value** — the value emitted by `openings$` is passed to `closingSelector`. Use this to make the window duration dependent on what triggered the opening (as in the code example above).

5. **Memory with long-open windows** — if a window stays open for a long time on a high-frequency source, the internal buffer grows without bound. Ensure closing signals are reliable and timely.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `buffer` | Single notifier; non-overlapping windows; no values discarded | Simple event-driven batch boundaries with no gaps |
| `bufferWhen` | Factory function provides closing Observable; no separate opening | Each window opens immediately after the previous closes |
| `bufferCount` | Fixed-size count-based windows | Batch by number of values |
| `bufferTime` | Fixed-time windows | Batch by time interval |
| `windowToggle` | Same open/close semantics but emits inner Observables | Streaming access to each window's values |

---

#### Decision Rule

> Use `bufferToggle` when windows need **explicit, independent open and close signals** — especially for overlapping windows or when the window duration depends on what triggered the opening. Use `buffer` for simpler non-overlapping event-driven batches.
