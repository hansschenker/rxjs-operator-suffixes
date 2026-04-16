---
module: 8
lesson: "8.1"
title: Temporal Alignment
exercise: Predict the output of three combining operators applied to the same two sources, then verify with TestScheduler marbles.
difficulty: intermediate
---

## Scenario

Two sources `a$` and `b$` emit values at different times. Three different combination operators are applied to them. The student must predict what each operator produces before running the marble test — then reconcile any differences between prediction and actual output.

## Starter Code

```typescript
import { TestScheduler } from 'rxjs/testing';
import { combineLatest, zip } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
// Note: run inside a Vitest or Jest test for expect() to work

const scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));

// Source a$ emits at frames 10, 30, 50 — values 'a1', 'a2', 'a3'
// Source b$ emits at frames 20, 40 — values 'b1', 'b2'

scheduler.run(({ hot, expectObservable }) => {
	const a$ = hot('--a1--a2--a3|', { a1: 'a1', a2: 'a2', a3: 'a3' });
	const b$ = hot('----b1----b2|', { b1: 'b1', b2: 'b2' });

	// EXERCISE: predict the output marble for each operator before running

	// combineLatest — emits every time any source emits (after both have emitted at least once):
	const combined$ = /* ??? */;
	expectObservable(combined$).toBe('????'); // EXERCISE: fill in the expected marble

	// withLatestFrom — a$ triggers, samples latest b$ at that moment:
	const withLatest$ = a$.pipe(withLatestFrom(b$));
	expectObservable(withLatest$).toBe('????');

	// zip — pairs emissions by index (1st with 1st, 2nd with 2nd):
	const zipped$ = /* ??? */;
	expectObservable(zipped$).toBe('????');
});
```

## Task

1. Fill in each `???` with the correct operator invocation for `combined$` and `zipped$`.
2. Predict and fill in the expected output marble string for each of the three operators.
3. Run the test — if your prediction was wrong, read the actual output and explain in one sentence why the operator produced that timing instead.

## Hint

Every combining operator answers two questions — when do I emit, and which values do I use? Work through each answer before writing the marble.
