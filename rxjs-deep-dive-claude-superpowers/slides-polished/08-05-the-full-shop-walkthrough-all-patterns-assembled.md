---
marp: true
theme: uncover
title: "The full shop walkthrough: all patterns assembled"
---

# The full shop walkthrough: all patterns assembled
> Knowing operators in isolation breaks down in a real feature — the hard part is deciding which pattern governs which concern and how they wire together without creating a subscription tangle.

---

## Core Concept

- A single `Subject<Action>` is the **only entry point** — state transitions and side effects share one bus
- `scan(reducer, initial)` + `shareReplay(1)` is the **only state store** — never mutated with `.next()` directly
- Concurrency is operator choice: `switchMap` for live search, `exhaustMap` for checkout, `concatMap` for ordered cart ops
- Effects are pure pipelines — **Action In → async work → Action Out** — they never read or write state directly

> "One action bus, one state stream, many derived views — every pattern in the shop is a specialisation of this rule."

---

## How It Works

```typescript
// ─── INPUTS: user gestures dispatch into the shared bus ──────────────────────
const action$ = new Subject<Action>();

// ─── STATE: scan accumulates; shareReplay(1) multicasts ──────────────────────
const state$ = action$.pipe(
  scan(shopReducer, initialState),  // ← one place for all transitions
  startWith(initialState),
  shareReplay(1),                   // ← one live stream shared by every view
);

// ─── EFFECTS: each concern picks its concurrency operator ────────────────────
const search$   = action$.pipe(ofType('SEARCH'),
  debounceTime(300), switchMap(q => api.search(q).pipe(map(searchSuccess))));
const checkout$ = action$.pipe(ofType('CHECKOUT'),
  exhaustMap(c => api.order(c).pipe(map(orderConfirmed))));
const addItem$  = action$.pipe(ofType('ADD_ITEM'),
  concatMap(i  => api.reserve(i).pipe(map(itemReserved))));

// ─── OUTPUTS: effects loop back; views are pure derivations ──────────────────
merge(search$, checkout$, addItem$).subscribe(action$); // ← closes the loop
const products$ = state$.pipe(map(s => s.products));    // ← derived view output
const cart$     = state$.pipe(map(s => s.cart));
```

---

## Common Mistake

```typescript
// ❌ Fragmented state — one BehaviorSubject per concern, mutations everywhere
//    No single source of truth; concurrency guarded by ad-hoc boolean flags
class ShopComponent {
  products$ = new BehaviorSubject<Product[]>([]);
  cart$     = new BehaviorSubject<CartItem[]>([]);
  loading$  = new BehaviorSubject<boolean>(false); // flag instead of operator

  search(query: string): void {
    this.loading$.next(true);
    // Nested subscribe — leaks memory and ignores in-flight cancellation
    this.api.search(query).subscribe(results => {
      this.products$.next(results); // mutation scattered, not in any reducer
      this.loading$.next(false);
    });
  }

  checkout(): void {
    // No exhaustMap — double-click fires two concurrent orders
    this.api.order(this.cart$.getValue()).subscribe(res => {
      this.cart$.next([]);          // untraceable side effect, impossible to test
    });
  }
}
```

---

## The Right Way

```typescript
// ✅ One bus, one reducer — effects feed back into the same bus

const action$ = new Subject<Action>();

const state$: Observable<ShopState> = action$.pipe(
  scan(shopReducer, initialState), // pure reducer — all transitions in one place
  startWith(initialState),
  shareReplay(1),                  // multicast to all views without re-running
);

const searchEffect$ = action$.pipe(
  ofType('SEARCH'),
  debounceTime(300),
  switchMap(({ query }) =>         // cancels stale requests automatically
    api.search(query).pipe(
      map(searchSuccess),
      catchError(err => of(searchFailed(err))),
    )
  ),
);

const checkoutEffect$ = action$.pipe(
  ofType('CHECKOUT'),
  exhaustMap(({ cart }) =>         // ignores duplicate submits — no flag needed
    api.order(cart).pipe(
      map(orderConfirmed),
      catchError(err => of(orderFailed(err))),
    )
  ),
);

merge(searchEffect$, checkoutEffect$)
  .pipe(takeUntil(destroy$))
  .subscribe(action$);             // loop closes — effects feed back into the bus
```

---

## Key Rule
> **Pick the concurrency operator first — `switchMap`, `exhaustMap`, or `concatMap` — route its output back into the action bus, and let the reducer handle everything else.**