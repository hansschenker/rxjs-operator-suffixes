---
operator: share
family: Multicasting
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `share()`

> Multicasts a source Observable to multiple subscribers by applying `publish()` + `refCount()` under the hood — each new subscriber joins a shared execution, and the source is subscribed to only once as long as at least one subscriber is active.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — it does not react to *when* values arrive; it simply relays them to all active subscribers |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | Yes — late subscribers miss values emitted before they subscribed; there is no replay buffer |
| **Completion required** | No — the operator relays values continuously and completes when the source completes |

**Completion behaviour** — `share()` forwards source values to all current subscribers as they arrive. When the source completes, all subscribers receive the complete notification. If the source never completes, the shared subscription stays alive indefinitely as long as at least one subscriber remains. When subscriber count drops to zero, the source subscription is torn down; if a new subscriber arrives later, a fresh subscription to the source is started from scratch.

**Lossy behaviour** — `share()` is lossy for late subscribers. Because there is no buffer, any value emitted before a subscriber joins is permanently gone for that subscriber. If two subscribers arrive at different times, the later one only sees values from the moment it subscribed onward.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--|
         share()

sub1 (t=0): --a--b--c--d--e--|
sub2 (t=2):       --c--d--e--|
              ^ joins late, misses a and b
```

Reference-counting lifecycle:
```
source sub opens when sub1 subscribes ──────────────────────────────┐
sub1 subscribes ──────┐                                             │
                      ├─── shared execution running ───────────────┤
sub2 subscribes ──────┘                                             │
sub1 unsubscribes ──────────────────────────────────────────────────┤
sub2 unsubscribes ──────────────────────────────────────── source sub closes
```

---

#### Signature

```typescript
// RxJS 7
share(): MonoTypeOperatorFunction<T>

// RxJS 7.4+ — configurable overload
share<T>(options: ShareConfig<T>): MonoTypeOperatorFunction<T>

interface ShareConfig<T> {
  connector?: () => SubjectLike<T>;       // default: new Subject()
  resetOnError?: boolean | ((error: unknown) => Observable<unknown>);
  resetOnComplete?: boolean | ((completion: () => Observable<unknown>));
  resetOnRefCountZero?: boolean | ((refCountZero: () => Observable<unknown>));
}
```

---

#### When to Use

- Share an HTTP request between multiple components that all subscribe independently — without `share()`, each subscription would trigger a separate network call.
- Broadcast DOM events (mouse moves, resize, scroll) to multiple consumers without attaching multiple event listeners to the document.
- Share expensive computed streams (e.g. a `combineLatest` of several state slices) across multiple derived streams in an MVU pipeline.
- Prevent duplicate side effects in an effects system where multiple effects listen to the same `actions$` stream.
- Connect a hot source (WebSocket, SSE) to multiple downstream consumers in a single shared subscription.

---

#### Code Example

```typescript
import { fromEvent, share, map, filter } from 'rxjs'

// Shared mouse-move stream — one event listener, many consumers
const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove').pipe(
	share()
)

// Consumer A: track X coordinate
const x$ = mousemove$.pipe(
	map((e: MouseEvent): number => e.clientX)
)

// Consumer B: detect when cursor enters the left half
const inLeftHalf$ = mousemove$.pipe(
	map((e: MouseEvent): boolean => e.clientX < window.innerWidth / 2),
	filter((inLeft: boolean) => inLeft)
)

// Both consumers share the same underlying event listener
x$.subscribe((x: number) => console.log('x:', x))
inLeftHalf$.subscribe(() => console.log('entered left half'))
```

MVU context — sharing the action stream across multiple effects:

```typescript
import { Subject, share } from 'rxjs'
import { ofType } from './utils'

interface Action {
	type: string
	payload?: unknown
}

const rawActions$ = new Subject<Action>()

// Share so all effects subscribe to the same Subject multicast
// without each triggering a fresh Subject subscription path
const actions$ = rawActions$.pipe(share())

const loadEffect$ = actions$.pipe(
	ofType('LOAD_DATA'),
	switchMap(() => fetchData$)
)

const logEffect$ = actions$.pipe(
	ofType('LOAD_DATA'),
	tap((action: Action) => console.log('[effect]', action.type))
)
```

---

#### Gotchas

1. **Refcount reset restarts the source** — when the last subscriber unsubscribes, the source subscription is torn down. If a new subscriber arrives afterward, `share()` re-subscribes to the source from the beginning. For HTTP observables this means a new network request fires. Use `shareReplay(1)` if you need the last value replayed to late subscribers and do not want re-subscription.

2. **Late subscribers miss past values** — unlike `shareReplay`, `share()` has no buffer. A subscriber that arrives after values have been emitted gets nothing from the past. This is the most common source of "where did my value go?" bugs.

3. **RxJS 7 changed the reset defaults** — in RxJS 6, `share()` used `publish()` + `refCount()`, which never reset on completion or error. In RxJS 7, the defaults reset on error, completion, and refcount-zero, meaning the Subject is replaced and the source re-subscribed. Code that relied on the RxJS 6 "never resets" behaviour will behave differently after upgrading. Use `share({ resetOnError: false, resetOnComplete: false, resetOnRefCountZero: false })` to match the old behaviour.

4. **`share()` vs `Subject` directly** — `share()` wires up the multicast automatically with refcounting, but if you need explicit control over when the multicast starts (e.g. hot from the moment the app boots regardless of subscribers), use a `Subject` or `ReplaySubject` directly and `connect()` manually.

5. **Placing `share()` too early or too late in the pipe** — operators before `share()` run once (shared), operators after `share()` run once per subscriber. Misplacing it can cause operators like `tap` (logging, metrics) to fire either too few or too many times.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `shareReplay(1)` | Replays the last N values to late subscribers; does **not** reset on refcount zero by default (RxJS 7) | You need late subscribers to receive the most recent emission — e.g. current state, last API response |
| `publish() + refCount()` | RxJS 6 equivalent of `share()`; does not reset on completion/error | Migrating RxJS 6 code; need exact legacy semantics |
| `publish() + connect()` | Manual multicast — you control exactly when the source subscription starts | You need a "warm" multicast that starts before any subscriber arrives |
| `BehaviorSubject` | Holds and replays current value; imperative push model | You own the source and need synchronous `.value` access alongside the stream |
| `connectable()` | RxJS 7 replacement for `publish()`; explicit `connect()` call | You need full manual control over multicast lifecycle |

---

#### Decision Rule

> Use `share()` when you have a cold Observable that multiple consumers subscribe to independently and you want a single shared execution with no value replay. Prefer `shareReplay(1)` instead when late subscribers must receive the most recent value (e.g. current state, cached response).
