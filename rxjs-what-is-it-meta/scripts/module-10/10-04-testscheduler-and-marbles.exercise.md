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

const scheduler = new TestScheduler((actual, expected) =>
	expect(actual).toEqual(expected),
);

scheduler.run(({ hot, expectObservable }) => {
	// EXERCISE: implement both test scenarios using hot() and expectObservable()
});
```

## Task

1. Implement Scenario 1 inside `scheduler.run`: define the hot input marble and predict the expected output marble, accounting for the 300ms (30-frame) debounce delay from the last emission before the pause.
2. Implement Scenario 2: show that a repeated identical value after debounce is suppressed by `distinctUntilChanged` and does not appear in the output.
3. Add a plain-English comment next to each `expectObservable` call explaining what business behaviour it verifies.

## Hint

In `TestScheduler.run()`, each `-` character represents 10 virtual milliseconds. 300ms = 30 frames = 30 dashes. Count the frames from the last emission to when the debounced value fires.
