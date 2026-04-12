# Schedulers Control Time and Concurrency — Code Sample

**Section:** Composition & Concurrency
**Insight:** Schedulers
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This snippet demonstrates the most visceral way to understand Schedulers: two Observables with identical structure, different Schedulers, completely different execution order.

```typescript
import { of } from 'rxjs';
import { observeOn } from 'rxjs/operators';
import { asyncScheduler, queueScheduler } from 'rxjs';

console.log('--- start ---');

of(1, 2, 3).pipe(
  observeOn(queueScheduler)
).subscribe(v => console.log('queue:', v));

of(4, 5, 6).pipe(
  observeOn(asyncScheduler)
).subscribe(v => console.log('async:', v));

console.log('--- end ---');

// Output:
// --- start ---
// queue: 1
// queue: 2
// queue: 3
// --- end ---
// async: 4
// async: 5
// async: 6
```

Let's read through what happens. The first console.log fires synchronously: "--- start ---" appears immediately. That's straightforward.

The first pipeline uses of to create a synchronous source and routes it through observeOn(queueScheduler). The queueScheduler is synchronous — it runs work in the current call stack using a trampoline. So when we subscribe, the values 1, 2, and 3 are delivered before subscribe returns. The three "queue:" lines appear before we reach the second pipeline.

The second pipeline uses the same structure — of creates a synchronous source — but routes it through observeOn(asyncScheduler). The asyncScheduler defers work via setTimeout. So when we subscribe, the emissions are scheduled as macrotasks and do not run yet. Subscribing returns immediately and execution continues to the next line.

That next line is the second console.log: "--- end ---". It fires synchronously, before any of the async emissions have had a chance to run. So "--- end ---" appears while the values 4, 5, and 6 are still waiting in the setTimeout queue.

Only after the current synchronous task — this entire script — has finished does the event loop process the queued setTimeout callbacks. Then "async: 4", "async: 5", "async: 6" appear in order.

This output is the Scheduler contract made visible. Same operator, of. Same values. Same observeOn. Different Scheduler. Completely different execution order relative to the surrounding synchronous code.

The practical lesson is this: when you use observeOn or pass a Scheduler to a creation operator, you're not just choosing a performance characteristic. You're choosing a position in the event loop. queueScheduler means "right now, in this call stack." asyncScheduler means "after everything currently synchronous has finished." asapScheduler would mean "after the current task but before the next macrotask — on the microtask queue." Each Scheduler is a precise statement about where your code belongs in JavaScript's concurrency model.

That's why understanding Schedulers is the line between knowing how RxJS works and knowing when and why it does what it does.
