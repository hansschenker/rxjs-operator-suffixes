# Unicast and Multicast — Two Communication Styles — Deep Dive

**Section:** Design Patterns
**Insight:** Unicast vs multicast
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's go deeper on unicast and multicast — the scenarios where each is correct, the bugs that come from picking the wrong one, and the tools you use to switch between them deliberately.

Unicast scenarios are those where each consumer genuinely needs its own independent execution. A form validation stream that's private to a single form instance. A state machine Observable that manages isolated component state. Test Observables in a Vitest suite where you need predictable, independent executions. Unicast is the safe default — each subscription is isolated, side effects are contained, and there's no accidental sharing between consumers. Cold Observables are unicast by definition.

Multicast scenarios are those where a single upstream execution must be shared. A WebSocket connection feeding multiple UI components. An expensive HTTP request whose result should be cached and delivered to any component that asks. An authentication state Observable that every guard and service consults. In all these cases, running the producer once per consumer would either be wrong (two WebSocket connections), expensive (duplicate HTTP calls), or inconsistent (two separate auth checks that could diverge).

The hidden cost of accidental unicast is the most common production bug. An HTTP Observable is subscribed in a component's template via the `async` pipe, and also subscribed manually in the component class. Two subscriptions, two HTTP requests. The fix is `shareReplay(1)` — turn the cold HTTP Observable into a multicast stream that caches the last response and delivers it instantly to any new subscriber.

The hidden cost of accidental multicast is subtler. A plain `Subject` is used for an initialisation event. Some subscriber registers too late and misses the event. The UI is in an indefinite loading state. The fix is `BehaviorSubject` with an initial value, or `ReplaySubject(1)` — ensuring late subscribers receive at least the most recent emission.

`shareReplay(1)` deserves particular attention because it combines two behaviours in one operator. It multicasts — one upstream subscription shared among all consumers. And it replays — the last emitted value is buffered and delivered instantly to any new subscriber, even if they arrive after the original emission. For anything that looks like cached state — loaded data, configuration, user profile — `shareReplay(1)` is the pattern.

Diagnosing the wrong choice: if a side effect happens more times than you expected, look for accidental unicast. Count how many places you call `subscribe` or use the `async` pipe on the same Observable. If a subscriber is missing values it should have received, look for accidental multicast. Check whether a Subject or a shared stream was emitting before the subscriber was active.

The mental checklist: Is each subscriber supposed to get independent data, or should they all share the same data? If independent — cold Observable, unicast. If shared — `share()`, `shareReplay()`, or explicit Subject, multicast. Making this decision explicitly, rather than letting it happen by accident, is one of the clearest markers of mature reactive code.
