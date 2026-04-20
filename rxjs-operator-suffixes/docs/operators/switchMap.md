---
operator: switchMap
family: Transformation
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `switchMap<T, R>(project: (value: T, index: number) => ObservableInput<R>)`

> Projects each source value to an Observable and subscribes to it, **cancelling and unsubscribing from the previous inner Observable** whenever a new source value arrives — only the most recent inner is ever active.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — cancellation is driven by new source values arriving, not by timing |
| **Value-sensitive** | Yes — the project function inspects each source value to determine the inner Observable |
| **Lossy** | Yes — all emissions from any cancelled inner Observable are silently discarded |
| **Completion required** | No — emits inner values as they arrive; works correctly on infinite sources |

**Completion behaviour** — `switchMap` subscribes to the inner Observable returned by `project` for each source value. If a new source value arrives before the current inner completes, the current inner is immediately unsubscribed and a new inner is started. The output does not complete until the source completes AND the last active inner completes.

**Lossy behaviour** — `switchMap` is lossy with respect to inner emissions. Any values that the cancelled inner would have emitted after cancellation are permanently lost. The source values themselves are not lost — each one starts a new inner — but only the last inner's emissions reach the output.

---

#### Marble Diagram

```
source:   --a-------b----c------------|
inner a:  ---1--2--3|
inner b:            ---4--5|
inner c:                 ---6--7--8--|
          switchMap(x => inner$)
output:   ----1--2-----4----6--7--8--|
```

When `b` arrives, inner `a` is cancelled — its value `3` is never emitted.
When `c` arrives, inner `b` is cancelled — its value `5` is never emitted.

---

#### Signature

```typescript
switchMap<T, R, O extends ObservableInput<unknown>>(
	project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>
```

**RxJS 7 note:** the `resultSelector` second argument was deprecated in RxJS 6 and removed in RxJS 7. Replace `switchMap(project, resultSelector)` with `switchMap(x => project(x).pipe(map(y => resultSelector(x, y))))`.

---

#### When to Use

- Search typeahead — cancel the previous HTTP request when the user types a new character.
- Live route data — when navigating to a new route, cancel any in-flight requests for the previous route.
- Real-time filtering — switch to a new data stream when the filter criteria change.
- Auto-save with debounce — switch to a new save request each time the debounced value changes, cancelling any pending save.
- Polling that restarts when configuration changes — switch to a new poll interval whenever settings are updated.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { switchMap, map, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface SearchResult {
	id: number
	title: string
}

const input = document.getElementById('search') as HTMLInputElement

// Classic search typeahead — each new term cancels the previous request
const results$ = fromEvent<Event>(input, 'input').pipe(
	map((e: Event) => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
	switchMap((term: string) =>
		ajax.getJSON<SearchResult[]>(`/api/search?q=${encodeURIComponent(term)}`)
	)
)

results$.subscribe((results: SearchResult[]) => renderResults(results))
```

**MVU / effects context** — `switchMap` is the standard choice for query-style effects where only the latest result matters:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { switchMap, map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

// Re-fetch whenever the active filter changes; cancel previous fetch
const loadItems$ = actions$.pipe(
	ofType('FILTER_CHANGED'),
	switchMap(({ payload }) =>
		fetchItems$(payload.filter).pipe(
			map((items) => ({ type: 'ITEMS_LOADED', payload: items })),
			catchError((err: Error) => of({ type: 'ITEMS_LOAD_FAILED', payload: err.message }))
		)
	)
)
```

---

#### Gotchas

1. **Cancelled inner errors are also swallowed** — if the cancelled inner Observable was about to error, that error is silently discarded along with its emissions. Only errors from the *currently active* inner propagate to the output.

2. **Not safe for operations that must not be interrupted** — do not use `switchMap` for form submissions, payments, or any write operation where partial execution is dangerous. Use `exhaustMap` (ignore new while busy) or `concatMap` (queue and execute all) instead.

3. **Unsubscription does not cancel network requests by default** — cancelling the inner subscription stops RxJS from delivering the result, but the underlying HTTP request may still complete on the server. Use `ajax` from `rxjs/ajax` (which uses `XMLHttpRequest` and *can* abort) or `fetch` with an `AbortController` wired to the teardown if true cancellation is needed.

4. **`switchMap(x => of(x))` is not the same as `map`** — the inner `of(x)` completes synchronously, so in practice it behaves like `map`, but it introduces an unnecessary async boundary and is confusing. Use `map` directly.

5. **Source completion while inner is active** — if the source completes while an inner Observable is still running, `switchMap` keeps the inner alive until it completes. The output then completes. This is correct but surprises people who expect source completion to immediately complete the output.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `mergeMap` | Keeps all inner subscriptions active concurrently | Every result matters; order is not important |
| `concatMap` | Queues inners; runs one at a time in source order | Every result matters; strict ordering is required |
| `exhaustMap` | Ignores new source values while an inner is active | Must not overlap; new triggers are discarded |
| `switchAll` | Same cancel-on-new behaviour but for a higher-order Observable | You already have an Observable of Observables |

---

#### Decision Rule

> Use `switchMap` when **only the result of the most recent source value matters** and stale in-flight work should be cancelled. Prefer `concatMap` when every result is needed in order, `mergeMap` when all results are needed concurrently, and `exhaustMap` when new triggers must be blocked while busy.
