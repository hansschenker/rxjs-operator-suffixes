---
operator: publish
family: Multicasting
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `publish(selector?)`

> Shorthand for `multicast(new Subject())` — converts a cold Observable into a `ConnectableObservable` that shares a single source execution among all subscribers via a plain `Subject`, with no replay buffer.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — it does not react to when values arrive; it routes them through the Subject as-is |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | Yes — subscribers that join after `connect()` is called miss all previously emitted values; the plain `Subject` has no buffer |
| **Completion required** | No — relays values continuously; completes when the source completes |

**Completion behaviour** — `publish()` forwards every source emission through an internal `Subject` to all current subscribers. It does not buffer or wait for source completion. If the source never completes, the multicast stays open indefinitely. When the source completes, the Subject completes and all subscribers receive the complete notification.

**Lossy behaviour** — because the internal connector is a plain `Subject` (no buffer), any values emitted before a subscriber joins are permanently lost to that subscriber. Use `publishReplay(n)` if you need late subscribers to receive recent values.

---

#### Marble Diagram

```
source:  --a--b--c--d--|
         publish()

connect() called at t=0:
sub1 (t=0): --a--b--c--d--|
sub2 (t=2):       --c--d--|   ← misses a, b

No connect() call:
sub1 (t=0): (nothing — source never subscribed)
```

---

#### Signature

```typescript
// RxJS 7 — deprecated; prefer connectable() or share()
publish<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>
publish<T>(selector: (shared: Observable<T>) => Observable<T>): OperatorFunction<T, T>

// ConnectableObservable interface
interface ConnectableObservable<T> extends Observable<T> {
  connect(): Subscription
  refCount(): Observable<T>
}
```

> **RxJS 7 deprecation note:** `publish()` is deprecated. Use `connectable(source$, { connector: () => new Subject() })` or simply `share()` for the common refcounted case.

---

#### When to Use

- Maintaining or migrating RxJS 5/6 code that relies on `publish()` + `connect()` or `publish()` + `refCount()`.
- You need explicit control over when the source subscription starts and want no replay semantics.
- You need the `selector` overload to scope a multicast temporarily inside a pipe without exposing the `ConnectableObservable` to callers.
- Building a "warm" multicast that starts before any subscribers arrive (use `connect()` before subscriptions).

---

#### Code Example

```typescript
import { interval } from 'rxjs'
import { publish, take, tap } from 'rxjs/operators'
import type { ConnectableObservable } from 'rxjs'

// Shared interval — one source, two consumers
const source$ = interval(300).pipe(
	take(5),
	tap((n: number) => console.log('source:', n))
)

const hot$ = source$.pipe(
	publish()
) as ConnectableObservable<number>

hot$.subscribe((n: number) => console.log('A:', n))
hot$.subscribe((n: number) => console.log('B:', n))

// Source subscription starts here
const connection = hot$.connect()

// RxJS 7 equivalent using connectable():
import { connectable, Subject } from 'rxjs'

const shared$ = connectable(source$, {
	connector: () => new Subject<number>()
})
shared$.subscribe((n: number) => console.log('A:', n))
shared$.connect()
```

Selector overload — scoped multicast without exposing ConnectableObservable:

```typescript
import { fromEvent, publish, map, filter } from 'rxjs'
import type { Observable } from 'rxjs'

// The selector receives the shared Observable; the multicast is
// automatically connected and torn down within the selector's scope
const result$: Observable<number> = fromEvent<MouseEvent>(document, 'click').pipe(
	publish((click$: Observable<MouseEvent>) =>
		click$.pipe(
			map((e: MouseEvent): number => e.clientX),
			filter((x: number) => x > 100)
		)
	)
)
```

---

#### Gotchas

1. **`publish()` is deprecated in RxJS 7** — the team replaced it with `connectable()` (no selector) and the `connect()` operator (with selector). New code should use those instead. `share()` is the right default for most cases.

2. **`connect()` must be called manually** — a `ConnectableObservable` from `publish()` does not subscribe to the source until `.connect()` is called. All subscribers attached before that call will wait silently, getting no values until connect fires.

3. **`refCount()` does not reset the Subject** — chaining `.refCount()` onto `publish()` tears down the source subscription when the last subscriber leaves, but reuses the same (possibly completed) `Subject` when a new subscriber arrives. Use `share()` in RxJS 7 instead, which creates a fresh Subject on reconnect by default.

4. **Selector overload auto-connects** — when you use the selector form `publish(selector)`, the multicast is connected automatically and torn down when the selector's output completes. You do not call `.connect()` yourself. Mixing the two forms is a common source of confusion.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `share()` | RxJS 7 equivalent with automatic refcounting and reset-on-refcount-zero | New code — the default multicasting choice |
| `publishReplay(n)` | Uses `ReplaySubject(n)` as connector; late subscribers get buffered values | Need late-subscriber replay |
| `publishBehavior(v)` | Uses `BehaviorSubject(v)`; always has a current value | Need an initial value and always-synchronous first emission |
| `publishLast()` | Uses `AsyncSubject`; only emits the last value on source completion | Need only the final value, like a promise |
| `connectable()` | RxJS 7 low-level replacement; explicit connector factory | New code needing full manual lifecycle control |
| `multicast(new Subject())` | Explicit equivalent of `publish()` | When you need the Subject instance for external use |

---

#### Decision Rule

> Use `publish()` only in RxJS 5/6 codebases or when migrating. In RxJS 7, replace with `share()` for automatic refcounting, or `connectable()` when you need explicit `connect()` control.
