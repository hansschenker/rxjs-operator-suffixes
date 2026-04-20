---
operator: concatMap
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `concatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>)`

> Projects each source value to an Observable and subscribes to them one at a time in order — each projected Observable must complete before the next source value is processed, preserving strict sequential execution.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — subscribes to projected Observables in source order regardless of timing |
| **Value-sensitive** | Yes — the project function inspects each source value to determine the inner Observable |
| **Lossy** | No — every source value is queued and projected; nothing is dropped |
| **Completion required** | No — emits inner values as they arrive; queues subsequent source values until the current inner completes |

**Completion behaviour** — `concatMap` processes source values one at a time. When the source emits a value, it projects it to an inner Observable and subscribes. Any subsequent source values emitted while that inner is active are queued. The output does not complete until the source completes AND the last inner completes. If any inner never completes, all queued source values are blocked indefinitely.

**Lossy behaviour** — not lossy. Every source value is queued and will eventually be projected. No source values are dropped, unlike `switchMap` (cancels) or `exhaustMap` (ignores).

---

#### Marble Diagram

```
source:   --a--------b--------c--|
inner a:  ---1--2--|
inner b:            ---3--4--|
inner c:                      ---5--|
          concatMap(x => inner$)
output:   ----1--2-----3--4-----5--|
```

If source emits while an inner is active, the value is queued:
```
source:   --a--b--c--|
inner a:  --------1--|
inner b:             --------2--|
inner c:                        --------3--|
output:   --------1-----------2-----------3--|
```

---

#### Signature

```typescript
concatMap<T, R, O extends ObservableInput<unknown>>(
	project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>
```

---

#### When to Use

- Execute HTTP requests triggered by user actions in the exact order they were triggered (e.g. adding items to a cart one by one).
- Process a queue of operations where each must complete before the next starts (e.g. sequential file uploads, ordered animations).
- Implement a command queue where order of execution must match order of dispatch.
- Save form changes sequentially to avoid race conditions where a later save could overwrite a slower earlier one.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { concatMap, map } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface CartItem {
	id: number
	name: string
}

// Each "Add to cart" click sends a request; requests are serialised in click order
const addToCart$ = fromEvent<MouseEvent>(
	document.querySelectorAll('.add-btn'),
	'click'
).pipe(
	map((e: MouseEvent) => Number((e.currentTarget as HTMLElement).dataset['itemId'])),
	concatMap((id: number) =>
		ajax.post<CartItem>('/api/cart', { itemId: id }).pipe(
			map((res) => res.response)
		)
	)
)

addToCart$.subscribe((item: CartItem) => {
	console.log('Added to cart:', item)
})
```

**MVU / effects context** — use `concatMap` for effects where order of execution must match order of dispatch:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { concatMap, map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

// Process SAVE_STEP actions in strict order — step 1 must finish before step 2 starts
const saveStep$ = actions$.pipe(
	ofType('SAVE_STEP'),
	concatMap(({ payload }) =>
		saveStep$(payload).pipe(
			map(() => ({ type: 'SAVE_STEP_SUCCESS', payload })),
			catchError((err: Error) => of({ type: 'SAVE_STEP_FAILURE', payload: err.message }))
		)
	)
)
```

---

#### Gotchas

1. **Back-pressure builds up silently** — if the source emits faster than inner Observables complete, the internal queue grows unboundedly. Unlike `switchMap` or `exhaustMap`, `concatMap` never drops values; a flooded queue can exhaust memory. Consider adding `throttle` or `debounce` upstream if the source is high-frequency.

2. **Any non-completing inner blocks all subsequent values** — if a projected inner Observable never completes (e.g. a `Subject` without a `take`), all subsequent source values remain queued forever. Always ensure inner Observables complete.

3. **Not the same as sequential `mergeMap(x, 1)`** — `mergeMap` with `concurrent: 1` is functionally identical to `concatMap`. They produce the same behaviour, but `concatMap` communicates intent more clearly and should be preferred.

4. **Use `switchMap` for live/search scenarios** — if the user types in a search box and you use `concatMap`, old requests are not cancelled; results from stale queries will appear in order, possibly after a long delay. Use `switchMap` when only the latest result matters.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `mergeMap` | All inners run concurrently; order of results not guaranteed | Order does not matter; you want maximum throughput |
| `switchMap` | Cancels the previous inner when a new source value arrives | Only the latest result matters (search, live data) |
| `exhaustMap` | Ignores new source values while an inner is active | One operation at a time; new triggers are discarded |
| `concatAll` | Same semantics but takes a higher-order Observable | You already have an Observable of Observables |

---

#### Decision Rule

> Use `concatMap` when every source value must be processed **in the exact order it was emitted** and each inner must complete before the next starts. Prefer `mergeMap` for parallel execution, `switchMap` when only the latest matters, and `exhaustMap` when new values should be ignored while busy.
