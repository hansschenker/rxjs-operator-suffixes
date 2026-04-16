---
module: 2
type: outro
title: Module 2 Recap — The Observable Contract
---

## What You Learned

- Each `.subscribe()` call creates a new, independent producer execution — not a listener on a shared stream
- Cold Observables create a fresh producer per subscriber; Hot Observables share one already-running producer
- A Subscription has five phases: Setup, Running, Error, Complete, Teardown — only one Error or Complete ever fires
- Every pipeline builds two graphs: a static dependency graph (value flow) and a dynamic subscription graph (teardown propagation)
- Three Observable variants differ on when the producer starts: Standard (per subscribe), Connectable (on connect()), Subject (already running)

## Bridge to Module 3

You know the mechanics. Now: what does it mean for RxJS code to be *correct*? Module 3 introduces the functional programming principles that separate RxJS code that is safe to refactor from code that looks fine but breaks in subtle ways.
