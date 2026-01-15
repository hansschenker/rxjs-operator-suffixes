# rxjs-lite examples

These examples are designed to be readable first and executable second. They focus on:
- expressing intent with a small operator kernel
- making lifecycle visible with `trace()`
- keeping effects at the subscribe boundary

If you want to run an example quickly, the simplest approach is:
1) build the library (`npm run build`)
2) copy the example code into a scratch file in your app, or
3) import from `../src` inside this repo (ts-node/tsx not included by default to keep dependencies minimal)

---

## Example 01 — Debounced “search” pipeline (mocked)

File: `01-debounced-search.ts`

What to observe:
- every keystroke hits the input stream
- `debounceTime` waits for silence, then triggers a “request”
- `switchMap` cancels in-flight requests when a new debounced term arrives
- `trace` shows subscribe/next/complete/unsubscribe clearly


## Example 02 — share() with refCount + reset-on-terminal

File: `02-share-single-upstream.ts`

What to observe:
- first two subscriptions share a single upstream execution
- after terminal, a new subscriber starts a new upstream execution
