# A Pipeline Is a Dependency Graph — Deep Dive

**Section:** Design Patterns
**Insight:** Pipeline as dependency graph
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's unpack the pipeline-as-dependency-graph model in depth, because it explains several behaviours that otherwise feel like magic or quirks.

Start with the downstream graph. When you write `source$.pipe(A, B, C)`, you're describing a chain of three operator nodes. Each node has a single upstream dependency — A depends on source, B depends on A, C depends on B — and a single downstream connection — A feeds B, B feeds C, C feeds the subscriber. Values flow from left to right, node to node. If source emits a value, A transforms it, B transforms the result, C transforms again, and the final value arrives at the subscriber. Each operator is a node in a directed acyclic graph. The graph is fixed at construction time and doesn't change while the pipeline is running.

Now the upstream subscription propagation, which is the less intuitive half. When you call `subscribe()` on the final Observable returned by `pipe`, that Observable is C's output. C, to produce values, needs to subscribe to B. B needs to subscribe to A. A needs to subscribe to source. The `subscribe()` call propagates upstream like a chain reaction — C to B, B to A, A to source — until it reaches the actual producer and activates it. All of this happens synchronously before the first value is emitted. The entire graph is wired up and ready before any data flows.

This is why `tap` is so powerful for debugging. You can insert `tap(v => console.log('at this node:', v))` at any point in the chain and observe values right at that graph node, without affecting the data flow in any way. `tap` is essentially a no-op transformation with a side-channel output — it doesn't change the value, it doesn't alter the timing, it just lets you observe. Think of it as attaching a voltmeter to a point in a circuit.

`share()` creates a graph junction — a node with one upstream connection and multiple downstream connections. Instead of a simple linear chain, it fans out. One subscription to the upstream, potentially many subscriptions from downstream consumers. Each new subscriber registers with the junction node, not with the source. The source only runs once, regardless of how many consumers are connected.

The consequence for memory leaks is direct and important. A graph stays alive as long as it has an active subscription. Every operator in the chain maintains internal state — closures, captured variables, references to the upstream subscription. Every operator node is part of the memory footprint. If you subscribe and never unsubscribe — never call `unsubscribe()` or use `take`, `takeUntil`, or `first` to complete the stream — the entire graph stays allocated. The graph is the memory, and the subscription is the handle that keeps it alive.

This also means that memory leaks in RxJS code have a characteristic shape: a subscription that should have ended, didn't. The fix is always to ensure the subscription terminates. `takeUntil(destroy$)` is the Angular pattern — when a component destroys, `destroy$` emits, `takeUntil` completes the stream, and every node in the graph is torn down. `take(n)` for streams that should produce exactly N values. `first()` for streams that should produce exactly one.

The graph model is the correct mental model for reasoning about RxJS pipelines. Values flow down. Subscriptions propagate up. Teardown propagates up from the unsubscribe call. Sharing creates junctions. Memory lives in the graph and is released when the subscription ends.
