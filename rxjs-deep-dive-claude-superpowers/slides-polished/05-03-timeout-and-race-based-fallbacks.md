---
marp: true
theme: uncover
title: "timeout and race-based fallbacks"
---

# timeout and race-based fallbacks
> When an API hangs, your stream hangs with it — silence is not success, it is a hidden failure you need to name and handle.

---

## Core Concept

- `timeout(N)` **errors** if no emission arrives within N milliseconds — the absence of a value IS the failure
- `timeout({ each: N, with: () => fallback$ })` swaps in a fallback Observable instead of erroring (RxJS 7)
- `race(a$, b$, c$)` mirrors whichever Observable **emits first** and immediately unsubscribes from all others
- Both enforce a **time contract** inside `pipe()` — they compose; a raw `setTimeout()` does not
- **Rule:** "An unconstrained Observable is an implicit infinite deadline."

---

## How It Works

```typescript
// timeout: silence becomes a named TimeoutError
// source:  --a--b-----------...  (nothing arrives after b)
//          timeout({ each: 30 })
// output:  --a--b---#             (TimeoutError at 30 ms mark)

// timeout with fallback: swap the source when the clock expires
// primary: ---------...           (hangs indefinitely)
// cache$:  -c|
//          timeout({ each: 30, with: () => cache$ })
// output:  ---------c|            (cache wins after 30 ms)

// race: first to emit mirrors through, rest are unsubscribed
// cdn$:    ----v|
// origin$: ----------v|
//          race(cdn$, origin$)
// output:  ----v|                 (origin unsubscribed before it emits)
```

---

## Common Mistake

```typescript
// ❌ WRONG — timeout + catchError outside switchMap
// The first timeout kills the outer action$ stream permanently.
// Every subsequent action is silently ignored.
action$.pipe(
  switchMap(() => slowApi$),
  timeout(3000),                       // fires correctly...
  catchError(() => of(fallbackValue))  // ...but terminates the outer stream
);

// ❌ ALSO WRONG — manual setTimeout breaks composability,
// leaks the inner subscription, and cannot use TestScheduler.
const result$ = new Observable<Data>(observer => {
  const id = setTimeout(() => observer.error(new Error('Timeout')), 3000);
  slowApi$.subscribe({
    next: v => { clearTimeout(id); observer.next(v); },
    error: err => observer.error(err),
  });
});
```

---

## The Right Way

```typescript
import { race, timer, timeout, catchError, switchMap, of } from 'rxjs';

// ✅ timeout with fallback — stays composable, zero leaked subscriptions
const data$ = slowApi$.pipe(
  timeout({ each: 3000, with: () => cacheApi$ }) // swap source on deadline
);

// ✅ race — prefer fastest source; cache enters after a 1 s head start
const resilient$ = race(
  primaryApi$,
  timer(1000).pipe(switchMap(() => cacheApi$)) // cache as late backup
);

// ✅ combined pattern inside switchMap — outer stream stays alive forever
action$.pipe(
  switchMap(() =>
    race(primaryApi$, cacheApi$).pipe( // race is the inner Observable
      timeout({ each: 5000 }),         // absolute deadline on the race
      catchError(err => of(errorAction(err))) // inner catch — outer lives on
    )
  )
);
```

---

## Key Rule

> **Wrap every network call in `timeout` with an explicit deadline — if you do not define a time contract in the pipe, a hanging Observable will hang your stream forever.**