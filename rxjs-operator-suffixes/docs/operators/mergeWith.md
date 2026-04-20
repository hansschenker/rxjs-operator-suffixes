---
operator: mergeWith
family: Combination
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `mergeWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>])`

> The pipeable instance version of `merge` — merges the source Observable with one or more other Observables inside a `pipe()` chain, forwarding all emissions concurrently.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — all values pass through immediately as they arrive |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — every value from every source is forwarded |
| **Completion required** | No — emits as each source emits; completes when all sources (including the piped source) complete |

**Completion behaviour** — identical to `merge`: the output does not complete until all merged sources (the piped Observable and all `otherSources`) have completed. If any source is infinite, the output is infinite.

**Lossy behaviour** — not lossy. All emissions from all sources are forwarded in arrival order.

---

#### Marble Diagram

```
source:    --a-----c-----e--|
other1$:   ----b-----d------|
           mergeWith(other1$)
output:    --a-b---c-d---e--|
```

---

#### Signature

```typescript
mergeWith<T, A extends readonly unknown[]>(
	...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]>
```

**RxJS 7 note:** `mergeWith` was added in RxJS 7. In RxJS 6 you had to use the static `merge` function outside the pipe chain. If you need to support RxJS 6, use `merge(source$, other$)` instead.

---

#### When to Use

- Merge another event stream into an existing pipeline without breaking out of `pipe()`.
- Add an additional trigger to a running Observable mid-chain (e.g. merge a `reset$` into a `state$` pipeline).
- Combine a side-channel Observable with the primary stream without restructuring the pipeline.

---

#### Code Example

```typescript
import { fromEvent, interval } from 'rxjs'
import { mergeWith, map, take } from 'rxjs/operators'

// Combine a timer tick and a manual trigger into one stream
const tick$ = interval(1000).pipe(
	map((): string => 'TICK')
)

const manualTrigger$ = fromEvent(document.getElementById('trigger')!, 'click').pipe(
	map((): string => 'MANUAL')
)

const combined$ = tick$.pipe(
	mergeWith(manualTrigger$),
	take(10)
)

combined$.subscribe((event: string) => {
	console.log(event)  // 'TICK' every second, 'MANUAL' on click
})
```

Inside an MVU effect pipeline:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { mergeWith, map } from 'rxjs/operators'

// Merge a manual refresh trigger into the auto-refresh effect
const refresh$ = autoRefresh$.pipe(
	mergeWith(manualRefresh$),
	map((): Action => ({ type: 'REFRESH_REQUESTED' }))
)
```

---

#### Gotchas

1. **RxJS 7+ only** — `mergeWith` does not exist in RxJS 6. For RxJS 6 compatibility, use the static `merge(source$, other$)` creation function.

2. **Completion behaviour** — if you pipe a finite Observable with `mergeWith(infiniteObs$)`, the result never completes. This catches people off guard when they expect the shorter stream to "win".

3. **Type widening** — the output type is `T | A[number]`, a union of all source types. If sources emit different types, TypeScript will widen to a union, which may require narrowing downstream.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `merge` (static) | Static creation function — not pipeable | Combining streams at the top level, outside an existing pipeline |
| `concatWith` | Pipeable — subscribes to other sources after the piped source completes | Order matters |
| `raceWith` | Pipeable — mirrors only the first-to-emit source | You want the fastest of several candidates |
| `zipWith` | Pipeable — pairs emissions positionally from all sources | You need paired values from each source |

---

#### Decision Rule

> Use `mergeWith` when you want to **merge another stream inside a `pipe()` chain** (RxJS 7+) and ordering between sources does not matter. Prefer the static `merge` when combining streams at the top level or when supporting RxJS 6.
