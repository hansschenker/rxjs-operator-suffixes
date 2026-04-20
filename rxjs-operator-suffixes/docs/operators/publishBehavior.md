---
operator: publishBehavior
family: Multicasting
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `publishBehavior(initialValue)`

> Shorthand for `multicast(new BehaviorSubject(initialValue))` — converts a cold Observable into a `ConnectableObservable` that always has a current value and synchronously replays it to any new subscriber.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — it does not react to when values arrive; it routes them through the BehaviorSubject as-is |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | No — the BehaviorSubject always holds the latest value; every subscriber receives it immediately on subscribe |
| **Completion required** | No — relays values continuously; works on infinite streams |

**Completion behaviour** — `publishBehavior` forwards every source emission through an internal `BehaviorSubject`. The BehaviorSubject holds the latest value at all times, starting from `initialValue`. When the source completes, the BehaviorSubject completes and all subscribers receive the complete notification. The last value remains accessible synchronously on the Subject after completion, but new subscribers get the last value followed immediately by a complete.

**Lossy behaviour** — `publishBehavior` is not lossy: every subscriber receives the current value of the BehaviorSubject immediately on subscribe. Only the "previous" values before the current one are not replayed — but that is the BehaviorSubject contract, not data loss.

---

#### Marble Diagram

```
source:      --a--b--c--|
             publishBehavior('x')

connect() at t=0, initialValue = 'x':
sub1 (t=0):  x--a--b--c--|   ← receives 'x' synchronously on subscribe
sub2 (t=2):        b--c--|   ← receives 'b' (current value) synchronously on subscribe
sub3 (t=10):            (c)|  ← source completed; receives 'c' then complete
```

---

#### Signature

```typescript
// RxJS 7 — deprecated
publishBehavior<T>(initialValue: T): UnaryFunction<Observable<T>, ConnectableObservable<T>>

interface ConnectableObservable<T> extends Observable<T> {
  connect(): Subscription
  refCount(): Observable<T>
}
```

> **RxJS 7 deprecation note:** `publishBehavior()` is deprecated. Use `connectable(source$, { connector: () => new BehaviorSubject(initialValue) })` for explicit connect control, or a standalone `BehaviorSubject` if you also need imperative `.next()` and `.value` access.

---

#### When to Use

- Maintaining or migrating RxJS 5/6 code that uses `publishBehavior(v)` + `refCount()`.
- You need a cold Observable to behave like a `BehaviorSubject` — always having a current value that new subscribers receive synchronously — without switching to an imperative Subject.
- You want explicit `connect()` control over when the source starts, combined with synchronous current-value delivery to late subscribers.
- Bridging a cold data source (e.g. an HTTP poll) into a component system that requires an initial "loading" or "default" state value before the first emission arrives.

---

#### Code Example

```typescript
import { interval } from 'rxjs'
import { publishBehavior, map, take } from 'rxjs/operators'
import type { ConnectableObservable } from 'rxjs'

type Status = 'idle' | 'loading' | number

// Simulates a live count that starts at 'idle' before source emits
const count$ = interval(1000).pipe(
	take(3),
	map((n: number): number => n + 1),
	publishBehavior<Status>('idle')
) as ConnectableObservable<Status>

count$.connect()

// Sub immediately gets 'idle', then 1, 2, 3
count$.subscribe((v: Status) => console.log('A:', v))

// Sub 500ms late gets current value synchronously (still 'idle' or 1)
setTimeout(() => {
	count$.subscribe((v: Status) => console.log('B (late):', v))
}, 500)

// RxJS 7 equivalent using connectable():
import { connectable, BehaviorSubject } from 'rxjs'

const shared$ = connectable(interval(1000).pipe(take(3)), {
	connector: () => new BehaviorSubject<number>(0)
})
shared$.connect()
```

MVU context — providing a default state before the first action fires:

```typescript
import { Subject, connectable, BehaviorSubject, scan } from 'rxjs'
import type { Observable } from 'rxjs'

interface AppState { count: number }
type Action = { type: 'INCREMENT' }

const initialState: AppState = { count: 0 }
const action$ = new Subject<Action>()

// State stream shared like a BehaviorSubject — any late subscriber
// gets the current accumulated state immediately on subscribe
const state$: Observable<AppState> = connectable(
	action$.pipe(
		scan((s: AppState, a: Action): AppState => {
			if (a.type === 'INCREMENT') return { count: s.count + 1 }
			return s
		}, initialState)
	),
	{ connector: () => new BehaviorSubject<AppState>(initialState) }
)

state$.connect()
```

---

#### Gotchas

1. **`publishBehavior()` is deprecated in RxJS 7** — use `connectable(source$, { connector: () => new BehaviorSubject(v) })` for explicit connect control, or a plain `BehaviorSubject` with manual `.next()` if you need imperative writes.

2. **`connect()` must be called manually** — the `ConnectableObservable` does not subscribe to the source until `.connect()` is called. Subscribers before that call receive `initialValue` synchronously but then stall waiting for source emissions that never arrive.

3. **No `.value` property** — unlike `BehaviorSubject`, `ConnectableObservable` does not expose a `.value` accessor. If you need to read the current value synchronously outside a subscription, use a `BehaviorSubject` directly.

4. **`refCount()` does not reset the BehaviorSubject** — when subscriber count drops to zero and rises again, the existing BehaviorSubject is reused. If the source completed, new subscribers get the last value then an immediate complete rather than a fresh start.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `BehaviorSubject` | Imperative push via `.next()`; exposes `.value` synchronously | You own the source and need to push values imperatively |
| `shareReplay(1)` | No initial value; first subscriber must wait for first source emission | You don't need a guaranteed initial default value |
| `publish()` | Uses plain `Subject`; no current value for late subscribers | Late subscribers do not need an initial emission |
| `publishReplay(n)` | Uses `ReplaySubject(n)`; replays last N values, not just 1 | Need to replay more than one value to late subscribers |
| `connectable()` + `BehaviorSubject` | RxJS 7 replacement; explicit `connect()` | New code with manual lifecycle control and initial value |

---

#### Decision Rule

> Use `publishBehavior(v)` only in RxJS 5/6 codebases or when migrating. In RxJS 7, use `connectable(source$, { connector: () => new BehaviorSubject(v) })` for explicit connect control, or a plain `BehaviorSubject` when you need the `.value` accessor and imperative writes.
