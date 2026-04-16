---
module: 5
lesson: "5.1"
title: Observables as sequences of (time, value) pairs
key_insight: An Observable is not just a sequence of values — it is a sequence of (time, value) pairs. The time dimension is always present, even when you ignore it, and time operators make the implicit explicit.
related: ["4.5", "5.2"]
---

## Hook

You have been thinking of an Observable as an asynchronous array — a list of values that happen to arrive over time. That model is missing a dimension. Every value arrives at a specific moment, and that moment is part of the data just as much as the value itself. Ignore the time dimension and you are building on an incomplete model, one that will fail you the instant you need to reason about when values arrive.

## Insight

Formally, `Observable<T>` can be modeled as `Array<{ timestamp: number; value: T }>` ordered by timestamp. The `timestamp()` operator makes this concrete by wrapping each emission in `{ value: T, timestamp: number }`. But the deeper point is structural: arrays organise values by position (a spatial structure), while Observables organise values by moment in time (a temporal structure).

That distinction has real consequences. Arrays support random access — `arr[5]` is instant and always valid. Observables do not; you receive values as they arrive and cannot index backwards. Array length is known at construction time, or at worst after a single traversal. Observable length may be unknown or infinite — you do not know how many values will arrive, or whether the stream will ever complete. With an array you control the iteration: you decide when to read the next item. With an Observable the stream drives you: values arrive on their own schedule.

This is why RxJS has two families of operators. T-only operators — `map`, `filter`, `scan` — work in the value dimension alone; they are indifferent to timing. Time operators — `delay`, `debounceTime`, `throttleTime`, `timestamp` — work in the temporal dimension. Understanding which dimension an operator acts on is the first step to choosing the right one.

## Example

The `timestamp()` operator makes the temporal model visible. Each emission is wrapped in a `TimestampedValue<T>` object carrying both the original value and the wall-clock millisecond at which it arrived.

```typescript
import { interval } from 'rxjs';
import { timestamp, take } from 'rxjs/operators';

interface TimestampedValue<T> {
	value: T;
	timestamp: number;
}

interval(1000).pipe(
	timestamp(),
	take(3),
).subscribe((item: TimestampedValue<number>) => {
	console.log(`value: ${item.value}, at: ${item.timestamp}ms`);
});
// value: 0, at: 1713260001000ms
// value: 1, at: 1713260002000ms
// value: 2, at: 1713260003000ms
```

The values `0`, `1`, `2` are the spatial content. The timestamps `1713260001000`, `1713260002000`, `1713260003000` are the temporal dimension. Both are always present; `timestamp()` simply surfaces what was always there.

## Summary

- Observable = `[(timestamp, value)]` — time is always a dimension, not just a delivery mechanism
- Arrays are spatial (position-indexed); Observables are temporal (moment-indexed), which means no random access and no known length
- `timestamp()` makes the implicit time dimension explicit; time operators act on this dimension while value operators ignore it
