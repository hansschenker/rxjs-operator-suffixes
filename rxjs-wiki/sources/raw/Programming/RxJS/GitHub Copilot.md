---
title: GitHub Copilot
tags:
  - "Programming/RxJS"
createdAt: Tue Feb 10 2026 12:27:08 GMT+0100 (Central European Standard Time)
updatedAt: Tue Feb 10 2026 12:27:15 GMT+0100 (Central European Standard Time)
---




Detailed summary

- The GitHub Copilot text discusses the `joinAllInternals` function, a utility function in RxJS that creates a composable operator to handle a common pattern used by higher-level operators like `combineLatestAll` and `zipAll`.
- The `joinAllInternals` function takes two parameters: `joinFn`, a function that takes an array of observable inputs and returns a single observable, and an optional `project` function, which is a transformation function applied to each result value emitted by the join operation.
- The function works in three steps: first, it collects all values emitted by the source observable into a single array using `toArray()`, waiting until the source observable completes before emitting anything; second, it passes the array of observables to the `joinFn` function, which combines all the inner observables according to its specific logic, and then flattens the resulting observable using `mergeMap`; third, it applies the optional `project` function to each value using `mapOneOrManyArgs`, if provided, or uses the `identity` function to return the value unchanged.
- The `joinAllInternals` function is useful because it eliminates code duplication by extracting the common logic of collecting and joining inner observables, allowing RxJS to achieve better maintainability and consistency, and it can be used with different join functions, such as `combineLatest` or [[zip]], to create various higher-order operators.
- The function handles observables that emit other observables, known as higher-order observables, and it allows for flexible join logic, deferred joining, and optional transformation of the output format, making it a powerful tool for working with complex observable streams.
- The text provides examples of how the `joinAllInternals` function works, including a complete example that demonstrates how to use it with `combineLatest` and a projection function to transform the output values, and it highlights key concepts, such as waiting for completion, flexible join logic, deferred joining, optional transformation, and higher-order observables.




## Sources
- [website](https://github.com/copilot/c/7ec6ea85-49c3-4b59-a9d8-ca153acef5ac)
