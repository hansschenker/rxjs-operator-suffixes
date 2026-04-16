---
module: 7
type: intro
title: Module 7 — Layer 4: Flattening
---

## What You Already Know

From Module 4: `flatMap` is one of the three primitives. From Modules 1–6: the Observable contract, functional purity, and the three completed layers — Values (Layer 1), Time (Layer 2), and Sharing (Layer 3). You know that subscribing to an Observable<Observable<T>> gives you a nested structure, not the inner values. This module resolves that.

## What This Module Covers

- **7.1** The Observable<Observable<T>> problem — why map to async gives you the wrong type
- **7.2** mergeMap — parallel execution with no ordering guarantees
- **7.3** concatMap — serial execution, one inner at a time, in arrival order
- **7.4** switchMap — cancel-on-new, correct for live queries
- **7.5** exhaustMap — ignore-while-busy, correct for user actions that must not overlap

## Why It Matters

Every async operation triggered by a user action — search, submit, navigate — is a Layer 4 problem. The four flattening operators are not interchangeable: choose the wrong one and you ship race conditions, data loss, or double-submits with no error in the console.
