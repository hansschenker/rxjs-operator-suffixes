---
module: 4
lesson: "4.4"
title: T-only operators — the purely value-based family
key_insight: T-only operators are the cheapest operators in RxJS — no timers, no buffers, no scheduler dependency. They transform values synchronously, and every bug they cause is a value-logic bug, not a timing bug.
related: ["4.5", "5.1"]
---

## Hook

Not all RxJS operators have the same cost. Some spawn timers. Some allocate internal ring buffers. Some require a scheduler to control when emissions are delivered. T-only operators do none of these — and knowing that about an operator immediately tells you three things before you write a single test: its performance profile, how to test it, and which category of bugs it is capable of producing. That is a lot of information from a one-word classification.

## Insight

T-only operators have the effective signature `(value: T) => result` — they only need the current emission value to produce their output. No scheduler reference, no timestamp, no clock. The only state they may carry is value-derived state: a previous value for comparison (`distinctUntilChanged`), a running accumulation (`scan`), or an emission count (`take`, `skip`). That state is still value logic, not timing logic.

Examples of T-only operators: `map`, `filter`, `tap`, `scan`, `take`, `skip`, `first`, `last`, `distinctUntilChanged`, `pairwise`, `bufferCount`, `pluck`, `mapTo`.

Three practical consequences follow from the T-only classification:

**Performance**: T-only operators are the cheapest class. No `setTimeout`, no `setInterval`, no scheduler indirection. They process emissions synchronously in the same microtask as the source emission. Pipelines composed entirely of T-only operators have essentially zero scheduler overhead.

**Testability**: T-only operators are trivially testable. Feed them values with `of()`, assert synchronously, done. No `TestScheduler`, no virtual time, no `fakeAsync`. The test runs in under a microsecond and never flakes.

**Debugging scope**: When a T-only operator produces a bug, the bug is always in the value logic. Wrong transformation, wrong predicate, wrong accumulator function. If a bug only appears under load or only under specific timing conditions — a T-only operator is not the cause. You can cross it off your list of suspects immediately.

This scoping is what makes the classification useful during debugging. Knowing what an operator *cannot* do is as valuable as knowing what it can.

## Example

A pure T-only pipeline tested with synchronous assertions — no `TestScheduler` required:

```typescript
const results: number[] = [];

of(1, 2, 3, 2, 4, 3, 5).pipe(
	filter((n: number): boolean => n > 2),
	map((n: number): number => n * 10),
	distinctUntilChanged(),
).subscribe((n: number) => results.push(n));

// Synchronous — no await, no TestScheduler, no fakeAsync
// filter passes: 3, 4, 3, 5
// map produces: 30, 40, 30, 50
// distinctUntilChanged compares adjacent pairs only — 30→40 (pass), 40→30 (pass), 30→50 (pass)
console.log(results); // [30, 40, 30, 50]
```

All four operators are T-only. The entire test is three lines. If the output is wrong, there is exactly one place to look: the value logic in `filter`, `map`, or the equality comparison in `distinctUntilChanged`.

## Summary

- T-only = synchronous value transform, no timers, no buffers, no scheduler dependency
- Testable with `of()` and synchronous assertions — `TestScheduler` is never needed for a T-only pipeline
- Every bug a T-only operator produces is a value-logic bug; timing pressure cannot reveal new failure modes in T-only code
