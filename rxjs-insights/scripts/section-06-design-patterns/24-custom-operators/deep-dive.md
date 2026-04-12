# Custom Operators — Isolation and Error Handling — Deep Dive

**Section:** Design Patterns
**Insight:** Custom operators
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Custom operators are the full maturation of everything we've talked about in this section — domain naming, data and logic separation, reuse across contexts. Let's look at the mechanics and the design decisions involved.

The signature is straightforward. A custom operator factory looks like this: you write a function that accepts configuration parameters and returns an `OperatorFunction<T, R>`. An `OperatorFunction<T, R>` is just a function from `Observable<T>` to `Observable<R>`. Inside, you call `source$.pipe(...)` and return the result. That's the entire pattern.

```typescript
const myOp = <T, R>(config: Config): OperatorFunction<T, R> =>
  (source$: Observable<T>): Observable<R> =>
    source$.pipe(/* built-in operators here */);
```

TypeScript infers types through the chain automatically. If you apply `myOp` after an operator that produces `Observable<string>`, TypeScript knows that the `T` in your operator is `string`. If `myOp` returns `Observable<number>`, the next operator in the chain sees `Observable<number>`. The type system is doing real work here — composition errors are caught at compile time.

The testing story is the most compelling argument for extracting custom operators early. When the logic lives inline in a component or service method, testing it requires setting up the entire context: the component, its dependencies, its lifecycle. When the logic is extracted to a custom operator, you can test it with `of(...)` as the source. No component setup, no Angular TestBed, no service mocking. Just a function call and an assertion. The test is a unit test in the strictest sense.

Error handling scope deserves careful attention because it's one of the most nuanced aspects of reactive error management. An error in an RxJS stream terminates the stream by default. If you have a `catchError` at the very end of a long pipeline, it catches everything — but it also means any recovery logic has to work for any kind of error from anywhere in the chain, which is often too coarse. A `catchError` inside a custom operator creates a local recovery scope. Errors within that operator's logic are caught and handled there. The outer pipeline never sees them unless you explicitly re-throw. This is analogous to try-catch in synchronous code: you want the catch clause as close to the error source as makes sense, not at the top of the call stack.

Consider an operator that makes an HTTP request. The request might fail with a network error, a 404, or a 500. If you catch inside the operator and return `of(null)` or `of([])` as a safe fallback, the rest of the pipeline continues normally — it sees a null or an empty array, not an error. The outer pipeline can handle the normal value, and error handling is self-contained in the operator that owns the risky operation.

When to extract? The rule of three is a practical starting point. If the same pipe chain appears three times — copy-pasted into three components, three effects, three services — extract it. But there's a softer rule that applies sooner: if the chain has a meaningful domain name, extract it immediately. Code with clear names is easier to understand, navigate, and modify than anonymous inline chains, even if there's only one instance.

The composability point is worth emphasising. Custom operators compose with each other just like built-in operators. You can write `source$.pipe(customOperatorA(), customOperatorB(), builtInOperatorC())` and the type flow is continuous and inferred. Your operators are first-class citizens of the pipe chain.

Custom operators are how you scale reactive code — from clever one-offs to a shared vocabulary that the whole team can use.
