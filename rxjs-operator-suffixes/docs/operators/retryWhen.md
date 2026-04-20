---
operator: retryWhen
family: Error Handling
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `retryWhen<T>(notifier: (errors: Observable<unknown>) => Observable<unknown>)` *(deprecated)*

> Resubscribes to the source Observable on error, with full control over retry timing and conditions via a notifier function — each error is piped through the notifier and a retry is triggered when the notifier emits.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Error Handling |
| **Time-sensitive** | No — timing is controlled by the notifier Observable you provide |
| **Value-sensitive** | No — does not inspect source value content |
| **Lossy** | No — all values emitted before each error are forwarded; source re-executes from scratch on each retry |
| **Completion required** | No — operates on error events; works on both finite and infinite sources |

**Completion behaviour** — same as `retry`: normal source completion passes through immediately. Retry logic activates only on error. The output completes when the notifier Observable completes (which signals "stop retrying") or errors (which propagates the error downstream).

**Lossy behaviour** — not lossy with respect to successful emissions. Same duplicate-emission caveat as `retry`: values emitted before an error are forwarded on every retry attempt.

---

#### Marble Diagram

```
source:     --1--2--X             (errors)
notifier:             ----n--     (delay before retry)
retry 1:                  --1--2--X
notifier:                         ----n--
retry 2:                               --1--2--3--|
            retryWhen(errors$ => errors$.pipe(delay(1000)))
output:     --1--2------1--2------1--2--3--|
```

Notifier completing stops retries:
```
notifier:   ----n--|   (completes after 1 retry signal)
output:     --1--2------1--2--|  (completes when notifier completes)
```

Notifier erroring propagates the error:
```
notifier:   ----X      (errors)
output:     --1--2------X   (error propagates)
```

---

#### Signature

```typescript
/** @deprecated Use retry({ delay }) instead — will be removed in v8 */
retryWhen<T>(
	notifier: (errors: Observable<unknown>) => Observable<unknown>
): MonoTypeOperatorFunction<T>
```

**RxJS 7 note:** `retryWhen` is deprecated in RxJS 7. The `RetryConfig.delay` option in `retry()` covers most use cases. `retryWhen` will be removed in RxJS 8.

**Migration:** replace `retryWhen(errors$ => errors$.pipe(delay(1000)))` with `retry({ delay: 1000 })`.

---

#### When to Use

- **Prefer `retry({ delay, count })` in RxJS 7+ new code** — `retryWhen` is only needed for RxJS 6 or very complex notifier logic not expressible via `RetryConfig`.
- Implement custom exponential backoff in RxJS 6 (e.g. `errors$.pipe(delayWhen((_, i) => timer(2 ** i * 1000)))`).
- Retry only on specific error types by filtering the `errors$` stream.
- Limit retries by count in RxJS 6 using `errors$.pipe(take(3))`.
- Implement "retry until a signal arrives" (e.g. retry only while online, stop when `offline$` emits).

---

#### Code Example

```typescript
// RxJS 6 pattern — retryWhen with exponential backoff
import { ajax } from 'rxjs/ajax'
import { retryWhen, delayWhen, take, tap } from 'rxjs/operators'
import { timer, throwError, iif } from 'rxjs'

interface ApiData {
	items: string[]
}

const data$ = ajax.getJSON<ApiData>('/api/data').pipe(
	retryWhen((errors$) =>
		errors$.pipe(
			// Retry up to 3 times with exponential backoff
			delayWhen((_err: unknown, index: number) => timer(Math.min(1000 * 2 ** index, 16_000))),
			take(3),
			// After take(3) completes the notifier, which stops retrying
		)
	)
)
```

Conditional retry — only retry on network errors, not on 4xx:

```typescript
import { ajax, AjaxError } from 'rxjs/ajax'
import { retryWhen, mergeMap, delay } from 'rxjs/operators'
import { throwError, timer } from 'rxjs'

const data$ = ajax.getJSON('/api/data').pipe(
	retryWhen((errors$) =>
		errors$.pipe(
			mergeMap((err: unknown) => {
				if (err instanceof AjaxError && err.status >= 400 && err.status < 500) {
					// 4xx — do not retry, propagate immediately
					return throwError(() => err)
				}
				// Network/5xx — retry after 2 seconds
				return timer(2000)
			})
		)
	)
)
```

**RxJS 7 equivalent** of the exponential backoff above:

```typescript
import { ajax } from 'rxjs/ajax'
import { retry } from 'rxjs/operators'
import { timer } from 'rxjs'

const data$ = ajax.getJSON('/api/data').pipe(
	retry({
		count: 3,
		delay: (_err: unknown, retryCount: number) =>
			timer(Math.min(1000 * 2 ** retryCount, 16_000))
	})
)
```

---

#### Gotchas

1. **Deprecated in RxJS 7, removed in RxJS 8** — migrate to `retry({ count, delay })` for new code. For complex conditional logic, `retry` with a `delay` function receives the error and retry count, covering most `retryWhen` patterns.

2. **Notifier completing vs erroring** — when the notifier completes (e.g. via `take(3)`), `retryWhen` completes the output stream rather than propagating the original error. This surprises people who expect the last error to propagate. To propagate the error after exhausting retries, use `throwError` in the notifier after the count is reached.

3. **Notifier receives all errors on one Subject** — the `errors$` Observable is a single stream of all errors across retries. Operators like `delayWhen` that use the index parameter receive the retry count as the index, which is useful for backoff calculations.

4. **Same "always scope to the inner Observable" rule as `retry`** — placing `retryWhen` on the outer effect stream will terminate the entire pipeline on exhausted retries. Always wrap it inside `switchMap`/`mergeMap`.

5. **`take(n)` on the notifier stops retrying but completes (not errors) the output** — if you want the final error to reach the subscriber after N retries, use `mergeMap` with a counter and `throwError` on the last retry.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `retry` | Simpler API; `RetryConfig.delay` covers most backoff needs in RxJS 7+ | New code in RxJS 7+ |
| `catchError` | Catches error and replaces with a fallback stream; no re-subscription | You want recovery, not retry |
| `repeat` | Re-subscribes on completion, not on error | You want to loop a successful stream |
| `timeout` | Treats slow sources as errors | You need to enforce response time limits before retrying |

---

#### Decision Rule

> In **RxJS 7+**, prefer `retry({ count, delay })` over `retryWhen`. Use `retryWhen` only for **RxJS 6 compatibility** or for complex notifier logic (conditional retry by error type) that `RetryConfig` cannot express. Always scope either operator to the inner Observable in effect pipelines.
