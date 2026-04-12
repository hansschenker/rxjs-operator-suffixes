# Unicast and Multicast — Code Sample

**Section:** Design Patterns
**Insight:** Unicast vs multicast
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This sample puts unicast and multicast side by side so you can see the practical difference in a few lines.

```typescript
import { Observable, Subject } from 'rxjs';

// Unicast: each subscriber triggers independent execution
const unicast$ = new Observable<number>(observer => {
  observer.next(Math.random());
  observer.complete();
});

unicast$.subscribe(v => console.log('Unicast S1:', v)); // e.g. 0.42
unicast$.subscribe(v => console.log('Unicast S2:', v)); // e.g. 0.87 — different!

// Multicast: one shared value broadcast to all subscribers
const multicast$ = new Subject<number>();

multicast$.subscribe(v => console.log('Multicast S1:', v));
multicast$.subscribe(v => console.log('Multicast S2:', v));

multicast$.next(Math.random()); // both S1 and S2 receive the same value
```

Let's walk through each half.

The `unicast$` Observable is constructed with a subscribe function that calls `observer.next(Math.random())` and then completes. Every time something subscribes to this Observable, the subscribe function runs again from the top. That means a fresh call to `Math.random()`. S1 might get `0.42` and S2 might get `0.87` — they'll almost certainly be different. Two subscriptions, two executions, two results.

Now imagine this wasn't `Math.random()` but an HTTP call inside `ajax()`. Two subscriptions would mean two HTTP requests. That's the accidental-unicast bug in its most common form.

The `multicast$` Subject works entirely differently. We subscribe S1 and S2 to the Subject — they're now listening, but nothing has happened yet. Then we call `multicast$.next(Math.random())`. This calls `Math.random()` exactly once, produces a single number, and the Subject broadcasts that same number to every active subscriber simultaneously. S1 and S2 receive identical values. One call to `Math.random()`, one result, shared.

The structure of these two examples is identical from the outside — two subscribers, one source — but the execution model is completely different. Unicast runs the producer N times for N subscribers. Multicast runs the producer once and distributes the result.

Notice the ordering constraint in the multicast example. Both subscribers registered before `next()` was called. If you called `next()` first and subscribed later, the plain Subject would have already fired and the late subscribers would miss it. In production code with timing you can't control, that's where `BehaviorSubject` or `shareReplay(1)` comes in — they buffer the last value and replay it to late arrivals.

The choice between unicast and multicast determines whether your side effects run once or N times. In most production applications, that's one of the most consequential choices you make when designing a data flow.

Here's a diagnostic hint: if you see an HTTP call fire twice when you expect it once, or a database write happen multiple times, or a WebSocket connection open for every component that subscribes, your Observable is almost certainly accidentally unicast. The fix is mechanical. Wrap the Observable with `shareReplay(1)` to materialize it into a multicast source, or feed it into a `BehaviorSubject` to manage the sharing yourself. Either approach converts the producer from running N times to running once, with the result distributed to all subscribers. Once you understand the unicast/multicast distinction, debugging these bugs becomes trivial — you're just looking for the missing `share()` call.
