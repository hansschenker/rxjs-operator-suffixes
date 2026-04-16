---
module: 2
lesson: "2.2"
title: Cold vs Hot — the producer behavior distinction
key_insight: Hot and Cold describe the producer, not the Observable. A cold Observable creates a fresh producer per subscriber; a hot Observable shares one already-running producer with everyone.
related: ["6.1", "6.2"]
---

## Hook

"Hot" and "cold" sound like temperature — a vague feeling, not a precise rule. They actually describe something exact: whether the data producer existed before you subscribed, or was created because you subscribed. Get that distinction right and the behavior of every Observable you encounter becomes predictable.

## Insight

A **cold** Observable creates its producer inside the `subscribe()` call. Every subscriber gets their own private, independent producer that starts from scratch. The producer's entire lifecycle is scoped to a single subscription. `ajax.getJSON()`, `interval()`, `of()`, `from()` — all cold. Subscribe late to a cold Observable and you start from the beginning, as if no time has passed.

A **hot** Observable has a producer that exists independently, before any subscriber arrives. Subscribers join an already-running stream. DOM events, WebSocket connections, and Subjects are all hot. Subscribe late to a hot Observable and you join mid-stream — you miss every value emitted before you arrived.

The terms describe the **producer's relationship to time and subscriber count**, not the Observable object itself. The same cold Observable can be made hot by routing it through a shared multicasting layer. `share()` does exactly this: it creates a single Subject internally, connects it to the source on the first subscribe, and forwards emissions to all current subscribers. The source runs once; the Subject fans it out.

This distinction determines whether your subscribers get independent executions or a shared timeline. Choosing wrong means either wasted work (cold when hot is needed) or missed values (hot when cold is needed).

## Example

`interval(1000)` is cold. Subscribe twice with a 2-second gap between subscriptions and both subscribers run independent timers starting from zero.

```typescript
import { interval } from 'rxjs';
import { share } from 'rxjs/operators';

// Cold: each subscriber gets its own independent timer
const cold$ = interval(1000);

cold$.subscribe((n: number) => console.log('A:', n));
// A: 0, 1, 2, 3 ...

setTimeout(() => {
	cold$.subscribe((n: number) => console.log('B:', n));
	// B: 0, 1, 2, 3 ... — starts from zero, not from 2
}, 2000);

// Hot: one shared timer, late subscriber joins mid-stream
const hot$ = interval(1000).pipe(share());

hot$.subscribe((n: number) => console.log('A:', n));
// A: 0, 1, 2, 3 ...

setTimeout(() => {
	hot$.subscribe((n: number) => console.log('B:', n));
	// B: 2, 3, 4 ... — joins at the current value, misses 0 and 1
}, 2000);
```

Subscriber B on the cold stream restarts from zero — its own private timer. Subscriber B on the hot stream joins at value 2 because the shared producer has been running for two seconds already.

## Summary

- Cold = producer created inside `subscribe()`, private per subscriber, always starts from the beginning
- Hot = producer exists independently, shared by all subscribers, late arrivals miss past values
- `share()` converts cold to hot; `shareReplay(n)` converts cold to hot and replays the last `n` values to late subscribers
