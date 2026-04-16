---
module: 5
lesson: "5.1"
title: Time-value pairs
exercise: Use zip to reveal that two streams with identical values but different timing produce different combined output.
difficulty: intermediate
---

## Scenario

Two Observables emit the same integers 1, 2, 3 — but one is synchronous and the other is asynchronous with a 1-second delay between values. A developer expects `zip` to produce `[1,1], [2,2], [3,3]` quickly because "both streams have the same values." This exercise demonstrates that `zip` is controlled by timing, not just values — and makes the temporal dimension visible by adding `timestamp()` to each source.

## Starter Code

```typescript
import { of, interval, zip } from 'rxjs';
import { take, map, timestamp } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

// Synchronous source: emits 1, 2, 3 with no delay
const sync$  = of(1, 2, 3);

// Asynchronous source: emits 1, 2, 3 with a 1-second gap between each
const async$ = interval(1000).pipe(take(3), map((i: number) => i + 1));

// EXERCISE 1: zip them and log the result — observe that timing controls when pairs emit
const zipped$ = zip(sync$, async$);

// EXERCISE 2: add timestamp() to each source before zipping
// so the temporal dimension is visible in the output
const timedSync$  = sync$.pipe(/* ??? */);
const timedAsync$ = async$.pipe(/* ??? */);

// Note: run this block inside a Vitest or Jest test (import { describe, test, expect } from 'vitest')
// TestScheduler requires a test runner for the expect() calls to work
// EXERCISE 3: write a TestScheduler marble test that verifies the timing
const scheduler = new TestScheduler((actual, expected) => {
	// ??? use expect(actual).toEqual(expected)
});
```

## Task

1. Subscribe to `zipped$` and explain why the first pair `[1, 1]` does not appear until 1 second after subscription, even though `sync$` emits 1 immediately.
2. Add `timestamp()` to each source, zip the timed streams, and log the `timestamp` fields — confirm that the pair's timestamp matches `async$`'s emission time, not `sync$`'s.
3. Write a `TestScheduler` marble test for `zipped$` using marble notation that shows exactly when each pair emits. Use `1000ms` frame notation.

## Hint

`zip` pairs the nth emission from each source. The first pair only emits when both sources have emitted their first value — which is gated by the slowest source. `sync$` emits all three values before `async$` emits its first; `zip` buffers them and only releases pairs as `async$` ticks. The `timestamp()` operator makes this gate visible by recording wall-clock (or virtual-clock) time on each value.
