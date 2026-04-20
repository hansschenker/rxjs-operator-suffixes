---
operator: exhaustMap
family: Transformation
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `exhaustMap<T, R>(project: (value: T, index: number) => ObservableInput<R>)`

> Projects each source value to an Observable, but **ignores new source values entirely while an inner Observable is still active** — the most conservative flattening operator; it exhausts the current inner before accepting anything new.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — ignoring is driven by whether an inner is active, not by timing |
| **Value-sensitive** | Yes — the project function inspects each source value to determine the inner Observable |
| **Lossy** | Yes — source values emitted while an inner Observable is active are silently discarded |
| **Completion required** | No — emits inner values as they arrive; works correctly on infinite sources |

**Completion behaviour** — `exhaustMap` subscribes to the projected inner Observable for the first source value and ignores all subsequent source values until that inner completes. Once the inner completes, the next source value that arrives is processed. The output does not complete until the source completes AND the last active inner completes.

**Lossy behaviour** — `exhaustMap` is lossy with respect to source values. Any source value that arrives while an inner Observable is active is permanently discarded — not queued, not deferred. Only source values that arrive when no inner is active are processed.

---

#### Marble Diagram

```
source:   --a--b--c---------d--e--|
inner a:  --------1--2--|
inner d:                   ----3--|
          exhaustMap(x => inner$)
output:   ----------1--2------3--|
```

`b` and `c` arrive while inner `a` is active — both are discarded.
`e` arrives while inner `d` is active — discarded.
`d` arrives when no inner is active — processed normally.

---

#### Signature

```typescript
exhaustMap<T, R, O extends ObservableInput<unknown>>(
	project: (value: T, index: number) => O
): OperatorFunction<T, ObservedValueOf<O>>
```

---

#### When to Use

- Form submission — prevent double-submission by ignoring clicks while the submit request is in flight.
- Login / authentication — ignore repeated login attempts while one is already processing.
- Destructive actions (delete, clear, reset) — ensure only one execution at a time; discard extra triggers.
- Any "one at a time" operation where **new triggers during execution should be dropped**, not queued.
- Payment processing — never allow a second payment while the first is pending.

---

#### Code Example

```typescript
import { fromEvent } from 'rxjs'
import { exhaustMap, map, tap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface SubmitResult {
	id: number
	status: string
}

const form = document.getElementById('checkout-form') as HTMLFormElement
const submitBtn = document.getElementById('submit') as HTMLButtonElement

// Prevent double-submission: ignore clicks while request is in flight
const submission$ = fromEvent<MouseEvent>(submitBtn, 'click').pipe(
	exhaustMap(() => {
		const payload = new FormData(form)
		return ajax.post<SubmitResult>('/api/checkout', payload).pipe(
			map((res) => res.response),
			tap({
				subscribe: () => submitBtn.setAttribute('disabled', 'true'),
				finalize: () => submitBtn.removeAttribute('disabled')
			})
		)
	})
)

submission$.subscribe({
	next: (result: SubmitResult) => showSuccess(result),
	error: (err: Error) => showError(err.message)
})
```

**MVU / effects context** — `exhaustMap` is the right choice for effects that must not overlap:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { exhaustMap, map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

// Ignore LOGIN_REQUESTED while a login is already in progress
const login$ = actions$.pipe(
	ofType('LOGIN_REQUESTED'),
	exhaustMap(({ payload }) =>
		authenticate$(payload).pipe(
			map((user) => ({ type: 'LOGIN_SUCCESS', payload: user })),
			catchError((err: Error) => of({ type: 'LOGIN_FAILURE', payload: err.message }))
		)
	)
)
```

---

#### Gotchas

1. **Dropped values are silent** — there is no notification when a source value is ignored. If you need to show "request in progress, please wait" feedback, manage that state explicitly (e.g. with a `BehaviorSubject<boolean>` tracking loading state) rather than relying on `exhaustMap` to communicate it.

2. **`exhaustMap` vs `concatMap`** — both prevent overlapping inner subscriptions, but `concatMap` *queues* all source values while `exhaustMap` *discards* them. Use `exhaustMap` when extra triggers should be dropped entirely; use `concatMap` when every trigger must eventually be processed.

3. **The inner must complete for the next value to be accepted** — if the inner Observable never completes (e.g. a `Subject` with no `take`), `exhaustMap` will permanently ignore all subsequent source values after the first. Always ensure inner Observables complete.

4. **Not a debounce substitute** — `exhaustMap` ignores values during an active inner, which is driven by the inner's duration, not by a time window. For time-based rate limiting, use `debounceTime` or `throttleTime`.

5. **Error in the inner terminates the pipeline** — unlike the "ignore while busy" for new values, an error from the active inner propagates to the output and terminates the stream unless caught with `catchError` inside the projection.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `concatMap` | Queues all source values; processes every one in order | Every trigger must be processed; order matters |
| `switchMap` | Cancels the active inner when a new source value arrives | Only the latest trigger matters; stale work should be cancelled |
| `mergeMap` | All inners run concurrently; no source values are dropped | Every trigger must be processed; order does not matter |
| `exhaustAll` | Same semantics but for a higher-order Observable | You already have an Observable of Observables |

---

#### Decision Rule

> Use `exhaustMap` when **only one inner Observable should run at a time and new triggers while busy must be discarded** (form submit, login, payment). Prefer `concatMap` when every trigger must be processed in order, and `switchMap` when only the latest trigger matters.
