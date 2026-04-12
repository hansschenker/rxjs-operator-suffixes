# Four Scenarios, One Library

**Section:** Composition & Concurrency
**Insight:** Four basic scenarios
**Lesson type:** Concept
**Estimated duration:** 2 min

---

One of the most paralyzing things about learning RxJS is the sheer size of the operator surface. There are over a hundred operators, and at first glance they all seem equally relevant to any given problem. The way out of that paralysis is a simple diagnostic: before you reach for an operator, identify which of four scenarios you're in.

The first scenario is that you don't have an Observable yet. You need to create one from some source — a static value, a DOM event, an HTTP request, a timer. That immediately points you to the creation operators: of, from, fromEvent, interval, ajax, timer, and their siblings. You're not transforming anything yet; you're just wrapping a source in the Observable type.

The second scenario is that you have exactly one Observable and you want to transform what comes out of it. This is the map and filter territory — all the LINQ-style operators that take a stream and reshape it: scan, reduce, take, debounceTime, distinctUntilChanged. One stream in, one stream out, different shape.

The third scenario is that you have multiple independent Observables and you need to merge or coordinate them into one. This is where you reach for combination operators: merge, concat, combineLatest, zip, withLatestFrom, race. The question is no longer "how do I shape one stream" but "how do these streams relate to each other."

The fourth scenario is that you have a stream of Observables — an outer Observable whose values are themselves Observables — and you need to flatten that down to a single stream. This is where the concurrency operators live: mergeMap, concatMap, switchMap, exhaustMap. And the choice between them is one of the most consequential decisions you make in any RxJS codebase.

Identify the scenario first. The right operator becomes obvious from there.
