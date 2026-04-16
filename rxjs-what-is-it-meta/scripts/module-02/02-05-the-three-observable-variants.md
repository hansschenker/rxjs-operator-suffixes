---
module: 2
lesson: "2.5"
title: The three Observable variants
key_insight: The three Observable variants — Standard, Connectable, and Subject — differ on exactly one axis: when the producer starts. Everything about multicasting follows from that single difference.
related: ["6.1", "6.2", "6.5"]
---

## Hook

RxJS has three types of Observable and most tutorials treat them as unrelated concepts with separate rules to memorize. They are the same concept expressed at three different points on a single axis: producer start time. Once you see that axis, the entire multicasting system — `share()`, `connectable()`, `BehaviorSubject`, `ReplaySubject` — collapses into one coherent model.

## Insight

**Standard Observable** (the default): the producer is created inside `subscribe()`. Nothing exists before subscription. Every subscriber gets a completely independent producer that starts from the beginning. Cold by default. One producer per subscriber. Examples: `of()`, `from()`, `ajax.getJSON()`, `interval()`.

**ConnectableObservable**: the producer is created once and starts when `.connect()` is called explicitly — regardless of how many subscribers are attached. Subscribers register with `subscribe()` as usual, but they do not trigger the producer. The source and the subscribers are decoupled: you can attach all subscribers first, then start the producer; or start the producer before any subscribers arrive. Created via `connectable(source$)` in RxJS 7+. Gives precise manual control over exactly when the shared execution begins.

**Subject as Observable**: the producer is the Subject itself — it was already running, or at least already exists, before anyone subscribes. Hot by default. New subscribers receive only future emissions; they miss everything that was pushed before they arrived. A Subject is both an Observer (you can call `.next()` on it) and an Observable (others can `.subscribe()` to it). Variants — `BehaviorSubject`, `ReplaySubject`, `AsyncSubject` — adjust what late subscribers receive, but all share the same fundamental characteristic: the producer precedes the subscriber.

All three differ on a single question: **does the producer start per-`subscribe()` (Standard), on explicit `.connect()` (Connectable), or before anyone subscribes (Subject)?** `share()` is a ConnectableObservable with automatic `connect()`/`disconnect()` driven by refCount — it bridges the gap between the Standard and Subject variants automatically.

## Example

The same `interval(1000)` source expressed as all three variants, showing when each subscriber starts receiving values relative to when the producer starts.

```typescript
import { interval, connectable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';

// --- Standard Observable (cold) ---
// Producer starts on each subscribe() call
const standard$ = interval(1000);

standard$.subscribe((n: number) => console.log('A standard:', n)); // producer 1 starts: 0,1,2,...
setTimeout(() => {
	standard$.subscribe((n: number) => console.log('B standard:', n)); // producer 2 starts: 0,1,2,...
}, 2000);
// B gets its own independent producer starting from 0 — not 2

// --- ConnectableObservable (manual hot) ---
// Producer starts only when .connect() is called
const connectable$ = connectable(interval(1000), {
	connector: () => new Subject<number>(),
});

connectable$.subscribe((n: number) => console.log('A connectable:', n));
connectable$.subscribe((n: number) => console.log('B connectable:', n));

// Both A and B are attached before the producer starts
const connection = connectable$.connect(); // producer starts here — both get 0,1,2,...

setTimeout(() => connection.unsubscribe(), 3500); // stops the shared producer

// --- Subject as Observable (always hot) ---
// Producer (the Subject itself) exists before any subscribe()
const subject$ = new Subject<number>();

subject$.subscribe((n: number) => console.log('A subject:', n));

let count: number = 0;
const id = setInterval(() => subject$.next(count++), 1000);

setTimeout(() => {
	subject$.subscribe((n: number) => console.log('B subject:', n));
	// B joins at whatever value the subject is currently at — misses all prior emissions
}, 2000);

setTimeout(() => clearInterval(id), 4000);

// --- share() = ConnectableObservable with automatic refCount ---
const shared$ = interval(1000).pipe(share());
// connect() is called automatically on first subscribe()
// disconnect() is called automatically when refCount drops to 0
```

## Summary

- Standard = producer per `subscribe()` call — cold by default, independent executions
- Connectable = producer starts on explicit `.connect()`, shared with all subscribers registered before or after
- Subject = producer already running before subscription — always hot, late subscribers miss past emissions
- `share()` is ConnectableObservable plus automatic `connect()`/`disconnect()` via refCount — the most common way to convert cold to hot
