---
module: 2
lesson: "2.3"
title: The five subscription phases
key_insight: A Subscription is not just a cancel handle — it is a lifecycle tracker with five ordered phases. Only one Error or Complete is ever delivered, and after either, the subscription is permanently closed.
related: ["2.1", "2.4", "9.1"]
---

## Hook

Every `subscribe()` call starts a lifecycle. Most developers know only one phase of that lifecycle — Unsubscribe — and use it as a cancel handle after the fact. Understanding all five phases is the difference between developers who debug subscription leaks and those who create them. The phases are ordered, exclusive, and they enforce guarantees that prevent entire classes of bugs.

## Insight

The five phases in sequence:

**(1) Subscribe** — `subscribe()` is called. The Observable's executor function runs. A teardown function is registered with the Subscription object. This phase happens exactly once and synchronously.

**(2) Next** — zero or more values arrive. Each value is delivered to the `next` handler in the order it was emitted. This phase can repeat indefinitely for infinite Observables, or complete immediately for `of()`.

**(3) Error** — at most one error is delivered to the `error` handler. This is a terminal event. The subscription is permanently closed. No further `next` values are delivered, even if the source emits them. The teardown function runs.

**(4) Complete** — at most one completion signal is delivered to the `complete` handler. This is also a terminal event. The subscription is permanently closed. The teardown function runs.

**(5) Unsubscribe** — manual cancellation via `subscription.unsubscribe()`. The teardown function runs and all child subscriptions are torn down recursively.

Error and Complete are mutually exclusive terminal states — an Observable cannot both error and complete. After either fires, calling `unsubscribe()` is a safe no-op: the Subscription is idempotent by design. This means your cleanup code in `takeUntil(destroy$)` or `ngOnDestroy` is always safe to call regardless of whether the stream already ended.

Every Observable should return a teardown function from its executor. This is the contract that guarantees resources — timers, listeners, sockets — are reclaimed whether the stream ends naturally or is cancelled externally.

## Example

A custom `timer$` Observable returns a teardown that clears the `setInterval`. The same teardown fires whether the stream is completed internally or cancelled externally by `unsubscribe()`.

```typescript
import { Observable } from 'rxjs';

const timer$ = new Observable<number>((observer) => {
	let count: number = 0;
	const id: ReturnType<typeof setInterval> = setInterval(
		() => observer.next(count++),
		1000,
	);

	// Teardown — runs on complete, error, OR unsubscribe
	return () => {
		clearInterval(id);
		console.log('teardown: interval cleared');
	};
});

const sub = timer$.subscribe({
	next: (n: number) => console.log('tick:', n),
	complete: () => console.log('done'),
});

// Phases in action:
// t=0s  → Subscribe phase: executor runs, teardown registered
// t=1s  → Next phase: tick: 0
// t=2s  → Next phase: tick: 1
// t=3s  → Next phase: tick: 2
// t=3.5s → Unsubscribe phase: teardown fires, interval cleared

setTimeout(() => sub.unsubscribe(), 3500);
```

Remove the `return () => clearInterval(id)` and you have a leak — the timer keeps running after `unsubscribe()` because the Subscription has nothing to clean up.

## Summary

- Five phases: Subscribe → Next* → (Error | Complete) → Unsubscribe
- Error and Complete are both permanent terminal states — the subscription closes and the teardown runs after either
- Always return a teardown function from custom Observables; omitting it is the most common cause of timer and listener leaks
