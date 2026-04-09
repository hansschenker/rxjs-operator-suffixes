---
title: RxJS Pipe Operator
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:27:56 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:00:14 GMT+0100 (Central European Standard Time)
---


Rxjs pipe operator is a composition operator allowing the creation of an operator pipeline

Message: # RxJS `pipe` Operator: Composition and Operator Pipeline


## What is the pipe Operator?
- The `pipe` operator in RxJS is a **composition operator** that allows chaining multiple operators together to create a clear and readable operator pipeline.
- It takes an Observable as input and returns a new Observable as output, applying the specified operators in sequence.
- This enables complex asynchronous operations to be composed declaratively and functionally.

## How It Works
- Operators used inside `pipe` are **pipeable operators**, which are pure functions that take an Observable and return a new Observable.
- Instead of nesting operators like `op4()(op3()(op2()(op1()(obs))))`, `pipe` allows a clean syntax:
```typescript
obs.pipe(op1(), op2(), op3(), op4());
```

- This improves readability and maintainability of RxJS code.

## Example
```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4, 5).pipe(
  filter(x => x % 2 === 1),
  map(x => x * x)
).subscribe(console.log);

// Output:
// 1
// 9
// 25
```


## Summary
- The `pipe` operator is essential for composing multiple RxJS operators into a single, readable pipeline.
- It promotes a declarative style of programming by describing what transformations to apply to the data stream.
- Using `pipe` is the universally preferred way to chain operators in RxJS. [(00:02:00)](https://www.youtube.com/watch?v=lM16-E-uCWc) ([[RxJS - RxJS Operators]]), ([[RxJS - RxJS Operators]])




