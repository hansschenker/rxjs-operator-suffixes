---
title: "RxJS Execution Phases"
category: core
tags: [core, execution, phases, plan, lazy, subscription, scheduler, lossy, non-lossy]
related: [Observable.md, observable-internals.md, Scheduler.md, operators.md, custom-operators.md]
sources: 1
updated: 2026-04-08
---

# RxJS Execution Phases

> Every RxJS program has two distinct phases: the **Execution Plan** (lazy blueprint) and **Execution** (triggered by subscribe). Nothing runs until you subscribe.

## Phase 1 — Execution Plan (Lazy Composition)

When you write a `pipe()` chain, you are **building a blueprint**. No computation happens. No values flow. No side effects occur.

```typescript
// Phase 1: building the plan — nothing runs yet
const result$ = interval(1000).pipe(
	filter(x => x % 2 === 0),
	map(x => x * 10),
	take(5),
);
// result$ is just a composed Observable — inert, like a function definition
```

**Properties of the Execution Plan phase:**
- Observables are cold — the plan can be passed around, stored, composed further
- Operators build an "onion" of wrapping Observables (each wraps the previous)
- Schedulers are declared in the plan but do not yet manifest
- The plan is a reusable, shareable object

## Phase 2 — Execution (Subscribe)

`subscribe()` is the trigger. The lazy plan becomes a live, running process:

```typescript
// Phase 2: execution begins
const sub = result$.subscribe(value => console.log(value));
// Now: producer activates, scheduler dispatches, values flow, teardown is armed
```

**What happens at subscribe:**
1. **Producer activates** — the innermost Observable starts generating values
2. **Scheduler dispatches** — timing decisions are realized (async, animation frame, etc.)
3. **Values push through** — each emission traverses the operator chain outward
4. **Teardown arms** — unsubscribe will cancel all resources

## The Key Distinction

```
Plan phase:   build ──► compose ──► store ──► pass around
                ↓
              (nothing runs until...)
                ↓
Execution:    subscribe() triggers ──► producer starts ──► values flow
```

This separation is what makes RxJS **declarative**: you describe *what* to do in phase 1, and *when* to run it is a separate decision (phase 2).

```typescript
// Same plan, different execution timing
const search$ = input$.pipe(debounceTime(300), switchMap(fetch));

// Execute immediately
search$.subscribe(render);

// Execute only when a button is clicked
button$.pipe(switchMap(() => search$)).subscribe(render);
```

## Shared vs Independent Execution

By default, each `subscribe()` call creates an **independent execution** (cold):

```typescript
const counter$ = interval(1000);

counter$.subscribe(v => console.log('A:', v)); // own timer: 0, 1, 2...
counter$.subscribe(v => console.log('B:', v)); // own timer: 0, 1, 2...
```

Use `share()` or `shareReplay()` to create **shared execution** (hot):

```typescript
const shared$ = interval(1000).pipe(share());

shared$.subscribe(v => console.log('A:', v)); // shared timer
shared$.subscribe(v => console.log('B:', v)); // same timer, same values
```

See [hot-cold](hot-cold.md) for the full temperature model.

## Lossy vs Non-Lossy Operators

A third dimension for classifying operators — beyond value/time-based and first/higher-order:

| | **Non-lossy** | **Lossy** |
|--|---------------|-----------|
| Definition | Every input value is represented in the output | Some input values are intentionally dropped |
| Value-based | `map`, `scan`, `pairwise`, `materialize` | `filter`, `distinctUntilChanged`, `take`, `skip`, `single` |
| Time-based | `delay`, `bufferTime`, `timestamp`, `timeInterval` | `debounceTime`, `throttleTime`, `sampleTime`, `auditTime` |

**Lossy operators are not bugs** — they are deliberate design choices for:
- **Backpressure** — protect downstream from too many values
- **Rate limiting** — respect UI render cycles or network bandwidth
- **Deduplication** — skip intermediate states the user doesn't care about

```typescript
// Deliberate lossiness: debounce drops intermediate keystrokes (backpressure)
input$.pipe(
	debounceTime(300),         // LOSSY: drops keystrokes during typing
	distinctUntilChanged(),    // LOSSY: drops duplicate final values
	switchMap(q => search(q)), // NON-LOSSY: maps every query to a request
).subscribe(render);
```

### Composing Lossiness

You can chain lossy and non-lossy operators to craft a precise policy:

```typescript
events$.pipe(
	scan(reducer, initial),     // NON-LOSSY: accumulate all events into state
	auditTime(16),              // LOSSY: sample state at 60fps (one per frame)
	map(formatForDisplay),      // NON-LOSSY: transform each sampled state
).subscribe(render);
```

Non-lossy accumulation → lossy temporal sampling → non-lossy formatting: state is never lost, but render calls are bounded to 60fps.

## Schedulers — Bridging Plan and Execution

Schedulers are declared in the plan phase but only act in the execution phase. They control *when* and *where* emissions are delivered:

| Scheduler | Dispatch timing | Use case |
|-----------|----------------|---------|
| `queueScheduler` | Synchronous, breadth-first | Recursive operators, prevent stack overflow |
| `asapScheduler` | Microtask (before next paint) | Promise-like, faster than setTimeout |
| `asyncScheduler` | Macrotask (setTimeout) | Standard async deferral |
| `animationFrameScheduler` | requestAnimationFrame | Animations, synchronized with browser paint |
| `VirtualTimeScheduler` | Virtual (instant in tests) | Deterministic testing of time-based operators |

```typescript
// Scheduler in plan — only acts when subscribed
interval(0, animationFrameScheduler).pipe(
	take(60),
	map(frame => frame / 60),
).subscribe(progress => updateProgressBar(progress));
```

Without a scheduler, Observables default to synchronous execution — which can overflow the call stack for recursive or infinite streams.

## Related

- [Observable](Observable.md) — formal `[(T, a), ...]` model; cold vs hot
- [observable-internals](observable-internals.md) — how subscribe triggers the execution chain
- [Scheduler](Scheduler.md) — Scheduler deep-dive; VirtualTimeScheduler for testing
- [operators](operators.md) — value-based/time-based/lossy/non-lossy operator reference
- [hot-cold](hot-cold.md) — shared vs independent execution
