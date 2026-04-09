---
title: RxJS - RxJS Operators
tags:
  - "Programming/RxJS"
createdAt: Sun Sep 28 2025 04:13:24 GMT+0200 (Central European Summer Time)
updatedAt: Sun Sep 28 2025 04:13:38 GMT+0200 (Central European Summer Time)
---


Concise summary

- RxJS operators are functions that allow complex asynchronous code to be easily composed in a declarative manner, and are the essential pieces of RxJS.
- There are two kinds of operators: Pipeable Operators (e.g. `map`, `filter`) and Creation Operators (e.g. `of`, `interval`), which can be used to create new Observables.
- Operators can be categorized into various types, including Transformation Operators, Filtering Operators, Join Operators, Multicasting Operators, Error Handling Operators, and Utility Operators, among others.
- Marble diagrams are used to visually represent how operators work, and are included in the documentation to explain operator behavior.
- Custom operators can be created using the `pipe()` function or by writing an operator from scratch using the [[Observable]] constructor.
- Pipeable operators are pure functions that take an Observable as input and return another Observable, and can be chained together using the `pipe()` method for readability.




## Sources
- [website](https://rxjs.dev/guide/operators)
