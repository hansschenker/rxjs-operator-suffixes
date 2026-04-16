---
module: 6
lesson: "6.3"
title: The three specialized Subject variants
key_insight: BehaviorSubject, ReplaySubject, and AsyncSubject each answer a different question about time — What is the current value? What were the last N values? What was the final value?
related: ["6.2", "6.4"]
---

## Hook

A plain Subject has no memory. Subscribe after all emissions have occurred and you receive nothing — not even a hint that the stream already ran. The three specialized variants add different shapes of temporal memory to solve three distinct use cases, and choosing the wrong variant produces bugs that are easy to miss in development but immediately visible in production.

## Insight

**`BehaviorSubject<T>(initialValue)`** stores the single most recent emission. New subscribers immediately receive the current value at the moment they subscribe. An initial value is required at construction time, which means it is never in an "empty" state. The `.value` getter returns the current emission synchronously without subscribing. Use it for anything with a meaningful notion of current state: the logged-in user, the active application theme, a feature flag, a form field's current value.

**`ReplaySubject<T>(bufferSize)`** stores the last N emissions in order. New subscribers receive all buffered values replayed immediately on subscription, then continue receiving live emissions. No initial value is required — it can start with an empty buffer. Use it for: recent event history, caching the last few search queries, giving a late-joining subscriber context about what just happened.

**`AsyncSubject<T>()`** stores nothing during the stream's active lifetime. It emits exactly one value — the last value received — and only when `complete()` is called. Before completion, subscribers receive nothing. Use it to represent the outcome of a one-shot async process where only the final result matters, not intermediate states.

Key gotcha: always set a finite buffer size on `ReplaySubject`. An unbounded `ReplaySubject` on a long-running stream accumulates every emission for the lifetime of the application and leaks memory in proportion to stream throughput.

## Example

```typescript
import { AsyncSubject, BehaviorSubject, ReplaySubject } from 'rxjs';

interface User { id: number; name: string; }
interface Config { theme: string; }

// BehaviorSubject — always has a current value
const currentUser$ = new BehaviorSubject<User | null>(null);
currentUser$.next({ id: 1, name: 'Alice' });
currentUser$.subscribe((u: User | null) => console.log(u));
// immediately logs: { id: 1, name: 'Alice' }

// ReplaySubject — last N values replayed to late subscribers (bounded buffer)
const recentPages$ = new ReplaySubject<string>(3);
recentPages$.next('/home');
recentPages$.next('/products');
recentPages$.next('/cart');
recentPages$.subscribe((page: string) => console.log(page));
// replays: /home, /products, /cart — then continues live

// AsyncSubject — only the final value, only on complete
const initResult$ = new AsyncSubject<Config>();
initResult$.subscribe((cfg: Config) => console.log('config:', cfg));
initResult$.next({ theme: 'dark' }); // buffered, not emitted yet
initResult$.next({ theme: 'light' }); // replaces previous, still buffered
initResult$.complete(); // now emits { theme: 'light' }
```

## Summary

- BehaviorSubject = current value; requires an initial value; `.value` getter available for synchronous reads
- ReplaySubject(n) = last N values replayed on subscription; always bound the buffer size to prevent memory leaks
- AsyncSubject = final value on complete; rarely used directly — prefer the `last()` operator on a regular stream

## Pitfall

Initializing a `BehaviorSubject` with `null` and not filtering it downstream. `BehaviorSubject<User | null>(null)` emits `null` immediately to every new subscriber before the real value loads. Consumers that do not handle `null` crash or render empty states. Either initialize with a meaningful default or use `filter((v): v is User => v !== null)` downstream.
