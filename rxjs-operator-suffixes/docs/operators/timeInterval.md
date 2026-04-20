---
operator: timeInterval
family: Utility
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `timeInterval<T>(scheduler?: SchedulerLike)`

> Wraps each source value in a `{ value, interval }` object where `interval` is the elapsed milliseconds since the previous emission (or since subscription for the first value) — turning a stream into a stream of time-gap measurements.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Utility |
| **Time-sensitive** | Yes — measures elapsed time between emissions |
| **Value-sensitive** | No — does not inspect value content; wraps every value unconditionally |
| **Lossy** | No — every source value is forwarded (wrapped) |
| **Completion required** | No — wraps each value as it arrives; works on infinite sources |

**Completion behaviour** — `timeInterval` wraps every source value and forwards it. When the source completes or errors, the signal propagates immediately. No buffering or delay is introduced.

**Lossy behaviour** — not lossy. Every source value is wrapped and forwarded. The only addition is timing metadata.

---

#### Marble Diagram

```
source:  --a-----b--c----|
         timeInterval()
output:  --{a,10}-----{b,50}--{c,30}----|
         (first value: 10ms since subscribe; b: 50ms since a; c: 30ms since b)
```

---

#### Signature

```typescript
timeInterval<T>(
	scheduler?: SchedulerLike  // default: asyncScheduler
): OperatorFunction<T, TimeInterval<T>>

interface TimeInterval<T> {
	readonly value: T
	readonly interval: number  // ms since previous emission (or subscription)
}
```

---

#### When to Use

- Measure inter-emission gaps for performance profiling or debugging stream timing.
- Detect anomalously slow or fast emissions and raise alerts (e.g. heartbeat gap monitoring).
- Calculate throughput (events per second) by accumulating interval measurements.
- Expose timing metadata to operators downstream — e.g. throttle based on the measured gap.
- Add latency annotations to a stream of API responses for observability.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { timeInterval, map, filter } from 'rxjs/operators'
import { TimeInterval } from 'rxjs'

interface KeyPress {
	key: string
}

interface AnnotatedKeyPress {
	key: string
	gapMs: number
}

// Measure typing speed — time between keystrokes
const typing$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
	timeInterval(),
	map((ti: TimeInterval<KeyboardEvent>): AnnotatedKeyPress => ({
		key: ti.value.key,
		gapMs: ti.interval
	})),
	filter((e: AnnotatedKeyPress) => e.key.length === 1) // printable chars only
)

typing$.subscribe((e: AnnotatedKeyPress) =>
	console.log(`Key "${e.key}" typed after ${e.gapMs}ms`)
)
```

Detect WebSocket heartbeat gaps — alert if gap exceeds threshold:

```typescript
import { webSocket } from 'rxjs/webSocket'
import { timeInterval, filter, tap } from 'rxjs/operators'
import { TimeInterval } from 'rxjs'

interface WsMessage {
	type: string
	payload: unknown
}

const ws$ = webSocket<WsMessage>('wss://example.com/stream').pipe(
	timeInterval(),
	tap((ti: TimeInterval<WsMessage>) => {
		if (ti.interval > 10_000) {
			console.warn(`Long gap before message: ${ti.interval}ms`)
		}
	}),
	map((ti: TimeInterval<WsMessage>) => ti.value)
)

ws$.subscribe((msg: WsMessage) => handleMessage(msg))
```

---

#### Gotchas

1. **`interval` is from the previous emission, not from subscription** — except for the first value, where `interval` is the time since subscription. This is by design but can be surprising: the first value's `interval` measures the time to arrival, not an inter-emission gap.

2. **`timeInterval` vs `timestamp`** — `timestamp` adds an absolute wall-clock timestamp (`{ value, timestamp: Date.now() }`); `timeInterval` adds a relative elapsed gap. Use `timestamp` for logging/event ordering; use `timeInterval` for gap measurement and performance analysis.

3. **The wrapped `{ value, interval }` shape must be unwrapped downstream** — if you pass a `timeInterval`-wrapped stream to a consumer that expects raw values, use `map(ti => ti.value)` to strip the metadata before handing it off.

4. **Timing accuracy depends on the scheduler** — on a busy event loop, `interval` measurements may be higher than actual source gaps. For tight timing guarantees, consider using a `VirtualTimeScheduler` in tests or a dedicated performance measurement tool in production.

5. **Completion and error do not produce a final `timeInterval` entry** — the completion/error signals propagate directly without wrapping. There is no `{ value: undefined, interval: lastGap }` on completion.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `timestamp` | Adds absolute wall-clock time (`Date.now()`) | You need event ordering or absolute time logging |
| `delay` | Shifts all emissions by a fixed time | You want to delay a stream, not measure it |
| `timeout` | Errors if no emission within N ms | You want to enforce a timing deadline |
| `tap` + `Date.now()` | Manual timing measurement inline | One-off ad-hoc measurement without changing the stream type |

---

#### Decision Rule

> Use `timeInterval` when you need to **measure elapsed time between consecutive emissions** as part of the reactive stream. Use `timestamp` when you need absolute wall-clock times. Use `timeout` when you need to enforce a timing deadline rather than observe it.
