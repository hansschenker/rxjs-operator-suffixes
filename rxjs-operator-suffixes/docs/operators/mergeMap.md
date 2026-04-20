---
operator: mergeMap
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `mergeMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number)`

> Projects each source value to an Observable using the provided function, then subscribes to all resulting Observables concurrently and emits all their values — the most permissive flattening operator.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — subscribes to each projected Observable immediately regardless of timing |
| **Value-sensitive** | Yes — the project function inspects each source value to determine the inner Observable |
| **Lossy** | No — all inner Observables are subscribed to (or queued with a `concurrent` limit) and all their emissions are forwarded |
| **Completion required** | No — emits on every inner emission; completes when the source completes and all inner subscriptions finish |

**Completion behaviour** — `mergeMap` subscribes to each projected inner Observable as the source emits. The output does not complete until the source Observable completes AND every active inner subscription has also completed. If the source never completes, `mergeMap` never completes either.

**Lossy behaviour** — `mergeMap` is not lossy. Every source value is projected to an inner Observable and every emission from every inner is forwarded. With a `concurrent` limit, excess inner Observables are queued (not dropped) and processed in order as slots become available.

---

#### Marble Diagram

```
source:   --a---------b--------|
inner a:  ---1--2--3|
inner b:             --4--5|
          mergeMap(x => inner$)
output:   -----1--2--3--4--5---|
```

Both inners run concurrently — inner b starts while inner a is still active:
```
source:   --a----b---------|
inner a:  ---1--------2---|
inner b:       ---3--4--|
output:   -----1-3--4--2---|
```

---

#### Signature

```typescript
mergeMap<T, R, O extends ObservableInput<unknown>>(
	project: (value: T, index: number) => O,
	concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>
```

Also exported as `flatMap` (alias — same operator, not deprecated).

**RxJS 7 note:** the `resultSelector` second argument was deprecated in RxJS 6 and removed in RxJS 7. Replace `mergeMap(project, resultSelector)` with `mergeMap(x => project(x).pipe(map(y => resultSelector(x, y))))`.

---

#### When to Use

- Fire multiple HTTP requests in parallel when the order of results does not matter (e.g. loading a list of user profiles by ID).
- Handle events that trigger independent async operations where all must complete (e.g. saving multiple items concurrently).
- Subscribe to a separate WebSocket channel per user ID and forward all messages to a single stream.
- Process all items in a batch without enforcing sequence.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { mergeMap, map } from 'rxjs/operators'

interface User {
	id: number
	name: string
}

const userId$ = fromEvent<MouseEvent>(document.querySelectorAll('.user-card'), 'click').pipe(
	map((e: MouseEvent) => Number((e.currentTarget as HTMLElement).dataset['userId']))
)

// Each click triggers a separate HTTP request; all run concurrently
const user$ = userId$.pipe(
	mergeMap((id: number) => fetchUser$(id))
)

user$.subscribe((user: User) => {
	console.log('Loaded user:', user)
})
```

With a `concurrent` limit to throttle parallel requests:

```typescript
import { from } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

// Process files with at most 3 concurrent uploads
const results$ = from(files).pipe(
	mergeMap((file: File) => uploadFile$(file), 3)
)
```

**MVU / effects context** — `mergeMap` is the right choice for effects where actions are independent and may overlap:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { mergeMap, map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

const saveNote$ = actions$.pipe(
	ofType('SAVE_NOTE'),
	mergeMap(({ payload }) =>
		saveNote$(payload).pipe(
			map(() => ({ type: 'SAVE_NOTE_SUCCESS', payload })),
			catchError((err: Error) => of({ type: 'SAVE_NOTE_FAILURE', payload: err.message }))
		)
	)
)
```

---

#### Gotchas

1. **Use `switchMap` for search / live queries** — `mergeMap` keeps all inner subscriptions alive. For a search typeahead, a new search term should cancel the previous request; use `switchMap` instead.

2. **Response ordering is not guaranteed** — since all inner Observables run concurrently, their results arrive in completion order, not source order. If you need ordered results, use `concatMap`.

3. **`concurrent` default is `Infinity`** — unlimited parallel inner subscriptions. For HTTP requests this can quickly hit browser connection limits or rate-limit the server. Set a sensible ceiling (e.g. `3`).

4. **Memory leak risk with long-lived inner Observables** — if the source emits rapidly and inner Observables never complete (e.g. WebSocket channels), active subscriptions accumulate indefinitely. Use `takeUntil` inside the inner or set a `concurrent` limit.

5. **`resultSelector` removed in RxJS 7** — if upgrading from RxJS 6, replace `mergeMap(project, resultSelector)` with `mergeMap(x => project(x).pipe(map(y => resultSelector(x, y))))`.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `switchMap` | Cancels the previous inner when a new source value arrives | Only the latest result matters (search, live data) |
| `concatMap` | Queues inner Observables and runs them one at a time in order | Order of results must match order of source values |
| `exhaustMap` | Ignores new source values while an inner Observable is active | One operation at a time; extras are discarded (form submit) |
| `mergeAll` | Same semantics but takes a higher-order Observable directly | You already have an Observable of Observables |

---

#### Decision Rule

> Use `mergeMap` when every source value must be processed and **order of results does not matter**. Prefer `switchMap` for live queries, `concatMap` when ordering is required, and `exhaustMap` when overlapping requests must be prevented entirely.
