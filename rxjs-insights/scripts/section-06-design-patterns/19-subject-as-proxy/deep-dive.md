# Subject Is a Proxy — Deep Dive

**Section:** Design Patterns
**Insight:** Subject as proxy
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

The proxy pattern is a classic in software design. An intermediary sits between a client and a real subject — the proxy controls access, mediates communication, and shields each side from knowing too much about the other. A Subject in RxJS is a textbook implementation of this pattern, and it's worth tracing exactly how.

Imagine a cold Observable as the real subject — the actual producer of data. It could be an HTTP request, an interval, or anything that creates a fresh execution per subscription. Clients want to consume that data. Without a proxy, every client subscribes directly and gets its own private execution. Two clients means two HTTP requests, two intervals, two independent data streams. That's often not what you want.

Insert a Subject as the proxy. Subscribe it to the cold Observable once. Now clients subscribe to the Subject instead. When the cold Observable emits, the Subject receives the value via its `next()` method — acting as an Observer — and immediately forwards it to all active subscribers — acting as an Observable. Every client receives the same value from the same single upstream execution.

Now let's talk about the three flavours of Subject, because the choice between them determines what happens to late subscribers.

A plain `Subject` has no memory. If you call `next()` before anyone subscribes, that value is gone. Late subscribers start receiving from the moment they subscribe and nothing earlier. This is fine for event buses and command dispatching, where late arrivals are expected to miss past events.

A `BehaviorSubject` replays the last emitted value to every new subscriber immediately upon subscription. It requires an initial value at construction time, so it always has something to replay. This is the right choice when consumers need current state on arrival — a configuration value, an authentication status, a loaded dataset. Late subscribers don't miss the state; they just see it slightly later.

A `ReplaySubject` lets you specify a buffer size. It replays the last N values to any new subscriber. `ReplaySubject(1)` behaves similarly to `BehaviorSubject` but without requiring an initial value. `ReplaySubject(10)` gives late subscribers access to the last ten emissions. Choose based on how much history a late consumer needs to be coherent.

The pitfall with plain Subjects is easy to stumble into: if you imperative-push via `next()` before any subscribers are active, those values are silently dropped. This often happens in initialisation order bugs — an effect fires before the subscriber is registered. `BehaviorSubject` is the fix when you need at least one value to always be available.

The opposite pitfall: sharing state via a Subject when you actually want per-subscriber isolation. If two components each need their own independent data stream — think two separate instances of a data table, each with its own sort state — a Subject is the wrong tool. A cold Observable per subscription is correct.

Finally, one important usage guideline. Prefer not to expose a Subject's `next()` method publicly. Wrap it in a service or store with explicit dispatch methods that call `next()` internally. Exposing a raw Subject invites any code in your app to push values to it, which breaks the clear data-flow boundaries that make reactive code manageable.

`share()` and `shareReplay()` automate the proxy pattern — they create and manage a Subject internally. Understanding the manual Subject-as-proxy version gives you the mental model that makes the automated version interpretable rather than magical.
