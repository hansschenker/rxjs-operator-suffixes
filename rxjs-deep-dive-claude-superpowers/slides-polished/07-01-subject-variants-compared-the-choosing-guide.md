---
marp: true
theme: uncover
title: "Subject variants compared: the choosing guide"
---

# Subject variants compared: the choosing guide
> Developers default to `BehaviorSubject` for everything — then fight forced initial values, null-guards on event buses, and late subscribers that silently see stale or missing data.

---

## Core Concept

- A Subject is simultaneously an **Observable** and an **Observer** — it multicasts every `.next()` call to all current subscribers in one shot
- The four variants differ by exactly one dimension: **what a late subscriber receives**
- `Subject` → nothing · `BehaviorSubject` → current value · `ReplaySubject(N)` → last N values · `AsyncSubject` → last value only on `complete()`
- > *"A Subject is the right answer only when: you are the producer, the stream must be hot, and there is no existing source to convert."*
- Always expose a Subject via `.asObservable()` — consumers must never call `.next()` from outside

---

## How It Works

```typescript
// Subject — no memory; values emitted before subscribe are lost
const bus$ = new Subject<number>();
bus$.next(1);                              // ← lost, zero subscribers
bus$.subscribe(v => console.log('A', v));
bus$.next(2);                             // → A: 2

// BehaviorSubject — late subscriber immediately gets current value
const state$ = new BehaviorSubject<number>(0); // initial value required
state$.next(1);
state$.subscribe(v => console.log('B', v)); // → B: 1  (synchronously, on subscribe)
state$.next(2);                             // → B: 2

// ReplaySubject(N) — late subscriber gets last N values replayed
const cache$ = new ReplaySubject<number>(2);
cache$.next(1); cache$.next(2); cache$.next(3);
cache$.subscribe(v => console.log('C', v)); // → C: 2, C: 3  (immediately)

// AsyncSubject — emits ONLY the last value, ONLY after complete()
const result$ = new AsyncSubject<number>();
result$.next(1); result$.next(2); result$.complete();
result$.subscribe(v => console.log('D', v)); // → D: 2  (immediately)
```

---

## Common Mistake

```typescript
// ❌ BehaviorSubject used as an event bus
// Forces a semantically meaningless null initial value.
// Every new subscriber silently fires null — masking timing bugs.
const buttonClick$ = new BehaviorSubject<MouseEvent | null>(null);

buttonClick$.subscribe(event => {
  if (event) handleClick(event); // null-guard is the smell — this is wrong
});

// ❌ Plain Subject used for shared state
// A component subscribing after the first emission sees nothing.
// You're forced to manually re-emit current state on every new subscriber.
const currentUser$ = new Subject<User>();
// ...component mounts here — gets no user, renders blank screen
// until the *next* emission
currentUser$.subscribe(user => renderProfile(user));
```

---

## The Right Way

```typescript
// ✅ Match the variant to the late-subscriber contract

// No history needed — plain Subject for events / lifecycle signals
const action$ = new Subject<Action>();
const destroy$ = new Subject<void>();

// Current state always required — BehaviorSubject, safely encapsulated
class Store {
  private readonly _state$ = new BehaviorSubject<State>(initialState);

  // Read-only outside — consumers cannot call .next() externally
  readonly state$: Observable<State> = this._state$.asObservable();

  dispatch(action: Action): void {
    // Controlled write through a pure reducer
    this._state$.next(reducer(this._state$.value, action));
  }
}

// Buffer for late-joining consumers (e.g. live log feed)
const feed$ = new ReplaySubject<LogEntry>(50); // ← retains last 50 entries
webSocket$.pipe(takeUntil(destroy$)).subscribe(feed$);

// Single async result — AsyncSubject mirrors a resolved Promise
const config$ = new AsyncSubject<Config>();
fetchConfig().subscribe(config$); // emits once when fetchConfig completes
```

---

## Key Rule

> **Choose the Subject variant by what a late subscriber must see: nothing → `Subject`, current state → `BehaviorSubject`, last N values → `ReplaySubject(N)`, final result only → `AsyncSubject` — `BehaviorSubject` is not the default, it is one specific tool.**