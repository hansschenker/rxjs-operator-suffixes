# RxJS Is Three Things — Code Sample

**Section:** Composition & Concurrency
**Insight:** RxJS is 3 things
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

Here's a snippet that puts all three pillars of RxJS into a single pipeline. Let's read it carefully.

```typescript
import { interval } from 'rxjs';
import { map, take, observeOn } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

// All three pillars in one pipeline:
interval(1000, asyncScheduler) // Observable + Scheduler (creation)
  .pipe(
    map(n => n * n),            // Operator (value transformation)
    take(5),                    // Operator (count boundary)
    observeOn(asyncScheduler)   // Scheduler (delivery control)
  )
  .subscribe(console.log);
```

Start at the top. We import interval from rxjs — that's the creation layer, the first pillar. interval returns an Observable. It doesn't start producing values until something subscribes to it. That laziness is the container contract.

The second argument to interval is asyncScheduler. This is the Scheduler parameter that creation operators accept. It tells interval which execution context to use when it fires each tick. asyncScheduler delegates to setTimeout, so each tick is a new macrotask. By passing the Scheduler explicitly here, we're wiring the first and third pillars together at the creation site.

Inside the pipe, map is the first operator. It takes each emitted number n and squares it. There's no side effect here, no external state — it's a pure function applied to each value in the stream. This is the operator layer, the LINQ-style query vocabulary.

take is the second operator. It passes values through until the count reaches five, then completes the stream automatically. You don't need to unsubscribe manually. take is the operator-layer equivalent of a LINQ Take clause — a count boundary on the sequence.

Then observeOn reintroduces the Scheduler layer mid-pipeline. After all the value transformations are done, observeOn wraps the downstream observer so every next notification is scheduled through asyncScheduler before it reaches the subscriber. This is the third pillar controlling delivery, not production.

Notice that asyncScheduler appears twice. The first time, it controls when values are produced by the interval. The second time, via observeOn, it controls when those values are delivered to the subscriber. In this case both are asyncScheduler, so the effect is redundant — but the point is architectural: production and delivery are separate concerns, each controlled independently by a Scheduler.

The subscribe call at the end is what activates the whole chain. Nothing above runs until this line. The Observable is lazy, the operators compose the description, and subscription triggers execution. That sequence — describe, compose, activate — is the fundamental rhythm of RxJS.

Three pillars, one pipeline. The Observable is the container. The operators are the query vocabulary. The Schedulers control when. Remove any one of them and you've lost a dimension of control that the other two can't recover.
