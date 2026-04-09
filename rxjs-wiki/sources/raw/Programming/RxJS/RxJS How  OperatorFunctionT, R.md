---
title: RxJS How  OperatorFunction<T, R>  
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:29:23 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:04:00 GMT+0100 (Central European Standard Time)
---


OperatorFunction<T,R> establishes type safety in the pipe operator by making sure that the input type of an operator matches the output type of the previous operator in the pipeline


# How OperatorFunction<T, R> Ensures Type Safety in RxJS pipe

## Role of OperatorFunction<T, R>
- An `OperatorFunction<T, R>` is a TypeScript type representing a function that takes an Observable emitting values of type `T` as input and returns a new Observable emitting values of type `R` as output.
- It defines the transformation from one type to another within the operator pipeline.

## Ensuring Type Safety in pipe
- When chaining operators using the `pipe` method, each operator must accept as input the output type of the previous operator.
- The generic parameters `T` and `R` in `OperatorFunction<T, R>` enforce this contract at compile time.
- This means:
    - The input type `T` of the current operator must match the output type of the preceding operator.
    - The output type `R` becomes the input type for the next operator in the chain.
- This type-checking prevents mismatches and errors in the operator pipeline, ensuring that data flows correctly through the sequence of transformations.

## Example
```typescript
import { of } from 'rxjs';
import { map, filter } from 'rxjs/operators';

of(1, 2, 3, 4).pipe(
  filter((x: number) => x > 2),  // OperatorFunction<number, number>
  map((x: number) => x.toString()) // OperatorFunction<number, string>
).subscribe(value => {
  // value is inferred as string here
  console.log(value);
});
```

- Here, `filter` takes a `number` and outputs a `number`, matching the input type of `map`.
- `map` transforms `number` to `string`, which becomes the output type of the entire pipeline.
- TypeScript enforces these type relationships, preventing invalid operator sequences.


---

In summary, `OperatorFunction<T, R>` provides a type-safe contract that guarantees each operator in the RxJS `pipe` pipeline receives the correct input type and produces the expected output type, enabling safe and predictable composition of asynchronous data transformations.





