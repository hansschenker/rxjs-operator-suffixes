# From Haskell to RxJS — Deep Dive

**Section:** Origins
**Insight:** Haskell → LINQ → Rx.NET → RxJS
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

To really understand RxJS, you need to go back to the beginning — not to RxJS itself, and not even to Rx.NET, but to Haskell. Because the conceptual building blocks of everything reactive were already sitting in Haskell decades before Ben Lesh wrote a line of JavaScript.

Haskell is built around two related ideas that matter here: purity and laziness. Functions in Haskell have no side effects, and data structures are evaluated on demand rather than eagerly. Lists in Haskell aren't computed upfront — they're described as rules for producing values. This means you can define an infinite list of integers and only the elements you actually ask for will ever be computed. And to work with those lazy sequences, Haskell provides higher-order functions: map to transform each element, filter to select matching elements, and flatMap — called `concatMap` in Haskell — to chain sequences together. These three primitives, used compositionally, form the foundation of everything that comes later.

Erik Meijer spent his academic career studying these ideas, and when he joined Microsoft Research, he saw an opportunity to bring them to mainstream programmers. The result was LINQ — Language Integrated Query — which shipped with C# 3.0 in 2007. LINQ was a remarkable engineering achievement: it added query syntax directly into the C# compiler. You could write `from x in numbers where x > 2 select x * 2` and the compiler would translate it into a chain of method calls — `Where`, `Select`, and `SelectMany`. Those method names are worth noting. They map directly to Haskell's `filter`, `map`, and `concatMap`. The vocabulary didn't change. What changed was that it now worked against any data source that implemented the right interface. SQL databases, XML documents, in-memory arrays — same operators, different providers.

But there was something LINQ couldn't easily express: time. LINQ operated on pull-based sequences, where the consumer drives the iteration. Events don't work that way. A mouse click doesn't sit in a collection waiting for you to ask for the next one. It arrives when the user decides it should. This is the fundamental tension between pull and push.

The conceptual breakthrough that became Rx.NET was realising that pull and push are mathematical duals. Meijer formalised this: `IEnumerable<T>` is pull — you ask the sequence for its next value. `IObservable<T>` is push — the sequence tells you when a new value is ready. But here's the key: the operator vocabulary is identical. A `Where` applied to an `IObservable<T>` works exactly the same way as a `Where` applied to an `IEnumerable<T>`. You subscribe instead of iterate, but you still filter, transform, and flatten. Rx.NET was released around 2009, and it brought the power of LINQ to push-based, event-driven programming.

The JavaScript port came later, driven by the open-source community and eventually led by Ben Lesh at Netflix and then at Google. The adaptation wasn't trivial — JavaScript is single-threaded, the scheduler model is different, and browser APIs are wildly inconsistent. The RxJS team had to make practical choices: a pipe-based composition model, an operator-per-file architecture to support tree-shaking, and a scheduler system that accommodates both the microtask queue and requestAnimationFrame. But the core model is unchanged. Observable is `IObservable<T>`. Subscribe is the handshake that starts the push. And every operator — `filter`, `map`, `mergeMap` — traces its ancestry directly to Haskell.

Why does this lineage matter to you as a practitioner? Because it means RxJS has a mathematical pedigree. The API isn't arbitrary. When you use `switchMap`, you're not reaching for a magic trick someone invented to fix a specific bug — you're using a well-understood operation from the theory of monad transformers applied to push sequences. When something feels wrong in your pipeline, the lineage gives you a way to reason about why. You can ask: is this a transformation? Is this a flattening? Is this a combination? Those categories come with decades of theory behind them. And that theory gives you debugging tools that no amount of documentation alone can provide.
