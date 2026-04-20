---
title: "Scheduling & Timing"
---

> Not sure which operator to use? [Decision tree →](../decisions/scheduling-timing)

Control *when* subscriptions are established (`subscribeOn`) or *when* notifications are delivered (`observeOn`), and operators whose primary axis is the **clock**.

## delay

**Base:** Shift all source notifications forward in time by a fixed duration.

### [delayWhen](../operators/delayWhen)(delayDurationSelector, subscriptionDelay?)
Per-value delay — each source value waits until the Observable returned by `delayDurationSelector(value)` emits before being forwarded. More flexible than a fixed offset.

---

## observe

**Base:** Move the **delivery** of notifications (next, error, complete) onto a different scheduler/context without changing the subscribe-side context.

### [observeOn](../operators/observeOn)(scheduler, delay?)
All downstream observer callbacks are scheduled via `scheduler`. Useful for moving work onto the async queue, animationFrame, or a custom scheduler.

---

## subscribe

**Base:** Move the **subscription call itself** onto a different scheduler/context. The inverse of `observeOn` — affects when upstream `subscribe()` fires, not when notifications are delivered.

### [subscribeOn](../operators/subscribeOn)(scheduler, delay?)
Defers the upstream `subscribe()` call until `scheduler` dispatches it. Rarely needed in application code — mostly useful for library authors and testing.

---

## time

**Base:** A shared root for operators whose primary concern is **clock time** — emission timing, creation on a schedule, and deadline enforcement.

### [timeInterval](../operators/timeInterval)()
Transforms each source value into `{ value, interval }` — `interval` is the elapsed milliseconds since the previous emission. Useful for profiling or measuring gaps between events.

### [timeout](../operators/timeout)(config | dueTime)
Errors with `TimeoutError` if the source does not emit within `dueTime` ms. The config form allows per-emission deadlines and switching to a fallback Observable instead of erroring.

### [timer](../operators/timer)(dueTime, interval?, scheduler?)
Creation operator — emits `0` after `dueTime` ms, then emits incrementing integers every `interval` ms. With no interval, acts like a delayed `of(0)`.

### [timestamp](../operators/timestamp)()
Transforms each source value into `{ value, timestamp }` — `timestamp` is the `Date.now()` value at the moment of emission.

---
