---
title: "Subscription"
category: core
tags: [core, subscription, lifecycle, memory-management]
related: [Observable.md, Observer.md, Subject.md]
sources: 0
updated: 2026-04-08
---

# Subscription

> The handle returned by `subscribe()` — represents the ongoing execution of an Observable and provides a way to cancel it.

## Interface

```typescript
interface Subscription {
  unsubscribe(): void;
  closed: boolean;
  add(teardown: TeardownLogic): void;
  remove(teardown: Subscription): void;
}
```

## Basic Usage

```typescript
const sub = interval(1000).subscribe(console.log);

// Later — cancel the subscription
sub.unsubscribe();

// Check if closed
console.log(sub.closed); // true after unsubscribe
```

## Composite Subscriptions

Multiple subscriptions can be grouped and cancelled together:

```typescript
const sub = new Subscription();

sub.add(timer1$.subscribe(...));
sub.add(timer2$.subscribe(...));
sub.add(stream3$.subscribe(...));

// Cancels all three at once
sub.unsubscribe();
```

## Teardown Logic

When you create an Observable manually, you return teardown logic — a function or Subscription to clean up resources:

```typescript
const timer$ = new Observable<number>(observer => {
  let count = 0;
  const id = setInterval(() => observer.next(count++), 1000);

  // Teardown: runs on unsubscribe or complete/error
  return () => clearInterval(id);
});
```

The teardown runs when:
- `unsubscribe()` is called
- The Observable completes
- The Observable errors

## Preventing Memory Leaks

Not unsubscribing from long-lived Observables is the #1 source of memory leaks in RxJS applications.

### Strategy 1 — `takeUntil`

```typescript
const destroy$ = new Subject<void>();

interval(1000).pipe(
  takeUntil(destroy$)
).subscribe(console.log);

// On component destroy:
destroy$.next();
destroy$.complete();
```

### Strategy 2 — `take(n)`

```typescript
// Auto-completes after first value
source$.pipe(take(1)).subscribe(console.log);
```

### Strategy 3 — Manual tracking

```typescript
const subs = new Subscription();
subs.add(a$.subscribe(...));
subs.add(b$.subscribe(...));
// On cleanup:
subs.unsubscribe();
```

### Strategy 4 — `async` pipe (Angular)

The Angular `async` pipe manages subscriptions automatically. Always prefer it over manual subscribe in templates.

## Subscription vs Promise

Unlike a Promise, a Subscription can be **cancelled**. The underlying Observable's teardown logic is called, stopping any pending work (HTTP requests can be aborted if using `ajax` from RxJS).

## Related

- [Observable](Observable.md) — produces the Subscription via subscribe()
- [Observer](Observer.md) — the consumer registered in subscribe()
- [common-mistakes](../debugging/common-mistakes.md) — memory leaks from missing unsubscribe
