---
title: "Subjects — Complete Guide"
category: core
tags: [core, subject, BehaviorSubject, ReplaySubject, AsyncSubject, multicast, guide]
related: [Subject.md, BehaviorSubject.md, ReplaySubject.md, AsyncSubject.md, Observable.md, Observer.md]
sources: 2
updated: 2026-04-08
---

# Subjects — Complete Guide

> A Subject is simultaneously an Observable and an Observer — the bridge between the imperative and reactive worlds, and the backbone of every RxJS architecture.

## The Dual Nature

A regular cold Observable creates a private execution per subscriber — the producer is fully encapsulated. A Subject breaks that encapsulation: you control the producer from outside.

```
Normal Observable:   producer controls everything internally
Subject:             you push values in from outside

subject$.next(value)     ← push as Observer
subject$.subscribe(...)  ← consume as Observable
```

A Subject maintains an **internal list of observers** and forwards every `next` call to all of them simultaneously — this is **multicasting**.

```typescript
import { Subject } from 'rxjs';

const subject$ = new Subject<number>();

subject$.subscribe(v => console.log('A:', v));
subject$.subscribe(v => console.log('B:', v));

subject$.next(1); // → A: 1, B: 1
subject$.next(2); // → A: 2, B: 2
```

## Three Roles Subject Plays

### 1. Event Bus / Action Dispatcher

The canonical role in [MVU](../patterns/mvu.md) and [Effects](../patterns/effects.md) architectures:

```typescript
const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

// Effects listen
action$.pipe(
  ofType('LOAD'),
  switchMap(() => fetchData().pipe(
    map(data => ({ type: 'LOAD_SUCCESS' as const, payload: data })),
    catchError(err => of({ type: 'LOAD_FAILED' as const, payload: err.message }))
  ))
).subscribe(dispatch);

// Trigger from anywhere
dispatch({ type: 'LOAD' });
```

### 2. Cold → Hot Bridge

Share a single cold Observable execution across many subscribers:

```typescript
const cold$ = interval(1000);
const subject$ = new Subject<number>();

cold$.subscribe(subject$); // Subject acts as Observer

// All downstream subscribers share one interval
subject$.subscribe(v => console.log('A', v));
subject$.subscribe(v => console.log('B', v));
```

### 3. Destroy / Lifecycle Signal

The standard subscription cleanup pattern:

```typescript
const destroy$ = new Subject<void>();

stream1$.pipe(takeUntil(destroy$)).subscribe(...);
stream2$.pipe(takeUntil(destroy$)).subscribe(...);

// On component/service teardown — kills all subscriptions at once
destroy$.next();
destroy$.complete();
```

## The Four Variants

### `Subject` — Plain Event Bus

```typescript
const bus$ = new Subject<number>();
```

- No memory — late subscribers get nothing from the past
- No initial value required
- Best for: action dispatchers, event buses, destroy signals

### `BehaviorSubject` — State Holder

```typescript
const state$ = new BehaviorSubject<number>(0); // initial value required
state$.subscribe(v => console.log(v)); // immediately: 0
state$.next(1); // 1
state$.subscribe(v => console.log(v)); // immediately: 1 (current value)
console.log(state$.value); // 1 — synchronous read
```

- Always has a current value
- Late subscribers immediately receive the current value
- `.value` for synchronous access (use sparingly)
- Best for: application state, component local state

### `ReplaySubject` — Buffer / Cache

```typescript
const cache$ = new ReplaySubject<number>(3); // buffer last 3
cache$.next(1); cache$.next(2); cache$.next(3); cache$.next(4);
cache$.subscribe(v => console.log(v)); // immediately: 2, 3, 4
```

- Replays last N values to late subscribers
- No initial value required
- Optional time window: `new ReplaySubject<T>(N, windowMs)`
- Best for: caching, late-join streams, `shareReplay` internals

### `AsyncSubject` — Last Value on Complete

```typescript
const result$ = new AsyncSubject<number>();
result$.next(1); // buffered
result$.next(2); // buffered
result$.next(3); // buffered
result$.complete();
result$.subscribe(v => console.log(v)); // 3 — only last value, on complete
```

- Emits only the final value, only when `complete()` is called
- Best for: Promise-like semantics, `lastValueFrom` equivalent

## Choosing the Right Subject

```
Do late subscribers need values?
├── No  → Subject
└── Yes → Do you need a current/initial value?
          ├── Yes, always → BehaviorSubject
          └── No  → How many past values?
                    ├── Just 1 (no init required) → ReplaySubject(1)
                    ├── Last N                    → ReplaySubject(N)
                    └── Only on complete          → AsyncSubject
```

| | `Subject` | `BehaviorSubject` | `ReplaySubject(1)` | `AsyncSubject` |
|--|-----------|-------------------|-------------------|----------------|
| Initial value required | No | **Yes** | No | No |
| Late subscriber gets | Nothing | Current value | Last emitted | Last on complete |
| `.value` accessor | No | **Yes** | No | No |
| Emits before complete | Yes | Yes | Yes | **No** |
| Use case | Event bus | State | Cache | Promise-like |

## Subject vs shareReplay

Both multicast. Choose based on control needs:

```typescript
// shareReplay — declarative, operator-based, preferred for derived streams
const shared$ = source$.pipe(shareReplay(1));

// Subject — imperative, explicit control, for architectural seams
const subject$ = new Subject<T>();
source$.subscribe(subject$);
const shared$ = subject$.asObservable();
```

Use raw `Subject` when you need to push values imperatively (action dispatch, lifecycle signals, bridging non-Observable APIs). Use `shareReplay` when you simply need to share a derived stream.

## Exposing Subjects Safely

Always expose a Subject as `Observable` to prevent consumers from calling `.next()` externally:

```typescript
class Store {
	private _action$ = new Subject<Action>();
	private _state$ = new BehaviorSubject<State>(initialState);

	// Public: read-only Observable
	readonly state$: Observable<State> = this._state$.asObservable();

	// Public: controlled write
	dispatch(action: Action): void {
		this._action$.next(action);
	}
}
```

## Critical Pitfalls

### 1. Late subscribers miss past values (plain Subject)

```typescript
const s$ = new Subject<number>();
s$.next(1); // nobody listening — lost forever
s$.subscribe(v => console.log(v)); // gets nothing from past
s$.next(2); // ✓ gets 2
// Fix: use BehaviorSubject or ReplaySubject
```

### 2. Error kills all subscribers — Subject becomes zombie

```typescript
s$.error(new Error('boom')); // all current subscribers error
// Any future subscribe() immediately errors — Subject is permanently dead
// Fix: catch errors before they reach the Subject
```

### 3. After complete(), Subject is inert

```typescript
s$.complete();
s$.next(99); // ignored — Subject is closed
s$.subscribe(...); // immediately completes — gets nothing
```

### 4. Calling .next() after unsubscribe from destroy$

```typescript
destroy$.next();
destroy$.complete();
// Don't call destroy$.next() again — it's completed
// Fix: check destroy$.closed before calling next()
```

## When NOT to Use a Subject — Erik Meijer's Warning

Erik Meijer calls Subjects the **"mutable variables of the Rx world"** — powerful but overused. The community default should be to avoid them unless a specific set of conditions is met.

> *"A Subject/Observer is like a mutable variable — it is not needed in most cases. They are only needed when there is no existing observable or convertible source."*
> — Erik Meijer

### The 4-Question Decision Framework (Dave Sexton)

Answer these questions in order:

```
1. Is the source external?
   (Does a DOM event, timer, HTTP response, or other existing Observable/event
    already exist for this notification?)
   │
   ├── YES → Do NOT use a Subject. Convert with fromEvent, from, timer, ajax, etc.
   │         Then make it hot if needed: publish() / share() / shareReplay()
   │
   └── NO (source is local — you must generate the notifications yourself)
         │
         2. Do observers need to share subscription side effects? (i.e. must it be hot?)
         │
         ├── NO  → Use an Rx generator method (of, range, interval, defer, Create)
         │         and let it be cold — callers can share it if they need to
         │
         └── YES → A Subject (or variant) is the correct tool
```

### The Four Combinations

| Source | Temperature needed | Approach |
|--------|--------------------|----------|
| External | Cold | Use source as-is or `defer()` |
| External | Hot | `publish()`, `share()`, `shareReplay()` |
| Local | Cold | `of`, `range`, `interval`, `Observable.create` |
| Local + Hot | **Hot** | **Subject** (this is the correct use case) |

A Subject is the right answer **only** in the bottom-right quadrant: you are the producer, the Observable must be hot, and there is no existing source to convert.

### The One Scenario That Clearly Justifies Subject

A **reactive property** — exposing a stream of changes for a specific field:

```typescript
class UserStore {
	private _name$ = new BehaviorSubject<string>('');

	// Expose read-only — prevents callers from calling .next() externally
	readonly name$: Observable<string> = this._name$.asObservable();

	setName(name: string): void {
		this._name$.next(name);
	}
}
```

`BehaviorSubject` is preferred over plain `Subject` here because it holds the current value and pushes it immediately to new subscribers.

### Cross-Cutting Observables (Also Justified)

A logging class that exposes its output as a stream:

```typescript
class AlertService {
	private static _alerts$ = new Subject<string>();
	static readonly alerts$: Observable<string> = AlertService._alerts$.asObservable();

	static send(message: string): void {
		AlertService._alerts$.next(message);
	}
}

// Consumers — reactive logging, monitoring, real-time debug
AlertService.alerts$.pipe(
	filter(msg => msg.startsWith('[ERROR]')),
).subscribe(err => notifyOnCall(err));
```

### Thread Safety Note

Subject and `Observable.create` do **not** enforce the Rx grammar (`OnNext* (OnError | OnComplete)?`) in the presence of concurrent calls. If multiple threads can call `.next()` concurrently, use `Subject.pipe(observeOn(asyncScheduler))` or synchronize externally.

## Related

- [Subject](Subject.md) — base Subject reference
- [BehaviorSubject](BehaviorSubject.md) — state container deep-dive
- [ReplaySubject](ReplaySubject.md) — buffer and cache patterns
- [AsyncSubject](AsyncSubject.md) — Promise-like semantics
- [Observable](Observable.md) — the push-based foundation Subject extends
- [mvu](../patterns/mvu.md) — Subject as action bus in MVU
- [effects](../patterns/effects.md) — Subject as dispatcher in Effects
- [state-management](../patterns/state-management.md) — BehaviorSubject as state container
