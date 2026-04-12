# A Pipeline Is a Dependency Graph

**Section:** Design Patterns
**Insight:** Pipeline as dependency graph
**Lesson type:** Concept
**Estimated duration:** 2 min

---

When you build a pipe chain in RxJS, you're not writing a sequential script. You're describing a directed graph, and that distinction changes how you reason about the code.

The graph has two directions. Values flow downstream — from the source, through each operator node, all the way to the subscriber at the bottom. That's the familiar part. But there's also an upstream direction that you might not think about as often: the subscription signal.

When you call `subscribe()` at the bottom, that call doesn't just activate the subscriber. It propagates upstream through every operator in the chain all the way to the source's subscribe function. Every operator activates in sequence from bottom to top. Only once the source has been subscribed does it start emitting, and then values flow back downstream from top to bottom.

This bidirectionality explains why teardown is automatic and complete. When you unsubscribe at the bottom, the unsubscription signal propagates upstream through the same graph, tearing down every operator's internal subscription. Nothing is left running. The entire graph goes dark together.

It also explains why `takeUntil` works the way it does — it intercepts that upstream subscription signal and can cancel it when the notifier fires, propagating the teardown automatically without any manual cleanup.

Understanding the pipeline as a graph, with both downstream value flow and upstream subscription flow, gives you a complete mental model. You can trace any behaviour — a missed value, a memory leak, an unexpected duplicate emission — by following one of those two directions through the graph. The structure is always there to guide the diagnosis.
