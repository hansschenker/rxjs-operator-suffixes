# RxJS Is a DSL for Time-Varying Values

**Section:** Composition & Concurrency
**Insight:** DSL for time-varying values
**Lesson type:** Concept
**Estimated duration:** 2 min

---

A Domain-Specific Language is a language — or a vocabulary layered on top of a language — that's been designed for one specific problem domain. SQL is a DSL for querying relational data. CSS is a DSL for describing visual presentation. They're not general-purpose; they trade breadth for depth in one area. RxJS is a DSL for values that change over time.

Think about the vocabulary it gives you: debounce, throttle, sample, buffer, window, audit. These aren't generic programming terms. They're the specific language of temporal reasoning. A debounce isn't just a setTimeout trick — it's a named concept from signal processing that describes waiting for a quiet period before acting. A window isn't a frame in a browser; it's a bounded slice of a stream, itself emitted as an inner Observable. This vocabulary has precise meaning in the time domain that no general-purpose language provides by default.

The implication is significant. When you use RxJS just as an async utility — just for handling HTTP requests or wrapping callbacks — you're using a specialized vocabulary tool as a hammer. It works, but you're not getting the point. The point is that RxJS lets you declare the time-based relationships between values, rather than imperatively managing timers and state.

Consider combineLatest. It doesn't say "when this event fires, recalculate this value." It says "the current value of this thing is always the latest A combined with the latest B." That's a declarative statement about a relationship between two time-varying quantities. You're not describing a procedure; you're describing a fact. And that's the essence of what a DSL for time-varying values gives you — the ability to express what the relationship is, and let the library handle when and how it's maintained.
