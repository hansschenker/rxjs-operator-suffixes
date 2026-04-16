---
module: 7
type: outro
title: Module 7 Recap — Layer 4: Flattening
---

## What You Learned

- Flattening exists because `map` applied to an async operation produces `Observable<Observable<T>>` — an unusable nested type
- `mergeMap`: parallel, unbounded, unordered — correct when each inner result is independent
- `concatMap`: serial, ordered, queued — correct when sequence matters (animations, ordered writes)
- `switchMap`: cancel-on-new — correct for live queries where only the latest result is relevant
- `exhaustMap`: ignore-while-busy — correct for user actions (form submit, login) that must not overlap

## Bridge to Module 8

Layers 1–4 all operate on individual streams or the inner Observables they produce. Module 8 — Combining Streams — asks: how do you combine multiple independent outer streams so their values are temporally aligned?
