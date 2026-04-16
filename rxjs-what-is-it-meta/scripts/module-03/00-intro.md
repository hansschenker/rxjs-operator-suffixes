---
module: 3
type: intro
title: Module 3 — Functional RxJS
---

## What You Already Know

From Modules 1–2: Observable is the mathematical dual of Iterable. Each subscribe creates a new execution. Five lifecycle phases, two graphs, three variants.

## What This Module Covers

- **3.1** Data and Logic are separate — Observable is the data; operators encode the logic
- **3.2** Referential transparency — the Observable as a reusable, side-effect-free blueprint
- **3.3** subscribe() as the single impure boundary — where functional purity ends
- **3.4** tap vs map — declaring side effects without corrupting the pipeline
- **3.5** RxJS as a DSL for time-varying values — operators as a grammar, not a toolbox

## Why It Matters

Functional purity is not an abstract virtue — it is the property that makes RxJS pipelines safe to test, refactor, and compose. This module explains the rules that keep pipelines pure and shows exactly where impurity is permitted.
