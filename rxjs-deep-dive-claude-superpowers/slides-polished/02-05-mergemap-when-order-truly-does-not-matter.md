---
marp: true
theme: uncover
title: "mergeMap: when order truly does not matter"
---

# mergeMap: when order truly does not matter
> Nested subscriptions give you parallel HTTP requests with zero concurrency control, no cleanup, and guaranteed race conditions.

---

## Core Concept

- Projects each outer value to an inner Observable and subscribes **immediately** — no waiting, no cancellation
- All active inners run **concurrently**; values arrive interleaved in arrival order, not emission order
- Concurrency is unbounded by default: `mergeMap(project, N)` caps simultaneous inners at `N`
- Active subscription count grows with active inners — an inner that never completes is a **permanent leak**
- **Rule:** "Do all results matter, can they arrive in any order, and can work run in parallel?" → `mergeMap`

---

## How It Works

```
outer:    --a-----b-----c--->
          mergeMap(v => inner$(v))

inner(a): ----A1----A2----A3--|
inner(b):       ----B1----B2--|
inner(c):             ----C1--|

output:   ------A1--B1-A2-B2-A3-C1--|
          ^^ all three inners subscribed and active simultaneously
          ^^ results interleaved — arrival order, not outer-emission order
```

---

## Common Mistake

```typescript
// ❌ Nested subscriptions — the anti-pattern mergeMap exists to replace
userIds$.subscribe(id => {
  loadUser$(id).subscribe(user => {
    // New inner subscription for every outer value.
    // Previous requests keep running — race conditions guaranteed.
    // No concurrency cap — 1000 ids = 1000 simultaneous requests.
    // One error kills nothing except that one callback silently.
    store.update(user);
  });
});
```

---

## The Right Way

```typescript
import { mergeMap, catchError, filter } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

userIds$.pipe(
  mergeMap(
    id =>
      loadUser$(id).pipe(
        // ✅ Always catch inside the inner — one failure must not kill the outer stream
        catchError(err => {
          console.error('User load failed:', id, err);
          return EMPTY; // skip this user, keep processing the rest
        }),
      ),
    3, // ✅ Concurrency cap — at most 3 simultaneous requests at any time
  ),
).subscribe(user => store.update(user));
```

---

## Key Rule
> **`mergeMap` is the right choice only when every result matters and arrival order is irrelevant — if order matters even slightly, reach for `concatMap`; always catch errors inside the inner and cap concurrency explicitly.**