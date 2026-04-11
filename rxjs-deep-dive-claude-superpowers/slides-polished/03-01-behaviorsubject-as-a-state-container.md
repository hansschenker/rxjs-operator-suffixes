---
marp: true
theme: uncover
title: "BehaviorSubject as a State Container"
---

# BehaviorSubject as a State Container
> Without a framework, state lives in scattered mutable variables — BehaviorSubject gives every subscriber a consistent, synchronised snapshot the moment they connect.

---

## Core Concept
- Requires an **initial value** at construction — it is never empty
- Stores the **most recent value** internally at all times
- New subscribers **immediately receive the current value** on subscribe
- Exposes `.value` for synchronous reads outside the stream pipeline
- > "Any new subscriber **immediately receives** the current value on subscribe."

---

## How It Works

```typescript
const state$ = new BehaviorSubject<number>(0); // holds: 0

state$.subscribe(v => console.log('A:', v)); // A: 0  ← fires immediately
state$.next(1);                              // A: 1
state$.next(2);                              // A: 2

// Late subscriber joins — gets current value, not silence
state$.subscribe(v => console.log('B:', v)); // B: 2  ← replays current
state$.next(3);                              // A: 3   B: 3
```

---

## Common Mistake

```typescript
// ❌ Using a plain Subject as state — late subscribers miss everything
const state$ = new Subject<State>();

state$.next({ items: [], loading: false }); // emits before anyone subscribes

// Component mounts after first emission — receives NOTHING
state$.subscribe(state => renderUI(state)); // blank screen: Subject has no memory
// Subject is an event bus, not a state container — wrong primitive entirely.
```

---

## The Right Way

```typescript
interface State { items: Item[]; loading: boolean; error: string | null; }
const initial: State = { items: [], loading: false, error: null };

class Store {
  private _state$ = new BehaviorSubject<State>(initial);
  // ← expose as Observable to block external .next() calls
  readonly state$: Observable<State> = this._state$.asObservable();

  dispatch(updater: (s: State) => State): void {
    // ← immutable spread: never mutate the existing reference
    this._state$.next(updater(this._state$.value));
  }
}

// Derive a slice — skips re-render when reference is unchanged
const items$ = store.state$.pipe(
  map(s => s.items),
  distinctUntilChanged() // ← only emits when items reference changes
);
```

---

## Key Rule
> **Always encapsulate BehaviorSubject in a class, expose it as `Observable`, and update it with immutable spreads — external code must never call `.next()` directly.**