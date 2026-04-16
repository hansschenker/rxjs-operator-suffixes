---
module: 6
lesson: "6.1"
title: Unicast vs multicast — the consumer behavior distinction
key_insight: Hot/Cold describes the producer; Unicast/Multicast describes the consumer. A cold Observable is always unicast. Understanding both axes independently prevents the most common multicasting bugs.
---

## Hook

Most RxJS explanations treat hot/cold and unicast/multicast as the same concept, using the terms interchangeably. They are distinct axes, and confusing them leads to bugs that are nearly impossible to reason about. You can have a hot Observable that is still unicast, and understanding why is the key to multicasting correctly.

## Insight

**Hot/Cold** is about the producer. Cold: the producer is created fresh inside each `subscribe()` call — every subscriber triggers a brand-new execution context. Hot: the producer exists independently and is already running before any subscriber arrives. **Unicast/Multicast** is about the consumer relationship, not the producer. Unicast: one producer serves exactly one consumer — each subscriber gets their own private, isolated execution. Multicast: one producer serves N consumers simultaneously — all subscribers share one execution context and receive the same emissions.

The relationship between these axes is asymmetric. Cold Observables are always unicast by definition: a new producer per subscriber equals a private producer equals a unicast relationship. Hot Observables can be either. A Subject with only one subscriber is hot but unicast. A Subject with many subscribers is hot and multicast. `share()` converts cold-unicast to hot-multicast: it creates a Subject internally, wires the source Observable through it, and allows multiple subscribers to share one source execution. This is the distinction that matters in practice. Choosing unicast vs multicast determines whether work — an HTTP request, a WebSocket connection, a computation — is duplicated once per subscriber or shared across all of them.

## Example

```typescript
import { ajax } from 'rxjs/ajax';
import { share } from 'rxjs/operators';

interface User {
	id: number;
	name: string;
}

// Cold-unicast: two subscriptions = two separate HTTP requests
const user$ = ajax.getJSON<User>('/api/user');
user$.subscribe((u: User) => console.log('A:', u)); // request 1 fires
user$.subscribe((u: User) => console.log('B:', u)); // request 2 fires independently

// Hot-multicast: one HTTP request, result shared across all subscribers
const sharedUser$ = user$.pipe(share());
sharedUser$.subscribe((u: User) => console.log('A:', u)); // triggers the single request
sharedUser$.subscribe((u: User) => console.log('B:', u)); // joins the shared execution
```

The first version silently hits the server twice. The second version hits it once. The difference is the axis you chose on the consumer side — not whether the Observable is hot or cold.

## Summary

- Hot/Cold = producer axis; Unicast/Multicast = consumer axis — two independent dimensions
- Cold always implies unicast; hot can be either unicast or multicast depending on subscriber count
- `share()` converts cold-unicast to hot-multicast; use it when work must not be duplicated per subscriber
