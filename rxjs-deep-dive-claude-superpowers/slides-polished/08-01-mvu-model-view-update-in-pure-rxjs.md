---
marp: true
theme: uncover
title: "MVU (Model-View-Update) in pure RxJS"
---

# MVU (Model-View-Update) in pure RxJS
> Scattered BehaviorSubjects let any module mutate state silently — MVU makes state changes traceable, testable, and impossible to corrupt.

---

## Core Concept
- **Model** — a single immutable state value; every slice of UI derives from it
- **Update** — a pure reducer: `(State, Action) => State` — no side effects, ever
- **View** — pure function of state; subscribes once, re-renders on every emission
- **Effects** handle async work *outside* the reducer, dispatching new actions on completion
- The key guarantee: **"state only changes via the reducer"** — all transitions are logged, replayable, and unit-testable

---

## How It Works

```
User Events ──► dispatch() ──► action$ (Subject<Action>)
                                     │
                          ┌──────────┴───────────┐
                          ▼                      ▼
                      Effects               scan(reducer, init)
                   (HTTP / WS)                   │
                          │                      ▼
                          └───────────► state$ (shareReplay(1))
                                              │
                               ┌──────────────┼──────────────┐
                               ▼              ▼              ▼
                            users$        loading$        error$
                           (selector)    (selector)     (selector)
```

---

## Common Mistake

```typescript
// ❌ WRONG: scattered BehaviorSubjects — every dev reaches for this first.
// Any module can call .next() at any time with no audit trail.
// Race conditions are invisible; there's no way to replay what happened.
const users$   = new BehaviorSubject<User[]>([]);
const loading$ = new BehaviorSubject<boolean>(false);
const error$   = new BehaviorSubject<string | null>(null);

function loadUsers(): void {
  loading$.next(true);
  error$.next(null);
  fetchUsers().subscribe({        // ← nested subscription
    next: users => { users$.next(users); loading$.next(false); },
    error: err  => { error$.next(err.message); loading$.next(false); },
  });
}
```

---

## The Right Way

```typescript
const action$ = new Subject<Action>();
const dispatch = (a: Action): void => action$.next(a);

// Pure reducer — all state logic in one place, trivially unit-tested
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_USERS':   return { ...state, loading: true,  error: null };
    case 'USERS_LOADED': return { ...state, loading: false, users: action.payload };
    case 'LOAD_FAILED':  return { ...state, loading: false, error: action.payload };
    default:             return state;
  }
}

const state$ = action$.pipe(
  scan(reducer, initialState), // accumulate state over every action
  startWith(initialState),     // emit before any action fires
  shareReplay(1)               // all selectors share one subscription
);

// Effect: action in → async work → action out — never touches state directly
const loadEffect$ = action$.pipe(
  ofType('LOAD_USERS'),
  switchMap(() => fetchUsers().pipe(
    map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
    catchError(err => of({ type: 'LOAD_FAILED' as const, payload: err.message }))
  ))
);
merge(loadEffect$).subscribe(dispatch);
```

---

## Key Rule
> **Dispatch actions — never call `.next()` on state directly; the reducer is the only place in the entire application where state is allowed to change.**