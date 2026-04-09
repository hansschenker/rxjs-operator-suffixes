---
title: "ReplaySubject"
category: core
tags: [core, subject, replay, buffer, cache]
related: [Subject.md, BehaviorSubject.md, AsyncSubject.md]
sources: 0
updated: 2026-04-08
---

# ReplaySubject

> A Subject that records the last N emitted values and replays them to any new subscriber.

## Behaviour

```typescript
import { ReplaySubject } from 'rxjs';

const replay$ = new ReplaySubject<number>(3); // buffer size: 3

replay$.next(1);
replay$.next(2);
replay$.next(3);
replay$.next(4);

// Late subscriber gets the last 3 values immediately
replay$.subscribe(v => console.log(v));
// 2, 3, 4  (then future values as they come)
```

## Constructor Options

```typescript
// Buffer last N values
new ReplaySubject<T>(bufferSize?: number)

// Buffer by time window (ms)
new ReplaySubject<T>(bufferSize?, windowTime?)

// Last 5 values, but only from the last 1 second
new ReplaySubject<number>(5, 1000);
```

## ReplaySubject(1) vs BehaviorSubject

Both replay the latest single value to late subscribers, but differ:

| | `ReplaySubject(1)` | `BehaviorSubject` |
|--|---------------------|------------------|
| Initial value | Not required | Required |
| `.value` accessor | No | Yes |
| Emits to late sub before any value | Nothing | Initial value |

Use `ReplaySubject(1)` when:
- There may be no initial value
- You don't need synchronous `.value` access

Use `BehaviorSubject` when:
- State must always have a value
- You need synchronous reads via `.value`

## ReplaySubject(∞) — Full Replay

```typescript
// Buffer everything (use with care — unbounded growth)
const log$ = new ReplaySubject<string>();
```

Useful for event logs, audit trails, or late-loading views that need the full history.

## Use Cases

### Component that initializes late

```typescript
// Data arrives before component mounts
const data$ = new ReplaySubject<Data>(1);
apiCall().subscribe(data$);

// Component subscribes later — still gets the value
data$.subscribe(render);
```

### shareReplay equivalent

`shareReplay(N)` is essentially `pipe(share({ connector: () => new ReplaySubject(N) }))`. Understanding `ReplaySubject` explains how `shareReplay` works.

```typescript
// These are equivalent in behaviour (not identical internally)
source$.pipe(shareReplay(1));

const subject$ = new ReplaySubject<T>(1);
source$.subscribe(subject$);
const shared$ = subject$.asObservable();
```

## Pitfall: Memory Growth

An unbounded `ReplaySubject` grows indefinitely. Always specify a buffer size or window time unless you specifically need full history.

## Related

- [Subject](Subject.md) — base class
- [BehaviorSubject](BehaviorSubject.md) — requires initial value, has `.value`
- [AsyncSubject](AsyncSubject.md) — emits only on complete
