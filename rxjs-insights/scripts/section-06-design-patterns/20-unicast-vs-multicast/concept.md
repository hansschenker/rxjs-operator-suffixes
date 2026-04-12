# Unicast and Multicast — Two Communication Styles

**Section:** Design Patterns
**Insight:** Unicast vs multicast
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Every Observable in RxJS communicates in one of two styles, and confusing the two is the source of some of the most common bugs in reactive code.

Unicast means one producer to one consumer. When you subscribe to a cold Observable, that subscription creates a private execution of the producer just for you. If two different parts of your code both subscribe to the same cold Observable, they each get their own independent execution — their own HTTP request, their own timer, their own random number. The producer runs twice because there are two subscribers.

Multicast means one producer to many consumers. A Subject, a `share()`, or a `shareReplay()` all create a single upstream execution that's shared across every subscriber. When a value is emitted, every active subscriber receives it simultaneously. The producer runs once, regardless of how many consumers are listening.

The choice between these two styles has real consequences. Duplicate HTTP requests are almost always accidental unicast — you subscribed a cold HTTP Observable in two components, and RxJS dutifully made two network calls. Missed values at startup are almost always accidental multicast — a Subject emitted before your subscriber arrived, and that value is gone forever.

Neither style is inherently better. Unicast is perfect for isolated state machines, per-subscriber data, and tests where you need independent executions. Multicast is essential for shared data sources, expensive computations that shouldn't be duplicated, and broadcast events.

The skill is recognising which style you're using at any given moment — and being deliberate about it.
