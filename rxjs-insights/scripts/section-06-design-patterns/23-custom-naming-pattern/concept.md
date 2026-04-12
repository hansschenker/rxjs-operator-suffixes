# Rename Operators to Speak Your Domain

**Section:** Design Patterns
**Insight:** Custom naming pattern
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Technical operator names are precise, but they're not always readable. `switchMap`, `exhaustMap`, `debounceTime` — these names are meaningful to developers who've spent time with RxJS, but they're opaque to anyone reading the code for the first time, or to domain experts who understand the business logic but not the reactive patterns underneath.

The custom naming pattern is a simple idea with significant impact: wrap a group of operators in a function whose name comes from the problem domain rather than the library. Instead of a pipe chain that reads `debounceTime(300), distinctUntilChanged(), switchMap(q => searchApi(q))`, you write a function called `typeaheadSearch` and the call site reads `pipe(typeaheadSearch(searchApi))`.

The pipe now tells a story in domain terms. A teammate who's never heard of `switchMap` can read `typeaheadSearch` and understand what this pipeline does. They can even change the business behaviour — the debounce delay, the minimum query length — without needing to understand the reactive mechanics inside.

This isn't just a readability improvement. It's also an encapsulation boundary. The technical implementation is isolated inside the named function. If the team later decides to add `catchError` recovery or change from `switchMap` to something else, every call site stays the same. The naming function is the stable interface; the implementation can change freely behind it.

And it's testable in isolation. A custom operator is just a function that takes an Observable and returns an Observable. You can test `typeaheadSearch` independently with a mock API and a test Observable, verifying its behaviour without touching any production source.

Name for the domain. Implement with the library. The distinction between those two concerns is where maintainable reactive code comes from.
