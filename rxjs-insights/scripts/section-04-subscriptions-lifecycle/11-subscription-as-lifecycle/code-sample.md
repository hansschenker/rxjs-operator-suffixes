# A Subscription Is a Lifecycle — Code Sample

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription as lifecycle
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

Let's look at the teardown contract in the simplest possible form — a custom Observable that wraps a setInterval and cleans it up correctly.

```typescript
import { Observable } from 'rxjs';

const ticking$ = new Observable<number>(observer => {
  let n = 0;
  const id = setInterval(() => observer.next(n++), 500);

  // Teardown: runs on unsubscribe
  return () => {
    clearInterval(id);
    console.log('Interval cleared — no more ticks');
  };
});

const sub = ticking$.subscribe(n => console.log('Tick:', n));

setTimeout(() => {
  sub.unsubscribe(); // triggers teardown
  console.log('Subscription closed:', sub.closed); // true
}, 2000);
```

Let's walk through this. The Observable constructor takes a subscribeFn — the function that receives the observer and starts the work. Here, we create a counter variable n, then start a setInterval that calls observer.next(n++) every 500 milliseconds. That's the producer. It will tick forever unless something stops it.

The return value of the subscribeFn is the teardown. We're returning a function that calls clearInterval(id) and logs a message. This function is what RxJS will call when the subscription is ended — either by unsubscribe(), or by a natural complete(), or by an error(). Notice that the teardown has closure over id, so it has direct access to the interval handle it needs to clear. That closure pattern is how you capture external resources inside a teardown.

Next we subscribe and store the result in sub. At this point the interval is running. Every 500 milliseconds, observer.next() fires and our console.log prints "Tick:" followed by the counter value.

After 2000 milliseconds, the setTimeout fires and we call sub.unsubscribe(). RxJS immediately marks the Subscription as closed, then runs the teardown function we registered. clearInterval(id) is called — the interval stops, no more ticks. Then the log line "Interval cleared — no more ticks" appears. Finally, we check sub.closed and see true.

The order matters here. sub.closed becomes true before your teardown runs — the Subscription is considered closed at the moment unsubscribe() is called, not after the teardown finishes. This prevents re-entrant cleanup issues.

Now imagine you remove the return statement and the teardown function entirely. Everything looks the same — the interval runs, ticks appear, unsubscribe() is called. But clearInterval() is never called. The interval keeps firing. The console stays silent but the timer callback is still allocating memory and executing every 500 milliseconds. Without a teardown, the Observable is lying about cleanup. Every long-lived producer you wrap in an Observable needs a corresponding teardown to make the lifecycle contract complete.
