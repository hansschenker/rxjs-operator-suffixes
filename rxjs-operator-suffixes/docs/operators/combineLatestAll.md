---
operator: combineLatestAll
family: Combination
lossy: false
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-27
---

### `combineLatestAll<T, R>(project?): OperatorFunction<ObservableInput<T>, T[] | R>`

> Flattens a higher-order Observable of sources by applying `combineLatest` logic across all inner Observables — emitting arrays of their latest values whenever any inner emits, but only after the outer Observable has completed and every inner has emitted at least once.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — reacts to *which* inner emits, not *when* |
| **Value-sensitive** | No — emits regardless of value content |
| **Lossy** | No — slot-overwrite behaviour; every slot is always represented in each emission |
| **Completion required** | Yes (outer) / No (inners) — the outer must complete before combined emissions begin; inner Observables may run indefinitely |

**Completion behaviour** — `combineLatestAll` subscribes to each inner Observable as the outer emits it. However, it cannot start emitting combined values until the outer Observable **completes**, because until then a new inner could arrive that hasn't emitted yet, which would invalidate any partially combined output. Once the outer completes, `combineLatestAll` waits until every collected inner has emitted at least once, then begins emitting combined arrays on each subsequent inner emission. Inner Observables do not need to complete — the combined stream continues as long as at least one inner is active.

**Lossy behaviour** — Not lossy. Each inner Observable holds a slot; rapid successive emissions overwrite the slot but the slot value is always forwarded on the next emission from any inner. You may not observe every intermediate combination, but no values are silently discarded.

---

#### Marble Diagram

```
outer$:  --(a$)--(b$)--|
a$:           ----1--------2---3
b$:                ---10----20
         combineLatestAll()
output:  ---------[1,10]-[2,10]-[2,20]-[3,20]
```

- The outer completes after emitting `a$` and `b$`.
- The first combined emission `[1,10]` fires once both inner Observables have each emitted once.
- Subsequent emissions fire on every inner emission using the latest value from the other slot.

---

#### Signature

```typescript
// RxJS 7 — no project function
combineLatestAll<T>(): OperatorFunction<ObservableInput<T>, T[]>

// With project function (maps the combined array to a single value)
combineLatestAll<T, R>(
  project: (...values: T[]) => R
): OperatorFunction<ObservableInput<T>, R>
```

> **RxJS 6 note:** This operator was called `combineAll()` in RxJS 6. `combineLatestAll` is the RxJS 7 rename. The `project` overload still exists in RxJS 7 but is commonly replaced with `.pipe(map(...))` for clarity.

---

#### When to Use

- The number of source Observables is **not known at composition time** — it is determined at runtime (e.g. one Observable per active user, per open WebSocket, per dynamic form field).
- You have a stream of streams (e.g. from `map(() => http.get(...))`) and want to combine all responses once all requests have resolved.
- Building a parallel data-fetching layer where the set of resources to fetch is itself reactive.
- Combining per-row edit streams in a dynamic table where rows can be added at runtime before the "fetch" action fires.

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { map, combineLatestAll } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface Endpoint { url: string; label: string }

const endpointList: Endpoint[] = [
	{ url: '/api/users', label: 'users' },
	{ url: '/api/posts', label: 'posts' },
	{ url: '/api/tags',  label: 'tags'  },
]

// from() completes after emitting all three — satisfies the outer-complete requirement
const combined$ = from(endpointList).pipe(
	map((e: Endpoint) => ajax.getJSON<unknown>(e.url)),
	combineLatestAll()
)

// Emits [usersResponse, postsResponse, tagsResponse] and continues
// updating whenever any endpoint re-emits (if using polling Observables)
combined$.subscribe((results: unknown[]) => {
	endpointList.forEach((e, i) => console.log(e.label, results[i]))
})
```

MVU context — combining per-entity state streams whose count is dynamic:

```typescript
import { Subject, from } from 'rxjs'
import { map, combineLatestAll, switchMap } from 'rxjs/operators'

interface EntityId { id: string }

const selectedIds$ = new Subject<EntityId[]>()

// Each time the selected set changes, spin up one state$ per entity
const combinedEntityState$ = selectedIds$.pipe(
	switchMap((ids: EntityId[]) =>
		from(ids).pipe(
			map(({ id }) => entityStateRegistry.get(id)),  // returns Observable<EntityState>
			combineLatestAll()
		)
	)
)
```

---

#### Gotchas

1. **Outer must complete — an infinite outer means no emissions ever** — If the outer Observable never completes (e.g. a `Subject` that keeps emitting new inner Observables), `combineLatestAll` will never emit. Ensure the outer completes with `take(n)`, `first()`, or `from([...])`.

2. **Late-arriving inners reset the "all-emitted" gate** — Each new inner that arrives before the outer completes adds a new slot. Every existing slot must re-emit (or already have a cached latest value) for the combined output to fire. If inner Observables are slow starters, the startup delay compounds.

3. **RxJS 6 rename: `combineAll` → `combineLatestAll`** — The old name still works in some builds but is removed in RxJS 7 strict builds. The `project` overload is identical; swap the import.

4. **Memory growth with many inners** — Each inner Observable retains its latest value in a slot for the lifetime of the combined stream. With many long-lived inners, this can grow. Pair with `takeUntil` or `take` on the combined stream to control lifetime.

5. **Not the same as `mergeAll` or `concatAll`** — Those operators process inners sequentially/concurrently but emit each inner's values individually. `combineLatestAll` always emits a *combined array snapshot*, never individual values from a single inner.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `combineLatest` | Static — sources known at composition time | You know exactly which Observables to combine upfront |
| `combineLatestWith` | Pipeable static form | You're inside a `pipe()` chain with a fixed set of additional sources |
| `forkJoin` (static) | Emits once, after **all** inners complete | One-shot parallel requests; you only need the final values, not ongoing updates |
| `mergeAll` | Forwards each inner's emissions independently | You want a flat stream of events from many sources, not a combined snapshot |
| `zipAll` | Pairs inner emissions positionally (1st with 1st) | Strict turn-by-turn synchronisation across all inners |
| `switchAll` | Unsubscribes from the previous inner when a new one arrives | You only care about the **latest** inner at any time |

---

#### Decision Rule

> Use `combineLatestAll` when the **set of sources is determined at runtime** and you need a continuously updated combined snapshot once that set is known. Prefer the static `combineLatest([...])` when sources are fixed at composition time — it is simpler and has no outer-completion requirement.
