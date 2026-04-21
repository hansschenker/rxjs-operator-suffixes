---
title: switchMap
family: Flattening Policies
subFamily: Only latest
tagline: Cancel previous inner observable, subscribe to the latest
---

<OperatorBreadcrumb />

## Signature

```ts
switchMap<T, R>(
  project: (value: T, index: number) => ObservableInput<R>
): OperatorFunction<T, R>
```

## What it does

Projects each source value to an inner Observable and subscribes to it. When the next source value arrives, the current inner Observable is **unsubscribed** before the new one is created. Only the most recently projected Observable is active at any time.

## Marble diagram

```
source:     --a-----------b---------c--|
project(a): ----1--2--3|
project(b):               ----4--5|
project(c):                         ----6--7|
result:     ----1--2--3-------4--5------6--7|
```

## When to use

- **Search typeahead** — cancel the in-flight HTTP request every time the user types a new character
- **Route data loading** — cancel pending fetch when the user navigates to a different route
- **Live form validation** — cancel stale validation request when the field value changes again

## Related operators

- [exhaustMap](/operators/exhaustMap) — ignore new values while one inner Observable is still active
- [concatMap](/operators/concatMap) — queue inner Observables, complete one before starting the next
- [mergeMap](/operators/mergeMap) — run all inner Observables concurrently with no cancellation
