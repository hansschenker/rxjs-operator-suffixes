---
module: 9
lesson: "9.5"
title: The error handling decision tree
key_insight: Error handling in RxJS reduces to three strategies — recover, retry, rethrow — and the choice depends on whether the error is transient, permanent, or unknown. Everything else is a variation on these three.
related: ["9.2", "9.3"]
---

## Hook

RxJS ships many error-related operators: `catchError`, `retry`, `retryWhen`, `timeout`, `onErrorResumeNext`, `throwError`, `EMPTY`. Looking at that list and choosing can feel like a judgement call. It does not have to be. Every error-handling decision collapses to three questions, asked in order — and the answer to each question uniquely determines which strategy to apply.

## Insight

**Strategy 1 — Retry** (error is transient, operation is idempotent): The first question is always "could this succeed if I tried again?" Network hiccups, temporary server overload, and cold-start latency are all transient. If the operation is safe to repeat — GET requests, read-only queries, polling — use `retry` with a bounded count and a delay. Follow it with `catchError` as the terminal safety net for when all attempts fail.

**Strategy 2 — Recover** (error is permanent, fallback is available): The error will not resolve itself, but you have something meaningful to substitute — a cached value, an empty state, a sensible default. Use `catchError(() => of(defaultValue))` or `catchError(() => EMPTY)` to emit the fallback and complete cleanly. Downstream never sees the error; it sees a normal value or a quiet completion.

**Strategy 3 — Rethrow** (error must propagate): You cannot handle this error here — it belongs at a higher layer. But you may need to log it, record it, or alert on it before it escapes. Use `catchError((err: unknown) => { reportError(err); return throwError(() => err); })` to intercept without absorbing.

**The decision tree:**
1. Is the error transient and the operation safe to repeat? → **Retry**
2. Is the error permanent but a fallback is available? → **Recover**
3. Is the error unhandlable at this level? → **Rethrow**

If none of these questions has a clear yes, the default is rethrow — surface the error rather than hiding it.

**For inner Observables:** Whenever you use `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap`, apply one of these three strategies inside the inner pipe, not on the outer stream. An unhandled inner error propagates to the outer stream and terminates it. An inner `catchError` keeps the outer stream alive.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { switchMap, retry, catchError, tap } from 'rxjs/operators';
import { of, throwError, Observable, timer } from 'rxjs';

interface Result { items: string[] }

const query$: Observable<string> = getSearchQuery$();

const search$: Observable<Result> = query$.pipe(
	switchMap((q: string) =>
		ajax.getJSON<Result>(`/api/search?q=${q}`).pipe(
			// Strategy 1: retry transient failures twice with 500ms delay
			retry({ count: 2, delay: 500 }),
			// Strategy 2: recover — permanent failure gets empty result set
			catchError(() => of<Result>({ items: [] })),
		)
	),
	// Strategy 3: rethrow at outer level (for errors that escape switchMap)
	catchError((err: unknown) => {
		reportError(err); // centralised error reporting
		return throwError(() => err);
	}),
);
```

The inner `retry` handles transient failures per query. The inner `catchError` handles permanent failures per query — one bad query does not kill the typeahead. The outer `catchError` handles anything that escapes inner handling and needs centralised reporting.

## Summary

- Three strategies cover all error-handling scenarios: retry (transient), recover (permanent with fallback), rethrow (unhandlable here)
- Ask in order: transient? → retry. Permanent with fallback? → recover. Neither? → rethrow
- Always use inner `catchError` inside flattening operators — unhandled inner errors terminate the outer stream
- When in doubt, rethrow — surfacing an error is always safer than silently swallowing it
- Combine all three strategies in one pipeline: `retry` → `catchError(recover)` → outer `catchError(rethrow)`
