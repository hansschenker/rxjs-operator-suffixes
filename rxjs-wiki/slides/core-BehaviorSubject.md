---
marp: true
theme: uncover
title: "BehaviorSubject"
---

# BehaviorSubject

> A Subject that requires an initial value and always emits the current value to new subscribers — the standard primitive for holding reactive state.

---

## Behaviour

- Requires an **initial value** at construction
- Stores the **most recent value** at all times
- New subscribers **immediately receive** the current value
- Exposes `.value` for synchronous reads

```typescript
const state$ = new BehaviorSubject<number>(0); // initial: 0
state$.subscribe(v => console.log('A:', v));   // A: 0 (immediate)
state$.next(1);                                // A: 1
state$.next(2);                                // A: 2
state$.subscribe(v => console.log('B:', v));   // B: 2 (gets current)
state$.next(3);                                // A: 3, B: 3
```

---

## Synchronous Value Access

- `.value` reads current state without subscribing
- Use **sparingly** — bypasses reactive data flow
- Prefer deriving downstream Observables with `pipe()`

```typescript
const count$ = new BehaviorSubject<number>(0);
count$.next(5);
console.log(count$.value); // 5
```

---

## As State Container

- Natural choice for **application state**
- Use immutable updates via spread: `{ ...s, loading: true }`
- Slice state with `pipe(map(...), distinctUntilChanged())`

```typescript
// interface State { items: Item[]; loading: boolean; error: string | null }
// const initialState: State = { items: [], loading: false, error: null }
const state$ = new BehaviorSubject<State>(initialState);

function dispatch(updater: (s: State) => State): void {
  state$.next(updater(state$.value));
}

const items$ = state$.pipe(
  map(s => s.items),
  distinctUntilChanged()
);
dispatch(s => ({ ...s, loading: true }));
```

---

## With scan (Redux-style)

- Alternative to direct BehaviorSubject mutation — no `.next()` calls on state$
- Purer **MVU pattern** — reducer is a pure function
- More testable than direct BehaviorSubject mutation
- BehaviorSubject approach is simpler for smaller apps

```typescript
const action$ = new Subject<Action>();
const state$ = action$.pipe(
  scan(reducer, initialState),
  startWith(initialState),
  shareReplay(1)
);
```

---

## Exposing as Observable

- Always expose BehaviorSubject as `Observable` to **prevent external mutation**
- Keep the `BehaviorSubject` private; expose `asObservable()`
- Provides a clean encapsulation boundary in a Store/Service class

```typescript
class Store {
  private _state$ = new BehaviorSubject<State>(initialState);
  readonly state$: Observable<State> = this._state$.asObservable();

  update(updater: (s: State) => State): void {
    this._state$.next(updater(this._state$.value));
  }
}
```

---

## Comparison

| | Subject | BehaviorSubject | ReplaySubject(1) |
|--|---------|-----------------|-----------------|
| Initial value required | No | **Yes** | No |
| Late subscriber gets | Nothing | **Current value** | Last emitted |
| `.value` accessor | No | **Yes** | No |
| Use case | Event bus | **State** | Cache/late-join |
