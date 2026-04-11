---
marp: true
theme: uncover
title: "withLatestFrom: Sampling vs Combining"
---

# withLatestFrom: Sampling vs Combining
> Every intermediate dev reaches for `combineLatest` — but it re-fires on every state change, turning a single user action into a flood of emissions.

---

## Core Concept
- `withLatestFrom` fires **only when the source emits** — secondary Observables never trigger output
- Secondary Observables are **sampled at the moment of emission**, not subscribed to as change drivers
- No output until **both source and every secondary** have each emitted at least once
- The source is the *trigger*; secondaries are *context*
- **"Secondary Observables supply context — they do not drive output."**

---

## How It Works

```
source$: ────a──────────────b────────────►
state$:  ──────────────X──────────Y──────►

withLatestFrom(state$):
         ────(skip)──────[b,X]───────────►
              ↑                ↑
       source emits,      source emits,
       state$ silent yet  state$ sampled ✓

combineLatest([source$, state$]):
         ────────────[a,X]──[a,Y]──[b,Y]►
                      ↑      ↑      ↑
                   source  state  source
```

---

## Common Mistake

```typescript
// ❌ Wrong: combineLatest fires on EVERY formState$ emission
// Each keystroke calls submitWithAuth — long before the user clicks submit
combineLatest([
  submitBtn$,  // user action — meant to be the trigger
  formState$,  // updates on every keystroke ← drives output here too
  authToken$,  // refreshes periodically   ← drives output here too
]).pipe(
  map(([_, form, token]) => submitWithAuth(form, token)),
  // submitWithAuth is called on each keystroke, not just on submit
).subscribe(handleResult);
```

---

## The Right Way

```typescript
import { fromEvent } from 'rxjs';
import { withLatestFrom, map, exhaustMap } from 'rxjs/operators';

const submit$ = fromEvent<MouseEvent>(submitBtn, 'click');

submit$.pipe(
  // Fires only on click — formState$ and authToken$ are read, not watched
  withLatestFrom(formState$, authToken$),
  // Tuple: [clickEvent, form, token] — ignore the event itself
  map(([_, form, token]) => buildRequest(form, token)),
  // exhaustMap blocks duplicate submissions while one is in flight
  exhaustMap(req => api.post(req)),
).subscribe(handleResult);
```

---

## Key Rule
> **Use `withLatestFrom` when a user action needs current state; use `combineLatest` only when output must update whenever any input changes.**