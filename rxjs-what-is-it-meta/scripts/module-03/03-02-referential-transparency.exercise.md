---
module: 3
lesson: "3.2"
title: Referential transparency
exercise: Identify which of two Observable definitions violates referential transparency and fix it.
difficulty: intermediate
---

## Scenario

Two developers wrote Observables that should both emit the current timestamp. One definition is referentially transparent — you can substitute its name with its definition anywhere in the codebase and get the same result. The other captures `Date.now()` at definition time, so the two subscribes one second apart produce identical values instead of different ones.

## Starter Code

```typescript
import { Observable, of } from 'rxjs';
import { defer } from 'rxjs';

// Definition A: captures Date.now() at definition time
const timestampA$: Observable<number> = of(Date.now());

// Definition B: defers execution until subscribe time
const timestampB$: Observable<number> = defer(() => of(Date.now()));

// Subscribe to each twice, one second apart
// Expected: A emits the same number twice; B emits two different numbers
function testObservable(name: string, obs$: Observable<number>): void {
	obs$.subscribe((v: number) => console.log(`${name} first:`, v));
	setTimeout(() => {
		obs$.subscribe((v: number) => console.log(`${name} second:`, v));
	}, 1000);
}

testObservable('A', timestampA$);
testObservable('B', timestampB$);
```

## Task

1. Run (mentally or in code) both `testObservable` calls and predict the output for A and B. Explain which observable is referentially transparent and which is not.
2. Fix `timestampA$` using `defer` so it becomes referentially transparent. The fix should be a one-line change.
3. Write a one-sentence rule that predicts whether any `of(expression)` call is referentially transparent — and apply it to `of(Math.random())`, `of(42)`, and `of(fetch('/api').then(r => r.json()))`.

## Hint

Referential transparency means "the expression can be replaced by its value without changing behaviour." Any `of(sideEffect())` call violates this because the side effect runs at definition time, not subscription time. `defer(() => of(sideEffect()))` restores the property by delaying evaluation until subscribe.
