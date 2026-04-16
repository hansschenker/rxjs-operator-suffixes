---
module: 3
type: outro
title: Module 3 Recap — Functional RxJS
---

## What You Learned

- Observable is the data; operators are the logic — the architecture enforces functional separation automatically
- An Observable is referentially transparent until `.subscribe()` — it is a blueprint, not an execution
- `subscribe()` is the single impure boundary — the only place side effects are permitted
- `tap` declares a side effect that runs at the right time without mutating the emitted value; `map` must be pure
- RxJS is a DSL for time-varying values — like SQL for tables, with operators as the grammar

## Bridge to Module 4

The 4-Layer Model begins here. Layer 1 — Values — is about operators that transform the *value* dimension of a stream: `map`, `filter`, `scan`, and their family. Module 4 shows you how the entire value-transformation landscape is built from three primitives.
