---
title: "Debugging Index"
category: debugging
tags: [debugging, index, tap, logging, devtools]
related: [tap.md, common-mistakes.md, ../testing/index.md]
sources: 0
updated: 2026-04-08
---

# Debugging RxJS Streams

> Techniques and tools for understanding, diagnosing, and fixing problems in RxJS code.

## Debugging Catalog

- [tap](tap.md) — Using `tap` for logging, breakpoints, and stream inspection
- [common-mistakes](common-mistakes.md) — The most common RxJS mistakes and how to fix them

## Quick Debugging Checklist

When a stream isn't behaving:

1. **Is it subscribed?** — Add a `tap(console.log)` near the source. No output? Not subscribed (or subscription completed/errored already).
2. **Is it completed/errored?** — Add `tap({ complete: () => console.log('done'), error: e => console.error(e) })`.
3. **Is it hot or cold?** — Did you `share()` a stream that should be shared? Or miss `shareReplay` on a BehaviorSubject wrapper?
4. **Are operators in the right order?** — Order matters. `filter` before `map` vs after changes behavior.
5. **Is the error swallowed?** — A missing `catchError` or an error in a nested Observable can silently kill a stream.

## The `tap` Debugging Workflow

```typescript
// Identify which stage the problem is in
source$.pipe(
  tap(v => console.log('1 after source:', v)),
  map(transform),
  tap(v => console.log('2 after map:', v)),
  filter(predicate),
  tap(v => console.log('3 after filter:', v)),
  switchMap(asyncOp),
  tap(v => console.log('4 after switchMap:', v)),
).subscribe(v => console.log('subscriber:', v));
```

Progressively narrow down where values disappear or transform incorrectly.

## Named `tap` Helper

Create a labeled tap for clean debugging:

```typescript
const debug = <T>(label: string) => tap<T>({
  next: v => console.log(`[${label}] next:`, v),
  error: e => console.error(`[${label}] error:`, e),
  complete: () => console.log(`[${label}] complete`),
});

source$.pipe(
  debug('source'),
  map(transform),
  debug('after-map'),
  switchMap(asyncOp),
  debug('after-switchMap'),
).subscribe();
```

## Debugging Subscriptions

```typescript
// Is anyone subscribing?
const source$ = new Observable(subscriber => {
  console.log('Observable created (subscribed)');
  // ...
  return () => console.log('Teardown (unsubscribed/completed)');
});

// Count subscribers
let subCount = 0;
source$.pipe(
  tap({ subscribe: () => console.log('subscriber count:', ++subCount) })
);
```

In RxJS 7, `tap` can handle `subscribe` and `unsubscribe` lifecycle:

```typescript
source$.pipe(
  tap({
    subscribe: () => console.log('subscribed'),
    unsubscribe: () => console.log('unsubscribed'),
    finalize: () => console.log('finalized (complete or unsubscribe)'),
  })
);
```

## Checking for Memory Leaks

```typescript
// Instrument subscriptions to track open count
let openSubs = 0;

source$.pipe(
  finalize(() => {
    openSubs--;
    console.log('Open subscriptions:', openSubs);
  })
).subscribe(() => {
  openSubs++;
});
```

Or use the browser's Memory tab — look for growing Observable/Subscription instances in heap snapshots.

## Browser DevTools Integration

### Breakpoint in tap

```typescript
source$.pipe(
  tap(v => {
    debugger; // ← pause here with DevTools open
    console.log(v);
  })
);
```

### Console Group

```typescript
const debugGroup = <T>(label: string): MonoTypeOperatorFunction<T> =>
  tap(v => {
    console.group(label);
    console.log('value:', v);
    console.trace();
    console.groupEnd();
  });
```

## RxJS DevTools (Browser Extension)

The **RxJS DevTools** browser extension (by Benlesh) can visualize stream subscriptions and marble diagrams in real time — works best with RxJS 7.

Alternative: **rxjs-spy** library adds instrumentation:

```typescript
import { create } from 'rxjs-spy';

const spy = create();
spy.log('my-tag'); // log all tagged observables

source$.pipe(tag('my-tag')).subscribe();
spy.show('my-tag');
```

## Async Stack Traces

RxJS async operations lose the original call stack. To recover it in development:

```typescript
// In development builds, add tap with Error capture
const captureStack = new Error('Stream created here');

source$.pipe(
  catchError(err => {
    console.error('Original creation site:', captureStack.stack);
    return throwError(() => err);
  })
);
```

## Related

- [tap](tap.md) — `tap` operator deep-dive
- [common-mistakes](common-mistakes.md) — common pitfalls and fixes
- [index](../testing/index.md) — if debugging → consider adding a test to prevent regression
