---
title: "MVU Architecture"
category: architectures
tags: [architectures, mvu, elm, unidirectional, state, effects]
related: [index.md, ../patterns/mvu.md, ../patterns/effects.md, ../patterns/state-management.md]
sources: 0
updated: 2026-04-08
---

# MVU Architecture (Full Wiring)

> Complete framework-agnostic MVU implementation with RxJS — state, effects, view binding, and cleanup.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     Application                          │
│                                                          │
│  User Events ──► dispatch() ──► action$                  │
│                                    │                     │
│                        ┌───────────┼──────────┐         │
│                        ▼           ▼          ▼         │
│                    Effect 1    Effect 2   Effect N       │
│                    (HTTP)      (Router)   (Storage)      │
│                        │           │          │         │
│                        └───────────┴──────────┘         │
│                                    │ (dispatch results)  │
│                                    ▼                     │
│                              scan(reducer)               │
│                                    │                     │
│                                    ▼                     │
│                               state$                     │
│                              (shareReplay)               │
│                                    │                     │
│                    ┌───────────────┼──────────────┐     │
│                    ▼               ▼              ▼     │
│                 items$          loading$        error$   │
│                    │               │              │     │
│                    ▼               ▼              ▼     │
│                renderList()  renderSpinner()  renderErr()│
└─────────────────────────────────────────────────────────┘
```

## Complete Implementation

```typescript
import { Subject, Observable, merge, EMPTY } from 'rxjs';
import {
  scan, startWith, shareReplay, map, distinctUntilChanged,
  filter, switchMap, catchError, tap
} from 'rxjs/operators';
import { of } from 'rxjs';

// ─── Domain Types ─────────────────────────────────────────

interface User {
  id: number;
  name: string;
  email: string;
}

interface AppState {
  users: User[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;
  query: string;
}

type Action =
  | { type: 'LOAD_USERS' }
  | { type: 'USERS_LOADED'; payload: User[] }
  | { type: 'LOAD_FAILED'; payload: string }
  | { type: 'SELECT_USER'; payload: number }
  | { type: 'SEARCH_CHANGED'; payload: string };

// ─── Initial State ────────────────────────────────────────

const initialState: AppState = {
  users: [],
  selectedId: null,
  loading: false,
  error: null,
  query: '',
};

// ─── Reducer (pure) ───────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_USERS':
      return { ...state, loading: true, error: null };

    case 'USERS_LOADED':
      return { ...state, loading: false, users: action.payload };

    case 'LOAD_FAILED':
      return { ...state, loading: false, error: action.payload };

    case 'SELECT_USER':
      return { ...state, selectedId: action.payload };

    case 'SEARCH_CHANGED':
      return { ...state, query: action.payload };

    default:
      return state;
  }
}

// ─── Action Bus ───────────────────────────────────────────

const action$ = new Subject<Action>();
const dispatch = (action: Action): void => action$.next(action);

// ─── State Stream ─────────────────────────────────────────

const state$: Observable<AppState> = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);

// ─── Selectors ────────────────────────────────────────────

const users$ = state$.pipe(map(s => s.users), distinctUntilChanged());
const loading$ = state$.pipe(map(s => s.loading), distinctUntilChanged());
const error$ = state$.pipe(map(s => s.error), distinctUntilChanged());
const query$ = state$.pipe(map(s => s.query), distinctUntilChanged());

const filteredUsers$ = combineLatest([users$, query$]).pipe(
  map(([users, query]) =>
    query
      ? users.filter(u => u.name.toLowerCase().includes(query.toLowerCase()))
      : users
  )
);

const selectedUser$ = combineLatest([users$, state$.pipe(map(s => s.selectedId))]).pipe(
  map(([users, id]) => users.find(u => u.id === id) ?? null),
  distinctUntilChanged()
);

// ─── Effects ──────────────────────────────────────────────

function ofType<A extends Action, T extends A['type']>(
  ...types: T[]
): (source$: Observable<A>) => Observable<Extract<A, { type: T }>> {
  return filter(
    (action): action is Extract<A, { type: T }> =>
      types.includes(action.type as T)
  );
}

// Load users effect
const loadUsersEffect$ = action$.pipe(
  ofType('LOAD_USERS'),
  switchMap(() =>
    fetchUsers().pipe(
      map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
      catchError(err => of({ type: 'LOAD_FAILED' as const, payload: err.message }))
    )
  )
);

// Effects dispatch back into action$
merge(loadUsersEffect$).subscribe(dispatch);

// ─── View Binding (Vanilla DOM) ───────────────────────────

const destroy$ = new Subject<void>();
const until = takeUntil(destroy$);

filteredUsers$.pipe(until).subscribe(users => {
  document.getElementById('list')!.innerHTML =
    users.map(u => `<li data-id="${u.id}">${u.name}</li>`).join('');
});

loading$.pipe(until).subscribe(loading => {
  document.getElementById('spinner')!.hidden = !loading;
});

error$.pipe(until).subscribe(error => {
  const el = document.getElementById('error')!;
  el.textContent = error ?? '';
  el.hidden = !error;
});

// ─── Event Wiring ─────────────────────────────────────────

fromEvent<InputEvent>(document.getElementById('search')!, 'input').pipe(
  map(e => (e.target as HTMLInputElement).value),
  debounceTime(300),
  distinctUntilChanged(),
  until
).subscribe(query => dispatch({ type: 'SEARCH_CHANGED', payload: query }));

fromEvent(document.getElementById('list')!, 'click').pipe(
  map(e => (e.target as HTMLElement).closest('[data-id]')),
  filter(Boolean),
  map(el => Number((el as HTMLElement).dataset.id)),
  until
).subscribe(id => dispatch({ type: 'SELECT_USER', payload: id }));

// ─── Bootstrap ────────────────────────────────────────────

dispatch({ type: 'LOAD_USERS' });

// ─── Cleanup ──────────────────────────────────────────────

function destroy(): void {
  destroy$.next();
  destroy$.complete();
  action$.complete();
}
```

## Layered Module Structure

For larger apps, separate into modules:

```
src/
├── store/
│   ├── actions.ts       ← Action type union + creators
│   ├── reducer.ts       ← Pure reducer function
│   ├── state.ts         ← action$, state$, dispatch
│   └── selectors.ts     ← Derived state streams
├── effects/
│   ├── users.effects.ts
│   └── index.ts         ← Merge and wire all effects
├── services/
│   └── api.ts           ← HTTP functions (return Observables)
└── main.ts              ← Bootstrap, view binding
```

## Trade-offs vs Alternatives

| | MVU (RxJS) | NgRx | Redux + rxjs-obs | MobX |
|--|------------|------|-----------------|------|
| Bundle size | Tiny | Large (framework) | Medium | Small |
| Framework dep | None | Angular only | React/Redux | None |
| DevTools | Manual | Full NgRx DevTools | Redux DevTools | MobX DevTools |
| Boilerplate | Medium | High | High | Low |
| Type safety | Excellent | Excellent | Good | Good |

## Related

- [mvu](../patterns/mvu.md) — pattern-level explanation
- [effects](../patterns/effects.md) — effects system details
- [state-management](../patterns/state-management.md) — state management options
- [redux-observable](redux-observable.md) — Redux-based alternative
