---
title: "Erik Meijer — The Mathematical Foundations of Rx"
category: history
tags: [history, erik-meijer, mathematical-foundations, dual, observable, enumerable]
related: [timeline.md, ../core/Observable.md, ../overview.md]
sources: 2
updated: 2026-04-08
---

# Erik Meijer — The Mathematical Foundations of Rx

> Erik Meijer created Reactive Extensions at Microsoft Research by discovering the mathematical dual of `IEnumerable` — a single insight that unified synchronous pull collections and asynchronous push streams under the same set of operators.

## The Raven Test — Origin of Rx

Erik describes his motivation using **Raven tests** — IQ-style puzzles where you study a grid of shapes and identify the missing one. The underlying skill is finding *commonalities between things*.

> "The reason I came up with Rx is the quest to find the commonality between things."

Looking at the programming landscape:
- **Pull collections** (arrays, lists) — unified by `IEnumerable`
- **Push collections** (events, async computations) — no unified interface

The missing piece in the grid was an interface that unified push collections the same way `IEnumerable` unified pull ones. That missing piece is `IObservable`.

## The Mathematical Dual

The core insight is a formal mathematical relationship — not just an analogy:

```
Pull (synchronous)          Push (asynchronous)
─────────────────           ─────────────────────
IEnumerable<T>       dual   IObservable<T>
IEnumerator<T>       dual   IObserver<T>
MoveNext() / Current dual   OnNext(T value)
return (completed)   dual   OnCompleted()
throw (error)        dual   OnError(Exception)
```

| IEnumerable (pull) | IObservable (push) |
|-------------------|-------------------|
| You ask for values | Values are pushed to you |
| Synchronous | Synchronous or asynchronous |
| `foreach` loop | `subscribe()` |
| `MoveNext()` returns false → done | `OnCompleted()` called → done |
| `MoveNext()` throws → error | `OnError()` called → error |

**The consequence**: any operator that works for `IEnumerable` — `Select` (map), `Where` (filter), `GroupBy`, `Aggregate` — can be mechanically derived to work for `IObservable` by applying the duality transformation. LINQ operators over observables follow from the mathematics, not from invention.

## The Philosophy: Focus on the Present

> "When you're doing stream programming you have to focus on the present — on now. There is no past, there is no future. The only thing you can hold in your hands is the current element of the stream."

This is the philosophical stance that stream programming requires:
- A stream is like a **mouse position** — it is always at one position now, it doesn't remember where it was, it doesn't know where it's going
- A stream is like a **stock price** — the current price is all you have
- Even a **baby's cry** is a stream — it fires whether you're ready or not

The `IObservable` interface enforces this by design: you can only react to the current value. No indexing, no history access (unless explicitly buffered).

## Power Through Simplicity

> "By limiting ourselves to a simpler interface, we get more power. By making less assumptions we can do much more."

Removing the ability to index into a collection (no `array[i]`) seems like a restriction. But it's exactly this restriction that:
- Enables **parallel execution** — `map` functions can run in parallel (MapReduce/Hadoop)
- Enables **distributed computing** — constant-time indexing breaks across cluster nodes
- Enables **lazy evaluation** — the stream elements only exist at the moment they're needed

The random number generator example illustrates this: there is no backing collection, just a generator. The elements only exist *now* — producing them on demand with zero memory footprint.

## The Two Kinds of Streams

Erik distinguishes:

| Kind | Metaphor | Interface | Driven by |
|------|----------|-----------|-----------|
| Pull | Pump jack — oil only flows when you pump | `IEnumerable` | Consumer |
| Push | Baby — cries whether you want it or not | `IObservable` | Producer |

Push streams fire **whether you can handle them or not**. This is why backpressure and buffering operators (`bufferTime`, `throttleTime`, `debounceTime`) exist — managing the mismatch between producer speed and consumer capacity.

## The Original Use Case: Cloud + UI

Erik built Rx to solve a specific architectural problem:

```
Client (event-driven UI)  ←──────────────────→  Cloud (async web services)
   Mouse events (push)                              HTTP responses (push)
   Keyboard events (push)                           Network timeouts (push)
        │                                                   │
        └──────────────── LINQ query ────────────────────────┘
                    (join push streams together)
```

Both sides — UI events and async network calls — are push streams. Rx gives you the same LINQ operators to compose them. A search-as-you-type feature becomes:

```typescript
// Erik's original motivating example
keystrokes$.pipe(
  debounceTime(300),      // "calm down" — don't send every keystroke
  switchMap(q => search(q).pipe(
    timeout(1000),        // cancel if server doesn't respond in 1s
    catchError(() => of([]))
  ))
);
```

This pattern — debounce, cancel-previous, timeout — is exactly the composable reusable component Erik described: *"things that you need to glue together these computations."*

## Games as Stream Transformations

In "A Playful Introduction to Rx" Erik demonstrates that a **game is just a stream transformation**:

```
Input streams:                    Output streams:
  keyboard$   ─┐                    screen updates$
  clock$      ─┤─ [Rx operators] ─► collision events$
  mouse$      ─┘                    sound effects$
```

Key operators in the game implementation:
- `scan` — physics: accumulate velocity (`v(t) = v(t-1) - gravity`)
- `combineLatest` — collision detection: recompute when either object moves
- `takeUntil` — stop trajectory stream when next jump fires
- `pairwise` — edge detection: detect collision → non-collision transitions
- `switchMap` — restart jump trajectory on each space bar press

## combineLatest — Stolen from Spreadsheets

> "This operator is exactly stolen from spreadsheets."

An Excel cell with formula `=A1+B1` recomputes whenever A1 or B1 changes. `combineLatest` is this exact behaviour for Observable streams:

```typescript
// Excel: =bugX + sunX (recomputes when either changes)
combineLatest([bug$, sun$]).pipe(
  map(([bug, sun]) => isColliding(bug, sun))
);
```

Erik used this to implement collision detection in the bug game: whenever either the bug's position or the sun's position changes, check for collision.

## Observable Collections vs Observable Streams

Erik draws an important distinction often missed:

| | Observable Collections | Observable Streams (Rx) |
|--|----------------------|------------------------|
| What | A mutable list that fires change events | A sequence of values pushed over time |
| Examples | `ObservableList<T>` in .NET/JavaFX | `IObservable<T>` |
| Role | The **model** — data you mutate | The **processing** — reactions to changes |
| Relationship | Source of events → Rx | Rx results → mutations |

The cycle:
```
ObservableCollection (model)
    → change events as Observable stream
    → Rx operators transform
    → result dispatched as mutation back to model
```

This is the foundation of **ReactiveUI** (.NET) and the **MVU** pattern.

## Key Quotes

> "Once you see it, it looks obvious — but just to find the right one is not easy."
— on the IEnumerable/IObservable duality

> "We are just plumbers — only we plumb with code instead of pipes."
— on reactive programming composition

> "My six-year-old son is able to write games like this using Rx."
— on the simplicity that emerges from the right abstraction

## Sources

- `sources/talks/rx-explained-by-erik-meijer.txt` — 15-minute Channel 9 overview
- `sources/talks/playful-introduction-rx-erik-meijer.txt` — Full conference talk with game demos

## Related

- [timeline](timeline.md) — where Meijer's work fits in RxJS history
- [Observable](../core/Observable.md) — the IObservable interface he defined
- [overview](../overview.md) — high-level synthesis incorporating his insights
- [mvu](../patterns/mvu.md) — the MVU pattern implements his model/stream cycle
