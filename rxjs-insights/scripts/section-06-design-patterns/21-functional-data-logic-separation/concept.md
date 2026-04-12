# Data and Logic Stay Separate

**Section:** Design Patterns
**Insight:** Data and Logic are separate
**Lesson type:** Concept
**Estimated duration:** 2 min

---

One of the core principles of functional programming is that data and the logic that transforms it are separate things. RxJS makes this concrete in a way that's hard to miss once you see it.

The Observable is the data — or more precisely, it's a description of data. It describes what will be emitted and under what conditions, without saying anything about who will consume it or what they'll do with it. It's a pure declaration.

The pipe chain is the logic. Every operator in the chain is a pure function: it takes an Observable in, and returns a new Observable out. Nothing inside the chain reaches out to the world. Nothing mutates external state, fires network requests, or updates the DOM. The chain is a pure transformation, composable and reusable.

The subscriber is where the world changes. The `subscribe()` call is the only place where side effects are expected — updating the UI, writing to a database, logging, dispatching an action. Everything up to that point stays clean.

This three-part separation has a direct payoff in testability. You can extract an entire pipe chain as a named function and test it with any Observable source — an `of()`, a marble Observable in a `TestScheduler`, anything. You don't need to mock the real data source to test your logic. And you don't need to test the side effects in the same test as the logic.

When you feel the urge to put a side effect inside `map` — a console.log, a state mutation — that's the signal to use `tap` instead, or to move the effect to the subscriber where it belongs. Keep the pipe chain pure. The separation is the architecture.
