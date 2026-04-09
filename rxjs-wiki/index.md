# RxJS Wiki — Content Index

> Catalog of all wiki pages. The LLM reads this first when answering queries. Updated on every ingest or page addition.

---

## Overview

- [RxJS Overview](overview.md) — High-level synthesis: what RxJS is, core mental model, operator families, architecture role, key pitfalls

---

## Core

RxJS primitives and building blocks.

- [Observable](core/Observable.md) — Lazy push-based collection; cold vs hot; marble notation; pipe() composition
- [Observer](core/Observer.md) — Consumer interface (next/error/complete); SafeSubscriber guarantees
- [Subscription](core/Subscription.md) — Handle to a running Observable; teardown logic; memory leak prevention
- [Subject](core/Subject.md) — Multicast Observable + Observer; action bus; cold→hot bridge
- [Subjects — Complete Guide](core/subjects-guide.md) — All four variants compared; three roles; choosing guide; pitfalls; Subject vs shareReplay
- [BehaviorSubject](core/BehaviorSubject.md) — Subject with current value; state container; `.value` accessor
- [ReplaySubject](core/ReplaySubject.md) — Subject with N-value replay buffer; late-join streams; cache
- [AsyncSubject](core/AsyncSubject.md) — Emits only last value on complete; Promise analog
- [Scheduler](core/Scheduler.md) — Controls execution timing; asyncScheduler, animationFrameScheduler, VirtualTime
- [Operators Overview](core/operators.md) — All operator families: creation, transformation, filtering, combination, error handling, multicasting, utility; first-order vs higher-order
- [Hot and Cold Observables](core/hot-cold.md) — Precise definition via subscription side effects; temperature conversion (publish/defer); built-in temperature table; when to share
- [Custom Operators and pipe()](core/custom-operators.md) — pipe() as composition operator; custom operators via pipe factory; parametric operators; low-level Observable constructor pattern
- [Operator Policies — Eight-Policy Framework](core/operator-policies.md) — Start/Emit/Completion/State/Cancellation/Error/Output Type/Input Type; type chain rule; strongly typed Action/Reducer
- [Observable Internals](core/observable-internals.md) — Building Observable from scratch; SafeObserver guarantees; operator pattern; Iterator + Observer synthesis; Observable vs Promise
- [combineLatest — Formal Rules](core/combine-latest.md) — Five rules: initial sync, any-source trigger, latest retention, all-complete, error propagation; EMPTY trap; cold observable trap
- [shareReplay — Caching and Multicasting](core/share-replay.md) — HTTP caching pattern; refCount true/false; fixed TTL (windowTime); sliding TTL with defer; manual invalidation; error replay pitfall
- [RxJS Execution Phases](core/execution-phases.md) — Plan phase (lazy blueprint) vs Execution phase (subscribe triggers); lossy vs non-lossy operators; scheduler as dispatcher bridge
- [Combination Operators — Complete Reference](core/combination-operators.md) — Decision tree; per-operator reference: combineLatest, concat, forkJoin, merge, race, withLatestFrom, zip, pairwise, startWith; comparison table
- [FRP Concepts — Behaviors and Events](core/frp-concepts.md) — Classic FRP origins: Behavior (continuous, Time→A) vs Event (discrete, [(Time,A)]); fold-events-into-behavior = scan; inputs→combinators→outputs pattern; how RxJS maps to classic FRP
- [RxJS as a Dataflow Model](core/dataflow-model.md) — Observable pipelines as directed graphs; operators as nodes; Unix pipe philosophy; OperatorFunction as universal interface; higher-order operators as nested subgraphs
- [Stream Machine Calculus](core/stream-machines.md) — 6 irreducible machines: sampleOn, recomputeLatest, reduceState, flattenWithPolicy, composeTopology, shareExecution; two vocabulary layers (teaching DSL + runtime DSL); complete operator→machine map; 8 classification axes
- [Higher-Order Operators — Complete Deep Dive](core/higher-order-operators.md) — switchMap / mergeMap / concatMap / exhaustMap with marble diagrams; the *All variants; expand for recursion; error handling inside inners; memory leak patterns; decision guide by use case

---

## History

RxJS version history and migration guides.

- [Timeline](history/timeline.md) — From Rx.NET (2009) to RxJS 8; key people; version milestones
- [Erik Meijer](history/erik-meijer.md) — Mathematical foundations: the IEnumerable/IObservable dual, Raven Test origin, games as stream transformations, combineLatest stolen from spreadsheets
- [RxJS 5 → 6 Migration](history/rxjs5-to-6.md) — The pipe() revolution; import path changes; rxjs-compat migration strategy
- [RxJS 6 → 7 Migration](history/rxjs6-to-7.md) — TypeScript rewrite; lastValueFrom; throwError factory; share() config

---

## Patterns

Proven solutions to recurring reactive programming problems.

- [Patterns Index](patterns/index.md) — Quick reference recipes: search, polling, form submit, combining state, cleanup
- [Animations Pattern](patterns/animations.md) — animationFrameScheduler; velocity vs duration-based animations; defer for lazy timestamps; easing; tween with switchMap; higher-order reuse
- [Domain Operators Pattern](patterns/domain-operators.md) — Wrap operator chains in business-named functions; layered architecture; testability; error isolation; anti-patterns
- [MVU Pattern](patterns/mvu.md) — Model–View–Update (Elm-like): action→reducer→state→view with scan
- [Effects Pattern](patterns/effects.md) — NgRx-style Action In → Action Out; switchMap vs exhaustMap choice; error handling in effects
- [State Management](patterns/state-management.md) — BehaviorSubject store; scan-based reducer; selectors; immutable updates
- [Error Handling](patterns/error-handling.md) — catchError inside inner; retry; exponential backoff; graceful degradation
- [State Machine Pattern](patterns/state-machine.md) — scan+action stream (MVU-style) and expand-based recursive approach; testing; composability vs XState

---

## Architectures

Complete application architectures using RxJS.

- [Architectures Index](architectures/index.md) — Comparison table; common principles; dependency graph
- [MVU Architecture](architectures/mvu.md) — Full wiring: action$, reducer, state$, selectors, effects, view binding, cleanup
- [redux-observable](architectures/redux-observable.md) — Epics pattern; RTK integration; comparison vs custom MVU
- [Event-Driven Architecture](architectures/event-driven.md) — Typed event bus; micro-frontend communication; request/response over bus
- [XState vs RxJS](architectures/xstate-vs-rxjs.md) — Control graph vs dataflow graph; traffic light example; pedestrian button as the deciding test; when to use each

---

## Testing

Testing strategies for Observable streams and RxJS-based systems.

- [Testing Index](testing/index.md) — Testing layers (reducer, operator, effect, state); vitest config; quick patterns
- [Marble Testing](testing/marble-testing.md) — Marble syntax; cold/hot Observables; expectObservable; testing switchMap vs mergeMap
- [TestScheduler](testing/TestScheduler.md) — Virtual time; run() API; time(), cold(), hot(), expectSubscriptions; complete examples

---

## Debugging

Techniques for diagnosing and fixing RxJS problems.

- [Debugging Index](debugging/index.md) — Debugging checklist; tap workflow; subscription tracking; DevTools integration
- [tap Operator](debugging/tap.md) — Side effects and debugging; named tap helper; finalize; tap vs map
- [Common Mistakes](debugging/common-mistakes.md) — 13 most common RxJS pitfalls with diagnosis and fixes

---

## Operations Log

See [log](log.md) for the chronological history of wiki changes.
