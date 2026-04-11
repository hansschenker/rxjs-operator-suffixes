---
marp: true
theme: uncover
title: "Subject as action bus: the effects pattern"
---

# Subject as action bus: the effects pattern
> Reducers must be pure — but HTTP calls, localStorage, and routing don't belong inside a reducer, so intermediate devs scatter side effects everywhere and lose control of async flow.

---

## Core Concept
- A **`Subject`** is the action bus: `dispatch(action)` calls `subject.next(action)`, every listener reacts
- An effect is a typed function: `(actions$: Observable<Action>) => Observable<Action>`
- Effects **filter** the action stream, **perform** async work, **emit** result actions back into the bus
- Multiple effects subscribe to the same `actions$` in parallel — each owns its own slice
- > "Actions In, Actions Out — effects handle async work while keeping the reducer pure."

---

## How It Works

```typescript
const action$ = new Subject<Action>();
const dispatch = (a: Action) => action$.next(a);

// An effect is just a function: Observable<Action> → Observable<Action>
const loadUsersEffect = (actions$: Observable<Action>): Observable<Action> =>
	actions$.pipe(
		filter(a => a.type === 'LOAD_USERS'),        // listen for trigger
		switchMap(() =>                               // cancel previous fetch
			fetchUsers().pipe(
				map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
				catchError(err => of({ type: 'LOAD_USERS_FAILED' as const, payload: err.message }))
			)
		)
	);

// Effect output feeds back into the same bus
loadUsersEffect(action$).subscribe(dispatch);
```

---

## Common Mistake

```typescript
// ❌ catchError placed OUTSIDE switchMap
const loadUsersEffect = (actions$: Observable<Action>) =>
	actions$.pipe(
		filter(a => a.type === 'LOAD_USERS'),
		switchMap(() => fetchUsers()),
		map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
		catchError(err =>
			// ☠️ This catches errors on the OUTER stream.
			// When fetchUsers() throws, the outer pipe terminates here.
			// The effect is now dead — no future LOAD_USERS will ever be processed.
			of({ type: 'LOAD_USERS_FAILED' as const, payload: err.message })
		)
	);
```

---

## The Right Way

```typescript
// ✅ catchError lives INSIDE the inner pipe — errors are caught per request
const loadUsersEffect = (actions$: Observable<Action>): Observable<Action> =>
	actions$.pipe(
		filter(a => a.type === 'LOAD_USERS'),
		switchMap(() =>
			fetchUsers().pipe(                         // ← inner Observable
				map(users => ({ type: 'USERS_LOADED' as const, payload: users })),
				catchError(err =>                      // ← only THIS inner dies on error
					of({ type: 'LOAD_USERS_FAILED' as const, payload: err.message })
				)
			)
		)
		// ✔ Outer stream survives — next LOAD_USERS is processed normally
	);

// Wire multiple effects into one runner
runner
	.register(loadUsersEffect, loginEffect, analyticsEffect)
	.start();
runner.dispatch({ type: 'LOAD_USERS' });
```

---

## Key Rule
> **`catchError` must live inside the flattening operator's inner pipe — place it outside and one failed HTTP request permanently kills your effect.**