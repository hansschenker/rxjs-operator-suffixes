---
title: RxJS JavaScript Nested Loop 
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:33:49 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:04:52 GMT+0100 (Central European Standard Time)
---


give me a sample of Javascript nested loop and then convert it into a nested observable

Message: # JavaScript Nested Loop Example and Equivalent RxJS Nested Observable


## JavaScript Nested Loop Example
```javascript
const outerArray = [1, 2, 3];
const innerArray = ['a', 'b', 'c'];

for (let i = 0; i < outerArray.length; i++) {
  for (let j = 0; j < innerArray.length; j++) {
    console.log(`Outer: ${outerArray[i]}, Inner: ${innerArray[j]}`);
  }
}
```

- This code iterates over `outerArray`, and for each element, iterates over `innerArray`, logging pairs of values.

## Equivalent RxJS Nested Observable Using Higher-Order Operators
```typescript
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

const outer$ = from([1, 2, 3]);
const innerArray = ['a', 'b', 'c'];

outer$.pipe(
  mergeMap(outerValue =>
    from(innerArray).pipe(
      // Map inner values to combined output
      // You can use map operator here if needed
      // For simplicity, just emit combined string
      // map(innerValue => `Outer: ${outerValue}, Inner: ${innerValue}`)
      // Or just use tap to log
      // tap(innerValue => console.log(`Outer: ${outerValue}, Inner: ${innerValue}`))
      // But to emit combined values:
      map(innerValue => `Outer: ${outerValue}, Inner: ${innerValue}`)
    )
  )
).subscribe(console.log);
```


### Explanation
- `outer$` is an Observable emitting values from `outerArray`.
- For each emitted `outerValue`, `mergeMap` subscribes to an inner Observable created from `innerArray`.
- The inner Observable emits each `innerValue`, which is combined with the `outerValue`.
- The combined values are emitted as a flat stream, similar to the nested loop output.


---

This RxJS example models the nested loops by using a higher-order Observable (`outer$`) that emits inner Observables (`from(innerArray)`), with `mergeMap` flattening the nested streams into a single output stream.  ([[RxJS Nested Observables and JS Nested Loop | RxJS Explained]]), ([[RxJS Nested Observables and JS Nested Loop | RxJS Explained]])





