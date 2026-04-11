---
marp: true
theme: uncover
title: "scan + reducer = MVU in 10 lines"
---

# scan + reducer = MVU in 10 lines
> Shared state mutated by scattered `.next()` calls turns untraceable — `scan` + a pure reducer gives every state transition a name, a location, and a history.

---

## Core Concept
- `scan` is `reduce` for streams: emits **every intermediate accumulation**, not just the final value
- A **reducer** is a pure function: `(state: S, action: A) => S` — always returns a new object, never mutates
- A `Subject<Action>` is the **action bus** — the single entry point for every state change
- `startWith(initialState)` guarantees new subscribers immediately receive current state
- `shareReplay(1)` multicasts the derived `state$` so all components see the same snapshot
- **"The reducer is the only place in the codebase permitted to define state transitions."**

---

## How It Works

```
   action$  --[INCREMENT]------[INCREMENT]------[RESET]------>
                    scan(reducer, { count: 0 })
   state$   --{ count: 1 }----{ count: 2 }----{ count: 0 }--->
                 ^                  ^                ^
                 emits every        intermediate      accumulation
```

`scan` calls `reducer(prevState, action)` on each emission and **threads the result forward as the next accumulator** — state lives in the stream, not in a variable.

---

## Common Mistake

```typescript
// ❌ Wrong: state transition logic is scattered at every call site
const state$ = new BehaviorSubject<State>(initialState);

incrementBtn.addEventListener('click', () => {
	// Caller must know HOW to compute the next state — logic leaks out of the store
	state$.next({ ...state$.value, count: state$.value.count + 1 });
	//           ^^^^^^^^^^^^^^^^^ synchronous .value read breaks reactive contracts
});

resetBtn.addEventListener('click', () => {
	state$.next(initialState); // "where does reset logic live?" — everywhere and nowhere
});

// No action names. No history. No time-travel. No single source of truth.
```

---

## The Right Way

```typescript
import { Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';

type Action = { type: 'INCREMENT' } | { type: 'DECREMENT' } | { type: 'RESET' };
type State  = { count: number };

const initialState: State = { count: 0 };

// Pure reducer — owns ALL state transition logic in one place
const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case 'INCREMENT': return { ...state, count: state.count + 1 };
		case 'DECREMENT': return { ...state, count: state.count - 1 };
		case 'RESET':     return initialState;
	}
};

const action$ = new Subject<Action>();

const state$ = action$.pipe(
	scan(reducer, initialState), // reducer called once per action; result becomes next accumulator
	startWith(initialState),     // emit before the first action arrives — no cold-start gap
	shareReplay(1),              // all subscribers share one execution; late subs get current state
);

const dispatch = (action: Action): void => action$.next(action);
```

---

## Key Rule
> **State transitions belong exclusively in the reducer — dispatch a named action, never `.next()` a hand-computed state object.**