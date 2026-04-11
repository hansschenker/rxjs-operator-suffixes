---
marp: true
theme: uncover
title: "Haskell list comprehensions and lazy sequences"
---

# Haskell list comprehensions and lazy sequences
> Intermediate RxJS developers treat Observables like eager arrays — but they are lazy sequences, and that distinction governs every performance, scheduling, and sharing decision you will ever make.

---

## Core Concept

- **Haskell lists are lazy by default** — `[1..]` is an infinite list; elements are computed only as they are consumed
- **List comprehensions are declarative pipelines**: `[x*2 | x <- xs, even x]` describes a transformation without executing it — execution is deferred to the consumer
- **Observable ≡ lazy list**: the `pipe()` chain is the comprehension — no code runs until `subscribe()` connects a consumer
- **Cold by default**: each `subscribe()` creates a new, independent execution — just as calling a Haskell function creates a new lazy evaluation
- > **"An Observable is a lazy Push collection of multiple values."** — RxJS documentation

---

## How It Works

```
── Haskell (lazy pull) ─────────────────────────────────────────────
  evens = [x * 2 | x <- [0..], even x]    -- infinite; not evaluated yet
  take 5 evens                              -- consumer pulls → [0,4,8,12,16]

── RxJS (lazy push) ────────────────────────────────────────────────
  const evens$ = interval(0).pipe(         // infinite; not running yet
    filter(x => x % 2 === 0),              // ← comprehension guard
    map(x => x * 2),                       // ← comprehension body
    take(5),                               // ← terminate after 5
  );
  evens$.subscribe(console.log);           // producer pushes → 0,4,8,12,16

  Haskell: consumer PULLS values on demand   (pull semantics)
  RxJS:    producer PUSHES values when ready (push semantics)
  Both:    nothing runs until a consumer connects
```

---

## Common Mistake

```typescript
// ❌ Assuming one Observable reference = one shared running producer
// Intermediate devs see subscribe() and think "tap into the stream"

const source$ = interval(1000).pipe(
  tap(x => console.log('tick', x)), // How many times does this fire?
  map(x => x * 2),
);

const subA = source$.subscribe(x => console.log('A:', x));
const subB = source$.subscribe(x => console.log('B:', x));

// Reality: TWO independent interval() timers start from zero
// "tick 0" logs TWICE per second — one timer per subscriber
// Cold Observables are functions: call them twice, get two evaluations
// Intermediate devs expect array semantics; they get function semantics
```

---

## The Right Way

```typescript
// ✅ Opt in to sharing explicitly — cold is the safe default

const source$ = interval(1000).pipe(
  tap(x => console.log('tick', x)), // logs ONCE — single shared producer
  map(x => x * 2),
  share(),                           // multicast: one execution, N subscribers
);

const subA = source$.subscribe(x => console.log('A:', x));
const subB = source$.subscribe(x => console.log('B:', x));

// "tick 0" logs once per second, value multicasted to both A and B
// Analogy: `share()` = binding a Haskell lazy value to a name (let x = ...)
//          so it evaluates once and is reused — not called again per consumer

// Rule of thumb:
//   cold (default) → lazy function → safe, isolated, reproducible
//   share()        → lazy value    → single execution, multicasted
//   shareReplay(1) → lazy value    → + replays latest to late subscribers
```

---

## Key Rule

> **A cold Observable is a lazy function, not a running stream — each `subscribe()` call is a new independent execution; reach for `share()` or `shareReplay(1)` only when you explicitly need one producer serving many consumers.**