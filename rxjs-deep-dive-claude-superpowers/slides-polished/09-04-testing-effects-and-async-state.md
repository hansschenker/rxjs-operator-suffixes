---
marp: true
theme: uncover
title: "Testing effects and async state"
---

# Testing effects and async state
> Without virtual time, async effect tests are slow, flaky, and impossible to reason about.

---

## Core Concept
- Effects are **pure Observable transformations**: action stream in, action stream out
- `TestScheduler.run()` provides **virtual time** — no real `setTimeout`, no `done` callbacks
- `hot()` marbles model the **actions$** stream (already in-flight when subscribed)
- `cold()` marbles model **inner Observables** such as HTTP calls (reset per subscription)
- The rule: **"Never subscribe manually in effect tests — use `expectObservable()`."**

---

## How It Works

```typescript
// Effect under test
export const loadUsers$ = (actions$: Observable<Action>, api: UserApi) =>
  actions$.pipe(
    ofType(loadUsers),
    switchMap(() =>
      api.getAll().pipe(
        map(users => loadUsersSuccess({ users })),
        catchError(err  => of(loadUsersFailure({ err })))
      )
    )
  );

// Marble timeline (virtual time, each frame = 1ms in run() scope):
// actions$:   -a-----------
//              └─ switchMap subscribes to cold HTTP call
// api.getAll:   --b|        (response arrives 2 frames later)
// output$:    ---c--------- (loadUsersSuccess emits at frame 3)
```

---

## Common Mistake

```typescript
it('loads users on action', (done) => {
  const dispatched: Action[] = [];

  // ❌ Real async subscription — timing is arbitrary and environment-dependent
  loadUsers$(actions$, realApiService).subscribe(action => {
    dispatched.push(action);
  });

  actions$.next(loadUsers());

  setTimeout(() => {
    // ❌ Magic delay hides timing bugs; passes by coincidence, not correctness
    expect(dispatched[0]).toEqual(loadUsersSuccess({ users: mockUsers }));
    done();
  }, 200);
});
```

---

## The Right Way

```typescript
import { TestScheduler } from 'rxjs/testing';

it('dispatches loadUsersSuccess after API resolves', () => {
  const scheduler = new TestScheduler((actual, expected) =>
    expect(actual).toEqual(expected)   // Vitest or Jest — both work
  );

  scheduler.run(({ hot, cold, expectObservable }) => {
    // Hot: the actions stream is already live — models a real NgRx store
    const actions$ = hot('-a', { a: loadUsers() });

    // Cold: each switchMap subscription gets its own isolated execution
    const mockApi: UserApi = { getAll: () => cold('--b|', { b: mockUsers }) };

    const output$ = loadUsers$(actions$, mockApi);

    // Key: assert both timing and value in one declarative marble string
    expectObservable(output$).toBe('---c', {
      c: loadUsersSuccess({ users: mockUsers })
    });
  });
});
```

---

## Key Rule
> **Test effects as marble transformations — virtual time makes async timing explicit, deterministic, and instant.**