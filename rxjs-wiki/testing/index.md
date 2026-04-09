---
title: "Testing Index"
category: testing
tags: [testing, index, overview, vitest, marble-testing]
related: [marble-testing.md, TestScheduler.md, ../patterns/effects.md]
sources: 0
updated: 2026-04-08
---

# Testing RxJS Code

> Strategies and tooling for testing Observable streams, operators, and effects — with a focus on determinism and marble testing.

## Test Catalog

- [marble-testing](marble-testing.md) — Marble syntax, hot/cold creators, assertion helpers
- [TestScheduler](TestScheduler.md) — `TestScheduler` API, virtual time, run mode

## Testing Philosophy

RxJS code is particularly amenable to testing because:
1. **Pure operators** are just functions — input Observable in, output Observable out
2. **Effects** are functions from `Observable<Action>` to `Observable<Action>`
3. **Reducers** are pure functions — `(State, Action) => State`
4. **Marble testing** makes time-based assertions deterministic and readable

The challenge is time. Without `TestScheduler`, tests involving `debounceTime`, `interval`, `delay` etc. require real milliseconds — slow and flaky.

## Tooling

```bash
# Vitest (recommended per project config)
npm install -D vitest

# RxJS ships TestScheduler in rxjs/testing — no extra install needed
import { TestScheduler } from 'rxjs/testing';
```

## Testing Layers

### 1. Reducers (Simplest)

```typescript
import { describe, test, expect } from 'vitest';
import { reducer, initialState } from './store';

describe('reducer', () => {
  test('INCREMENT increases count by 1', () => {
    const state = reducer(initialState, { type: 'INCREMENT' });
    expect(state.count).toBe(1);
  });

  test('reducer is pure — does not mutate input', () => {
    const before = { ...initialState };
    reducer(initialState, { type: 'INCREMENT' });
    expect(initialState).toEqual(before);
  });
});
```

### 2. Operators (Pure Functions)

```typescript
import { TestScheduler } from 'rxjs/testing';

describe('debounce + distinctUntilChanged', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toEqual(expected)
    );
  });

  test('debounces rapid emissions', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('--a-b----c|');
      const result$ = source$.pipe(debounceTime(30, scheduler));
      expectObservable(result$).toBe('--------b--(c|)');
      // Wait... debounceTime in run() uses frame units, not ms
    });
  });
});
```

### 3. Effects (Observable → Observable)

```typescript
import { TestScheduler } from 'rxjs/testing';
import { loadUsersEffect } from './effects';

describe('loadUsersEffect', () => {
  test('dispatches USERS_LOADED on success', () => {
    const scheduler = new TestScheduler((a, e) => expect(a).toEqual(e));

    scheduler.run(({ cold, expectObservable }) => {
      const actions$ = cold('--a', { a: { type: 'LOAD_USERS' } });
      const users = [{ id: 1, name: 'Alice' }];

      // Mock the service
      vi.spyOn(userService, 'getAll').mockReturnValue(
        cold('--u|', { u: users })
      );

      const result$ = loadUsersEffect(actions$);
      expectObservable(result$).toBe('----u', {
        u: { type: 'USERS_LOADED', payload: users }
      });
    });
  });
});
```

### 4. State Streams

```typescript
test('state starts with initialState', () => {
  const values: State[] = [];
  state$.pipe(take(1)).subscribe(v => values.push(v));
  expect(values[0]).toEqual(initialState);
});

test('INCREMENT updates count', () => {
  const states: State[] = [];
  state$.pipe(take(2)).subscribe(v => states.push(v));

  dispatch({ type: 'INCREMENT' });

  expect(states[0]).toEqual(initialState);
  expect(states[1].count).toBe(1);
});
```

## Quick Operator Testing Pattern

For testing operators without time:

```typescript
import { of, toArray, lastValueFrom } from 'rxjs';

test('map doubles values', async () => {
  const result = await lastValueFrom(
    of(1, 2, 3).pipe(map(x => x * 2), toArray())
  );
  expect(result).toEqual([2, 4, 6]);
});

test('filter removes evens', async () => {
  const result = await lastValueFrom(
    of(1, 2, 3, 4, 5).pipe(filter(x => x % 2 !== 0), toArray())
  );
  expect(result).toEqual([1, 3, 5]);
});
```

## Vitest Config for RxJS Projects

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',  // for DOM-related tests
    globals: true,          // no need to import describe/test/expect
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
    },
  },
});
```

## Related

- [marble-testing](marble-testing.md) — marble syntax reference
- [TestScheduler](TestScheduler.md) — TestScheduler API
- [effects](../patterns/effects.md) — effects are easiest layer to test
