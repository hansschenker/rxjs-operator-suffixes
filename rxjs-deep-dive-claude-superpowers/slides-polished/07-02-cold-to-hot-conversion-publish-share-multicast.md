---
marp: true
theme: uncover
title: "Cold-to-hot conversion: publish, share, multicast"
---

# Cold-to-hot conversion: publish, share, multicast
> Every new subscriber triggers a separate execution — HTTP requests fire twice, timers restart, expensive computations duplicate.

---

## Core Concept

- A **cold** Observable creates an independent execution per subscriber — new timer, new HTTP call, new side effect
- A **hot** Observable shares one execution; subscribing just registers an observer
- `share()` is shorthand for `publish()` + `refCount()` — one shared execution, auto-disconnects when subscriber count hits zero
- `shareReplay(1)` adds a replay buffer — late subscribers receive the last emitted value immediately
- **The precise rule:** "converting cold → hot means subscription side effects fire *once on connect*, not once per subscriber"

---

## How It Works

```
── Cold (no sharing): two subscriptions = two executions ──

source$:    --0--1--2--3--|     ← subscriber A (own timer)
source$:         --0--1--2--|   ← subscriber B (own timer, starts fresh)

── Hot via share(): one execution, shared ──

           publish() + refCount()  ←  share() wraps this

shared$:    --0--1--2--3--|     ← subscriber A
shared$:         1--2--3--|     ← subscriber B joins midstream
                 ^
                 no replay — B misses 0
```

`shareReplay(1)` replays the last value so subscriber B receives `0` immediately on subscribe.

---

## Common Mistake

```typescript
import { ajax } from 'rxjs/ajax';
import { combineLatest } from 'rxjs';

interface User { id: number; name: string; }

// ✗ Wrong: cold Observable referenced twice → TWO HTTP requests
const users$ = ajax.getJSON<User[]>('/api/users');

combineLatest([users$, users$]).subscribe(([a, b]) => {
  // Fires two separate GET /api/users — race condition risk,
  // doubled server load, results may differ if data changes between calls.
  console.log(a, b);
});
```

The same trap appears with `withLatestFrom(users$)` inside a `switchMap` — each outer emission re-subscribes to the cold `users$`.

---

## The Right Way

```typescript
import { ajax } from 'rxjs/ajax';
import { combineLatest } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

interface User { id: number; name: string; }

// ✓ Correct: convert cold → hot before sharing across the pipeline
const users$ = ajax.getJSON<User[]>('/api/users').pipe(
  shareReplay(1), // execute once; replay last value to every subscriber
);

combineLatest([users$, users$]).subscribe(([a, b]) => {
  // Single HTTP request — both arms receive the identical emission
  console.log(a, b);
});

// Late subscriber still gets the cached result immediately
setTimeout(() => users$.subscribe(console.log), 5000);
```

Use `share()` (no buffer) when late subscribers should *not* receive a replayed value — e.g. live event streams where stale data is misleading.

---

## Key Rule

> **Any cold Observable referenced more than once in a pipeline runs more than once — apply `shareReplay(1)` before the fork to execute exactly once and multicast the result to all consumers.**