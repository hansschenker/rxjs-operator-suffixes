---
module: 8
type: outro
title: Module 8 Recap — Combining Streams
---

## What You Learned

- Every combining operator answers two questions: when does output fire, and which values does it use?
- `combineLatest`: fires on any source update, uses the latest from all — correct for reactive derived state
- `withLatestFrom`: fires only on the primary source, samples secondaries — correct for actions with context
- `zip`: pairs by emission index — strict positional alignment; `forkJoin`: waits for all sources to complete
- `merge`/`concat`/`race`: timing combiners that forward emissions without pairing values

## Bridge to Module 9

Streams work correctly — until they fail. Module 9 — Error Handling — covers what happens when the Observable contract is broken: why errors are terminal, how to recover without breaking the pipe, and how to build streams that survive production conditions.
