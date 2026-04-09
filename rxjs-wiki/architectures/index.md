---
title: "Architectures Index"
category: architectures
tags: [architectures, index, overview]
related: [mvu.md, redux-observable.md, event-driven.md, ../patterns/index.md]
sources: 0
updated: 2026-04-08
---

# RxJS Architectures

> Complete application architectures built on RxJS — how to wire state, effects, views, and communication together.

## Architecture Catalog

- [mvu](mvu.md) — Model–View–Update (Elm-like) — pure unidirectional flow with RxJS
- [redux-observable](redux-observable.md) — Redux + RxJS Epics — using redux-observable middleware
- [event-driven](event-driven.md) — Event-driven microkernel with RxJS event bus

## Choosing an Architecture

| Architecture | Best for | Complexity |
|-------------|----------|------------|
| BehaviorSubject store | Simple/medium apps, team new to RxJS | Low |
| MVU (scan + Subject) | Medium/large apps, FP teams | Medium |
| redux-observable | Redux codebase + RxJS | Medium |
| Event-driven bus | Decoupled modules, micro-frontends | Medium |

## Common Principles

All RxJS architectures share these principles:

1. **Unidirectional data flow** — state changes are predictable and traceable
2. **Immutable state** — reducers return new objects, never mutate
3. **Pure functions** for state transitions — easy to test
4. **Effects separate from state** — async work never happens in reducers
5. **Subscriptions at the boundary** — components subscribe at the edge, not deep in the system

## The Dependency Graph

```
         User Events
              │
              ▼
         Actions (Subject)
         /           \
        ▼             ▼
    Effects        Reducer (scan)
    (async)            │
        \              ▼
         ►──────► State (Observable)
                       │
                       ▼
                    View (subscribe)
```

## Related

- [mvu](../patterns/mvu.md) — pattern-level details
- [effects](../patterns/effects.md) — effects pattern
- [state-management](../patterns/state-management.md) — state patterns
