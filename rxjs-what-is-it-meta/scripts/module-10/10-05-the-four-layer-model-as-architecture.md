---
module: 10
lesson: "10.5"
title: The 4-Layer Model as a complete architecture
key_insight: The 4-Layer Model — Values, Time, Sharing, Flattening — is not a taxonomy for organising operators. It is a diagnostic framework: identify which layer the problem is in, and the fix becomes obvious.
---

## Hook

You have worked through 10 modules and encountered roughly 50 distinct concepts — operators, patterns, scheduling, multicasting, error handling, facades. Without a unifying mental model, those concepts are a list. With the 4-Layer Model, they form a compass. When a stream behaves unexpectedly in production, the diagnostic question is not "which of 50 operators is wrong?" It is "which of four layers is wrong?" — and that question has an answer in seconds.

## Insight

The four layers correspond to the four independent dimensions of stream behaviour.

**Layer 1 — Values**: What data is being emitted? Wrong layer 1 behaviour: the stream emits the wrong value, in the wrong shape, with the wrong calculation. Operators that live here: `map`, `filter`, `scan`, `reduce`, `distinctUntilChanged`, `startWith`, `pluck`. Diagnostic signal: the value in a `tap` does not match what you expect, but the timing looks correct.

**Layer 2 — Time**: When is it emitting? Wrong layer 2 behaviour: the stream emits at the wrong moment, too often, not often enough, or with the wrong delay. Operators that live here: `debounceTime`, `throttleTime`, `auditTime`, `sampleTime`, `delay`, `timeout`, `buffer`, `window`. Diagnostic signal: the value is correct but the timing is wrong.

**Layer 3 — Sharing**: Who receives the emissions, and when do they start receiving them? Wrong layer 3 behaviour: multiple subscribers see different values, a late subscriber misses the initial state, or a stream executes its HTTP call once per subscriber when it should execute once for all. Operators and constructs that live here: `share`, `shareReplay`, `Subject`, `BehaviorSubject`, `ReplaySubject`, `connectable`. Diagnostic signal: the value and timing are correct for one subscriber but wrong for another.

**Layer 4 — Flattening**: When multiple inner Observables are running concurrently, which one wins? Wrong layer 4 behaviour: stale HTTP responses overwrite fresh ones, form submissions double-fire, requests queue when they should cancel or cancel when they should queue. Operators that live here: `switchMap`, `mergeMap`, `concatMap`, `exhaustMap`. Diagnostic signal: the value and timing are correct in isolation but wrong when multiple events fire quickly.

Designing a new feature uses the same four layers as a checklist in sequence. Define value transformations first (Layer 1). Add rate limiting if the source fires faster than downstream can handle (Layer 2). Decide whether the result needs to be multicast (Layer 3). Identify any nested async operations and choose the correct flattening operator (Layer 4).

## Example

A production dashboard shows stale data after the user logs in and then navigates away and back. Diagnostic walkthrough:

```typescript
// BEFORE — Layer 3 bug: shareReplay without refCount retains a dead subscription
const dashboardData$: Observable<DashboardData> = http.get<DashboardData>('/api/dashboard').pipe(
	shareReplay(1), // bufferSize shorthand — refCount defaults to false
	// refCount: false means the source subscription NEVER unsubscribes,
	// so the cached value is from the original HTTP call, even after the
	// source would naturally re-execute on a new subscription.
);

// AFTER — Layer 3 fix: refCount: true unsubscribes when all consumers unsubscribe,
// so a new subscription triggers a fresh HTTP call and fresh data.
const dashboardData$: Observable<DashboardData> = http.get<DashboardData>('/api/dashboard').pipe(
	shareReplay({ bufferSize: 1, refCount: true }),
);
```

The value was correct (Layer 1 was fine). The timing was correct (Layer 2 was fine). The flattening was not involved (Layer 4 was fine). The problem was Layer 3: a retained multicast subscription serving cached data to new subscribers. The layer model made that diagnosis a 30-second analysis, not a two-hour debugging session.

## Summary

- Layer 1 (Values): wrong data emitted — check `map`, `filter`, `scan`, `distinctUntilChanged`
- Layer 2 (Time): wrong timing — check `debounceTime`, `throttleTime`, `buffer`, `delay`
- Layer 3 (Sharing): wrong subscriber behaviour — check `share`, `shareReplay` config, `Subject` variant
- Layer 4 (Flattening): wrong concurrency — check the flattening operator: `switchMap` vs `exhaustMap` vs `concatMap`
- Use as a diagnostic compass, not a filing system — identify the layer, and the fix narrows to a small set of operators
