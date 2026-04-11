---
marp: true
theme: uncover
title: "Testing Operators in Isolation"
---

# Testing Operators in Isolation
> Without virtual time, every `debounceTime(300)` test holds your suite hostage for 300 real milliseconds — multiply by 50 tests and you have a 15-second suite.

---

## Core Concept
- `TestScheduler` provides a **virtual clock** — frames advance instantly, burning zero real milliseconds
- Marble strings encode full timelines: `-` = 1 frame, `a`–`z` = emissions, `|` = complete, `#` = error, `(ab)` = synchronous group
- `testScheduler.run()` opens the assertion context and auto-flushes virtual time after the callback returns
- `cold()` creates a cold Observable; `hot()` adds a shared timeline where `^` marks the subscription point
- **The rule:** every time-based operator (`debounceTime`, `throttleTime`, `delay`) accepts a `SchedulerLike` — always inject `TestScheduler` in tests

---

## How It Works

```typescript
import { TestScheduler } from 'rxjs/testing';
import { debounceTime } from 'rxjs';

const scheduler = new TestScheduler((actual, expected) =>
  expect(actual).toEqual(expected), // Vitest / Jest assertion
);

scheduler.run(({ cold, expectObservable }) => {
  // a and b arrive as a burst; c arrives after a 4-frame gap
  // frames:          0 1 2 3 4 5 6 7
  const keys$ = cold('a b - - - - c |', {}, scheduler);

  const result$ = keys$.pipe(
    debounceTime(3, scheduler), // ← inject virtual scheduler
  );

  // b@4: debounce settles 3 frames after b@1 (a was cancelled by b)
  // (c|)@7: source complete flushes the pending value synchronously
  expectObservable(result$).toBe('- - - - b - - (c|)');
});
```

---

## Common Mistake

```typescript
// ❌ WRONG — no scheduler injected; debounceTime uses real AsyncScheduler
it('debounces keystrokes', async () => {
  const subject = new Subject<string>();
  const results: string[] = [];

  subject.pipe(
    debounceTime(300), // ← implicit AsyncScheduler; wall-clock time runs
  ).subscribe(v => results.push(v));

  subject.next('a');
  subject.next('b');

  // Now the test must actually wait — 300ms of real time, every run
  await new Promise(r => setTimeout(r, 350));

  expect(results).toEqual(['b']); // passes, but the suite pays 300ms per case
});
```

---

## The Right Way

```typescript
import { TestScheduler } from 'rxjs/testing';
import { debounceTime } from 'rxjs';
import { test, expect } from 'vitest';

test('debounces keystrokes', () => {           // ← sync: no async/await needed
  const scheduler = new TestScheduler((actual, expected) =>
    expect(actual).toEqual(expected),
  );

  scheduler.run(({ cold, expectObservable }) => {
    const keys$ = cold('ab----c|');            // burst of a,b then c after gap

    const result$ = keys$.pipe(
      debounceTime(3, scheduler),              // ← virtual time, 0ms real cost
    );

    expectObservable(result$).toBe('----b--(c|)');
    // b emits at frame 4 (burst end + 3); c flushed when source completes @7
  });
});                                            // entire test completes in < 1ms
```

---

## Key Rule
> **Inject `TestScheduler` into every time-based operator — if an operator doesn't accept a scheduler argument, it is untestable by design and must be wrapped in a factory that does.**