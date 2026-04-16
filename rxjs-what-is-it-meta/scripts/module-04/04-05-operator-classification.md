---
module: 4
lesson: "4.5"
title: Operator classification — T-only vs T+time vs time-only
key_insight: Classifying an operator as T-only, T+time, or time-only before using it tells you its cost, its testability, and which layer of bugs to investigate. One classification does three jobs at once.
---

## Hook

When a stream behaves unexpectedly, the slowest path to the bug is reading every operator from the top. The fastest path is classifying each operator by which dimension it operates on — value, time, or both — and then reading only the operators that operate on the dimension where the symptom appears. The classification is free. You do the work once, then it guides every debugging session and every code review on that pipeline forever.

## Insight

Three classes cover every operator in the RxJS library:

**T-only** — operates only on the current emission value. No scheduler, no timestamp, no timer. Synchronous. Examples: `map`, `filter`, `tap`, `scan`, `distinctUntilChanged`, `take`, `skip`, `pairwise`. Cost: minimal. Test strategy: `of()` with synchronous assertions. Bug surface: value logic only.

**Time-only** — operates only on *when* emissions arrive. The value itself is irrelevant to the operator's decision-making; it is passed through unchanged. Examples: `debounceTime`, `throttleTime`, `delay`, `auditTime`, `sampleTime`, `interval`, `timer`. Cost: allocates at least one timer per subscription. Test strategy: `TestScheduler` with virtual time — synchronous testing is not reliable. Bug surface: timing logic only.

**T+time** — needs both the value and the timing. The operator's behavior changes based on what value arrived *and* when it arrived relative to other values. Examples: `bufferTime`, `windowTime`, `bufferWhen`, `windowWhen`, state machines that open a window on a specific value and close it after a duration. Cost: highest — allocates timers and internal buffers simultaneously. Test strategy: `TestScheduler` required. Bug surface: both value logic and timing logic may contribute to a failure.

Debugging heuristics derived from the classification: emissions carry the wrong *value* → inspect T-only operators first. Emissions arrive at the *wrong time* or are missing when they should appear → inspect time-only operators. Values are aggregated, grouped, or buffered *incorrectly over time* → inspect T+time operators.

These heuristics let you skip two thirds of the pipeline on every debugging session.

## Example

A realistic search-input pipeline, classified operator by operator:

```typescript
source$.pipe(
	// T-only: extracts the string value from the DOM event
	map((e: Event): string => (e.target as HTMLInputElement).value),

	// time-only: suppresses emissions until 300 ms of silence
	debounceTime(300),

	// T-only: drops the emission if the value has not changed
	distinctUntilChanged(),

	// T+time: cancels the previous inner Observable when a new value arrives
	// — timing (when the new value arrives) determines cancellation
	switchMap((q: string): Observable<Result[]> =>
		search(q).pipe(
			catchError((): Observable<Result[]> => of([])),
		)
	),
);
```

Wrong search results returned → look at the `map` predicate (T-only). Search fires too often or not at all → look at `debounceTime` (time-only). Stale results appear after fast typing → `switchMap` is not cancelling correctly (T+time — check both the value condition and the timing of new emissions).

## Summary

- T-only = value only, synchronous, test with `of()`, value-logic bugs only
- Time-only = timing only, requires `TestScheduler`, timing-logic bugs only
- T+time = both dimensions, most complex, allocates buffers and timers, both logic layers may fail
- Wrong value? Check T-only. Wrong timing? Check time-only. Wrong temporal grouping? Check T+time.
