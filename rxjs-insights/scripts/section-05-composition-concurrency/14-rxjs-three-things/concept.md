# RxJS Is Three Things

**Section:** Composition & Concurrency
**Insight:** RxJS is 3 things
**Lesson type:** Concept
**Estimated duration:** 2 min

---

When most developers describe RxJS, they describe it as a library of operators — map, filter, switchMap, and a hundred more. That's accurate, but it's incomplete. RxJS is actually three distinct things working in concert, and if you only understand two of them, you're missing the layer that makes everything else make sense.

The first thing is the Observable type itself. An Observable is a container — a push-based, lazy sequence. Unlike an Array, which holds all its values in memory right now, an Observable represents values that may arrive over time. You subscribe to it, and it pushes values to you when they're ready. That's the container layer: the fundamental data model of RxJS.

The second thing is the operators. These are the hundred-odd functions you pipe through — map, filter, debounceTime, switchMap, combineLatest, and the rest. They're the query layer, and this is RxJS's inheritance from LINQ. Erik Meijer's original insight was that if you have an Observable type that's the dual of IEnumerable, you can take every LINQ query operator and flip it for push-based sequences. The operators are that vocabulary. They let you describe what you want to happen to a stream without caring when or where it happens.

The third thing is Schedulers. This is the layer most developers never consciously reach. A Scheduler is a mechanism for controlling when and where work runs — synchronously, on the next microtask, via setTimeout, or on the next animation frame. Schedulers determine the concurrency model.

Here's why this matters: without Schedulers, you can't reason precisely about execution order. You can't make RxJS testable with virtual time. You can't move work off the main thread predictably. The operators describe the what — Schedulers control the when. Most intermediate RxJS code uses the first two layers fluently. Understanding Schedulers is what moves you into advanced territory.
