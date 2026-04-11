---
marp: true
theme: uncover
title: "concatMap: ordered queues, animations"
---

# concatMap: ordered queues, animations
> You need async operations to execute in strict sequence — but `mergeMap` fires them all in parallel and results arrive out of order.

---

## Core Concept
- `concatMap` projects each outer value to an inner Observable, then **waits for completion** before subscribing to the next
- Policy: **FIFO queue** — new outer values are held until the active inner finishes
- Equivalent to `mergeMap(project, 1)` — mergeMap with concurrency locked to one
- Guarantees **strict emission order**: inner `a` fully completes before inner `b` begins
- > "If an inner Observable never completes, all subsequently queued work is blocked forever."

---

## How It Works

```
// outer: queued operations (animations, migrations, uploads)
outer:     --a--b--c--|
           concatMap(v => work$(v))

// inner(a) runs; b and c queue behind it
inner(a):    ──A1──A2──|
inner(b):               ──B1──|     ← blocked until a completes
inner(c):                      ──C1──| ← blocked until b completes

// output: fully ordered, no overlap
output:    ────A1──A2────B1────C1──|
```

---

## Common Mistake

```typescript
// ❌ Using mergeMap when order matters
const animationQueue$ = from(['slide-in', 'fade', 'slide-out']);

animationQueue$.pipe(
  mergeMap(name => playAnimation$(name)),
  // mergeMap subscribes to ALL three animations immediately.
  // They run in parallel — 'fade' may finish before 'slide-in',
  // producing visual chaos. There is no queue; there is no order.
).subscribe();
```

---

## The Right Way

```typescript
import { Subject, EMPTY } from 'rxjs';
import { concatMap, catchError } from 'rxjs/operators';

const animationTrigger$ = new Subject<string>();

animationTrigger$.pipe(
  concatMap(name =>
    playAnimation$(name).pipe(        // ← each inner must complete to unblock queue
      catchError(err => {
        console.error(`Animation failed: ${name}`, err);
        return EMPTY;                 // ← skip failed step, drain remaining queue
      }),
    )
  ),
).subscribe();

// Emit in any order — concatMap guarantees sequential playback
animationTrigger$.next('slide-in');
animationTrigger$.next('fade');       // queued, not started yet
animationTrigger$.next('slide-out');  // queued behind fade
```

---

## Key Rule
> **Use `concatMap` when every inner Observable must complete before the next begins — and always ensure your inners complete, or the queue stalls forever.**