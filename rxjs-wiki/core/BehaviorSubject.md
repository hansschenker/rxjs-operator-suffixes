---
title: "BehaviorSubject"
category: core
tags: [core, subject, state, current-value, multicast]
related: [Subject.md, ReplaySubject.md, AsyncSubject.md, ../patterns/state-management.md]
sources: 0
updated: 2026-04-08
---

# BehaviorSubject

> A Subject that requires an initial value and always emits the current value to new subscribers — the standard primitive for holding reactive state.

## Behaviour

- Requires an initial value at construction
- Stores the **most recent value**
- Any new subscriber **immediately receives** the current value on subscribe
- Exposes `.value` for synchronous reads

```typescript
import { BehaviorSubject } from 'rxjs';

const state$ = new BehaviorSubject<number>(0); // initial: 0

state$.subscribe(v => console.log('A:', v)); // A: 0 (immediate)

state$.next(1); // A: 1
state$.next(2); // A: 2

state$.subscribe(v => console.log('B:', v)); // B: 2 (gets current)

state$.next(3); // A: 3, B: 3
```

## Synchronous Value Access

```typescript
const count$ = new BehaviorSubject<number>(0);
count$.next(5);

// Read without subscribing
console.log(count$.value); // 5
```

Use `.value` sparingly — it bypasses the reactive data flow. Prefer deriving downstream Observables with `pipe()`.

## As State Container

BehaviorSubject is the natural choice for application state:

```typescript
interface State {
  items: Item[];
  loading: boolean;
  error: string | null;
}

const initialState: State = { items: [], loading: false, error: null };
const state$ = new BehaviorSubject<State>(initialState);

// Immutable update
function dispatch(updater: (s: State) => State): void {
  state$.next(updater(state$.value));
}

// Select a slice
const items$ = state$.pipe(
  map(s => s.items),
  distinctUntilChanged()
);

// Usage
dispatch(s => ({ ...s, loading: true }));
```

## With scan (Redux-style)

Alternatively, use `scan` on an action Subject to derive state — this is the purer MVU pattern:

```typescript
const action$ = new Subject<Action>();
const state$ = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);
```

The `scan`-based approach is more testable because the reducer is a pure function. The BehaviorSubject approach is simpler for smaller apps.

See [state-management](../patterns/state-management.md) and [mvu](../patterns/mvu.md).

## Exposing as Observable

Always expose BehaviorSubject as `Observable` to prevent external mutation:

```typescript
class Store {
  private _state$ = new BehaviorSubject<State>(initialState);
  readonly state$: Observable<State> = this._state$.asObservable();

  update(updater: (s: State) => State): void {
    this._state$.next(updater(this._state$.value));
  }
}
```

## Comparison

| | Subject | BehaviorSubject | ReplaySubject(1) |
|--|---------|-----------------|-----------------|
| Initial value required | No | Yes | No |
| Late subscriber gets | Nothing | Current value | Last emitted |
| `.value` accessor | No | Yes | No |
| Use case | Event bus | State | Cache/late-join |

## Related

- [Subject](Subject.md) — base class
- [ReplaySubject](ReplaySubject.md) — replays N values (more flexible, no required initial)
- [state-management](../patterns/state-management.md) — full state management patterns
- [mvu](../architectures/mvu.md) — BehaviorSubject in MVU architecture
