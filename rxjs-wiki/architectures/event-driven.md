---
title: "Event-Driven Architecture with RxJS"
category: architectures
tags: [architectures, event-bus, event-driven, decoupled, micro-frontend]
related: [index.md, mvu.md, ../core/Subject.md]
sources: 0
updated: 2026-04-08
---

# Event-Driven Architecture with RxJS

> Using a typed RxJS event bus as the communication backbone for decoupled modules or micro-frontends.

## Overview

In event-driven architecture, modules communicate through an event bus — they publish events they produce and subscribe to events they care about. No direct coupling between modules.

RxJS `Subject` is a natural event bus. A typed event bus with `ofType` filtering gives you the decoupling of an event bus with full TypeScript type safety.

## Typed Event Bus

```typescript
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

// Define all event types in a discriminated union
type AppEvent =
  | { type: 'user:login'; payload: { userId: string; role: string } }
  | { type: 'user:logout' }
  | { type: 'cart:item-added'; payload: { productId: string; qty: number } }
  | { type: 'cart:checkout-started' }
  | { type: 'order:placed'; payload: { orderId: string } }
  | { type: 'notification:show'; payload: { message: string; level: 'info' | 'warn' | 'error' } };

// Helper to extract event payload type
type EventOfType<T extends AppEvent['type']> = Extract<AppEvent, { type: T }>;

class EventBus {
  private bus$ = new Subject<AppEvent>();

  publish<T extends AppEvent>(event: T): void {
    this.bus$.next(event);
  }

  on<T extends AppEvent['type']>(
    type: T
  ): Observable<EventOfType<T>> {
    return this.bus$.pipe(
      filter((e): e is EventOfType<T> => e.type === type)
    );
  }

  // Multiple types
  onAny<T extends AppEvent['type']>(
    ...types: T[]
  ): Observable<EventOfType<T>> {
    return this.bus$.pipe(
      filter((e): e is EventOfType<T> => types.includes(e.type as T))
    );
  }

  get all$(): Observable<AppEvent> {
    return this.bus$.asObservable();
  }
}

export const eventBus = new EventBus();
```

## Module Communication

```typescript
// auth-module.ts
eventBus.on('user:login').subscribe(({ payload }) => {
  setCurrentUser(payload.userId);
  loadUserPermissions(payload.role);
});

// cart-module.ts
fromEvent(addToCartBtn, 'click').pipe(
  map(() => getProductId())
).subscribe(productId => {
  eventBus.publish({ type: 'cart:item-added', payload: { productId, qty: 1 } });
});

// analytics-module.ts
eventBus.all$.subscribe(event => {
  analytics.track(event.type, 'payload' in event ? event.payload : {});
});

// notification-module.ts
eventBus.on('order:placed').subscribe(({ payload }) => {
  eventBus.publish({
    type: 'notification:show',
    payload: { message: `Order ${payload.orderId} placed!`, level: 'info' }
  });
});
```

## Micro-Frontend Communication

```typescript
// Each micro-frontend gets the shared bus instance
// (via shared singleton, window object, or module federation)

// Shell registers the bus
window.__APP_EVENT_BUS__ = new EventBus();

// MFE 1 (product catalog)
const bus = window.__APP_EVENT_BUS__ as EventBus;
bus.publish({ type: 'cart:item-added', payload: { productId: 'SKU-123', qty: 1 } });

// MFE 2 (cart)
bus.on('cart:item-added').subscribe(({ payload }) => addToCart(payload));
```

## Request/Response Pattern Over Event Bus

For request-response semantics:

```typescript
class RequestBus {
  private bus$ = new Subject<AppEvent>();
  private responses$ = new Subject<{ correlationId: string; data: unknown }>();

  request<T>(event: AppEvent, timeoutMs = 5000): Observable<T> {
    const correlationId = crypto.randomUUID();
    const response$ = this.responses$.pipe(
      filter(r => r.correlationId === correlationId),
      map(r => r.data as T),
      take(1),
      timeout(timeoutMs)
    );

    this.bus$.next({ ...event, correlationId } as any);
    return response$;
  }

  respond(correlationId: string, data: unknown): void {
    this.responses$.next({ correlationId, data });
  }
}
```

## Event Log / Audit Trail

```typescript
// Persist all events for debugging
eventBus.all$.pipe(
  scan((log, event) => [...log, { ...event, timestamp: Date.now() }], [] as any[]),
  debounceTime(1000)
).subscribe(log => localStorage.setItem('eventLog', JSON.stringify(log)));

// Replay events from log (for debugging)
const log = JSON.parse(localStorage.getItem('eventLog') ?? '[]');
from(log).pipe(
  concatMap(event => timer(0).pipe(map(() => event))) // async to allow UI to settle
).subscribe(event => eventBus.publish(event as AppEvent));
```

## Comparison vs Direct Module Coupling

| | Event Bus | Direct coupling |
|--|-----------|----------------|
| Module isolation | Complete | None |
| Type safety | Via discriminated union | Via direct import |
| Testing | Mock bus easily | Mock all dependencies |
| Discoverability | Event catalog | Import graph |
| Ordering guarantees | Publish order | Call order |
| Dead code detection | Harder | Easy |

## Related

- [index](index.md) — architecture comparison
- [Subject](../core/Subject.md) — the Subject primitive used as bus
- [effects](../patterns/effects.md) — effects integrate well with event bus
