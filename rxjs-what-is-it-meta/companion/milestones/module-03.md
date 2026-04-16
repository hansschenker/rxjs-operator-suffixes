# Module 03 — Pure Pipelines and the Side-Effect Boundary

The **pure transformation zone** is the `query$` pipe in `app.ts`:

```
fromEvent → map → debounceTime → distinctUntilChanged
```

None of these operators produce side effects. They transform values and control timing —
no network calls, no DOM mutations, no state writes.

**Side effects are confined to two places:**
- `tap(...)` in `app.ts` — dispatches an action to `action$` before the search fires
- `subscribe(render)` — drives the UI from the shared `state$`

`state.ts` is the **referentially transparent data layer**:
- `reducer` is a pure function: same `(state, action)` inputs always produce the same output
- `state$` is a *blueprint* — it does nothing until subscribed; the pipeline is just a description

`searchOnQuery` in `operators/search-on-query.ts` is a **pure higher-order function**: calling
`searchOnQuery()` returns an `OperatorFunction`. No network request fires at call time. The
function is a factory, not an executor.

This is the fundamental discipline of reactive code: describe *what* should happen as a pure
pipeline, then subscribe at the edge to make it happen.
