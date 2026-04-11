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
import { retryWhen, scan, delayWhen, timer, catchError } from 'rxjs/operators';

action$.pipe(
  switchMap(() =>
    fetchData$.pipe(
      retryWhen(errors$ =>
        errors$.pipe(
          scan((attempt, err) => {
            if (attempt >= 3) throw err; // give up — let catchError below handle it
            return attempt + 1;
          }, 0),
          // exponential backoff: 1 s → 2 s → 4 s
          delayWhen(attempt => timer(Math.pow(2, attempt) * 1000))
        )
      ),
      // only the inner fetch dies; the outer action$ stream stays alive
      catchError(err => of(errorAction(err)))
    )
  )
);
```

---

## Key Rule

> **Always place `retry` and `retryWhen` inside the inner Observable — putting them on the outer stream re-subscribes your entire effect pipeline and guarantees silent failure after the retry budget is exhausted.**