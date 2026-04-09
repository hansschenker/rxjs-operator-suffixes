# RxJS Machine Calculus — Cheat Sheet

A compact way to read RxJS as a small set of stream machines.

---

## Teaching layer

Use these names when explaining behavior:

- `when(...)` — when this happens, read the current value there
- `wheneverAny(...)` — whenever any dependency changes, recompute from the latest of all
- `evolve(...)` — each event updates remembered state
- `forEach(..., policy)` — each event starts work; policy handles overlap
- `gate(...)` — values may pass only under this condition
- `shapeTime(...)` — keep the values, change the timing rule

---

## Runtime layer

Use these names when analyzing semantics:

- `sampleOn(trigger, memory)`
- `recomputeLatest(inputs...)`
- `reduceState(events, reducer, seed)`
- `flattenWithPolicy(project, policy)`
- `composeTopology(sources, topology)`
- `shareExecution(source, memory)`

---

## Core question per machine

### 1. `sampleOn(trigger, memory)`
**Question:** when this happens, what is the current value there?

Covers:
- `withLatestFrom`
- `sample` (swap trigger/value roles)
- previous/current comparisons after adding memory

Trigger:
- one privileged trigger

Memory:
- latest remembered context

---

### 2. `recomputeLatest(inputs...)`
**Question:** whenever anything changes, what is the latest derived value now?

Covers:
- `combineLatest`
- `combineLatestWith`

Trigger:
- any input

Memory:
- latest of every dependency

---

### 3. `reduceState(events, reducer, seed)`
**Question:** given current state and this event, what is the next state?

Covers:
- `scan`
- reducer-driven state machines

Trigger:
- event stream

Memory:
- current accumulated state

---

### 4. `flattenWithPolicy(project, policy)`
**Question:** when new work starts before old work finishes, what is the overlap rule?

Covers:
- `mergeMap`
- `switchMap`
- `concatMap`
- `exhaustMap`

Trigger:
- outer source starts inner work

Memory:
- active inner, queue, or busy flag

Policies:
- `merge` = allow overlap
- `switch` = only latest
- `concat` = queue
- `exhaust` = ignore while busy

---

### 5. `composeTopology(sources, topology)`
**Question:** how do multiple sources coexist structurally?

Covers:
- `merge`
- `concat`
- `zip`
- `race`
- `forkJoin`

Trigger:
- topology-specific

Memory:
- none, queues, or completion state depending on topology

---

### 6. `shareExecution(source, memory)`
**Question:** does each subscriber get a fresh execution, or do they share one?

Covers:
- `share`
- `shareReplay`
- subject-based shared state patterns

Trigger:
- subscriptions + source execution

Memory:
- replay buffer / shared execution state

---

## Fast operator map

| RxJS operator | Friendly machine | Runtime machine |
|---|---|---|
| `withLatestFrom` | `when(...)` | `sampleOn(trigger, memory)` |
| `sample` | `at(clock, value)` | `sampleOn(trigger, memory)` |
| `combineLatest` | `wheneverAny(...)` | `recomputeLatest(inputs...)` |
| `filter` | `gate(...)` | usually `gate` as a derived pass/block rule |
| `takeUntil` / `skipUntil` | `gate(...)` | derived lifecycle gate |
| `debounceTime` | `shapeTime(...)` | derived timing policy |
| `throttleTime` | `shapeTime(...)` | derived timing policy |
| `auditTime` | `shapeTime(...)` | derived timing policy |
| `delay` | `shapeTime(...)` | derived timing policy |
| `scan` | `evolve(...)` | `reduceState(events, reducer, seed)` |
| `mergeMap` | `forEach(..., 'merge')` | `flattenWithPolicy(project, 'merge')` |
| `switchMap` | `forEach(..., 'switch')` | `flattenWithPolicy(project, 'switch')` |
| `concatMap` | `forEach(..., 'concat')` | `flattenWithPolicy(project, 'concat')` |
| `exhaustMap` | `forEach(..., 'exhaust')` | `flattenWithPolicy(project, 'exhaust')` |
| `merge` | `either(...)` | `composeTopology(..., 'merge')` |
| `concat` | `then(...)` | `composeTopology(..., 'concat')` |
| `zip` | `togetherByIndex(...)` | `composeTopology(..., 'zip')` |
| `share` | `shareWhileObserved()` | `shareExecution(source, memory)` |
| `shareReplay` | `rememberLatest()` / `replayLast(n)` | `shareExecution(source, memory)` |

---

## Practical classification order

When you see an operator, ask:

1. **Who drives time?**
2. **What is remembered?**
3. **Is it flattening inner work?**
4. **Is it arranging multiple sources?**
5. **Does it drop, replace, or queue values?**
6. **What must happen before the first output?**
7. **Is execution shared or fresh per subscriber?**

---

## The shortest mental model

- `when` = source-driven read
- `wheneverAny` = symmetric latest recompute
- `evolve` = state that remembers
- `forEach + policy` = inner work + overlap rule
- `composeTopology` = multi-source structure
- `shareExecution` = subscription topology + replay memory

---

## Guiding idea

The domain can change.
The stream machines stay the same.

