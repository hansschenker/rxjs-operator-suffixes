---
title: "Error Handling Patterns"
category: patterns
tags: [patterns, error-handling, retry, catchError, resilience]
related: [effects.md, state-management.md, ../core/operators.md, ../debugging/common-mistakes.md]
sources: 0
updated: 2026-04-08
---

# Error Handling Patterns

> Strategies for making RxJS streams resilient — catching, recovering, retrying, and logging errors.

## The Golden Rule

> Catch errors **inside** inner Observables, not on the outer stream.

When an Observable errors, it completes — permanently. Any operator after the error call never runs. If your effect or long-lived stream catches the error at the outer level, the entire stream dies.

```typescript
// WRONG — stream dies on first HTTP error
action$.pipe(
  switchMap(() => fetch$),
  catchError(err => of(errorAction(err)))  // stream terminates after this
);

// CORRECT — only the inner Observable dies; the outer continues
action$.pipe(
  switchMap(() =>
    fetch$.pipe(
      catchError(err => of(errorAction(err)))  // inner catch
    )
  )
);
```

## `catchError`

Catches errors and replaces them with a new Observable:

```typescript
import { catchError } from 'rxjs/operators';

// Replace with a default value
source$.pipe(
  catchError(() => of(defaultValue))
);

// Replace with empty (suppress error)
source$.pipe(
  catchError(() => EMPTY)
);

// Re-throw a different error
source$.pipe(
  catchError(err => throwError(() => new AppError(err.message)))
);

// Inspect and re-throw
source$.pipe(
  catchError(err => {
    logError(err);
    return throwError(() => err);
  })
);
```

## `retry` — Simple Retry

```typescript
import { retry } from 'rxjs/operators';

// Retry up to 3 times
source$.pipe(retry(3));

// RxJS 7: retry with config
source$.pipe(
  retry({
    count: 3,
    delay: 1000,       // wait 1s between retries
    resetOnSuccess: true,
  })
);
```

## `retryWhen` — Custom Retry Logic

`retryWhen` receives the error stream and returns an Observable that controls retry timing:

```typescript
import { retryWhen, scan, delayWhen, timer } from 'rxjs/operators';

// Exponential backoff: 1s, 2s, 4s, then give up
source$.pipe(
  retryWhen(errors$ =>
    errors$.pipe(
      scan((attempt, err) => {
        if (attempt >= 3) throw err; // give up after 3 retries
        return attempt + 1;
      }, 0),
      delayWhen(attempt => timer(Math.pow(2, attempt) * 1000))
    )
  )
);
```

## Retry with Jitter (Production Pattern)

Pure exponential backoff can create thundering herd problems. Add jitter:

```typescript
function exponentialBackoff(maxRetries = 3, baseMs = 1000) {
  return retryWhen<any>(errors$ =>
    errors$.pipe(
      scan((attempt, err) => {
        if (attempt >= maxRetries) throw err;
        return attempt + 1;
      }, 0),
      delayWhen(attempt => {
        const exp = Math.pow(2, attempt) * baseMs;
        const jitter = Math.random() * baseMs;
        return timer(exp + jitter);
      })
    )
  );
}

// Usage
fetchData().pipe(exponentialBackoff(4, 500)).subscribe(...);
```

## Polling with Auto-Retry

```typescript
timer(0, 30_000).pipe(
  switchMap(() =>
    fetchStatus().pipe(
      retry({ count: 2, delay: 2000 }),
      catchError(() => of({ status: 'error' }))
    )
  )
).subscribe(updateUI);
```

## Fallback / Graceful Degradation

```typescript
// Try primary, fall back to cache, then to default
primaryApi$.pipe(
  catchError(() => cacheService.get(key$)),
  catchError(() => of(defaultValue))
);

// Or with onErrorResumeNext (continues to next Observable on any error)
onErrorResumeNext(primaryApi$, cacheApi$, of(defaultValue));
```

## Error Notification Without Breaking the Stream

Sometimes you want to log errors but keep the stream alive:

```typescript
source$.pipe(
  materialize(), // wraps values and errors in Notification objects
).subscribe(notification => {
  if (notification.kind === 'E') {
    logError(notification.error);
    // Don't re-throw — stream continues with future emissions
    // (but there won't be any after an error unless you retry)
  }
});

// Better: use tap + retry
source$.pipe(
  tap({ error: err => logError(err) }),
  retry({ count: Infinity, delay: 5000 }) // forever retry with 5s delay
);
```

## Error Boundary Pattern (React analogy)

Isolate errors per item in a list:

```typescript
// Process each item independently — one item's error doesn't affect others
from(items).pipe(
  mergeMap(item =>
    processItem(item).pipe(
      map(result => ({ item, result, ok: true as const })),
      catchError(err => of({ item, error: err, ok: false as const }))
    )
  )
).subscribe(handleResult);
```

## TypeScript: Narrowing Errors

RxJS errors are typed as `unknown` in RxJS 7+:

```typescript
catchError((err: unknown) => {
  if (err instanceof HttpError) {
    return of(httpErrorAction(err));
  }
  if (err instanceof NetworkError) {
    return throwError(() => err); // re-throw unknowns
  }
  return throwError(() => new UnexpectedError(String(err)));
})
```

## Related

- [effects](effects.md) — where error handling in effects must live (inside inner Observables)
- [operators](../core/operators.md) — `catchError`, `retry`, `retryWhen` reference
- [common-mistakes](../debugging/common-mistakes.md) — common error handling mistakes
