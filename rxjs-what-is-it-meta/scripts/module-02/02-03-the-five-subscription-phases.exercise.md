---
module: 2
lesson: "2.3"
title: The five subscription phases
exercise: Add teardown logic to a leaking Observable and label each phase in the subscriber function.
difficulty: intermediate
---

## Scenario

The Observable below starts a polling interval and registers a DOM event listener. It has no teardown logic — when the subscription is unsubscribed, both the interval and the event listener keep running forever.

## Starter Code

```typescript
import { Observable } from 'rxjs';

interface PositionUpdate { x: number; y: number; timestamp: number; }

// BUG: no teardown — interval and event listener leak on unsubscribe
const position$ = new Observable<PositionUpdate>(subscriber => {
	let lastPosition = { x: 0, y: 0 };

	document.addEventListener('mousemove', (e: MouseEvent) => {
		lastPosition = { x: e.clientX, y: e.clientY };
	});

	const intervalId = setInterval(() => {
		subscriber.next({ ...lastPosition, timestamp: Date.now() });
	}, 100);

	// Missing: return a teardown function
});

const sub = position$.subscribe((pos: PositionUpdate) => console.log(pos));
setTimeout(() => sub.unsubscribe(), 3000); // teardown should run here
```

## Task

1. Add a teardown function (returned from the subscriber function) that removes the event listener and clears the interval.
2. Label each part of the subscriber function body with which of the five phases it belongs to: Setup, Running, Error, Complete, or Teardown.
3. Rewrite using `fromEvent` and `interval` from RxJS combined with an operator so that no manual resource management is needed at all.

## Hint

The subscriber function's return value is the teardown function — it runs during the Teardown phase on unsubscribe, error, or complete. Return a function that reverses every side effect the Setup phase created.
