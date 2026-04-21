---
title: map
family: Projection / Shape Change
subFamily: Value projection
tagline: Transform each value with a projection function
---

<OperatorBreadcrumb />

## Signature

```ts
map<T, R>(project: (value: T, index: number) => R): OperatorFunction<T, R>
```

## What it does

Applies a projection function to each emitted value and passes the result downstream. The function receives the value and its zero-based index. One input always produces exactly one output — map never filters or delays.

## Marble diagram

```
source: --1--2--3--4--|
map(x => x * 10)
result: --10-20-30-40--|
```

## When to use

- Extract a property from each emitted object: `map(user => user.name)`
- Convert units or formats: `map(ms => ms / 1000)`
- Add computed fields: `map(item => ({ ...item, total: item.price * item.qty }))`

## Related operators

- [mapTo](/operators/mapTo) — replace every value with the same constant (no function needed)
- [pairwise](/operators/pairwise) — emit [previous, current] on each value instead of transforming
- [switchMap](/operators/switchMap) — project to an Observable instead of a plain value
