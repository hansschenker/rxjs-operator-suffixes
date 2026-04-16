---
module: 4
lesson: "4.4"
title: T-only operators
exercise: Replace three unnecessary debounceTime(0) calls with the correct T-only operators and explain the performance difference.
difficulty: intermediate
---

## Scenario

A developer read that `debounceTime(0)` "defers" execution and used it as a blunt tool throughout a pipeline to handle three different concerns: filtering out duplicate values, suppressing falsy values, and transforming a shape. The code works, but each `debounceTime(0)` creates a hidden async boundary — delaying results by one event loop tick and making the pipeline untestable with synchronous marble tests.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

interface SearchResult { query: string; count: number; }

const searchInput = document.getElementById('search') as HTMLInputElement;
const input$ = fromEvent<Event>(searchInput, 'input');

const results$ = input$.pipe(
	map((e: Event) => (e.target as HTMLInputElement).value),

	// SMELL 1: used debounceTime(0) to "skip repeated values"
	debounceTime(0),

	// SMELL 2: used debounceTime(0) to "skip empty strings"
	debounceTime(0),

	// SMELL 3: used debounceTime(0) to "ensure transform runs after filter"
	debounceTime(0),
	map((query: string): SearchResult => ({ query, count: query.length })),
);
```

## Task

1. Replace SMELL 1 with the correct T-only operator that filters out consecutive duplicate values. Explain in one sentence why it is cheaper than `debounceTime(0)`.
2. Replace SMELL 2 with the correct T-only operator that suppresses falsy / empty values. Import only what is necessary.
3. Remove SMELL 3 entirely — explain why `debounceTime(0)` between two synchronous operators has no logical effect and what the developer was actually confused about.
4. Write the corrected pipeline with all three smells fixed and verify that it can now be tested synchronously without a `TestScheduler`.

## Hint

T-only operators (`map`, `filter`, `distinctUntilChanged`, `take`, `skip`) operate purely on values with no time dimension — they execute synchronously and add zero async overhead. `debounceTime(0)` is never a substitute for a missing operator; it just introduces a microtask delay that masks the real problem.
