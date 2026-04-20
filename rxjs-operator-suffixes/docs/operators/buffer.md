---
operator: buffer
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `buffer<T>(closingNotifier: ObservableInput<unknown>)`

> Collects source values into an array and emits the array each time a **closing notifier** Observable emits — grouping values into batches whose boundaries are controlled by an external signal.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | Partial — not inherently time-driven, but the notifier is often time-based |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all source values are collected into buffers; none are discarded |
| **Completion required** | No — emits each time the notifier fires; works correctly on infinite sources |

**Completion behaviour** — `buffer` accumulates source values into an internal array. Each time the closing notifier emits, the accumulated array is emitted and a new empty buffer starts. When the source completes, any remaining buffered values are emitted as a final (possibly empty) array before the completion signal. If the source never completes, `buffer` runs indefinitely, emitting a batch on every notifier tick.

**Lossy behaviour** — not lossy. Every source value is collected into exactly one buffer. No values are ever dropped.

---

#### Marble Diagram

```
source:   --a--b--c--d--e--f--|
notifier: ------x--------x---|
          buffer(notifier)
output:   ------[a,b]----[c,d,e]--[f]|
          (on notifier x: flush buffer; on source complete: flush remainder)
```

Empty buffer when notifier fires with no new values:
```
source:   --a-----------b--|
notifier: ----x--x--x------|
output:   ----[a]-[]-[]-b--|
          (second x: empty buffer emitted)
```

---

#### Signature

```typescript
buffer<T>(
	closingNotifier: ObservableInput<unknown>
): OperatorFunction<T, T[]>
```

---

#### When to Use

- Batch DOM events (clicks, keypresses) and process them together on a signal (e.g. process all clicks that occurred during a loading spinner).
- Collect messages from a WebSocket stream and flush them in bulk on a heartbeat or user action.
- Group log entries and write them in batches when a flush trigger fires.
- Accumulate user actions and replay them when connectivity is restored.
- Use `bufferTime` when the closing signal is a fixed time interval; use `buffer` when the signal is event-driven.

---

#### Code Example

```typescript
import { fromEvent, Subject } from 'rxjs'
import { buffer, filter } from 'rxjs/operators'

interface ClickEvent {
	x: number
	y: number
	timestamp: number
}

// Collect all clicks; flush and process when the "submit" button is pressed
const click$ = fromEvent<MouseEvent>(document, 'click').pipe(
	map((e: MouseEvent): ClickEvent => ({
		x: e.clientX,
		y: e.clientY,
		timestamp: Date.now()
	}))
)

const submitClick$ = fromEvent(submitButton, 'click')

const clickBatch$ = click$.pipe(buffer(submitClick$))

clickBatch$.subscribe((clicks: ClickEvent[]) => {
	console.log(`Flushed ${clicks.length} clicks`)
	analyseClickPattern(clicks)
})
```

Batch WebSocket messages, flush every N seconds using a time-based notifier:

```typescript
import { webSocket } from 'rxjs/webSocket'
import { buffer } from 'rxjs/operators'
import { interval } from 'rxjs'

interface WsMessage {
	type: string
	payload: unknown
}

const ws$ = webSocket<WsMessage>('wss://example.com/stream')

// Flush messages every 2 seconds for bulk processing
const batched$ = ws$.pipe(buffer(interval(2000)))

batched$.subscribe((msgs: WsMessage[]) => processBatch(msgs))
```

---

#### Gotchas

1. **Empty buffers are emitted** — if the notifier fires when no source values have arrived, `buffer` emits an empty array `[]`. Filter these with `.pipe(filter(b => b.length > 0))` if empty batches are noise.

2. **`buffer` vs `bufferTime`** — `bufferTime(ms)` is a fixed-interval shorthand; `buffer(notifier$)` allows event-driven boundaries. Use `bufferTime` for periodic batching; use `buffer` when the flush signal is external or irregular.

3. **`buffer` vs `window`** — `buffer` collects values into arrays and emits each batch as a single array; `window` emits an inner Observable for each batch. Use `buffer` when you need the complete array at once; use `window` when you need streaming access to each batch via operators.

4. **Remaining values on source completion** — when the source completes, any buffered values that haven't been flushed by the notifier are emitted as a final batch. This is intentional but can produce an unexpected final emission after the last notifier tick.

5. **Notifier completion does not flush the current buffer** — if the notifier completes before the source, no more flushing occurs. Values accumulate indefinitely. Ensure the notifier has a longer or equal lifetime compared to the source.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferTime` | Fixed-interval closing notifier built in | Batching interval is a constant |
| `bufferCount` | Closes buffer after N values | You want fixed-size batches, not time-based |
| `bufferToggle` | Separate opening and closing notifiers | Windows overlap or opening is event-driven |
| `bufferWhen` | Closing notifier factory called per window | The closing signal is different for each window |
| `window` | Emits inner Observables instead of arrays | You need streaming access to each batch |

---

#### Decision Rule

> Use `buffer` when the **batch boundary is an external event-driven signal**. Use `bufferTime` for a fixed-rate clock, `bufferCount` for fixed-size batches, and `window` when you need to apply operators to each batch as a stream.
