# The Mathematical Dual of Iteration — Code Sample

**Section:** The Core Duality
**Insight:** Mathematical dual: Iterable ↔ Observable
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

I want to show you the same sequence of integers produced two ways — one pull-based, one push-based — so you can feel exactly where the control-flow reversal happens.

```typescript
import { Observable } from 'rxjs';

// Pull: Iterator — you request each value
function* counter() {
  let n = 0;
  while (true) yield n++;
}
const iter = counter();
console.log(iter.next().value); // 0 — you pulled
console.log(iter.next().value); // 1 — you pulled again

// Push: Observable — values arrive when the producer decides
const counter$ = new Observable<number>(observer => {
  let n = 0;
  const id = setInterval(() => observer.next(n++), 1000);
  return () => clearInterval(id); // teardown
});

const sub = counter$.subscribe(n => console.log(n)); // values pushed to you
setTimeout(() => sub.unsubscribe(), 3500);
```

Let's step through the pull side first. The generator function counter uses yield to produce values lazily. Nothing runs until you call next() — the generator is paused at yield, waiting. When you call iter.next(), execution resumes just long enough to compute the next value and yield it back to you. Then it pauses again. You are the one driving this. The generator can't emit spontaneously — it's entirely at your mercy. That's what pull semantics means.

Now look at the Observable side. The constructor takes a function — the subscriber function — that receives an observer. When you call counter$.subscribe, that subscriber function begins executing. It sets up a setInterval and every second it calls observer.next with the current count. Your callback — the function passed to subscribe — gets called by the producer, not by you. You're not polling. You're waiting to be notified. That's push semantics.

The teardown line is important. The subscriber function returns a function — a cleanup callback — that will be called when you unsubscribe. Here it clears the interval so the producer stops running. This is the Observable's equivalent of a generator being garbage-collected: a structured, explicit way to release resources. With the iterator, if you stopped calling next(), the generator just sat there idle — there was no way for it to clean itself up proactively. With Observables, the teardown function gives the producer a hook to react when the consumer walks away.

The setTimeout at the end calls sub.unsubscribe() after three-and-a-half seconds. You'll see values 0, 1, 2, and 3 logged — the producer fires at one-second intervals, and the teardown runs before it would emit a fifth value. Then silence.

Same sequence of integers — zero, one, two, three. Entirely different control flow. With the iterator, you decided exactly when to ask. With the Observable, the producer decided exactly when to tell you. The arrows are reversed. That's the duality, made visible in running code.

---