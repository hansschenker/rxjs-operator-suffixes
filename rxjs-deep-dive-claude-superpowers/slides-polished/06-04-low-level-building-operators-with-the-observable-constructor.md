---
marp: true
theme: uncover
title: "Low-level: building operators with the Observable constructor"
---

# Low-level: building operators with the Observable constructor
> When `pipe()` composition can't control the subscription lifecycle, you need `new Observable` — but most developers forget the teardown and ship a silent leak.

---

## Core Concept
- A custom operator is just a function: `(source: Observable<T>) => Observable<R>`
- `new Observable(subscriber => ...)` gives you **raw control** over the subscription lifecycle
- You must **explicitly forward** `next`, `error`, and `complete` — nothing propagates automatically
- You must **return a teardown function** — this is your cleanup contract with the consumer
- Use this pattern only when `pipe()` falls short: altered completion semantics, buffering, or inner subscriptions
> **"The subscriber callback must return a teardown — that return value is what makes unsubscription work."**

---

## How It Works

```typescript
// Input:  source$  ──1──2──3──|
// Output: result$  ──2──4──6──|   (each value × n)

import { Observable } from 'rxjs';
import type { OperatorFunction } from 'rxjs';

function multiplyBy(n: number): OperatorFunction<number, number> {
  //        ┌── receives upstream Observable
  return (source: Observable<number>) =>
    new Observable<number>(subscriber => {
      //                   ↑ subscriber = the downstream consumer
      const sub = source.subscribe({
        next:     value => subscriber.next(value * n), // transform → forward
        error:    err   => subscriber.error(err),      // forward unchanged
        complete: ()    => subscriber.complete(),      // forward unchanged
      });
      return () => sub.unsubscribe(); // ← teardown: stops source on cancel
    });
}
```

---

## Common Mistake

```typescript
// ✗ WRONG — omitting the teardown return value
function multiplyByTwo(): OperatorFunction<number, number> {
  return (source: Observable<number>) =>
    new Observable<number>(subscriber => {
      source.subscribe({
        next:     value => subscriber.next(value * 2),
        error:    err   => subscriber.error(err),
        complete: ()    => subscriber.complete(),
      });
      // No return statement.
      // TypeScript does NOT warn — void is a valid subscriber callback return.
      // But now unsubscribing from the result$ does nothing to source$.
      // takeUntil, take(1), async pipe on destroy — all leak the inner sub.
    });
}
```

---

## The Right Way

```typescript
import { Observable, of } from 'rxjs';
import type { OperatorFunction } from 'rxjs';

function multiplyByTwo(): OperatorFunction<number, number> {
  return (source: Observable<number>) =>
    new Observable<number>(subscriber => {

      const sub = source.subscribe({          // 1. subscribe to source
        next:     v   => subscriber.next(v * 2), // 2. transform and forward
        error:    err => subscriber.error(err),  // 3. always forward errors
        complete: ()  => subscriber.complete(),  // 4. always forward complete
      });

      return () => sub.unsubscribe();         // 5. teardown — non-negotiable
    });
}

// Slots into pipe() identically to any built-in operator
of(1, 2, 3).pipe(
  multiplyByTwo(),
).subscribe(console.log); // 2, 4, 6
```

---

## Key Rule
> **When you build an operator with `new Observable`, the absence of a `return () => sub.unsubscribe()` is a silent memory leak — TypeScript won't catch it, the tests won't catch it, production will.**