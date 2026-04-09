---
title: "Scheduler"
category: core
tags: [core, scheduler, concurrency, timing, virtual-time]
related: [Observable.md, ../testing/TestScheduler.md]
sources: 1
updated: 2026-04-08
---

# Scheduler

> Controls *when* work is executed in RxJS — the execution context for Observable emissions.

## What a Scheduler Does

A Scheduler answers: "When should the next `next()` call happen?" It decouples *what* to do from *when* to do it. All built-in creation operators and many utility operators accept an optional `scheduler` parameter.

## Built-in Schedulers

| Scheduler | Mechanism | When work runs |
|-----------|-----------|----------------|
| `asyncScheduler` | `setTimeout` / `setInterval` | Async, after current sync code |
| `asapScheduler` | Microtask (Promise.resolve) | After current task, before next macrotask |
| `animationFrameScheduler` | `requestAnimationFrame` | Before next browser paint |
| `queueScheduler` | Synchronous queue | Synchronously, in order |
| `VirtualTimeScheduler` | Simulated time | Testing — advance time manually |

## Usage

```typescript
import { of, asyncScheduler, animationFrameScheduler } from 'rxjs';
import { observeOn, subscribeOn } from 'rxjs/operators';

// Make emissions async
of(1, 2, 3).pipe(
  observeOn(asyncScheduler)
).subscribe(console.log);
// Console shows nothing until current call stack clears

// Schedule DOM updates on animation frames
state$.pipe(
  observeOn(animationFrameScheduler)
).subscribe(updateDOM);
```

## `observeOn` vs `subscribeOn`

| | `observeOn` | `subscribeOn` |
|--|-------------|---------------|
| Affects | `next` / `error` / `complete` calls | When `subscribe()` itself runs |
| Use case | Deliver values on specific scheduler | Start subscription on specific scheduler |

```typescript
// Deliver values on animationFrame (batches with browser paint)
source$.pipe(observeOn(animationFrameScheduler)).subscribe(render);

// Start the subscription asynchronously
source$.pipe(subscribeOn(asyncScheduler)).subscribe(...);
```

## Scheduler in Creation Operators

Many creators accept a scheduler:

```typescript
import { interval, timer, of, asyncScheduler } from 'rxjs';

interval(1000, asyncScheduler)   // default
interval(1000, animationFrameScheduler)  // sync with rAF

of(1, 2, 3, asyncScheduler)  // emit asynchronously
```

## TestScheduler (Virtual Time)

The `TestScheduler` replaces real time with virtual time for deterministic testing. See [TestScheduler](../testing/TestScheduler.md) for full details.

```typescript
const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

testScheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('-a--b--|');
  expectObservable(source$.pipe(delay(20))).toBe('---a--b--|');
});
```

## `queueScheduler` — Recursive Safety

When an operator needs to recurse (like `expand`), using `queueScheduler` prevents stack overflows by queuing recursive calls:

```typescript
// expand with queueScheduler to avoid stack overflow on deep recursion
source$.pipe(
  expand(v => v > 0 ? of(v - 1).pipe(observeOn(queueScheduler)) : EMPTY)
).subscribe(console.log);
```

## `asapScheduler` — Microtask Queue

Runs after the current synchronous code but before the next macrotask (setTimeout). Useful when you need to batch changes that happen in the same tick but still go async:

```typescript
// Group DOM updates that happen in the same sync call
changes$.pipe(
  observeOn(asapScheduler),
  bufferWhen(() => asap$)
).subscribe(batchRender);
```

## Zalgo — The Synchronous-Sometimes Anti-pattern

**Zalgo** is an async API that sometimes fires synchronously and sometimes asynchronously depending on internal state. This unpredictability makes reasoning about order of operations extremely difficult.

```typescript
// Bad: Zalgo — behaves differently depending on cache state
function getUser(id: string): Observable<User> {
  if (cache.has(id)) {
    return of(cache.get(id)!);   // emits synchronously
  }
  return http.get<User>(`/users/${id}`);  // emits asynchronously
}

// After subscribe, is the callback guaranteed to run later? No — depends on cache hit.
getUser('123').subscribe(user => {
  // Sometimes runs before the next line, sometimes after
});
doSomethingElse(); // ordering is non-deterministic
```

**Fix: `asapScheduler` normalises emission to always be async (microtask queue):**

```typescript
import { of, asapScheduler } from 'rxjs';
import { observeOn } from 'rxjs/operators';

function getUser(id: string): Observable<User> {
  if (cache.has(id)) {
    return of(cache.get(id)!).pipe(
      observeOn(asapScheduler),  // always async — no more Zalgo
    );
  }
  return http.get<User>(`/users/${id}`);
}
```

`asapScheduler` schedules work on the microtask queue (like `Promise.resolve()`), so the callback always runs after the current synchronous code completes — consistent behaviour regardless of cache state.

**Rule of thumb:** Any function returning an Observable should always be async (or always be sync). Use `observeOn(asapScheduler)` on the synchronous path to achieve this.

## Related

- [Observable](Observable.md) — Scheduler controls when Observable executes
- [TestScheduler](../testing/TestScheduler.md) — Virtual time for deterministic tests
- [execution-phases](execution-phases.md) — Plan phase vs Execution phase; schedulers as the bridge between them
