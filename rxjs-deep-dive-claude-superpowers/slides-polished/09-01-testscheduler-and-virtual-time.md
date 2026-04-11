The rxjs-explain skill is for single operator deep-dives saved to files — it doesn't apply here. Generating the Marp deck directly from the provided wiki source.

---
marp: true
theme: uncover
title: "TestScheduler and virtual time"
---

# TestScheduler and virtual time
> Real timers make async RxJS tests slow, flaky, and non-deterministic — TestScheduler collapses all virtual time into a single synchronous assertion.

---

## Core Concept

- **TestScheduler** swaps `asyncScheduler`'s real clock for a virtual one — zero real milliseconds pass during the test
- The `run()` callback is the entire test universe: virtual time only advances when the marble engine demands it
- Marble notation: each character = **1ms virtual frame**; `-` = silence, `|` = complete, `#` = error
- Use `300ms` shorthand inline to skip long silences without typing 300 dashes
- > **"Inside `run()`, you control time — the test finishes in microseconds regardless of the virtual delay."**

---

## How It Works

```typescript
import { TestScheduler } from 'rxjs/testing';
import { delay } from 'rxjs/operators';

const scheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected); // plug in any assertion library
});

scheduler.run(({ cold, expectObservable }) => {
  // cold() creates a cold Observable from a marble string
  // '-' = 1ms silence frame; letters = values emitted at that frame
  const source$ = cold('-a--b--|');
  //                    ^ a@1ms  b@4ms  |@7ms

  // delay(20) shifts every emission right by 20 virtual frames
  expectObservable(source$.pipe(delay(20))).toBe('20ms -a--b--|');
  //                                              ^^^^ shorthand for 20 dashes
});
// ← runs synchronously; completes in microseconds
```

---

## Common Mistake

```typescript
// WRONG — real wall-clock time inside a test
it('debounces keystrokes by 300ms', (done) => {
  const results: string[] = [];
  const input$ = new Subject<string>();

  input$.pipe(debounceTime(300)).subscribe({
    next: v => {
      results.push(v);
      expect(results).toEqual(['hello']);
      done(); // ❌ test actually waits 300ms real time every single run
    }             // a suite of 50 debounce tests = 15 seconds
  });

  input$.next('h');
  input$.next('hello');
  // jest.useFakeTimers() looks like a fix, but jest.advanceTimersByTime()
  // does not reliably flush RxJS's internal scheduler queue — it silently
  // passes while results stays empty
});
```

---

## The Right Way

```typescript
import { TestScheduler } from 'rxjs/testing';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

describe('search input', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  it('only emits the last value after 300ms silence', () => {
    scheduler.run(({ cold, expectObservable }) => {
      // 'a'@0ms resets; 'b'@1ms starts the 300ms window → fires at t=301ms
      const input$  = cold('ab 300ms |');  // source completes at t=302ms
      const expected =     '301ms b 1ms |'; // b emitted at 301ms, complete at 302ms

      // ✅ TestScheduler auto-patches asyncScheduler inside run() — no extra config
      expectObservable(input$.pipe(debounceTime(300))).toBe(expected);
    });
  });
});
```

---

## Key Rule

> **Always test time-based RxJS operators with `TestScheduler.run()` — never with `done` callbacks, real `setTimeout`, or `jest.useFakeTimers()`.**