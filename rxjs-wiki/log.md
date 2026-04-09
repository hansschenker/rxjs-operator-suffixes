# RxJS Wiki — Operation Log

Append-only chronological record of wiki operations.

```bash
grep "^## \[" log.md | tail -10   # last 10 operations
grep "ingest" log.md              # all ingests
grep "query" log.md               # all queries
```

---

## [2026-04-08] expand | core/higher-order-operators.md

Pages created:
- `core/higher-order-operators.md` — Full deep-dive: what makes an operator higher-order; the nesting problem and why flattening solves it; per-operator sections (switchMap/mergeMap/concatMap/exhaustMap) each with marble diagram, memory model, completion rule, real-world patterns, pitfalls; the *All variants (switchAll/mergeAll/concatAll/exhaustAll); expand for recursion (pagination, backoff, tree traversal); four-way policy comparison table; decision guide by use case; error handling inside inners; memory leak patterns; TypeScript ObservableInput signatures; quick-reference use-case table

Pages updated:
- `core/operators.md` — cross-link added from higher-order section to new page
- `core/stream-machines.md` — cross-link added from flattenWithPolicy to new page

Key additions:
- `switchMap` ≡ "cancel previous, keep latest" — defining use case: typeahead/live queries
- `mergeMap` ≡ "allow all concurrently" — concurrency parameter; defining use case: parallel HTTP
- `concatMap` ≡ mergeMap(project, 1) — strictly sequential; queue-fills-fast pitfall
- `exhaustMap` ≡ "protect current, drop new" — defining use case: form submit/login
- Error in inner terminates outer — must always catchError inside the project function
- Memory leak: mergeMap with never-completing inners; concatMap with blocked queue
- `expand` always needs EMPTY base case or take(n) safety valve
- `ObservableInput<R>` accepts Promise/Array/Iterable/AsyncIterable, not just Observable

---

## [2026-04-08] ingest | sources/raw/Concept — Stream Machine Calculus

Sources:
- `sources/raw/Concept/rxjs_core_stream_machines.md`
- `sources/raw/Concept/rxjs_machine_calculus_cheat_sheet.md`
- `sources/raw/Concept/rxjs_operator_families_in_machine_language.md`

Skipped:
- `sources/raw/Concept/Monad.md` — one-liner stub

Pages created:
- `core/stream-machines.md` — 6 irreducible stream machines with two vocabulary layers (teaching DSL + runtime semantics DSL); per-machine: core question, causal structure, runtime rules, memory, first-emission rule, lossiness; complete operator→machine map (24 operators); 8 classification axes; fast classification test; cheat sheet

Key additions:
- Teaching layer: `when`, `wheneverAny`, `evolve`, `forEach+policy`, `gate`, `shapeTime`
- Runtime layer: `sampleOn`, `recomputeLatest`, `reduceState`, `flattenWithPolicy`, `composeTopology`, `shareExecution`
- `sampleOn` is asymmetric (one trigger, one passive context); `recomputeLatest` is symmetric (any input triggers)
- `reduceState` changes state (feedback memory); `sampleOn` only reads it
- `flattenWithPolicy` is higher-order (starts inner Observables); `reduceState` is first-order
- `gate` and `shapeTime` are derived (specialisations of core machines), not irreducible
- 8 classification axes: Trigger, Memory, Higher-order depth, Topology, Lossiness, Initial emission, Sharing, Completion
- Fast test: 8 questions ordered by eliminative power to place any operator in its machine

---

## [2026-04-08] ingest | sources/raw/Functional Reactive Programming + Dataflow Programming

Sources:
- `sources/raw/Functional Reactive Programming/Scale By The Bay 2019 Tikhon Jelvis, What is Functional Reactive Programming.md`
- `sources/raw/Dataflow Programming/Dataflow Programming with a Functional Programming Language.md`

Skipped (insufficient content for wiki pages):
- `sources/raw/Category Theory.md` — one-liner stub
- `sources/raw/Concept/Monad.md` — one-liner stub
- `sources/raw/Property/Symbol.asyncIterator.md` — one-liner stub
- `sources/raw/Property/Symbol.iterator.md` — one-liner stub
- `sources/raw/RxJS Course - Module 3 Typescript in Rxjs.md` — AI-generated course overlaps with existing custom-operators.md

Pages created:
- `core/frp-concepts.md` — Conal Elliott's classic FRP: Behavior (Time→A, continuous) vs Event ([(Time,A)], discrete); three FRP properties (explicit/composable/declarative); inputs→combinators→outputs architecture; fold-events-into-behavior (= scan + startWith + shareReplay(1)) as Game of Life example; RxJS vs classic FRP comparison table; how the Behavior/Event distinction maps to BehaviorSubject vs Observable
- `core/dataflow-model.md` — Observable pipeline as directed dataflow graph; operators as nodes, OperatorFunction as universal edge interface; Unix pipe philosophy connection; DAG vs cyclic graphs (Subjects for cycles); higher-order operators as nested subgraphs; parallel execution from combineLatest/forkJoin

Key additions:
- Behavior = function from time to value — always has a value (BehaviorSubject semantics)
- Event = list of time-value pairs — only exists at discrete points (Observable semantics)
- fold-events-into-behavior: stream of diffs → scan into state; adding features = adding update streams to merge, not changing existing code
- inputs→combinators→outputs: same pattern applies to UI, robotics, simulation — only sources/sinks change
- RxJS Observables are impure, practical Events; BehaviorSubjects approximate Behaviors
- OperatorFunction<T,R> is the universal interface that enables composition (Unix pipe analogy)
- TypeScript enforces the type at each graph edge — broken graphs caught at compile time
- Subjects are the only way to introduce a feedback cycle; reason for their "use sparingly" guideline
- Dataflow graphs enable free parallelism — nodes at same depth execute concurrently

---

## [2026-04-08] ingest | sources/raw/Programming/RxJS — Group 1 batch 5 (combination operators, Zalgo/Scheduler, 16 behavior groups)

Sources:
- `sources/raw/Programming/RxJS/RxJS Combination Operators Guide Complete Reference with Examples.md`
- `sources/raw/Programming/RxJS/Demystifying RxJS, Part III Building our own Schedulers.md`
- `sources/raw/Programming/RxJS/RxJS Operators 16 Behavior Groups Shared Grok Conversation.md`
- `sources/raw/Programming/RxJS/RxJS Domain can change.md`

Pages created:
- `core/combination-operators.md` — Decision tree for operator selection; per-operator deep-dives (combineLatest, concat, forkJoin, merge, race, withLatestFrom, zip, pairwise, startWith) with marble diagrams, code examples, and "Best for" guidance; comparison summary table

Pages updated:
- `core/Scheduler.md` — Added Zalgo section: synchronous-sometimes API anti-pattern; `observeOn(asapScheduler)` fix for consistent async behaviour; sources updated to 1
- `index.md`, `.vitepress/config.ts` — combination-operators page registered

Key additions:
- Combination operators decision tree: "When do you want output? What triggers emission? When does it complete?"
- forkJoin ≈ Promise.all; only last value from each source used
- withLatestFrom vs combineLatest: withLatestFrom samples (source-driven); combineLatest derives state (any-source-driven)
- zip pairs by index; backpressure risk if sources emit at different rates
- pairwise first value is "lost" — prepend with startWith(initial) to include it
- startWith vs BehaviorSubject: startWith is stateless (re-emits on each subscribe); BehaviorSubject is stateful (always has current value)
- Zalgo anti-pattern: async API that sometimes fires synchronously — unpredictable ordering
- `observeOn(asapScheduler)` on synchronous branch normalises emission to microtask queue
- 16 behavior groups as alternative operator taxonomy (not filed as page — overlaps with existing operators.md)

---

## [2026-04-08] ingest | sources/raw/Programming/RxJS — Group 1 batch 4 (execution phases, lossy/non-lossy, domain operators)

Sources:
- `sources/raw/Programming/RxJS/RxJS Execution Phases - Kimi.md`
- `sources/raw/Programming/RxJS/RxJS Origins and Foundational Concepts of RxJS.md`
- `sources/raw/Programming/RxJS/RxJS Producer.md`
- `sources/raw/Programming/RxJS/RxJS Subscriber Responsibilities.md`

Pages created:
- `core/execution-phases.md` — Two phases: Execution Plan (lazy blueprint, nothing runs) vs Execution (subscribe triggers producer + scheduler); shared vs independent execution; lossy vs non-lossy operator dimension (4-quadrant table); schedulers as dispatcher bridge; composing lossiness deliberately
- `patterns/domain-operators.md` — Wrap RxJS chains in business-named functions; four benefits (readability, testability, centralized rules, error isolation); layered architecture (presentation → domain → RxJS primitives); anti-patterns (too granular, hidden side effects); real-world examples (price feed, patient monitoring)

Pages updated:
- `core/operators.md` — Added lossy/non-lossy section with 4-quadrant table; cross-ref to execution-phases.md
- `index.md`, `.vitepress/config.ts` — Two new pages registered

Key additions:
- Plan phase = inert blueprint; execution phase = triggered by subscribe()
- Same plan, different execution timing: subscribe directly vs trigger from another stream
- Lossy operators are intentional design for backpressure, rate-limiting, deduplication
- Non-lossy accumulation (scan) → lossy temporal sampling (auditTime) → non-lossy format: state never lost, render bounded to 60fps
- Domain operators lift RxJS from "how" to "what" — pipeline reads like requirements
- Error isolation: each domain operator carries its own catchError with domain-appropriate strategy
- Layered architecture: presentation layer imports domain names, not RxJS primitives
- Anti-pattern: wrapping a single operator adds indirection without meaning
- RxJS = Observer pattern + dual of Iterator + functional composition (3 ingredients)

---

## [2026-04-08] ingest | sources/raw/Programming/RxJS — Group 1 batch 3 (shareReplay caching, value/time-based, formal Observable model)

Sources:
- `sources/raw/Programming/RxJS/RxJS Cache & Share HTTP Request with shareReplay - Grok.md`
- `sources/raw/Programming/RxJS/RxJS How to Use refCount.md`
- `sources/raw/Programming/RxJS/RxJS Course 01 Plan.md`
- `sources/raw/Programming/RxJS/RxJS Course 02 Module 1.md`
- `sources/raw/Programming/RxJS/RxJS Value-based Time-based.md`
- `sources/raw/Programming/RxJS/RxJS Subscriber Responsibilities.md`
- `sources/raw/Programming/RxJS/RxJS and Observables Subscription Lifecycle.md`

Pages created:
- `core/share-replay.md` — Full shareReplay deep-dive: configuration (bufferSize, refCount, windowTime); standard HTTP caching pattern; fixed TTL; sliding TTL with defer + timestamp; manual invalidation; refCount mechanics diagram; shareReplay vs ReplaySubject; two pitfalls (error replay, dynamic-key leak)

Pages updated:
- `core/Observable.md` — Added formal timed-pair model: Observable = lazy sequence of `[(T, a), ...]`; cross-ref to observable-internals.md
- `core/operators.md` — Added value-based vs time-based section (independent axis from first-order/higher-order)
- `index.md`, `.vitepress/config.ts` — shareReplay page registered

Key additions:
- Observable = lazy, potentially infinite sequence of `[(T, a), ...]` — explicit about time and infinity
- `shareReplay(1)` = most common; `refCount: true` cleans up, `refCount: false` permanent cache
- `windowTime` = fixed TTL starting from first emission (not from last access)
- Sliding TTL requires `defer` + manual timestamp check — `windowTime` alone is not sliding
- Errors are replayed by `shareReplay` — catch before caching to avoid this
- `refCount: false` with dynamic keys leaks memory — use `Map` + manual eviction
- Value-based operators operate on content; time-based on timing — orthogonal to first/higher-order

---

## [2026-04-08] ingest | sources/raw/Programming/RxJS — Group 1 batch 2 (Observable internals, animations, combineLatest, unicast/multicast)

Sources:
- `sources/raw/Programming/RxJS/Ben Lesh - Advanced RxJS State Management and Animations.md`
- `sources/raw/Programming/RxJS/Learning Observable By Building Observable.md`
- `sources/raw/Programming/RxJS/RXJS Subjects - Real World Use Cases.md`
- `sources/raw/Programming/RxJS/RxJS Nested Observables and JS Nested Loop.md`
- `sources/raw/Programming/RxJS/RxJS Mathematical Duality.md`
- `sources/raw/Programming/RxJS/RxJS Unicast Multicast.md`
- `sources/raw/Programming/RxJS/combineLatest Formal Rules Complete RxJS Operator Guide.md`
- `sources/raw/Programming/RxJS/RxJS Patterns.md`

Pages created:
- `core/observable-internals.md` — Observable = function(observer) => teardown; SafeObserver guarantees; building an operator; linked-observer chain; Iterator + Observer pattern synthesis; Observable vs Promise
- `patterns/animations.md` — animationFrameScheduler; velocity-based (endless, px/sec); duration-based (0→1 percentage); defer for lazy subscription-time timestamps; easing functions (apply before distance); tween with pairwise + switchMap; scheduler injection for testing
- `core/combine-latest.md` — Five formal rules (initial sync, any-source trigger, latest retention, all-complete, error propagation); EMPTY absorptive element; cold observable trap + shareReplay fix; comparison table (zip/withLatestFrom/forkJoin); mathematical properties

Pages updated:
- `core/hot-cold.md` — added Unicast vs Multicast section (1 producer per subscriber vs 1 shared)
- `index.md` — three new core pages + animations pattern added
- `.vitepress/config.ts` — Core and Patterns sidebar entries added

Key additions:
- "Observable = function(observer) => teardown" — Ben Lesh's minimal definition
- SafeObserver guarantees: optional methods, no post-terminal emissions, auto-teardown, exception safety
- Operator chain builds outside-in at subscribe time; values flow inside-out at emission time
- Observable ≠ Promise: Observable is a function (lazy), Promise is a box (eager/shared)
- Animation = set of values over time; animationFrameScheduler wraps rAF
- defer is the key to lazy timestamp capture: factory runs at subscription time
- Duration observable always 0→1 — composable with any easing function
- Tween pattern: pairwise() + switchMap(duration) — switchMap cancels stale animation
- Easing must be applied BEFORE distance multiplication (easing expects 0-1 range)
- combineLatest Rule 1 (initial sync): EMPTY never emits → combineLatest never emits (absorptive)
- combineLatest cold trap: use shareReplay(1) or BehaviorSubject for shared sources
- Unicast = 1 producer per subscriber (cold); multicast = 1 shared producer (hot/Subject)

---

## [2026-04-08] ingest | sources/raw/Programming/RxJS — Group 1 (Hot/Cold, pipe, custom operators, Eight-Policy, Subject decision)

Sources:
- `sources/raw/Programming/RxJS/Hot and Cold Observables.md` (Dave Sexton)
- `sources/raw/Programming/RxJS/RxJS First-Order Higher-Order.md`
- `sources/raw/Programming/RxJS/RxJS Creating a Custom RxJS Operator.md`
- `sources/raw/Programming/RxJS/RxJS Pipe Operator.md`
- `sources/raw/Programming/RxJS/To Use Subject Or Not To Use Subject.md` (Dave Sexton)
- `sources/raw/Programming/RxJS/RxJS Eight-Policy Framework Complete Operator Specification Guide.md`

Pages created:
- `core/hot-cold.md` — precise definition via subscription side effects; temperature conversion (publish/share/defer); four-combination table; built-in temperature table; why it matters for composition
- `core/custom-operators.md` — pipe() as composition operator; pipe factory pattern for custom operators; parametric operators; low-level Observable constructor; OperatorFunction types
- `core/operator-policies.md` — Eight-Policy Framework: Start/Emit/Completion/State/Cancellation/Error/Output Type/Input Type; type chain rule; strongly typed Action/Reducer; scan vs reduce comparison

Pages updated:
- `core/operators.md` — added first-order vs higher-order section; enriched Related links (sources: 2)
- `core/subjects-guide.md` — added Meijer "mutable variables" warning; 4-question Subject decision framework; four-combination table; reactive property and cross-cutting justified use cases; thread safety note (sources: 2)
- `index.md` — three new core pages added
- `.vitepress/config.ts` — three new Core sidebar entries added

Key additions:
- Hot = no subscription side effects; cold = may cause subscription side effects (Dave Sexton's precise framing)
- "When in doubt, assume cold" — safe default for unknown Observables
- Temperature conversion: cold→hot (publish/share), hot→cold (defer)
- pipe() is both an instance method AND a standalone composition function
- Custom operators = functions returning OperatorFunction<T, R>, built with pipe()
- Eight policies formally specify every operator's full lifecycle
- Type chain rule: output of operator(n) must equal input of operator(n+1) — TypeScript enforces this
- Renaming Input→Action for discriminated union reducers improves semantic clarity
- Meijer: Subjects = "mutable variables of Rx" — avoid unless local hot source with no convertible alternative
- 4-question decision: (1) external or local source? (2) cold or hot needed?

---

## [2026-04-08] expand | XState vs RxJS + State Machine Pattern

Source: `sources/articles/rxjs-vs-xstate-traffic-light-compare.txt`

Pages created:
- `architectures/xstate-vs-rxjs.md` — full comparison: control graph vs dataflow graph, traffic light implementation in both, pedestrian button as inflection point, three-graph view, stream as timed notifications
- `patterns/state-machine.md` — RxJS state machine approaches: scan+action stream (MVU-style) and expand-based recursive stream; testing; composability advantage

Pages updated:
- `index.md` — both pages added
- `.vitepress/config.ts` — both pages added to sidebar
- `architectures/index.md` — XState vs RxJS added (via index.md)

Key additions:
- XState = control topology; RxJS = time+dataflow topology
- Pedestrian button as the deciding test between the two
- expand operator for recursive state machine modelling
- Stream as timed notifications: `[(notification, time), ...]`
- When RxJS beats XState: composability with other streams

---

## [2026-04-08] query | What is a Subject?

Answer filed as: `core/subjects-guide.md`
Pages updated: `index.md`, `.vitepress/config.ts`
Key content: dual nature, three roles (event bus / cold→hot bridge / destroy signal), four variants compared, decision tree, Subject vs shareReplay, pitfalls

---

## [2026-04-08] ingest | Erik Meijer — Rx Explained + Playful Introduction to Rx

Sources:
- `sources/talks/rx-explained-by-erik-meijer.txt`
- `sources/talks/playful-introduction-rx-erik-meijer.txt`

Pages created:
- `history/erik-meijer.md` — dedicated page: mathematical dual, Raven Test, philosophy, game examples, combineLatest from spreadsheets

Pages updated:
- `core/Observable.md` — added mathematical dual table, Meijer philosophy quote, source count updated to 2
- `overview.md` — added "Origin" section with Raven Test and missing-piece framing
- `core/operators.md` — combineLatest entry enriched with spreadsheet analogy quote
- `index.md` — erik-meijer.md added to History section
- `.vitepress/config.ts` — Erik Meijer added to History sidebar

Key additions:
- IEnumerable ↔ IObservable mathematical dual (not just analogy)
- "Focus on the present" philosophy of stream programming
- combineLatest origin: stolen from Excel spreadsheet cells
- scan for physics/state accumulation (velocity in games)
- Games as stream transformations pattern
- Power through simplicity: restricting interface enables distribution (MapReduce)
- Observable collections vs Observable streams distinction (the MVVM cycle)

---

## [2026-04-09] query | What is a BehaviorSubject?
Answer filed as: core/BehaviorSubject.md (pre-existing page)
Slides: slides/core-BehaviorSubject.md

---

## [2026-04-08] bootstrap | Initial wiki creation

Pages created:
- `CLAUDE.md` — schema and conventions
- `index.md` — content catalog
- `overview.md` — high-level RxJS synthesis
- `core/Observable.md`
- `core/Observer.md`
- `core/Subscription.md`
- `core/Subject.md`
- `core/BehaviorSubject.md`
- `core/ReplaySubject.md`
- `core/AsyncSubject.md`
- `core/Scheduler.md`
- `core/operators.md`
- `history/timeline.md`
- `history/rxjs5-to-6.md`
- `history/rxjs6-to-7.md`
- `patterns/index.md`
- `patterns/mvu.md`
- `patterns/effects.md`
- `patterns/state-management.md`
- `patterns/error-handling.md`
- `architectures/index.md`
- `architectures/redux-observable.md`
- `architectures/mvu.md`
- `architectures/event-driven.md`
- `testing/index.md`
- `testing/marble-testing.md`
- `testing/TestScheduler.md`
- `debugging/index.md`
- `debugging/tap.md`
- `debugging/common-mistakes.md`

Key additions: Full initial population of all wiki sections from existing RxJS knowledge base.
