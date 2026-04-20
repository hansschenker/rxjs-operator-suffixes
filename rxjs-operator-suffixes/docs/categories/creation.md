---
title: "Creation"
---

> Not sure which to use? [Decision tree →](../decisions/creation)

Operators that **produce** an Observable from scratch — no upstream source Observable required. The base name describes the origin or shape of the values.

## from

**Base:** Adapt an **existing async or iterable structure** into an Observable. The universal adapter for things that are not Observables yet — Promises, arrays, iterables, async iterables.

### [fromEvent](../operators/fromEvent)(target, eventName, options?)
Wraps a DOM or Node.js event listener. Subscribing adds the listener; unsubscribing removes it. Cold per-subscriber — each subscription gets its own listener.

### [fromEventPattern](../operators/fromEventPattern)(addHandler, removeHandler, resultSelector?)
Like `fromEvent` but works with arbitrary add/remove handler APIs — custom event emitters, WebSocket handlers, legacy libraries with non-standard listener interfaces.

### [fromFetch](../operators/fromFetch)(input, init?)
Wraps the Fetch API — each subscription fires one `fetch()` call. Supports `AbortController` cancellation on unsubscribe, preventing in-flight requests from resolving after navigation.

---

## of

**Base:** Emit a **fixed list of values** synchronously, then complete. The simplest creation operator — no timing, no async, just emit and finish.

### [of](../operators/of)(...values)
No suffix variants. `of(1, 2, 3)` emits `1`, `2`, `3` synchronously. Commonly used in effects to return a synchronous action: `of(loadSuccess(data))`.

---

## range

**Base:** Emit a **consecutive sequence of integers** synchronously, then complete. A typed replacement for a `for` loop.

### [range](../operators/range)(start, count?, scheduler?)
Emits integers from `start` up to `start + count - 1`. With a scheduler, each emission is dispatched separately — useful for spreading a batch of synthetic values across microtasks.

---

## interval

**Base:** Emit an **incrementing integer** on a repeating time interval, indefinitely. Never completes on its own.

### [interval](../operators/interval)(period, scheduler?)
Emits `0, 1, 2, …` every `period` ms. Requires `take`, `takeUntil`, or another termination operator. Prefer `timer(0, period)` when the first emission should be immediate.

---

## defer

**Base:** Delay Observable **creation** until subscription time — the factory function is called fresh for each subscriber, ensuring cold behaviour even when the Observable captures mutable state.

### [defer](../operators/defer)(observableFactory)
No variants. The factory `() => Observable<T>` is called on every `subscribe()`. Essential when the Observable wraps a Promise created on demand (`defer(() => from(fetch(...)))`), ensuring the request is not fired at construction time.

---

## generate

**Base:** Create an Observable from a **synchronous iteration** — the RxJS equivalent of a `for` loop, emitting the result of each iteration.

### [generate](../operators/generate)(initialState, condition, iterate, resultSelector?, scheduler?)
Starts with `initialState`; emits `resultSelector(state)` while `condition(state)` is true; advances with `iterate(state)`. Rarely needed in application code — useful for producing numeric or geometric sequences without side effects.

---
