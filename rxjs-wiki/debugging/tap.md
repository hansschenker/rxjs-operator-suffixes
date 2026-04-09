---
title: "tap — Side Effects and Debugging"
category: debugging
tags: [debugging, tap, side-effects, logging, inspection]
related: [index.md, common-mistakes.md, ../core/operators.md]
sources: 0
updated: 2026-04-08
---

# tap — Side Effects and Debugging

> The only RxJS operator whose job is side effects — used for logging, debugging, and any action that shouldn't change the stream values.

## What tap Does

`tap` passes values through unchanged but runs a callback (side effect) for each `next`, `error`, or `complete` notification.

```typescript
import { tap } from 'rxjs/operators';

source$.pipe(
  tap(value => console.log('value:', value))
  // value flows through unchanged
)
```

```
source: -a--b--c--|
   tap: (logs a,b,c)
result: -a--b--c--|  ← same values
```

## Signature (RxJS 7)

```typescript
// Single callback (next only)
tap<T>(nextCallback: (value: T) => void): MonoTypeOperatorFunction<T>

// Observer object (preferred for multiple callbacks)
tap<T>(observer: {
  next?: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
  subscribe?: () => void;        // RxJS 7+
  unsubscribe?: () => void;      // RxJS 7+
  finalize?: () => void;         // RxJS 7+
}): MonoTypeOperatorFunction<T>
```

Note: positional arguments (`tap(next, error, complete)`) were deprecated in RxJS 7. Use the observer object form.

## Debugging Patterns

### Basic logging

```typescript
source$.pipe(
  tap(v => console.log('before map:', v)),
  map(transform),
  tap(v => console.log('after map:', v))
);
```

### Full lifecycle logging

```typescript
source$.pipe(
  tap({
    next: v => console.log('next:', v),
    error: e => console.error('error:', e),
    complete: () => console.log('complete'),
  })
);
```

### Named debugger utility

```typescript
const debug = <T>(label: string): MonoTypeOperatorFunction<T> =>
  tap<T>({
    next: v => console.log(`%c[${label}] next`, 'color: #4CAF50', v),
    error: e => console.error(`[${label}] error`, e),
    complete: () => console.log(`%c[${label}] complete`, 'color: #2196F3'),
    subscribe: () => console.log(`%c[${label}] subscribed`, 'color: #FF9800'),
    unsubscribe: () => console.log(`%c[${label}] unsubscribed`, 'color: #F44336'),
  });

// Usage
source$.pipe(
  debug('source'),
  map(transform),
  debug('after-transform'),
  filter(predicate),
  debug('after-filter'),
).subscribe();
```

### Breakpoint

```typescript
source$.pipe(
  tap(v => {
    if (v.id === targetId) {
      debugger; // Pause execution in DevTools
    }
  })
);
```

## Production Side Effects

`tap` is the right place for side effects that don't transform data:

```typescript
// Analytics tracking
source$.pipe(
  tap(event => analytics.track(event.type)),
  map(process)
);

// Cache population
userRequest$.pipe(
  tap(user => cache.set(user.id, user))
);

// Logging service
source$.pipe(
  tap({
    next: v => logger.debug('stream-value', v),
    error: e => logger.error('stream-error', e),
  })
);

// State update side-channel (use sparingly — prefer reactive patterns)
source$.pipe(
  tap(v => loadingSubject$.next(false))
);
```

## finalize — Teardown Side Effects

`finalize` is the companion to `tap` — it runs when the stream ends (complete, error, or unsubscribe):

```typescript
import { finalize } from 'rxjs/operators';

source$.pipe(
  tap(() => loadingSubject$.next(true)),
  switchMap(query => fetchData(query)),
  finalize(() => loadingSubject$.next(false)) // always runs on cleanup
);
```

Use `finalize` instead of `tap({ complete })` when you also need to handle unsubscription.

## Difference: tap vs map for side effects

```typescript
// WRONG — side effect in map changes behaviour if map is called multiple times
source$.pipe(
  map(v => {
    console.log(v); // ← side effect in map
    return v * 2;
  })
);

// CORRECT — side effect in tap, transformation in map
source$.pipe(
  tap(v => console.log(v)),
  map(v => v * 2)
);
```

The distinction matters because:
- `map` should be a pure function (no side effects)
- Multiple subscribers, `shareReplay`, or test scaffolding may call the map function more than once
- `tap` explicitly signals "this is a side effect"

## Disabling tap in Production

For performance-sensitive paths, wrap `tap` calls in a dev guard:

```typescript
const debugTap = <T>(label: string): MonoTypeOperatorFunction<T> =>
  import.meta.env.DEV
    ? tap<T>(v => console.log(label, v))
    : identity; // no-op in production

// Or use conditional pipe
const ops = import.meta.env.DEV
  ? [tap(v => console.log(v))]
  : [];

source$.pipe(...ops, map(transform)).subscribe();
```

## Related

- [index](index.md) — debugging overview and workflow
- [common-mistakes](common-mistakes.md) — side effects in map (common mistake)
- [operators](../core/operators.md) — operator reference
