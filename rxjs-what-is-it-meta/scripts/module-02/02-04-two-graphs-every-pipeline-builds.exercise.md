---
module: 2
lesson: "2.4"
title: Two graphs every pipeline builds
exercise: Draw both graphs for a pipeline and identify which nodes remain alive after a partial unsubscribe.
difficulty: advanced
---

## Scenario

Understanding the two-graph model is the key to diagnosing memory leaks. This exercise makes both graphs explicit for a real pipeline and asks you to trace what happens when only some subscribers unsubscribe.

## Starter Code

```typescript
import { fromEvent, interval } from 'rxjs';
import { switchMap, share, take } from 'rxjs/operators';

const button$ = fromEvent<MouseEvent>(document.getElementById('start')!, 'click');
const timer$ = interval(1000).pipe(take(10));
const shared$ = button$.pipe(
	switchMap(() => timer$),
	share(),
);

const sub1 = shared$.subscribe((v: number) => console.log('A:', v));
const sub2 = shared$.subscribe((v: number) => console.log('B:', v));

// EXERCISE: Implement a helper that tells you how many active subscriptions share$ currently has.
// Hint: share() uses refCount internally — what does that mean for the source subscription?
let activeCount: number = /* ??? */;
```

## Task

1. Draw the **dependency graph**: boxes for `button$`, `timer$`, `shared$`; arrows showing value flow; label each edge with the operator connecting them.
2. Draw the **subscription graph**: boxes for `sub1`, `sub2`, the `share()` internal subscription, and each source subscription; arrows showing which node tears down which when `unsubscribe()` is called.
3. Answer: if only `sub1.unsubscribe()` is called, does the `button$` event listener get removed? Why or why not? What must happen for it to be removed?
4. Implement `activeCount` — write an expression or short code snippet that would let you observe how many consumers are currently sharing the `share()` internal subscription. (Hint: `share()` unsubscribes from the source when `activeCount` reaches 0.)

## Hint

The dependency graph is static — built at pipe time, describes value flow. The subscription graph is dynamic — built at subscribe time, describes teardown propagation. `share()` creates one internal subscription shared by all external consumers; the source only tears down when that internal subscription is the last one standing.
