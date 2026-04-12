# The Three Kinds of Observable

**Section:** The Data Model
**Insight:** Three Observable variants
**Lesson type:** Concept
**Estimated duration:** 2 min

---

When people talk about Observables in RxJS, they often treat it as a single concept. But there are actually three distinct variants, and choosing the wrong one for a situation is one of the most common sources of bugs in RxJS applications.

The first is the standard cold Observable. You create it with new Observable() or with a creator like from() or interval(). It's lazy — nothing runs until you subscribe. Each subscriber gets its own independent execution, its own sequence of {T, a} pairs starting from scratch. This is the default, and it's what you should reach for unless you have a specific reason not to.

The second variant is the Subject. A Subject is simultaneously an Observable and an Observer — it sits at both ends of the stream. You can call next() on it imperatively, pushing values in from outside. And you can subscribe to it as an Observable, receiving those values downstream. A Subject is hot by definition: if you push a value and nobody's subscribed yet, that value is gone. There are three subtypes — Subject, BehaviorSubject, and ReplaySubject — which differ in how they handle subscribers who join late.

The third variant is a ConnectableObservable, most commonly produced by the share() operator. This wraps a cold Observable and makes it hot: there's one shared subscription to the source, and all downstream subscribers receive the same emissions. When the last subscriber unsubscribes, share() tears down the source subscription automatically. This is the right choice when you have an expensive source — an HTTP call, a WebSocket connection — that multiple parts of your application need to consume without triggering duplicate work.

Cold by default, share() when you see duplication, Subject when you need imperative push. That's the decision rule.
