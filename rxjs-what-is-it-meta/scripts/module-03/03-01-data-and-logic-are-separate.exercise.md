---
module: 3
lesson: "3.1"
title: Data and logic are separate
exercise: Separate the data (Observable) from the logic (returned pipeline) in a function that currently subscribes internally.
difficulty: intermediate
---

## Scenario

A colleague wrote a `processUserEvents` function that does useful work — debouncing, deduplication, and enrichment — but it subscribes internally and mutates an external array. This makes it impossible to test, impossible to compose, and impossible to cancel. Refactoring it to return an Observable instead will make all three problems disappear.

## Starter Code

```typescript
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

interface UserEvent { userId: number; action: string; }
interface ProcessedEvent { userId: number; action: string; processedAt: number; }

// BUG: subscribes internally, mutates external state, returns nothing useful
const processedLog: ProcessedEvent[] = [];

function processUserEvents(events$: Observable<UserEvent>): void {
	events$.pipe(
		debounceTime(200),
		distinctUntilChanged((a, b) => a.action === b.action),
		map((e: UserEvent): ProcessedEvent => ({
			...e,
			processedAt: Date.now(),
		})),
	).subscribe((processed: ProcessedEvent) => {
		processedLog.push(processed);         // mutates external state
		console.log('Processed:', processed); // untestable side effect
	});
}

const userEvents$ = new Subject<UserEvent>();
processUserEvents(userEvents$);
```

## Task

1. Rewrite `processUserEvents` so it returns `Observable<ProcessedEvent>` and does not call `subscribe` internally.
2. Remove the `processedLog` external array — the caller is now responsible for subscribing and doing whatever they want with the values.
3. Show how the caller would subscribe to the returned Observable and push values into `processedLog` — demonstrating that the data and the storage concern are now cleanly separated.

## Hint

A function that takes an Observable and returns an Observable is an operator. The `subscribe` call belongs at the call site, not inside the function — once you remove it, every downstream decision (storage, logging, cancellation) becomes the caller's responsibility.
