# The Canonical Three-Step Workflow

**Section:** Subscriptions & Lifecycle
**Insight:** Three-step workflow
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Every RxJS pipeline follows the same three-step pattern, and once you see it clearly you'll recognize it everywhere. Step one: enter the RxJS world using a creation operator. Step two: transform values inside that world using pipeable operators. Step three: exit the world by calling subscribe, which is the only place where side effects belong.

Creation operators are the entry gates. of, from, fromEvent, interval, ajax — these are functions that take something from the ordinary world and lift it into the Observable world. A static array becomes an Observable. A DOM event stream becomes an Observable. An HTTP request becomes an Observable. The moment you call a creation operator, you've entered the world and everything downstream operates in Observable terms.

The pipe chain is the transformation layer. map, filter, switchMap, debounceTime — these are pure operators that produce new Observables without mutating anything. Each operator in the chain is a declaration about what should happen to the values as they flow through. Crucially, nothing actually executes yet. The pipe chain is a lazy description of a transformation, not the transformation itself.

Then subscribe is the trigger that collapses that description into a running execution. It's also the only correct place for side effects — console.log, DOM mutations, writing to a store, sending a network request. The boundary matters. If you put a side effect inside a map call, you've made that operator impure. The transformation now does invisible work that doesn't show up in its type signature. That makes it untestable, hard to reason about, and potentially dangerous if the map ends up being executed multiple times.

Keeping creation, transformation, and side effects in their own separate zones is what makes RxJS pipelines readable, testable, and composable. The three-step structure isn't a style preference — it's the contract that makes the whole abstraction work.
