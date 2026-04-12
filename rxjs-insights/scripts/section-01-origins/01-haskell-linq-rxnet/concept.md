# From Haskell to RxJS — The Lineage

**Section:** Origins
**Insight:** Haskell → LINQ → Rx.NET → RxJS
**Lesson type:** Concept
**Estimated duration:** 2 min

---

RxJS didn't appear out of nowhere. It's the latest link in a chain of ideas that stretches back roughly thirty years, and tracing that chain will help you understand why the library works the way it does — not just what the API looks like, but why it had to look that way.

The story starts in Haskell — a purely functional language where programs are compositions of functions over data structures. Lists in Haskell are lazy: they're computed on demand, not all at once. You can express an infinite sequence and only pay for the elements you actually consume. Lazy sequences, transformed by pure functions, composed together — that's the seed of everything that follows.

Erik Meijer, a Dutch computer scientist who spent years at Microsoft Research, carried those ideas into the mainstream. In the early 2000s, he led the design of LINQ — Language Integrated Query — which shipped in C# 3.0. LINQ let you write Haskell-style query operators directly against any data source: arrays, databases, XML documents. The key insight was that a unified operator vocabulary — Where, Select, SelectMany — could express the same transformations regardless of where the data came from.

Then came the next leap. Meijer and his colleagues asked a deceptively simple question: what if the sequence isn't pulled by the consumer, but pushed by the producer? The same operators, the same functional composition — but inverted. The result was Rx.NET, the Reactive Extensions for .NET. Push-based, event-driven sequences treated with the same query vocabulary as any other collection.

RxJS is the JavaScript port of Rx.NET, adapted for a single-threaded, async-heavy environment where UI events and HTTP calls are the norm. Every `filter`, every `map`, every `switchMap` you write in RxJS carries the DNA of Haskell's list combinators — that's a direct intellectual lineage, not a metaphor. Understanding where RxJS came from changes how you read the API. It stops looking like an arbitrary collection of methods and starts looking like what it actually is: a principled query algebra for push-based sequences, thirty years in the making.
