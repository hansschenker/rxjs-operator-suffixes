# Advanced RxJS: The 4-Layer Model — Course Design Spec

**Date:** 2026-04-16
**Format:** 10 modules × 5 lessons × 1 narration script per lesson = 50 scripts
**Script style:** Insight-driven narration (~400–600 words, hook → insight → example → summary)
**Source material:** `rxjs-what-is-it-meta-2026-04-16.md`, `rxjs-what-is-it-meta-2026-04-16-summary.txt`, `rxjs-insight-questions.txt`

---

## Course Philosophy

This is not an operator catalog. Every lesson opens with a key insight — a claim that reframes how the student thinks about RxJS — then grounds it in a concrete example, and closes with a take-away they can apply immediately. The intellectual backbone is the **4-Layer Model**: Values → Time → Sharing → Flattening. Modules 4–7 each own one layer; Modules 1–3 build the mental scaffolding; Modules 8–10 apply the model to real systems.

**Target audience:** Developers who know `map`, `filter`, and `subscribe` but can't yet predict what a pipe will do, can't choose between `switchMap` and `exhaustMap` with confidence, and don't yet have a framework for designing reactive architectures.

---

## Output Structure

```
scripts/
  module-01/
    01-01-from-haskell-to-linq.md
    01-02-the-mathematical-dual.md
    01-03-iterator-plus-observer.md
    01-04-the-unified-type.md
    01-05-the-three-step-workflow.md
  module-02/
    ...
  ...
  module-10/
    10-01-alias-and-wrap-pattern.md
    ...
```

Each file contains a single narration script in Markdown, with the following front-matter and body structure:

```markdown
---
module: <N>
lesson: <N.N>
title: <Lesson Title>
key_insight: <One sentence — the claim this lesson proves>
---

## Hook
## Insight
## Example
## Summary
```

---

## Module Breakdown

### Module 1 — The DNA of RxJS
*Why RxJS exists and where it came from*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 1.1 | From Haskell to LINQ — the intellectual lineage of RxJS | Historical Context and Design Influences |
| 1.2 | The Mathematical Dual — how IEnumerable became IObservable | Duality of Pull and Push Models |
| 1.3 | Iterator + Observer — the two GoF patterns RxJS fuses | Iterator and Observer Pattern Integration |
| 1.4 | The Unified Type — why Observable absorbs Arrays, Promises, and Events | Comparison of Arrays, Promises, and Observables |
| 1.5 | The 3-Step Workflow — enter, transform, exit | RxJS Workflow and Pure Functional Patterns |

---

### Module 2 — The Observable Contract
*What actually happens under the hood*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 2.1 | What really happens when you subscribe | Observable Characteristics and Mental Models |
| 2.2 | Cold vs Hot — the producer behavior distinction | Cold vs Hot Observables and Subscription Sharing |
| 2.3 | The five subscription phases | Subscription Lifecycle Management |
| 2.4 | Two graphs every pipeline builds | Subscription Lifecycle Management |
| 2.5 | The three Observable variants | Observable Variants and Multicast Behavior |

---

### Module 3 — Functional RxJS
*RxJS as a pure functional programming system*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 3.1 | Data and Logic are separate | Functional Programming Principles in RxJS |
| 3.2 | Referential transparency — the Observable as a reusable blueprint | Referential Transparency and Side Effects |
| 3.3 | subscribe() as the single impure boundary | Referential Transparency and Side Effects |
| 3.4 | tap vs map — declaring side effects without breaking the pipeline | RxJS Workflow and Pure Functional Patterns |
| 3.5 | RxJS as a DSL for time-varying values | RxJS as a Domain-Specific Language (DSL) |

---

### Module 4 — Layer 1: Values
*Operating on the value dimension of a stream*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 4.1 | The three primitives — map, filter, flatMap | Fundamental Operators and Monad Laws |
| 4.2 | scan — building state from a stream | Fundamental Operators and Monad Laws |
| 4.3 | The monad laws — why Observable composes predictably | Fundamental Operators and Monad Laws |
| 4.4 | T-only operators — the purely value-based family | Operator Classification and Testing |
| 4.5 | Operator classification — T-only vs T+time vs time-only | Operator Classification and Testing |

---

### Module 5 — Layer 2: Time
*Operating on the temporal dimension of a stream*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 5.1 | Observables as sequences of (time, value) pairs | Temporal vs Spatial Data Structures |
| 5.2 | Lossy vs lossless — the fundamental time tradeoff | Lossy vs Lossless Operators and Use Cases |
| 5.3 | The throttle and debounce families | Time-Based Operators and Rate Limiting |
| 5.4 | The buffer and window families | Buffering and Windowing Operators |
| 5.5 | Choosing the right rate-limiting operator | Lossy vs Lossless Operators and Use Cases |

---

### Module 6 — Layer 3: Sharing
*One producer, many consumers*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 6.1 | Unicast vs multicast — the consumer behavior distinction | Unicast vs Multicast Communication Styles |
| 6.2 | Subject as a multicast proxy | Subjects as Multicast Proxies |
| 6.3 | The three specialized Subject variants — BehaviorSubject, ReplaySubject, AsyncSubject | Multicasting and Subject Variants |
| 6.4 | share() and shareReplay() — mechanics and gotchas | Share and ShareReplay Mechanics |
| 6.5 | connectable() — manual control over when the producer starts | Connectable Observables and Manual Control |

---

### Module 7 — Layer 4: Flattening
*Controlling concurrency when Observables emit Observables*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 7.1 | The "map to Observable" problem — why flattening exists | Flattening Operators and Concurrency Control |
| 7.2 | mergeMap — parallel, unbounded concurrency | Concurrency Control and Flattening Operators |
| 7.3 | concatMap — serial, ordered execution | Concurrency Control and Flattening Operators |
| 7.4 | switchMap — cancel on new, built for live queries | Concurrency Control and Flattening Operators |
| 7.5 | exhaustMap — ignore while busy, prevent double-submit | Concurrency Control and Flattening Operators |

---

### Module 8 — Combining Streams
*Temporal alignment across multiple sources*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 8.1 | Temporal alignment — the question behind every combining operator | Combining Streams and Temporal Alignment |
| 8.2 | combineLatest — reactive derived state | Combining Multiple Observables |
| 8.3 | withLatestFrom — actions with context | Combining Multiple Observables |
| 8.4 | zip and forkJoin — pairing by index and parallel completion | Combining Multiple Observables |
| 8.5 | merge, concat, and race — interleaving, sequencing, and first-wins | Combining Multiple Observables |

---

### Module 9 — Error Handling & Resilience
*What to do when streams fail*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 9.1 | Why Observables terminate on error — and why that is correct | Error Handling and Retry Strategies |
| 9.2 | catchError — recovery strategies | Error Handling and Retry Strategies |
| 9.3 | retry and the resilience ladder | Error Handling and Retry Strategies |
| 9.4 | timeout, finalize, and lifecycle cleanup | Error Handling and Domain Facades |
| 9.5 | The error handling decision tree | Error Handling and Retry Strategies |

---

### Module 10 — Domain Facades, Testing & Architecture
*Applying the 4-layer model to real systems*

| Lesson | Title | Key Source Section |
|--------|-------|--------------------|
| 10.1 | The Alias + Wrap pattern — domain-specific operator naming | Alias + Wrap Pattern for Domain Operators |
| 10.2 | Hexagonal architecture with RxJS | Hexagonal Architecture and Telemetry Wrappers |
| 10.3 | withTelemetry — aspect-oriented operators | Hexagonal Architecture and Telemetry Wrappers |
| 10.4 | Testing with TestScheduler and marble diagrams | Testing and Composition Patterns |
| 10.5 | The 4-Layer Model as a complete architecture | 4-Layer Model and Capstone Project |

---

## Script Template

Each `.md` file in `scripts/` follows this structure:

```markdown
---
module: N
lesson: N.N
title: <Title>
key_insight: <One-sentence claim this lesson proves>
---

## Hook
<!-- 2–3 sentences that open with a surprising or counterintuitive observation -->

## Insight
<!-- The core idea explained plainly, ~150–200 words -->

## Example
<!-- A concrete, realistic scenario (TypeScript code snippet or marble diagram) that makes the insight tangible, ~100–150 words -->

## Summary
<!-- 2–3 bullet take-aways the student can apply immediately -->
```

---

## Constraints

- No lesson repeats an insight already covered in a previous lesson
- Each lesson is self-contained enough to be watched out of sequence
- TypeScript examples use: tabs, single quotes, explicit types, `$` suffix on Observables, `pipe()` chains
- No `any` type; side effects only in `tap`; no nested subscriptions
