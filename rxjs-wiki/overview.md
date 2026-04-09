---
title: "RxJS Overview"
category: overview
tags: [rxjs, reactive, overview, synthesis]
related: [core/Observable.md, patterns/index.md, architectures/index.md]
sources: 0
updated: 2026-04-08
---

# RxJS Overview

> RxJS is a library for composing asynchronous and event-based programs using observable sequences — it brings the Observer pattern, the Iterator pattern, and functional programming with collections together.

## Origin — The Missing Piece

Erik Meijer created Rx at Microsoft Research using **Raven tests** as his metaphor: given a grid of patterns, find the missing one. The missing piece in the programming landscape was a unified interface for *push* collections, the same way `IEnumerable` unified *pull* collections.

```
Pull (sync):   IEnumerable ──► arrays, lists, LINQ queries
Push (async):  IObservable ──► events, HTTP responses, WebSockets   ← the missing piece
                    ↑
             same LINQ operators work on both
```

The result: any operator that works for arrays works for event streams. `map`, `filter`, `reduce`, `combineLatest` — all derived from the mathematics of the dual. See [erik-meijer](history/erik-meijer.md).

## What RxJS Is

RxJS (Reactive Extensions for JavaScript) models any data source — a click, an HTTP response, a WebSocket message, a timer — as an **Observable**: a lazy push-based collection that can emit zero or more values over time and then complete or error.

The power is in the **operators**: pure functions that take an Observable and return a new Observable. You compose them with `pipe()` to build a declarative data pipeline. No callbacks, no nested Promises, no imperative state machines.

```typescript
fromEvent(searchInput, 'input').pipe(
  map(e => (e.target as HTMLInputElement).value),
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => fetchResults(query)),
  catchError(() => of([]))
).subscribe(results => render(results));
```

## Core Mental Model

```
Source ──[operators]──[operators]──[operators]──► Subscriber
         (transform)  (filter)     (combine)
```

- **Cold Observable**: the source starts when you subscribe. Each subscriber gets its own execution. HTTP requests, timers.
- **Hot Observable**: the source exists independently. Subscribers join an ongoing stream. DOM events, WebSockets.
- **Subject**: both an Observable and an Observer — a bridge, a multicast point.

## The Four Pillars

| Concept | Role |
|---------|------|
| [Observable](core/Observable.md) | The push-based data source |
| [Observer](core/Observer.md) | The consumer — `next`, `error`, `complete` |
| [Subscription](core/Subscription.md) | The handle to a running Observable |
| [Scheduler](core/Scheduler.md) | Controls when work happens (sync, async, animationFrame) |

## Operator Families

| Family | Purpose | Key operators |
|--------|---------|---------------|
| Creation | Build Observables | `of`, `from`, `fromEvent`, `interval`, `timer`, `ajax` |
| Transformation | Reshape values | `map`, `switchMap`, `mergeMap`, `concatMap`, `scan`, `reduce` |
| Filtering | Select values | `filter`, `take`, `skip`, `debounceTime`, `throttleTime`, `distinctUntilChanged` |
| Combination | Merge streams | `combineLatest`, `merge`, `zip`, `withLatestFrom`, `forkJoin` |
| Error Handling | Recover | `catchError`, `retry`, `retryWhen` |
| Multicasting | Share | `share`, `shareReplay`, `publish`, `multicast` |
| Utility | Side effects, timing | `tap`, `delay`, `timeout`, `finalize` |

## Why RxJS vs Promises

| | Promise | Observable |
|--|---------|------------|
| Values | One | Zero or many |
| Lazy | No (eager) | Yes |
| Cancellable | No | Yes (unsubscribe) |
| Composable | `.then()` chains | `pipe()` + 100+ operators |
| Sync possible | No | Yes (`of(1, 2, 3)`) |
| Multicasting | Native | Explicit (`share`) |

## Architectural Role

RxJS is most powerful as the backbone of application state. The canonical pattern:

```typescript
// Actions flow in
const action$ = new Subject<Action>();

// State flows out via scan (like Redux reducer)
const state$ = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);

// Side effects are managed separately (Effects pattern)
// Action In → async work → Action Out
```

See [mvu](patterns/mvu.md), [effects](patterns/effects.md), [mvu](architectures/mvu.md).

## Version History Summary

- **RxJS 4** (2014): Original JS port of Rx.NET
- **RxJS 5** (2016): Full rewrite, pipeable operators via chaining, Angular adoption
- **RxJS 6** (2018): `pipe()` composition, tree-shaking, `lettable` operators removed
- **RxJS 7** (2021): TypeScript rewrite, smaller bundle, improved type safety
- **RxJS 8** (planned): Further tree-shaking, signal integration

Full details: [timeline](history/timeline.md)

## Key Pitfalls

1. **Not unsubscribing** → memory leaks. Use `takeUntil(destroy$)` or `take(1)`.
2. **Nested subscribes** → callback hell reimagined. Flatten with `switchMap` / `mergeMap`.
3. **Side effects in `map`** → use `tap` instead.
4. **`shareReplay` without `refCount`** → source never completes in older RxJS.
5. **Cold vs hot confusion** → `fromEvent` is hot; `interval` inside a function is cold.

See [common-mistakes](debugging/common-mistakes.md).
