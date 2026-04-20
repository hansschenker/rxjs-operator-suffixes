---
title: "Transformation"
---

> Not sure which to use? [Decision tree →](../decisions/transformation)

Transform the **shape or value** of each emission without affecting which values are emitted or the number of subscriptions. One value in, one transformed value out (unless the operator also aggregates — see Aggregation).

## map

**Base:** Apply a **pure function** to every source value and emit the result. The most fundamental transformation — one-in, one-out, synchronous.

### [mapTo](../operators/mapTo)(value)
Deprecated in RxJS 7 — use `map(() => value)` instead. Replaces every source value with the same constant. Common pattern: mapping click events to action objects.

---

## scan

**Base:** Apply an **accumulator function** to each value, carrying forward a running state — like `Array.prototype.reduce` but emitting every intermediate accumulated value, not just the final one. The core of MVU reducer composition.

### [scan](../operators/scan)(accumulator, seed?)
No suffix variants on `scan` itself. The higher-order accumulator variants that also flatten inner Observables live in the flattening families: `mergeScan` and `switchScan`.

---

## expand

**Base:** Apply a projection **recursively** — the output of each projection is fed back into the projection, creating a depth-first expansion tree. Think `mergeMap` that also maps its own results.

### [expand](../operators/expand)(project, concurrent?, scheduler?)
Projects each source value (and each projected emission) into an inner Observable, merging them all. Useful for paginated API traversal, tree/graph walks, or generating recursive sequences.

---

## pairwise

**Base:** Buffer **two consecutive** values and emit them as a `[previous, current]` tuple on each emission. The first source value is held until the second arrives — no emission on the first value.

### [pairwise](../operators/pairwise)()
No configuration. Equivalent to `bufferCount(2, 1)` but typed as `[T, T]`. Classic use: compute deltas between consecutive mouse positions, scroll offsets, or state snapshots.

---

## group

**Base:** **Split** one source stream into multiple sub-streams keyed by a selector function — one `GroupedObservable` per distinct key.

### [groupBy](../operators/groupBy)(keySelector, element?, duration?, connector?)
Emits a `GroupedObservable<K, T>` for each new key seen. Each group is itself a stream of values sharing that key. Inner groups complete when the source completes or when the `duration` Observable for that key emits. Classic use: partition a WebSocket event stream by event type.

---
