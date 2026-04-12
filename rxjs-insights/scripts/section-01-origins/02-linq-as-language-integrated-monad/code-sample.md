# LINQ Is a Language-Integrated Monad — Code Sample

**Section:** Origins
**Insight:** LINQ as Language-Integrated Monad
**Lesson type:** Code Sample
**Estimated duration:** 3 min

---

The monad concept becomes much clearer when you put Array and Observable side by side. Let's look at code that does the same thing in both containers so you can see that the pattern is truly identical.

```typescript
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

// Array monad: flatMap keeps us in the array "container"
const arrayResult = [1, 2, 3].flatMap(x => [x, x * 10]);
console.log(arrayResult); // [1, 10, 2, 20, 3, 30]

// Observable monad: mergeMap keeps us in the Observable "container"
of(1, 2, 3).pipe(
  mergeMap(x => of(x, x * 10))
).subscribe(console.log);
// Output: 1, 10, 2, 20, 3, 30
```

Start at the top. The `arrayResult` line calls `flatMap` on the array `[1, 2, 3]`. For each element `x`, the callback returns a new array containing `x` and `x * 10`. Without the flattening, we'd get a nested array — `[[1, 10], [2, 20], [3, 30]]`. With `flatMap`, those inner arrays are merged into a single flat result: `[1, 10, 2, 20, 3, 30]`. We started in the Array container, we stayed in the Array container.

Now look at the Observable version. `of(1, 2, 3)` creates an Observable that emits three values synchronously — it's the Observable equivalent of the array literal. The `pipe` call leads into `mergeMap`, which is doing exactly what `flatMap` did for the array. For each value `x`, we return `of(x, x * 10)` — a small inner Observable that emits two values. `mergeMap` subscribes to each of those inner Observables and forwards their emissions to the outer stream. The output is identical: 1, 10, 2, 20, 3, 30, in the same order.

The names are different — `flatMap` versus `mergeMap` — but the operation is the same. Take a value out of the container, apply a function that returns a new container, flatten the result back into the original container type. That's bind. That's the monad.

The practical implication is this: whenever you find yourself calling `map` and getting back an Observable inside an Observable, that's your signal to reach for a flattening operator. The type system is telling you that you've produced `Observable<Observable<T>>` where you need `Observable<T>`. `mergeMap` flattens by subscribing to all inner Observables simultaneously. `switchMap` cancels the previous inner Observable when a new one arrives. `concatMap` queues them and processes them in order. `exhaustMap` ignores new values while an inner Observable is still active. All of them are monadic bind — they all keep you in the Observable container. The choice between them is a concurrency decision, not a structural one. And knowing that those are two separate concerns — the what versus the when — is what the monad framing gives you.
