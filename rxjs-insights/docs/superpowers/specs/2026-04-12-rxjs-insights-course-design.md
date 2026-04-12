# RxJS Insights — Udemy Course Design

**Date:** 2026-04-12  
**Status:** Approved

---

## Overview

A standalone Udemy video course built entirely around the conceptual insights in `rxjs-insights.md`. Distinct from `rxjs-deep-dive-claude-superpowers`, which is operator-focused; this course is **insight-driven** — each lesson unpacks one core idea about what RxJS is, where it came from, and how to think about it.

**Audience:** Intermediate RxJS developers who know the basics and want a mental model grounded in theory.  
**Platform:** Udemy  
**Format:** Narrated video recordings. The deliverable of this repo is **written scripts only** — no slides, no live coding. Scripts are read aloud by the instructor.  
**Scale:** 24 insights × 3 lessons = **72 lessons total**  
**Estimated duration:** ~3.5–6 hours (Concept 2–3 min + Deep Dive 4–6 min + Code Sample 3–5 min per insight)

---

## Lesson Structure

Each insight produces exactly 3 lessons in this order:

| Lesson type | Duration | Purpose |
|---|---|---|
| **Concept** | 2–3 min | Introduces the insight in plain language. No code. Answers *what is this and why does it matter*. |
| **Deep Dive** | 4–6 min | Unpacks the idea — historical context, formal definition, analogies, trade-offs. Still no code. |
| **Code Sample** | 3–5 min | Narrates a focused TypeScript snippet (10–20 lines) embedded directly in the script. Self-contained, illustrates the insight. |

Narration is written as **spoken prose** — contractions allowed, no bullet lists or headings inside the body — so it reads naturally aloud.

---

## Folder Structure

```
scripts/
  section-01-origins/
    01-haskell-linq-rxnet/
      concept.md
      deep-dive.md
      code-sample.md
    02-linq-as-language-integrated-monad/
    03-unified-programming-model/
    04-rxnet-ui-events-first-class/
  section-02-core-duality/
    05-mathematical-dual/
    06-erik-meijer-synthesis/
    07-producer-consumer-separation/
  section-03-data-model/
    08-observable-formal-definition/
    09-operator-families-t-a-both/
    10-three-observable-variants/
  section-04-subscriptions-lifecycle/
    11-subscription-as-lifecycle/
    12-subscription-tree/
    13-three-step-workflow/
  section-05-composition-concurrency/
    14-rxjs-three-things/
    15-schedulers/
    16-four-basic-scenarios/
    17-dsl-time-varying-values/
  section-06-design-patterns/
    18-domain-invariant-operators/
    19-subject-as-proxy/
    20-unicast-vs-multicast/
    21-functional-data-logic-separation/
    22-pipeline-dependency-graph/
    23-custom-naming-pattern/
    24-custom-operators/
```

Insights are numbered 01–24 globally so Udemy lesson ordering is unambiguous even if sections are reordered.

---

## Script File Format

Each `concept.md`, `deep-dive.md`, and `code-sample.md` follows this template:

```markdown
# [Lesson Title]

**Section:** [Section name]  
**Insight:** [Insight name]  
**Lesson type:** Concept | Deep Dive | Code Sample  
**Estimated duration:** X min

---

[Narration script — plain prose, written to be read aloud]
```

---

## Section and Insight Map

### Section 1 — Origins
The intellectual lineage that produced RxJS.

| # | Insight | Code sample illustrates |
|---|---|---|
| 01 | Haskell → LINQ → Rx.NET → RxJS | Same query in LINQ syntax vs RxJS `pipe()` |
| 02 | LINQ as Language-Integrated Monad | `flatMap` as the universal bind/chain operator |
| 03 | Unified Programming Model | Same operators on a click stream and a WebSocket stream |
| 04 | Rx.NET made UI events first-class | `fromEvent` composing two DOM event sources |

### Section 2 — The Core Duality
The mathematical structure at the heart of RxJS.

| # | Insight | Code sample illustrates |
|---|---|---|
| 05 | Mathematical dual: Iterable ↔ Observable | Pull iterator vs push Observable producing the same values |
| 06 | Erik Meijer's synthesis | A Subject bridging Iterator-style push into Observable |
| 07 | Producer/Consumer separation | Cold Observable — each subscriber gets its own execution |

### Section 3 — The Data Model
What an Observable actually is, formally.

| # | Insight | Code sample illustrates |
|---|---|---|
| 08 | Observable formal definition `[{T,a}…]` | `timestamp()` operator exposing `{timestamp, value}` pairs |
| 09 | Operator families: T / a / both | `delay` (T), `map` (a), `debounceTime` (T+a) side by side |
| 10 | Three Observable variants | `Observable`, `Subject`, `ConnectableObservable` (`share()`) |

### Section 4 — Subscriptions & Lifecycle
How subscriptions track and control execution.

| # | Insight | Code sample illustrates |
|---|---|---|
| 11 | Subscription as lifecycle | `subscribe()` return value, `unsubscribe()`, teardown logic |
| 12 | Subscription tree | `add()` — parent unsubscribe tears down children |
| 13 | Three-step workflow | `interval` → `map` → `subscribe` as the canonical pattern |

### Section 5 — Composition & Concurrency
The three pillars of RxJS and how time is controlled.

| # | Insight | Code sample illustrates |
|---|---|---|
| 14 | RxJS is 3 things | One pipeline using a creator, operators, and a Scheduler |
| 15 | Schedulers | `observeOn(asyncScheduler)` vs `observeOn(queueScheduler)` |
| 16 | Four basic scenarios | One snippet per scenario: create / transform / combine / flatten |
| 17 | DSL for time-varying values | `combineLatest` modelling two time-varying inputs |

### Section 6 — Design Patterns
How the insights translate into everyday practice.

| # | Insight | Code sample illustrates |
|---|---|---|
| 18 | Domain-invariant operators | Same `map`/`filter` pipeline on GPS data and animation frames |
| 19 | Subject as proxy | `Subject` multicasting one source to two subscribers |
| 20 | Unicast vs multicast | Cold `Observable` vs `Subject` — two subscribers, different results |
| 21 | Data and Logic are separate | Observable as data, `pipe()` chain as pure logic |
| 22 | Pipeline as dependency graph | `tap()` tracing the subscription and dataflow graph |
| 23 | Custom naming pattern | Wrapping `switchMap` in a domain-named custom operator |
| 24 | Custom operators | Composing two operators into a tested, reusable function |

---

## Source Material

All lesson content is derived from `rxjs-insights.md` in this repository. The file is the authoritative source — scripts must not introduce insights not present in that file.

---

## Out of Scope

- Slides or visual assets
- Live coding recordings
- Companion app or separate demo repo
- VitePress documentation site (can be added later once scripts are complete)
