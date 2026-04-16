---
module: 2
lesson: "2.1"
title: What really happens when you subscribe
key_insight: Calling subscribe() doesn't listen to an Observable — it creates a brand new execution of it. This single fact prevents the most common category of RxJS bugs.
related: ["1.3", "2.3", "3.3"]
---

## Hook

Most developers think of `subscribe()` as "start listening to an Observable." That mental model is wrong — and it is the reason duplicate HTTP requests, race conditions, and unexpected state appear in RxJS applications. The Observable was not waiting for you. It does not even exist as a running thing until you call `subscribe()`. You do not join a stream — you start one.

## Insight

An Observable is a blueprint — a function that describes work but does not perform it. The function you pass to `new Observable()` runs only when someone subscribes. Calling `subscribe()` executes that blueprint from scratch, creating a completely independent execution for that subscriber alone. Every separate `subscribe()` call is a separate execution with its own state, its own timer, its own HTTP request. The Observable itself holds no state between subscriptions.

Contrast this with a Promise: a Promise starts executing at the moment it is created, before any `.then()` is attached. An Observable is the opposite — nothing runs until `subscribe()` is called, and every call creates a fresh run. This is what the RxJS docs mean by "lazy": the work is deferred until demanded.

The practical consequence is profound. Subscribe to an HTTP Observable twice and you fire two HTTP requests. Subscribe to `interval(1000)` twice and you get two independent timers. There is no shared producer unless you explicitly create one. This design is intentional — it makes Observables pure, predictable, and safe to pass around as values — but it surprises developers who still carry the Promise mental model.

## Example

The most common place this bites developers is a service that exposes an HTTP Observable. Two components inject the service and call `subscribe()` independently. Two network requests fire.

```typescript
import { ajax } from 'rxjs/ajax';
import { shareReplay } from 'rxjs/operators';

interface User {
	id: number;
	name: string;
}

const data$ = ajax.getJSON<User>('/api/user');

// Two separate subscriptions = two separate HTTP requests
data$.subscribe((user: User) => console.log('Subscriber A:', user)); // HTTP request 1
data$.subscribe((user: User) => console.log('Subscriber B:', user)); // HTTP request 2 — surprise!

// Fix: share one execution across all subscribers
const sharedData$ = data$.pipe(
	shareReplay({ bufferSize: 1, refCount: true }),
);

sharedData$.subscribe((user: User) => console.log('A:', user)); // HTTP request fires once
sharedData$.subscribe((user: User) => console.log('B:', user)); // receives cached result
```

`shareReplay({ bufferSize: 1, refCount: true })` converts the cold Observable into a hot, multicasting one. The first `subscribe()` triggers the single HTTP request. The second subscriber receives the replayed result immediately. One request, two consumers.

## Summary

- Observable = blueprint; `subscribe()` = execution — every call creates a new independent run
- Two subscriptions to the same HTTP Observable fire two HTTP requests — this is by design, not a bug
- Use `share()` or `shareReplay({ bufferSize: 1, refCount: true })` to share one execution across multiple subscribers

## Pitfall

Subscribing to an HTTP Observable in two components expecting them to share one request. Every `subscribe()` call creates a fresh producer execution — two subscribes fire two HTTP requests. The fix is `shareReplay({ bufferSize: 1, refCount: true })` to share one execution across multiple consumers.
