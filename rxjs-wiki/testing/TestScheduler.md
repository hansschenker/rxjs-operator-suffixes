---
title: "TestScheduler"
category: testing
tags: [testing, TestScheduler, virtual-time, scheduler]
related: [marble-testing.md, index.md, ../core/Scheduler.md]
sources: 0
updated: 2026-04-08
---

# TestScheduler

> RxJS's built-in virtual-time scheduler — makes time-dependent operators (debounceTime, delay, interval) fast and deterministic in tests.

## Import

```typescript
import { TestScheduler } from 'rxjs/testing';
```

## Constructor

```typescript
const scheduler = new TestScheduler(
  (actual: ReadonlyArray<TestMessage>, expected: ReadonlyArray<TestMessage>) => {
    // Your assertion — use your test library's equality check
    expect(actual).toEqual(expected);
  }
);
```

The callback is called when `expectObservable` assertions are verified. In Vitest:

```typescript
const scheduler = new TestScheduler((actual, expected) =>
  expect(actual).toEqual(expected)
);
```

## `run()` — The Main API

```typescript
scheduler.run(helpers => {
  const { cold, hot, time, expectObservable, expectSubscriptions, flush } = helpers;
  // Write tests here
});
```

All marble notation inside `run()` uses **1 frame = 1ms**.

## `cold(marbles, values?, error?)` — Cold Observable

```typescript
// No values map — emits strings matching characters
const source$ = cold('--a--b--|');
// emits: 'a' at 20ms, 'b' at 50ms, complete at 80ms

// With values map
const source$ = cold('--a--b--|', { a: 42, b: 100 });

// With error
const source$ = cold('--a--#', { a: 1 }, new Error('boom'));
```

## `hot(marbles, values?, error?)` — Hot Observable

Hot Observables have a subscription point (`^`) and can emit before subscription:

```typescript
// Default: subscription at position 0 in the marble string
const source$ = hot('--a--b--|');

// Explicit subscription marker
const source$ = hot('a--^--b--|');
// 'a' emitted at -30ms (before subscription), 'b' at 20ms
```

## `time(marbles)` — Parse Duration

```typescript
// Convert a marble string to a number of virtual ms
const delay = time('--|');    // 20ms
const wait = time('-----|');  // 50ms

// Use in operators
source$.pipe(debounceTime(time('--|'))); // 20ms debounce
```

## `expectObservable(observable$, subscriptionMarbles?)` — Assert Emissions

```typescript
scheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('-a--b--|');
  const result$ = source$.pipe(map(x => x.toUpperCase()));

  // Assert output marble and values
  expectObservable(result$).toBe('-A--B--|');

  // With custom subscription window
  expectObservable(result$, '^ !').toBe('-A');
  //                              ^ subscribe at 0, ! unsubscribe at 3
});
```

`.toBe(marble, values?, error?)` — the assertion.

## `expectSubscriptions(subscriptions)` — Assert Subscribe/Unsubscribe Timing

```typescript
scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
  const source$ = cold('--a--b--|');
  const result$ = source$.pipe(take(1));

  expectObservable(result$).toBe('--(a|)');
  expectSubscriptions(source$.subscriptions).toBe('^-!');
  //                                               ^ sub at 0ms
  //                                                - 1 frame
  //                                                 ! unsub at 20ms
});
```

For multiple subscriptions (e.g. `shareReplay`):

```typescript
expectSubscriptions(source$.subscriptions).toBe(['^--!', '----^---!']);
```

## `flush()` — Manual Flush

Normally `run()` flushes automatically at the end. Call `flush()` manually to check intermediate state:

```typescript
scheduler.run(({ cold, expectObservable, flush }) => {
  const source$ = cold('-a-b-c|');
  expectObservable(source$).toBe('-a-b-c|');

  flush(); // assertions evaluated here — if they fail, test fails now
  // ... more code
});
```

## Testing Time-Based Operators

### `debounceTime`

```typescript
test('debounceTime emits after silence', () => {
  scheduler.run(({ cold, expectObservable }) => {
    // Frames: 0  1  2  3  4  5  6  7  8  9
    const src = cold('-a-b-------c|');
    //                         ↑ 3 frames of silence after b → emit b
    //                                  ↑ c emitted then completed
    const result$ = src.pipe(debounceTime(3));
    expectObservable(result$).toBe('-------b---(c|)');
  });
});
```

### `throttleTime`

```typescript
test('throttleTime passes first, suppresses rest in window', () => {
  scheduler.run(({ cold, expectObservable }) => {
    const src = cold('-abcde-|');
    const result$ = src.pipe(throttleTime(3));
    expectObservable(result$).toBe('-a---e-|');
    // a passes, b/c/d suppressed (within 3 frames of a), e passes
  });
});
```

### `delay`

```typescript
test('delay shifts all emissions', () => {
  scheduler.run(({ cold, expectObservable }) => {
    const src = cold('-a--|');
    const result$ = src.pipe(delay(5));
    expectObservable(result$).toBe('------a--|');
    //                              01234
    //                                   ^ a now at 6ms (1 + 5)
  });
});
```

### `interval`

```typescript
test('interval emits at specified period', () => {
  scheduler.run(({ expectObservable }) => {
    const result$ = interval(10).pipe(take(3));
    expectObservable(result$).toBe('----------0---------1---------(2|)');
    //                              0123456789 (10ms)   (20ms)    (30ms+complete)
  });
});
```

## Legacy `expectObservable` (Outside run())

The older API (pre-`run()`) uses `flush()` explicitly and frames of 10ms:

```typescript
// Legacy — avoid in new code
const testScheduler = new TestScheduler(assert);
const source$ = testScheduler.createColdObservable('-a--b|');
const result$ = source$.pipe(map(x => x.toUpperCase()));
testScheduler.expectObservable(result$).toBe('-A--B|');
testScheduler.flush();
```

Prefer `run()` — it's clearer, supports time notation, and has better TypeScript inference.

## Complete Test Example with Vitest

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { TestScheduler } from 'rxjs/testing';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

describe('Search stream', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  test('debounces input and cancels stale requests', () => {
    scheduler.run(({ cold, hot, expectObservable }) => {
      const input$ = hot('  -a-b-----------c--|', {
        a: 'r', b: 'rx', c: 'rxjs',
      });

      const mockSearch = (q: string) =>
        cold('  ---r|', { r: [`${q}_result`] });

      const result$ = input$.pipe(
        debounceTime(5),
        distinctUntilChanged(),
        switchMap(q => mockSearch(q).pipe(
          catchError(() => of([]))
        ))
      );

      // 'a' and 'b' arrive within 5ms → debounced to 'rx'
      // 'rx' search starts, then 'c' arrives → cancelled
      // 'rxjs' search completes
      expectObservable(result$).toBe('-------------------r--|', {
        r: ['rxjs_result'],
      });
    });
  });
});
```

## Related

- [marble-testing](marble-testing.md) — marble syntax reference
- [index](index.md) — testing overview
- [Scheduler](../core/Scheduler.md) — Scheduler concepts
