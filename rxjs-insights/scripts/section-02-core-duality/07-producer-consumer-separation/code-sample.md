# Producer and Consumer Are Separate — Code Sample

**Section:** The Core Duality
**Insight:** Producer/Consumer separation
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

This example is designed to make the separation visible in the most direct way possible. The same Observable definition, two subscribers, independent executions.

```typescript
import { Observable } from 'rxjs';

// The producer: defined once, runs independently per subscription
const random$ = new Observable<number>(observer => {
  console.log('Producer started');
  observer.next(Math.random());
  observer.complete();
});

// Consumer 1
random$.subscribe(v => console.log('Consumer A:', v));

// Consumer 2 — independent execution, different random number
random$.subscribe(v => console.log('Consumer B:', v));

// Output:
// Producer started
// Consumer A: 0.4716...
// Producer started
// Consumer B: 0.8823...
```

Let's read the Observable definition. The constructor takes one argument — a subscriber function. That function receives an observer, calls observer.next with a random number, and then calls observer.complete. The whole thing is wrapped in a console.log at the start so we can see when the producer actually runs. Critically, none of this executes when you write new Observable(...). The constructor just stores the function. The Observable is inert.

Then Consumer A subscribes. That's the moment the subscriber function runs for the first time. "Producer started" logs. Math.random() is called, producing some value — say, 0.4716. Consumer A's callback receives it and logs it. Then complete() fires and the subscription closes cleanly.

Then Consumer B subscribes. The subscriber function runs again, completely independently. "Producer started" logs a second time. Math.random() is called again, producing a different value — say, 0.8823. Consumer B gets its own number. The two subscriptions never touched each other. There's no shared state. No coordination. No locking. Two separate function-call-equivalent executions.

"Producer started" appears twice in the output — that's the proof. If the producer ran only once and shared the result, we'd see it once. But Observables are cold by default. Each subscription is a fresh start.

This behaviour is the foundation for why RxJS is safe to use without worrying about shared mutable state between consumers. Each subscriber gets its own private execution context. And because complete() is called synchronously here, the subscriptions are also cleaned up immediately. There's nothing left running after each subscribe call returns. Full separation, zero coupling.

---