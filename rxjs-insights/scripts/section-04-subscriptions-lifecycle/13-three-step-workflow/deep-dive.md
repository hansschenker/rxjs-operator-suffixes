# The Canonical Three-Step Workflow — Deep Dive

**Section:** Subscriptions & Lifecycle
**Insight:** Three-step workflow
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

The three-step workflow — enter, transform, exit — is simple enough to state in a sentence, but the depth is in understanding why each step works the way it does and what goes wrong when you violate the boundaries.

Step one is creation, and the right way to think about it is as a "lift." You're taking something that exists outside the Observable abstraction and lifting it into that abstraction. of(1, 2, 3) lifts a fixed sequence of values. fromEvent(button, 'click') lifts a DOM event stream. interval(1000) lifts the passage of time. ajax.getJSON('/api/data') lifts an HTTP request. Each of these creation operators is essentially a factory — it encapsulates a specific way of producing values over time and presents it as a uniform Observable interface. The choice of creation operator is where you declare your source of truth for this pipeline.

Step two is transformation inside the pipe. The key word is "inside." Once you're in the Observable world, you stay in it. Every operator in a pipe chain takes an Observable and returns an Observable. The values never leave the abstraction while they're being transformed. This is what makes the pipe chain composable — each operator is a pure function of the form `Observable<T> → Observable<R>`, and you can stack as many of them as you need without breaking the type contract.

Purity matters here. A pure operator — one that transforms values without side effects — can be tested in isolation, memoized, reordered, or swapped out without affecting the behavior of surrounding operators. If you introduce a side effect inside map(), you've coupled that operator to the outside world. Now it can't be tested without the environment that side effect depends on. Now the marble test that passes an of(1, 2, 3) as input will trigger real logging or real state mutations, which is rarely what you want in a test. Use tap() instead. tap() is the explicit, honest version of "I want to observe this value without transforming it." It's still a pipe operator, so it lives in the transformation zone, but its contract — "I don't change the value, I just see it" — is explicit in the type signature and the name.

Step three is subscribe, and this is where laziness ends. Before subscribe is called, the entire pipe chain is a data structure — an operator tree that describes what should happen, not something that is happening. The Observable returned by pipe() is cold. No interval is ticking. No event listener is attached. No network request is in flight. Subscribe is the interpreter. It walks the operator tree from the subscriber backward to the source, executing each subscribeFn in sequence, connecting the layers together and starting the actual work.

The SQL analogy is worth holding onto. A SQL SELECT statement is a declaration of what you want — the database engine executes it only when asked. Before execution, the query is just a value. In RxJS, the pipe chain is the query. subscribe() is the execution call. That parallel illuminates the testing implication: when you want to test a pipe chain, you don't need the real source. You substitute the creation operator with of() or a cold TestScheduler-based Observable, pipe it through your chain, and subscribe to the result. The pipe chain doesn't care where its upstream comes from — it only cares about the Observable interface. Creation operators and subscribe are the seam points for testing because they're the boundaries you swap out. The transformation logic in the middle is what you're actually validating, and because it's pure, you can isolate it completely.

A common mistake is leaking side effects into the pipe. An operator that writes to external state breaks the purity guarantee, makes tests brittle, and couples unrelated parts of the system. When a pipeline behaves unexpectedly, check for boundary violations first — something in the pipe chain mutating shared state is the most frequent culprit.
