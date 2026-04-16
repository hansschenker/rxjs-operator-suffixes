# Advanced RxJS: The 4-Layer Model — Scripts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write 50 insight-driven narration scripts (5 per module × 10 modules) for the Advanced RxJS: The 4-Layer Model course.

**Architecture:** Each script is a self-contained Markdown file with YAML front-matter and four sections: Hook, Insight, Example, Summary. Scripts are organized by module directory under `scripts/`. All 10 module tasks are independent and can be executed in parallel.

**Tech Stack:** Markdown, YAML front-matter. Source material in `rxjs-what-is-it-meta-2026-04-16-summary.txt` and `rxjs-insight-questions.txt`.

---

## Script Template (apply to every lesson)

```markdown
---
module: N
lesson: "N.N"
title: <Lesson Title>
key_insight: <One-sentence claim this lesson proves>
---

## Hook

<!-- 2–3 sentences opening with a surprising or counterintuitive observation that creates a question in the student's mind -->

## Insight

<!-- The core idea explained plainly. ~150–200 words. No code yet — just the mental model. -->

## Example

<!-- A concrete, realistic scenario grounded in a TypeScript code snippet or ASCII marble diagram.
     ~100–150 words of prose + the snippet. Rules:
     - Tabs for indentation
     - Single quotes
     - Explicit TypeScript types
     - $ suffix on Observables
     - pipe() chains — never chain operators directly
     - No `any` type
     - Side effects only in tap()
     - No nested subscriptions -->

## Summary

- <!-- Take-away 1 the student can apply immediately -->
- <!-- Take-away 2 the student can apply immediately -->
- <!-- Take-away 3 (optional) -->
```

**Word count target:** 400–600 words total per script (Hook + Insight + Example prose + Summary bullets).

---

## File Structure

```
scripts/
  module-01/
    01-01-from-haskell-to-linq.md
    01-02-the-mathematical-dual.md
    01-03-iterator-plus-observer.md
    01-04-the-unified-type.md
    01-05-the-three-step-workflow.md
  module-02/
    02-01-what-really-happens-when-you-subscribe.md
    02-02-cold-vs-hot.md
    02-03-the-five-subscription-phases.md
    02-04-two-graphs-every-pipeline-builds.md
    02-05-the-three-observable-variants.md
  module-03/
    03-01-data-and-logic-are-separate.md
    03-02-referential-transparency.md
    03-03-subscribe-as-the-impure-boundary.md
    03-04-tap-vs-map.md
    03-05-rxjs-as-a-dsl.md
  module-04/
    04-01-the-three-primitives.md
    04-02-scan-building-state.md
    04-03-the-monad-laws.md
    04-04-t-only-operators.md
    04-05-operator-classification.md
  module-05/
    05-01-time-value-pairs.md
    05-02-lossy-vs-lossless.md
    05-03-throttle-and-debounce.md
    05-04-buffer-and-window.md
    05-05-rate-limiting-decision.md
  module-06/
    06-01-unicast-vs-multicast.md
    06-02-subject-as-proxy.md
    06-03-specialized-subject-variants.md
    06-04-share-and-sharereplay.md
    06-05-connectable.md
  module-07/
    07-01-map-to-observable-problem.md
    07-02-mergemap.md
    07-03-concatmap.md
    07-04-switchmap.md
    07-05-exhaustmap.md
  module-08/
    08-01-temporal-alignment.md
    08-02-combinelatest.md
    08-03-withlatestfrom.md
    08-04-zip-and-forkjoin.md
    08-05-merge-concat-race.md
  module-09/
    09-01-why-observables-terminate-on-error.md
    09-02-catcherror.md
    09-03-retry.md
    09-04-timeout-and-finalize.md
    09-05-error-handling-decision-tree.md
  module-10/
    10-01-alias-and-wrap-pattern.md
    10-02-hexagonal-architecture.md
    10-03-with-telemetry.md
    10-04-testscheduler-and-marbles.md
    10-05-the-four-layer-model-as-architecture.md
```

---

## Task 1 — Module 1: The DNA of RxJS

**Files — create all five:**
- `scripts/module-01/01-01-from-haskell-to-linq.md`
- `scripts/module-01/01-02-the-mathematical-dual.md`
- `scripts/module-01/01-03-iterator-plus-observer.md`
- `scripts/module-01/01-04-the-unified-type.md`
- `scripts/module-01/01-05-the-three-step-workflow.md`

**Source sections to draw from:** "Historical Context and Design Influences", "Duality of Pull and Push Models", "Iterator and Observer Pattern Integration", "Comparison of Arrays, Promises, and Observables", "RxJS Workflow and Pure Functional Patterns" (from `rxjs-what-is-it-meta-2026-04-16-summary.txt`)

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-01
```

- [ ] **Step 2: Write `01-01-from-haskell-to-linq.md`**

```markdown
---
module: 1
lesson: "1.1"
title: From Haskell to LINQ — the intellectual lineage of RxJS
key_insight: RxJS didn't invent its operator library — it copied 10 years of LINQ knowledge that already existed for arrays, making async programming feel familiar on day one.
---
```
Continue with Hook / Insight / Example / Summary.
- Hook: Most developers treat RxJS operators as a new vocabulary to memorize. They are not — they are a vocabulary you already know from arrays.
- Insight: Trace the lineage from Haskell list comprehensions → LINQ for IEnumerable → Rx.NET for IObservable → RxJS. Microsoft's key insight (Erik Meijer, 2009–2012) was that the same operator set applies to both pull (arrays) and push (async) collections. RxJS inherited 100+ operators for free.
- Example: Show `[1,2,3].filter(x => x > 1).map(x => x * 2)` side-by-side with `from([1,2,3]).pipe(filter(x => x > 1), map(x => x * 2))`. Same operators, different execution model.
- Summary: RxJS operators feel like array methods because they are; LINQ was the intellectual bridge; Erik Meijer's duality insight made the port possible.

- [ ] **Step 3: Write `01-02-the-mathematical-dual.md`**

```markdown
---
module: 1
lesson: "1.2"
title: The Mathematical Dual — how IEnumerable became IObservable
key_insight: IObservable is the mathematical dual of IEnumerable — flip the arrows on every method signature and you get push from pull, giving RxJS its entire operator vocabulary for free.
---
```
Continue with Hook / Insight / Example / Summary.
- Hook: Two data structures can look completely different and yet be the same thing with the arrows reversed. When Erik Meijer noticed this about iterables and observables, it unlocked a decade of free operator design.
- Insight: IEnumerable has `MoveNext(): bool` and `Current: T` — the consumer pulls values. IObservable has `OnNext(T)`, `OnError(Exception)`, `OnComplete()` — the producer pushes them. Flip every arrow (caller/callee, input/output) and you get the exact dual. This is not an analogy; it is a mathematical proof. Every operator proven correct for IEnumerable is automatically correct for IObservable.
- Example: ASCII table showing IEnumerable vs IObservable method signatures side-by-side with arrows reversed.
- Summary: Duality means RxJS operators are mathematically proven, not heuristically designed; pull vs push is the axis; learning one means you already know the other.

- [ ] **Step 4: Write `01-03-iterator-plus-observer.md`**

```markdown
---
module: 1
lesson: "1.3"
title: Iterator + Observer — the two GoF patterns RxJS fuses
key_insight: RxJS is what you get when you fuse the Iterator pattern (sequence operators) with the Observer pattern (push delivery) — each alone is incomplete; together they define reactive programming.
---
```
Continue with Hook / Insight / Example / Summary.
- Hook: The Gang of Four described both the Iterator and Observer patterns in 1994. Nobody thought to combine them for 15 years. When Microsoft did, RxJS became possible.
- Insight: Iterator pattern: pull values one at a time from a sequence using `.next()`. Gives you map, filter, reduce — but is synchronous and consumer-driven. Observer pattern: producer notifies many consumers via `onNext`/`onError`/`onComplete`. Gives you async delivery — but no operator vocabulary. RxJS fuses both: producer-driven delivery (Observer) with iterator-style operators and completion semantics (Iterator).
- Example: Show `EventEmitter` (Observer-only, no operators) vs `Observable` (Iterator + Observer — chainable operators on an async push source).
- Summary: Iterator alone is synchronous pull; Observer alone has no operators; Observable is their fusion; the fusion is what makes RxJS more than just an event emitter.

- [ ] **Step 5: Write `01-04-the-unified-type.md`**

```markdown
---
module: 1
lesson: "1.4"
title: The Unified Type — why Observable absorbs Arrays, Promises, and Events
key_insight: Observable is not one of many async types — it subsumes all of them. An Array is an Observable that completes synchronously; a Promise is an Observable that emits exactly once.
---
```
Continue with Hook / Insight / Example / Summary.
- Hook: Before RxJS you needed three different APIs for three different async scenarios. After RxJS you need one. That unification is not a coincidence — it follows directly from the mathematics of the dual.
- Insight: The arity-vs-time table (Sync/Async × Single/Multiple): `T` = sync single, `Array<T>` = sync multiple, `Promise<T>` = async single, `Observable<T>` = async multiple — and the bottom-right cell subsumes all others. `of(1,2,3)` is an Observable that behaves like an array. `from(promise)` is an Observable that behaves like a Promise. One type, one operator vocabulary, every async scenario.
- Example: Show the four-cell table as an ASCII grid, then `from(fetch('/api'))` and `from([1,2,3])` and `fromEvent(btn, 'click')` all using the same `.pipe(map(...))` operator.
- Summary: The unification table is the mental model; Observable is the bottom-right cell; `from()` converts any other type into it.

- [ ] **Step 6: Write `01-05-the-three-step-workflow.md`**

```markdown
---
module: 1
lesson: "1.5"
title: The 3-Step Workflow — enter, transform, exit
key_insight: Every RxJS program has exactly three zones — impure entry, pure transformation, impure exit — and code that puts side effects in the middle zone is the source of most RxJS bugs.
---
```
Continue with Hook / Insight / Example / Summary.
- Hook: The biggest source of RxJS bugs is not choosing the wrong operator. It is putting the right operator in the wrong zone.
- Insight: Zone 1 — Enter: creation operators (`fromEvent`, `interval`, `of`, `from`) convert impure sources into Observables. You cross from impure into pure here. Zone 2 — Transform: operators inside `pipe()` are pure functions. No side effects. Referentially transparent. Business logic lives here and is trivially testable. Zone 3 — Exit: `subscribe()` is the single impure boundary where planned side effects execute. `tap()` is the only exception — it peeks without exiting, useful for debugging.
- Example: A complete search typeahead showing all three zones clearly labelled in comments: `fromEvent` (enter), `pipe(debounceTime, switchMap)` (transform), `subscribe(renderResults)` (exit).
- Summary: Enter with creation operators; transform with pure operators in `pipe()`; exit once in `subscribe()`; `tap()` is the only permitted side effect inside the pipe.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-01/
git commit -m "feat: write Module 1 narration scripts — The DNA of RxJS"
```

---

## Task 2 — Module 2: The Observable Contract

**Files — create all five:**
- `scripts/module-02/02-01-what-really-happens-when-you-subscribe.md`
- `scripts/module-02/02-02-cold-vs-hot.md`
- `scripts/module-02/02-03-the-five-subscription-phases.md`
- `scripts/module-02/02-04-two-graphs-every-pipeline-builds.md`
- `scripts/module-02/02-05-the-three-observable-variants.md`

**Source sections:** "Observable Characteristics and Mental Models", "Cold vs Hot Observables and Subscription Sharing", "Subscription Lifecycle Management", "Observable Variants and Multicast Behavior"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-02
```

- [ ] **Step 2: Write `02-01-what-really-happens-when-you-subscribe.md`**

```markdown
---
module: 2
lesson: "2.1"
title: What really happens when you subscribe
key_insight: Calling subscribe() doesn't listen to an Observable — it creates a brand new execution of it. This single fact prevents the most common category of RxJS bugs.
---
```
- Hook: Most developers think of `subscribe()` as "start listening." That mental model is wrong — and it is the reason duplicate HTTP requests, race conditions, and unexpected side effects appear.
- Insight: An Observable is a blueprint — a function that describes work but does not do it. Calling `subscribe()` runs that function from scratch for this subscriber. Every separate `subscribe()` call is a separate execution: separate HTTP request, separate timer, separate state. The Observable itself holds no state. Contrast with a Promise, which is already executing when you `.then()` it — the work started at creation, not at observation.
- Example: Show `const data$ = ajax.getJSON('/api/data')` subscribed to twice — two separate network requests fire. Then show `shareReplay(1)` fixing it by sharing one execution.
- Summary: Observable = blueprint, subscribe = execution; two subscribes = two executions; use `share()` or `shareReplay(1)` to share one execution across subscribers.

- [ ] **Step 3: Write `02-02-cold-vs-hot.md`**

```markdown
---
module: 2
lesson: "2.2"
title: Cold vs Hot — the producer behavior distinction
key_insight: Hot and Cold describe the producer, not the Observable. A cold Observable creates a fresh producer per subscriber; a hot Observable shares one already-running producer with everyone.
---
```
- Hook: The terms "hot" and "cold" sound like they describe temperature. They describe whether the producer started before you arrived.
- Insight: Cold Observable: the producer is created inside `subscribe()`. Every subscriber gets their own private producer. HTTP requests, `interval()`, `of()` — all cold. Hot Observable: the producer exists independently of subscriptions. DOM events, WebSocket connections, `Subject` — all hot. A late subscriber to a cold Observable starts from the beginning. A late subscriber to a hot Observable joins mid-stream and misses past values. The same source can be made hot with `share()`.
- Example: `interval(1000)` subscribed twice 2 seconds apart — show both subscribers getting `0,1,2...` independently (cold). Then `interval(1000).pipe(share())` subscribed twice — show second subscriber joining at value `2` (hot).
- Summary: Cold = private producer per subscriber; Hot = shared already-running producer; `share()` converts cold to hot; whether a source is hot or cold determines whether late subscribers miss values.

- [ ] **Step 4: Write `02-03-the-five-subscription-phases.md`**

```markdown
---
module: 2
lesson: "2.3"
title: The five subscription phases
key_insight: A Subscription is not just a cancel handle — it is a lifecycle tracker with five ordered phases. Only one Error or Complete is ever delivered, and after either, the subscription is permanently closed.
---
```
- Hook: Every time you call `subscribe()`, you start a lifecycle. Most developers only know the last phase — Unsubscribe. Knowing all five is what separates developers who debug subscription leaks from those who create them.
- Insight: The five phases in order: (1) **Subscribe** — execution starts, teardown function is registered. (2) **Next** — zero or more values delivered to `next()`. (3) **Error** — one optional error delivered to `error()`, subscription terminates permanently. (4) **Complete** — one optional completion signal delivered to `complete()`, subscription terminates permanently. (5) **Unsubscribe** — manual cancellation; teardown function runs, all child subscriptions torn down. Key rule: once Error or Complete fires, the subscription is closed. Calling `unsubscribe()` on a closed subscription is a no-op (idempotent by design).
- Example: Show a `new Observable()` constructor with a teardown function returning `clearInterval(id)`. Show how that teardown fires on both `complete()` and `unsubscribe()`.
- Summary: Five phases; Error and Complete both permanently terminate; Unsubscribe is idempotent; always return a teardown function from custom Observables.

- [ ] **Step 5: Write `02-04-two-graphs-every-pipeline-builds.md`**

```markdown
---
module: 2
lesson: "2.4"
title: Two graphs every pipeline builds
key_insight: Every RxJS pipeline silently builds two graphs — a static dependency graph describing how values flow, and a dynamic subscription graph describing who tears down whom. Most memory leaks come from losing track of the second one.
---
```
- Hook: You can read an RxJS pipeline and understand what it transforms. You cannot read it and immediately see what it cleans up. The cleanup graph is invisible — until it leaks.
- Insight: **Dependency graph**: built by `pipe()`. Describes data transformation: source → operator → operator → subscriber. Static — exists even with zero subscribers. **Subscription graph**: built by `subscribe()`. Describes lifecycle: which subscription owns which child subscriptions and will tear them down on unsubscribe. Dynamic — built at runtime when `subscribe()` is called. Operators like `mergeMap` add child subscriptions to the parent dynamically as inner Observables are created. `unsubscribe()` on the root walks the entire tree and tears everything down. Leaks happen when a subscription is added to the graph but the root is never unsubscribed.
- Example: ASCII tree showing a `mergeMap` pipeline's subscription graph — root subscription owns operator subscriptions which own inner Observable subscriptions. Show `shareReplay` without `refCount` as a detached node that never gets torn down.
- Summary: `pipe()` builds the dependency graph; `subscribe()` builds the subscription graph; unsubscribe walks the subscription tree; leaks = nodes in the subscription graph that are never reached by unsubscribe.

- [ ] **Step 6: Write `02-05-the-three-observable-variants.md`**

```markdown
---
module: 2
lesson: "2.5"
title: The three Observable variants
key_insight: The three Observable variants — Standard, Connectable, Subject — differ on exactly one axis: when the producer starts. Everything else about multicasting follows from that single difference.
---
```
- Hook: RxJS has three types of Observable and most courses treat them as unrelated. They are the same concept at three points on a single axis: producer start time.
- Insight: **Standard Observable** (cold by default): producer starts inside `subscribe()`, one per subscriber. **ConnectableObservable**: producer starts when `.connect()` is called explicitly, shared with all subscribers. Gives manual control over producer lifecycle. Created via `connectable(source)`. **Subject as Observable**: producer is already running (it is the Subject itself), always hot. New subscribers get future values only. These three differ only in: does the producer start per-subscribe (Standard), on explicit connect (Connectable), or before anyone subscribes (Subject)?
- Example: Show all three variants producing values from the same `interval(1000)` source, demonstrate when each subscriber gets values relative to when the producer starts.
- Summary: Standard = producer per subscribe; Connectable = producer on `.connect()`; Subject = producer already running; `share()` and `shareReplay()` are ConnectableObservable with automatic connect lifecycle.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-02/
git commit -m "feat: write Module 2 narration scripts — The Observable Contract"
```

---

## Task 3 — Module 3: Functional RxJS

**Files — create all five:**
- `scripts/module-03/03-01-data-and-logic-are-separate.md`
- `scripts/module-03/03-02-referential-transparency.md`
- `scripts/module-03/03-03-subscribe-as-the-impure-boundary.md`
- `scripts/module-03/03-04-tap-vs-map.md`
- `scripts/module-03/03-05-rxjs-as-a-dsl.md`

**Source sections:** "Functional Programming Principles in RxJS", "Referential Transparency and Side Effects", "RxJS Workflow and Pure Functional Patterns", "RxJS as a Domain-Specific Language (DSL)"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-03
```

- [ ] **Step 2: Write `03-01-data-and-logic-are-separate.md`**

```markdown
---
module: 3
lesson: "3.1"
title: Data and Logic are separate
key_insight: In RxJS, Observable is the data and operators are the logic — the architecture enforces the functional programming separation whether you intend it or not.
---
```
- Hook: The hardest discipline in functional programming is keeping data and logic separate. RxJS enforces it structurally — not by convention, but by design.
- Insight: In FP, data is inert (a description of values) and logic is a transformation applied to data. In RxJS: Observable is inert data (a description of a value sequence). Operators are pure functions that take an Observable and return a new Observable — pure logic. The `pipe()` chain is the composition of logic over data. This separation is not just an aesthetic choice. It makes the logic testable in isolation (operators can be unit-tested with any Observable), composable (operators chain without side effects), and reusable across domains (the same operator works on DOM events, HTTP responses, sensor data — because operators don't care about the source).
- Example: Show a `priceUpdate$` Observable from a WebSocket source. Apply `pipe(filter, map, distinctUntilChanged)` — all pure logic, independent of the WebSocket source. Swap the source to `of(1,2,3)` for testing — same operators work unchanged.
- Summary: Observable = data description; operators = pure logic; `pipe()` = logic composition; the separation enables testing operators without their real sources.

- [ ] **Step 3: Write `03-02-referential-transparency.md`**

```markdown
---
module: 3
lesson: "3.2"
title: Referential transparency — the Observable as a reusable blueprint
key_insight: An Observable is referentially transparent until subscribe() is called — you can assign it, pass it, compose it, and duplicate it with no side effects.
---
```
- Hook: In most programming, assigning a value to a variable and then reading it twice gives you the same value twice. With Promises, you already know the work has started. With Observables, the work has not started at all.
- Insight: A function is referentially transparent if you can replace it with its return value without changing the program's behavior. `const double = (x: number): number => x * 2` is RT. An Observable is RT before subscribe: `const search$ = fromEvent(input, 'input').pipe(debounceTime(300))`. You can assign `search$` to ten variables, pass it to ten functions, compose it into ten pipelines — and nothing executes. The Observable is just a description. This is why Observables can be reused as building blocks: no hidden state, no execution, no consequences until subscribe.
- Example: Show the same `httpRequest$` Observable assigned to `const a$ = httpRequest$` and `const b$ = httpRequest$`. Neither has fired. Then `combineLatest([a$, b$]).subscribe(...)` — now two requests fire simultaneously and are combined. Contrast with Promise where the request fires at creation.
- Summary: Observable = referentially transparent blueprint; assign, pass, and compose freely before subscribe; subscribe is where transparency ends and execution begins.

- [ ] **Step 4: Write `03-03-subscribe-as-the-impure-boundary.md`**

```markdown
---
module: 3
lesson: "3.3"
title: subscribe() as the single impure boundary
key_insight: subscribe() is not an RxJS feature — it is the exit from functional programming. Keeping it at the outer edge of your app is the entire discipline of reactive architecture.
---
```
- Hook: In Haskell, `main()` is the single impure action that runs the entire pure program. In RxJS, `subscribe()` plays the same role. Most RxJS codebases have dozens of `subscribe()` calls scattered everywhere — each one is a `main()` that should not exist.
- Insight: Inside `pipe()`: pure, testable, no side effects. The code is a description of what should happen. At `subscribe()`: the description executes, side effects fire — DOM updates, HTTP requests, state mutations, logs. The further you push `subscribe()` toward the edges of your application, the more of your business logic is pure and testable. NgRx, Redux-Observable, and similar frameworks are architectural patterns that push `subscribe()` to a single framework-managed boundary — your code never calls it directly.
- Example: Show a "before" with `subscribe()` called three times deep in component methods. Show "after" with all three pipelines composed into one at the component boundary. Note the reduction in potential leak sites.
- Summary: Every `subscribe()` is an impure boundary; reduce the number of subscribe() calls; push them to the outer edge; framework effect systems (NgRx, Redux-Observable) do this structurally.

- [ ] **Step 5: Write `03-04-tap-vs-map.md`**

```markdown
---
module: 3
lesson: "3.4"
title: tap vs map — declaring side effects without breaking the pipeline
key_insight: map() must return a transformed value and must be pure. tap() declares a side effect that runs later without altering the value. Confusing the two is undetectable at compile time and breaks referential transparency silently.
---
```
- Hook: There is no TypeScript error, no ESLint warning, and no runtime exception when you put a side effect in `map()`. The pipeline works — and is now subtly broken in a way that only appears during testing or production.
- Insight: `map(fn)`: `fn` receives a value, must return a new value, must have no side effects. The return value becomes the next emission. `tap(fn)`: `fn` receives a value, its return value is ignored, the original value passes through unchanged. `tap` is for logging, metrics, dispatching Redux actions, or any other side effect that should not alter the stream. The distinction matters for referential transparency: a `map` with a side effect means the same pipeline run twice produces different side effects — breaking the guarantee that the pipeline is a description, not an execution.
- Example: Show `map(value => { console.log(value); return value * 2; })` — the side effect fires during the mapping, which makes the pipeline non-idempotent. Refactor to `tap(value => console.log(value)), map(value => value * 2)` — side effect declared separately, pipeline stays pure.
- Summary: `map` must be pure and return a transformed value; `tap` is the side-effect operator; never log, dispatch, or mutate inside `map`; `tap` runs but does not alter the stream.

- [ ] **Step 6: Write `03-05-rxjs-as-a-dsl.md`**

```markdown
---
module: 3
lesson: "3.5"
title: RxJS as a DSL for time-varying values
key_insight: RxJS is a Domain-Specific Language for time-varying values — like SQL for sets of rows, Regex for text patterns, CSS for visual style. The operator vocabulary is not arbitrary; it is the complete grammar of a language for describing data over time.
---
```
- Hook: SQL does not feel arbitrary because you know it is a language for talking about sets. Once you see RxJS as a language for talking about values over time, the operator vocabulary stops feeling like a list to memorize and starts feeling inevitable.
- Insight: Every DSL has a type it operates on and a grammar for transforming it. SQL: set of rows, grammar = SELECT/WHERE/JOIN. Regex: text patterns, grammar = quantifiers/groups/anchors. CSS: visual style, grammar = selectors/properties/values. RxJS: `Observable<T>`, grammar = creation/transformation/combination/time/sharing operators. A DSL makes the four basic scenarios first-class: (1) no Observable → create one, (2) one Observable → transform it, (3) many Observables → combine them, (4) nested Observables → flatten them. Every RxJS operator fits into one of these four scenarios.
- Example: Show the four-scenario classification of a real-world feature (e.g., autocomplete): `fromEvent` (scenario 1), `debounceTime + map` (scenario 2), nothing needed for scenario 3, `switchMap` (scenario 4). The whole feature is DSL grammar applied to four scenarios.
- Summary: RxJS is a DSL for `Observable<T>`; four scenarios cover every case; the operator vocabulary is the grammar; once you see the language, the operators stop being arbitrary.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-03/
git commit -m "feat: write Module 3 narration scripts — Functional RxJS"
```

---

## Task 4 — Module 4: Layer 1 — Values

**Files — create all five:**
- `scripts/module-04/04-01-the-three-primitives.md`
- `scripts/module-04/04-02-scan-building-state.md`
- `scripts/module-04/04-03-the-monad-laws.md`
- `scripts/module-04/04-04-t-only-operators.md`
- `scripts/module-04/04-05-operator-classification.md`

**Source sections:** "Fundamental Operators and Monad Laws", "Operator Classification and Testing"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-04
```

- [ ] **Step 2: Write `04-01-the-three-primitives.md`**

```markdown
---
module: 4
lesson: "4.1"
title: The three primitives — map, filter, flatMap
key_insight: Every value-based operator in RxJS is a composition of three primitives — map, filter, and flatMap. Master these three and you can derive all 60+ value operators from first principles.
---
```
- Hook: RxJS has over 100 operators. You do not need to learn 100 things. You need to learn three things and recognize everything else as a special case.
- Insight: `map`: 1-to-1 transform. Every emission produces exactly one new emission. `filter`: 1-to-0-or-1. Every emission either passes through unchanged or is dropped. `flatMap` (mergeMap): 1-to-many. Every emission produces an inner Observable, and every value from those inner Observables is emitted. All other value operators are combinations of these three: `tap` = `map` + discard return value. `take(n)` = `filter` with a counter. `scan` = `map` with accumulated state. `switchMap`, `concatMap`, `exhaustMap` = `flatMap` with different concurrency policies. This is not just trivia — it means you can reason about any operator by reducing it to its primitives.
- Example: Show `distinctUntilChanged` re-implemented as a stateful `filter`, and `pairwise` re-implemented as a stateful `map`, to demonstrate that all value operators reduce to the three primitives.
- Summary: map = 1:1; filter = 1:0-or-1; flatMap = 1:many; everything else is a composition; reduce unfamiliar operators to these three to understand their behavior.

- [ ] **Step 3: Write `04-02-scan-building-state.md`**

```markdown
---
module: 4
lesson: "4.2"
title: scan — building state from a stream
key_insight: scan is the Observable equivalent of Array.reduce — but it emits every intermediate accumulation, making it the primitive for building state machines from a stream of actions.
---
```
- Hook: `Array.reduce` transforms a list into a single value. `scan` does the same thing — but emits every step of the reduction as the stream progresses. That difference is the entire basis for reactive state management.
- Insight: `scan(reducer, seed)` takes an accumulator function and an initial value. For every emission, it calls `reducer(accumulator, value)` and emits the result as the new accumulator. The pattern `actions$.pipe(scan(reducer, initialState), shareReplay(1))` is a complete reactive store. Every time an action arrives, the reducer produces a new state and it is immediately shared with all subscribers. This is exactly how NgRx, Redux-Observable, and Akita work internally — `scan` is the primitive they are all built on.
- Example: Show a counter store: `action$` of `{type: 'increment'} | {type: 'decrement'}` piped through `scan(counterReducer, 0)` producing `0, 1, 2, 1, 2...` in response to actions.
- Summary: `scan` emits every intermediate accumulation; `reduce` emits only the final; `scan(reducer, initialState)` on an actions stream is a reactive store; this is the primitive behind NgRx and Redux-Observable.

- [ ] **Step 4: Write `04-03-the-monad-laws.md`**

```markdown
---
module: 4
lesson: "4.3"
title: The monad laws — why Observable composes predictably
key_insight: Observable obeys the monad laws — identity and associativity — which guarantees that operator chains always compose correctly, regardless of how you nest or reorder them.
---
```
- Hook: "Monad" sounds intimidating. The practical meaning is simple: if something obeys monad laws, you can refactor pipelines without breaking them — the laws are a guarantee that composition is safe.
- Insight: A monad requires three things: a type constructor (`Observable<T>`), a way to wrap a value (`of(value)` — the identity), and a way to flatten nested wrappings (`mergeMap` / `flatMap`). The laws: **Left identity**: `of(x).pipe(mergeMap(f))` is the same as `f(x)`. **Right identity**: `obs$.pipe(mergeMap(of))` is the same as `obs$`. **Associativity**: `obs$.pipe(mergeMap(f), mergeMap(g))` is the same as `obs$.pipe(mergeMap(x => f(x).pipe(mergeMap(g))))`. These guarantees mean you can extract, inline, and reorganize operator chains freely, and the behavior is preserved.
- Example: Show a refactor that extracts a `mergeMap` chain into a helper function and re-composes it — the monad laws guarantee the refactored version behaves identically.
- Summary: Monad laws = safe composition guarantee; `of` is identity, `mergeMap` is flatten; the laws let you refactor pipelines freely; RxJS operators compose correctly because Observable is a lawful monad.

- [ ] **Step 5: Write `04-04-t-only-operators.md`**

```markdown
---
module: 4
lesson: "4.4"
title: T-only operators — the purely value-based family
key_insight: T-only operators are the cheapest operators in RxJS — no timers, no buffers, no scheduler dependency. They are synchronous value transformations and are always safe to test without TestScheduler.
---
```
- Hook: Not all operators are equal in cost. Some spawn timers. Some allocate buffers. Some depend on the scheduler. T-only operators do none of these things — and knowing which operators are T-only tells you immediately what their performance and testing characteristics are.
- Insight: T-only operators have the signature `(value: T) => ...` — they only need the current emission value and nothing else. Examples: `map`, `filter`, `tap`, `scan`, `take`, `skip`, `distinctUntilChanged`, `pluck`. They are synchronous: for every input emission there is zero or one output emission in the same tick. They allocate no timers and carry no internal scheduler dependency. This means: (1) they run at full speed, (2) they are testable with simple `of()` sources — no `TestScheduler` needed, (3) bugs in them are value-logic bugs, not timing bugs.
- Example: Show a pure T-only pipeline (`map + filter + scan`) tested with `of(1,2,3,4,5)` synchronously — no marble diagrams, no async, just standard `expect()` assertions.
- Summary: T-only = synchronous value transform; no timers, no buffers; testable with `of()` and synchronous assertions; if a bug only appears in time-related scenarios, the culprit is not a T-only operator.

- [ ] **Step 6: Write `04-05-operator-classification.md`**

```markdown
---
module: 4
lesson: "4.5"
title: Operator classification — T-only vs T+time vs time-only
key_insight: Classifying an operator before using it — T-only, T+time, or time-only — tells you its cost, its testability, and whether it can introduce timing bugs. One classification does three jobs.
---
```
- Hook: When a stream behaves unexpectedly, the first diagnostic question is: which operator class is the culprit? The class tells you whether to look at your values, your timing, or both.
- Insight: Three classes: **T-only** `(value: T) => ...`: only cares about the value. Synchronous. Cheap. Testable without TestScheduler. **Time-only** `(time) => ...`: only cares about when emissions arrive — the value is irrelevant. Examples: `debounceTime`, `throttleTime`, `delay`, `interval`. Requires TestScheduler to test deterministically. **T+time** `(value: T, time) => ...`: cares about both. Examples: `bufferTime`, `windowTime`, `auditTime`, state machines triggered by value and duration. Most expensive class — allocates buffers and timers. Debugging strategy: value bug → look at T-only operators. Timing bug → look at time-only operators. Value-and-timing bug → look at T+time operators.
- Example: Classify five operators in a real pipeline: `map` (T-only), `debounceTime` (time-only), `bufferTime` (T+time), `filter` (T-only), `distinctUntilChanged` (T-only). Then identify which class to check when the pipeline emits wrong values at the wrong times.
- Summary: T-only = value only, synchronous; time-only = timing only, needs TestScheduler; T+time = both, most complex; classification guides debugging and test strategy.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-04/
git commit -m "feat: write Module 4 narration scripts — Layer 1: Values"
```

---

## Task 5 — Module 5: Layer 2 — Time

**Files — create all five:**
- `scripts/module-05/05-01-time-value-pairs.md`
- `scripts/module-05/05-02-lossy-vs-lossless.md`
- `scripts/module-05/05-03-throttle-and-debounce.md`
- `scripts/module-05/05-04-buffer-and-window.md`
- `scripts/module-05/05-05-rate-limiting-decision.md`

**Source sections:** "Temporal vs Spatial Data Structures", "Lossy vs Lossless Operators and Use Cases", "Time-Based Operators and Rate Limiting", "Buffering and Windowing Operators"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-05
```

- [ ] **Step 2: Write `05-01-time-value-pairs.md`**

```markdown
---
module: 5
lesson: "5.1"
title: Observables as sequences of (time, value) pairs
key_insight: An Observable is not a sequence of values — it is a sequence of (time, value) pairs. The time dimension is always present, even when you ignore it. Time operators make the implicit explicit.
---
```
- Hook: You have been thinking of an Observable as a list of values that arrive asynchronously. That model is incomplete. Every value arrives at a specific moment, and that moment is part of the data.
- Insight: Formally: `Observable<T>` = `[...(timestamp, T)]` ordered by timestamp. The `timestamp()` operator makes this explicit by wrapping each emission in `{ value: T, timestamp: number }`. Array organizes by position (spatial). Observable organizes by moment (temporal). The distinction matters because: spatial data supports random access (give me index 5). Temporal data supports only sequential access (you get values as they arrive). The length is unknown (possibly infinite). You do not drive the iteration — the Observable drives you. This temporal nature is why array methods translate to Observable operators but the semantics change: `Array.filter` is a memory operation; `Observable.filter` is a real-time gate.
- Example: Show `interval(1000).pipe(timestamp())` emitting `{value: 0, timestamp: 1713260000000}, {value: 1, timestamp: 1713261000000}...` — making the temporal model concrete.
- Summary: Observable = `[(timestamp, value)]`; time is always a dimension; T-only operators ignore time; time operators act on the temporal dimension; `timestamp()` makes the implicit explicit.

- [ ] **Step 3: Write `05-02-lossy-vs-lossless.md`**

```markdown
---
module: 5
lesson: "5.2"
title: Lossy vs lossless — the fundamental time tradeoff
key_insight: Every time operator makes one binary choice — drop values to control rate (lossy) or group values to keep everything (lossless). Choose wrong and you either lose critical data or overwhelm the system.
---
```
- Hook: A search box that fires a request on every keystroke is not a UX problem — it is a rate problem. The question is not whether to control the rate, but whether you can afford to drop values in doing so.
- Insight: **Lossy operators** drop values on purpose to control the emission rate. The lost values are gone permanently. Examples: `throttleTime`, `debounceTime`, `auditTime`, `sampleTime`, `switchMap` (cancels previous). Use when: UI responsiveness, noise reduction, preventing API spam, and the dropped values carry no unique information that must be processed. **Lossless operators** group values without dropping any. All values are eventually processed. Examples: `bufferTime`, `bufferCount`, `windowTime`, `concatMap` (queues everything). Use when: audit logs, financial transactions, analytics events, message queues — any scenario where losing a value is unacceptable. The rule: if 1000 values arrive in 1 second and you cannot process all 1000, decide first whether any of those values are critical. If yes, use a lossless operator. If no, use a lossy one.
- Example: Show click$ being handled with `throttleTime(500)` (lossy — fast double-clicks are dropped) vs `bufferTime(500)` (lossless — all clicks are collected into arrays). Show when each is appropriate.
- Summary: Lossy = drop values to control rate; lossless = group values to keep everything; decide by asking whether dropped values are acceptable; UI responsiveness = lossy, analytics/financial = lossless.

- [ ] **Step 4: Write `05-03-throttle-and-debounce.md`**

```markdown
---
module: 5
lesson: "5.3"
title: The throttle and debounce families
key_insight: throttle and debounce solve opposite problems — throttle gives immediate feedback then blocks; debounce waits for silence before emitting. Using debounce where you need responsiveness is the most common time-operator mistake.
---
```
- Hook: Throttle and debounce both reduce emission frequency. But they have completely different effects on user experience. A developer who uses one when they need the other ships a noticeably broken interaction.
- Insight: **throttle**: emits the first value immediately, then ignores subsequent values for the specified duration. Leading edge behavior. Good for: rate-limiting user actions where immediate feedback is critical (scroll, drag, resize, game input). The user always gets instant response. **debounce**: waits until a specified silence period has elapsed since the last emission, then emits. Trailing edge behavior. Good for: search typeahead, form validation, autocomplete — where you want to wait until the user has stopped typing before firing. Key difference: throttle responds immediately; debounce delays. If you debounce a button that should feel instant, the UI feels laggy. If you throttle a search box, you get searches mid-word. Both have `Time` variants (`throttleTime`, `debounceTime`) for fixed durations and signal variants (`throttle`, `debounce`) for dynamic windows.
- Example: ASCII marble diagram showing the same rapid click sequence through `throttleTime(500)` vs `debounceTime(500)` — throttle emits at the start of each burst, debounce emits after each burst ends.
- Summary: throttle = immediate then block; debounce = wait for silence; use throttle for responsive interactions; use debounce for waiting for user to finish; both are lossy.

- [ ] **Step 5: Write `05-04-buffer-and-window.md`**

```markdown
---
module: 5
lesson: "5.4"
title: The buffer and window families
key_insight: buffer and window are the lossless cousins of throttle and debounce — they collect values into arrays or inner Observables instead of dropping them. Use them whenever losing a value is not an option.
---
```
- Hook: Every time you reach for `debounceTime` or `throttleTime`, ask once: can I afford to drop values? If the answer is no, `bufferTime` or `windowTime` is the operator you actually need.
- Insight: **buffer**: collects emissions into arrays and emits the array. Variants: `bufferTime(ms)` — emit an array every N ms; `bufferCount(n)` — emit an array every N values; `buffer(signal$)` — emit an array whenever a signal Observable emits. **window**: like buffer but emits inner Observables instead of arrays. Use `window` when you need to apply operators to each group (e.g., `window` + `mergeMap(w$ => w$.pipe(max()))`). Use `buffer` when you just need arrays. Both are lossless: every input value ends up in exactly one output group. Common use cases: batch processing server events, grouping analytics clicks by time window, collecting gesture touches into sequences.
- Example: Show server-sent events collected with `bufferTime(5000)` for batch database writes — every event is captured and written in batches. Contrast with `throttleTime(5000)` which would drop 99% of events.
- Summary: buffer emits arrays; window emits inner Observables; both are lossless; `bufferTime` for time-batching, `bufferCount` for count-batching; prefer buffer over window unless you need to operate on the inner stream.

- [ ] **Step 6: Write `05-05-rate-limiting-decision.md`**

```markdown
---
module: 5
lesson: "5.5"
title: Choosing the right rate-limiting operator
key_insight: The rate-limiting operator decision reduces to two questions — can data be lost, and do I need leading, trailing, or periodic behavior? Answer both and the operator selects itself.
---
```
- Hook: There are nine rate-limiting operators in RxJS. Nine is a lot to memorize. Two questions reduces nine to one.
- Insight: Decision framework: **Question 1: Can data be lost?** Yes → lossy family (throttle/debounce/audit/sample). No → lossless family (buffer/window). **Question 2 (lossy only): When should the emission happen?** Leading edge (first of a burst) → `throttleTime`. Trailing edge (after silence) → `debounceTime`. Fixed interval regardless of input → `auditTime`. On external signal → `sample`. The full decision: (a) Can't lose data? → `bufferTime` or `bufferCount`. (b) Need immediate response? → `throttleTime`. (c) Need to wait for user to finish? → `debounceTime`. (d) Need fixed window sampling? → `auditTime`. (e) Need external clock? → `sample`. The meta-rule: if 100 values arrive in 1 ms, what should happen? Buffer all? Emit the first? Emit the last after silence? That question determines the operator.
- Example: Walk through four scenarios — search typeahead (debounce), scroll handler (throttle), analytics heartbeat (audit or sample), financial event log (buffer) — and show how the two-question framework arrives at each answer.
- Summary: Two questions: can data be lost? when should it emit? Answer both to pick the operator; meta-rule: "if 100 values arrive in 1ms, what should happen?" selects the correct family instantly.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-05/
git commit -m "feat: write Module 5 narration scripts — Layer 2: Time"
```

---

## Task 6 — Module 6: Layer 3 — Sharing

**Files — create all five:**
- `scripts/module-06/06-01-unicast-vs-multicast.md`
- `scripts/module-06/06-02-subject-as-proxy.md`
- `scripts/module-06/06-03-specialized-subject-variants.md`
- `scripts/module-06/06-04-share-and-sharereplay.md`
- `scripts/module-06/06-05-connectable.md`

**Source sections:** "Unicast vs Multicast Communication Styles", "Subjects as Multicast Proxies", "Multicasting and Subject Variants", "Share and ShareReplay Mechanics", "Connectable Observables and Manual Control"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-06
```

- [ ] **Step 2: Write `06-01-unicast-vs-multicast.md`**

```markdown
---
module: 6
lesson: "6.1"
title: Unicast vs multicast — the consumer behavior distinction
key_insight: Hot/Cold describes the producer; Unicast/Multicast describes the consumer. A cold Observable is always unicast. Understanding both axes independently prevents the most common multicasting bugs.
---
```
- Hook: Most explanations of hot vs cold and unicast vs multicast treat them as the same concept. They are not. Confusing them leads to bugs that are almost impossible to reason about.
- Insight: **Hot/Cold** = producer axis. Cold: producer is created fresh for each subscription. Hot: producer exists independently, already running. **Unicast/Multicast** = consumer axis. Unicast: one producer serves exactly one consumer. Multicast: one producer serves N consumers simultaneously. The combination: a cold Observable is by definition unicast (each subscriber gets their own producer). A hot Observable may be unicast (if only one subscriber exists) or multicast (if multiple subscribers share the producer). `share()` converts a cold-unicast Observable to hot-multicast by wrapping it in a Subject. The decision: does each subscriber need their own execution (unicast), or should they all share one execution (multicast)?
- Example: Show `ajax.get('/api')` (cold-unicast, two subscriptions = two requests) vs `ajax.get('/api').pipe(share())` (hot-multicast, two subscriptions = one request, values shared).
- Summary: Hot/Cold = producer; Unicast/Multicast = consumer; cold always implies unicast; hot can be either; `share()` converts cold-unicast to hot-multicast.

- [ ] **Step 3: Write `06-02-subject-as-proxy.md`**

```markdown
---
module: 6
lesson: "6.2"
title: Subject as a multicast proxy
key_insight: A Subject is simultaneously an Observer and an Observable — it receives values on its Observer interface and forwards them to all subscribers on its Observable interface, making it the primitive behind all multicasting.
---
```
- Hook: How does RxJS share one stream across multiple subscribers? Not with magic — with a Subject sitting in the middle, acting as both producer and consumer at once.
- Insight: A Subject implements both `Observer<T>` (has `next()`, `error()`, `complete()`) and `Observable<T>` (has `subscribe()`). You push values into it via `next()`. Multiple subscribers receive those values simultaneously via `subscribe()`. The Subject maintains an internal list of subscribers and multicasts every incoming value to all of them. This is the primitive: `share()` creates a Subject internally and pipes the source through it. `shareReplay()` creates a `ReplaySubject` internally. Everything about multicasting in RxJS reduces to: "there is a Subject in the middle." Important: never expose a Subject directly. Instead, expose it as an Observable via `.asObservable()` to hide the `next()` method from consumers.
- Example: Show a `Subject<string>` used as an event bus: two different components subscribe to it; a third component calls `.next('message')` and both subscribers receive it simultaneously.
- Summary: Subject = Observer + Observable; maintains subscriber list; multicasts every `next()` to all subscribers; is the primitive behind `share()` and `shareReplay()`; expose via `.asObservable()` to hide the push interface.

- [ ] **Step 4: Write `06-03-specialized-subject-variants.md`**

```markdown
---
module: 6
lesson: "6.3"
title: The three specialized Subject variants
key_insight: BehaviorSubject, ReplaySubject, and AsyncSubject each answer a different question about time — What is the current value? What were the last N values? What was the final value?
---
```
- Hook: A plain Subject has no memory. Subscribe after all the values have been emitted and you see nothing. The three specialized variants solve this by adding different kinds of temporal memory.
- Insight: **BehaviorSubject(initialValue)**: stores the current value. New subscribers immediately receive the latest value on subscription. Requires an initial value. The `.value` getter returns the current value synchronously. Use for: current user, feature flags, form state, any state with a meaningful current value. **ReplaySubject(n)**: stores the last N emissions. New subscribers receive the last N values in order on subscription. Use for: recent event history, caching last N results, joining a stream mid-way with context. **AsyncSubject**: stores nothing during the stream. Emits only the last value, and only when `complete()` is called. Use for: representing the result of an async computation where only the final value matters (similar to `last()` operator). Key gotcha: `ReplaySubject` without a buffer size limit causes memory leaks on long-running streams — always bound the buffer.
- Example: Show all three: `BehaviorSubject` for a current user state, `ReplaySubject(3)` for recent navigation history, `AsyncSubject` for a one-shot initialization result.
- Summary: BehaviorSubject = current value, requires initial; ReplaySubject(n) = last N values; AsyncSubject = final value on complete; always bound ReplaySubject buffer size; never expose Subject directly.

- [ ] **Step 5: Write `06-04-share-and-sharereplay.md`**

```markdown
---
module: 6
lesson: "6.4"
title: share() and shareReplay() — mechanics, configuration, and gotchas
key_insight: share() is a live radio broadcast — late subscribers miss what aired. shareReplay(1) is YouTube — late subscribers start from the last frame. Choosing wrong causes either stale data or memory leaks.
---
```
- Hook: `share()` and `shareReplay(1)` look similar and are both used for multicasting. They have completely different behavior for late subscribers — and one of them leaks memory if misconfigured.
- Insight: **`share()`**: creates a `Subject` internally. When the first subscriber arrives, it connects to the source (refCount = 1). When the last subscriber leaves (refCount = 0), it disconnects — the source unsubscribes. Late subscribers after refCount hits 0 trigger a new connection. Late subscribers within an active session join the live stream but miss past values. **`shareReplay({ bufferSize: 1, refCount: true })`**: creates a `ReplaySubject(1)` internally. Late subscribers immediately receive the last emitted value. With `refCount: true`: disconnects when refCount hits 0 (safe). With `refCount: false` (old default in RxJS 6): never disconnects — leaks the source subscription permanently. **Rule**: always use `shareReplay({ bufferSize: 1, refCount: true })`. Never use `shareReplay()` with no configuration.
- Example: Show an HTTP request with `shareReplay({ bufferSize: 1, refCount: true })` — the first subscriber triggers the request, subsequent subscribers get the cached response immediately, and after all unsubscribe the cache is cleared.
- Summary: `share()` = live broadcast, no history; `shareReplay(1)` = YouTube, replays last value; always configure `refCount: true`; `shareReplay()` without config leaks in RxJS 6; put `shareReplay` last in the chain to cache transformed values.

- [ ] **Step 6: Write `06-05-connectable.md`**

```markdown
---
module: 6
lesson: "6.5"
title: connectable() — manual control over when the producer starts
key_insight: connectable() exposes the producer lifecycle directly — you decide when it starts. share() and shareReplay() are convenient presets built on connectable() that hide this control behind automatic refCount logic.
---
```
- Hook: `share()` and `shareReplay()` make multicasting automatic. But sometimes you need to start the producer before anyone subscribes, or keep it running after everyone unsubscribes. For those cases, `connectable()` is the primitive.
- Insight: `connectable(source, { connector: () => new Subject() })` returns a `ConnectableObservable`. Subscribers can register on it without starting the source. The source starts only when `.connect()` is called explicitly. This gives you full lifecycle control: start the producer before any subscriber arrives (warm up a WebSocket), keep the producer running even after all subscribers leave (maintain a server connection), stop the producer manually at a specific time. `share()` = `connectable()` + `refCount()` (auto-connect on first subscribe, auto-disconnect on last unsubscribe). `shareReplay()` = `connectable()` + `ReplaySubject` + manual connect. Use `connectable()` when you need to reason about the producer lifecycle explicitly — debugging, initialization sequences, or when the automatic refCount behavior of `share()` is incorrect for your use case.
- Example: Show a WebSocket source connected via `connectable()` — the connection is started during app initialization before any component subscribes, and components subscribe to the `ConnectableObservable` independently.
- Summary: `connectable()` = manual producer lifecycle; `.connect()` starts the source; `share()` = `connectable()` + auto-refCount; use `connectable()` when you need to start the producer before the first subscriber or keep it running after the last.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-06/
git commit -m "feat: write Module 6 narration scripts — Layer 3: Sharing"
```

---

## Task 7 — Module 7: Layer 4 — Flattening

**Files — create all five:**
- `scripts/module-07/07-01-map-to-observable-problem.md`
- `scripts/module-07/07-02-mergemap.md`
- `scripts/module-07/07-03-concatmap.md`
- `scripts/module-07/07-04-switchmap.md`
- `scripts/module-07/07-05-exhaustmap.md`

**Source sections:** "Flattening Operators and Concurrency Control", "Concurrency Control and Flattening Operators"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-07
```

- [ ] **Step 2: Write `07-01-map-to-observable-problem.md`**

```markdown
---
module: 7
lesson: "7.1"
title: The "map to Observable" problem
key_insight: When you map a value to an async operation, you get an Observable<Observable<T>> — which is useless. The four flattening operators exist to solve this single problem, each with a different concurrency policy.
---
```
- Hook: The most common thing developers do wrong with RxJS: using `map()` to start an HTTP request. It compiles. TypeScript does not complain. The resulting type is `Observable<Observable<HttpResponse>>`, and your template renders `[object Object]`.
- Insight: `map(value => ajax.get(url))` produces an Observable that emits Observable<Response> objects — not Response objects. You need to subscribe to each inner Observable and forward its values to the outer stream. This is "flattening." The four operators all do this: they take `(value: T) => Observable<R>` and produce `Observable<R>` — no nested Observables in the output. The difference between them is the concurrency policy: what happens when a new outer value arrives while a previous inner Observable is still running? That single question has four answers, and each answer is one of the four operators.
- Example: Show `userIds$.pipe(map(id => ajax.get(`/users/${id}`)))` producing `Observable<Observable<...>>`, then show `mergeMap` fixing it to produce `Observable<User>`. Emphasize that map + subscribe inside would be a nested subscription anti-pattern.
- Summary: `map` to an async operation produces nested Observables; never subscribe inside map; use a flattening operator; the four operators differ only in concurrency policy.

- [ ] **Step 3: Write `07-02-mergemap.md`**

```markdown
---
module: 7
lesson: "7.2"
title: mergeMap — parallel, unbounded concurrency
key_insight: mergeMap subscribes to every inner Observable immediately, concurrently, with no limit. This makes it ideal for independent parallel work — and a source of connection explosions if the source emits faster than inner Observables complete.
---
```
- Hook: mergeMap is the flatMap you reach for first. It is also the one most likely to bring down a server if you use it on a fast source without a concurrency limit.
- Insight: `mergeMap(project, concurrency?)`: for every outer value, immediately creates a new inner Observable subscription. Runs all inner Observables in parallel. Emits values from all inner Observables as they arrive — output order is not guaranteed. If a previous inner Observable is still running when a new outer value arrives: both run simultaneously. By default, concurrency is unlimited. `mergeMap(project, 3)` limits concurrent inner subscriptions to 3 — new outer values are queued until a slot opens. When to use: loading multiple images in parallel, independent file uploads, parallel API calls where order doesn't matter, tasks where every result is equally important and results can interleave freely.
- Example: Show `imageIds$.pipe(mergeMap(id => loadImage(id), 4))` — loads 4 images in parallel, queues the rest. Show the output arriving out of order (image 3 loads faster than image 1).
- Summary: mergeMap = all in parallel; output order not guaranteed; limit concurrency with second argument; use when work is independent and ordering doesn't matter; unbounded on fast sources can exhaust connections.

- [ ] **Step 4: Write `07-03-concatmap.md`**

```markdown
---
module: 7
lesson: "7.3"
title: concatMap — serial, ordered execution
key_insight: concatMap never subscribes to a new inner Observable until the previous one completes. This enforces serial ordering — and silently builds an unbounded queue if inner Observables are slow.
---
```
- Hook: If you have ever needed to ensure that a sequence of async operations runs in exactly the order they were requested — not in parallel, not skipping any — concatMap is the only operator that provides this guarantee.
- Insight: `concatMap(project)`: subscribes to the inner Observable for the first outer value and waits for it to complete before subscribing to the inner Observable for the second outer value. Effectively: concurrency = 1, strict ordering guaranteed. If 5 outer values arrive while the first inner Observable is running, they all queue. When the first inner Observable completes, the second starts; when it completes, the third starts; and so on. Memory risk: if the source is fast and inner Observables are slow, the queue grows unboundedly. Use when: database writes that must happen in sequence, animations that must not overlap, save operations, user action logs, any case where the order of execution is semantically important.
- Example: Show `saveActions$.pipe(concatMap(action => saveToServer(action)))` — each save completes before the next begins, even if the user triggers multiple saves rapidly. Contrast with mergeMap where saves could complete out of order and overwrite each other.
- Summary: concatMap = serial, one at a time; ordering guaranteed; output order matches input order; slow inner Observables build a queue; use for ordered writes, animations, anything that must not run concurrently.

- [ ] **Step 5: Write `07-04-switchmap.md`**

```markdown
---
module: 7
lesson: "7.4"
title: switchMap — cancel on new, built for live queries
key_insight: switchMap cancels the previous inner Observable every time a new outer value arrives. This makes it correct for live queries and wrong for operations where every result must be processed.
---
```
- Hook: switchMap is the most seductive flattening operator. It handles the search typeahead scenario so elegantly that developers start using it everywhere — including for save operations, where it silently drops in-flight writes.
- Insight: `switchMap(project)`: when a new outer value arrives, it immediately unsubscribes from the currently active inner Observable and subscribes to a new one. Concurrency = 1, always the latest. Previous inner Observables that are still in-flight are cancelled and their results are discarded. Perfect for: live queries where only the latest result matters (typeahead, filter panels, live search, loading a profile when a user is selected). Wrong for: any operation where every result must be processed (saves, writes, logging, analytics). A save with `switchMap` means: if the user types quickly, the first save request is cancelled and the second save fires. The first write may never complete.
- Example: ASCII marble diagram: outer values `a--b--c` with inner Observables `a...result_a`, `b...result_b`, `c...result_c`. switchMap cancels `a` when `b` arrives, cancels `b` when `c` arrives. Only `result_c` reaches the subscriber.
- Summary: switchMap = cancel previous, subscribe to latest; one active inner Observable at a time; correct for live queries; wrong for writes/saves; the "latest result only" operator.

- [ ] **Step 6: Write `07-05-exhaustmap.md`**

```markdown
---
module: 7
lesson: "7.5"
title: exhaustMap — ignore while busy, prevent double-submit
key_insight: exhaustMap ignores all new outer values while an inner Observable is active. This makes double-execution structurally impossible — and silently drops user intent if the inner Observable takes too long.
---
```
- Hook: A user clicks "Submit" twice because the network is slow. With mergeMap, two requests fire. With switchMap, the first is cancelled. With exhaustMap, the second click is ignored entirely. Only one of these is correct for a form submit.
- Insight: `exhaustMap(project)`: when an inner Observable is active, all new outer values are ignored — not queued, not processed, silently dropped. When the inner Observable completes, the operator becomes receptive again. Concurrency = 0 or 1: either idle (ready for the next outer value) or busy (ignoring everything). Perfect for: login buttons, form submit buttons, payment triggers, any action that must not fire twice before completing. Risk: if the inner Observable never completes or errors, the operator gets stuck permanently. Always ensure inner Observables terminate. If the user's intent is genuinely lost (they clicked three times and only one action fires), that may be exactly correct — or it may be a UX problem.
- Example: Show `submitBtn$.pipe(exhaustMap(() => submitForm$))` — rapid button clicks during form submission are ignored. The spinner stays active until the request completes, then the next click is accepted.
- Summary: exhaustMap = ignore while busy; double-execution is structurally impossible; use for submit buttons, login, payment; ensure inner Observables complete; drops user intent intentionally.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-07/
git commit -m "feat: write Module 7 narration scripts — Layer 4: Flattening"
```

---

## Task 8 — Module 8: Combining Streams

**Files — create all five:**
- `scripts/module-08/08-01-temporal-alignment.md`
- `scripts/module-08/08-02-combinelatest.md`
- `scripts/module-08/08-03-withlatestfrom.md`
- `scripts/module-08/08-04-zip-and-forkjoin.md`
- `scripts/module-08/08-05-merge-concat-race.md`

**Source sections:** "Combining Streams and Temporal Alignment", "Combining Multiple Observables"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-08
```

- [ ] **Step 2: Write `08-01-temporal-alignment.md`**

```markdown
---
module: 8
lesson: "8.1"
title: Temporal alignment — the question behind every combining operator
key_insight: Every combining operator answers the same two questions — when do I emit, and which values do I use? There are only a handful of answers, and each one maps directly to a specific operator.
---
```
- Hook: There are over a dozen combining operators in RxJS. You do not need to memorize them all. You need to answer two questions, and the operator appears.
- Insight: **Question 1: When do I emit?** (a) Whenever any source emits → `combineLatest`. (b) Only when the primary source emits → `withLatestFrom`. (c) When both sources have emitted a new value each → `zip`. (d) When all sources complete → `forkJoin`. (e) As values arrive from any source → `merge`. **Question 2: Which values do I combine?** (a) Latest from all sources → `combineLatest`, `withLatestFrom`. (b) Paired by position → `zip`. (c) Final value from each → `forkJoin`. (d) Each value individually → `merge`, `concat`. This framework reduces nine operators to two questions. The common mistake: using `combineLatest` when you mean `withLatestFrom` — triggering output on secondary source changes instead of only primary changes.
- Example: A form with three inputs: "When filters change, load new data." Translate: primary = filter changes, context = current user. → `withLatestFrom`. "Show form validity when any field changes." Translate: whenever any field emits, recompute. → `combineLatest`.
- Summary: Two questions: when to emit? which values? Answer both and the operator selects itself; the most common mistake is combineLatest when withLatestFrom is correct.

- [ ] **Step 3: Write `08-02-combinelatest.md`**

```markdown
---
module: 8
lesson: "8.2"
title: combineLatest — reactive derived state
key_insight: combineLatest emits whenever any source emits, always using the latest value from every source. It is the reactive equivalent of a derived computation — recomputed automatically when any dependency changes.
---
```
- Hook: In a spreadsheet, a formula cell recomputes whenever any input cell changes. combineLatest is the spreadsheet formula for streams.
- Insight: `combineLatest([a$, b$, c$])`: emits a `[a, b, c]` tuple whenever any of the three sources emits a new value, always using the most recent value from each source. Does not emit until all sources have emitted at least once (use `startWith` to seed sources that may not emit immediately). Lossless in terms of latest values — you always have the current state of all sources. Gotcha: if two sources emit synchronously (in the same tick), `combineLatest` may emit twice with glitched intermediate state. Use `distinctUntilChanged()` after `combineLatest` for derived state to prevent acting on glitch emissions. Use for: form validation across multiple fields, dashboard panels that recompute when any data changes, derived state that depends on multiple streams.
- Example: Show form validity: `combineLatest([email$, password$, confirmPassword$]).pipe(map(([e, p, cp]) => isValid(e, p, cp)), distinctUntilChanged())` — validity recomputes on every field change.
- Summary: emits on any source change; uses latest from all; requires all sources to have emitted; use `startWith` to seed; use `distinctUntilChanged` to avoid glitch emissions; the reactive derived state operator.

- [ ] **Step 4: Write `08-03-withlatestfrom.md`**

```markdown
---
module: 8
lesson: "8.3"
title: withLatestFrom — actions with context
key_insight: withLatestFrom emits only when the primary source emits, grabbing the latest values from secondary sources as context. Secondary source emissions never trigger output — making it the correct operator for actions that need context.
---
```
- Hook: The most common misuse of combineLatest: using it when a secondary stream changes and accidentally triggering the action twice. withLatestFrom exists specifically to prevent this.
- Insight: `primary$.pipe(withLatestFrom(secondary$))`: emits a `[primary, secondary]` tuple only when `primary$` emits. `secondary$` is read for its latest value — it never triggers output on its own. This is "sampling" the context, not reacting to it. Use for: save button click that needs the current form values (click = primary, form = context), dispatching an action that needs current user state (action = primary, user = context), any pattern where "when X happens, do Y with the current value of Z." Gotcha: if `secondary$` has never emitted, `withLatestFrom` will not emit even when `primary$` emits — the output is silently suppressed. Seed `secondary$` with `startWith(defaultValue)` to prevent this.
- Example: Show `saveBtn$.pipe(withLatestFrom(formValues$), map(([_, values]) => save(values)))` — the save fires on click, takes current form values as context, ignores form value changes that happen without a click.
- Summary: only primary source triggers output; secondary is sampled, not subscribed for triggering; use for "on action, grab current context"; seed secondary with `startWith` to avoid silent suppression.

- [ ] **Step 5: Write `08-04-zip-and-forkjoin.md`**

```markdown
---
module: 8
lesson: "8.4"
title: zip and forkJoin — pairing by index and parallel completion
key_insight: zip pairs values by position across streams and emits as each position is filled. forkJoin waits for all sources to complete and emits the final values. Use zip for ordered pairing; use forkJoin when you only need the last value from each.
---
```
- Hook: Two operators that both wait before emitting. One is infinitely patient and emits progressively. The other waits for everyone to finish and gives you only the end result.
- Insight: **`zip([a$, b$])`**: pairs values by index position — emits `[a[0], b[0]]` when both have emitted their first value, then `[a[1], b[1]]` when both have emitted their second value, and so on. Like a zipper. If one source emits much faster, zip buffers the faster source's values — memory risk on infinite streams. Completes when any source completes. Use for: pairing request with response by index, correlating parallel tasks where position matters. **`forkJoin([a$, b$])`**: waits for all sources to complete, then emits a single `[lastA, lastB]` tuple. If any source errors, the whole `forkJoin` errors. If any source never completes, `forkJoin` never emits. Use for: parallel HTTP calls on page load, running independent async operations and only needing the final result from each.
- Example: Show page initialization with `forkJoin([loadUser(), loadConfig(), loadPermissions()]).subscribe(([user, config, perms]) => renderPage(user, config, perms))` — all three requests run in parallel, render happens when all three complete.
- Summary: zip = pair by index, emits progressively; forkJoin = wait for all to complete, emit finals once; use zip for ordered correlation; use forkJoin for parallel initialization; forkJoin errors if any source errors.

- [ ] **Step 6: Write `08-05-merge-concat-race.md`**

```markdown
---
module: 8
lesson: "8.5"
title: merge, concat, and race — interleaving, sequencing, and first-wins
key_insight: merge, concat, and race do not combine values — they combine timing. merge interleaves, concat sequences, race takes the winner. These three operators cover every scenario where sources should be ordered or raced, not value-combined.
---
```
- Hook: Not every multi-source scenario needs value combination. Sometimes you want to interleave two streams, subscribe to them in order, or race them. Three operators handle all of these, and none of them produces tuples.
- Insight: **`merge([a$, b$])`**: subscribes to all sources simultaneously, emits every value from every source as it arrives, in arrival order. Lossless. Never waits. Completes when all sources complete. Use for: merging multiple event sources into one unified stream, listening to both mouse and touch events with the same handler. **`concat([a$, b$])`**: subscribes to sources sequentially. Subscribes to `b$` only after `a$` completes. Preserves source order. Use for: show loading skeleton, then data, then summary. **`race([a$, b$])`**: subscribes to all sources, takes only the first to emit, unsubscribes all others. The winner takes all. Use for: fastest data source wins, primary/fallback pattern, timeout races.
- Example: Show `race([cache$, network$])` — cache and network both start; whichever responds first wins; the other is unsubscribed. Demonstrate the fallback pattern.
- Summary: merge = interleave all sources; concat = sequential subscription; race = first-to-emit wins; none produce tuples; merge is lossless; concat preserves order; race discards losers.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-08/
git commit -m "feat: write Module 8 narration scripts — Combining Streams"
```

---

## Task 9 — Module 9: Error Handling & Resilience

**Files — create all five:**
- `scripts/module-09/09-01-why-observables-terminate-on-error.md`
- `scripts/module-09/09-02-catcherror.md`
- `scripts/module-09/09-03-retry.md`
- `scripts/module-09/09-04-timeout-and-finalize.md`
- `scripts/module-09/09-05-error-handling-decision-tree.md`

**Source sections:** "Error Handling and Retry Strategies", "Error Handling and Domain Facades"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-09
```

- [ ] **Step 2: Write `09-01-why-observables-terminate-on-error.md`**

```markdown
---
module: 9
lesson: "9.1"
title: Why Observables terminate on error — and why that is correct
key_insight: When an Observable errors, it terminates permanently. This is not a limitation — it is a guarantee. An error is a definitive end state, and Observables that keep emitting after an error are undefined behavior.
---
```
- Hook: Many developers want Observables that keep running after an error — they add `catchError` and are surprised when it replaces the stream entirely. This surprise comes from thinking errors should be resumable. They should not.
- Insight: The Observable contract: `(next)* (error | complete)?`. Zero or more `next` emissions, then at most one `error` or `complete` — and only one, forever. After `error` fires, the subscription is closed. This is correct by design: an error represents a situation where the producer has failed definitively. It does not know whether the next emission would be valid. Allowing further emissions after an error would produce values in an undefined state. If you want a stream that recovers from errors, the recovery is a new stream — which is exactly what `catchError` returns. The outer stream terminates; the replacement stream starts. This is clean, not limiting.
- Example: Show a custom Observable that tries to emit after `observer.error(e)` — the value is silently dropped because the `SafeSubscriber` wrapper ignores post-error emissions. This is the contract enforced at the RxJS level.
- Summary: Observable contract = `next* (error|complete)?`; error is a terminal state; recovery = a new stream, not resume; `catchError` terminates the old stream and starts the replacement; this is correct, not a limitation.

- [ ] **Step 3: Write `09-02-catcherror.md`**

```markdown
---
module: 9
lesson: "9.2"
title: catchError — recovery strategies
key_insight: catchError intercepts a terminated error stream and returns a replacement Observable. The replacement can be a fallback value, an empty stream, or a rethrow — but it is always a new Observable, because the old stream is gone.
---
```
- Hook: catchError is not a try-catch for streams. A try-catch resumes after the error. catchError replaces the stream entirely. Understanding this difference is the key to using it correctly.
- Insight: `catchError((err, caught$) => Observable<T>)`: when the source errors, `catchError` calls your handler and subscribes to whatever Observable you return. Three patterns: (1) **Fallback value**: `catchError(() => of(defaultValue))` — emit a default and complete. (2) **Swallow**: `catchError(() => EMPTY)` — complete silently with no emissions. (3) **Retry**: `catchError((_, caught$) => caught$)` — resubscribe to the original source (use sparingly — only with a counter to avoid infinite loops). (4) **Rethrow with side effect**: `catchError(err => { log(err); return throwError(() => err); })` — handle the error for logging, then rethrow. Important: `catchError` inside a `switchMap` or `mergeMap` catches inner errors without killing the outer stream — the standard pattern for HTTP requests.
- Example: Show `ajax.get(url).pipe(catchError(() => of({ data: [] })))` for a graceful empty-state fallback. Then show inner catchError: `switchMap(q => search(q).pipe(catchError(() => of([]))))` — one failed search doesn't kill the typeahead.
- Summary: catchError = subscribe to the replacement Observable; never resumes the original; three strategies: fallback, swallow, rethrow; use inner catchError in switchMap/mergeMap to isolate errors per inner Observable.

- [ ] **Step 4: Write `09-03-retry.md`**

```markdown
---
module: 9
lesson: "9.3"
title: retry and the resilience ladder
key_insight: retry resubscribes to the source Observable from scratch after every error. This is powerful for transient failures — and dangerous for non-idempotent operations where repeating the request causes duplicate side effects.
---
```
- Hook: A network request fails. The correct response is usually: try again. retry does exactly this — but "from scratch" has implications that catch most developers off guard.
- Insight: `retry(count)`: on error, resubscribes to the source Observable (creating a new execution). Retries up to `count` times before letting the error through. `retry({ count: 3, delay: 1000 })` (RxJS 7+): retries with a 1-second delay between attempts. Exponential backoff: `retry({ count: 5, delay: (err, attempt) => timer(Math.pow(2, attempt) * 1000) })`. When to use: idempotent HTTP GET requests, read-only operations, anything that can be safely repeated. When not to use: form submits, payment processing, writes that are not idempotent — retrying these can cause duplicate charges, duplicate records, or double-processing. Always bound retries: `retry(3)` not `retry()` (which retries infinitely). Always pair with `catchError` after the retry count is exhausted.
- Example: Show `ajax.get('/api/data').pipe(retry({ count: 3, delay: 1000 }), catchError(() => of(null)))` — three retries with 1-second delays, then null fallback. Contrast with a form submit that must not use retry.
- Summary: retry = resubscribe from scratch; safe for idempotent read operations; dangerous for writes; always bound with a count; combine with `catchError` for final fallback; use delay for backoff.

- [ ] **Step 5: Write `09-04-timeout-and-finalize.md`**

```markdown
---
module: 9
lesson: "9.4"
title: timeout, finalize, and lifecycle cleanup
key_insight: timeout fails the stream if no emission arrives within a deadline — it does not slow down a fast stream, it terminates a frozen one. finalize runs cleanup unconditionally regardless of how the stream ended.
---
```
- Hook: Two operators that developers reach for when things go wrong — one to detect when nothing is happening, one to clean up when anything happens.
- Insight: **`timeout({ each: 5000 })`**: emits a `TimeoutError` if no value arrives within 5 seconds of the last emission. Does not affect fast-emitting streams. Prevents UI hangs from silently stalled HTTP requests or WebSocket connections. Combine with `catchError` to provide a fallback when the timeout fires. **`finalize(fn)`**: runs `fn` when the stream terminates for any reason — complete, error, or unsubscribe. The Observable equivalent of `finally` in a try-catch-finally. Use for: hiding loading spinners, closing WebSocket connections, clearing resources. Runs even when `unsubscribe()` is called manually — making it more reliable than only using `complete()`. Key distinction: `tap({ complete })` runs only on graceful completion. `finalize` runs on any termination including unsubscribe and error.
- Example: Show `http$.pipe(timeout({ each: 10000 }), catchError(err => err instanceof TimeoutError ? of(null) : throwError(() => err)), finalize(() => hideSpinner()))` — timeout kills a stalled request, catchError provides fallback, finalize hides spinner in all cases.
- Summary: timeout = error on no emission within deadline; finalize = cleanup on any termination (complete, error, unsubscribe); finalize > tap.complete for reliable cleanup; combine timeout + catchError for stall-resilient HTTP.

- [ ] **Step 6: Write `09-05-error-handling-decision-tree.md`**

```markdown
---
module: 9
lesson: "9.5"
title: The error handling decision tree
key_insight: Error handling in RxJS reduces to three strategies — recover, retry, rethrow — and the choice depends on whether the error is transient, permanent, or unknown. Everything else is a variation on these three.
---
```
- Hook: RxJS has many error operators. The mental overhead of choosing between them disappears when you reduce the decision to three strategies.
- Insight: **Strategy 1 — Recover** (`catchError` returning a fallback): The error is permanent and you have a meaningful default. Use: `catchError(() => of(defaultValue))` or `catchError(() => EMPTY)`. When: network errors with a cached fallback, validation failures with an empty state. **Strategy 2 — Retry** (`retry` before `catchError`): The error is transient and the operation is safe to repeat. Use: `retry({ count: 3, delay: 1000 })`, followed by `catchError` as the final safety net. When: idempotent reads, flaky network conditions. **Strategy 3 — Rethrow** (`catchError` returning `throwError`): The error must propagate — you need to log or alert, but you cannot handle it here. Use: `catchError(err => { reportError(err); return throwError(() => err); })`. When: application-level errors that need centralized handling. Decision tree: (1) Is the error transient? → retry. (2) Do you have a fallback? → recover. (3) Is this unhandlable here? → rethrow. For inner Observables (inside switchMap/mergeMap): always catch errors per-inner to prevent the outer stream from terminating.
- Example: Show a complete HTTP pattern: `retry({ count: 2, delay: 500 })` (transient failure handling) + `catchError(() => of([]))` (permanent failure fallback) + inner `catchError` pattern for switchMap.
- Summary: three strategies: recover, retry, rethrow; retry for transient errors; recover for permanent errors with a fallback; rethrow for centralized error handling; always use inner catchError in flattening operators.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-09/
git commit -m "feat: write Module 9 narration scripts — Error Handling & Resilience"
```

---

## Task 10 — Module 10: Domain Facades, Testing & Architecture

**Files — create all five:**
- `scripts/module-10/10-01-alias-and-wrap-pattern.md`
- `scripts/module-10/10-02-hexagonal-architecture.md`
- `scripts/module-10/10-03-with-telemetry.md`
- `scripts/module-10/10-04-testscheduler-and-marbles.md`
- `scripts/module-10/10-05-the-four-layer-model-as-architecture.md`

**Source sections:** "Alias + Wrap Pattern for Domain Operators", "Hexagonal Architecture and Telemetry Wrappers", "Testing and Composition Patterns", "4-Layer Model and Capstone Project"

- [ ] **Step 1: Create directory**

```bash
mkdir -p scripts/module-10
```

- [ ] **Step 2: Write `10-01-alias-and-wrap-pattern.md`**

```markdown
---
module: 10
lesson: "10.1"
title: The Alias + Wrap pattern — domain-specific operator naming
key_insight: The Alias + Wrap pattern renames RxJS operators with domain-specific names, making the pipeline readable to domain experts and the operators testable in isolation by RxJS experts — a clean seam between the two.
---
```
- Hook: An RxJS pipeline full of `switchMap`, `debounceTime`, and `distinctUntilChanged` is unreadable to a domain expert. But renaming it to `loadOnSearch`, `waitForUserPause`, and `ignoreRepeatQuery` is readable to everyone — and still testable by anyone who knows RxJS.
- Insight: The pattern: (1) Write the raw RxJS operator as a pure function. (2) Export a domain-named wrapper that calls it. The wrapper is where you add: domain-specific error messages, logging context, test seams (an injectable inner Observable for testing). Example: `switchMap(query => searchApi(query))` becomes `searchOnQuery(searchApi)` — a parameterized operator that takes the API function as a dependency, making it testable with a mock. Domain users read `searchOnQuery`; RxJS experts maintain the `switchMap` inside. The seam is the function signature.
- Example: Show a trading domain facade: raw `throttleTime(100)` becomes `throttlePriceUpdates()`. Raw `scan(reducer, 0)` becomes `accumulateTradeVolume()`. The pipeline reads: `priceUpdates$.pipe(throttlePriceUpdates(), accumulateTradeVolume())` — pure domain language.
- Summary: Alias = rename; Wrap = add context, errors, test seams; domain users read the names; RxJS experts maintain the internals; the function signature is the clean seam between the two worlds.

- [ ] **Step 3: Write `10-02-hexagonal-architecture.md`**

```markdown
---
module: 10
lesson: "10.2"
title: Hexagonal architecture with RxJS
key_insight: Hexagonal architecture applied to RxJS puts custom domain operators at the core, RxJS as infrastructure inside them, and components as adapters. The domain never imports from the infrastructure layer — RxJS is an implementation detail.
---
```
- Hook: Most RxJS code has `switchMap`, `combineLatest`, and `shareReplay` scattered across components. When RxJS gets a breaking change or you want to swap it for something else, you touch everything. Hexagonal architecture fixes this.
- Insight: Hexagonal (Ports and Adapters) applied to reactive code: **Core (domain operators)**: `searchOnQuery`, `throttlePriceUpdates`, `withCurrentUser` — pure domain logic, RxJS is an implementation detail inside these functions. **Infrastructure (RxJS)**: `switchMap`, `debounceTime`, `shareReplay` — live only inside domain operators, never imported by components. **Adapters (components)**: import and compose domain operators. Never import RxJS operators directly. Dependencies point inward: adapters → domain operators → RxJS. This means: (1) components are readable without RxJS knowledge, (2) RxJS can be swapped by changing only the domain operators, (3) domain operators are independently testable.
- Example: Show `search.component.ts` importing `searchOnQuery` and `withCurrentUser` from `search.facade.ts` — no RxJS imports visible in the component. Show `search.facade.ts` using `switchMap` and `withLatestFrom` internally.
- Summary: Core = domain operators (RxJS inside); adapters = components (no direct RxJS); dependencies point inward; RxJS is infrastructure, not domain; swapping RxJS touches only the core layer.

- [ ] **Step 4: Write `10-03-with-telemetry.md`**

```markdown
---
module: 10
lesson: "10.3"
title: withTelemetry — aspect-oriented operators
key_insight: withTelemetry is a higher-order operator wrapper that adds logging, metrics, and error tracking to any operator without changing its logic — Aspect-Oriented Programming applied to streams.
---
```
- Hook: Every custom operator in a production system needs logging, metrics, and error tracking. Writing those three concerns into every operator is duplication. withTelemetry writes them once and applies them to all operators transparently.
- Insight: `withTelemetry<T>(operatorName: string, operator: OperatorFunction<T, T>): OperatorFunction<T, T>` — takes any operator and returns the same operator with: `tap` at entry (log input), `tap` at success (log output, record metric), `catchError` (log error, record error metric, rethrow), `finalize` (record duration). The wrapped operator behaves identically to the unwrapped version — same input, same output, same error behavior. The telemetry is a cross-cutting concern that is declared once and applied everywhere. This is Aspect-Oriented Programming: the cross-cutting concern (telemetry) is separated from the business logic (the operator). Pattern: define raw operator, export wrapped version. All operators that use `withTelemetry` automatically inherit logging and metrics without any test changes to domain operator tests.
- Example: Show `withTelemetry` implementation using `tap`, `catchError`, `finalize`. Show it applied: `export const searchOnQuery = withTelemetry('searchOnQuery', rawSearchOnQuery)`. Every call to `searchOnQuery` is now automatically logged and measured.
- Summary: withTelemetry = AOP for operators; write once, apply everywhere; same operator signature in/out; telemetry is a cross-cutting concern; all wrapped operators inherit metrics without changing their tests.

- [ ] **Step 5: Write `10-04-testscheduler-and-marbles.md`**

```markdown
---
module: 10
lesson: "10.4"
title: Testing with TestScheduler and marble diagrams
key_insight: TestScheduler lets you fake time in marble notation, making every time-based operator deterministic and synchronous in tests. A marble test for a debounced search proves behavior that would take 300ms in real time, in under 1ms.
---
```
- Hook: Testing a `debounceTime(300)` pipeline in real time means your test suite takes 300ms per assertion. TestScheduler makes that 300ms run in a single virtual tick — no waiting, no flakiness, no sleep calls.
- Insight: `TestScheduler` from `rxjs/testing` provides a `run()` method inside which all time-based operators use virtual time. Marble notation: `-` = 10 virtual ms (one frame); `a` = emission labeled "a"; `|` = complete; `#` = error; `^` = subscription point; `!` = unsubscribe point. Write a marble diagram for the input, write one for the expected output, and TestScheduler asserts they match. This works for all time-based operators: `debounceTime`, `throttleTime`, `delay`, `timeout`, `interval`. Domain facades are the natural unit of marble tests: mock the HTTP dependency with `cold('--a|')`, run the facade pipeline, assert the output marble.
- Example: Show a complete marble test for a debounced search facade: `const input$ = hot('--a--b-----c|', { a: 'he', b: 'hel', c: 'hello' })`. Expected after `debounceTime(300ms = 30 frames)`: `cold('---------------------c|', { c: 'hello' })`. TestScheduler `expectObservable` assertion.
- Summary: TestScheduler = fake time; marble notation = concise temporal assertions; `hot()` for sources already running; `cold()` for sources created per subscription; use for all time-based operators; domain facades are the natural marble test target.

- [ ] **Step 6: Write `10-05-the-four-layer-model-as-architecture.md`**

```markdown
---
module: 10
lesson: "10.5"
title: The 4-Layer Model as a complete architecture
key_insight: The 4-Layer Model — Values, Time, Sharing, Flattening — is not a taxonomy for organizing operators. It is a diagnostic framework: identify which layer the problem is in, and the fix becomes obvious.
---
```
- Hook: You have learned 50 concepts across 10 modules. The 4-Layer Model is the single mental tool that ties them together — not as a filing system, but as a debugging and design compass.
- Insight: When a stream behaves unexpectedly, the diagnostic process: **Is the wrong value emitted?** → Layer 1 (Values). Check T-only operators: map, filter, scan, distinctUntilChanged. **Is it emitting at the wrong time?** → Layer 2 (Time). Check time-based operators: debounce, throttle, buffer, the temporal model of the stream. **Is it emitting too many times or being shared when it shouldn't?** → Layer 3 (Sharing). Check Subject variants, share/shareReplay configuration, unicast vs multicast. **Is the wrong inner Observable winning, or are requests racing/queuing incorrectly?** → Layer 4 (Flattening). Check the flattening operator choice: should this be switchMap or exhaustMap? When designing a new feature: (1) Define the value transformations (Layer 1). (2) Add rate limiting if needed (Layer 2). (3) Decide if the result needs to be shared (Layer 3). (4) Identify any nested async operations (Layer 4). The 4-Layer Model is the complete architecture of reactive programs.
- Example: Walk through a production bug: a dashboard showing stale data. Diagnostic: Layer 3 issue — `shareReplay` without `refCount: true` is serving cached data from a disconnected source. Fix: `shareReplay({ bufferSize: 1, refCount: true })`. Show how the layer model guided the diagnosis directly.
- Summary: 4 layers = Values, Time, Sharing, Flattening; use as a diagnostic framework, not a filing system; wrong value = Layer 1; wrong timing = Layer 2; wrong sharing = Layer 3; wrong concurrency = Layer 4; design new features layer by layer.

- [ ] **Step 7: Commit**

```bash
git add scripts/module-10/
git commit -m "feat: write Module 10 narration scripts — Domain Facades, Testing & Architecture"
```

---

## Self-Review Checklist

After completing all 10 tasks:

- [ ] All 50 script files exist in `scripts/module-NN/`
- [ ] Each script follows the template: front-matter + Hook + Insight + Example + Summary
- [ ] Word counts are in the 400–600 range
- [ ] No script repeats a key_insight already covered in a previous lesson
- [ ] TypeScript examples use tabs, single quotes, explicit types, `$` suffix, `pipe()` chains
- [ ] No `any` type used anywhere
- [ ] Side effects only in `tap()` in all examples
- [ ] No nested subscriptions in any example
