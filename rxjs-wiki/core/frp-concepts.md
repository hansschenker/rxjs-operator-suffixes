---
title: "FRP Concepts — Behaviors, Events, and the Origins of Reactive Programming"
category: core
tags: [core, frp, functional-reactive-programming, behaviors, events, history]
related: [Observable.md, combination-operators.md, ../history/erik-meijer.md, ../overview.md]
sources: 1
updated: 2026-04-08
---

# FRP Concepts — Behaviors, Events, and the Origins of Reactive Programming

> Classic Functional Reactive Programming (Conal Elliott, 1997) introduced two abstractions — **Behaviors** and **Events** — that remain the clearest way to reason about values over time. RxJS Observables are the practical, impure descendant of the Event abstraction.

## What FRP Means (Precisely)

**Reactive programming** = writing programs that care about their behaviour *over time* — how they respond to events and changes occurring inside or outside the program.

**Functional reactive programming** adds three constraints to that:

| Property | Meaning |
|----------|---------|
| **Explicit** | Time and change are first-class parts of the abstraction — not implicit mutable state |
| **Composable** | Build large reactive systems out of small, reusable parts |
| **Declarative** | Describe *what* the behaviour is, not *how* it is executed — abstract over the machine |

Imperative programming handles time implicitly by mutating variables. FRP makes time explicit in the type system.

## The Two Core Abstractions

Classic FRP (Conal Elliott & Paul Hudak, *ICFP 1997*) defines exactly two primitives:

### Behavior — Continuous Time-Varying Value

```
Behavior<A> = Time → A
```

A Behavior is a *function from time to a value* — a value that varies continuously. Examples:
- Mouse position → `Behavior<{x: number, y: number}>`
- Current audio level → `Behavior<number>`
- Game paused state → `Behavior<boolean>`

A Behavior always has a value at every point in time. You can query it at any moment and get an answer.

### Event — Discrete Occurrences

```
Event<A> = [(Time, A)]
```

An Event is a *list of time-value pairs* — discrete occurrences at specific moments. Examples:
- Mouse click → `Event<MouseEvent>`
- Key press → `Event<KeyboardEvent>`
- HTTP response → `Event<Response>`

Events do not have a value between occurrences. They fire and then are silent.

## How Behaviors and Events Relate

| | Behavior | Event |
|--|----------|-------|
| **Model** | `Time → A` (function) | `[(Time, A)]` (list) |
| **Continuous?** | Yes — value at every moment | No — only at discrete points |
| **Examples** | Mouse position, audio level | Click, key press, HTTP response |
| **RxJS equivalent** | `BehaviorSubject` | `Observable` |

The combination of Behaviors and Events lets you express any reactive logic declaratively, without mutable state or callbacks.

## The FRP Architecture Pattern

FRP code follows a consistent three-layer pattern:

```
Inputs (Events + Behaviors)
    ↓
Combinators (compose and transform)
    ↓
Outputs (side effects — render, motors, network)
```

This pattern applies across domains:

| Domain | Inputs | Combinators | Outputs |
|--------|--------|-------------|---------|
| **UI** | Mouse position, clicks, keyboard | `map`, `filter`, `when` | Render to canvas/DOM |
| **Robotics** | Camera feed, sensor readings | Processing combinators | Motor voltages |
| **Simulation** | Configuration, schedules | Model combinators | Observations, metrics |

The combinators and the Behavior/Event types stay the same across all three. Only the input sources and output sinks change.

## Key Combinators

**`when(event, behavior)` — gate events by a condition:**

```typescript
// Equivalent in RxJS
const shiftClick$ = clicks$.pipe(
	withLatestFrom(shiftKey$),
	filter(([_, isShift]) => isShift),
	map(([click]) => click),
);
```

**`map(fn, behavior)` — transform continuously:**

```typescript
// Encode business rules as a pure transformation
const audioWarning$ = audioLevel$.pipe(
	map(level => level > 0.8 ? 'TOO LOUD' : 'OK'),
	distinctUntilChanged(),
);
```

## fold-events-into-behavior — The State Pattern

The most powerful FRP pattern: **instead of starting with state, start with a stream of updates**.

Each event in the stream is a *diff* to the current state. Fold all diffs into the running state:

```typescript
// Classic FRP:  stepper(initialState, updates$) → Behavior<State>
// RxJS equivalent:
const state$ = updates$.pipe(
	scan((state, update) => applyUpdate(state, update), initialState),
	startWith(initialState),
	shareReplay(1),
);
```

This is the foundation of every Redux/MVU-style architecture. Tikhon Jelvis's Game of Life example:

```typescript
// Inputs
const frame$ = animationFrame$;        // Event<number> — game ticks
const click$ = fromEvent(canvas, 'click');  // Event<MouseEvent>
const pause$ = fromEvent(btn, 'click');     // Event<void>

// Behaviors (fold events → state)
const paused$: Observable<boolean> = pause$.pipe(
	scan(paused => !paused, false),
	startWith(false),
	shareReplay(1),
);

// Stream of updates (diffs, not state)
const clickUpdates$ = click$.pipe(
	map(e => (grid: Grid) => flipCell(grid, getCell(e))),
);

const stepUpdates$ = frame$.pipe(
	withLatestFrom(paused$),
	filter(([_, paused]) => !paused),
	map(() => (grid: Grid) => evolve(grid)),
);

// Fold all updates into the running grid state
const grid$ = merge(clickUpdates$, stepUpdates$).pipe(
	scan((grid, update) => update(grid), createBlankGrid()),
	startWith(createBlankGrid()),
	shareReplay(1),
);
```

Key insight: **the state is decoupled from the set of updates**. Adding a new feature (clear button, generation counter) means adding a new update stream to the `merge` — existing code doesn't change.

## How RxJS Relates to Classic FRP

RxJS Observables are **impure, practical Events** — not classic FRP in the strict sense, but directly inspired by it:

| Concept | Classic FRP | RxJS |
|---------|------------|------|
| Event | `[(Time, A)]` — pure, denotational | `Observable<A>` — effectful, imperative subscribe |
| Behavior | `Time → A` — continuous | `BehaviorSubject<A>` — discrete approximation |
| Combinator | Pure function, no side effects | Operator — may have side effects (HTTP, DOM) |
| Time | Explicit in the type | Implicit — determined by scheduler |

Erik Meijer's `Observable = dual of Iterable` is a separate mathematical framing. The FRP framing gives a *semantic* intuition: Observables model *discrete events in time*, BehaviorSubjects model *continuously-varying values*.

## Why This Framing Matters

Understanding the Behavior/Event distinction helps choose the right RxJS primitive:

- "Does this value always exist?" → `BehaviorSubject` (Behavior semantics)
- "Does this only matter when it fires?" → `Observable` (Event semantics)
- "Should late subscribers get the current value?" → `BehaviorSubject` / `shareReplay(1)`
- "Should late subscribers only get future values?" → `Subject` / `share()`

**The fold-events-into-behavior pattern** (`scan + startWith + shareReplay(1)`) is the correct RxJS implementation of the FRP state model, and is the foundation of MVU, Redux, and NgRx-style architectures.

## Related

- [Observable](Observable.md) — Observable as lazy discrete event stream
- [combination-operators](combination-operators.md) — `withLatestFrom` = sample Behavior when Event fires
- [erik-meijer](../history/erik-meijer.md) — Mathematical dual framing (Iterator/Observable)
- [mvu](../patterns/mvu.md) — fold-events-into-behavior as application architecture
- [state-management](../patterns/state-management.md) — BehaviorSubject as Behavior; scan as fold
