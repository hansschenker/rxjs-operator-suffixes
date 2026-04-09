---
title: RxJS canonical workflow
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:45:54 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:06:19 GMT+0100 (Central European Standard Time)
---


Rxjs canonical workflow is:
- enter Rxjs world with a creation operator
- once you are in Rxjs world all operators are at your disposal to apply data transformations
- you exit Rxjs world with .subscribe and you can then apply the side effects you planned for

Message: # Canonical RxJS Workflow


## 1. Enter RxJS World with a Creation Operator
- Start by creating an Observable using a **creation operator** such as `of`, `from`, `interval`, or `ajax`.
- This step brings your data or event source into the RxJS reactive stream model.

## 2. Apply Data Transformations with Operators
- Once inside the RxJS world, you have access to a rich set of **operators** to transform, filter, combine, and manipulate the data stream.
- Operators like `map`, `filter`, `switchMap`, `debounceTime`, and many others can be composed using the `pipe` method to declaratively define complex asynchronous workflows.
- These operators are pure functions that take an Observable as input and return a new Observable as output, enabling composability and modularity.

## 3. Exit RxJS World with .subscribe() to Handle Side Effects
- To consume the data and trigger execution, you **subscribe** to the Observable using the `.subscribe()` method.
- This is where you handle **side effects**, such as updating the UI, making network requests, logging, or other imperative actions.
- Subscribing activates the Observable stream, causing the data to flow through the operator pipeline to the subscriber.


---

This workflow encapsulates the reactive programming model in RxJS:

- **Create** a stream,
- **Transform** the stream declaratively,
- **Consume** the stream with side effects upon subscription.
[(00:08:13)](https://www.youtube.com/watch?v=SmDDEaglAd4) ([[RxJS - RxJS Operators]])





