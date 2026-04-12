# One Model for Every Data Source — Deep Dive

**Section:** Origins
**Insight:** Unified Programming Model
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's trace exactly what the unified programming model means in practice, because the implications go deeper than "the same operators work everywhere." It changes the fundamental economics of building and maintaining reactive systems.

Cast your mind back to the world before LINQ. In the early 2000s, a C# developer working on a typical enterprise application dealt with at least three completely separate querying paradigms. SQL for relational databases — you'd write query strings and parse the results. XPath or XSLT for XML — a completely different syntax and mental model. And plain loops and conditionals for in-memory objects. These weren't just syntactically different. They required different debugging strategies, different performance intuitions, and different error handling approaches. Knowledge didn't transfer between them. And the impedance mismatch — the conceptual friction of moving data between these worlds — was a constant source of bugs and boilerplate.

LINQ's answer was to define a minimal interface: if your type can implement `GetEnumerator`, it can participate in the full query vocabulary. Map, filter, flatMap, grouping, ordering, aggregation — all of it, for free, by satisfying one interface. That's a profound shift. The developer's mental model is now centred on the query, not on the source. You learn the query once, and the source becomes an implementation detail.

RxJS does exactly this for the async world, which has the same fragmentation problem. Before reactive libraries, JavaScript developers dealt with callbacks for DOM events, promises for HTTP, custom event emitters for WebSockets, and setInterval for timers. Each had its own API, its own error handling contract, its own cancellation story. Coordinating them required shared mutable state, deeply nested callbacks, and fragile sequencing logic.

With RxJS, every async data source gets wrapped in an Observable. `fromEvent(document, 'click')` wraps a DOM event listener. `ajax('/api/users')` wraps an XMLHttpRequest. `webSocket('wss://api.example.com')` wraps a WebSocket connection. `interval(1000)` wraps a timer. They all return `Observable<T>`. From that point on, your operators don't know or care what's inside the Observable. `filter`, `map`, `debounceTime`, `switchMap` — they all operate on the stream of values, regardless of origin.

The consequence for teams is significant. When you write an operator or a higher-order pipeline, you write it once and it's genuinely reusable across contexts. A `distinctUntilChanged` combinator that you built for a search input works identically on a WebSocket price feed. A retry strategy you designed for HTTP works on a timer-based polling source. You're building up a library of composable pieces, not a collection of source-specific hacks.

The architectural consequence is equally important. The unified model enforces a clean boundary between the source of data and the logic that processes it. That boundary is the Observable interface. Because your business logic speaks only Observable, you can substitute sources freely. In tests, you replace live sources with synthetic Observables produced by `of`, `from`, or the RxJS TestScheduler. In production, you swap implementations without changing logic. In a refactor, you can move from polling to push without touching your operator chains.

This is what people mean when they say reactive programming is "source-agnostic." It's not just a marketing phrase. It's the direct descendant of LINQ's architectural bet: define the interface, make the operators work against the interface, and set the source free to be whatever it needs to be. That bet paid off in C#, and it continues to pay off every day in RxJS codebases around the world.
