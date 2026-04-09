---
title: "Operators Overview"
category: core
tags: [operators, overview, families, reference]
related: [Observable.md, ../patterns/index.md]
sources: 2
updated: 2026-04-08
---

# Operators Overview

> Pure functions that transform Observables — the vocabulary of reactive programming. Each operator takes an Observable and returns a new Observable without mutating the source.

## How Operators Work

```typescript
// An operator is: Observable<T> → Observable<R>
type OperatorFunction<T, R> = (source: Observable<T>) => Observable<R>;

// Applied via pipe()
source$.pipe(
  operator1(),
  operator2(),
  operator3()
);
```

`pipe()` composes them left to right. Each operator wraps the previous, creating a chain of Observables.

## Operator Selection Decision Tree

```
Q: Do you need to transform each value?           → map, scan, reduce
Q: Do you need to filter values?                   → filter, take, skip, distinctUntilChanged
Q: Do you need to trigger async work per value?    → switchMap, mergeMap, concatMap, exhaustMap
Q: Do you need to combine multiple streams?        → combineLatest, merge, zip, withLatestFrom
Q: Do you need to handle rate/time?                → debounceTime, throttleTime, delay, timeout
Q: Do you need to share a stream?                  → share, shareReplay
Q: Do you need to handle errors?                   → catchError, retry, retryWhen
```

## Creation Operators

| Operator | Description |
|----------|-------------|
| `of(...values)` | Emit values synchronously |
| `from(iterable/Promise/Observable)` | Convert to Observable |
| `fromEvent(target, event)` | DOM / Node.js events |
| `interval(ms)` | 0, 1, 2... on interval |
| `timer(delay, interval?)` | Delayed, optional repeat |
| `range(start, count)` | Numeric range |
| `defer(factory)` | Create Observable lazily per subscribe |
| `iif(condition, true$, false$)` | Conditional |
| `EMPTY` | Complete immediately |
| `NEVER` | Never emits or completes |
| `throwError(factory)` | Error immediately |
| `ajax(url)` | HTTP request |
| `webSocket(url)` | WebSocket connection |

## Transformation Operators

| Operator | Marble | Use case |
|----------|--------|----------|
| `map(fn)` | `a → f(a)` | Transform each value |
| `scan(fn, seed)` | Accumulate | Running total, state reduction |
| `reduce(fn, seed)` | Accumulate → complete | Final aggregation |
| `switchMap(fn)` | Cancel previous inner | Search typeahead, live query |
| `mergeMap(fn)` | Merge all inners | Parallel HTTP requests |
| `concatMap(fn)` | Queue inners | Sequential operations |
| `exhaustMap(fn)` | Ignore while active | Form submit, login |
| `expand(fn)` | Recursive | Tree traversal, pagination |
| `pluck(key)` | `obj → obj[key]` | Property extraction (deprecated, use `map`) |
| `bufferTime(ms)` | Collect into arrays | Batch processing |
| `bufferCount(n)` | Collect n into array | Batch by count |
| `window*` | Like buffer but Observable | High-frequency batching |
| `groupBy(fn)` | Split by key | Grouped streams |
| `pairwise()` | `[prev, curr]` | Diffs, deltas |
| `toArray()` | All values → array | Collect on complete |

## Filtering Operators

| Operator | Description |
|----------|-------------|
| `filter(pred)` | Emit only matching values |
| `take(n)` | First n values then complete |
| `takeLast(n)` | Last n values on complete |
| `takeUntil(notifier$)` | Until notifier emits |
| `takeWhile(pred)` | While predicate is true |
| `skip(n)` | Skip first n values |
| `skipUntil(notifier$)` | Skip until notifier |
| `skipWhile(pred)` | Skip while predicate |
| `first(pred?)` | First matching value |
| `last(pred?)` | Last matching value |
| `distinctUntilChanged(comp?)` | Skip duplicates |
| `distinctUntilKeyChanged(key)` | Skip if key unchanged |
| `debounceTime(ms)` | Emit after silence |
| `throttleTime(ms)` | Rate limit |
| `auditTime(ms)` | Emit last value in window |
| `sampleTime(ms)` | Sample on interval |
| `sample(notifier$)` | Sample when notifier emits |
| `elementAt(n)` | Nth value only |
| `ignoreElements()` | Only complete/error pass |
| `single(pred?)` | Assert exactly one value |

## Combination Operators

| Operator | Description |
|----------|-------------|
| `combineLatest([a$, b$])` | Latest from all when any emits — "stolen from spreadsheets" (Erik Meijer): like an Excel cell that recomputes when any input cell changes |
| `merge(a$, b$)` | Concurrent merge |
| `concat(a$, b$)` | Sequential — b$ after a$ completes |
| `zip([a$, b$])` | Pair nth from each |
| `forkJoin([a$, b$])` | All complete → last values |
| `withLatestFrom(b$)` | Sample b$ when source emits |
| `startWith(...values)` | Prepend sync values |
| `endWith(...values)` | Append sync values on complete |
| `race(a$, b$)` | First to emit wins |
| `switchAll()` | switchMap for higher-order |
| `mergeAll()` | mergeMap for higher-order |
| `concatAll()` | concatMap for higher-order |
| `exhaustAll()` | exhaustMap for higher-order |

## Error Handling Operators

| Operator | Description |
|----------|-------------|
| `catchError(fn)` | Replace error with Observable |
| `retry(n)` | Resubscribe on error N times |
| `retryWhen(fn)` | Custom retry logic |
| `onErrorResumeNext(...)` | Continue with next source on error |

## Multicasting Operators

| Operator | Description |
|----------|-------------|
| `share()` | `publish() + refCount()` |
| `shareReplay(n)` | Share + replay last n |
| `publish()` | Multicast with Subject |
| `publishBehavior(v)` | Multicast with BehaviorSubject |
| `publishReplay(n)` | Multicast with ReplaySubject |
| `multicast(Subject)` | Manual multicast control |

## Utility Operators

| Operator | Description |
|----------|-------------|
| `tap(fn)` | Side effects without mutation |
| `delay(ms)` | Delay all emissions |
| `delayWhen(fn)` | Per-value delay |
| `timeout(ms)` | Error if no emission in time |
| `timeoutWith(ms, fallback$)` | Switch to fallback on timeout |
| `timestamp()` | Wrap in `{value, timestamp}` |
| `timeInterval()` | Time between emissions |
| `finalize(fn)` | Teardown callback |
| `materialize()` | Wrap in Notification objects |
| `dematerialize()` | Unwrap Notification objects |
| `observeOn(scheduler)` | Move emissions to scheduler |
| `subscribeOn(scheduler)` | Move subscription to scheduler |

## Lossy vs Non-Lossy Operators

A third classification axis — orthogonal to both value/time-based and first/higher-order:

| | **Non-lossy** | **Lossy** |
|--|---------------|-----------|
| Definition | Every input appears in output | Some inputs are intentionally dropped |
| Value-based examples | `map`, `scan`, `pairwise`, `materialize` | `filter`, `distinctUntilChanged`, `take`, `skip` |
| Time-based examples | `delay`, `bufferTime`, `timestamp`, `timeInterval` | `debounceTime`, `throttleTime`, `sampleTime`, `auditTime` |

Lossy operators are not bugs — they are deliberate design choices for backpressure, rate-limiting, and deduplication. See [execution-phases](execution-phases.md) for composing lossiness intentionally.

## Value-Based vs Time-Based Operators

A second orthogonal axis for categorising operators:

| Category | What it operates on | Examples |
|----------|--------------------|---------| 
| **Value-based** | The content of emissions — transforms, filters, or aggregates data values regardless of timing | `map`, `filter`, `scan`, `reduce`, `distinct`, `take`, `skip`, `max`, `min` |
| **Time-based** | The timing and scheduling of emissions — controls when values are emitted, delayed, or sampled | `debounceTime`, `throttleTime`, `delay`, `timeout`, `auditTime`, `sampleTime`, `interval`, `timer` |

This axis is independent of first-order/higher-order. A `switchMap` that triggers a timer is both higher-order and time-based; a plain `map` is first-order and value-based.

Understanding this distinction helps select the right operator: if the problem is *what data arrives*, reach for value-based; if the problem is *when data arrives*, reach for time-based.

## First-Order vs Higher-Order Operators

All RxJS operators fall into one of two categories based on what they return:

| Category | Returns | Examples |
|----------|---------|---------|
| **First-order** | Simple values — transforms one value into another value | `map`, `filter`, `tap`, `scan`, `reduce` |
| **Higher-order** | Observables — transforms one value into an inner Observable, then flattens | `switchMap`, `mergeMap`, `concatMap`, `exhaustMap` |

### First-Order — Value In, Value Out

```typescript
source$.pipe(
	map(x => x * 2),        // number → number
	filter(x => x > 10),    // number → number (subset)
	tap(x => log(x)),       // number → number (side effect, pass-through)
);
```

First-order operators produce a **flat output stream** — same shape as the input stream, just with transformed values.

### Higher-Order — Value In, Observable Out (then flattened)

```typescript
source$.pipe(
	// string → Observable<Response>  — then automatically flattened to Response
	switchMap(query => http.get(`/api/search?q=${query}`)),
);
```

Higher-order operators:
1. Apply a `project` function: `value → Observable<R>`
2. Subscribe to the resulting inner Observable
3. Flatten the inner emissions into the output stream

The four higher-order mapping operators differ only in **how they manage concurrent inner Observables** — see the comparison table below.

## The Higher-Order Mapping Operators Compared

All four take `value => Observable` and flatten one level:

```
switchMap   — cancel previous inner when new outer arrives  (search)
mergeMap    — run all inners concurrently                   (parallel fetch)
concatMap   — queue inners, one at a time, in order         (sequential ops)
exhaustMap  — ignore new outer while inner is active        (submit button)
```

Choosing wrong here is the most common source of race conditions in RxJS. See [higher-order-operators](higher-order-operators.md) for the full deep-dive including marble diagrams, memory leak patterns, error handling inside inners, and `expand`. See [error-handling](../patterns/error-handling.md) for catchError patterns.

## Related

- [Observable](Observable.md) — what operators operate on
- [custom-operators](custom-operators.md) — building reusable custom operators with pipe()
- [operator-policies](operator-policies.md) — Eight-Policy Framework: formal specification of every operator
- [hot-cold](hot-cold.md) — how temperature affects operator behaviour (share, publish, defer)
- [index](../patterns/index.md) — operator recipes in context
- [common-mistakes](../debugging/common-mistakes.md) — operator misuse pitfalls
