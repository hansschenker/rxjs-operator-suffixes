---
module: 6
type: intro
title: Module 6 — Layer 3: Sharing
---

## What You Already Know

From Modules 1–5: the mathematical duality of Observable, cold vs hot, the five subscription phases, Layer 1 (values) and Layer 2 (time). You can transform and rate-limit a single stream. Now the question is: what happens when multiple consumers need the same stream?

## What This Module Covers

- **6.1** Unicast vs multicast — two consumers, one producer or two?
- **6.2** Subject as proxy — how Subject is simultaneously Observer and Observable
- **6.3** Specialized Subject variants — BehaviorSubject, ReplaySubject, AsyncSubject
- **6.4** share and shareReplay — converting cold Observables to multicast without Subject boilerplate
- **6.5** Connectable — explicit lifecycle control for when subscriptions must coordinate

## Why It Matters

Most data-sharing bugs — duplicate HTTP requests, stale caches, late subscribers that miss events — are Layer 3 problems. Understanding the unicast/multicast axis turns mysterious bugs into predictable, fixable configuration choices.
