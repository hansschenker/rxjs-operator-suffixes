---
module: 5
lesson: "5.4"
title: The buffer and window families
key_insight: buffer and window are the lossless cousins of throttle and debounce — they collect all values into arrays or inner Observables instead of dropping them. Use them whenever losing a value is unacceptable.
related: ["5.2", "5.5"]
---

## Hook

Every time you reach for `debounceTime` or `throttleTime`, ask once: can any of the dropped values come back to cause a problem? If the answer is yes — if those events are financial transactions, audit records, analytics clicks, or sensor readings that inform a billing calculation — `bufferTime` is the operator you actually need. The cost of the wrong choice is silent data loss: no error, no warning, just missing records downstream.

## Insight

The buffer and window families are the lossless counterparts to throttle and debounce. Where lossy operators drop values to reduce rate, buffer and window collect every value into a group and emit the group.

**`buffer(signal$)`** and its variants collect source emissions into arrays and emit the array when a closing signal fires. `bufferTime(ms)` emits an array every N milliseconds, regardless of how many values arrived. `bufferCount(n)` emits an array every N source values. `bufferToggle(open$, close$)` captures all values that arrive within a specific dynamically-controlled window. Every input value ends up in exactly one output array. Nothing is dropped.

**`window(signal$)`** and its variants work identically in terms of grouping but emit inner Observables instead of arrays. The inner Observable gives you a live stream of values within each window, which means you can apply operators — `filter`, `map`, `take` — to each group before it closes. Use `window` over `buffer` only when you need to transform the values within a group before collecting them. For simple collection, `buffer` is cleaner.

Common patterns: `bufferTime(5000)` to batch server-sent events into periodic database writes; `bufferCount(100)` to batch API inserts to stay within request-size limits; `bufferToggle(open$, close$)` to capture exactly the events that occur during a specific UI interaction.

## Example

A server event pipeline that must never lose a record:

```typescript
import { bufferTime, filter } from 'rxjs/operators';

interface ServerEvent {
	id: string;
	payload: unknown;
}

declare const serverEvent$: import('rxjs').Observable<ServerEvent>;
declare function writeBatchToDatabase(batch: ServerEvent[]): void;

// Every event is preserved. Batches are written every 5 seconds.
// throttleTime here would silently drop 99% of high-frequency events.
serverEvent$.pipe(
	bufferTime(5000),
	filter((batch: ServerEvent[]) => batch.length > 0),
).subscribe((batch: ServerEvent[]) => {
	writeBatchToDatabase(batch);
});
```

The `filter` guard prevents empty writes during quiet periods. The `bufferTime` window ensures that no matter how many events arrive in 5 seconds — one or ten thousand — all of them reach `writeBatchToDatabase`.

## Summary

- `buffer` emits arrays; `window` emits inner Observables — both are lossless, every input value is preserved
- `bufferTime` for time-batching, `bufferCount` for size-batching, `bufferToggle` for dynamic windows
- Prefer `buffer` over `window` unless you need to apply operators to each group before collecting; both are correct choices when data loss is unacceptable
