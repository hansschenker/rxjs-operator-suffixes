---
marp: true
theme: uncover
title: "LINQ and the IEnumerable abstraction"
---

# LINQ and the IEnumerable abstraction
> Developers treat `switchMap`, `mergeMap`, and friends as unrelated utilities — without knowing they are four interpretations of the same monadic bind that LINQ invented for `IEnumerable`.

---

## Core Concept

- **LINQ is a monad system**: `from x in xs select y` desugars to `SelectMany` — the same operation as RxJS `mergeMap`
- A monad is the triple **(M, of, flatMap)** — for arrays: `Array`, `x => [x]`, `flatMap`; for streams: `Observable`, `of`, `mergeMap`
- **`IEnumerable` and `IObservable` share the same algebra** — LINQ's entire operator catalogue transfers to RxJS by mathematical duality
- The three monad laws guarantee `pipe()` chains can always be safely restructured without changing observable behaviour
- > "LINQ is not Language Integrated Query — it is Language Integrated Monad." — Erik Meijer

---

## How It Works

```typescript
// IEnumerable monad — pull, synchronous
[1, 2, 3].flatMap(x => [x, x * 10]);
// → [1, 10, 2, 20, 3, 30]

// IObservable monad — push, asynchronous
// Same algebraic structure, different delivery mechanism
of(1, 2, 3).pipe(
  mergeMap(x => of(x, x * 10))   // mergeMap = monadic bind
);
// emits: 1, 10, 2, 20, 3, 30

// Monad laws as safe refactoring rules:
// Left identity:  of(x).pipe(mergeMap(f))           ≡  f(x)
// Right identity: obs$.pipe(mergeMap(of))             ≡  obs$
// Associativity:  pipe(mergeMap(f), mergeMap(g))      ≡  mergeMap(x => f(x).pipe(mergeMap(g)))
```

---

## Common Mistake

```typescript
// ❌ Nested subscriptions — breaking out of the monadic structure
// Intermediate devs manually subscribe inside subscribe because
// they don't recognise flatMap as the abstraction that solves this.

userClick$.subscribe(userId => {
  // A new subscription per click — leaks if another click fires before completion.
  // Cancellation, error propagation, and backpressure are all unhandled.
  fetchUser(userId).subscribe(user => {
    render(user);
  });
});

// This is exactly the problem LINQ's SelectMany was invented to solve:
// composing container-valued functions WITHOUT manually managing the inner container.
```

---

## The Right Way

```typescript
// ✅ Use the monadic bind — let the operator manage the inner Observable

userClick$.pipe(
  // switchMap = SelectMany with "cancel previous" policy
  // Automatically unsubscribes the stale fetchUser if a new click arrives
  switchMap(userId => fetchUser(userId)),

  // Error from fetchUser propagates cleanly through the chain
  catchError(err => of(fallbackUser))
).subscribe(user => render(user));

// The four flatMap policies — all monadic bind, differing only in concurrency:
// mergeMap   → keep all inner subscriptions    (canonical bind; satisfies all monad laws)
// switchMap  → cancel previous, keep latest    (live queries, typeahead)
// concatMap  → queue, never overlap            (ordered writes)
// exhaustMap → ignore new while busy           (form submit, login)
```

---

## Key Rule
> **Every `subscribe`-inside-`subscribe` is a `SelectMany` waiting to become `mergeMap`, `switchMap`, `concatMap`, or `exhaustMap` — pick by concurrency policy, not by habit.**