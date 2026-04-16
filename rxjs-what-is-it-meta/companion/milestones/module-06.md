# Module 06 — Subjects and shareReplay: The Multicast Layer

`action$` in `state.ts` is a **`Subject`** — the only RxJS type that is simultaneously:
- An **Observer**: consumers call `action$.next(action)` to push values in
- An **Observable**: `state$` subscribes to it to read values out

This dual nature is what makes `Subject` the message bus for the MVU pattern. Any component
can dispatch an action; the state pipeline receives all of them.

`state$` uses `shareReplay({ bufferSize: 1, refCount: true })`:
- **`shareReplay`** multicasts the `scan` pipeline — the reducer runs once, not once per subscriber
- **`bufferSize: 1`** replays the last state to any late subscriber (e.g. a component mounted after
  the first action) so it receives the current state immediately, not silence
- **`refCount: true`** means the upstream subscription is torn down when all subscribers disconnect.
  For a long-lived single-page app this is fine; for a server-side or test context it prevents leaks

**Why not `BehaviorSubject` for state?**
`scan` + `shareReplay` keeps the reducer pure and the action bus separate. A `BehaviorSubject`
would require imperative `.next(newState)` calls and couples the state mutation site to the
storage site. The pipeline approach is more composable and testable.
