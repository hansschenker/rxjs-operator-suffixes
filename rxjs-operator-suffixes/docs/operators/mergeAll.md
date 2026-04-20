---
operator: mergeAll
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `mergeAll<T>(concurrent?: number)`

> Subscribes to every inner Observable emitted by the source (a higher-order Observable) and forwards all their values concurrently — the higher-order counterpart of `merge`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — subscribes to inner Observables as they arrive regardless of timing |
| **Value-sensitive** | No — does not inspect the content of inner emissions |
| **Lossy** | No — all inner values are forwarded; excess inners are queued when `concurrent` is set |
| **Completion required** | No — emits on every inner emission; the output completes when the outer source completes *and* all active inner subscriptions have completed |

**Completion behaviour** — `mergeAll` subscribes to each inner Observable as the outer source emits it. The output does not complete until the outer source completes AND every active inner subscription has also completed. If the outer source never completes, `mergeAll` never completes either.

**Lossy behaviour** — `mergeAll` is not lossy. Every inner Observable is eventually subscribed to (queued if the `concurrent` limit is reached) and every emission from every inner is forwarded. Nothing is dropped.

---

#### Marble Diagram

```
outer:    --[a$]--------[b$]---------|
inner a$:   ----1--2--|
inner b$:              --3--4--|
          mergeAll()
output:   ------1--2-----3--4-------|
```

---

#### Signature

```typescript
mergeAll<O extends ObservableInput<unknown>>(
	concurrent?: number
): OperatorFunction<O, ObservedValueOf<O>>
```

---

#### When to Use

- Flatten a higher-order Observable (Observable of Observables) when all inner subscriptions should run concurrently.
- Process all queued async tasks in parallel when they are represented as Observables.
- Use explicitly when you want `mergeMap` semantics but the projection step is already done upstream.

---

#### Code Example

```typescript
import { of } from 'rxjs'
import { map, mergeAll } from 'rxjs/operators'

interface User {
	id: number
	name: string
}

// Higher-order stream: each source value maps to an Observable
const requests$ = of('alice', 'bob', 'charlie').pipe(
	map((name: string) => fetchUser$(name))  // returns Observable<User>
)

// mergeAll subscribes to all three Observables concurrently
const users$ = requests$.pipe(mergeAll())

users$.subscribe((user: User) => console.log(user))
```

With a `concurrent` limit:

```typescript
import { from } from 'rxjs'
import { map, mergeAll } from 'rxjs/operators'

// Process at most 2 uploads at a time
const uploads$ = from(fileList).pipe(
	map((file: File) => uploadFile$(file)),
	mergeAll(2)  // max 2 concurrent inner subscriptions
)
```

---

#### Gotchas

1. **`mergeAll` = `mergeMap(x => x)`** — `mergeMap` is the idiomatic shorthand. Use `mergeAll` only when you already have a higher-order Observable and do not need an explicit projection.

2. **Outer must emit Observables (or other `ObservableInput`)** — if the outer source emits plain values (not Observables, Promises, or arrays), `mergeAll` will throw. Use `mergeMap` with a projection instead.

3. **Completion semantics** — `mergeAll` does not complete until the outer source completes AND all inner subscriptions finish. An outer source that never completes keeps `mergeAll` alive indefinitely.

4. **`concurrent` default is `Infinity`** — unlimited parallel subscriptions by default. This can exhaust connections or memory if the outer source emits rapidly. Set a sensible limit for resource-constrained scenarios like HTTP requests.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `mergeMap` | Combined project + flatten in one step | You have a plain value to project to an Observable |
| `concatAll` | Serialises inner subscriptions — one at a time in order | Order matters and inners must run sequentially |
| `switchAll` | Unsubscribes from the previous inner when a new one arrives | You only care about the latest inner Observable |
| `exhaustAll` | Ignores new inners while one is active | You want to prevent overlapping inner subscriptions entirely |

---

#### Decision Rule

> Use `mergeAll` when you already hold a higher-order Observable and want **all inners to run concurrently**. Prefer `mergeMap` when you can project and flatten in one step.
