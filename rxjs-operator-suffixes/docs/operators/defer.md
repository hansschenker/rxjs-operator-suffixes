---
operator: defer
family: Creation
arity: unary
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
backpressure: none
schedulerAware: false
multicast: unicast
errorPropagation: forward
subscriptionLifecycle: perSubscriber
purity: pure
synchronicity: syncByDefault
templateVersion: v2
date: 2026-04-17
---

### `defer<R>(observableFactory: () => R): Observable<ObservedValueOf<R>>`

> Delays the creation of the inner Observable until subscribe time, calling `observableFactory()` per subscriber — the idiomatic way to get a fresh source for each subscription.

---

#### Policies

| Policy | Value |
|--------|-------|
| **Family** | Creation |
| **Arity** | Unary (takes one factory function) |
| **Time-sensitive** | No (depends on what the factory returns) |
| **Value-sensitive** | No |
| **Lossy** | No |
| **Completion required** | No (follows the inner Observable) |
| **Backpressure policy** | None |
| **Scheduler-aware** | No (inherits from inner Observable) |
| **Multicast** | Unicast — each subscriber triggers its own factory call |
| **Error propagation** | Forward — factory errors become stream errors |
| **Subscription lifecycle** | Per-subscriber — fresh inner for every subscription |
| **Purity** | Pure (factory itself may or may not be; intended use is for side-effect-scoped creation) |
| **Synchronicity** | Sync-by-default |

**Completion behaviour** — On each `.subscribe()`, the factory is called and the returned `ObservableInput` is converted via `from()` and subscribed. Completion/error flows from the inner Observable. If the factory throws synchronously, the error is delivered as a stream error.

**Lossy behaviour** — Not lossy.

---

#### ASCII Marble Diagram

```
subscriber A subscribes:    | (factory called) --a1--a2--|
subscriber B subscribes:                 | (factory called, FRESH) --b1--b2--|

             defer(() => makeHttpRequest())
             Each subscribe → fresh HTTP call.
```

---

#### Mermaid Marble Diagram

```mermaid
flowchart LR
    subgraph subA["subscriber A ──▶ time"]
        direction LR
        fA[factory() A]:::quiet --> aInner((a)):::emit --> aEnd([ ▮ ]):::done
    end
    subgraph subB["subscriber B ──▶ time"]
        direction LR
        fB[factory() B]:::quiet --> bInner((a)):::emit --> bEnd([ ▮ ]):::done
    end
    subA ~~~ subB
    classDef emit fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
    classDef quiet fill:#fef3c7,stroke:#d97706,color:#000,font-style:italic
    classDef done fill:#1f2937,stroke:#000,color:#fff
```

---

#### Signature

```typescript
export function defer<R extends ObservableInput<unknown>>(
	observableFactory: () => R
): Observable<ObservedValueOf<R>>
```

The factory may return anything `ObservableInput` accepts — Observable, Promise, array, async iterable.

---

#### Five Use Cases

- **Fresh Promise per subscriber** — wrap a `Promise` so each subscribe triggers a new HTTP request, not a cached resolve
- **Conditional Observable selection** — decide at subscribe time which of several Observables to use (`Math.random()`, feature flag, session state)
- **Captured-state snapshots** — include a subscribe-time `Date.now()` or counter in the emitted value without closure pollution
- **Lazy resource creation** — defer construction of an expensive source until someone actually subscribes
- **Composable with `repeat`** — `defer(() => httpCall()).pipe(repeat({ delay: 5000 }))` polls with a fresh request per cycle

---

#### Primary Code Sample

```typescript
import { defer, repeat, Observable } from 'rxjs'

// Scenario: fresh Promise per subscriber — polling with defer + repeat
interface Status {
	ok: boolean
}

async function checkStatus(): Promise<Status> {
	const r = await fetch('/api/status')
	return r.json()
}

const polled$: Observable<Status> = defer((): Promise<Status> => checkStatus()).pipe(
	repeat({ delay: 5000 })
)

polled$.subscribe((s: Status): void => console.log('status:', s.ok))
```

The `defer` + `repeat` combination is **the** canonical polling pattern. Without `defer`, the Promise would be created once and cached — every repeat cycle would resolve the same stale Promise.

---

#### Gotchas

1. **Promises are only valid in `defer`** — `from(promise)` creates an Observable that resolves the Promise once, then every subscriber gets the cached result. `defer(() => promise)` creates a new Promise per subscribe. Use the latter for fresh HTTP/IO work.
2. **Factory errors become stream errors** — a synchronous throw inside the factory triggers the subscriber's `error` handler. No special handling needed; standard error semantics.
3. **Subscribe-time `Date.now()` stays subscribe-time** — if you use `defer(() => of(Date.now()))`, each subscriber gets the timestamp at *their* subscription. Useful but subtle.
4. **Not the same as `from(asyncFn())`** — calling the async function immediately runs it. `defer(() => asyncFn())` defers the call until subscribe.
5. **Factory runs on *every* subscribe** — for shared subscriptions (cached HTTP call), wrap the defer in `shareReplay(1)` so the factory fires once.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `from(promise)` | Caches the promise's resolution | You want one-time Promise interop |
| `of` | Emits static values, no factory | Values are known ahead of subscribe |
| `iif` | Binary conditional, specialised `defer` | You have two Observables to choose between |
| `Observable.create` / `new Observable` | Full manual control | You need custom subscription logic |

---

#### Decision Rule

> Use `defer(factory)` when **each subscribe should run the factory fresh** — new Promise, new HTTP call, new `Date.now()`. Prefer `from(promise)` when you want Promise caching, or `iif` for a two-way boolean branch.
