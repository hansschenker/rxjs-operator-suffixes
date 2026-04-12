# The Mathematical Dual of Iteration

**Section:** The Core Duality
**Insight:** Mathematical dual: Iterable ↔ Observable
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Every concept in programming has a dual — a mirror image you get by reversing all the arrows. It sounds abstract, but it has a very concrete payoff in how we think about data over time.

Take the Iterable and Iterator pattern you already know from JavaScript. When you write a for-of loop or spread an array, you're using an Iterator. The Iterator has a next() method, and you call it. You decide when to ask for the next value. The producer waits. You pull values out at your own pace, one by one, and each call to next() returns an object with a value and a done flag. That done flag tells you whether the sequence has finished. Control lives entirely with the consumer.

Now reverse every arrow. Instead of you calling next() on the producer, the producer calls next() on you. Instead of you deciding when to get a value, the producer decides when to send one. You register yourself as an observer, and values arrive whenever the producer is ready to emit them. That's an Observable. Same structure — a sequence of typed values, a signal when the sequence ends, a way to propagate errors — but the direction of control has flipped completely.

This is not a metaphor or a loose analogy. It's a formal relationship in category theory called a dual, and Erik Meijer proved that Iterable and Observable are exact mathematical duals of each other. He published the derivation, and it's the foundation that Rx.NET and eventually RxJS were built on.

The practical implication is significant. Because the duality is exact, every operator that makes sense for Iterables has a corresponding operator for Observables. map, filter, reduce, flatMap — every array method you've ever written has an RxJS counterpart, and it behaves the same way conceptually. If you already know how to compose array operations, you already understand the shape of RxJS. You're just working in push-based time instead of pull-based synchrony.

---
