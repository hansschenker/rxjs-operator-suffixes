---
title: "AsyncSubject"
category: core
tags: [core, subject, async, last-value, promise-like]
related: [Subject.md, BehaviorSubject.md, ReplaySubject.md]
sources: 0
updated: 2026-04-08
---

# AsyncSubject

> A Subject that only emits the **last value** when `complete()` is called — the Promise analog among Subjects.

## Behaviour

```typescript
import { AsyncSubject } from 'rxjs';

const async$ = new AsyncSubject<number>();

async$.subscribe(v => console.log('A:', v));

async$.next(1); // buffered, not emitted
async$.next(2); // buffered, not emitted
async$.next(3); // buffered, not emitted

// No output until complete()
async$.complete();
// A: 3  ← only the last value, on complete

// Late subscriber also gets the last value
async$.subscribe(v => console.log('B:', v)); // B: 3 (immediate)
```

If `error()` is called instead of `complete()`, the error propagates and no value is emitted.

## Comparison with Other Subjects

| | Subject | BehaviorSubject | ReplaySubject | AsyncSubject |
|--|---------|-----------------|---------------|--------------|
| Emits to late sub | Nothing | Current value | Last N values | Last on complete |
| Timing of emission | Immediately | Immediately | Immediately | On complete |
| Analogy | EventEmitter | State variable | Replay buffer | Promise |

## When to Use

AsyncSubject is rarely needed in practice. Use it when:
- You want exactly Promise-like semantics (single value, on completion)
- Converting a multi-value Observable to "just give me the final result"

A simpler alternative is often:

```typescript
// Last value of a stream
source$.pipe(last()).subscribe(console.log);

// Or convert directly to Promise
const result = await lastValueFrom(source$);
```

## Converting Observable to Promise

RxJS 7+ provides helpers that internally use AsyncSubject semantics:

```typescript
import { lastValueFrom, firstValueFrom } from 'rxjs';

// Resolves with the last emitted value when the Observable completes
const last = await lastValueFrom(source$);

// Resolves with the first emitted value (then auto-unsubscribes)
const first = await firstValueFrom(source$);
```

These are the recommended way to bridge to async/await in RxJS 7+. Avoid `toPromise()` (deprecated).

## Related

- [Subject](Subject.md) — base class
- [BehaviorSubject](BehaviorSubject.md) — emits current value, requires initial
- [ReplaySubject](ReplaySubject.md) — replays N past values
