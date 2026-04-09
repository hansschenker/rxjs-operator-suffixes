---
title: "State Management Patterns"
category: patterns
tags: [patterns, state, BehaviorSubject, scan, store]
related: [mvu.md, effects.md, ../core/BehaviorSubject.md, ../architectures/mvu.md]
sources: 0
updated: 2026-04-08
---

# State Management Patterns

> Patterns for managing application state reactively with RxJS — from simple BehaviorSubject to full scan-based MVU stores.

## Pattern 1 — BehaviorSubject Store

The simplest approach: a class wrapping a `BehaviorSubject` with typed update methods.

```typescript
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

interface TodoState {
  todos: Todo[];
  filter: 'all' | 'active' | 'done';
  loading: boolean;
}

class TodoStore {
  private state$ = new BehaviorSubject<TodoState>({
    todos: [],
    filter: 'all',
    loading: false,
  });

  // Expose as Observable to prevent external mutation
  readonly state: Observable<TodoState> = this.state$.asObservable();

  // Typed selectors with memoization
  readonly todos$ = this.state.pipe(map(s => s.todos), distinctUntilChanged());
  readonly filter$ = this.state.pipe(map(s => s.filter), distinctUntilChanged());
  readonly loading$ = this.state.pipe(map(s => s.loading), distinctUntilChanged());

  readonly visibleTodos$ = combineLatest([this.todos$, this.filter$]).pipe(
    map(([todos, filter]) => {
      switch (filter) {
        case 'active': return todos.filter(t => !t.done);
        case 'done': return todos.filter(t => t.done);
        default: return todos;
      }
    })
  );

  // Typed update methods (immutable)
  addTodo(text: string): void {
    this.update(s => ({
      ...s,
      todos: [...s.todos, { id: Date.now(), text, done: false }],
    }));
  }

  toggleTodo(id: number): void {
    this.update(s => ({
      ...s,
      todos: s.todos.map(t => t.id === id ? { ...t, done: !t.done } : t),
    }));
  }

  setFilter(filter: TodoState['filter']): void {
    this.update(s => ({ ...s, filter }));
  }

  private update(updater: (s: TodoState) => TodoState): void {
    this.state$.next(updater(this.state$.value));
  }
}
```

**Trade-offs:**
- Simple to understand
- Less boilerplate than MVU
- Direct method calls (not action objects) — less traceable

## Pattern 2 — scan-Based Reducer (Pure MVU)

The reducer approach: state is derived from an action stream. No direct mutation.

```typescript
import { Subject, merge, Observable } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

// State
interface CounterState { count: number; step: number }
const initial: CounterState = { count: 0, step: 1 };

// Actions as discriminated union
type Action =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'RESET' };

// Pure reducer
function reducer(state: CounterState, action: Action): CounterState {
  switch (action.type) {
    case 'INCREMENT': return { ...state, count: state.count + state.step };
    case 'DECREMENT': return { ...state, count: state.count - state.step };
    case 'SET_STEP': return { ...state, step: action.payload };
    case 'RESET': return initial;
    default: return state;
  }
}

// Action bus
const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

// State stream
const state$: Observable<CounterState> = action$.pipe(
  scan(reducer, initial),
  startWith(initial),
  shareReplay(1)
);

// Usage
state$.subscribe(console.log);
dispatch({ type: 'INCREMENT' });
dispatch({ type: 'SET_STEP', payload: 5 });
dispatch({ type: 'INCREMENT' });
```

**Trade-offs:**
- Pure, testable reducer
- Complete traceability — every state change is an action
- More boilerplate
- Better for complex/shared state

## Pattern 3 — Component-Local State

For state that's truly local to one component (not shared), simpler patterns are fine:

```typescript
// Simple reactive local state
const count$ = new BehaviorSubject(0);
const increment$ = new Subject<void>();
const decrement$ = new Subject<void>();

merge(
  increment$.pipe(map(() => 1)),
  decrement$.pipe(map(() => -1))
).pipe(
  scan((acc, delta) => acc + delta, 0),
  startWith(0)
).subscribe(count$);
```

## Selectors

Selectors are memoized projections of state:

```typescript
// Basic selector
const selectItems = (state: State) => state.items;

// Derived selector (memoized via distinctUntilChanged)
const visibleItems$ = state$.pipe(
  map(selectItems),
  distinctUntilChanged(),  // only re-emit when items array reference changes
  map(items => items.filter(i => !i.hidden))
);
```

For deep equality comparisons:

```typescript
import { isEqual } from 'lodash-es';

const complexSlice$ = state$.pipe(
  map(s => s.nested.deep.slice),
  distinctUntilChanged(isEqual)  // deep equality
);
```

## Immutable Updates

Always return new objects — never mutate state in-place:

```typescript
// Primitives
{ ...state, count: state.count + 1 }

// Arrays — add
{ ...state, items: [...state.items, newItem] }

// Arrays — remove
{ ...state, items: state.items.filter(i => i.id !== id) }

// Arrays — update one
{ ...state, items: state.items.map(i => i.id === id ? { ...i, done: true } : i) }

// Nested
{ ...state, user: { ...state.user, name: 'Alice' } }
```

For deeply nested state, consider `immer`:

```typescript
import produce from 'immer';

const newState = produce(state, draft => {
  draft.deeply.nested.value = 42; // mutate the draft — immer creates a new object
});
```

## State Persistence

```typescript
// Load from storage
const savedState = JSON.parse(localStorage.getItem('state') ?? 'null');
const state$ = new BehaviorSubject<State>(savedState ?? initialState);

// Persist on change
state$.pipe(
  debounceTime(500),
  distinctUntilChanged()
).subscribe(s => localStorage.setItem('state', JSON.stringify(s)));
```

## Related

- [mvu](mvu.md) — full MVU with action bus
- [effects](effects.md) — handling async state changes
- [BehaviorSubject](../core/BehaviorSubject.md) — the core primitive
- [mvu](../architectures/mvu.md) — complete wired architecture
