---
module: 4
type: intro
title: Module 4 — Layer 1: Values
---

## What You Already Know

From Module 3: the pure transformation zone, referential transparency, tap vs map, RxJS as a DSL.

## What This Module Covers

- **4.1** The three primitives — map, filter, flatMap derive all value operators
- **4.2** scan — accumulating state from a stream without mutable variables
- **4.3** The monad laws — why Observable composition is always safe
- **4.4** T-only operators — the purely value-based, scheduler-free family
- **4.5** Operator classification — T-only vs T+time vs time-only

## Why It Matters

Layer 1 operators are the cheapest and most composable in the entire framework. Knowing which operators are T-only tells you: no timers, no schedulers, no buffers — testable synchronously, safe to use anywhere.
