---
title: "Effects Pattern"
category: patterns
tags: [patterns, effects, side-effects, ngrx, action-in-action-out]
related: [mvu.md, state-management.md, ../architectures/mvu.md]
sources: 0
updated: 2026-04-08
---

# Effects Pattern

> NgRx-style side effect management without a framework — Actions In, Actions Out. Effects handle async work while keeping the reducer pure.

## The Problem

Reducers must be pure functions. But real apps have side effects: HTTP requests, localStorage, WebSocket messages, routing. Where do these go?

**Effects** are the answer: standalone streams that:
1. Listen to the action stream
2. Perform async work
3. Dispatch new actions with the results

```
action$  ──► Effect ──[async work]──► action$
         (listen)                     (dispatch)
```

This keeps the reducer pure and makes side effects composable, testable, and cancellable.

## Basic Effect

```typescript
import { Observable, Subject } from 'rxjs';
import { filter, switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

type Action =
  | { type: 'LOAD_USERS' }
  | { type: 'USERS_LOADED'; payload: User[] }
  | { type: 'LOAD_USERS_FAILED'; payload: string };

const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

// Effect: listen for LOAD_USERS, fetch, dispatch result
const loadUsersEffect$ = action$.pipe(
  filter(a => a.type === 'LOAD_USERS'),
  switchMap(() =>
    fetchUsers().pipe(
      map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
      catchError(err => of({ type: 'LOAD_USERS_FAILED' as const, payload: err.message }))
    )
  )
);

// Wire up — effects dispatch back into action$
loadUsersEffect$.subscribe(dispatch);
```

## Effect Creator Pattern

Encapsulate effects as functions that take `actions$` and return `Observable<Action>`:

```typescript
type Effect<A extends Action> = (actions$: Observable<A>) => Observable<A>;

const loadUsersEffect: Effect<Action> = (actions$) =>
  actions$.pipe(
    filter(a => a.type === 'LOAD_USERS'),
    switchMap(() =>
      fetchUsers().pipe(
        map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
        catchError(err => of({ type: 'LOAD_USERS_FAILED' as const, payload: err.message }))
      )
    )
  );
```

## Effects Runner

A simple system to register and start effects:

```typescript
import { Subject, merge, Observable } from 'rxjs';

class EffectsRunner<A extends Action> {
  private action$ = new Subject<A>();
  private effects: Effect<A>[] = [];

  dispatch(action: A): void {
    this.action$.next(action);
  }

  get actions$(): Observable<A> {
    return this.action$.asObservable();
  }

  register(...effects: Effect<A>[]): this {
    this.effects.push(...effects);
    return this;
  }

  start(): void {
    // Merge all effect output streams — each dispatches back into action$
    merge(...this.effects.map(effect => effect(this.action$)))
      .subscribe(action => this.dispatch(action));
  }
}

// Usage
const runner = new EffectsRunner<Action>();
runner
  .register(loadUsersEffect, saveSettingsEffect, routingEffect)
  .start();

runner.dispatch({ type: 'LOAD_USERS' });
```

## The Four Higher-Order Operators for Effects

Choosing the right flattening operator is critical:

| Operator | Behaviour | When to use |
|----------|-----------|-------------|
| `switchMap` | Cancel previous inner | Search, live query, navigation |
| `mergeMap` | Run all in parallel | Independent parallel requests |
| `concatMap` | Queue, run in order | Sequential operations, analytics |
| `exhaustMap` | Ignore while active | Form submit, login, prevent double |

```typescript
// Login — prevent double-submit
const loginEffect: Effect<Action> = (actions$) =>
  actions$.pipe(
    filter(a => a.type === 'LOGIN'),
    exhaustMap(action =>
      authService.login(action.payload).pipe(
        map(token => ({ type: 'LOGIN_SUCCESS' as const, payload: token })),
        catchError(err => of({ type: 'LOGIN_FAILED' as const, payload: err }))
      )
    )
  );

// Analytics — fire and forget, all events
const analyticsEffect: Effect<Action> = (actions$) =>
  actions$.pipe(
    mergeMap(action =>
      analytics.track(action).pipe(
        ignoreElements(),  // don't dispatch anything back
        catchError(() => EMPTY)  // swallow errors silently
      )
    )
  );
```

## Effects That Don't Dispatch

Some effects are terminal — they cause a side effect but don't produce an action:

```typescript
// Persist to localStorage — no dispatch
const persistEffect: Effect<Action> = (actions$) =>
  actions$.pipe(
    filter(a => a.type === 'SAVE_SETTINGS'),
    tap(a => localStorage.setItem('settings', JSON.stringify(a.payload))),
    ignoreElements()  // filter out all emissions → Observable<never>
  );
```

## Error Handling in Effects

**Critical**: `catchError` must be **inside** the `switchMap`/`mergeMap`, not outside. If the outer stream errors, the effect dies.

```typescript
// WRONG — one HTTP error kills the effect permanently
actions$.pipe(
  filter(a => a.type === 'LOAD'),
  switchMap(() => fetchData()),
  catchError(err => of(errorAction(err))) // ← effect stream dies here
);

// CORRECT — errors are caught per inner Observable
actions$.pipe(
  filter(a => a.type === 'LOAD'),
  switchMap(() =>
    fetchData().pipe(
      catchError(err => of(errorAction(err))) // ← only this inner dies
    )
  )
);
```

## Testing Effects

Effects are just functions that take an Observable and return an Observable — straightforward to test:

```typescript
import { TestScheduler } from 'rxjs/testing';

test('loadUsersEffect dispatches USERS_LOADED on success', () => {
  const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

  scheduler.run(({ cold, expectObservable }) => {
    const actions$ = cold('--a', { a: { type: 'LOAD_USERS' } });
    const users = [{ id: 1, name: 'Alice' }];
    fetchUsers = () => cold('--b|', { b: users });

    const result$ = loadUsersEffect(actions$);
    expectObservable(result$).toBe('----c', {
      c: { type: 'USERS_LOADED', payload: users }
    });
  });
});
```

## Related

- [mvu](mvu.md) — MVU pattern that effects integrate with
- [state-management](state-management.md) — state management side
- [mvu](../architectures/mvu.md) — full wired architecture
- [marble-testing](../testing/marble-testing.md) — testing effects with marble diagrams
