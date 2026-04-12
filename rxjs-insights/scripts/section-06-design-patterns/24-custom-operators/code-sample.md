# Custom Operators — Isolation and Error Handling — Code Sample

**Section:** Design Patterns
**Insight:** Custom operators
**Lesson type:** Code Sample
**Estimated duration:** 4 min

---

This sample shows a complete custom operator with its own scoped error handling, tested in isolation, and then composed with other operators in a pipeline.

```typescript
import { Observable, of, OperatorFunction } from 'rxjs';
import { filter, map, catchError } from 'rxjs/operators';

// Custom operator — isolated, testable, reusable
const positiveDoubles = (): OperatorFunction<number, number> =>
  (source$: Observable<number>): Observable<number> =>
    source$.pipe(
      filter(n => n > 0),
      map(n => n * 2),
      catchError(err => {
        console.error('positiveDoubles error:', err);
        return of(); // recover gracefully
      })
    );

// Test in isolation — no production source needed
of(-1, 2, -3, 4, 0, 5)
  .pipe(positiveDoubles())
  .subscribe(console.log); // 4, 8, 10

// Compose with other operators — types flow through transparently
of(1, -2, 3)
  .pipe(
    positiveDoubles(),
    map(n => `Result: ${n}`)
  )
  .subscribe(console.log); // "Result: 2", "Result: 6"
```

Let me walk through the operator definition and both uses.

`positiveDoubles` is a factory function — no configuration parameters in this case, so it's called with `()`. It returns an `OperatorFunction<number, number>`, which is a function from `Observable<number>` to `Observable<number>`. Inside, it applies three steps to the source: `filter` to drop non-positive numbers, `map` to double each passing number, and `catchError` to handle any error that originates inside this operator.

The `catchError` here returns `of()` — an Observable that completes immediately with no values. If any error occurs within `positiveDoubles`, the operator swallows the error, logs it, and the outer pipeline receives a completion rather than an error. The outer pipeline never sees an error notification from this operator. That's scoped error handling — the operator owns and resolves its errors locally.

Now the first usage. We pipe `of(-1, 2, -3, 4, 0, 5)` through `positiveDoubles()`. The filter passes only values greater than zero: `2, 4, 5`. The map doubles them: `4, 8, 10`. Those are the values that reach `subscribe`. The negatives and the zero are dropped silently. `of()` is the source here — no real data source, no mocking needed. This is a complete unit test of the operator's behaviour.

The second usage demonstrates composition. We pipe `of(1, -2, 3)` through `positiveDoubles()`, which produces `2, 6`. Then we add another `map` after `positiveDoubles` that formats the number as a string: `"Result: 2"` and `"Result: 6"`. TypeScript infers that after `positiveDoubles()`, the stream type is still `Observable<number>`, so `map(n => \`Result: ${n}\`)` correctly sees `n` as a number. The custom operator participates in type inference exactly like any built-in.

The key properties demonstrated: isolation — the operator's error handling doesn't affect the outer pipeline; testability — `of(...)` is all you need as a test source; composability — the operator slots into any pipe chain and types flow through. These three properties together are what make custom operators the right answer to reactive code reuse.

This is the full custom operator pattern. Extract it, name it, handle its errors, compose it freely.
