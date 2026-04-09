---
title: RxJS custom operators are factory functions
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:39:58 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:05:36 GMT+0100 (Central European Standard Time)
---


custom operators are factory functions that return an operator function of type OperatorFunction<T,R>

Message: Message: # Custom RxJS Operators as Factory Functions

- Custom operators in RxJS are **factory functions**.
- These factory functions return an **operator function** of type `OperatorFunction<T, R>`.
- An `OperatorFunction<T, R>` is a function that takes an Observable emitting values of type `T` and returns a new Observable emitting values of type `R`.
- This design allows custom operators to be parameterized and reusable, fitting seamlessly into the RxJS pipeline.

## Summary
- By returning an `OperatorFunction<T, R>`, custom operators can be composed with other operators using the `pipe` method, maintaining type safety and modularity.


---

This pattern enables developers to create flexible, composable, and type-safe custom operators in RxJS. ([[RxJS How  OperatorFunction<T, R>   | RxJS Explained]])





