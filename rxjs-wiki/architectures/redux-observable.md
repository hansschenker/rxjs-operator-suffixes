---
title: "redux-observable Architecture"
category: architectures
tags: [architectures, redux, redux-observable, epics, middleware]
related: [index.md, mvu.md, ../patterns/effects.md]
sources: 0
updated: 2026-04-08
---

# redux-observable Architecture

> Redux middleware that lets you compose async logic as RxJS Epics — the "official" way to combine Redux and RxJS in React/Angular apps.

## What is redux-observable?

redux-observable is a Redux middleware that exposes the action stream as an Observable. You write **Epics** — functions that take `(action$, state$)` and return `Observable<Action>`. The middleware subscribes to the returned Observable and dispatches every emission back to the Redux store.

```
Redux Action ──► Epic ──[RxJS pipes]──► Observable<Action> ──► Redux dispatch
```

## Setup

```bash
npm install redux-observable rxjs redux react-redux
```

```typescript
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';

const epicMiddleware = createEpicMiddleware();
const store = createStore(rootReducer, applyMiddleware(epicMiddleware));

epicMiddleware.run(rootEpic);
```

## Epic Signature

```typescript
import { Epic } from 'redux-observable';

type AppEpic = Epic<Action, Action, RootState>;

// (actions$: Observable<Action>, state$: StateObservable<RootState>) => Observable<Action>
```

## Basic Epic

```typescript
import { ofType } from 'redux-observable';
import { switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const fetchUserEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_USER'),  // redux-observable's ofType helper
    switchMap(action =>
      ajax.getJSON(`/api/users/${action.payload.id}`).pipe(
        map(user => ({ type: 'FETCH_USER_FULFILLED', payload: user })),
        catchError(err => of({ type: 'FETCH_USER_REJECTED', payload: err }))
      )
    )
  );
```

## Accessing State in Epics

```typescript
import { withLatestFrom } from 'rxjs/operators';

const saveSettingsEpic: AppEpic = (action$, state$) =>
  action$.pipe(
    ofType('SAVE_SETTINGS'),
    withLatestFrom(state$),  // sample current state
    switchMap(([action, state]) =>
      api.save(state.settings).pipe(
        map(() => ({ type: 'SETTINGS_SAVED' })),
        catchError(err => of({ type: 'SAVE_FAILED', payload: err }))
      )
    )
  );
```

## Combining Epics

```typescript
import { combineEpics } from 'redux-observable';

const rootEpic = combineEpics(
  fetchUserEpic,
  saveSettingsEpic,
  analyticsEpic,
  routerEpic
);
```

## `combineEpics` vs `merge`

`combineEpics` is essentially `merge(epic1(action$, state$), epic2(action$, state$), ...)`. You can use `merge` directly for dynamic epic composition.

## TypeScript with RTK

Using Redux Toolkit with redux-observable:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: { list: [], loading: false } as UsersState,
  reducers: {
    fetchUsers: (state) => { state.loading = true; },
    usersLoaded: (state, action: PayloadAction<User[]>) => {
      state.loading = false;
      state.list = action.payload;
    },
  }
});

export const { fetchUsers, usersLoaded } = usersSlice.actions;

// Epic
const fetchUsersEpic: AppEpic = (action$) =>
  action$.pipe(
    filter(fetchUsers.match),  // RTK action matcher
    switchMap(() =>
      api.getUsers().pipe(
        map(usersLoaded),  // RTK action creator
        catchError(err => of(fetchUsersFailed(err.message)))
      )
    )
  );
```

## Comparison vs Custom MVU

| | redux-observable | Custom MVU |
|--|-----------------|------------|
| Redux DevTools | Yes (built-in) | Manual |
| Time-travel debugging | Yes | Manual |
| Learning curve | Redux + RxJS | RxJS only |
| Bundle overhead | Redux + middleware | RxJS only |
| Framework | React (usually) | Any |
| Type inference | Good | Excellent |

## Common Epic Patterns

### Debounced Search

```typescript
const searchEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('SEARCH_CHANGED'),
    debounceTime(300),
    distinctUntilChanged((a, b) => a.payload === b.payload),
    switchMap(action =>
      api.search(action.payload).pipe(
        map(results => searchResultsLoaded(results)),
        catchError(err => of(searchFailed(err)))
      )
    )
  );
```

### Long Polling

```typescript
const pollEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('START_POLLING'),
    switchMap(() =>
      timer(0, 30_000).pipe(
        switchMap(() => api.getStatus()),
        map(statusUpdated),
        takeUntil(action$.pipe(ofType('STOP_POLLING')))
      )
    )
  );
```

## Related

- [index](index.md) — architecture comparison
- [mvu](mvu.md) — custom MVU without Redux
- [effects](../patterns/effects.md) — effects pattern (what Epics implement)
