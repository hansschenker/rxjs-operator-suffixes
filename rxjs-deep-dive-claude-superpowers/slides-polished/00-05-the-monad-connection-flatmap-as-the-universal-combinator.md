---
marp: true
theme: uncover
title: "The monad connection: flatMap as the universal combinator"
---

# The monad connection: flatMap as the universal combinator
> You reach for `switchMap` because it "feels right" — but without the monad model you're guessing at concurrency policy, not reasoning about it.

---

## Core Concept

- Observable is a **monad**: the triple `(Observable<T>, of, mergeMap)` governed by three algebraic laws
- `of(x)` is the **unit** — it lifts a plain value into the container without adding behaviour
- `mergeMap(f)` is the **bind** — it sequences computations while flattening one level of Observable nesting
- The three laws (left identity, right identity, associativity) are **refactoring guarantees** — structure can change, semantics cannot
- > "`mergeMap` is the canonical monadic bind for Observable — it is the only one that satisfies all three laws unconditionally."

---

## How It Works

```typescript
// The three monad laws as safe, mechanical refactoring rules

// 1. Left identity — of + bind collapses to the function itself
of(userId).pipe(mergeMap(id => fetchUser(id)));
// ≡ fetchUser(userId)

// 2. Right identity — binding with of() is a no-op
obs$.pipe(mergeMap(x => of(x)));
// ≡ obs$

// 3. Associativity — flat chain ≡ nested chain; pick whichever reads better
obs$.pipe(
  mergeMap(x => validate(x)),   // ─┐ can always be
  mergeMap(x => save(x)),       // ─┘ collapsed into one mergeMap
);
// ≡
obs$.pipe(
  mergeMap(x => validate(x).pipe(mergeMap(y => save(y)))),
);
```

---

## Common Mistake

```typescript
// ❌ Using switchMap as a generic "async flatMap" for everything
// switchMap cancels the inner Observable when a new outer value arrives.
// This silently breaks associativity — nesting order now changes which
// values get cancelled, so the monad laws no longer hold.

const result$ = userId$.pipe(
  // If userId$ emits twice quickly, the first fetchUser is cancelled...
  switchMap(id => fetchUser(id)),
  // ...but now this second switchMap also cancels in-flight fetchProfile
  // calls. Silent data loss — no error, no warning.
  switchMap(user => fetchProfile(user.id)),
);

// The real bug: switchMap was chosen because it "handles async",
// not because cancellation-on-new-value was the actual requirement.
```

---

## The Right Way

```typescript
import { mergeMap, concatMap, switchMap, exhaustMap } from 'rxjs';

// ✅ Pick the flatMap variant whose concurrency contract you actually need

// mergeMap — canonical bind; satisfies all 3 monad laws; unlimited concurrency
obs$.pipe(
  mergeMap(id => fetchUser(id)),        // run all inner streams concurrently
);

// concatMap — ordered queue; use for writes where sequence matters
obs$.pipe(
  concatMap(cmd => saveRecord(cmd)),    // never overlaps; buffers excess
);

// switchMap — cancel-on-new; use for live search / typeahead
search$.pipe(
  switchMap(query => fetchResults(query)), // latest value wins
);

// exhaustMap — ignore-while-busy; use for form submit / login
submit$.pipe(
  exhaustMap(payload => postForm(payload)), // first in-flight wins; drops rest
);
```

---

## Key Rule

> **There are exactly four `flatMap` policies because there are exactly four pure answers to "what do you do with the previous inner Observable when a new outer value arrives" — choose by concurrency contract, not by feel, and use `mergeMap` as the default when no cancellation or ordering is needed.**