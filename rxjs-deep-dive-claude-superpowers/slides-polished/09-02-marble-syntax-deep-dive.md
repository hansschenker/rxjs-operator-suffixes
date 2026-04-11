---
marp: true
theme: uncover
title: "Marble Syntax Deep Dive"
---

# Marble Syntax Deep Dive
> Time-based RxJS tests written with real timers are slow, flaky, and unreadable — marble syntax makes timing explicit, deterministic, and instant.

---

## Core Concept
- Marble strings are ASCII timelines passed to `TestScheduler.run()`
- **Each character = exactly 10 virtual milliseconds** — no real time ever elapses
- `-` = 10 ms idle · `a`–`z` = value emission · `|` = complete · `#` = error
- `()` = synchronous group — multiple values emitted in the same frame
- `^` = subscription point (hot observables) · `!` = explicit unsubscription point
- > "In `TestScheduler.run()`, every character in a marble string represents exactly 10 virtual milliseconds — including dashes, letters, and spaces."

---

## How It Works

```typescript
testScheduler.run(({ cold, expectObservable }) => {
  //  -  = 10ms idle    |  = complete    #  = error
  // a-z = emit value  () = same frame

  const source$ = cold('--a--b--|');
  //                        ↑  ↑  └── complete at 80ms (frame 8)
  //                       20ms 50ms

  const result$ = source$.pipe(delay(20)); // +2 frames to every event

  expectObservable(result$).toBe('----a--b--|');
  //                                   ↑  ↑  └── complete at 100ms (frame 10)
  //                                 40ms 70ms
});
```

---

## Common Mistake

```typescript
// Wrong: real timers — each test burns real wall-clock time
it('debounces search input', done => {
  const subject = new Subject<string>();
  const result$ = subject.pipe(debounceTime(300));
  const emitted: string[] = [];

  result$.subscribe(v => emitted.push(v));
  subject.next('a');
  subject.next('b');

  // Flaky in CI: blocks 350ms of real time per test.
  // A suite with 20 debounce tests = 7 seconds of idle waiting.
  setTimeout(() => {
    expect(emitted).toEqual(['b']);
    done();
  }, 350);
});
```

---

## The Right Way

```typescript
it('debounces search input', () => {
  new TestScheduler((actual, expected) =>
    expect(actual).toEqual(expected)
  ).run(({ hot, expectObservable }) => {
    const keys$ = hot('-a-b------------|');
    //                  ↑ ↑              — each char = 10ms
    //                10ms 30ms          — 'b' resets the debounce timer

    const result$ = keys$.pipe(
      debounceTime(50) // 5 virtual frames — no real time passes
    );

    // 'b' at 30ms + 50ms silence → emit 'b' at 80ms (frame 8)
    expectObservable(result$).toBe('--------b------|');
    //                              0       8      15 (frames ×10ms)
  });
  // Runs in < 1ms. No done callback. No setTimeout.
});
```

---

## Key Rule
> **Never test time-based operators with real timers — every `debounceTime`, `delay`, `throttleTime`, and `interval` must be tested inside `TestScheduler.run()` with marble strings.**