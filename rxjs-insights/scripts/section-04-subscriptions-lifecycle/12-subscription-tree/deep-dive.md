# Subscriptions Form a Tree — Deep Dive

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription tree
**Lesson type:** Deep Dive
**Estimated duration:** 4 min

---

Let's look at the Subscription tree in detail, because it's a mechanism that shows up both in the public API you write and in the private internals you don't see but depend on every time you use a higher-order operator.

The public side is straightforward. A Subscription has an add() method that accepts a child — another Subscription, a function, or a Subscription-like object with an unsubscribe method. When you call parent.unsubscribe(), RxJS iterates through every registered child and calls unsubscribe() on each one in turn. The children can themselves have children, making this genuinely recursive. The whole tree collapses from the root downward.

This is the correct pattern for component-level teardown. You create one parent Subscription at the top of your component's setup code, then add every stream subscription as a child. When the component is destroyed, you call parent.unsubscribe() once and you're done. No array of subscriptions to iterate. No risk of forgetting one. The tree handles the bookkeeping.

There's also a remove() method on Subscription that's easy to miss. remove() detaches a child from the tree without calling unsubscribe() on it. This is useful when a child subscription completes naturally — once it's complete, it's already closed, and you don't want it sitting in the parent's child list consuming memory indefinitely. RxJS actually does this cleanup automatically in some cases, but if you're building custom operators or managing complex lifecycles manually, remove() gives you precise control.

Now let's talk about the internal use of the tree — this is where the real payoff is. Every higher-order operator in RxJS manages a tree of subscriptions internally. Consider switchMap. When the source emits a new value, switchMap creates a new inner Observable and subscribes to it. That inner subscription is added as a child of the outer subscription. When the next source emission arrives, switchMap needs to cancel the previous inner subscription before starting the new one. It calls unsubscribe() on the previous inner subscription, which cascades through any teardowns that inner subscription has registered. Then it creates the new inner subscription and adds it to the tree. When the outer subscription ultimately closes — either because the source completes or because the consumer calls unsubscribe() — the current inner subscription is closed as well.

The takeUntil(destroy$) pattern is another expression of this tree. When you pipe takeUntil(destroy$) onto a stream, takeUntil internally subscribes to destroy$. That notifier subscription is added as a child of the main subscription. When destroy$ emits, takeUntil calls complete() on the main subscription, which triggers the teardown chain including the notifier subscription. When the consumer calls unsubscribe() on the main subscription before destroy$ emits, the notifier subscription is also cleaned up. Either way, nothing leaks.

There's one subtlety to be aware of with add(). If the parent Subscription is already closed when you call add(), the child is immediately unsubscribed. This is a safety feature — it prevents you from accidentally attaching live subscriptions to a dead parent. If your component teardown has already run and you somehow invoke a code path that creates a new subscription and tries to add it to the closed parent, the child won't leak. It'll be killed immediately. This is the kind of defensive design that makes the subscription tree genuinely safe to use as your teardown root, even in complex asynchronous scenarios where the timing of setup and teardown isn't always predictable.
