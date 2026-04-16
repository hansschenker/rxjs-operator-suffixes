---
module: 10
type: outro
title: Module 10 Recap — Domain Facades, Testing & Architecture
---

## What You Learned

- The Alias+Wrap pattern gives operators domain names with injectable test seams — pipelines read as domain language
- Hexagonal architecture isolates RxJS inside domain operators; components have zero RxJS imports
- `withTelemetry` applies AOP: cross-cutting concerns declared once, transparent to the wrapped operator
- `TestScheduler` makes time deterministic — 300ms of debounce runs in under 1ms of test time
- The 4-Layer Model is a diagnostic compass: wrong value → Layer 1, wrong time → Layer 2, wrong sharing → Layer 3, wrong concurrency → Layer 4

## Final Note

You now have a complete framework for understanding, designing, debugging, and testing reactive systems with RxJS. The 4-Layer Model is not just a learning scaffold — it is a runtime diagnostic tool. Every production bug that involves RxJS lives in one of the four layers. Find the layer, find the operator, find the fix.
