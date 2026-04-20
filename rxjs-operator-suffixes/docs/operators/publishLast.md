---
operator: publishLast
family: Multicasting
lossy: true
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `publishLast()`

> Shorthand for `multicast(new AsyncSubject())` — converts a cold Observable into a `ConnectableObservable` that emits only the last value from the source, and only after the source completes, to all subscribers simultaneously.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Multicasting |
| **Time-sensitive** | No — it does not react to when values arrive |
| **Value-sensitive** | No — it does not inspect value content |
| **Lossy** | Yes — all source values except the last are discarded |
| **Completion required** | Yes — nothing is emitted until the source completes |

**Completion behaviour** — `publishLast` buffers only the most recent value internally (via `AsyncSubject`). It emits nothing until the source completes, at which point it delivers the last value to all current subscribers, then completes. If the source is infinite and never completes, `publishLast` will never emit and the internal buffer grows to exactly one value indefinitely (memory cost is trivial, but the stream stalls).

**Lossy behaviour** — `publishLast` discards every source value except the last one. This is by design — it is the multicasting equivalent of the `last()` operator. Any intermediate emissions are silently dropped.

---

#### Marble Diagram

```
source:  --a--b--c--|
         publishLast()

connect() at t=0:
sub1 (t=0): ---------c|   ← only last value, on completion
sub2 (t=2):       ---c|   ← late subscriber still gets c on completion

source never completes:
source:  --a--b--c--d--...
output:  (never emits)
```

---

#### Signature

```typescript
// RxJS 7 — deprecated
publishLast<T>(): UnaryFunction<Observable<T>, ConnectableObservable<T>>

interface ConnectableObservable<T> extends Observable<T> {
  connect(): Subscription
  refCount(): Observable<T>
}
```

> **RxJS 7 deprecation note:** `publishLast()` is deprecated. Use `connectable(source$, { connector: () => new AsyncSubject() })` for explicit connect control, or `last()` + `share()` / `shareReplay(1)` for the common case.

---

#### When to Use

- Maintaining or migrating RxJS 5/6 code that uses `publishLast()`.
- You need a finite Observable to multicast only its final result (promise-like semantics) to multiple subscribers, where you control exactly when the source starts.
- Multiple components must all react to the completion value of a shared operation (e.g. a save or upload) without each triggering the operation independently.
- You want the multicast to start before subscribers exist (`connect()` before subscriptions) and have late subscribers still receive the result when it arrives.

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { publishLast, tap } from 'rxjs/operators'
import type { ConnectableObservable } from 'rxjs'

interface SaveResult { id: string; timestamp: number }

// Simulate an async save that multiple components observe
const save$: Observable<SaveResult> = from(
	fetch('/api/save', { method: 'POST' }).then((r): Promise<SaveResult> => r.json())
).pipe(
	tap(() => console.log('save executed once')),
	publishLast()
) as ConnectableObservable<SaveResult>

// Start the save before any UI has subscribed
save$.connect()

// UI components subscribe — both get the result when the save finishes
save$.subscribe((result: SaveResult) => console.log('Panel A:', result))
save$.subscribe((result: SaveResult) => console.log('Panel B:', result))

// RxJS 7 equivalent — last() + shareReplay(1) is the idiomatic replacement:
import { last, shareReplay } from 'rxjs'

const sharedSave$ = from(fetch('/api/save').then(r => r.json())).pipe(
	last(),
	shareReplay(1)
)
```

---

#### Gotchas

1. **`publishLast()` is deprecated in RxJS 7** — use `connectable(source$, { connector: () => new AsyncSubject() })` for explicit connect, or `last() + shareReplay(1)` for the common pattern. New code should not use `publishLast()`.

2. **Stalls completely on infinite sources** — because `publishLast` waits for source completion, using it with `interval()`, `fromEvent()`, or any non-terminating Observable means it will never emit. The `AsyncSubject` inside silently buffers the latest value but never delivers it.

3. **`connect()` must be called manually** — same as all `ConnectableObservable` operators. Forgetting to call `connect()` leaves subscribers waiting and the source never executing.

4. **All intermediate values are dropped** — this is intentional, but is a surprise to developers who expect all values to be buffered until completion like `toArray()`. If you need all values, use `publishReplay(Infinity)` or `toArray()` instead.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `last()` + `shareReplay(1)` | RxJS 7 idiomatic equivalent; automatic refcounting | New code — replaces `publishLast()` in most cases |
| `publish()` | Uses `Subject`; emits all values, not just the last | You need all values multicasted, not just the final one |
| `publishReplay(n)` | Uses `ReplaySubject`; replays last N values after completion | Need multiple past values replayed to late subscribers |
| `forkJoin([a$, b$])` | Waits for multiple sources to complete and emits their last values as a tuple | Coordinating the final values of multiple streams |
| `AsyncSubject` | The underlying Subject type; imperative push model | You own the source and need manual push with last-value-on-complete semantics |
| `connectable()` + `AsyncSubject` | RxJS 7 replacement with explicit `connect()` | New code needing manual lifecycle control |

---

#### Decision Rule

> Use `publishLast()` only in RxJS 5/6 codebases or when migrating. In RxJS 7, use `last() + shareReplay(1)` for the common case, or `connectable(source$, { connector: () => new AsyncSubject() })` when you need explicit `connect()` control.
