---
module: 9
lesson: "9.4"
title: timeout, finalize, and lifecycle cleanup
key_insight: timeout fails the stream if no emission arrives within a deadline — it does not slow down a fast stream, it terminates a frozen one. finalize runs cleanup unconditionally regardless of how the stream ended.
related: ["2.4", "9.2"]
---

## Hook

Two operators that are easy to overlook until something goes wrong — and then they become essential. One answers the question "what do I do when my stream silently stops producing values?" The other answers "how do I guarantee cleanup runs no matter how the stream ends?" Together they cover the two failure modes that are hardest to debug in reactive UIs: the hung request and the leaked resource.

## Insight

**`timeout({ each: 5000 })`** emits a `TimeoutError` if no value arrives within 5 seconds of the last emission. It does not add latency to normal execution. On a fast-emitting source it is invisible. On a source that stops producing — a stalled HTTP request, a silent WebSocket connection, a frozen polling interval — it fires precisely at the deadline. The `each` option applies the deadline after every emission, not just the first. There is also a `first` option that only applies the deadline to the initial emission.

The output is a `TimeoutError` — a named error class exported from RxJS. Combining `timeout` with `catchError` lets you distinguish timeouts from other failures and provide targeted recovery:

```typescript
catchError((err: unknown) =>
	err instanceof TimeoutError ? of(null) : throwError(() => err)
)
```

**`finalize(fn)`** runs `fn` when the stream terminates for any reason — graceful `complete`, unhandled `error`, or explicit `unsubscribe()`. It is the Observable equivalent of `finally` in a try-catch-finally block, and it carries the same guarantee: `fn` always runs.

This is a critical distinction from `tap({ complete: () => ... })`. The `tap` complete callback only fires on graceful completion. If the stream errors or the consumer unsubscribes early, the `tap` complete handler is skipped. `finalize` is not skipped. This makes it the only reliable place for cleanup that must run unconditionally — hiding loading spinners, closing WebSocket connections, releasing timers, signalling to UI that an operation is finished.

A practical rule: if cleanup is load-bearing (the user will notice if it does not run), use `finalize`. If it is informational only on success, `tap({ complete })` is acceptable.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { timeout, catchError, finalize } from 'rxjs/operators';
import { of, TimeoutError, throwError, Observable } from 'rxjs';

interface User { id: number; name: string; }

const user$: Observable<User | null> = ajax
	.getJSON<User>('/api/user/42')
	.pipe(
		timeout({ each: 10_000 }),
		catchError((err: unknown) => {
			if (err instanceof TimeoutError) {
				// Stalled request — provide a null fallback
				return of<null>(null);
			}
			// All other errors rethrow for upstream handling
			return throwError(() => err);
		}),
		finalize(() => hideLoadingSpinner()), // always runs: complete, error, or unsubscribe
	);

user$.subscribe({
	next: (user: User | null) => renderUser(user),
	error: (err: unknown) => showErrorBanner(err),
});
// Whether the request succeeds, times out, or the subscriber unsubscribes early,
// the loading spinner will always be hidden.
```

## Summary

- `timeout({ each: N })` fires a `TimeoutError` when no emission arrives within N milliseconds of the previous — use it to surface silently stalled streams
- Combine `timeout` with `catchError` and `instanceof TimeoutError` to handle stalls distinctly from other errors
- `finalize` runs on complete, error, and unsubscribe — it is the only unconditional cleanup hook in an Observable pipeline
- Prefer `finalize` over `tap({ complete })` whenever cleanup is load-bearing; `tap` complete is skipped on error and unsubscribe

## Pitfall

Using `tap({ complete: () => hideSpinner() })` for cleanup logic. `tap.complete` only fires on graceful completion — it is silently skipped on error and on manual `unsubscribe()`. Use `finalize(() => hideSpinner())` instead: it fires on every termination path, making it the only reliable place for cleanup that must always run.
