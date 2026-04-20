---
operator: retry
family: Error Handling
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `retry<T>(count?: number | RetryConfig)`

> Resubscribes to the source Observable when it errors, up to `count` times — automatically re-executing the entire source on failure.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Error Handling |
| **Time-sensitive** | No — retries are triggered by errors, not by timing (use `RetryConfig.delay` for timed backoff) |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — all values emitted before the error are forwarded; the source is re-executed from scratch on retry |
| **Completion required** | No — operates on error events, not completion; works on both finite and infinite sources |

**Completion behaviour** — `retry` does not affect normal completion. If the source completes without error, the output completes immediately. Retry logic only activates on error. If the source errors after emitting some values, those values have already been forwarded — retry re-subscribes from the start, so values may be emitted multiple times across retries.

**Lossy behaviour** — `retry` is not lossy with respect to successful emissions. However, any values emitted by a failed attempt are forwarded to downstream before the retry — downstream may receive duplicate values if the source emits before erroring. Design sources to be idempotent when using `retry`.

---

#### Marble Diagram

```
source:   --1--2--X              (errors)
retry 1:           --1--2--X    (errors again)
retry 2:                    --1--2--3--|
          retry(2)
output:   --1--2-----1--2-----1--2--3--|
```

If all retries are exhausted, the final error propagates:
```
source:   --1--X
          retry(1)
output:   --1----1--X   (error propagates after 1 retry)
```

---

#### Signature

```typescript
// Simple count
retry<T>(count?: number): MonoTypeOperatorFunction<T>

// Config object (RxJS 7+)
retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>

interface RetryConfig {
	count?: number           // max retries (default: Infinity)
	delay?: number | ((error: unknown, retryCount: number) => ObservableInput<unknown>)
	resetOnSuccess?: boolean // reset retry counter after a successful emission (default: false)
}
```

**RxJS 7 note:** the `RetryConfig` object form was added in RxJS 7. In RxJS 6, only the numeric `count` argument was available. For timed backoff in RxJS 6, use `retryWhen`.

---

#### When to Use

- Retry a flaky HTTP request a fixed number of times before propagating the error.
- Re-establish a WebSocket connection automatically on disconnect.
- Retry a database query on transient network errors.
- Implement simple exponential backoff using `RetryConfig.delay` with a function (RxJS 7+).
- Retry indefinitely (`retry()` with no argument) for a connection that must stay alive.

---

#### Code Example

```typescript
import { ajax } from 'rxjs/ajax'
import { retry, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

interface User {
	id: number
	name: string
}

// Retry up to 3 times on network error before giving up
const user$ = ajax.getJSON<User>('/api/user/1').pipe(
	retry(3),
	catchError((err: Error) => {
		console.error('All retries exhausted:', err.message)
		return of(null)
	})
)

user$.subscribe((user: User | null) => {
	if (user) renderUser(user)
})
```

Exponential backoff with `RetryConfig` (RxJS 7+):

```typescript
import { ajax } from 'rxjs/ajax'
import { retry, catchError } from 'rxjs/operators'
import { timer } from 'rxjs'
import { of } from 'rxjs'

interface ApiResponse {
	data: string[]
}

const data$ = ajax.getJSON<ApiResponse>('/api/data').pipe(
	retry({
		count: 4,
		delay: (_error: unknown, retryCount: number) =>
			timer(Math.min(1000 * 2 ** retryCount, 30_000))  // 2s, 4s, 8s, 16s (capped at 30s)
	}),
	catchError((err: Error) => of({ data: [] } as ApiResponse))
)
```

**MVU / effects context** — wrap retries inside the inner Observable of `switchMap`/`mergeMap` so errors don't kill the outer effect stream:

```typescript
import { actions$ } from './store'
import { ofType } from './utils'
import { switchMap, map, retry, catchError } from 'rxjs/operators'
import { of } from 'rxjs'

const loadUser$ = actions$.pipe(
	ofType('LOAD_USER'),
	switchMap(({ payload }) =>
		fetchUser$(payload.id).pipe(
			retry(2),   // retry inside the inner — outer stream stays alive on failure
			map((user) => ({ type: 'USER_LOADED', payload: user })),
			catchError((err: Error) => of({ type: 'USER_LOAD_FAILED', payload: err.message }))
		)
	)
)
```

---

#### Gotchas

1. **Always put `retry` inside the inner Observable of flattening operators** — if you place `retry` on the outer `actions$` stream, a single error terminates the entire effect pipeline permanently. Wrap `retry` (and `catchError`) inside the `switchMap`/`mergeMap` projection so only the failed inner is retried, not the whole stream.

2. **The source is re-subscribed from scratch on each retry** — cold Observables (HTTP requests, timers) re-execute entirely. Hot Observables (Subjects, shared streams) may not replay missed values. For HTTP, this is usually correct; for hot sources, consider whether re-subscription is the right recovery strategy.

3. **Downstream may receive duplicate values** — if the source emits values before erroring, those are forwarded downstream on every retry attempt. Ensure downstream handlers are idempotent (e.g. use `upsert` semantics on state updates).

4. **`retry()` with no argument retries infinitely** — `retry()` defaults to `count: Infinity`. An error-looping source (one that immediately errors on every subscription) will spin indefinitely, pegging CPU. Always set a finite `count` for production HTTP use cases or add a `delay` to prevent spin-loops.

5. **`resetOnSuccess: true` in RetryConfig** — by default, the retry counter does not reset after a successful emission. On a long-running stream that occasionally errors, `resetOnSuccess: true` allows it to keep retrying indefinitely as long as it succeeds between errors. Be intentional about which behaviour you want.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `retryWhen` | Full control over retry logic via a notifier Observable | You need custom backoff, conditional retry, or RxJS 6 compatibility |
| `catchError` | Catches the error and replaces the stream with a fallback | You want to recover with a default value, not retry the source |
| `timeout` | Errors the stream if no emission arrives within a time window | You want to treat slow responses as errors before retrying |
| `repeat` | Re-subscribes on *completion* (not on error) | You want to loop a successful stream, not recover from failure |

---

#### Decision Rule

> Use `retry(n)` for **simple fixed-count retry with optional timed backoff** (RxJS 7+ `RetryConfig`). Use `retryWhen` for complex retry logic in RxJS 6, or when retry conditions depend on the error type. Always scope `retry` to the inner Observable in effect pipelines.
