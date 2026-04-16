# Module 07 — Flattening Operators: switchMap and Cancel-on-New

`searchOnQuery` uses `switchMap` — the **cancel-on-new** flattening strategy (Layer 4).

Every time `query$` emits a new string, `switchMap`:
1. Unsubscribes from the previous inner Observable (the in-flight search)
2. Subscribes to a new inner Observable for the new query

The `() => clearTimeout(timer)` teardown function inside `mockSearch` is the cancellation
mechanism in action. When `switchMap` unsubscribes the old inner Observable, the teardown runs
and the timeout is cleared — no stale result can fire after the query has changed.

**Why `switchMap` and not the other flattening operators?**

| Operator | Behaviour | Use case |
|---|---|---|
| `switchMap` | Cancel previous, start new | Live search, typeahead |
| `exhaustMap` | Ignore new while active | Form submit, login |
| `concatMap` | Queue, run in order | Ordered writes, animations |
| `mergeMap` | Run all concurrently | Parallel independent tasks |

For typeahead search, every new keystroke makes the previous result irrelevant. `switchMap` is
the correct choice: the newest query always wins.

`catchError(() => of([]))` wraps the inner Observable to prevent a single failed search from
propagating an error to the outer query stream. This is covered in detail in Module 09.
