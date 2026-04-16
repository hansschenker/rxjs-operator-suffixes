# Module 04 — T-Only Operators and the scan Primitive

`scan(reducer, initialState)` in `state.ts` is the **foundational Layer 1 state primitive**.
It accumulates every `Action` dispatched to `action$` into a new `AppState` — a left fold over
time, running entirely in value-space with no scheduling concerns.

The `reducer` function is a pure T-only function:
- Input: `(AppState, Action)`
- Output: `AppState`
- No time, no async, no side effects — just data transformation

`map` in `app.ts` that extracts `(e.target as HTMLInputElement).value.trim()` is another T-only
operation. It runs synchronously on every emission; there is no waiting, no buffering.

`startWith(initialState)` seeds the first emission so `state$` always has a value the moment
anything subscribes. Without it, `state$` would be silent until the first action is dispatched —
the `render` function would not run on page load and the UI would be in an undefined visual state.

**The T-only operator family in this app:** `map`, `scan`, `startWith`, `distinctUntilChanged`.

None of these know about time. They operate on values as they arrive. Time-based operators
(`debounceTime`) are a separate concern and are introduced in Module 05.
