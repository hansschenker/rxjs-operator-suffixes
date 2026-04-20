# Decision Trees Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 12 Mermaid flowchart decision-tree pages (one per operator category) to the `rxjs-operator-suffixes` VitePress site, each with clickable leaf nodes that link to operator deep-dive pages.

**Architecture:** New `docs/decisions/` directory with one `.md` per category plus an index. Each page contains one or two `flowchart TD` Mermaid diagrams. Category pages get a callout linking to their tree. Sidebar gets a new "Decision Trees" group.

**Tech Stack:** VitePress 1.6.4, Mermaid (built into VitePress), Markdown.

---

## File Map

| Action | Path |
|--------|------|
| Create | `docs/decisions/index.md` |
| Create | `docs/decisions/flattening.md` |
| Create | `docs/decisions/windowing-buffering.md` |
| Create | `docs/decisions/rate-limiting.md` |
| Create | `docs/decisions/transformation.md` |
| Create | `docs/decisions/filtering.md` |
| Create | `docs/decisions/combination.md` |
| Create | `docs/decisions/creation.md` |
| Create | `docs/decisions/multicasting.md` |
| Create | `docs/decisions/error-handling.md` |
| Create | `docs/decisions/side-effects.md` |
| Create | `docs/decisions/notification.md` |
| Create | `docs/decisions/scheduling-timing.md` |
| Modify | `docs/.vitepress/config.ts` — add Decision Trees sidebar group |
| Modify | `docs/categories/*.md` (all 12) — add decision-tree callout line |

---

## Mermaid Conventions (apply identically to every page)

- Questions: `{text}` diamond shape
- Terminal recommendations: `([operatorName])` stadium shape + `:::terminal`
- Color: `classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold`
- Click target: `click NODE "/operators/name" "name — deep dive"`
- Footer on every decisions page: `→ [Category reference](../categories/<slug>) · [All decision trees](../decisions/)`

---

## Task 1 — Scaffold decisions directory + index page

**Files:**
- Create: `docs/decisions/index.md`

- [ ] **Create the index page**

```markdown
---
title: Decision Trees
---

# Which RxJS Operator Should I Use?

Answer a short sequence of questions to reach the right operator — every recommendation links directly to its full deep-dive page.

| Category | Key question |
|---|---|
| [Higher-Order / Flattening](./flattening) | Cancel, ignore, queue, or merge inner Observables? |
| [Windowing & Buffering](./windowing-buffering) | Collect into arrays or Observables? |
| [Rate Limiting](./rate-limiting) | Leading or trailing edge of a burst? |
| [Transformation](./transformation) | Stateless map or stateful accumulation? |
| [Filtering](./filtering) | Filter by position, count, or value? |
| [Combination](./combination) | Must sources complete, or emit continuously? |
| [Creation](./creation) | Adapt existing value or create from time? |
| [Multicasting & Sharing](./multicasting) | Replay to late subscribers? |
| [Error Handling & Recovery](./error-handling) | Error or completion triggered? |
| [Side Effects](./side-effects) | Per-value or on termination? |
| [Notification Objects](./notification) | Convert to or from Notification objects? |
| [Scheduling & Timing](./scheduling-timing) | New timer or decorate existing stream? |
```

- [ ] **Build to verify page renders**

```bash
npm run docs:build
```

Expected: `build complete` with no errors.

- [ ] **Commit**

```bash
git add docs/decisions/index.md
git commit -m "feat: add decisions/ index page"
```

---

## Task 2 — Flattening decision tree

**Files:**
- Create: `docs/decisions/flattening.md`

- [ ] **Create the file**

```markdown
---
title: "Which Flattening Operator?"
---

# Which Flattening Operator?

Each source value is projected into an inner Observable. The question is what happens to the *previous* inner when a *new* source value arrives.

```mermaid
flowchart TD
    Q1{"Cancel the previous inner\nwhen a new value arrives?"}
    Q2{"Ignore new values\nwhile an inner is active?"}
    Q3{"Must inners complete\nin source order?"}
    T1(["switchMap"]):::terminal
    T2(["exhaustMap"]):::terminal
    T3(["concatMap"]):::terminal
    T4(["mergeMap"]):::terminal

    Q1 -->|Yes| T1
    Q1 -->|No| Q2
    Q2 -->|Yes| T2
    Q2 -->|No| Q3
    Q3 -->|Yes — ordered| T3
    Q3 -->|No — concurrent| T4

    click T1 "/operators/switchMap" "switchMap — deep dive"
    click T2 "/operators/exhaustMap" "exhaustMap — deep dive"
    click T3 "/operators/concatMap" "concatMap — deep dive"
    click T4 "/operators/mergeMap" "mergeMap — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

| Operator | Concurrency | On new inner |
|---|---|---|
| `switchMap` | 1 | Cancel previous |
| `exhaustMap` | 1 | Ignore new |
| `concatMap` | 1 | Queue new |
| `mergeMap` | ∞ | Subscribe immediately |

---
→ [Category reference](../categories/flattening) · [All decision trees](../decisions/)
```

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/flattening.md
git commit -m "feat: add flattening decision tree"
```

---

## Task 3 — Windowing & Buffering decision tree

**Files:**
- Create: `docs/decisions/windowing-buffering.md`

- [ ] **Create the file**

````markdown
---
title: "Which Windowing or Buffering Operator?"
---

# Which Windowing or Buffering Operator?

Both families collect source emissions into groups. The first question is the output type; the second is what triggers the group boundary.

```mermaid
flowchart TD
    Q1{"Output type?"}
    Q2A{"Boundary trigger?"}
    Q2B{"Boundary trigger?"}
    T1(["bufferCount"]):::terminal
    T2(["bufferTime"]):::terminal
    T3(["bufferWhen /\nbufferToggle"]):::terminal
    T4(["windowCount"]):::terminal
    T5(["windowTime"]):::terminal
    T6(["windowWhen /\nwindowToggle"]):::terminal

    Q1 -->|"Array — emit when full"| Q2A
    Q1 -->|"Observable — process live"| Q2B
    Q2A -->|Count| T1
    Q2A -->|Time| T2
    Q2A -->|Event| T3
    Q2B -->|Count| T4
    Q2B -->|Time| T5
    Q2B -->|Event| T6

    click T1 "/operators/bufferCount" "bufferCount — deep dive"
    click T2 "/operators/bufferTime" "bufferTime — deep dive"
    click T3 "/operators/bufferWhen" "bufferWhen — deep dive"
    click T4 "/operators/windowCount" "windowCount — deep dive"
    click T5 "/operators/windowTime" "windowTime — deep dive"
    click T6 "/operators/windowWhen" "windowWhen — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/windowing-buffering) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/windowing-buffering.md
git commit -m "feat: add windowing & buffering decision tree"
```

---

## Task 4 — Rate Limiting decision tree

**Files:**
- Create: `docs/decisions/rate-limiting.md`

- [ ] **Create the file**

````markdown
---
title: "Which Rate-Limiting Operator?"
---

# Which Rate-Limiting Operator?

All four families are lossy — values that fall in the suppression window are dropped. The key question is which edge of a burst should survive.

```mermaid
flowchart TD
    Q1{"Which edge of the burst\nshould emit?"}
    Q2{"Must the source be silent\nfor the full window duration?"}
    Q3{"What triggers\nthe emission?"}
    T1(["throttle / throttleTime"]):::terminal
    T2(["debounce / debounceTime"]):::terminal
    T3(["audit / auditTime"]):::terminal
    T4(["sample / sampleTime"]):::terminal

    Q1 -->|"Leading — first value wins"| T1
    Q1 -->|"Trailing — last value wins"| Q2
    Q2 -->|Yes — silence required| T2
    Q2 -->|No| Q3
    Q3 -->|"End of a fixed window"| T3
    Q3 -->|"External notifier fires"| T4

    click T1 "/operators/throttle" "throttle — deep dive"
    click T2 "/operators/debounce" "debounce — deep dive"
    click T3 "/operators/audit" "audit — deep dive"
    click T4 "/operators/sample" "sample — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/rate-limiting) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/rate-limiting.md
git commit -m "feat: add rate-limiting decision tree"
```

---

## Task 5 — Transformation decision tree

**Files:**
- Create: `docs/decisions/transformation.md`

- [ ] **Create the file**

````markdown
---
title: "Which Transformation Operator?"
---

# Which Transformation Operator?

Transformation operators reshape each emission without changing which values pass or how subscriptions work.

```mermaid
flowchart TD
    Q1{"One value in,\none value out — no state?"}
    Q2A{"Map every value\nto the same constant?"}
    Q2B{"Need to carry\naccumulated state?"}
    Q3{"What structural change?"}
    T1(["mapTo"]):::terminal
    T2(["map"]):::terminal
    T3(["scan"]):::terminal
    T4(["expand"]):::terminal
    T5(["pairwise"]):::terminal
    T6(["groupBy"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|Yes| T1
    Q2A -->|No| T2
    Q2B -->|Yes| T3
    Q2B -->|No| Q3
    Q3 -->|"Recursive projection"| T4
    Q3 -->|"Consecutive pairs → tuple"| T5
    Q3 -->|"Split stream by key"| T6

    click T1 "/operators/mapTo" "mapTo — deep dive"
    click T2 "/operators/map" "map — deep dive"
    click T3 "/operators/scan" "scan — deep dive"
    click T4 "/operators/expand" "expand — deep dive"
    click T5 "/operators/pairwise" "pairwise — deep dive"
    click T6 "/operators/groupBy" "groupBy — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/transformation) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/transformation.md
git commit -m "feat: add transformation decision tree"
```

---

## Task 6 — Filtering decision tree (two diagrams)

**Files:**
- Create: `docs/decisions/filtering.md`

- [ ] **Create the file**

````markdown
---
title: "Which Filtering Operator?"
---

# Which Filtering Operator?

Filtering has two distinct axes: **position/count** (where in the sequence) and **value/predicate** (what the value is). Use the diagram that matches your question.

## By Position or Count

```mermaid
flowchart TD
    Q1{"Do you know\nthe exact index?"}
    Q2{"Skip or take?"}
    Q3A{"Boundary condition?"}
    Q3B{"Boundary condition?"}
    T1(["elementAt"]):::terminal
    T2(["skip"]):::terminal
    T3(["skipWhile"]):::terminal
    T4(["skipUntil"]):::terminal
    T5(["skipLast"]):::terminal
    T6(["take"]):::terminal
    T7(["takeWhile"]):::terminal
    T8(["takeUntil"]):::terminal
    T9(["takeLast"]):::terminal

    Q1 -->|Yes| T1
    Q1 -->|No| Q2
    Q2 -->|Skip — suppress from start| Q3A
    Q2 -->|Take — pass from start| Q3B
    Q3A -->|Count| T2
    Q3A -->|Predicate| T3
    Q3A -->|Notifier fires| T4
    Q3A -->|From the end| T5
    Q3B -->|Count| T6
    Q3B -->|Predicate| T7
    Q3B -->|Notifier fires| T8
    Q3B -->|From the end| T9

    click T1 "/operators/elementAt" "elementAt — deep dive"
    click T2 "/operators/skip" "skip — deep dive"
    click T3 "/operators/skipWhile" "skipWhile — deep dive"
    click T4 "/operators/skipUntil" "skipUntil — deep dive"
    click T5 "/operators/skipLast" "skipLast — deep dive"
    click T6 "/operators/take" "take — deep dive"
    click T7 "/operators/takeWhile" "takeWhile — deep dive"
    click T8 "/operators/takeUntil" "takeUntil — deep dive"
    click T9 "/operators/takeLast" "takeLast — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

## By Value or Predicate

```mermaid
flowchart TD
    Q1{"Suppress consecutive\nduplicates?"}
    Q2A{"Compare full value\nor one key?"}
    Q2B{"How many results\ndo you want?"}
    Q3{"Need the index,\nnot the value?"}
    Q4{"Source must not\nbe empty?"}
    T1(["distinctUntilChanged"]):::terminal
    T2(["distinctUntilKeyChanged"]):::terminal
    T3(["first / find"]):::terminal
    T4(["findIndex"]):::terminal
    T5(["last"]):::terminal
    T6(["single"]):::terminal
    T7(["filter"]):::terminal
    T8(["defaultIfEmpty"]):::terminal
    T9(["throwIfEmpty"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|Full value| T1
    Q2A -->|One key| T2
    Q2B -->|First match| Q3
    Q2B -->|Last match| T5
    Q2B -->|Exactly one| T6
    Q2B -->|All matching| T7
    Q2B -->|Guard on empty| Q4
    Q3 -->|Yes| T4
    Q3 -->|No| T3
    Q4 -->|Emit a default| T8
    Q4 -->|Error| T9

    click T1 "/operators/distinctUntilChanged" "distinctUntilChanged — deep dive"
    click T2 "/operators/distinctUntilKeyChanged" "distinctUntilKeyChanged — deep dive"
    click T3 "/operators/first" "first — deep dive"
    click T4 "/operators/findIndex" "findIndex — deep dive"
    click T5 "/operators/last" "last — deep dive"
    click T6 "/operators/single" "single — deep dive"
    click T7 "/operators/filter" "filter — deep dive"
    click T8 "/operators/defaultIfEmpty" "defaultIfEmpty — deep dive"
    click T9 "/operators/throwIfEmpty" "throwIfEmpty — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/filtering) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/filtering.md
git commit -m "feat: add filtering decision tree (2 diagrams)"
```

---

## Task 7 — Combination decision tree

**Files:**
- Create: `docs/decisions/combination.md`

- [ ] **Create the file**

````markdown
---
title: "Which Combination Operator?"
---

# Which Combination Operator?

The first question divides the space cleanly: do all sources need to *complete* before you get a result?

```mermaid
flowchart TD
    Q1{"Must all sources complete\nbefore emitting?"}
    Q2A{"Pair values by position\n(1st with 1st, 2nd with 2nd)?"}
    Q2B{"Which source drives\nemission timing?"}
    Q3{"First source to emit wins?"}
    T1(["zip / zipWith"]):::terminal
    T2(["forkJoin"]):::terminal
    T3(["combineLatest /\ncombineLatestWith"]):::terminal
    T4(["withLatestFrom"]):::terminal
    T5(["race / raceWith"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No — continuous| Q2B
    Q2A -->|Yes| T1
    Q2A -->|No — last value each| T2
    Q2B -->|Any source emits| T3
    Q2B -->|Primary source only| Q3
    Q3 -->|Yes| T5
    Q3 -->|No — augment with secondary| T4

    click T1 "/operators/zip" "zip — deep dive"
    click T2 "/operators/forkJoin" "forkJoin — deep dive"
    click T3 "/operators/combineLatest" "combineLatest — deep dive"
    click T4 "/operators/withLatestFrom" "withLatestFrom — deep dive"
    click T5 "/operators/race" "race — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/combination) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/combination.md
git commit -m "feat: add combination decision tree"
```

---

## Task 8 — Creation decision tree

**Files:**
- Create: `docs/decisions/creation.md`

- [ ] **Create the file**

````markdown
---
title: "Which Creation Operator?"
---

# Which Creation Operator?

Creation operators produce an Observable from scratch — no upstream source needed.

```mermaid
flowchart TD
    Q1{"Adapting an\nexisting value or structure?"}
    Q2A{"What is the source?"}
    Q2B{"Time-based?"}
    Q3{"Emit once or repeatedly?"}
    Q4{"Fixed list of values?"}
    Q5{"Consecutive integers?"}
    T1(["from"]):::terminal
    T2(["fromEvent"]):::terminal
    T3(["fromEventPattern"]):::terminal
    T4(["fromFetch"]):::terminal
    T5(["timer"]):::terminal
    T6(["interval"]):::terminal
    T7(["of"]):::terminal
    T8(["range"]):::terminal
    T9(["defer / generate"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|"Promise / array / iterable"| T1
    Q2A -->|"DOM or Node event"| T2
    Q2A -->|"Custom add/remove handler"| T3
    Q2A -->|"Fetch API call"| T4
    Q2B -->|Yes| Q3
    Q2B -->|No| Q4
    Q3 -->|"Once after delay"| T5
    Q3 -->|Repeatedly| T6
    Q4 -->|Yes| T7
    Q4 -->|No| Q5
    Q5 -->|Yes| T8
    Q5 -->|No| T9

    click T1 "/operators/from" "from — deep dive"
    click T2 "/operators/fromEvent" "fromEvent — deep dive"
    click T3 "/operators/fromEventPattern" "fromEventPattern — deep dive"
    click T4 "/operators/fromFetch" "fromFetch — deep dive"
    click T5 "/operators/timer" "timer — deep dive"
    click T6 "/operators/interval" "interval — deep dive"
    click T7 "/operators/of" "of — deep dive"
    click T8 "/operators/range" "range — deep dive"
    click T9 "/operators/defer" "defer — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/creation) · [All decision trees](../decisions/)
````

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/decisions/creation.md
git commit -m "feat: add creation decision tree"
```

---

## Task 9 — Multicasting, Error Handling, Side Effects, Notification, Scheduling trees

**Files:**
- Create: `docs/decisions/multicasting.md`
- Create: `docs/decisions/error-handling.md`
- Create: `docs/decisions/side-effects.md`
- Create: `docs/decisions/notification.md`
- Create: `docs/decisions/scheduling-timing.md`

- [ ] **Create `docs/decisions/multicasting.md`**

````markdown
---
title: "Which Multicasting Operator?"
---

# Which Multicasting Operator?

All multicasting operators share one upstream subscription. The questions are whether you need replay and whether you need explicit `connect()` control.

```mermaid
flowchart TD
    Q1{"Need explicit connect\ncontrol? — legacy pattern"}
    Q2A{"Which Subject variant\ninternally?"}
    Q2B{"Replay buffered values\nto late subscribers?"}
    T1(["publishBehavior"]):::terminal
    T2(["publishLast"]):::terminal
    T3(["publishReplay"]):::terminal
    T4(["shareReplay"]):::terminal
    T5(["share"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No — modern| Q2B
    Q2A -->|BehaviorSubject| T1
    Q2A -->|AsyncSubject| T2
    Q2A -->|ReplaySubject| T3
    Q2B -->|Yes| T4
    Q2B -->|No| T5

    click T1 "/operators/publishBehavior" "publishBehavior — deep dive"
    click T2 "/operators/publishLast" "publishLast — deep dive"
    click T3 "/operators/publishReplay" "publishReplay — deep dive"
    click T4 "/operators/shareReplay" "shareReplay — deep dive"
    click T5 "/operators/share" "share — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/multicasting) · [All decision trees](../decisions/)
````

- [ ] **Create `docs/decisions/error-handling.md`**

````markdown
---
title: "Which Error Handling Operator?"
---

# Which Error Handling Operator?

The first split: are you reacting to an upstream **error** or an upstream **completion**?

```mermaid
flowchart TD
    Q1{"Triggered by\nerror or completion?"}
    Q2A{"Re-subscribe to\nthe same source?"}
    Q2B{"Delay or condition\nbetween re-subscriptions?"}
    T1(["retry"]):::terminal
    T2(["catchError"]):::terminal
    T3(["repeat with delay"]):::terminal
    T4(["repeat"]):::terminal

    Q1 -->|Error| Q2A
    Q1 -->|Completion| Q2B
    Q2A -->|"Yes — automatic re-subscribe"| T1
    Q2A -->|"No — custom logic / fallback"| T2
    Q2B -->|Yes| T3
    Q2B -->|No| T4

    click T1 "/operators/retry" "retry — deep dive"
    click T2 "/operators/catchError" "catchError — deep dive"
    click T3 "/operators/repeatWhen" "repeatWhen — deep dive"
    click T4 "/operators/repeat" "repeat — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/error-handling) · [All decision trees](../decisions/)
````

- [ ] **Create `docs/decisions/side-effects.md`**

````markdown
---
title: "Which Side-Effect Operator?"
---

# Which Side-Effect Operator?

Both operators are transparent to the data flow — they observe without altering. The only question is *when* the effect runs.

```mermaid
flowchart TD
    Q1{"When does the\nside effect run?"}
    T1(["tap"]):::terminal
    T2(["finalize"]):::terminal

    Q1 -->|"On each emitted value"| T1
    Q1 -->|"On termination\n(complete · error · unsubscribe)"| T2

    click T1 "/operators/tap" "tap — deep dive"
    click T2 "/operators/finalize" "finalize — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/side-effects) · [All decision trees](../decisions/)
````

- [ ] **Create `docs/decisions/notification.md`**

````markdown
---
title: "Which Notification Operator?"
---

# Which Notification Operator?

`materialize` and `dematerialize` are inverse pairs — one converts events *to* objects, the other converts objects *back to* events.

```mermaid
flowchart TD
    Q1{"Direction of conversion?"}
    T1(["materialize"]):::terminal
    T2(["dematerialize"]):::terminal

    Q1 -->|"Notifications → Notification objects"| T1
    Q1 -->|"Notification objects → notifications"| T2

    click T1 "/operators/materialize" "materialize — deep dive"
    click T2 "/operators/dematerialize" "dematerialize — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/notification) · [All decision trees](../decisions/)
````

- [ ] **Create `docs/decisions/scheduling-timing.md`**

````markdown
---
title: "Which Scheduling or Timing Operator?"
---

# Which Scheduling or Timing Operator?

Start by asking whether you are *creating* a new time-based Observable or *decorating* an existing stream.

```mermaid
flowchart TD
    Q1{"Creating a new\ntime-based Observable?"}
    Q2A{"Emit once or repeatedly?"}
    Q2B{"Adding a delay to\nthe existing stream?"}
    Q3{"Fixed offset or per-value?"}
    Q4{"What do you need?"}
    T1(["timer"]):::terminal
    T2(["interval"]):::terminal
    T3(["delay"]):::terminal
    T4(["delayWhen"]):::terminal
    T5(["observeOn"]):::terminal
    T6(["subscribeOn"]):::terminal
    T7(["timeInterval"]):::terminal
    T8(["timestamp"]):::terminal
    T9(["timeout"]):::terminal

    Q1 -->|Yes| Q2A
    Q1 -->|No| Q2B
    Q2A -->|"Once after delay"| T1
    Q2A -->|Repeatedly| T2
    Q2B -->|Yes| Q3
    Q2B -->|No| Q4
    Q3 -->|"Fixed offset"| T3
    Q3 -->|"Per-value Observable"| T4
    Q4 -->|"Move notification delivery"| T5
    Q4 -->|"Move subscription context"| T6
    Q4 -->|"Elapsed-time metadata"| T7
    Q4 -->|"Wall-clock timestamp"| T8
    Q4 -->|"Error if source goes silent"| T9

    click T1 "/operators/timer" "timer — deep dive"
    click T2 "/operators/interval" "interval — deep dive"
    click T3 "/operators/delay" "delay — deep dive"
    click T4 "/operators/delayWhen" "delayWhen — deep dive"
    click T5 "/operators/observeOn" "observeOn — deep dive"
    click T6 "/operators/subscribeOn" "subscribeOn — deep dive"
    click T7 "/operators/timeInterval" "timeInterval — deep dive"
    click T8 "/operators/timestamp" "timestamp — deep dive"
    click T9 "/operators/timeout" "timeout — deep dive"

    classDef terminal fill:#4ade80,stroke:#15803d,color:#000,font-weight:bold
```

---
→ [Category reference](../categories/scheduling-timing) · [All decision trees](../decisions/)
````

- [ ] **Build and verify all five new pages**

```bash
npm run docs:build
```

Expected: `build complete` — all decision pages rendered without errors.

- [ ] **Commit**

```bash
git add docs/decisions/
git commit -m "feat: add remaining 5 decision trees (multicasting, error-handling, side-effects, notification, scheduling-timing)"
```

---

## Task 10 — Add decision-tree callouts to all 12 category pages

**Files:**
- Modify: `docs/categories/flattening.md`
- Modify: `docs/categories/windowing-buffering.md`
- Modify: `docs/categories/rate-limiting.md`
- Modify: `docs/categories/transformation.md`
- Modify: `docs/categories/filtering.md`
- Modify: `docs/categories/combination.md`
- Modify: `docs/categories/creation.md`
- Modify: `docs/categories/multicasting.md`
- Modify: `docs/categories/error-handling.md`
- Modify: `docs/categories/side-effects.md`
- Modify: `docs/categories/notification.md`
- Modify: `docs/categories/scheduling-timing.md`

- [ ] **Add callout to each category page**

In each `docs/categories/<slug>.md`, insert this line immediately after the frontmatter block (after the closing `---`), before the first paragraph:

| File | Line to insert |
|------|---------------|
| `flattening.md` | `> Not sure which to use? [Decision tree →](../decisions/flattening)` |
| `windowing-buffering.md` | `> Not sure which to use? [Decision tree →](../decisions/windowing-buffering)` |
| `rate-limiting.md` | `> Not sure which to use? [Decision tree →](../decisions/rate-limiting)` |
| `transformation.md` | `> Not sure which to use? [Decision tree →](../decisions/transformation)` |
| `filtering.md` | `> Not sure which to use? [Decision tree →](../decisions/filtering)` |
| `combination.md` | `> Not sure which to use? [Decision tree →](../decisions/combination)` |
| `creation.md` | `> Not sure which to use? [Decision tree →](../decisions/creation)` |
| `multicasting.md` | `> Not sure which to use? [Decision tree →](../decisions/multicasting)` |
| `error-handling.md` | `> Not sure which to use? [Decision tree →](../decisions/error-handling)` |
| `side-effects.md` | `> Not sure which to use? [Decision tree →](../decisions/side-effects)` |
| `notification.md` | `> Not sure which to use? [Decision tree →](../decisions/notification)` |
| `scheduling-timing.md` | `> Not sure which to use? [Decision tree →](../decisions/scheduling-timing)` |

Use the Edit tool for each file. The `old_string` to match in every file is the first content line after the frontmatter. For example in `flattening.md`:

```
old_string: "Each source value is projected"
new_string: "> Not sure which to use? [Decision tree →](../decisions/flattening)\n\nEach source value is projected"
```

- [ ] **Build and verify**

```bash
npm run docs:build
```

- [ ] **Commit**

```bash
git add docs/categories/
git commit -m "feat: add decision-tree callouts to all category pages"
```

---

## Task 11 — Update VitePress sidebar

**Files:**
- Modify: `docs/.vitepress/config.ts`

- [ ] **Insert Decision Trees sidebar group**

In `docs/.vitepress/config.ts`, find the `sidebar` array. Insert the following group **between** the `'Suffix Reference'` group and the `'Operator Deep Dives'` group:

```typescript
{
    text: 'Decision Trees',
    items: [
        { text: 'Overview', link: '/decisions/' },
        { text: 'Higher-Order / Flattening', link: '/decisions/flattening' },
        { text: 'Windowing & Buffering', link: '/decisions/windowing-buffering' },
        { text: 'Rate Limiting', link: '/decisions/rate-limiting' },
        { text: 'Transformation', link: '/decisions/transformation' },
        { text: 'Filtering', link: '/decisions/filtering' },
        { text: 'Combination', link: '/decisions/combination' },
        { text: 'Creation', link: '/decisions/creation' },
        { text: 'Multicasting & Sharing', link: '/decisions/multicasting' },
        { text: 'Error Handling & Recovery', link: '/decisions/error-handling' },
        { text: 'Side Effects', link: '/decisions/side-effects' },
        { text: 'Notification Objects', link: '/decisions/notification' },
        { text: 'Scheduling & Timing', link: '/decisions/scheduling-timing' },
    ],
},
```

Also update the `nav` array to add a Decision Trees entry:

```typescript
{ text: 'Decision Trees', link: '/decisions/' },
```

- [ ] **Final build**

```bash
npm run docs:build
```

Expected: `build complete` with 123+ HTML pages rendered.

- [ ] **Commit**

```bash
git add docs/.vitepress/config.ts
git commit -m "feat: add Decision Trees sidebar group and nav entry"
```
