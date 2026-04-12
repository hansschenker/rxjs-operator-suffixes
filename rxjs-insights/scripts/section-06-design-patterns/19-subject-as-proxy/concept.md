# Subject Is a Proxy

**Section:** Design Patterns
**Insight:** Subject as proxy
**Lesson type:** Concept
**Estimated duration:** 2 min

---

A Subject in RxJS plays a double role, and understanding both sides of that role is the key to using it correctly.

On one side, a Subject is an Observer — you can call `next()`, `error()`, and `complete()` on it. It receives values imperatively, just like any Observer you'd pass to `subscribe`. On the other side, a Subject is an Observable — other code can call `subscribe()` on it, and those subscribers will receive whatever values the Subject emits.

This dual nature makes a Subject a proxy. Values flow in from the producer side through `next()`, and flow out to every active subscriber on the consumer side. One value in, broadcast to many consumers simultaneously.

That proxy role is what lets you take a cold, unicast Observable — one that creates a fresh execution for each subscriber — and turn it into something hot and shared. You subscribe the Subject to the cold source, so the cold source runs just once and sends values to the Subject. Any number of consumers can then subscribe to the Subject instead. They all receive the same values from that single cold execution. The source doesn't know how many consumers are listening; the consumers don't care how many others are sharing with them.

This is the fundamental multicast promotion pattern in RxJS, and it's what operators like `share()` automate under the hood. But understanding that it's just a Subject acting as a proxy — that mental model stays useful even when you're using the higher-level operators.

The proxy sits between the producer and the consumers. Both sides don't need to know about each other. That indirection is the design.
