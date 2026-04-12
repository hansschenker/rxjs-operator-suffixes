# Rename Operators to Speak Your Domain — Deep Dive

**Section:** Design Patterns
**Insight:** Custom naming pattern
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's examine the readability gap that motivates the custom naming pattern, and then build the full picture of what good domain-named operators look like in practice.

The readability gap is real. Consider a typical search-as-you-type pipeline: `debounceTime(300)`, `distinctUntilChanged()`, `switchMap(q => api.search(q))`, `catchError(() => of([]))`. Every one of those operators is correct. The combination is the right solution. But to read this code and understand the intent, you need to already know what `debounceTime` delays, what `distinctUntilChanged` deduplicates, what `switchMap` cancels, and what `catchError` recovers from. That's a non-trivial prerequisite. A developer new to RxJS, or a colleague from another team, or even yourself six months later, may need to reconstruct that understanding from scratch.

The naming pattern addresses this by creating a function with a name that communicates intent directly. `typeaheadSearch(api.search)` tells you everything at the call site. The technical mechanism is an implementation detail inside the function. The caller doesn't need to know which operators implement the behaviour — they just need to know what the behaviour is.

There's a naming convention worth following here. Name custom operators after the business behaviour, not the technical mechanism. `cancelPreviousSearch` communicates intent — previous searches are cancelled when a new one starts. `switchMappedSearch` does not — it names the mechanism, not the purpose. `throttledScroll` is better than `debouncedScrollEvents`. `preventDoubleSubmit` is better than `exhaustMappedFormSubmit`. The name should be legible to someone who understands the product requirements, not just the library.

The double benefit is readability at the call site combined with testability in isolation. Because `typeaheadSearch` is just a function that returns an `OperatorFunction`, you can call it directly in a test and pass it any Observable. You can test that it debounces correctly, deduplicates correctly, cancels in-flight requests, and recovers from errors — all without setting up any real UI or network. That's a significant testing improvement over testing the inline pipe chain in the context of a component.

The composition story is also clean. Custom operators compose with built-in operators in `pipe()` transparently. TypeScript infers types through the chain, including through your custom operator. If `typeaheadSearch` returns `OperatorFunction<string, string[]>`, then the operator after it in the pipe chain will correctly infer that it receives `string[]`. No type casting, no `any`. The type system treats your custom operator identically to a built-in.

When should you apply this pattern? The practical guideline: if you write the same pipe chain twice, consider it. If you write it three times, extract it. If a chain has a name that means something in the domain — independent of whether it appears multiple times — extract it as soon as you recognise the name. Code that reads like the problem domain is code that can be reasoned about by more people, maintained more safely, and refactored with more confidence.

The custom naming pattern is not just a style choice. It's how you make your reactive code speak to the product team and the architecture team, not just to RxJS experts.
