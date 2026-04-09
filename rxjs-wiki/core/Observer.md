---
title: "Observer"
category: core
tags: [core, observer, consumer]
related: [Observable.md, Subscription.md, Subject.md]
sources: 0
updated: 2026-04-08
---

# Observer

> The consumer of an Observable — an object with `next`, `error`, and `complete` callbacks that receives pushed values.

## Interface

```typescript
interface Observer<T> {
  next: (value: T) => void;
  error: (err: unknown) => void;
  complete: () => void;
}
```

All three methods are optional in practice (a `PartialObserver`). RxJS wraps the provided observer in a `SafeSubscriber` that fills in missing methods with no-ops.

## Usage

```typescript
const observer: Observer<number> = {
  next: value => console.log('Value:', value),
  error: err => console.error('Error:', err),
  complete: () => console.log('Completed'),
};

source$.subscribe(observer);

// Shorthand — pass just a next function
source$.subscribe(value => console.log(value));

// Partial — only some callbacks
source$.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  // complete omitted — treated as no-op
});
```

## Observer Guarantees (SafeSubscriber)

RxJS wraps your observer in a `SafeSubscriber` that enforces the Observable contract:

1. After `complete()` or `error()`, no further methods are called
2. After `unsubscribe()`, no further methods are called
3. Synchronous errors thrown in `next` are forwarded to `error`

This means you never need to guard against out-of-order calls.

## The Observer–Observable Relationship

```
Observable  ──push──►  Observer
  (source)             (consumer)

Observable.subscribe(observer) returns Subscription
```

An Observable is the producer; the Observer is the consumer. The Observable calls the Observer's methods according to the contract: `next*` then optionally `error` or `complete`.

## Subject as Observer

A [Subject](Subject) is itself an Observer — it implements `next`, `error`, and `complete`. This is what makes Subjects useful as bridges:

```typescript
const proxy$ = new Subject<number>();

// Subject as observer — receives from upstream
upstream$.subscribe(proxy$);

// Subject as observable — emits to downstream
proxy$.subscribe(console.log);
```

## Related

- [Observable](Observable.md) — the producer side
- [Subscription](Subscription.md) — returned by subscribe(), used to cancel
- [Subject](Subject.md) — is both Observable and Observer
