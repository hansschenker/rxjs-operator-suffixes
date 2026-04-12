# The Three Kinds of Observable — Deep Dive

**Section:** The Data Model
**Insight:** Three Observable variants
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

The three Observable variants — cold Observable, Subject, ConnectableObservable — each solve a different problem. Understanding the design intent behind each one is what tells you when to use each.

Let's start with the cold Observable, because it's the foundation. A cold Observable encapsulates a subscribe function — a factory. When you call subscribe(), that factory runs. When you call subscribe() again, the factory runs again. Each invocation creates its own independent execution context with its own {T, a} timeline. This is exactly what you want in most cases: pure, predictable, self-contained side effects. An HTTP request wrapped in a cold Observable fires once per subscriber and cleans up after itself when the subscription ends. There are no shared state problems. The subscribe function also returns a teardown callback, which RxJS calls on unsubscribe. This means cold Observables are self-cleaning by design. Start with cold, always.

Now the Subject. A Subject breaks the factory model deliberately. It's not a subscribe function — it's a shared broadcast channel. You push values in with next(), and every current subscriber receives them simultaneously. This is what "hot" means in the precise sense: emissions happen independently of subscription. If you call next() before anyone has subscribed, that emission is gone. If a new subscriber joins after three emissions, they haven't missed zero things — they've missed three things. That asymmetry is the defining characteristic of hot.

The three Subject subtypes handle the late-joiner problem differently. Subject doesn't replay anything — a late subscriber starts receiving from the moment they subscribe. BehaviorSubject replays exactly one value — the most recent one at the time of subscription. This makes it ideal for representing current state, because any subscriber can immediately know what the current state is without waiting for the next emission. ReplaySubject replays the last N values, giving late subscribers a configurable history window. AsyncSubject is a fourth variant that only emits the last value before completion, which makes it behave like a Promise — useful for wrapping imperative async operations.

Use Subject when you need to push values from outside the Observable world — from a button click handler, from an imperative callback, from a component lifecycle method — into the reactive pipeline. It's the bridge between the imperative world and the reactive world.

The ConnectableObservable produced by share() occupies the space between cold and Subject. You start with a cold Observable — which is correct, because the source itself is a pure factory. Then you apply share(), which creates a single shared subscription to that source the first time any downstream subscriber subscribes. All subsequent subscribers connect to that one shared execution rather than triggering their own. When the subscriber count drops back to zero, share() unsubscribes from the source entirely, cleaning it up. When a new subscriber arrives later, share() resubscribes and starts a fresh shared execution.

This reference-counting behavior is what makes share() safe for expensive sources. An HTTP Observable shared with share() will fire exactly one network request regardless of how many components subscribe to it. Compare that to subscribing directly to the HTTP Observable in two places — you'd get two network requests. share() solves that without requiring you to introduce a Subject or any imperative push logic.

shareReplay(1) is a common extension of this pattern. It adds BehaviorSubject-like late-subscriber semantics: when a new subscriber joins, it immediately receives the most recently emitted value from the shared execution. This is useful for shared derived state — multiple parts of an application can subscribe to a shared HTTP response at any point in time and always get the current cached value.

The rule of thumb: start cold. When you see multiple subscriptions to the same expensive source, apply share() or shareReplay(1). When you need imperative push — when the data originates outside the reactive world — reach for Subject or BehaviorSubject. Keeping this decision conscious prevents the two most common RxJS architecture mistakes: accidental cold Observable duplication and overuse of Subjects where share() would be cleaner.
