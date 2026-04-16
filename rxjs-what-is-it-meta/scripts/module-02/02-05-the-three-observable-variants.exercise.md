---
module: 2
lesson: "2.5"
title: The three Observable variants
exercise: Choose the correct Observable variant for three realistic scenarios and justify each choice.
difficulty: intermediate
---

## Scenario

A real-time dashboard needs three types of shared data streams. For each, you must choose between a standard cold Observable, `connectable()`, and a Subject variant — and implement it correctly.

## Starter Code

```typescript
import { Observable, Subject, BehaviorSubject, connectable, share, shareReplay, forkJoin } from 'rxjs';
import { ajax } from 'rxjs/ajax';

interface StockPrice { symbol: string; price: number; }

// Scenario A: Live stock price feed via WebSocket.
// Multiple panels subscribe at different times.
// Late-joining panels need the current price immediately on subscribe.
// The WebSocket must open once and stay open while any panel is subscribed.
const stockFeed$: Observable<StockPrice> = /* ??? */;

// Scenario B: One-time page initialisation loading user + config in parallel.
// Must NOT start until an explicit .connect() call after all panels are ready.
const initLoad$ = forkJoin({
	user: ajax.getJSON<unknown>('/api/me'),
	config: ajax.getJSON<unknown>('/api/config'),
});
const connectableInit$ = /* ??? */;
// Start execution:
// connectableInit$./* ??? */;

// Scenario C: UI action bus — button clicks and form submits dispatched imperatively.
// Components listen reactively. No initial value needed.
const uiActions$ = /* ??? */;
// Dispatch an action:
// uiActions$.next({ type: 'SUBMIT' });
```

## Task

1. Implement `stockFeed$` so all panels share one WebSocket and late subscribers see the most recent price. Explain why a plain Subject would not work.
2. Implement `connectableInit$` and show the line that starts execution.
3. Implement `uiActions$` with the correct Subject variant. Explain why `BehaviorSubject` would be wrong here.

## Hint

Standard Observable = cold, one producer per subscriber. `connectable()` = controlled start, shared producer. `Subject` = hot, imperative dispatch. `BehaviorSubject` = hot with current value replayed to late subscribers.
