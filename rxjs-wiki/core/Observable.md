---
title: "Observable"
category: core
tags: [core, observable, push, lazy, dual, enumerable]
related: [Observer.md, Subscription.md, Subject.md, Scheduler.md, ../history/erik-meijer.md]
sources: 2
updated: 2026-04-08
---

# Observable

> The fundamental building block of RxJS — a lazy push-based collection that can emit zero or more values synchronously or asynchronously.

## Overview

An `Observable<T>` represents a stream of values of type `T`. Unlike a Promise, it:
- Is **lazy**: nothing happens until you `subscribe()`
- Can emit **multiple values** over time
- Can be **cancelled** by unsubscribing
- Can be **synchronous** (e.g. `of(1, 2, 3)`)

## The Mathematical Dual

Observable is not just a pattern — it is the **mathematical dual of `Iterable`**. This is Erik Meijer's core insight from Rx.NET, the foundation RxJS is built on.

```
IEnumerable<T>  (pull)      dual      IObservable<T>  (push)
IEnumerator<T>  (pull)      dual      IObserver<T>    (push)
MoveNext()                  dual      OnNext(value)
return (done)               dual      OnCompleted()
throw (error)               dual      OnError(err)
```

Any LINQ/array operator — `map`, `filter`, `reduce`, `groupBy` — can be mechanically derived to work on `Observable` by applying the duality transformation. The 100+ RxJS operators follow from the mathematics.

> "Focus on the present — on now. There is no past, there is no future. The only thing you can hold in your hands is the current element of the stream." — Erik Meijer

## Formal Model — Timed Sequence of Pairs

An Observable can be described precisely as:

> A lazy, potentially infinite sequence of pairs `[(T, a), (T, a), ...]`
> where `T` is the time at which a notification arrives and `a` is the notification value.

```typescript
// Conceptual type (not actual RxJS)
type Stream<A> = [(time: number, value: A), ...]
```

This formulation makes three things explicit:
1. **Time** is part of the data model — values have timestamps, not just order
2. **Potentially infinite** — streams have no predefined end (unlike arrays)
3. **Lazy** — the sequence does not exist until subscribed to; only then does time start flowing

For full protocol reasoning (including error/complete): `[(T, Notification<A>), ...]`

See [observable-internals](observable-internals.md) for Ben Lesh's complementary definition: "Observable = function(observer) => teardown".

## Contract

An Observable must follow the **Observable contract**:
1. It may call `next` zero or more times
2. After calling `error` or `complete`, it must not call any further methods
3. After `unsubscribe`, it must not call any methods

```
next* (error | complete)?
```

## Creation

```typescript
import { Observable, of, from, fromEvent, interval, timer, EMPTY, NEVER } from 'rxjs';

// Manual creation — the subscribe function
const manual$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.complete();
  // Return teardown logic
  return () => console.log('torn down');
});

// Factory creators
of(1, 2, 3)                    // synchronous values
from([1, 2, 3])                // iterable / Promise / Observable
from(fetch('/api'))            // Promise → Observable (single value)
fromEvent(btn, 'click')        // DOM events (HOT)
interval(1000)                 // 0,1,2... every 1s
timer(2000, 1000)              // wait 2s, then 0,1,2... every 1s
EMPTY                          // completes immediately
NEVER                          // never emits or completes
```

## Subscribing

```typescript
// Full observer
const sub = source$.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log('done'),
});

// Shorthand (next only)
source$.subscribe(value => console.log(value));

// Unsubscribe to prevent leaks
sub.unsubscribe();
```

## pipe() — Operator Composition

Operators are applied via `pipe()`. Each operator is a pure function `Observable<T> → Observable<R>`.

```typescript
source$.pipe(
  filter(x => x > 0),
  map(x => x * 2),
  take(5)
).subscribe(console.log);
```

`pipe()` composes left-to-right. The result is a new Observable — the source is not mutated.

## Cold vs Hot

| | Cold | Hot |
|--|------|-----|
| Source starts | On subscribe | Independent of subscribers |
| Multiple subscribers | Each gets own execution | Share the same execution |
| Examples | `of`, `from`, `interval` | `fromEvent`, `Subject`, `share`d streams |

```typescript
// Cold — each subscriber gets 0,1,2,...
const cold$ = interval(1000);

// Hot — all subscribers see the same click events
const hot$ = fromEvent(document, 'click');

// Convert cold → hot with share()
const shared$ = cold$.pipe(share());
```

## Marble Diagram Notation

```
-  = time passing (10ms frame)
a  = value emitted ('a')
|  = complete
#  = error
^  = subscription point
!  = unsubscription point
```

```
source:  -a--b--c--|
         ^ subscribe
result:  -A--B--C--|   (after map(toUpperCase))
```

## Internals

An Observable is essentially a function wrapped in an object:

```typescript
class Observable<T> {
  constructor(private subscribeFn: (observer: Observer<T>) => TeardownLogic) {}

  subscribe(observer: Observer<T>): Subscription {
    const teardown = this.subscribeFn(observer);
    return new Subscription(teardown);
  }
}
```

Every call to `subscribe()` runs `subscribeFn` fresh — that's what makes it cold.

## Related

- [Observer](Observer.md) — the consumer side of Observable
- [Subscription](Subscription.md) — the handle returned by subscribe()
- [Subject](Subject.md) — Observable that is also an Observer (hot, multicast)
- [Scheduler](Scheduler.md) — controls execution timing
- [state-management](../patterns/state-management.md) — Observable-based state patterns
