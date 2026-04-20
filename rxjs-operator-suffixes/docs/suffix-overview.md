---
title: Suffix Reference — Overview
---

# RxJS Operator Name Suffixes

Operators are grouped by **category**, then by the shared **base name** (prefix). The base name captures the core semantic — the suffix narrows *how* that semantic is triggered or configured.

---

## [Higher-Order Operators (Flattening)](./categories/flattening)

*concat · exhaust · merge · switch*

Project each source value into an inner Observable; the base name controls concurrency, cancellation, and ordering.

---

## [Windowing & Buffering](./categories/windowing-buffering)

*buffer · window*

Collect emissions into arrays (buffer) or Observables (window); the suffix controls the boundary condition.

---

## [Rate Limiting](./categories/rate-limiting)

*audit · debounce · sample · throttle*

Suppress emissions within a time window. All four families are lossy; the Time suffix swaps a trigger Observable for a plain duration.

---

## [Filtering](./categories/filtering)

*distinct · find · skip · take · first · last · single · elementAt · defaultIfEmpty · throwIfEmpty*

Decide which values pass — by identity, position, count, or predicate rather than by time.

---

## [Combination](./categories/combination)

*combine · zip · race · forkJoin · withLatestFrom · startWith · endWith*

Join multiple streams into one; the suffix describes the join strategy.

---

## [Multicasting & Sharing](./categories/multicasting)

*publish · share*

Share a single upstream subscription across multiple downstream subscribers.

---

## [Error Handling & Recovery](./categories/error-handling)

*retry · catchError · repeat*

Re-subscribe on error or completion; intercept and replace error streams.

---

## [Scheduling & Timing](./categories/scheduling-timing)

*delay · observeOn · subscribeOn · timeInterval · timeout · timer · timestamp*

Control when subscriptions fire and when notifications are delivered; operators whose primary axis is the clock.

---

## [Transformation](./categories/transformation)

*map · scan · expand · pairwise · groupBy*

Reshape the value of each emission without affecting which values pass or how many subscriptions exist.

---

## [Creation](./categories/creation)

*from · of · range · interval · defer · generate*

Produce an Observable from scratch; the base name describes the origin of the values.

---

## [Side Effects](./categories/side-effects)

*tap · finalize*

Observe lifecycle events without altering the stream — for logging, cleanup, and resource release.

---

## [Notification Objects](./categories/notification)

*materialize · dematerialize*

Reify notifications into plain value objects, or unreify them back into live stream events.
