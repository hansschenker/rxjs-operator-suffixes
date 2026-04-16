---
module: 10
lesson: "10.4"
title: TestScheduler and Marbles
exercise: Write a TestScheduler marble test for a debounced search facade, making the 300ms wait run in virtual time.
difficulty: intermediate
---

## Scenario

Testing `debounceTime(300)` with real timers means each assertion takes 300ms — a suite of 20 tests would take 6 seconds just for debounce waits. With `TestScheduler`, the entire suite runs in under 10ms. The facade under test combines `debounceTime` and `distinctUntilChanged`.

## Starter Code

```typescript
// Note: run inside a Vitest or Jest test (import { describe, test, expect } from 'vitest')
import { TestScheduler } from 'rxjs/testing';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable } from 'rxjs';

function searchFacade(query$: Observable<string>): Observable<string> {
	return query$.pipe(
		debounceTime(300),
		distinctUntilChanged(),
	);
}

// EXERCISE: write marble tests for the following scenarios

// Scenario 1: rapid typing — only the last value after the pause should emit
// Input:  '--a--b--c-----------d|'  (a,b,c typed quickly, then pause, then d)
// Output: '???' — fill in the expected marble

// Scenario 2: two identical values after debounce — distinctUntilChanged should suppress the second
// Input:  '--a-----------a--|'
// Output: '???' — fill in the expected marble

// Scenario 3: timeout operator — stream must emit within 5000ms or error
// Input (emits too late): '-'.repeat(501) + '(a|)'  (a arrives at frame 5010ms)
// Output: '???' — should error at 5000ms, not emit a
// Use: timeout({ each: 5000 })

const scheduler = new TestScheduler((actual, expected) =>
	expect(actual).toEqual(expected),
);

scheduler.run(({ hot, cold, expectObservable }) => {
	// EXERCISE: implement all three test scenarios using hot()/cold() and expectObservable()
});
```

## Task

1. Implement Scenario 1 inside `scheduler.run`: define the hot input marble and predict the expected output marble, accounting for the 300ms (30-frame) debounce delay from the last emission before the pause.
2. Implement Scenario 2: show that a repeated identical value after debounce is suppressed by `distinctUntilChanged` and does not appear in the output.
3. Implement Scenario 3: write a `cold()` source that emits a value at frame 5010ms and apply `timeout({ each: 5000 })`; assert that the output errors at frame 5000ms with a `TimeoutError` before the value arrives.
4. Add a plain-English comment next to each `expectObservable` call explaining what business behaviour it verifies.

## Hint

In `TestScheduler.run()`, each `-` character represents 10 virtual milliseconds. 300ms = 30 frames = 30 dashes. Count the frames from the last emission to when the debounced value fires.
