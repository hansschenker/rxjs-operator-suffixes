---
marp: true
theme: uncover
title: "Erik Meijer and the IEnumerable/IObservable Dual"
---

# Erik Meijer and the IEnumerable/IObservable Dual
> Operators feel arbitrary until you realise they are not invented — they are mechanically derived by flipping the pull model of `IEnumerable` into the push model of `IObservable`.

---

## Core Concept
- **IEnumerable (pull):** the consumer calls `MoveNext()` — you drive iteration
- **IObservable (push):** the producer calls `next()` on you — it fires whether you're ready or not
- The relationship is a *formal mathematical dual*, not a metaphor or analogy
- Every LINQ operator (`Select`→`map`, `Where`→`filter`, `SelectMany`→`mergeMap`) follows by applying the same duality transformation — they cannot be otherwise
- > "Once you see it, it looks obvious — but just to find the right one is not easy." — Erik Meijer

---

## How It Works

```
Pull (IEnumerable<T>)           Push (IObservable<T>)
──────────────────────          ──────────────────────────
IEnumerator<T>         ◄─dual─► IObserver<T>
T  MoveNext()          ◄─dual─► observer.next(value: T)
return  (done)         ◄─dual─► observer.complete()
throw   (error)        ◄─dual─► observer.error(err)
for..of / foreach      ◄─dual─► subscribe()

// Consequence — operators are derived, not invented:
// Select()     →  map()
// Where()      →  filter()
// SelectMany() →  mergeMap() / switchMap() / concatMap() / exhaustMap()
```

---

## Common Mistake

```typescript
// ❌ "foreach inside foreach" — IEnumerable thinking applied to push
// Nesting subscribe() mirrors nested for-loops.
// Problem: the inner Observable is never cancelled on a new outer value →
//          race conditions, stale results, and unmanaged subscriptions.

const query$ = searchInput$.pipe(debounceTime(300));

query$.subscribe(q => {
  fetchResults(q).subscribe(results => { // ← inner subscribe never cancelled
    displayResults(results);             //   results may arrive out of order
  });
});
```

---

## The Right Way

```typescript
// ✅ Use the flatMap dual — nested iteration becomes a flattening operator.
// switchMap is SelectMany() + "cancel the previous inner sequence first".

const results$ = searchInput$.pipe(
  debounceTime(300),
  switchMap(q =>              // cancels previous fetch when q changes
    fetchResults(q).pipe(
      catchError(() => of([])) // per-request error handling stays inside the pipe
    )
  ),
  // No external state. No nested subscribes. No race conditions.
);

results$.subscribe(results => displayResults(results));
```

---

## Key Rule
> **When you feel the urge to nest a `subscribe`, you are thinking `IEnumerable` — reach for `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap` instead, because that operator already exists and it is the mathematically correct dual.**