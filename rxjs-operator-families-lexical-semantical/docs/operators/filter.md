---
title: filter
family: Filtering / Selection
subFamily: Filter by predicate
tagline: Pass only values that satisfy a predicate
---

<OperatorBreadcrumb />

## Signature

```ts
filter<T>(predicate: (value: T, index: number) => boolean): MonoTypeOperatorFunction<T>
```

## What it does

Evaluates each emitted value against a predicate function. Values for which the predicate returns `true` pass through; values that return `false` are silently discarded. The output stream preserves the TypeScript type of the input (it is a `MonoTypeOperatorFunction`), but type-guard predicates can narrow it.

## Marble diagram

```
source:              --1--2--3--4--5--|
filter(x => x % 2 === 0)
result:              -----2-----4-----|
```

## When to use

- Remove `null`/`undefined` entries: `filter((v): v is T => v != null)`
- Gate on a condition: `filter(event => event.key === 'Enter')`
- Drop loading/error states in a union stream: `filter(isSuccess)`

## Related operators

- [first](/operators/first) — like filter but takes only the first match and completes
- [find](/operators/find) — emit the first matching value as a one-shot Observable
- [distinctUntilChanged](/operators/distinctUntilChanged) — drop consecutive duplicates rather than arbitrary values
