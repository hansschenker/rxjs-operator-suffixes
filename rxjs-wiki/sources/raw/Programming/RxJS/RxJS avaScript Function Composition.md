---
title: RxJS avaScript Function Composition
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:36:10 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:02:38 GMT+0100 (Central European Standard Time)
---


give me a sample of Javascript function composition and the show it as Rxjs operator composition

Message: Message: # JavaScript Function Composition and Equivalent RxJS Operator Composition


## JavaScript Function Composition Example
```javascript
const add = x => x + 1;
const multiply = x => x * 2;

// Compose functions: multiply(add(x))
const composed = x => multiply(add(x));

console.log(composed(5)); // Output: 12
```

- Here, `add` adds 1 to the input, and `multiply` doubles the result.
- The composed function applies `add` first, then `multiply`.

## Equivalent RxJS Operator Composition Example
```typescript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

of(5).pipe(
  map(x => x + 1),      // Equivalent to add
  map(x => x * 2)       // Equivalent to multiply
).subscribe(console.log); // Output: 12
```

- The `pipe` method composes operators that transform the emitted value.
- The first `map` operator adds 1, and the second `map` operator multiplies by 2.
- The final output is the same as the composed JavaScript function.


---

This demonstrates how function composition in JavaScript corresponds to operator composition in RxJS, enabling declarative and modular transformations of data streams. ([[RxJS JavaScript Function Composition | RxJS Explained]]), ([[RxJS Pipe Operator | RxJS Explained]])





