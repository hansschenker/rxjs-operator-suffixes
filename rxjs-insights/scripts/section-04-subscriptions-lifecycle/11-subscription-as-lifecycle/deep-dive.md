# A Subscription Is a Lifecycle — Deep Dive

**Section:** Subscriptions & Lifecycle
**Insight:** Subscription as lifecycle
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's trace exactly what happens when you call subscribe() on an Observable, because the mechanics here are worth understanding fully. They explain why teardown works, why the Observable contract holds, and how framework integrations like Angular's takeUntilDestroyed hook into the same machinery.

The subscribe() call does three things. First, it takes whatever you pass — a next callback, an observer object, or nothing — and wraps it in a SafeSubscriber. The SafeSubscriber is an internal RxJS class that enforces the Observable contract. The contract says: once a terminal event is received — either complete() or error() — no further notifications may arrive. The SafeSubscriber does this by checking a closed flag on every incoming notification. If the subscription is already closed, the notification is silently dropped. This protects you from buggy producers that call next() after complete(), or from race conditions where a teardown hasn't fully propagated yet.

Second, subscribe() calls the subscribeFn — the function you passed to the Observable constructor — passing the SafeSubscriber as the observer. This is where the work actually begins. The setInterval starts. The event listener is attached. The HTTP request is sent. Everything that the Observable represents as a description is now actually running.

Third, subscribe() takes whatever the subscribeFn returns — the teardown — and registers it on the Subscription. The teardown can be a plain function, another Subscription, or nothing. When unsubscribe() is called later, the Subscription runs all registered teardowns in reverse registration order. That's where clearInterval() happens. That's where removeEventListener() happens. That's where you'd cancel an AbortController to abort a fetch.

This teardown contract is the entire mechanism behind safe resource cleanup. If you write an Observable without a teardown, you're promising that no cleanup is needed. That's fine for Observables that complete naturally, like of(1, 2, 3). It's a bug for Observables that wrap side-effecting, long-lived producers.

Now, about the Observable contract and automatic closure. When a producer calls observer.complete() or observer.error(), the SafeSubscriber marks itself as closed immediately before dispatching to the downstream observer. This means that after a complete, any subsequent next() calls — even if they arrive synchronously in the same call stack — are no-ops. And the subscription closes without requiring an explicit unsubscribe(). This is why you don't need to unsubscribe from ajax() or from a timer that uses take(3). The completion event closes the subscription for you.

The implication is that only infinite, non-completing Observables require manual unsubscription. Finite Observables are self-cleaning. Knowing the difference is a practical skill. interval() is infinite. timer(5000) that never recurs is finite — it emits once and completes. interval(1000).pipe(take(5)) is finite because take(5) imposes a completion boundary.

There's a property on every Subscription called closed. It's a boolean that starts as false and becomes true after unsubscription or completion. You can check sub.closed to confirm that a subscription has ended. This is useful in debugging, and it's the same flag the SafeSubscriber checks before allowing notifications through.

Finally, let's talk about how frameworks integrate with this. Angular's takeUntilDestroyed operator is essentially a wrapper around a Subject that emits when the component's destroy lifecycle hook fires, combined with takeUntil on your stream. When destroy fires, the Subject emits, takeUntil sees it, and calls complete() on the outer subscription, which triggers the teardown chain. React's useEffect cleanup function is even more direct — you return a function from useEffect, and React calls that function on unmount. If your useEffect subscribes to an Observable, that cleanup function is where you call sub.unsubscribe(). Both approaches ultimately land in the same place: the Subscription's unsubscribe method is called, teardowns execute, resources are freed. The SafeSubscriber closes, and the garbage collector can finally do its job.
