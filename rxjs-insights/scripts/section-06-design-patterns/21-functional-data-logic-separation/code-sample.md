# Data and Logic Stay Separate — Code Sample

**Section:** Design Patterns
**Insight:** Data and Logic are separate
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This sample shows the separation pattern in action: a reusable piece of logic that knows nothing about its data source, applied to two different sources without any modification.

```typescript
import { of, OperatorFunction } from 'rxjs';
import { filter, map, reduce } from 'rxjs/operators';

// The logic — a reusable pure transformation, extracted as a named function
const discountedTotal = (): OperatorFunction<number, number> =>
  source$ => source$.pipe(
    filter(price => price > 10),
    map(price => price * 0.8),
    reduce((acc, price) => acc + price, 0)
  );

// The data — any Observable of numbers
const prices$ = of(5, 15, 8, 25, 30);

// Data flows through logic; side effects only in subscribe
prices$.pipe(discountedTotal()).subscribe(
  total => console.log('Discounted total:', total)
);

// The same logic applied to different data — no changes needed
const morePrices$ = of(20, 50, 3);
morePrices$.pipe(discountedTotal()).subscribe(
  total => console.log('Other total:', total)
);
```

Let me walk through what's happening here.

`discountedTotal` is a function that returns an `OperatorFunction<number, number>`. That return type is just a function from `Observable<number>` to `Observable<number>` — the exact shape of any pipeable RxJS operator. It takes a source Observable, applies a pipeline to it, and returns the resulting Observable.

Inside, the logic is a three-step transformation. First, `filter(price => price > 10)` drops prices that are ten dollars or less — there's no meaningful discount to apply. Second, `map(price => price * 0.8)` applies the twenty percent discount to each qualifying price. Third, `reduce((acc, price) => acc + price, 0)` accumulates all the discounted prices into a running total and emits that single total when the source completes.

None of this logic knows or cares where the prices come from. It's a pure function of an Observable.

Now look at the data side. `prices$` is `of(5, 15, 8, 25, 30)`. The 5 is below 10 so it's dropped. The 8 is dropped. The 15, 25, and 30 pass the filter. Discounted: 12, 20, 24. Total: 56. That's what gets logged.

Then we create `morePrices$` with different values: `of(20, 50, 3)`. The 3 is dropped. The 20 and 50 are discounted to 16 and 40. Total: 56 as well — a coincidence of the numbers, but the key point is that `discountedTotal()` was called again, unchanged, and it worked correctly on a completely different data source.

Notice that the side effect — `console.log` — lives entirely inside `subscribe`. Nothing inside `discountedTotal` touches the outside world. The function is pure: given any source Observable, it returns a deterministic transformation. You can test it by passing `of(...)` directly. You can reuse it in any context where you have an `Observable<number>`. Data and logic, separate.
