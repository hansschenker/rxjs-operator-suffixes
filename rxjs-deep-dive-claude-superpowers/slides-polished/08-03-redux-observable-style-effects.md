---
marp: true
theme: uncover
title: "Redux-Observable style effects"
---

# Redux-Observable style effects
> Reducers can't touch async work — Epics are the RxJS contract that keeps Redux pure, but one misplaced `catchError` turns your effect into a silent failure.

---

## Core Concept

- An **Epic** is `(action$, state$) => Observable<Action>` — receives the action stream, returns a new action stream
- The middleware subscribes to Epic output and feeds every emission back into `dispatch` automatically
- `ofType(...)` filters incoming actions — each Epic owns only the types it declares
- All async work lives **inside** `switchMap` / `exhaustMap` / `concatMap` — never in the reducer
- > **"Epics run alongside reducers — they never replace them."**

---

## How It Works

```typescript
// INPUT  action$ ──[FETCH_USER id:1]──────────────[FETCH_USER id:2]──►
//                        │                                │
//                   ofType filter                    ofType filter
//                        │                                │
//                   switchMap ◄── cancels previous on new emission ──►
//                        │
//               ajax.getJSON(url)
//                        │
//              map / catchError
//
// OUTPUT result$ ──────────────[FULFILLED user]──────────────────────►
//                                     ▲
//                            Redux dispatches back to store

const fetchUserEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_USER'),
    switchMap(action =>
      ajax.getJSON(`/api/users/${action.payload.id}`).pipe(
        map(user => ({ type: 'FETCH_USER_FULFILLED', payload: user })),
        catchError(err => of({ type: 'FETCH_USER_REJECTED', payload: err }))
      )
    )
  );
```

---

## Common Mistake

```typescript
// WRONG — catchError sits outside switchMap on the outer stream
// One failed HTTP request completes the Epic — it goes silent forever

const fetchUserEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_USER'),
    switchMap(action =>
      ajax.getJSON(`/api/users/${action.payload.id}`)
    ),
    map(user => ({ type: 'FETCH_USER_FULFILLED', payload: user })),
    catchError(err =>
      of({ type: 'FETCH_USER_REJECTED', payload: err })
      // ↑ This fires once, then the outer Observable completes.
      // Every subsequent FETCH_USER action is silently ignored.
    )
  );
```

---

## The Right Way

```typescript
// CORRECT — catchError is scoped inside the inner pipe()
// Only the inner stream ends on error; the outer Epic keeps listening

const fetchUserEpic: AppEpic = (action$) =>
  action$.pipe(
    ofType('FETCH_USER'),                              // only FETCH_USER passes
    switchMap(action =>
      ajax.getJSON(`/api/users/${action.payload.id}`).pipe(
        map(user => ({ type: 'FETCH_USER_FULFILLED' as const, payload: user })),
        catchError(err =>                              // ← scoped to THIS request only
          of({ type: 'FETCH_USER_REJECTED' as const, payload: err.message })
        )
        // inner observable ends here — outer switchMap stays alive for the next action
      )
    )
  );

// Register with the middleware
const rootEpic = combineEpics(fetchUserEpic, saveSettingsEpic, searchEpic);
epicMiddleware.run(rootEpic);
```

---

## Key Rule
> **`catchError` must live inside the inner `pipe()` — place it on the outer stream and the Epic silently dies on the first error, handling no further actions.**