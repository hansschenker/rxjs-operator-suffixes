---
title: "Hot and Cold Observables"
category: core
tags: [core, hot, cold, observable, subscription-side-effects, temperature, multicast, publish, defer]
related: [Observable.md, Subject.md, subjects-guide.md, operators.md, ../patterns/state-management.md]
sources: 1
updated: 2026-04-08
---

# Hot and Cold Observables

> The precise definition: **hot** = does not cause subscription side effects. **cold** = may cause subscription side effects. Everything else (always-running, broadcasting, shared) follows from this.

## The Common-Sense Description (and Why It Falls Short)

The folk definition:
- **Hot** — always running, broadcasts to all subscribers (e.g. `fromEvent`)
- **Cold** — starts fresh per subscriber, generates its own values (e.g. `from`, `interval`)

This is useful but imprecise. An Observable created by `Replay` + `refCount` can be hot *and* cold simultaneously depending on when you subscribe and what kind of side effect you care about. Dave Sexton's subscription side-effect definition eliminates the ambiguity.

## The Precise Definition

### Side Effects — The Primitive Concept

The *primary* effect of subscribing to an Observable is mechanical:
- Register an observer for callbacks
- Add the observer to the internal list
- Create a Subscription for unsubscription

Anything **beyond** this is a **subscription side effect**:
- Calling `next()` / `error()` / `complete()`
- Scheduling async work (starting a timer, making an HTTP request, reading a file)
- Allocating memory, running CPU-intensive computation
- Mutating a field
- Composing with inner Observables that themselves cause side effects

### Temperature Defined

| Temperature | Definition |
|-------------|------------|
| **Cold** | *May* cause subscription side effects — a new execution is created per subscriber |
| **Hot** | Does *not* cause subscription side effects — subscribing just registers the observer |

**When in doubt, assume cold.** Assuming hot when actually cold means duplicate side effects. Assuming cold when actually hot means you apply `publish()` unnecessarily — harmless.

## Practical Examples

### Cold Observables — new execution per subscriber

```typescript
import { interval, from, ajax } from 'rxjs';

// Each subscriber gets its own independent timer
const counter$ = interval(1000);
counter$.subscribe(v => console.log('A:', v)); // 0, 1, 2...
counter$.subscribe(v => console.log('B:', v)); // 0, 1, 2... (separate execution)

// Each subscriber triggers its own HTTP request
const data$ = ajax.getJSON('/api/users');
data$.subscribe(users => console.log('first consumer', users));
data$.subscribe(users => console.log('second consumer', users)); // 2 requests!
```

### Hot Observables — shared execution

```typescript
import { fromEvent } from 'rxjs';

// DOM events exist independently — subscribing just registers a listener
const clicks$ = fromEvent(document, 'click');
clicks$.subscribe(e => console.log('A clicked'));
clicks$.subscribe(e => console.log('B clicked')); // same click, both fire
```

## Temperature and Multicasting

When you share a cold Observable via `share()` or `shareReplay()`, the cold observable's subscription side effects become **connection side effects** — they fire once on first subscription (or `connect()`), not per-subscriber.

```typescript
import { interval } from 'rxjs';
import { share, shareReplay } from 'rxjs/operators';

// Without sharing: 2 separate timers
const cold$ = interval(1000);
cold$.subscribe(v => console.log('A:', v));
cold$.subscribe(v => console.log('B:', v));

// With share: 1 shared timer, both subscribers see same values
const hot$ = interval(1000).pipe(share());
hot$.subscribe(v => console.log('A:', v));
hot$.subscribe(v => console.log('B:', v));
```

### The Replay Nuance

`ReplaySubject`-backed multicasting can be simultaneously hot *and* cold depending on the side-effect type and subscription time:

- **Hot** with respect to notifications that already fired (no duplicate HTTP requests)
- **Cold** with respect to replayed notifications for a late subscriber (the missed values are generated specifically for them)

This is why "warm" is sometimes used — but Dave Sexton argues it's unnecessary if you think in terms of *which* side effects are duplicated vs. broadcasted.

## Temperature Conversion

### Cold → Hot (`publish` / `share`)

```typescript
import { interval } from 'rxjs';
import { publish, refCount, share, shareReplay } from 'rxjs/operators';

// Option 1: share() — most common shorthand
const hot1$ = interval(1000).pipe(share());

// Option 2: publish() + refCount() — explicit connectable
const hot2$ = interval(1000).pipe(
	publish(),
	refCount(),
);

// Option 3: shareReplay(1) — share + late-subscriber replay
const hot3$ = interval(1000).pipe(shareReplay(1));
```

`refCount()` subscribes to the underlying cold Observable when the first subscriber arrives, and unsubscribes when the last subscriber leaves. A new first subscriber restarts the cold Observable.

### Hot → Cold (`defer`)

`defer` wraps a factory function — the factory runs per-subscription, adding a subscription side effect to an otherwise side-effect-free source:

```typescript
import { defer } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// Makes the hot-ish ajax call happen per-subscriber (cold behaviour)
const coldRequest$ = defer(() => ajax.getJSON('/api/users'));
```

## The Four Combinations (Source + Temperature Decision)

Based on Dave Sexton's framework for deciding whether to use a Subject:

| Source type | Desired temperature | Approach |
|-------------|--------------------|--------------------------------------------|
| External (event/task) | Cold | Use source as-is, or `defer()` |
| External (event/task) | Hot | `publish()`, `share()`, or `shareReplay()` |
| Local (generated internally) | Cold | Use `of`, `range`, `interval`, `create` |
| Local (generated internally) | Hot | Use a `Subject` (or variant) |

A `Subject` is correct only in the last quadrant — local source, hot required. See [subjects-guide](subjects-guide.md) for the full Subject decision framework.

## Built-In Observable Temperatures

| Observable | Temperature |
|------------|-------------|
| `of()`, `from()`, `range()`, `interval()`, `timer()` | Cold |
| `generate()`, `throwError()` | Cold |
| `fromEvent()`, `fromEventPattern()` | Hot |
| `Subject`, `BehaviorSubject`, `ReplaySubject`, `AsyncSubject` | Hot |
| `share()` | Hot (while subscribed) |
| `shareReplay(n)` | Hot + cold for late-join replay |
| `publish()` before `connect()` | Hot (broadcasting, deferred connection) |
| `ajax()`, `webSocket()` | Cold (request per subscriber) |

## Why This Matters for Composition

When you reference the same Observable twice in a query — e.g. feeding it to two separate `withLatestFrom` arms — you need to decide whether duplicate subscription side effects are desired:

```typescript
const expensive$ = ajax.getJSON('/api/data'); // cold: HTTP per subscriber

// ✗ Two separate HTTP requests
combineLatest([expensive$, expensive$]).subscribe(...);

// ✓ One shared request
const shared$ = expensive$.pipe(shareReplay(1));
combineLatest([shared$, shared$]).subscribe(...);
```

The `retry` operator deliberately wants duplicate subscription side effects — it wants to re-run the HTTP request on each retry. Cold Observables enable this naturally.

## Unicast vs Multicast

Hot/cold and unicast/multicast are closely related but distinct concepts:

| | Unicast | Multicast |
|--|---------|-----------|
| Producers | 1 per subscriber | 1 shared |
| Subscribers | 1 | N |
| Corresponds to | Cold Observable (by default) | Hot Observable / Subject |
| Analogy | Movie on-demand | Live TV broadcast |

**Unicast** (cold): each `subscribe()` creates an independent execution. `interval(1000)` starts a fresh timer per subscriber.

**Multicast** (hot): all subscribers share one execution. A `Subject` maintains one internal list of observers — pushing to the Subject reaches all of them simultaneously.

Converting unicast → multicast is what `share()`, `shareReplay()`, and `Subject`-based bridges do.

## Related

- [Observable](Observable.md) — cold is the default; Observable contract
- [subjects-guide](subjects-guide.md) — when to use a Subject (hot, local source)
- [operators](operators.md) — `share`, `shareReplay`, `publish`, `refCount`, `defer`
- [state-management](../patterns/state-management.md) — BehaviorSubject as shared hot state
