---
module: 6
lesson: "6.5"
title: connectable() — manual control over when the producer starts
key_insight: connectable() exposes the producer lifecycle directly — you control when it starts and stops. share() and shareReplay() are presets built on connectable() that automate this lifecycle via refCount.
related: ["6.4", "2.5"]
---

## Hook

`share()` and `shareReplay()` are convenient — they manage the producer lifecycle automatically. But "automatic" means "on rules you cannot change." When those rules are wrong for your situation, `connectable()` is the primitive that lets you write your own rules. Everything else in the multicasting layer is a preset built on top of it.

## Insight

`connectable(source$, { connector: () => new Subject() })` returns a `ConnectableObservable`. Subscribers can register on it without triggering the source. The source starts only when you explicitly call `.connect()`. This decoupling of subscription from execution is the entire point: you decide when the producer starts, independently of when consumers arrive.

This gives you three capabilities that `share()` cannot provide. First, start the producer before any subscriber arrives — warm up a WebSocket connection during application initialization so the first subscriber never waits for the handshake. Second, keep the producer running after all subscribers have left — maintain a server-sent event connection even when all components are unmounted, so the next component that subscribes joins a live stream rather than restarting the connection. Third, stop the producer manually at a specific lifecycle event unrelated to subscriber count.

`share()` is mechanically equivalent to `connectable(source$, { connector: () => new Subject() })` with `refCount()` added — it wraps `connectable()` and adds the automatic connect/disconnect logic as a convenience. `shareReplay({ bufferSize: n, refCount: true })` is equivalent to `connectable(source$, { connector: () => new ReplaySubject(n) })` with `refCount()`. Understanding `connectable()` means understanding what `share()` and `shareReplay()` are actually doing underneath the surface — there are no more layers to peel back.

## Example

```typescript
import { Subject, connectable, interval } from 'rxjs';
import { take, tap } from 'rxjs/operators';

const source$ = interval(1000).pipe(
	take(10),
	tap((n: number) => console.log('source tick:', n)),
);

const multicast$ = connectable(source$, {
	connector: () => new Subject<number>(),
	resetOnDisconnect: false,
});

// Both subscribers register before the source has started — no emissions yet
multicast$.subscribe((n: number) => console.log('A:', n));
multicast$.subscribe((n: number) => console.log('B:', n));

// Source starts explicitly — both A and B receive values from tick 0
const connection = multicast$.connect();

// Later: manually stop the producer regardless of subscriber count
setTimeout(() => {
	connection.unsubscribe();
	console.log('producer stopped');
}, 5000);
```

The key moment is `.connect()`. Until that line runs, the source is silent even though two subscribers are waiting. After that line, both receive every tick. This is the lifecycle control that `share()` hides and `connectable()` exposes.

## Summary

- `connectable()` = manual producer lifecycle; `.connect()` starts the source independent of subscriber count
- `share()` = `connectable()` + automatic refCount; connects on first subscriber, disconnects on last
- Use `connectable()` when you need to start the producer before subscribers arrive, or hold it alive after they leave

## Pitfall

Calling `connect()` before any subscribers have attached. Emissions that occur between `connect()` and the first `subscribe()` are lost permanently — the connectable Observable has no buffer by default. Either use `shareReplay` if late subscribers need buffered values, or attach all subscribers before calling `connect()`.
