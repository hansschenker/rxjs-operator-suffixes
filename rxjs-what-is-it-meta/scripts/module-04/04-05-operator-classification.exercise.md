---
module: 4
lesson: "4.5"
title: Operator classification
exercise: Classify 6 operator invocations as T-only, T+time, or time-only, and describe the correct testing strategy for each class.
difficulty: intermediate
---

## Scenario

Your team is writing a test suite for a complex pipeline and the test run is slow because someone used real `setTimeout`-based delays to test every operator, including the ones that don't involve time at all. Classifying each operator correctly will let you replace real-time tests with synchronous assertions or `TestScheduler` marble tests, cutting test time from seconds to milliseconds.

## Starter Code

```typescript
import { of, interval } from 'rxjs';
import {
	map, distinctUntilChanged, debounceTime,
	bufferTime, scan, throttleTime,
} from 'rxjs/operators';

// Classify each operator invocation below.
// Fill in: class (T-only | T+time | time-only), can-test-synchronously (yes | no), testing-tool

const pipeline = of(1, 1, 2, 3, 3, 4).pipe(
	map((x: number) => x * 2),
	// Class: ???  Can test synchronously: ???  Testing tool: ???

	distinctUntilChanged(),
	// Class: ???  Can test synchronously: ???  Testing tool: ???

	debounceTime(300),
	// Class: ???  Can test synchronously: ???  Testing tool: ???

	bufferTime(1000),
	// Class: ???  Can test synchronously: ???  Testing tool: ???

	scan((acc: number[], v: number[]) => [...acc, ...v], [] as number[]),
	// Class: ???  Can test synchronously: ???  Testing tool: ???
);

const throttled$ = interval(100).pipe(
	throttleTime(500),
	// Class: ???  Can test synchronously: ???  Testing tool: ???
);
```

## Task

1. Fill in the class, synchronous-testability, and testing tool for each of the six operator invocations above. Classes are: `T-only` (values only, no time), `T+time` (values shaped by time), `time-only` (time controls output regardless of values).
2. For each class, write one sentence describing the correct testing approach: plain `expect` assertions, `TestScheduler` marbles, or real `setTimeout`/`setInterval`.
3. Explain why `bufferTime(1000)` cannot be tested synchronously even though `scan` can — despite both accumulating values over time.

## Hint

T-only operators are deterministic given the input values alone — test them with plain assertions on a synchronous observable. T+time operators need virtual time — use `TestScheduler` marble notation. Operators that depend on real-world clocks (some edge cases of `throttleTime`) need real timers; most time operators in RxJS use a configurable scheduler so virtual time covers them.
