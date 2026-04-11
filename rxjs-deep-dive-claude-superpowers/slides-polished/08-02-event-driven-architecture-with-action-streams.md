---
marp: true
theme: uncover
title: "Event-driven architecture with action streams"
---

# Event-driven architecture with action streams
> Modules call each other directly — so every internal refactor ripples outward and unit tests silently become integration tests.

---

## Core Concept

- An **event bus** (`Subject<AppEvent>`) lets modules publish and consume events without importing each other
- **Discriminated unions** make the event catalog exhaustive: every event type and its exact payload shape is known at compile time
- A typed `on<T>(type)` method uses a **type-predicate filter** to narrow `Observable<AppEvent>` → `Observable<EventOfType<T>>`
- Modules are producers, consumers, or both — the bus is the **only** shared reference
- > _"No direct coupling between modules"_ — the bus owns the contract

---

## How It Works

```typescript
// ── Event catalog (the shared contract) ──────────────────────────────────
type AppEvent =
  | { type: 'user:login';      payload: { userId: string; role: string } }
  | { type: 'cart:item-added'; payload: { productId: string; qty: number } }
  | { type: 'order:placed';    payload: { orderId: string } };

type EventOfType<T extends AppEvent['type']> = Extract<AppEvent, { type: T }>;

// ── Bus: single Subject behind a typed interface ──────────────────────────
class EventBus {
  private bus$ = new Subject<AppEvent>();

  publish<T extends AppEvent>(event: T): void { this.bus$.next(event); }

  // type predicate narrows stream: Observable<AppEvent> → Observable<EventOfType<T>>
  on<T extends AppEvent['type']>(type: T): Observable<EventOfType<T>> {
    return this.bus$.pipe(
      filter((e): e is EventOfType<T> => e.type === type)
    );
  }

  get all$(): Observable<AppEvent> { return this.bus$.asObservable(); }
}

// ── Producer (cart-module) — zero import from any peer module ─────────────
bus.publish({ type: 'cart:item-added', payload: { productId: 'SKU-1', qty: 1 } });

// ── Consumer (analytics-module) — payload fully typed, no cast ───────────
bus.on('cart:item-added')
  .subscribe(({ payload }) => track(payload));
//             ^^^^^^^ inferred: { productId: string; qty: number }
```

---

## Common Mistake

```typescript
// ❌ Untyped bus — every subscriber must cast and guard manually
const bus$ = new Subject<{ type: string; payload: any }>();

bus$.subscribe(event => {
  if (event.type === 'cart:item-added') {
    // payload is `any` — rename the field in the producer and this
    // compiles fine but silently breaks at runtime. No exhaustiveness check.
    addToCart(event.payload.productId);
  }
});

// ❌ Even worse: direct cross-module import — hard coupling disguised as convenience
import { cartState } from '../cart/cart.state';
import { authService } from '../auth/auth.service';

// Cart now depends on auth's internal API.
// Refactor auth → cart breaks. Tree-shake cart → auth leaks in.
cartState.applyDiscount(authService.getCurrentUserRole());
```

---

## The Right Way

```typescript
// ✅ Typed on() — payload is inferred from the discriminated union, no `as` cast
bus.on('order:placed').pipe(
  // { orderId: string } — TypeScript proves this, not you
  switchMap(({ payload }) => orderService.fetchDetails(payload.orderId)),
  takeUntil(destroy$)           // ← prevent leaks on SPA module teardown
).subscribe(details => renderOrder(details));

// ✅ Cross-cutting concern — subscribes to all events without coupling to any module
bus.all$.pipe(
  takeUntil(destroy$)
).subscribe(event =>
  analytics.track(event.type, 'payload' in event ? event.payload : {})
);

// ✅ Audit trail — accumulate events reactively, debounce writes
bus.all$.pipe(
  scan(
    (log, event) => [...log, { ...event, ts: Date.now() }],
    [] as Array<AppEvent & { ts: number }>
  ),
  debounceTime(1000),           // ← batch localStorage writes
  takeUntil(destroy$)
).subscribe(log => localStorage.setItem('eventLog', JSON.stringify(log)));
```

---

## Key Rule

> **Type your event bus with a discriminated union — the event catalog is the only shared contract between modules, so renaming or removing an event type must be a compile error everywhere, not a runtime surprise.**