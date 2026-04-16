---
module: 4
type: outro
title: Module 4 Recap — Layer 1: Values
---

## What You Learned

- `map`, `filter`, and `flatMap` are the three primitives — every other value operator is a composition of these
- `scan` is the stream equivalent of `reduce` but emits every intermediate accumulation — the natural reactive state primitive
- Observable obeys the monad laws, guaranteeing that operator chains compose correctly regardless of nesting order
- T-only operators are purely value-based — synchronous, scheduler-free, and independently testable
- Classifying an operator as T-only, T+time, or time-only tells you its cost, testability, and which diagnostic layer to inspect

## Bridge to Module 5

You can now operate on the *value* dimension of a stream. But Observable carries a second dimension — time. The same value emitted at t=0 vs t=1000ms is a fundamentally different signal. Module 5 adds the temporal layer.
