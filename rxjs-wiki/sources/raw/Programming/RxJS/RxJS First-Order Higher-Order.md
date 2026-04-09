---
title: RxJS First-Order Higher-Order
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:32:14 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:01:20 GMT+0100 (Central European Standard Time)
---


first-order operators return simple values, higher-order operators return nested observables (observable of observables)

Message: # Difference Between First-Order and Higher-Order RxJS Operators


## First-Order Operators
- Return **simple values** for each emitted item from the source Observable.
- They operate on individual values and produce a transformed value directly.
- The output Observable emits these transformed values as a flat stream.
- Examples: `map`, `filter`, `tap`.
- Usage example:
```typescript
source$.pipe(
  map(x => x * 2),
  filter(x => x > 10)
);
```


## Higher-Order Operators
- Return **nested Observables**, i.e., an Observable that emits other Observables (an Observable of Observables).
- They handle streams where each emitted value is itself an Observable.
- To work with these nested streams, higher-order operators typically **flatten** the inner Observables into a single output Observable.
- Examples: `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`.
- Usage example:
```typescript
source$.pipe(
  switchMap(value => http.get(`/api/data/${value}`)) // returns Observable<Observable<T>>
);
```



---

In summary, **first-order operators** transform and emit simple values, while **higher-order operators** deal with Observables that emit other Observables, managing nested streams by flattening them into a single stream. ([[rxjs-frp-claud-ai-new]])





