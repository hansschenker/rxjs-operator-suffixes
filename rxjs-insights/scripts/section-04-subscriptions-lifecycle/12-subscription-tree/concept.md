# Subscriptions Form a Tree

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription tree
**Lesson type:** Concept
**Estimated duration:** 2 min

---

A Subscription isn't just a handle to one running execution — it can be the root of an entire tree of running executions. RxJS lets you add child subscriptions to a parent using Subscription.add(), and when you unsubscribe the parent, every child in the tree is unsubscribed automatically. One call, complete cleanup.

This matters because real applications rarely have just one active subscription. A component might be listening to a WebSocket stream, polling a server every 30 seconds, reacting to route parameter changes, and watching a form's value changes — all at once. Managing four separate variables and calling unsubscribe() on each of them when the component tears down is error-prone. Forget one and you've got a leak. The subscription tree solves this by giving you a single root to unsubscribe.

The mental model is the same as a component's own lifecycle. When a component is destroyed, everything it owns should be destroyed with it. Its child components go away, its DOM nodes go away, its event listeners go away. Your subscriptions should follow the same pattern — they're owned by the component, so they should die when the component dies. The subscription tree makes that ownership explicit and automatic.

What's worth noting is that this tree structure isn't just a convenience API you reach for manually. RxJS builds it internally for you whenever you use higher-order operators. When switchMap creates an inner Observable, that inner subscription is added as a child of the outer subscription automatically. When the outer unsubscribes, the inner is cleaned up. You'd never manage that manually — RxJS does it invisibly through the same tree mechanism you can access yourself through Subscription.add().

The tree is the primitive behind every "one unsubscribe to rule them all" pattern in RxJS.
