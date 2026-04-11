---
marp: true
theme: uncover
title: "Marble Diagrams as a First-Class Tool"
---

# Marble Diagrams as a First-Class Tool
> You know what each operator does in isolation, but composing them produces timing surprises — marble diagrams turn invisible time into a visual spec you can draw, critique, and test before a single line runs.

---

## Core Concept

- Timeline notation: `-` = time passing, letter = emission, `|` = complete, `#` = error
- **Position encodes when** — `--a---b|` means `a` arrives before `b`, with a 3-frame gap
- Operators are written as: input row → transform label → output row
- RxJS `TestScheduler` accepts **this exact ASCII notation** as executable test assertions
- Rule: **"If you cannot draw the output marble from the input marble, you do not understand the operator well enough to use it safely."**

---

## How It Works

```
debounceTime(3) — emit only after 3 frames of silence

Source:  --ab-----------c------|

  'a' arrives at frame 2 → timer set for frame 5
  'b' arrives at frame 3 → resets timer (3 < 5); 'a' is dropped
  'b' timer fires at frame 6 → emits 'b'
  'c' arrives at frame 15 → 9 frames of silence → timer fires at 18

Output:  ------b-----------c---|

Key: debounceTime is lossy by design — values arriving within the window are dropped.
```

---

## Common Mistake

```typescript
// ❌ Writing the pipe chain first, debugging timing surprises second
const results$ = keyup$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => http.get<Result[]>(`/api/search?q=${q}`))
);

// Why this is a problem:
// Three operators, each operating on an independent time axis.
// No diagram means no spec — when results arrive out of order or requests
// stack up, you have nothing concrete to compare against.
// You are debugging a system you never fully designed.
```

---

## The Right Way

```typescript
// ✅ Marble diagram first → code second → verify with TestScheduler

// Spec (each char = 1 ms virtual time in scheduler.run):
//  input$:    --ab-----------c------|
//               debounceTime(3)
//  debounced: ------b-----------c---|  ← 'a' swallowed; 'b' and 'c' each clear 3 ms
//               map(toUpperCase)
//  result$:   ------B-----------C---|

import { TestScheduler } from 'rxjs/testing';
import { debounceTime, map } from 'rxjs/operators';

const scheduler = new TestScheduler((actual, expected) =>
  expect(actual).toEqual(expected)
);

scheduler.run(({ hot, expectObservable }) => {
  const input$ = hot('--ab-----------c------|');

  const result$ = input$.pipe(
    debounceTime(3, scheduler),          // inject scheduler — no real timers fire
    map((x: string) => x.toUpperCase()), // observable transformation, not a side effect
  );

  // Write the expected marble BEFORE inspecting actual — this is your spec
  expectObservable(result$).toBe('------B-----------C---|');
});
```

---

## Key Rule

> **Draw the input marble and the expected output marble before writing a single operator — the diagram is the spec; the pipe chain is merely its implementation.**