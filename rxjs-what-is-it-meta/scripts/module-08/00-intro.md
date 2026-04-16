---
module: 8
type: intro
title: Module 8 — Combining Streams
---

## What You Already Know

From Modules 1–7: all four layers. You can transform values, manage time, share producers, and flatten async operations. But real apps have multiple independent data sources — user profile, permissions, live prices — that must be combined into a single output.

## What This Module Covers

- **8.1** Temporal alignment — the question every combining operator answers differently
- **8.2** combineLatest — reactive derived state, fires on any source update
- **8.3** withLatestFrom — action with context, fires on the primary source only
- **8.4** zip and forkJoin — positional pairing and parallel completion waiting
- **8.5** merge, concat, and race — timing combiners that don't pair values

## Why It Matters

The choice of combining operator determines when your output fires and which values it uses. Use `combineLatest` where `withLatestFrom` is correct and you fire on every config change instead of only on user actions — a subtle but real UI bug.
