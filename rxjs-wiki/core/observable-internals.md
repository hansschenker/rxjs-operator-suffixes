---
title: "Observable Internals — Building One from Scratch"
category: core
tags: [core, observable, internals, implementation, subscriber, observer, teardown, iterator, patterns]
related: [Observable.md, Observer.md, Subscription.md, operators.md, custom-operators.md]
sources: 3
updated: 2026-04-08
---

# Observable Internals — Building One from Scratch

> An Observable is a function that takes an Observer and returns a teardown function. That is the complete definition. Everything else is ergonomics built on top.

## The Minimal Definition

Ben Lesh (RxJS core maintainer at Google/Netflix) distils Observables to their essence:

```
Observable = function(observer) => teardown
```

Where:
- **observer** — an object with `next`, `error`, and `complete` methods
- **teardown** — a function (or Subscription) that cleans up the connection when unsubscribed

```typescript
// The raw shape of an Observable
type SubscribeFn<T> = (observer: Observer<T>) => TeardownLogic;
type TeardownLogic = () => void;

interface Observer<T> {
	next: (value: T) => void;
	error: (err: unknown) => void;
	complete: () => void;
}
```

The purpose of an Observable is to **connect an Observer to a Producer** and return a means to tear down that connection.

## Building an Observable from Scratch

```typescript
class Observable<T> {
	constructor(private subscribeFn: SubscribeFn<T>) {}

	subscribe(observer: Observer<T>): () => void {
		const safeObserver = new SafeObserver(observer);
		const teardown = this.subscribeFn(safeObserver);
		return () => {
			teardown?.();
			safeObserver.unsubscribe();
		};
	}
}
```

An instance is just a wrapped function. Calling `subscribe()` runs the function and wires the observer to whatever producer is inside.

## SafeObserver — The Guarantees

A raw observer passed by the developer may be incomplete (missing `error` or `complete`). The RxJS runtime wraps it in a `SafeObserver` that enforces these guarantees:

1. **Optional methods** — `error` and `complete` are not required on the passed observer
2. **No emissions after terminal** — once `complete()` or `error()` is called, `next()` becomes a no-op
3. **Auto-teardown on terminal** — `complete()` or `error()` automatically trigger unsubscription
4. **Exception safety** — if a `next` handler throws, the observer is unsubscribed (no resource leaks)

```typescript
class SafeObserver<T> {
	private _closed = false;

	constructor(private destination: Partial<Observer<T>>) {}

	next(value: T): void {
		if (!this._closed) {
			this.destination.next?.(value);
		}
	}

	error(err: unknown): void {
		if (!this._closed) {
			this._closed = true;
			this.destination.error?.(err);
		}
	}

	complete(): void {
		if (!this._closed) {
			this._closed = true;
			this.destination.complete?.();
		}
	}

	unsubscribe(): void {
		this._closed = true;
	}
}
```

This is why `subscriber.next()` after `subscriber.complete()` silently does nothing in RxJS — the SafeObserver/SafeSubscriber acts as a gate.

## Building an Operator from Scratch

An operator is a function that takes a source Observable and returns a new Observable:

```typescript
// The map operator — from first principles
function map<T, R>(project: (value: T) => R): (source: Observable<T>) => Observable<R> {
	return (source: Observable<T>) =>
		new Observable<R>(subscriber => {
			const sub = source.subscribe({
				next: value => subscriber.next(project(value)),
				error: err => subscriber.error(err),
				complete: () => subscriber.complete(),
			});
			return () => sub();
		});
}
```

Every built-in RxJS operator follows this shape:
1. Takes the source Observable as input
2. Returns a new Observable
3. Inside: subscribes to source, transforms/routes values, wires teardown

This is why operator chains in RxJS are **lazy** — nothing happens until `subscribe()` is called on the outermost Observable. The chain is just a composition of functions.

## The Operator Chain as Linked Observers

When you write:

```typescript
source$.pipe(
	map(x => x * 2),
	filter(x => x > 5),
).subscribe(console.log);
```

What actually executes is:

```
subscribe(console.log)
  → filter subscribes to map's Observable
    → map subscribes to source$
      → source$ starts emitting
        → values flow outward through the chain
```

The chain builds from **outside in** at subscription time, then values flow **inside out** at emission time.

## Two Patterns Combined

RxJS unifies two classical patterns:

### Iterator Pattern (pull — synchronous)

```typescript
const iter = [1, 2, 3][Symbol.iterator]();
iter.next(); // { value: 1, done: false }
iter.next(); // { value: 2, done: false }
```

Consumer controls timing. Producer is passive.

### Observer Pattern (push — asynchronous)

```typescript
subject.subscribe({
	next: v => console.log(v),
});
subject.notify(1);
```

Producer controls timing. Consumer is passive.

### RxJS — Push + Sequence + Teardown

Observable combines both:
- **Push** (producer controls timing) from Observer pattern
- **Sequence** (next/error/complete protocol) from Iterator pattern
- **Teardown** — uniquely necessary because push sources can be infinite

```
                  Iterator      Observable
Data flow         Pull          Push
Producer active   On demand     Continuously
Sequence protocol next/done     next/error/complete
Cancellable       No            Yes (teardown)
```

## Observable vs Promise

Observables are **not** like Promises — they are more different than similar:

| | Promise | Observable |
|--|---------|-----------|
| Values | 1 | 0…∞ |
| Lazy | No (eager) | Yes |
| Cancellable | No | Yes |
| Multicast | Always | Sometimes (cold = unicast by default) |
| Sync possible | No (always async) | Yes (synchronous emissions possible) |

The key insight: **a Promise is a box, an Observable is a function**. Calling `subscribe()` runs the function fresh — calling `.then()` on a Promise reads from a shared resolved value.

## Related

- [Observable](Observable.md) — Observable concepts (cold vs hot; pipe; marble notation)
- [Observer](Observer.md) — the consumer interface (next/error/complete)
- [Subscription](Subscription.md) — the Subscription object (teardown, unsubscription)
- [operators](operators.md) — how operators transform Observables
- [custom-operators](custom-operators.md) — building operators with the pipe() factory pattern
