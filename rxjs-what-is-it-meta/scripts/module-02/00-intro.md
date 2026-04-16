---
module: 2
type: intro
title: Module 2 — The Observable Contract
---

## What You Already Know

From Module 1: Observable is the push-based dual of Iterable, fusing the Iterator and Observer patterns. You know the three-zone workflow and why the operator vocabulary comes from LINQ.

## What This Module Covers

- **2.1** What really happens when you subscribe — each subscribe creates a new producer execution
- **2.2** Cold vs Hot — producer behavior determines whether subscriptions share or isolate
- **2.3** The five subscription phases — Setup, Running, Error, Complete, Teardown
- **2.4** Two graphs every pipeline builds — dependency graph vs subscription graph
- **2.5** The three Observable variants — Standard, Connectable, Subject

## Why It Matters

Most RxJS bugs — duplicate HTTP requests, memory leaks, stale data — come from misunderstanding what `.subscribe()` does and how producers are shared. This module gives you the precise mental model that prevents the entire category.
