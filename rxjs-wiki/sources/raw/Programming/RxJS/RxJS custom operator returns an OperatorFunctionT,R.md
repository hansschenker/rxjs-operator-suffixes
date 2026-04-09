---
title: RxJS custom operator returns an OperatorFunction<T,R>
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:39:52 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:05:20 GMT+0100 (Central European Standard Time)
---


the custom operator returns an OperatorFunction<T,R> or a MonoTypeOperatorFunction<T,T> that fits perfectly into the rxjs pipeline

Message: # Custom RxJS Operators and Their Types in the Pipeline


## Return Types of Custom Operators
- A custom RxJS operator returns an **OperatorFunction<T, R>** or a **MonoTypeOperatorFunction<T>**.
- **OperatorFunction<T, R>** is a function type that takes an Observable emitting values of type `T` and returns a new Observable emitting values of type `R`.
- **MonoTypeOperatorFunction<T>** is a specialized form where the input and output types are the same (`T`), i.e., `OperatorFunction<T, T>`.

## Integration into the RxJS Pipeline
- Because custom operators return these function types, they fit seamlessly into the RxJS `pipe` method, which expects operators of type `OperatorFunction`.
- This allows custom operators to be composed with built-in operators and other custom operators in a type-safe and modular way.
- The type system ensures that the output type of one operator matches the input type of the next, maintaining type safety throughout the pipeline.

## Example
```typescript
import { pipe, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

// Custom operator returning MonoTypeOperatorFunction<number>
function addOneAndMultiplyTwo(): OperatorFunction<number, number> {
  return pipe(
    map(x => x + 1),
    map(x => x * 2)
  );
}

// Usage in pipeline
import { of } from 'rxjs';

of(5).pipe(
  addOneAndMultiplyTwo()
).subscribe(console.log); // Output: 12
```

- Here, `addOneAndMultiplyTwo` returns an `OperatorFunction<number, number>`, which fits perfectly into the `pipe` method.
- This ensures smooth integration and type safety in the RxJS operator pipeline.


---

In summary, custom RxJS operators return `OperatorFunction<T, R>` or `MonoTypeOperatorFunction<T>` types, enabling them to integrate cleanly and safely into the RxJS pipeline for composable and reusable data stream transformations. ([[RxJS How  OperatorFunction<T, R>   | RxJS Explained]]), ([[RxJS First-Order Higher-Order | RxJS Explained]])





