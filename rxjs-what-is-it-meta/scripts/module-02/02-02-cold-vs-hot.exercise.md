---
module: 2
lesson: "2.2"
title: Cold vs Hot — the producer behavior distinction
exercise: Classify five Observables as hot or cold and convert one cold Observable into a hot, shared one.
difficulty: beginner
---

## Scenario

Before choosing a sharing strategy, you must correctly classify the producer. Misclassifying a hot Observable as cold leads to missed events; treating a cold Observable as hot leads to unexpected shared executions.

## Starter Code

```typescript
import { Observable, Subject, interval, fromEvent, of, BehaviorSubject } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// Classify each as HOT or COLD — fill in the comment with your answer and one-sentence reason

const a$ = interval(1000);
// Classification: ???  Reason: ???

const b$ = fromEvent<MouseEvent>(document, 'click');
// Classification: ???  Reason: ???

const c$ = ajax.getJSON<unknown>('/api/data');
// Classification: ???  Reason: ???

const d$ = new BehaviorSubject<number>(0);
// Classification: ???  Reason: ???

const e$ = of(1, 2, 3);
// Classification: ???  Reason: ???

// This cold Observable creates a new WebSocket per subscriber — convert it to hot
const coldWs$ = new Observable<MessageEvent>(subscriber => {
	const ws = new WebSocket('wss://example.com/feed');
	ws.onmessage = (e: MessageEvent) => subscriber.next(e);
	ws.onerror = () => subscriber.error(new Error('ws error'));
	ws.onclose = () => subscriber.complete();
	return () => ws.close();
});

const sharedWs$: Observable<MessageEvent> = /* ??? */;
```

## Task

1. Fill in the classification (HOT or COLD) and one-sentence reason for each of `a$` through `e$`.
2. Implement `sharedWs$` so all subscribers share one WebSocket connection that opens on first subscribe and closes when all subscribers unsubscribe.
3. Describe in one sentence what a late subscriber to `sharedWs$` receives — and why.

## Hint

Cold = the producer is created inside the subscribe function, fresh for each subscriber. Hot = the producer exists outside subscribe, already running. The keyword to look for is what happens inside `new Observable(subscriber => { ... })`.
