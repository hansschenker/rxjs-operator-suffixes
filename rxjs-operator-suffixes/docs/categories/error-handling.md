---
title: "Error Handling & Recovery"
---

> Not sure which operator to use? [Decision tree →](../decisions/error-handling)

## retry

**Base:** On an upstream error, **re-subscribe** to the source Observable from the start.

### [retryWhen](../operators/retryWhen)(notifier)
Deprecated in RxJS 7 — use `retry({ delay })` instead. Delegates the retry decision to a `notifier` Observable: re-subscribes when notifier emits, errors when notifier errors, completes when notifier completes.

---

## catch

**Base:** Intercept an upstream **error** and replace it with an alternative Observable — turning a failure into a recovery stream. The stream continues from the replacement; no error propagates downstream.

### [catchError](../operators/catchError)(selector)
Receives `(error, caught$)` — `caught$` is the original source, enabling retry-once by returning it. Returning `EMPTY` swallows silently; returning a fallback stream degrades gracefully; re-throwing reroutes the error downstream.

---

## repeat

**Base:** On source **completion** (not error), **re-subscribe** automatically — looping the stream. The completion-side counterpart to `retry`.

### [repeat](../operators/repeat)(count? | config)
Without arguments, loops forever. With a count, repeats that many additional times. The config form `{ count, delay }` adds a delay between repetitions (RxJS 7.4+).

### [repeatWhen](../operators/repeatWhen)(notifier)
Deprecated in RxJS 7 — use `repeat({ delay })` instead. Delegates the re-subscribe decision to a `notifier` Observable, allowing conditional or delayed repetition.

---
