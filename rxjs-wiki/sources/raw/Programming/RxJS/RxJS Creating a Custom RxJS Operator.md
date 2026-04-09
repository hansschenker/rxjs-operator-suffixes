---
title: RxJS Creating a Custom RxJS Operator
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:37:47 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:02:51 GMT+0100 (Central European Standard Time)
---


rxjs operator composition can also be done with the creation of a custom operator like addOneAndMultplyTwo


# Creating a Custom RxJS Operator for Operator Composition: addOneAndMultiplyTwo

## Concept
- A custom RxJS operator is a function that composes multiple existing operators into a single reusable operator.
- This allows you to encapsulate a sequence of transformations and apply them as one operator in the `pipe` method.
- For example, an operator `addOneAndMultiplyTwo` can combine adding 1 to a value and then multiplying it by 2.

## How to Create addOneAndMultiplyTwo
- Use the `pipe` function from RxJS to compose existing operators like `map`.
- Return a function that takes an Observable and returns a new Observable with the composed transformations applied.

## Example Implementation
```typescript
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

// Custom operator that adds 1 and then multiplies by 2
function addOneAndMultiplyTwo() {
  return pipe(
    map((x: number) => x + 1),
    map((x: number) => x * 2)
  );
}

// Usage example
import { of } from 'rxjs';

of(5).pipe(
  addOneAndMultiplyTwo()
).subscribe(console.log); // Output: 12
```


## Explanation
- The `addOneAndMultiplyTwo` function returns a composed operator created by `pipe`.
- Inside, it applies two `map` operators sequentially: first adding 1, then multiplying by 2.
- When used in an Observable's `pipe`, it applies both transformations in order.
- This approach promotes modularity and reusability of operator sequences.


---

Creating custom operators like this leverages RxJS's operator composition capabilities, making complex transformations easier to manage and reuse.
([[rxjs-frp-claud-ai-new]]), ([[RxJS - RxJS Operators]])





