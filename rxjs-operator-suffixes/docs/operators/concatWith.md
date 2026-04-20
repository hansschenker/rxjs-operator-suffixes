---
operator: concatWith
family: Combination
lossy: false
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `concatWith<T, A extends readonly unknown[]>(...otherSources: [...ObservableInputTuple<A>])`

> The pipeable instance version of `concat` — appends one or more Observables to the source inside a `pipe()` chain, subscribing to each only after the previous completes.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Combination |
| **Time-sensitive** | No — ordering is defined by subscription sequence, not by when values arrive |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — every value from every source is forwarded |
| **Completion required** | Yes — the piped source must complete before `otherSources` are subscribed to, and each subsequent source must complete before the next starts |

**Completion behaviour** — identical to `concat`: the piped Observable runs first to completion, then `otherSources` are subscribed in order, each waiting for the previous to complete. The output completes only after the last source completes. If any source never completes, all subsequent sources are never subscribed.

**Lossy behaviour** — not lossy. Every value from every source in the sequence is forwarded to the output.

---

#### Marble Diagram

```
source:    --a--b--|
other1$:            --c--d--|
other2$:                     --e--|
           concatWith(other1$, other2$)
output:    --a--b--c--d--e--|
```

---

#### Signature

```typescript
concatWith<T, A extends readonly unknown[]>(
	...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, T | A[number]>
```

**RxJS 7 note:** `concatWith` was added in RxJS 7. In RxJS 6 you had to use the static `concat` function outside the pipe chain.

---

#### When to Use

- Append a follow-up Observable to an existing pipeline without breaking out of `pipe()`.
- Chain a completion notification or cleanup stream after a finite Observable.
- Append a "done" sentinel value or completion stream after the main data stream.
- Use inside a larger operator composition where the source is already mid-pipeline.

---

#### Code Example

```typescript
import { of, EMPTY } from 'rxjs'
import { concatWith, map, finalize } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface Status {
	phase: 'data' | 'done'
	value?: string
}

// Fetch data, then emit a 'done' sentinel value
const result$ = ajax.getJSON<string[]>('/api/items').pipe(
	map((items: string[]): Status => ({ phase: 'data', value: items.join(', ') })),
	concatWith(of<Status>({ phase: 'done' }))
)

result$.subscribe((status: Status) => {
	if (status.phase === 'done') {
		console.log('Stream complete')
	} else {
		console.log('Data:', status.value)
	}
})
```

Inside an MVU init sequence using `pipe()`:

```typescript
import { of } from 'rxjs'
import { concatWith, scan, shareReplay } from 'rxjs/operators'

// Emit initial state first, then transition to action-driven state
const state$ = of(initialState).pipe(
	concatWith(
		actions$.pipe(scan(reducer, initialState))
	),
	shareReplay(1)
)
```

---

#### Gotchas

1. **RxJS 7+ only** — `concatWith` does not exist in RxJS 6. For RxJS 6 compatibility, use the static `concat(source$, other$)` creation function.

2. **Piped source must complete** — if the source Observable is infinite (e.g. a live `Subject`), the `otherSources` are never subscribed to. This is the same pitfall as `concat` but can be less obvious inside a pipeline.

3. **Type widening** — the output type is `T | A[number]`, a union of all source types. If sources emit different types, TypeScript widens to a union which may require narrowing downstream.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `concat` (static) | Static creation function — not pipeable | Combining streams at the top level, outside an existing pipeline |
| `mergeWith` | Pipeable — subscribes to all sources concurrently | Order does not matter |
| `startWith` | Prepends synchronous values *before* the source | You need to prepend, not append |
| `endWith` | Appends synchronous scalar values after the source completes | You only need to append static values, not Observables |

---

#### Decision Rule

> Use `concatWith` when you want to **append another stream after the source inside a `pipe()` chain** (RxJS 7+) with strict sequential ordering. Prefer the static `concat` when combining at the top level or supporting RxJS 6.
