---
title: "MVU Pattern (Model–View–Update)"
category: patterns
tags: [patterns, mvu, elm, state, architecture]
related: [state-management.md, effects.md, ../architectures/mvu.md]
sources: 0
updated: 2026-04-08
---

# MVU Pattern (Model–View–Update)

> Elm-like unidirectional data flow implemented with RxJS — actions flow in, state flows out, views are pure functions of state.

## The Core Idea

MVU (also called "The Elm Architecture") separates all concerns:

```
User Events → Actions → Reducer → State → View
                 ↑                          |
                 └──────────────────────────┘
                         (more actions)
```

- **Model**: the complete application state (a single value type)
- **Update**: a pure reducer `(State, Action) => State`
- **View**: a pure function `State => UI` (re-renders when state changes)

The key guarantee: **state only changes via the reducer**. This makes the system completely predictable and easy to debug.

## RxJS Implementation

```typescript
import { Subject, Observable } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

// --- Model ---
interface State {
  count: number;
  loading: boolean;
  items: Item[];
  error: string | null;
}

const initialState: State = {
  count: 0,
  loading: false,
  items: [],
  error: null,
};

// --- Actions ---
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'LOAD_ITEMS' }
  | { type: 'ITEMS_LOADED'; payload: Item[] }
  | { type: 'LOAD_FAILED'; payload: string };

// --- Action Bus ---
const action$ = new Subject<Action>();
const dispatch = (action: Action) => action$.next(action);

// --- Update (Reducer) ---
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + 1 };
    case 'DECREMENT':
      return { ...state, count: state.count - 1 };
    case 'LOAD_ITEMS':
      return { ...state, loading: true, error: null };
    case 'ITEMS_LOADED':
      return { ...state, loading: false, items: action.payload };
    case 'LOAD_FAILED':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

// --- State Stream ---
const state$: Observable<State> = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);
```

## Selectors — Derived State

```typescript
// Memoized selectors via distinctUntilChanged
const items$ = state$.pipe(
  map(s => s.items),
  distinctUntilChanged()
);

const loading$ = state$.pipe(
  map(s => s.loading),
  distinctUntilChanged()
);

// Computed selector
const visibleItems$ = combineLatest([items$, filter$]).pipe(
  map(([items, filter]) => items.filter(i => i.name.includes(filter)))
);
```

`distinctUntilChanged` prevents re-renders when the relevant slice hasn't changed.

## View — Pure Rendering

```typescript
// Subscribe once, render on every state change
state$.subscribe(state => render(state));

// Or subscribe to specific slices
items$.subscribe(items => renderList(items));
loading$.subscribe(loading => renderSpinner(loading));
```

## Effects — Async Actions

Side effects (HTTP, WebSocket, localStorage) are handled outside the reducer. See [effects](effects.md) for the full pattern.

```typescript
// Simple inline effect
action$.pipe(
  filter(a => a.type === 'LOAD_ITEMS'),
  switchMap(() =>
    fetchItems().pipe(
      map(items => ({ type: 'ITEMS_LOADED' as const, payload: items })),
      catchError(err => of({ type: 'LOAD_FAILED' as const, payload: err.message }))
    )
  )
).subscribe(dispatch);

// Dispatch to start the load
dispatch({ type: 'LOAD_ITEMS' });
```

## `ofType` Helper

```typescript
function ofType<A extends Action, T extends A['type']>(
  ...types: T[]
): OperatorFunction<A, Extract<A, { type: T }>> {
  return filter((action): action is Extract<A, { type: T }> =>
    types.includes(action.type as T)
  );
}

// Usage
action$.pipe(
  ofType('ITEMS_LOADED'),
  map(action => action.payload) // fully typed as Item[]
).subscribe(...);
```

## Trade-offs

| Pro | Con |
|-----|-----|
| Fully predictable — all state changes traceable | Boilerplate for small apps |
| Easy time-travel debugging (state snapshots) | Actions for every interaction |
| Pure reducer is trivially unit-testable | Learning curve for teams new to FP |
| Unidirectional flow prevents state bugs | Effects system adds complexity |

## When to Use

Use MVU when:
- Multiple views need to share and react to the same state
- You need reliable undo/redo or time-travel debugging
- The team prefers explicit, traceable state changes
- The app has complex asynchronous flows that interact with state

Avoid MVU when:
- Simple component-local state is sufficient
- Very small apps where the overhead isn't justified

## Related

- [state-management](state-management.md) — alternative state patterns (BehaviorSubject-based)
- [effects](effects.md) — the Effects pattern for async side effects
- [mvu](../architectures/mvu.md) — full architecture including wiring
