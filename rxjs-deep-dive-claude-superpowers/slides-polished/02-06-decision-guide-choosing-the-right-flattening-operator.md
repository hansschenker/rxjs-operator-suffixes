---
marp: true
theme: uncover
title: "Decision guide: choosing the right flattening operator"
---

# Decision guide: choosing the right flattening operator
> Intermediate devs default to `switchMap` for everything — the wrong flattening policy silently creates race conditions, dropped mutations, or unbounded parallel requests.

---

## Core Concept
- All four operators project each outer value to an inner Observable, then flatten `Observable<Observable<R>>` → `Observable<R>`
- `switchMap` — cancel the previous inner, subscribe to the new one ("only latest matters")
- `mergeMap` — keep all inners running concurrently; results arrive in time order ("let them all run")
- `concatMap` — queue the new inner; run it only after the current one completes ("wait your turn")
- `exhaustMap` — drop the new inner entirely while the current one is active ("not now, I'm busy")

> "The four policies differ only in **what happens when a new inner arrives while a previous one is still active**."

---

## How It Works

```typescript
// outer: --a--b--c-->   b and c arrive before a's inner completes

// switchMap  → cancel a, start b; cancel b, start c     O(1) memory
// mergeMap   → keep a,  also start b, also start c      O(N) memory
// concatMap  → keep a,  queue b,      queue c           O(queue) memory
// exhaustMap → keep a,  drop b,       drop c            O(1) memory

// ── Decision tree ──────────────────────────────────────────
if (userTriggered && mustNotOverlap) → exhaustMap  // form submit, login
if (staleResultsAreWorthless)        → switchMap   // search, live route data
if (orderMatters && sequential)      → concatMap   // migrations, animations
if (allResultsMatter && parallel)    → mergeMap    // batch HTTP, file loads
```

---

## Common Mistake

```typescript
// ❌ switchMap for form submit — cancels an in-flight POST on each click
submitBtn$.pipe(
  switchMap(() =>
    http.post('/api/orders', payload)
    // Double-click: switchMap UNSUBSCRIBES from the first POST and starts fresh.
    // The server may have already committed the first request —
    // result: duplicate orders, partial writes, data corruption.
    // switchMap is for queries where stale = worthless; writes are never stale.
  )
).subscribe(handleResult);
```

---

## The Right Way

```typescript
// ✅ exhaustMap — ignore re-clicks while a submit is in-flight
submitBtn$.pipe(
  exhaustMap(() =>                       // drops every click while POST is active
    http.post('/api/orders', payload).pipe(
      catchError(err => of({ error: err })) // always catch *inside* the inner
    )
  )
).subscribe(handleResult);

// ✅ switchMap — cancel stale requests on every new keystroke
searchInput$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q =>                         // each new query cancels the previous
    searchApi$(q).pipe(
      catchError(() => of([]))           // always catch *inside* the inner
    )
  )
).subscribe(renderResults);
```

---

## Key Rule
> **Use `exhaustMap` for user actions that must not overlap, `switchMap` when stale results are worthless, `concatMap` for ordered sequential steps, and `mergeMap` for parallel independent work — picking the wrong one is a silent bug.**