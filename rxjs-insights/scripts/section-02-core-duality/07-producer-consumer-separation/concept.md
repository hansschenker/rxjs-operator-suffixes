# Producer and Consumer Are Separate

**Section:** The Core Duality
**Insight:** Producer/Consumer separation
**Lesson type:** Concept
**Estimated duration:** 2 min

---

In synchronous programming, the caller and the producer of values are tightly coupled by the call stack. You call a function, it runs, it returns. You're waiting for it the entire time. The function can't produce values later, after you've moved on — it either completes synchronously or you don't hear from it at all.

Observables break that coupling deliberately. The producer — the function you pass to the Observable constructor — runs on its own terms. It can emit values immediately, or it can set up a timer and emit later, or it can make a network request and emit when the response arrives. It doesn't matter to the consumer. The consumer registers an observer and then carries on. When values arrive, the observer's callbacks fire. There's no waiting, no polling, no shared mutable state bridging the two sides.

This separation is what makes async composition possible without the pyramid of doom you get with nested callbacks. In callback-based code, the producer and consumer are tightly entangled — the callback is literally inside the producer's logic, so to compose two async operations you nest one callback inside another. With Observables, each producer is an independent unit. You compose them by chaining operators, and the Observable's plumbing handles the wiring. The consumer never sees the producer's internals.

The other consequence of this separation is that the producer doesn't know how many consumers it has, or who they are. It just calls next, error, and complete on whoever subscribed. And by default — with a cold Observable — each subscription starts a completely fresh, independent execution. Two subscribers to the same Observable are like two separate function calls: same logic, independent state, independent data.

---