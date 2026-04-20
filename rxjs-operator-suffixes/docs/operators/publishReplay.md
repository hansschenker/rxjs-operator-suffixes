---
operator: publishReplay
family: Multicasting
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `publishReplay(bufferSize?, windowTime?, scheduler?)`

> Shorthand for `multicast(new ReplaySubject(bufferSize, windowTime))` — converts a cold Observable into a `ConnectableObservable` that replays the last N emissions to any late subscriber.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — replay is based on count (or optionally age), not on emission timing relative to other values |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | No — all current subscribers receive every emission; late subscribers receive buffered replay |
| **Completion required** | No — relays values continuously; works normally on infinite streams |

**Completion behaviour** — `publishReplay` forwards every source emission to all current subscribers and stores up to `bufferSize` values for replay. When the source completes, the completion is forwarded and the buffer is retained — subsequent subscribers still receive the replay followed by an immediate complete. If the source never completes, the shared subscription stays open and the buffer rolls forward.

**Lossy behaviour** — `publishReplay` is not lossy for current subscribers. For late subscribers (those who join after some values have been emitted) it replays up to `bufferSize` values from the buffer. Only emissions older than the buffer window (when `windowTime` is set) are evicted.

---

#### Marble Diagram

```
source:  --a--b--c--------d--|
         publishReplay(2)

connect() at t=0:
sub1 (t=0): --a--b--c--------d--|
sub2 (t=3):       (bc)-------d--|
                   ^^^ replay on subscribe

With windowTime=200ms, sub2 subscribes at t=400ms:
  b (emitted t=100) → age 300ms > 200ms → evicted
  c (emitted t=200) → age 200ms = limit  → kept
  replay: only c
```

---

#### Signature

```typescript
// RxJS 7 — deprecated; prefer connectable() with ReplaySubject
publishReplay<T>(bufferSize?: number): UnaryFunction<Observable<T>, ConnectableObservable<T>>
publishReplay<T>(bufferSize?: number, windowTime?: number): UnaryFunction<Observable<T>, ConnectableObservable<T>>
publishReplay<T>(
  bufferSize?: number,
  windowTime?: number,
  scheduler?: SchedulerLike
): UnaryFunction<Observable<T>, ConnectableObservable<T>>
publishReplay<T>(
  bufferSize?: number,
  windowTime?: number,
  selector?: (shared: Observable<T>) => Observable<T>
): OperatorFunction<T, T>

interface ConnectableObservable<T> extends Observable<T> {
  connect(): Subscription
  refCount(): Observable<T>
}
```

> **RxJS 7 deprecation note:** `publishReplay()` is deprecated. Use `connectable(source$, { connector: () => new ReplaySubject(n) })` or `shareReplay(n)` for the common refcounted case.

---

#### When to Use

- Maintaining or migrating RxJS 5/6 code that uses `publishReplay(n)` + `refCount()`.
- You need explicit control over when the shared subscription starts (via `connect()`) combined with replay semantics for late subscribers.
- Building a cache-and-share pattern for HTTP responses that must start before any consumers subscribe.
- The `windowTime` parameter is needed to evict stale entries from the buffer — `shareReplay` does support this too, but `publishReplay` + explicit `connect()` gives more control over the subscription lifecycle.

---

#### Code Example

```typescript
import { timer } from 'rxjs'
import { publishReplay, take, map } from 'rxjs/operators'
import type { ConnectableObservable } from 'rxjs'

interface Config {
	theme: string
	locale: string
}

// Simulate a config fetch that must be shared and replayed
const configFetch$ = timer(500).pipe(
	take(1),
	map((): Config => ({ theme: 'dark', locale: 'en' }))
)

const config$ = configFetch$.pipe(
	publishReplay(1)
) as ConnectableObservable<Config>

// Start the source immediately — before consumers exist
config$.connect()

// Component A subscribes after the response has already arrived
setTimeout(() => {
	config$.subscribe((cfg: Config) => {
		console.log('Component A got config:', cfg)  // receives replay
	})
}, 1000)

// RxJS 7 equivalent using connectable():
import { connectable, ReplaySubject } from 'rxjs'

const shared$ = connectable(configFetch$, {
	connector: () => new ReplaySubject<Config>(1)
})
shared$.connect()
```

---

#### Gotchas

1. **`publishReplay()` is deprecated in RxJS 7** — use `connectable(source$, { connector: () => new ReplaySubject(n) })` for explicit connect control, or `shareReplay(n)` for automatic refcounting. These are the idiomatic RxJS 7 equivalents.

2. **`refCount()` does not create a fresh ReplaySubject on reconnect** — when subscriber count drops to zero and rises again, the same `ReplaySubject` is reused. If the source completed, new subscribers get the replayed values followed by an immediate complete. Use a subject factory with `multicast(() => new ReplaySubject(n))` or `connectable()` with `resetOnDisconnect: true` to avoid this.

3. **`connect()` must be called manually** — nothing happens until `.connect()` is called. This is the common gotcha for all `ConnectableObservable`-based operators.

4. **Buffer grows unboundedly if `bufferSize` is omitted** — calling `publishReplay()` with no argument defaults to `bufferSize = Infinity`. On a long-running stream this will accumulate every emission in memory. Always specify an explicit buffer size.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `shareReplay(n)` | RxJS 7 idiomatic equivalent with automatic refcounting | New code — default choice for replay + share |
| `publish()` | Uses plain `Subject`; no replay | When late subscribers do not need past values |
| `publishBehavior(v)` | Uses `BehaviorSubject`; always synchronous first emission with an initial value | Need an initial value before source emits |
| `publishLast()` | Uses `AsyncSubject`; only emits the last value on completion | Need only the final result of a finite stream |
| `connectable()` + `ReplaySubject` | RxJS 7 replacement; explicit `connect()` | New code with manual lifecycle control and replay |

---

#### Decision Rule

> Use `publishReplay(n)` only in RxJS 5/6 codebases or when migrating. In RxJS 7, use `shareReplay(n)` for automatic refcounting, or `connectable(source$, { connector: () => new ReplaySubject(n) })` for explicit connect control.
