---
operator: timeout
family: Error Handling
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-29
---

### `timeout<T, O>(config: TimeoutConfig<T, O> | number | Date)`

> Errors the stream with a `TimeoutError` if the source does not emit, complete, or error within the configured time — with RxJS 7 adding a rich config object for per-value timeouts, custom errors, and fallback Observables.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Error Handling |
| **Time-sensitive** | Yes — the entire behaviour is driven by timing |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — values that arrive before the timeout are forwarded; timeout terminates the stream, not silently drops values |
| **Completion required** | No — monitors emissions continuously; works on infinite sources |

**Completion behaviour** — `timeout` monitors the time between subscriptions and first emission (or between consecutive emissions) against the configured deadline. If the deadline is exceeded, it either throws a `TimeoutError` (default) or switches to a fallback Observable (`with` option). If values arrive within the deadline, they are forwarded unchanged. A completing or erroring source propagates normally.

**Lossy behaviour** — not lossy in the traditional sense. Values that arrive before the timeout fire are forwarded. Timeout itself terminates the stream; it does not drop individual values.

---

#### Marble Diagram

Basic timeout — error if no emission within 30ms:
```
source:  --a--b---------c--|
         timeout(30)
output:  --a--b----✕
                   (TimeoutError after 30ms silence between b and c)
```

With fallback (`with: fallback$`):
```
source:  --a-----------...
         timeout({ first: 30, with: () => of('fallback') })
output:  --a-----------fallback|
         (no second emission within 30ms → switch to fallback)
```

---

#### Signature

```typescript
// RxJS 7 — rich config object (recommended)
timeout<T, O>(
	config: TimeoutConfig<T, O>
): OperatorFunction<T, T | O>

// Legacy shorthand — still valid
timeout<T>(due: number | Date): OperatorFunction<T, T>

interface TimeoutConfig<T, O = T> {
	// Time limit for the first emission (ms or Date)
	first?: number | Date
	// Time limit between each subsequent emission (ms or Date)
	each?: number
	// Fallback Observable to switch to on timeout (replaces error)
	with?: (info: TimeoutInfo<T>) => ObservableInput<O>
	// Custom error factory
	meta?: unknown
	scheduler?: SchedulerLike
}

class TimeoutError<T> extends Error {
	info: TimeoutInfo<T> | null
}

interface TimeoutInfo<T> {
	readonly seen: number          // number of values seen before timeout
	readonly lastValue: T | null   // last value emitted before timeout
	readonly meta: unknown         // from config.meta
}
```

RxJS 6 / legacy:
```typescript
// timeoutWith was the RxJS 6 fallback API — deprecated in RxJS 7
timeoutWith<T, O>(due: number | Date, withObservable: ObservableInput<O>): OperatorFunction<T, T | O>
```

---

#### When to Use

- Guard HTTP requests with a deadline — error if the server does not respond within N ms.
- Add per-emission timeouts to a WebSocket stream — error if no heartbeat arrives within the expected interval.
- Implement user inactivity detection — timeout if no user interaction within a session window.
- Provide a fallback Observable when a primary source stalls (e.g. switch to cached data if live data doesn't arrive in time).
- Set a `first` deadline for initial connection and a shorter `each` deadline for ongoing heartbeats.

---

#### Code Example

```typescript
import { ajax } from 'rxjs/ajax'
import { timeout, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

interface UserProfile {
	id: number
	name: string
}

// Error if the API doesn't respond within 5 seconds
const profile$ = ajax.getJSON<UserProfile>('/api/profile').pipe(
	timeout(5000),
	catchError((err: unknown) => {
		if (err instanceof TimeoutError) {
			console.error('Request timed out')
			return of({ id: 0, name: 'Guest' } as UserProfile)
		}
		throw err
	})
)

profile$.subscribe((user: UserProfile) => renderProfile(user))
```

WebSocket heartbeat monitoring with per-emission timeout and fallback:

```typescript
import { webSocket } from 'rxjs/webSocket'
import { timeout } from 'rxjs/operators'
import { timer } from 'rxjs'

interface WsMessage {
	type: string
	payload: unknown
}

const ws$ = webSocket<WsMessage>('wss://example.com/stream').pipe(
	timeout({
		first: 3000,    // must connect and emit within 3s
		each: 10000,    // each subsequent message must arrive within 10s
		with: (info) => {
			console.warn(`Timeout after ${info.seen} messages — reconnecting`)
			return timer(1000).pipe(
				switchMap(() => webSocket<WsMessage>('wss://example.com/stream'))
			)
		}
	})
)

ws$.subscribe((msg: WsMessage) => handleMessage(msg))
```

---

#### Gotchas

1. **`timeout(n)` checks inter-emission gaps, not total duration** — with `timeout(n)` (number shorthand), the clock resets after every emission. If values arrive steadily, the stream never times out even if it runs for hours. Use `first` to set an absolute deadline for the first emission and `each` for per-emission gaps.

2. **`TimeoutError` is a distinct class** — always check `err instanceof TimeoutError` in `catchError` to distinguish timeout errors from other errors. Do not swallow all errors generically.

3. **RxJS 7: `timeoutWith` is deprecated** — use `timeout({ each: n, with: () => fallback$ })` instead. The `with` option in the config object is the direct replacement.

4. **`with` fallback replaces the stream, not just one value** — when the `with` factory fires, the original source is unsubscribed and the fallback Observable takes over for the rest of the stream's lifetime. This is suitable for retry/reconnect logic.

5. **`first` deadline is from subscription, not from the last emission** — `first: 3000` means the first value must arrive within 3 seconds of subscribing. Subsequent values are then governed by `each` if set.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `timeoutWith` | Deprecated RxJS 6 API — equivalent to `timeout({ with })` | Legacy code only; migrate to `timeout` config |
| `catchError` | Catches errors without a time component | You need error recovery not related to timing |
| `retry` | Re-subscribes on any error (including `TimeoutError`) | You want automatic retry on failure |
| `throwIfEmpty` | Errors if the source completes with no values | No values emitted before completion (not a timing check) |
| `race` | Takes the first Observable to emit | You want the fastest of several competing sources |

---

#### Decision Rule

> Use `timeout` to **enforce a deadline on source emissions**. Use the config object form for fine-grained `first`/`each` deadlines and fallback Observables. Pair with `catchError` or `retry` to recover gracefully.
