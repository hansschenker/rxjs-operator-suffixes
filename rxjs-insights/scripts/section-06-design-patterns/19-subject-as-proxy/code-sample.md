# Subject Is a Proxy — Code Sample

**Section:** Design Patterns
**Insight:** Subject as proxy
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This code sample demonstrates the Subject-as-proxy pattern in its most direct form — wiring a cold Observable through a Subject to serve multiple consumers.

```typescript
import { interval, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

// Cold source — would run independently per subscriber
const source$ = interval(1000).pipe(take(4));

// Subject acts as the proxy — one subscription to the source
const proxy$ = new Subject<number>();

// Two consumers share the same source via the proxy
proxy$.subscribe(v => console.log('Consumer A:', v));
proxy$.subscribe(v => console.log('Consumer B:', v));

// Subscribe the proxy (as Observer) to the source (as Observable)
source$.subscribe(proxy$);

// A and B both receive: 0, 1, 2, 3
// The interval runs only once
```

Let me walk through this step by step.

First, `source$` is a cold Observable: an `interval` that emits `0, 1, 2, 3` over four seconds then completes. If we subscribed to it directly twice, we'd get two independent intervals running simultaneously — Consumer A would have its own counter and Consumer B would have its own counter.

Instead, we create `proxy$` — a plain `Subject<number>`. We then subscribe Consumer A and Consumer B to the Subject, not to the source. At this point, nothing is running yet. The consumers are registered but no data is flowing.

Now the key line: `source$.subscribe(proxy$)`. We pass the Subject itself as the Observer argument to `subscribe`. This works because a Subject implements the Observer interface — it has `next`, `error`, and `complete` methods. When the interval emits `0`, it calls `proxy$.next(0)`. The Subject receives that via its Observer role, and immediately forwards it to every active subscriber via its Observable role. Consumer A gets `0`. Consumer B gets `0`. Same emission, same value, zero duplication.

The interval runs exactly once. Both consumers share that single execution. That's the proxy at work.

Notice the ordering matters here. Both consumers subscribed to the proxy before we subscribed the proxy to the source. That's because a plain `Subject` has no memory — if the source had started emitting before Consumer A or B subscribed, they'd have missed those values. If you can't guarantee the ordering, switch to a `BehaviorSubject` with an initial value, and late subscribers will receive the last emission immediately on subscription.

Also notice what happens when the source completes: `interval(1000).pipe(take(4))` completes after four emissions. The `complete` call flows through the Subject to all subscribers, closing their subscriptions automatically. Clean teardown, no manual unsubscribe needed.

This pattern — Subject as the explicit proxy — is exactly what `share()` automates. Understanding it at this level makes `share()` transparent rather than mysterious.
