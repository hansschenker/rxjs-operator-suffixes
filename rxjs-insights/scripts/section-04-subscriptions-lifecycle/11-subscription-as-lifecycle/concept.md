# A Subscription Is a Lifecycle

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription as lifecycle
**Lesson type:** Concept
**Estimated duration:** 2 min

---

When you call subscribe() on an Observable, you get something back — a Subscription object. Most tutorials treat this as an afterthought, something you store in a variable just in case you need it later. But the Subscription isn't an afterthought. It's the handle to the entire running execution, and understanding what it represents changes how you think about memory and resource management in RxJS.

The Subscription models a lifecycle. While the Observable is executing — emitting values, reacting to events, ticking through a timer — the Subscription is open. When the Observable completes naturally, or when an error terminates it, or when you explicitly call unsubscribe(), the Subscription closes. That's it. Three exits: natural completion, error, or manual cancellation.

Here's the thing most developers discover the hard way: the Subscription is your responsibility to manage. An Observable doesn't know when you're done with it. If you subscribe to an interval that fires every second, and then you navigate away from a page or destroy a component, the interval doesn't automatically stop. The producer keeps ticking. The observer keeps receiving. The garbage collector can't free the memory because there's still a live reference chain from the timer callback down into your observer function. That's a memory leak — not a theoretical one, a real one that will eventually degrade your application.

The fix is straightforward: hold on to the Subscription object and call unsubscribe() when you no longer need the values. For finite Observables — things like HTTP responses from ajax(), or sequences produced by of() or from() — this isn't something you have to think about, because they call complete() naturally. But for anything that runs indefinitely, the subscription lifecycle is yours to close.

Think of a Subscription the way you'd think of a file handle or a network socket. Opening it starts something. Closing it releases something. Forgetting to close it is a bug.
