---
operator: timestamp
family: Utility
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `timestamp<T>(scheduler?: SchedulerLike)`

> Wraps each source value in a `{ value, timestamp }` object where `timestamp` is the wall-clock time (in milliseconds since epoch) at the moment the value was emitted — adding absolute time metadata to every event.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Utility |
| **Time-sensitive** | Yes — captures the emission time of each value |
| **Value-sensitive** | No — wraps every value unconditionally regardless of content |
| **Lossy** | No — every source value is forwarded (wrapped) |
| **Completion required** | No — wraps each value as it arrives; works on infinite sources |

**Completion behaviour** — `timestamp` wraps every source value and forwards it. Completion and error signals propagate immediately without wrapping. No buffering or delay is introduced.

**Lossy behaviour** — not lossy. Every source value is wrapped and forwarded.

---

#### Marble Diagram

```
source:  --a-----b----c----|
         timestamp()
output:  --{a,t1}-----{b,t2}----{c,t3}----|
         (t1, t2, t3 are Date.now() values at emission time)
```

---

#### Signature

```typescript
timestamp<T>(
	scheduler?: SchedulerLike  // default: asyncScheduler
): OperatorFunction<T, Timestamp<T>>

interface Timestamp<T> {
	readonly value: T
	readonly timestamp: number  // milliseconds since Unix epoch (Date.now())
}
```

---

#### When to Use

- Log events with accurate wall-clock timestamps for debugging or audit trails.
- Calculate end-to-end latency by comparing the emission `timestamp` to when it is processed downstream.
- Order concurrent events by absolute time when multiple streams are merged.
- Annotate WebSocket messages or API responses with arrival times for observability.
- Build time-series data structures from streaming events without losing the temporal ordering.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { timestamp, map } from 'rxjs/operators'
import { Timestamp } from 'rxjs'

interface UserAction {
	type: string
	payload: unknown
}

interface TimestampedAction {
	type: string
	payload: unknown
	receivedAt: number
}

// Log user actions with wall-clock timestamps for audit trail
const action$ = fromEvent<CustomEvent>(store, 'action').pipe(
	timestamp(),
	map((ts: Timestamp<CustomEvent>): TimestampedAction => ({
		type: ts.value.detail.type,
		payload: ts.value.detail.payload,
		receivedAt: ts.timestamp
	}))
)

action$.subscribe((a: TimestampedAction) => auditLog.append(a))
```

End-to-end latency measurement:

```typescript
import { fromEvent } from 'rxjs'
import { timestamp, map } from 'rxjs/operators'
import { Timestamp } from 'rxjs'

interface ApiResponse {
	requestId: string
	data: unknown
	sentAt: number   // timestamp set at request creation
}

interface LatencyAnnotated {
	requestId: string
	data: unknown
	latencyMs: number
}

const response$ = fromEvent<CustomEvent>(apiClient, 'response').pipe(
	timestamp(),
	map((ts: Timestamp<CustomEvent>): LatencyAnnotated => {
		const res = ts.value.detail as ApiResponse
		return {
			requestId: res.requestId,
			data: res.data,
			latencyMs: ts.timestamp - res.sentAt
		}
	})
)

response$.subscribe((r: LatencyAnnotated) =>
	console.log(`Request ${r.requestId} latency: ${r.latencyMs}ms`)
)
```

---

#### Gotchas

1. **`timestamp` vs `timeInterval`** — `timestamp` adds an absolute `Date.now()` value; `timeInterval` adds the elapsed gap since the previous emission. Use `timestamp` for logging, ordering, and latency; use `timeInterval` for gap measurement and throughput analysis.

2. **The wrapped `{ value, timestamp }` shape must be unwrapped downstream** — consumers expecting raw values need a `map(ts => ts.value)` to strip the metadata before receiving it.

3. **Timestamp accuracy is limited by event loop scheduling** — the `timestamp` field reflects when the emission was observed by the operator, not when the underlying event physically occurred. On a busy thread, this may be slightly later than the true event time.

4. **`scheduler` parameter is primarily for testing** — pass a `VirtualTimeScheduler` or use `TestScheduler.run()` to control time in unit tests. In production, the default `asyncScheduler` (which uses `Date.now()`) is almost always correct.

5. **Completion and error do not produce a timestamped entry** — the completion signal propagates directly. If you need to record when a stream ended, use `tap({ complete: () => logEndTime(Date.now()) })`.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `timeInterval` | Adds elapsed time since previous emission (relative) | Gap measurement, throughput, performance profiling |
| `tap` | Side effects inline without wrapping | One-off logging without changing the stream value type |
| `timeout` | Enforces emission deadlines | You need to react to slow emissions, not just observe them |
| `delay` | Shifts all emissions by N ms | Delaying a stream, not timestamping it |

---

#### Decision Rule

> Use `timestamp` when you need to **annotate each emission with its absolute wall-clock time** for logging, ordering, or latency analysis. Use `timeInterval` when relative gaps between emissions matter more than absolute times.
