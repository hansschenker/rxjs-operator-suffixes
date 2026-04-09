---
title: "Marble Testing"
category: testing
tags: [testing, marble, marble-diagrams, hot, cold, time]
related: [TestScheduler.md, index.md]
sources: 0
updated: 2026-04-08
---

# Marble Testing

> Expressing Observable behaviour as ASCII diagrams — the most readable and deterministic way to test time-based RxJS code.

## Marble Syntax

Each character represents **one virtual frame** (10ms in `run()` mode):

| Character | Meaning |
|-----------|---------|
| `-` | One frame passes, no emission |
| `a`–`z`, `A`–`Z` | Emission of named value |
| `\|` | Complete |
| `#` | Error |
| `^` | Subscription point (hot only) |
| `!` | Unsubscription point |
| `(ab)` | Synchronous group — `a` and `b` emitted in same frame |
| ` ` | Ignored (whitespace for readability) |

### Examples

```
'-a--b--c--|'        // a at 10ms, b at 40ms, c at 70ms, complete at 100ms
'---#'               // error at 30ms
'---(a|)'            // a and complete synchronously at 30ms
'a--b--c'            // no completion (infinite)
'(abc|)'             // a, b, c, complete — all synchronous at frame 0
```

## TestScheduler run() Mode

The `run()` mode (RxJS 6+) uses **1 frame = 1ms** for `time` notation in operators like `debounceTime`:

```typescript
import { TestScheduler } from 'rxjs/testing';

const scheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

scheduler.run(({ cold, hot, expectObservable, expectSubscriptions, flush }) => {
  // Test code here
});
```

## Cold Observables

A cold Observable starts at subscription time. `cold()` creates one from a marble string:

```typescript
scheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('--a--b--|', { a: 1, b: 2 });
  //                    ^ subscription starts here (frame 0)

  expectObservable(source$).toBe('--a--b--|', { a: 1, b: 2 });
});
```

Values default to the character itself (string) if no values map provided:

```typescript
cold('-a-b-c|')  // emits 'a', 'b', 'c'
cold('-a-b-c|', { a: 1, b: 2, c: 3 })  // emits 1, 2, 3
```

## Hot Observables

A hot Observable exists before subscription. `^` marks the subscription point:

```typescript
scheduler.run(({ hot, expectObservable }) => {
  // Source emits a at -20ms (before sub), b at 10ms, c at 50ms
  const source$ = hot('--a--b----c--|', { a: 1, b: 2, c: 3 });
  //                    ^  <- subscription is at frame 0
  // subscriber sees:  -----b----c--|  (misses a)

  expectObservable(source$).toBe('-----b----c--|', { b: 2, c: 3 });
});
```

## `expectObservable`

```typescript
scheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('-a-b-c|');

  // Assert what the result Observable emits
  expectObservable(source$.pipe(map(x => x.toUpperCase()))).toBe('-A-B-C|');

  // With subscription timing
  expectObservable(source$, '^ !').toBe('-a-b');
  //                              ^   sub at 0ms
  //                                ^ unsub at 5ms
});
```

## Testing Operators

```typescript
describe('debounceTime', () => {
  test('emits last value after silence', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('-a-b-----c|');
      const result$ = source$.pipe(debounceTime(3));
      //                   '-a-b-----c|'
      // debounce 3ms means emit b after 3ms silence, c on complete
      expectObservable(result$).toBe('--------b--(c|)');
    });
  });
});

describe('switchMap', () => {
  test('cancels previous inner Observable on new outer emission', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const outer$ = cold('-a---b-|');
      const innerA$ = cold('--x--x|');  // would emit at +2, +5
      const innerB$ = cold('--y|');     // emits at +2

      const result$ = outer$.pipe(
        switchMap(v => v === 'a' ? innerA$ : innerB$)
      );

      // a triggers innerA (-x--x|), b arrives at 4ms cancelling innerA
      // b triggers innerB (--y|)
      expectObservable(result$).toBe('-------y|');
      //                              1234567
    });
  });
});
```

## Testing `mergeMap` vs `switchMap` vs `concatMap`

```typescript
// These marble tests document the difference clearly

// switchMap — cancels previous
outer$:  '-a---b-|'
innerA$: '---x|'    // triggered by a
innerB$: '---y|'    // triggered by b (cancels innerA after 2 frames)
result:  '-------y|'

// mergeMap — concurrent
outer$:  '-a---b-|'
inner$:  '---x|'    // both run concurrently
result:  '----x--x|'

// concatMap — sequential
outer$:  '-a---b-|'
inner$:  '---x|'    // b waits for a's inner to complete
result:  '----x---x|'
```

## Testing Errors

```typescript
scheduler.run(({ cold, expectObservable }) => {
  const source$ = cold('--a--#', { a: 1 }, new Error('oops'));
  const result$ = source$.pipe(
    catchError(err => of('default'))
  );

  expectObservable(result$).toBe('--a--(d|)', { a: 1, d: 'default' });
});
```

## Testing Subscriptions

`expectSubscriptions` asserts when a cold Observable was subscribed and unsubscribed:

```typescript
scheduler.run(({ cold, expectObservable, expectSubscriptions }) => {
  const source$ = cold('--a--b--|');
  const result$ = source$.pipe(take(1));

  expectObservable(result$).toBe('--(a|)');
  expectSubscriptions(source$.subscriptions).toBe('^-!');
  //                                               ^  subscribed at 0
  //                                                - one frame
  //                                                 ! unsubscribed at 2
});
```

## Values Map

When emission values aren't single characters:

```typescript
const values = { a: { id: 1, name: 'Alice' }, b: { id: 2, name: 'Bob' } };
const source$ = cold('--a--b--|', values);
expectObservable(result$).toBe('--A--B--|', {
  A: { id: 1, name: 'ALICE' },
  B: { id: 2, name: 'BOB' },
});
```

## Common Patterns

### Test complete effect pipeline

```typescript
test('search effect debounces and switches', () => {
  scheduler.run(({ cold, hot, expectObservable }) => {
    const actions$ = hot('-a--b-----c', {
      a: { type: 'SEARCH', payload: 'rx' },
      b: { type: 'SEARCH', payload: 'rxj' },
      c: { type: 'SEARCH', payload: 'rxjs' },
    });

    const results$ = searchEffect(actions$);

    // b is debounced away (arrives within 3ms of a)
    // a's in-flight request is cancelled when c arrives
    expectObservable(results$).toBe('----------r', {
      r: { type: 'SEARCH_RESULTS', payload: mockResults }
    });
  });
});
```

## Related

- [TestScheduler](TestScheduler.md) — full TestScheduler API reference
- [index](index.md) — testing overview and vitest setup
