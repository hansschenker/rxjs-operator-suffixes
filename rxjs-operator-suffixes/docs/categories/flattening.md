---
title: "Higher-Order Operators (Flattening)"
---

> Not sure which to use? [Decision tree →](../decisions/flattening)

Each source value is projected into an inner Observable. The inner streams are then flattened back into a single output. The **base name** determines the inner subscription strategy — how many run concurrently and what happens when a new inner arrives while others are active.

## concat

**Base:** Queue inner Observables strictly **in order** — subscribe to the next only after the previous completes. Concurrency = 1, no cancellation, no drops. Preserves every value and the order of arrival.

### [concatAll](../operators/concatAll)()
Flattens a higher-order Observable by serialising inner Observables. Queues incomers during an active subscription.

### [concatMap](../operators/concatMap)()
Projects each source value to an inner Observable via a mapping function, then concatenates them. The most common form — identical to `mergeMap` with `concurrent = 1`.

### [concatMapTo](../operators/concatMapTo)()
Like `concatMap` but every source value maps to the **same static** inner Observable. Use when the projected stream does not depend on the emitted value.

### [concatWith](../operators/concatWith)(...others)
Appends one or more Observables after the source completes — sugar for `concat(source$, a$, b$)` inside a `pipe()`.

---

## exhaust

**Base:** Subscribe to the **first** inner Observable that arrives; **drop** all subsequent incomers while it is still active. First-wins, not last-wins. Zero concurrency, zero cancellation.

### [exhaustAll](../operators/exhaustAll)()
Flattens a higher-order Observable by ignoring any new inner Observable while the current one is active.

### [exhaustMap](../operators/exhaustMap)()
Projects source values to inner Observables via a mapping function. New projected Observables are silently discarded while an inner is running. Canonical use: form submit — prevents double-submission.

---

## merge

**Base:** Subscribe to **all** inner Observables concurrently with no ordering guarantee. Emissions are interleaved as they arrive. Lossy only by configuration (`concurrent` limit); by default all values pass through.

### [mergeAll](../operators/mergeAll)()
Flattens a higher-order Observable by subscribing to every inner Observable immediately as it arrives.

### [mergeMap](../operators/mergeMap)()
Projects each source value to an inner Observable and merges all concurrently. The default flattening operator when ordering does not matter.

### [mergeMapTo](../operators/mergeMapTo)()
Like `mergeMap` but every source value maps to the **same static** inner Observable.

### [mergeScan](../operators/mergeScan)(accumulator, seed)
Like `scan` but the accumulator returns an Observable; results are merged — useful for stateful async accumulation (e.g. accumulated HTTP results).

### [mergeWith](../operators/mergeWith)(...others)
Merges one or more Observables with the source, interleaving their emissions. Sugar for `merge(source$, a$, b$)` inside a `pipe()`.

---

## switch

**Base:** On each new inner Observable, **cancel the previous** inner and subscribe to the new one. Always tracks only the most recent — previous values in-flight are lost.

### [switchAll](../operators/switchAll)()
Flattens a higher-order Observable by switching: each new inner Observable cancels the previous one.

### [switchMap](../operators/switchMap)()
Projects source values to inner Observables; cancels the active inner whenever a new projection arrives. Canonical use: search typeahead — only the last query matters.

### [switchMapTo](../operators/switchMapTo)()
Like `switchMap` but every source value maps to the **same static** inner Observable.

### [switchScan](../operators/switchScan)(accumulator, seed)
Like `scan` but the accumulator returns an Observable that is flattened via `switchMap` semantics — the new inner replaces the previous one.

---
