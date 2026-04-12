# Data and Logic Stay Separate — Deep Dive

**Section:** Design Patterns
**Insight:** Data and Logic are separate
**Lesson type:** Deep Dive
**Estimated duration:** 4 min

---

The functional programming principle of separating data from logic has been around for decades. What's interesting about RxJS is that it gives you a physical structure — the three-part Observable, pipe, subscribe pattern — that makes it almost impossible to violate without noticing.

Let's start with the principle itself. In functional programming, functions are values that can be passed around, stored, and composed. Data flows through them. Neither the function changes the data structure in place, nor does the data embed its own transformation logic. They're separate concerns that meet at the point of application. In object-oriented design, data and methods are bundled together. In functional design, they're kept apart.

An Observable embodies pure data description. When you write `interval(1000)` or `of(1, 2, 3)` or `fromEvent(button, 'click')`, you're describing a sequence of events. You're not triggering anything yet. The Observable is lazy — it describes what will happen when subscribed, not what is happening right now. It's a first-class value you can pass around, store in a variable, compose with other Observables, return from a function.

The pipe chain is a pure function from Observable to Observable. Every individual operator in the chain is a pure function: same input, same output, no side effects. The composed pipe chain is also a pure function. You can extract it — assign `const myLogic = pipe(filter(...), map(...), reduce(...))` to a variable — and apply it to any Observable. The logic has no dependency on any specific data source. It's a reusable, portable transformation.

The subscriber is the boundary between the pure functional world and the imperative real world. Inside `subscribe`, you're allowed to have side effects. That's the whole point. Update the DOM. Dispatch an action. Write to local storage. Set a loading flag. Everything that touches the world belongs here, not inside the pipe chain.

The testing consequence is significant. Because the pipe chain is pure, you can test it in complete isolation. Pass it `of(5, 15, 8, 25, 30)`. Assert on the output. You don't need to set up an HTTP server, mock an API client, or simulate user interactions. The logic is separated from the data source, so any data source works as a test fixture.

The violation pattern to avoid is placing side effects inside operators that are meant to be pure. The classic example is `map(item => { store.update(item); return item; })`. That `map` is no longer a pure transformation — it has a hidden side effect on `store`. Now the pipe chain isn't safe to reuse, can't be tested without the store, and may produce unexpected behaviour if the map runs multiple times due to sharing. Extract the side effect to `tap` for observation-only effects, or to `subscribe` for state-changing effects.

The three-part structure — Observable, pipe chain, subscriber — is RxJS encoding the functional principle in the type system and the API design. When you follow it, your code naturally organises into a pure functional core surrounded by a thin imperative shell. That's not a style preference. It's what makes reactive code scale.
