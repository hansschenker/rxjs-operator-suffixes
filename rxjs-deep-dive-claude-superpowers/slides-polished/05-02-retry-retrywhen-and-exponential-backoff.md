---
marp: true
theme: uncover
title: "retry, retryWhen, and exponential backoff"
---

# retry, retryWhen, and exponential backoff
> Your HTTP effect silently dies on the first network hiccup — and every subsequent action is swallowed into the void.

---

## Core Concept

- `retry(n)` **resubscribes** to the source Observable up to `n` times on error — it does not replay cached values
- `retryWhen(fn)` hands you the error stream so you control delay, attempt count, and give-up logic
- **"When an Observable errors, it completes permanently"** — any operator after an uncaught error never runs
- Exponential backoff spaces retries: 1 s → 2 s → 4 s, preventing thundering-herd on a flaky API
- Add random jitter in production: `delay = 2^attempt × base + Math.random() × base`

---

## How It Works

```
// retryWhen with exponential backoff on a failing HTTP call

source$:   ──a──✕
                  (wait 1 s)──a──✕
                                   (wait 2 s)──a──✕
                                                    (wait 4 s)──a──b──|

attempt:     0 → error      1 → error      2 → error      3 → success

delayWhen maps attempt number → timer(2^attempt * 1000 ms)
scan tracks the attempt count and re-throws when limit is reached
```

---

## Common Mistake

```typescript
// WRONG — retry sits on the outer stream
action$.pipe(
  switchMap(() => fetchData$),

  // ✗ This retries the entire switchMap, re-listening to action$
  // from the top — not just the HTTP call that failed
  retry(3),

  // ✗ After 3 failed outer retries, catchError terminates the stream.
  // Future dispatched actions are silently ignored forever.
  catchError(err => of(errorAction(err)))
);
```

---

## The Right Way

```typescript
import { retry, timer, catchError } from 'rxjs';

// ✅ RxJS 7+: retry() accepts a config object — retryWhen is deprecated
action$.pipe(
  switchMap(() =>
    fetchData$.pipe(
      retry({
        count: 3,
        // delay fn: (error, retryCount) — retryCount starts at 1
        // return an Observable; when it emits, the retry fires
        delay: (_err, retryCount) =>
          timer(Math.pow(2, retryCount) * 1000), // 2s → 4s → 8s
      }),
      // only the inner fetch dies; the outer action$ stream stays alive
      catchError(err => of(errorAction(err)))
    )
  )
);
// retryWhen() still exists in RxJS 7 but is deprecated —
// prefer retry({ count, delay }) for all new code
```

---

## Key Rule

> **Always place `retry` and `retryWhen` inside the inner Observable — putting them on the outer stream re-subscribes your entire effect pipeline and guarantees silent failure after the retry budget is exhausted.**