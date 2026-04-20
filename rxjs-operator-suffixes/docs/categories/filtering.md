---
title: "Filtering"
---

> Not sure which operator to use? [Decision tree →](../decisions/filtering)

Decide **which values pass** through the stream. Unlike rate limiting (drops by time), filtering drops by **position**, **count**, **content**, or **identity**.

## distinct

**Base:** Suppress **consecutive duplicate** values. Never drops the first occurrence — only drops when the incoming value matches the previous one (or a key derived from it).

### [distinctUntilChanged](../operators/distinctUntilChanged)(comparator?)
Compares consecutive values with `===` by default, or a custom `comparator` function. Emits only when the value has actually changed.

### [distinctUntilKeyChanged](../operators/distinctUntilKeyChanged)(key, comparator?)
Like `distinctUntilChanged` but extracts a named **property key** from each object and compares only that field. Avoids the reference-equality trap for objects.

---

## find

**Base:** Emit the **first value satisfying a predicate**, then complete. Does not require source completion.

### [findIndex](../operators/findIndex)(predicate)
Instead of emitting the matching value, emits its **zero-based index**. Emits `-1` if the source completes without a match (note: `find` emits `undefined` in that case).

---

## skip

**Base:** Suppress values **from the start** of the stream; let values through only after a condition has been met or a count exceeded.

### [skipLast](../operators/skipLast)(count)
Suppresses the last `count` values. Requires source completion; buffers the trailing N values internally.

### [skipUntil](../operators/skipUntil)(notifier$)
Suppresses all values until a separate notifier Observable emits, then passes everything through.

### [skipWhile](../operators/skipWhile)(predicate)
Suppresses values as long as the predicate returns `true`. Once it returns `false`, all subsequent values pass through — the predicate is no longer evaluated.

---

## take

**Base:** Let through a **limited number of values** from the start of the stream, then complete. The mirror image of `skip`.

### [takeLast](../operators/takeLast)(count)
Emits only the last `count` values. Requires source completion; buffers the trailing N values internally.

### [takeUntil](../operators/takeUntil)(notifier$)
Emits values until a separate notifier Observable emits, then completes. Standard subscription teardown pattern: `takeUntil(destroy$)`.

### [takeWhile](../operators/takeWhile)(predicate, inclusive?)
Emits values as long as the predicate returns `true`. When `false`, the operator completes. With `inclusive: true`, the value that failed the predicate is included in the output before completion.

---

## first

**Base:** Emit the **first** value (or first matching a predicate) and complete immediately — without waiting for the source to complete.

### [first](../operators/first)(predicate?, defaultValue?)
Emits the first value satisfying the predicate, then unsubscribes. Errors with `EmptyError` if the source completes without a match (unless `defaultValue` is provided).

### [firstValueFrom](../operators/firstValueFrom)(observable$)
A Promise-based utility — subscribes, resolves with the first emitted value, then unsubscribes. Rejects with `EmptyError` if the source completes without emitting.

---

## last

**Base:** Emit the **last** value (or last matching a predicate) — requires source completion.

### [last](../operators/last)(predicate?, defaultValue?)
Buffers values internally, emits the last one that satisfies the predicate once the source completes. Errors if no match is found and no `defaultValue` is provided.

### [lastValueFrom](../operators/lastValueFrom)(observable$)
A Promise-based utility — resolves with the last emitted value once the source completes. Rejects with `EmptyError` if the source completes without emitting.

---

## single

**Base:** Assert that exactly **one** value matches — emits it and completes. Errors if zero or more than one value satisfies the predicate. Stricter than `first`.

### [single](../operators/single)(predicate?)
No suffix variants. Without a predicate, errors if the source emits more than one value. With a predicate, errors if zero or more than one value matches.

---

## element

**Base:** Emit only the value at a specific **zero-based index** in the source sequence, then complete.

### [elementAt](../operators/elementAt)(index, defaultValue?)
Emits the value at position `index`. With `defaultValue`, emits that instead of erroring if the source completes before reaching `index`.

---

## default

**Base:** Provide a **fallback emission** when the source completes without emitting any value — the safe path.

### [defaultIfEmpty](../operators/defaultIfEmpty)(defaultValue)
If the source completes without emitting, emits `defaultValue`. If the source does emit at least once, passes through normally without touching `defaultValue`.

---

## throw

**Base:** **Error** when the source does not satisfy an expected condition — the fail-fast counterpart to `default`.

### [throwIfEmpty](../operators/throwIfEmpty)(errorFactory?)
Errors with `EmptyError` (or a custom error from `errorFactory`) if the source completes without emitting any value. Pair with `defaultIfEmpty` when you want to choose between safe default and hard failure.

---
