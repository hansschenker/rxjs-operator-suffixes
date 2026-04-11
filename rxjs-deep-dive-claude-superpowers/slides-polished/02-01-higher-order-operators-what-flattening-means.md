---
marp: true
theme: uncover
title: "Higher-order operators: what flattening means"
---

# Higher-order operators: what flattening means
> Mapping to an Observable gives you a stream of streams — subscribing inside `subscribe` is the chaos that flattening was built to end.

---

## Core Concept

- A **first-order** operator transforms values: `T → R`; a **higher-order** operator maps each value to an inner Observable and **flattens** the result: `Observable<T> → Observable<R>`
- Without flattening you hold `Observable<Observable<R>>` — a stream you must subscribe to manually, spawning nested subscriptions
- The project function `(value: T) => ObservableInput<R>` accepts Observables, Promises, Arrays, or Iterables as inner sources
- All four operators share the same project signature; they differ **only in what happens when a new inner arrives while a previous one is still active**
- Quote the rule: *"switch / merge / concat / exhaust differ only in **what happens when a new inner arrives while a previous one is still active**."*

---

## How It Works

```
Observable<T>  →  project: T → Observable<R>  →  flatten  →  Observable<R>

outer:  --a-----------b-----------c-->
        switchMap(v => inner$(v))

inner(a):  ----A1--A2--A3--|
inner(b):               --B1--B2--|
inner(c):                        --C1--|

output: ------A1--A2----B1----------C1--|
              ↑ inner(a) cancelled when b arrives
                                   ↑ inner(b) cancelled when c arrives

Policy summary:
  switch  → CANCEL previous, start new         "only latest matters"
  merge   → KEEP previous,   start new too     "let them all run"
  concat  → KEEP previous,   QUEUE new         "wait your turn"
  exhaust → KEEP previous,   DROP new          "not now, I'm busy"
```

---

## Common Mistake

```typescript
// ❌ Nested subscriptions — the anti-pattern higher-order operators solve
query$.subscribe(q => {
  // A new request is fired on every emission.
  // No cancellation: the slowest response wins, not the latest query.
  // No cleanup: subscriptions accumulate and are never torn down.
  http.get(`/search?q=${q}`).subscribe(results => {
    render(results); // race condition — out-of-order results corrupt UI
  });
});
```

---

## The Right Way

```typescript
import { switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { of } from 'rxjs';

// ✅ Higher-order operator: flattening + cancellation policy in one pipe() chain
query$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q =>           // switchMap = map to inner$ + flatten with "cancel" policy
    http.get(`/search?q=${q}`).pipe(
      catchError(() => of([])), // always catch INSIDE the inner —
                                // an unhandled inner error kills the outer stream
    )
  ),
  // No nested subscribe — one clean subscription, automatic cancellation
).subscribe(render);
```

---

## Key Rule

> **A higher-order operator is just `map` + `flatten`; the only decision is the flattening policy — switch, merge, concat, or exhaust — based on what should happen to the active inner when the next outer value arrives.**