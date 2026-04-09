# RxJS Operator Families in Machine Language

A translation layer from standard RxJS operator names to the smaller machine calculus.

---

# 1. `withLatestFrom` in machine language

## Standard RxJS reading

`source$.pipe(withLatestFrom(other$))`

## Friendly machine reading

`when(other$)`

## Runtime machine reading

`sampleOn(source$, latest(other$))`

## What flows over time

- `source$` = the trigger stream
- `other$` = remembered current context

## What happens on a new source value

1. source emits
2. read the latest value from `other$`
3. emit `[sourceValue, otherValue]`

## First emission rule

- `source$` alone is not enough
- `other$` must already have emitted at least once

## Memory

- latest value of `other$`

## Loss policy

- no direct loss of source values
- but changes in `other$` between source events are not emitted by themselves
- only the latest remembered one matters when the source triggers

## Small causal sentence

When the source fires, read the current value over there.

## Best mental contrast

- not symmetric
- source drives time
- other stream only provides context

---

# 2. `combineLatest` in machine language

## Standard RxJS reading

`combineLatest([a$, b$])`

## Friendly machine reading

`wheneverAny(a$, b$)`

## Runtime machine reading

`recomputeLatest(latest(a$), latest(b$))`

## What flows over time

- `a$` = dependency A
- `b$` = dependency B
- output = current tuple / derived value from all latest dependencies

## What happens on a new input value

1. any input emits
2. update the remembered latest value for that input
3. recompute output from all remembered latest values
4. emit the new tuple or projection

## First emission rule

- each required input must have emitted at least once
- before that, no complete tuple exists

## Memory

- latest value of every dependency

## Loss policy

- older dependency history is overwritten by newer latest values
- the machine cares about current latest state, not full past history

## Small causal sentence

Whenever any dependency changes, recompute from the latest of all.

## Best mental contrast

- symmetric
- any input can drive time
- no single privileged source

---

# 3. `scan` in machine language

## Standard RxJS reading

`events$.pipe(scan(reducer, seed))`

## Friendly machine reading

`evolve(reducer, seed)`

## Runtime machine reading

`reduceState(events$, reducer, seed)`

## What flows over time

- `events$` = incoming actions / updates
- state = remembered current accumulated value

## What happens on a new event

1. event arrives
2. read current state
3. compute `nextState = reducer(currentState, event)`
4. remember `nextState`
5. emit `nextState`

## First emission rule

- state must start from a seed or some initial state source

## Memory

- current accumulated state

## Loss policy

- none by itself
- every event contributes to the next state in order

## Small causal sentence

Each event updates remembered state.

## Best mental contrast

- not just reading state
- actually changing state
- introduces feedback memory into the machine

---

# 4. Flattening family in machine language

All four flattening operators share the same core machine:

## Friendly machine reading

`forEach(project, policy)`

## Runtime machine reading

`flattenWithPolicy(project, policy)`

## Shared core meaning

1. outer source emits an event
2. project that event into an inner observable
3. apply a policy if new outer events arrive while inner work is still active

## Shared questions

- when new work starts before old work finishes, what is the overlap rule?
- do we overlap, replace, queue, or ignore?

---

## 4.1 `mergeMap`

### Standard RxJS reading

`source$.pipe(mergeMap(project))`

### Friendly machine reading

`forEach(project, 'merge')`

### Runtime machine reading

`flattenWithPolicy(project, 'merge')`

### What happens on a new source value

1. source emits
2. start a new inner observable
3. keep any already-running inners alive
4. emit values from all active inners as they arrive

### Memory

- set of active inner subscriptions

### First emission rule

- source must emit
- then some active inner must emit

### Policy meaning

- allow overlap

### Loss policy

- none by policy
- all inner streams may contribute

### Small causal sentence

Each event starts work, and all work may overlap.

---

## 4.2 `switchMap`

### Standard RxJS reading

`source$.pipe(switchMap(project))`

### Friendly machine reading

`forEach(project, 'switch')`

### Runtime machine reading

`flattenWithPolicy(project, 'switch')`

### What happens on a new source value

1. source emits
2. start a new inner observable
3. cancel the previously active inner
4. only emit values from the latest inner

### Memory

- current active inner subscription only

### First emission rule

- source must emit
- then the latest inner must emit

### Policy meaning

- only latest

### Loss policy

- previous active inner work is replaced / cancelled

### Small causal sentence

Each event starts work, and only the latest work matters.

---

## 4.3 `concatMap`

### Standard RxJS reading

`source$.pipe(concatMap(project))`

### Friendly machine reading

`forEach(project, 'concat')`

### Runtime machine reading

`flattenWithPolicy(project, 'concat')`

### What happens on a new source value

1. source emits
2. if no inner is running, start inner work now
3. if one is already running, queue the new work
4. start queued work only after the current inner completes

### Memory

- current active inner
- queue of pending inner work

### First emission rule

- source must emit
- current inner must emit

### Policy meaning

- queue

### Loss policy

- no loss by policy
- work is serialized

### Small causal sentence

Each event starts work, but work runs one at a time in order.

---

## 4.4 `exhaustMap`

### Standard RxJS reading

`source$.pipe(exhaustMap(project))`

### Friendly machine reading

`forEach(project, 'exhaust')`

### Runtime machine reading

`flattenWithPolicy(project, 'exhaust')`

### What happens on a new source value

1. source emits
2. if no inner is active, start inner work
3. while that inner is still active, ignore new source values
4. accept the next source value only after the current inner completes

### Memory

- busy flag
- current active inner

### First emission rule

- source must emit
- accepted inner must emit

### Policy meaning

- ignore while busy

### Loss policy

- new work arriving during active work is dropped

### Small causal sentence

Each event tries to start work, but busy work blocks new work.

---

# Fast family contrast

| Operator | Friendly machine | Runtime machine | Trigger | Memory | Pressure policy |
|---|---|---|---|---|---|
| `withLatestFrom` | `when(other$)` | `sampleOn(source$, latest(other$))` | source | latest other | keep current context only |
| `combineLatest` | `wheneverAny(a$, b$)` | `recomputeLatest(...)` | any input | latest of all | overwrite old latest memory |
| `scan` | `evolve(reducer, seed)` | `reduceState(...)` | source event | current state | accumulate in order |
| `mergeMap` | `forEach(project, 'merge')` | `flattenWithPolicy(..., 'merge')` | source | active inners | overlap |
| `switchMap` | `forEach(project, 'switch')` | `flattenWithPolicy(..., 'switch')` | source | current inner | replace |
| `concatMap` | `forEach(project, 'concat')` | `flattenWithPolicy(..., 'concat')` | source | current inner + queue | queue |
| `exhaustMap` | `forEach(project, 'exhaust')` | `flattenWithPolicy(..., 'exhaust')` | source | busy flag + current inner | drop while busy |

---

# Smallest comparisons

## `withLatestFrom` vs `combineLatest`

- `withLatestFrom` = source-driven read
- `combineLatest` = symmetric latest recompute

## `scan` vs `withLatestFrom`

- `withLatestFrom` reads current context
- `scan` updates remembered state

## Flattening family vs `scan`

- `scan` stays first-order and updates state
- flattening operators start inner streams and need overlap policy

## `mergeMap` vs `switchMap` vs `concatMap` vs `exhaustMap`

- `merge` = allow overlap
- `switch` = replace previous
- `concat` = queue
- `exhaust` = ignore while busy

---

# One-sentence summary

Most RxJS operator families become easier to read once you rewrite them as a small number of stream machines: read current context, recompute latest dependencies, evolve state, or start inner work with an overlap policy.

