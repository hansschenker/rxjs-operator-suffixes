---
module: 4
lesson: "4.3"
title: The monad laws
exercise: Write assertions that verify the three monad laws hold for Observable and identify a flatMap usage that breaks left identity.
difficulty: advanced
---

## Scenario

A colleague is writing a library of Observable combinators and wants to verify that `mergeMap` (flatMap) on Observable satisfies the monad laws. Violating a monad law means that refactoring — replacing one equivalent expression with another — can silently change program behaviour. This exercise makes the laws executable and shows a common real-world violation.

## Starter Code

```typescript
import { Observable, of, firstValueFrom } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';

// Helper: collect all emissions from an Observable into a Promise<T[]>
const collect = <T>(obs$: Observable<T>): Promise<T[]> =>
	firstValueFrom(obs$.pipe(toArray()));

const x = 42;

// f and g are plain functions that return Observables
const f = (n: number): Observable<number> => of(n * 2, n * 2 + 1);
const g = (n: number): Observable<string> => of(`value: ${n}`);

// Law 1 — Left identity: of(x).pipe(mergeMap(f)) ≡ f(x)
async function testLeftIdentity(): Promise<void> {
	const left  = await collect(of(x).pipe(mergeMap(f)));
	const right = await collect(f(x));
	console.assert(JSON.stringify(left) === JSON.stringify(right), 'Left identity failed');
}

// Law 2 — Right identity: obs$.pipe(mergeMap(of)) ≡ obs$
async function testRightIdentity(): Promise<void> {
	const obs$: Observable<number> = of(1, 2, 3); // EXERCISE: replace with your own Observable
	const left  = await collect(obs$.pipe(mergeMap(of)));
	const right = await collect(/* ??? same obs$ */);
	console.assert(JSON.stringify(left) === JSON.stringify(right), 'Right identity failed');
}

// Law 3 — Associativity: obs$.pipe(mergeMap(f), mergeMap(g)) ≡ obs$.pipe(mergeMap(x => f(x).pipe(mergeMap(g))))
async function testAssociativity(): Promise<void> {
	const obs$: Observable<number> = of(1, 2, 3); // EXERCISE: replace with your own Observable
	const left  = await collect(obs$.pipe(mergeMap(f), mergeMap(g)));
	const right = await collect(obs$.pipe(mergeMap((v: number) => f(v).pipe(mergeMap(g)))));
	console.assert(JSON.stringify(left) === JSON.stringify(right), 'Associativity failed');
}

// QUESTION: does impureF violate the monad law itself, or only the safety guarantee the law provides?
const impureF = (n: number): Observable<number> => {
	console.log('side effect!'); // called once by of(x).pipe(mergeMap(impureF))
	return of(n * 2);
};
```

## Task

1. Complete `testRightIdentity` and `testAssociativity` by filling in the `???` placeholders and running all three async test functions.
2. Run the code and verify all three assertions pass. If any fail, fix the test rather than the law — the laws are correct.
3. Explain why `impureF` does **not** break the monad law itself, but does break the substitution safety that the law is supposed to guarantee. In other words: what assumption does the law make that `impureF` violates?

## Hint

The three monad laws are identities: they say two expressions produce the same result. For Observables, "same result" means same emissions in the same order. Associativity holds for `mergeMap` only when the inner Observables are synchronous or ordered consistently — switching to `concatMap` restores strict ordering for async sources. The laws assume referentially transparent functions; side-effecting functions violate the substitution property even when the emitted values match.
