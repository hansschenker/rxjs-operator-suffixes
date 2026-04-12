# The Canonical Three-Step Workflow — Code Sample

**Section:** Subscriptions & Lifecycle
**Insight:** Three-step workflow
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

Let's look at the three-step workflow in code, deliberately laid out so each zone is visible at a glance.

```typescript
import { interval } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

// Step 1: Enter — creation operator lifts a timer into Observable world
interval(1000).pipe(

  // Step 2: Transform — pure operators, no side effects
  map(n => n * n),
  filter(n => n % 2 === 0),
  take(4)

// Step 3: Exit — subscribe is the only place for side effects
).subscribe({
  next: n    => console.log('Value:', n),
  error: e   => console.error('Error:', e),
  complete: () => console.log('Done')
});
```

Let's go zone by zone. interval(1000) is the creation step. It's the entry gate that lifts the passage of time into the Observable world. Every thousand milliseconds it emits a zero-indexed integer: 0, 1, 2, 3, and so on. This is the source of truth for the whole pipeline. At this point, nothing is running yet — we're still building the lazy description.

Inside pipe(), we have three operators. map(n => n * n) squares each incoming integer. It takes a value, computes something from it, and emits the result. No logging. No mutations. Pure function. filter(n => n % 2 === 0) only passes through even squares. Again, no side effects — it either forwards the value or it doesn't. take(4) adds a completion boundary, letting exactly four values through before calling complete() and unsubscribing. These three operators are pure transformations. They describe a sequence of operations, but they don't perform them yet.

subscribe() is the trigger. It collapses the entire lazy description into a running execution. The interval starts ticking. When a value arrives, it passes through map, then filter, then take. If all three let it through, it reaches the next callback in subscribe() and we print it. When take(4) has seen four values, it calls complete(), the complete callback prints "Done", and the subscription closes — the interval is cleaned up automatically by take's teardown.

Here's a deliberately wrong version to contrast with. Imagine writing map(n => { console.log('saw:', n); return n * n; }). That console.log is a side effect inside a pure transformation. It works, but now your map does invisible work. If you test this pipeline with a TestScheduler, the logs will appear during the test run. If you use this operator in two different places, you get double-logging. If you refactor and move the logging, you change the observable's behavior without touching the subscribe block. The fix is straightforward — move the log into a tap() call placed before or after the map, making the side effect explicit and separately removable.

Three zones. One direction of flow. Side effects only at the exit. That's the discipline that makes RxJS pipelines maintainable at scale.
