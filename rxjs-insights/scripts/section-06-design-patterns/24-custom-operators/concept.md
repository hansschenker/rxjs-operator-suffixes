# Custom Operators — Isolation and Error Handling

**Section:** Design Patterns
**Insight:** Custom operators
**Lesson type:** Concept
**Estimated duration:** 2 min

---

If there's one pattern that separates RxJS code that's maintainable from code that becomes a tangled mess, it's the custom operator. And the concept is simpler than it sounds: a custom operator is just a function that takes an Observable and returns an Observable.

That's it. Because operators in RxJS are plain functions, you can write your own and they compose with built-in operators seamlessly. TypeScript tracks the types through the chain. The custom operator can use any built-in operators internally. And it gets its own isolated scope.

That isolation is the key benefit. When you embed a `catchError` inside a custom operator, it catches only errors that originate within that operator's logic. Errors don't automatically propagate outward to the surrounding pipeline unless you re-throw them. This gives you granular recovery control — you can handle an error locally, recover to a safe default, and let the outer pipeline continue running as if nothing happened. That's very different from a top-level `catchError` that terminates the entire stream.

Isolation also means testability. You can pass a cold `of()` Observable or a marble Observable directly to your custom operator in a unit test. You don't need to set up the full production source, mock HTTP calls, or simulate real events. The operator's behaviour is verified independently.

And if you find the same `pipe()` chain appearing in two different components, two different services, or two different effects — that's the signal to extract it. The rule of three is a reasonable threshold: if something appears three times, give it a name. If it has a name that makes sense to the domain, extract it even sooner.

Custom operators are the primary reuse mechanism in RxJS. Use them freely.
