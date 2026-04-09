---
title: "Subject"
category: core
tags: [core, subject, multicast, hot, bridge]
related: [Observable.md, Observer.md, BehaviorSubject.md, ReplaySubject.md, AsyncSubject.md]
sources: 0
updated: 2026-04-08
---

# Subject

> A special Observable that is also an Observer — it multicasts to all its subscribers and allows imperative value injection from outside.

## What Makes Subject Special

A regular Observable creates a new execution per subscriber (cold). A Subject maintains a **list of observers** and forwards each value to all of them — it's an event emitter with the Observable interface.

```
Source ──► Subject ──► Observer 1
                  └──► Observer 2
                  └──► Observer 3
```

Subject is simultaneously:
- An **Observable** (you can subscribe to it)
- An **Observer** (you can call `next`, `error`, `complete` on it)

## Basic Usage

```typescript
import { Subject } from 'rxjs';

const subject$ = new Subject<number>();

// Subscribe (as Observable)
subject$.subscribe(v => console.log('A:', v));
subject$.subscribe(v => console.log('B:', v));

// Emit (as Observer)
subject$.next(1); // A: 1, B: 1
subject$.next(2); // A: 2, B: 2
subject$.complete();
```

## Late Subscribers Miss Past Values

This is the critical pitfall of plain `Subject`:

```typescript
const subject$ = new Subject<number>();
subject$.next(1); // emitted to no-one
subject$.next(2); // emitted to no-one

subject$.subscribe(v => console.log(v)); // subscribes AFTER emissions
subject$.next(3); // subscriber sees: 3
// Missed: 1 and 2
```

For late subscriber replay → use [BehaviorSubject](BehaviorSubject) or [ReplaySubject](ReplaySubject).

## As a Bridge (Cold → Hot)

A Subject converts a cold Observable to hot:

```typescript
const cold$ = interval(1000);
const subject$ = new Subject<number>();

cold$.subscribe(subject$); // pipe cold into subject

// Both subscribers share the same interval
subject$.subscribe(v => console.log('A', v));
subject$.subscribe(v => console.log('B', v));
```

## As an Action Bus

The canonical use in MVU/effects architectures:

```typescript
const action$ = new Subject<Action>();

// Dispatch
action$.next({ type: 'LOAD_DATA' });

// Effects listen
action$.pipe(
  ofType('LOAD_DATA'),
  switchMap(() => fetchData())
).subscribe(data => action$.next({ type: 'LOAD_SUCCESS', payload: data }));
```

## Variants

| Type | Replays | Initial value | Use case |
|------|---------|---------------|----------|
| `Subject` | None | None | Event bus, action dispatcher |
| [BehaviorSubject](BehaviorSubject) | Last 1 | Required | State holder |
| [ReplaySubject](ReplaySubject) | Last N | Optional | Cache, late-join streams |
| [AsyncSubject](AsyncSubject) | Last 1 on complete | None | Promise-like, last value |

## Pitfalls

### Error propagates to all subscribers

```typescript
const s$ = new Subject<number>();
s$.subscribe({ error: e => console.log('A error') });
s$.subscribe({ error: e => console.log('B error') });

s$.error(new Error('boom')); // Both subscribers error
// Subject is now "zombie" — any further subscribe() immediately errors
```

### Subject after complete is inert

After `complete()` or `error()`, new subscribers immediately receive `complete`/`error` and no future values can be emitted.

## Related

- [Observable](Observable.md) — Subject extends Observable
- [Observer](Observer.md) — Subject implements Observer
- [BehaviorSubject](BehaviorSubject.md) — Subject with current value
- [ReplaySubject](ReplaySubject.md) — Subject with replay buffer
- [AsyncSubject](AsyncSubject.md) — Subject that emits only on complete
