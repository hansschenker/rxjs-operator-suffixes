# Advanced RxJS Course Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the 50-script Advanced RxJS course with six additions: cross-reference frontmatter, pitfall sections, exercises per lesson, module intro/outro scripts, marble diagram files, and a companion TypeScript project.

**Architecture:** Content-only for Enhancements 1–6 (Markdown with YAML frontmatter); Enhancement 2 adds a Vite/TypeScript companion app under `companion/`. Enhancements 5 and 6 modify all 50 existing scripts; Enhancements 1, 3, 4 create new files alongside them; Enhancement 2 creates a standalone app.

**Tech Stack:** Markdown, YAML frontmatter, TypeScript 5.x, RxJS 7.8.x, Vite 5.x (companion project only)

---

## File Structure

### Modified files (Enhancements 5 + 6)
All 50 existing `scripts/module-NN/NN-NN-*.md` files — add `related:` list to frontmatter and `## Pitfall` section after `## Summary`.

### New files — Exercises (Enhancement 1)
```
scripts/module-01/01-01-from-haskell-to-linq.exercise.md
scripts/module-01/01-02-the-mathematical-dual.exercise.md
scripts/module-01/01-03-iterator-plus-observer.exercise.md
scripts/module-01/01-04-the-unified-type.exercise.md
scripts/module-01/01-05-the-three-step-workflow.exercise.md
scripts/module-02/02-01-what-really-happens-when-you-subscribe.exercise.md
scripts/module-02/02-02-cold-vs-hot.exercise.md
scripts/module-02/02-03-the-five-subscription-phases.exercise.md
scripts/module-02/02-04-two-graphs-every-pipeline-builds.exercise.md
scripts/module-02/02-05-the-three-observable-variants.exercise.md
scripts/module-03/03-01-data-and-logic-are-separate.exercise.md
scripts/module-03/03-02-referential-transparency.exercise.md
scripts/module-03/03-03-subscribe-as-the-impure-boundary.exercise.md
scripts/module-03/03-04-tap-vs-map.exercise.md
scripts/module-03/03-05-rxjs-as-a-dsl.exercise.md
scripts/module-04/04-01-the-three-primitives.exercise.md
scripts/module-04/04-02-scan-building-state.exercise.md
scripts/module-04/04-03-the-monad-laws.exercise.md
scripts/module-04/04-04-t-only-operators.exercise.md
scripts/module-04/04-05-operator-classification.exercise.md
scripts/module-05/05-01-time-value-pairs.exercise.md
scripts/module-05/05-02-lossy-vs-lossless.exercise.md
scripts/module-05/05-03-throttle-and-debounce.exercise.md
scripts/module-05/05-04-buffer-and-window.exercise.md
scripts/module-05/05-05-rate-limiting-decision.exercise.md
scripts/module-06/06-01-unicast-vs-multicast.exercise.md
scripts/module-06/06-02-subject-as-proxy.exercise.md
scripts/module-06/06-03-specialized-subject-variants.exercise.md
scripts/module-06/06-04-share-and-sharereplay.exercise.md
scripts/module-06/06-05-connectable.exercise.md
scripts/module-07/07-01-map-to-observable-problem.exercise.md
scripts/module-07/07-02-mergemap.exercise.md
scripts/module-07/07-03-concatmap.exercise.md
scripts/module-07/07-04-switchmap.exercise.md
scripts/module-07/07-05-exhaustmap.exercise.md
scripts/module-08/08-01-temporal-alignment.exercise.md
scripts/module-08/08-02-combinelatest.exercise.md
scripts/module-08/08-03-withlatestfrom.exercise.md
scripts/module-08/08-04-zip-and-forkjoin.exercise.md
scripts/module-08/08-05-merge-concat-race.exercise.md
scripts/module-09/09-01-why-observables-terminate-on-error.exercise.md
scripts/module-09/09-02-catcherror.exercise.md
scripts/module-09/09-03-retry.exercise.md
scripts/module-09/09-04-timeout-and-finalize.exercise.md
scripts/module-09/09-05-error-handling-decision-tree.exercise.md
scripts/module-10/10-01-alias-and-wrap-pattern.exercise.md
scripts/module-10/10-02-hexagonal-architecture.exercise.md
scripts/module-10/10-03-with-telemetry.exercise.md
scripts/module-10/10-04-testscheduler-and-marbles.exercise.md
scripts/module-10/10-05-the-four-layer-model-as-architecture.exercise.md
```

### New files — Module Intros/Outros (Enhancement 4)
```
scripts/module-01/00-intro.md   scripts/module-01/06-outro.md
scripts/module-02/00-intro.md   scripts/module-02/06-outro.md
scripts/module-03/00-intro.md   scripts/module-03/06-outro.md
scripts/module-04/00-intro.md   scripts/module-04/06-outro.md
scripts/module-05/00-intro.md   scripts/module-05/06-outro.md
scripts/module-06/00-intro.md   scripts/module-06/06-outro.md
scripts/module-07/00-intro.md   scripts/module-07/06-outro.md
scripts/module-08/00-intro.md   scripts/module-08/06-outro.md
scripts/module-09/00-intro.md   scripts/module-09/06-outro.md
scripts/module-10/00-intro.md   scripts/module-10/06-outro.md
```

### New files — Marble Diagrams (Enhancement 3)
```
diagrams/switchmap.md
diagrams/exhaustmap.md
diagrams/concatmap.md
diagrams/mergemap.md
diagrams/debounce-vs-throttle.md
diagrams/combinelatest.md
diagrams/withlatestfrom.md
diagrams/zip-vs-forkjoin.md
diagrams/merge-concat-race.md
diagrams/cold-vs-hot.md
diagrams/share-vs-sharereplay.md
diagrams/buffer-vs-window.md
```

### New files — Companion Project (Enhancement 2)
```
companion/package.json
companion/tsconfig.json
companion/vite.config.ts
companion/index.html
companion/src/main.ts
companion/src/types.ts
companion/src/state.ts
companion/src/operators/search-on-query.ts
companion/src/operators/with-current-user.ts
companion/src/operators/with-telemetry.ts
companion/src/app.ts
companion/src/ui.ts
companion/milestones/module-01.md
companion/milestones/module-02.md
companion/milestones/module-03.md
companion/milestones/module-04.md
companion/milestones/module-05.md
companion/milestones/module-06.md
companion/milestones/module-07.md
companion/milestones/module-08.md
companion/milestones/module-09.md
companion/milestones/module-10.md
```

---

## Exercise File Template

Every `.exercise.md` file follows this structure:

```markdown
---
module: N
lesson: "N.N"
title: <same title as the narration script>
exercise: <one sentence — what the student must do>
difficulty: beginner | intermediate | advanced
---

## Scenario

<!-- 2–3 sentences setting up a realistic problem -->

## Starter Code

```typescript
// Broken, naive, or incomplete implementation
```

## Task

<!-- Numbered list of specific things to fix or implement -->

## Hint

<!-- One sentence pointing back to the key insight from the narration script -->
```

---

## Intro/Outro Template

**Intro (`00-intro.md`):**
```markdown
---
module: N
type: intro
title: Module N — <Module Title>
---

## What You Already Know

<!-- 2–3 sentences: skills from prior modules that this module builds on -->

## What This Module Covers

<!-- Bullet list: the 5 lessons, one line each -->

## Why It Matters

<!-- 2–3 sentences: how this module connects to the 4-Layer Model and to real code -->
```

**Outro (`06-outro.md`):**
```markdown
---
module: N
type: outro
title: Module N Recap — <Module Title>
---

## What You Learned

<!-- 3–5 bullet points: the key insights from the 5 lessons -->

## Bridge to Module N+1

<!-- 2–3 sentences: the unanswered question this module leaves open, answered by the next -->
```

---

## Task 1 — Enhancement 6: Cross-reference frontmatter

Add `related:` YAML list to the frontmatter of all 50 existing scripts. The `related:` field lists lesson codes (e.g. `"2.2"`) of the most conceptually connected lessons.

**Files:** All 50 `scripts/module-NN/NN-NN-*.md`

- [ ] **Step 1: Update Module 1 frontmatter**

For each file, open the frontmatter block and add the `related:` field after `key_insight:`.

`01-01-from-haskell-to-linq.md`:
```yaml
related: ["1.2", "3.5"]
```

`01-02-the-mathematical-dual.md`:
```yaml
related: ["1.1", "1.3", "4.3"]
```

`01-03-iterator-plus-observer.md`:
```yaml
related: ["1.2", "2.1"]
```

`01-04-the-unified-type.md`:
```yaml
related: ["1.3", "2.5"]
```

`01-05-the-three-step-workflow.md`:
```yaml
related: ["3.1", "3.3"]
```

- [ ] **Step 2: Update Module 2 frontmatter**

`02-01-what-really-happens-when-you-subscribe.md`:
```yaml
related: ["1.3", "2.3", "3.3"]
```

`02-02-cold-vs-hot.md`:
```yaml
related: ["6.1", "6.2"]
```

`02-03-the-five-subscription-phases.md`:
```yaml
related: ["2.1", "2.4", "9.1"]
```

`02-04-two-graphs-every-pipeline-builds.md`:
```yaml
related: ["2.3", "9.4"]
```

`02-05-the-three-observable-variants.md`:
```yaml
related: ["6.1", "6.2", "6.5"]
```

- [ ] **Step 3: Update Module 3 frontmatter**

`03-01-data-and-logic-are-separate.md`:
```yaml
related: ["1.5", "3.2"]
```

`03-02-referential-transparency.md`:
```yaml
related: ["3.1", "3.3", "3.4"]
```

`03-03-subscribe-as-the-impure-boundary.md`:
```yaml
related: ["2.1", "3.2", "1.5"]
```

`03-04-tap-vs-map.md`:
```yaml
related: ["3.2", "3.3", "10.3"]
```

`03-05-rxjs-as-a-dsl.md`:
```yaml
related: ["1.1", "3.1", "10.1"]
```

- [ ] **Step 4: Update Module 4 frontmatter**

`04-01-the-three-primitives.md`:
```yaml
related: ["4.3", "7.1"]
```

`04-02-scan-building-state.md`:
```yaml
related: ["4.1", "4.3"]
```

`04-03-the-monad-laws.md`:
```yaml
related: ["4.1", "4.2", "1.2"]
```

`04-04-t-only-operators.md`:
```yaml
related: ["4.5", "5.1"]
```

`04-05-operator-classification.md`:
```yaml
related: ["4.4", "5.1", "10.5"]
```

- [ ] **Step 5: Update Module 5 frontmatter**

`05-01-time-value-pairs.md`:
```yaml
related: ["4.5", "5.2"]
```

`05-02-lossy-vs-lossless.md`:
```yaml
related: ["5.1", "5.3", "5.4", "5.5"]
```

`05-03-throttle-and-debounce.md`:
```yaml
related: ["5.2", "5.5"]
```

`05-04-buffer-and-window.md`:
```yaml
related: ["5.2", "5.5"]
```

`05-05-rate-limiting-decision.md`:
```yaml
related: ["5.2", "5.3", "5.4"]
```

- [ ] **Step 6: Update Module 6 frontmatter**

`06-01-unicast-vs-multicast.md`:
```yaml
related: ["2.2", "6.2", "6.4"]
```

`06-02-subject-as-proxy.md`:
```yaml
related: ["6.1", "6.3"]
```

`06-03-specialized-subject-variants.md`:
```yaml
related: ["6.2", "6.4"]
```

`06-04-share-and-sharereplay.md`:
```yaml
related: ["6.1", "6.5", "10.5"]
```

`06-05-connectable.md`:
```yaml
related: ["6.4", "2.5"]
```

- [ ] **Step 7: Update Module 7 frontmatter**

`07-01-map-to-observable-problem.md`:
```yaml
related: ["4.1", "7.2", "7.3", "7.4", "7.5"]
```

`07-02-mergemap.md`:
```yaml
related: ["7.1", "7.3"]
```

`07-03-concatmap.md`:
```yaml
related: ["7.1", "7.2"]
```

`07-04-switchmap.md`:
```yaml
related: ["7.1", "7.5"]
```

`07-05-exhaustmap.md`:
```yaml
related: ["7.1", "7.4"]
```

- [ ] **Step 8: Update Module 8 frontmatter**

`08-01-temporal-alignment.md`:
```yaml
related: ["8.2", "8.3", "8.4", "8.5"]
```

`08-02-combinelatest.md`:
```yaml
related: ["8.1", "8.3"]
```

`08-03-withlatestfrom.md`:
```yaml
related: ["8.1", "8.2"]
```

`08-04-zip-and-forkjoin.md`:
```yaml
related: ["8.1", "8.5"]
```

`08-05-merge-concat-race.md`:
```yaml
related: ["8.1", "8.4"]
```

- [ ] **Step 9: Update Module 9 frontmatter**

`09-01-why-observables-terminate-on-error.md`:
```yaml
related: ["2.3", "9.2"]
```

`09-02-catcherror.md`:
```yaml
related: ["9.1", "9.3", "9.5"]
```

`09-03-retry.md`:
```yaml
related: ["9.2", "9.5"]
```

`09-04-timeout-and-finalize.md`:
```yaml
related: ["2.4", "9.2"]
```

`09-05-error-handling-decision-tree.md`:
```yaml
related: ["9.2", "9.3"]
```

- [ ] **Step 10: Update Module 10 frontmatter**

`10-01-alias-and-wrap-pattern.md`:
```yaml
related: ["3.5", "10.2"]
```

`10-02-hexagonal-architecture.md`:
```yaml
related: ["10.1", "10.3"]
```

`10-03-with-telemetry.md`:
```yaml
related: ["10.2", "3.4"]
```

`10-04-testscheduler-and-marbles.md`:
```yaml
related: ["5.1", "10.5"]
```

`10-05-the-four-layer-model-as-architecture.md`:
```yaml
related: ["4.5", "5.2", "6.4", "7.1"]
```

- [ ] **Step 11: Commit**

```bash
git add scripts/
git commit -m "feat: add cross-reference frontmatter to all 50 lesson scripts"
```

---

## Task 2 — Enhancement 5: Pitfall sections

Append a `## Pitfall` section after `## Summary` in all 50 scripts. Each pitfall is 2–3 sentences: the failure mode and its consequence.

**Files:** All 50 `scripts/module-NN/NN-NN-*.md`

- [ ] **Step 1: Add pitfalls to Module 1**

`01-01-from-haskell-to-linq.md` — append after `## Summary`:
```markdown
## Pitfall

Treating `map` and `filter` as syntactic conveniences rather than a mathematical consequence. Because RxJS operators derive from the IEnumerable/IObservable duality, they compose by law — not by coincidence. Developers who treat them as arbitrary functions miss that the composition guarantees come from the mathematical structure, not from RxJS's implementation choices.
```

`01-02-the-mathematical-dual.md`:
```markdown
## Pitfall

Confusing duality with symmetry. IEnumerable and IObservable are mathematical duals — arrows flipped — not mirrors. `map` on an array is synchronous and pull-based; `map` on an Observable is asynchronous and push-based. The names are the same because the structure is dual, not because the execution model is identical.
```

`01-03-iterator-plus-observer.md`:
```markdown
## Pitfall

Subclassing `Observable` to create a custom producer instead of using the constructor. `new Observable(subscriber => { ... })` is the correct pattern — the subscribe function is the producer. Subclassing bypasses the `SafeSubscriber` wrapper and breaks the post-error/complete emission contract.
```

`01-04-the-unified-type.md`:
```markdown
## Pitfall

Wrapping a Promise in `new Observable(...)` instead of using `from(promise)`. The unified type already handles Promises, Arrays, and iterables via `from`. Manual wrapping is error-prone (forgetting to call `complete()`) and unnecessary — it is the wheel RxJS already invented.
```

`01-05-the-three-step-workflow.md`:
```markdown
## Pitfall

Putting DOM updates or logging inside `map`. The pure transformation zone must contain only pure functions returning transformed values. A `map` that calls `console.log` or mutates state breaks referential transparency — the same pipe now has different behavior depending on whether it is subscribed once or ten times.
```

- [ ] **Step 2: Add pitfalls to Module 2**

`02-01-what-really-happens-when-you-subscribe.md`:
```markdown
## Pitfall

Subscribing to an HTTP Observable in two components expecting them to share one request. Every `subscribe()` call creates a fresh producer execution — two subscribes fire two HTTP requests. The fix is `shareReplay({ bufferSize: 1, refCount: true })` to share one execution across multiple consumers.
```

`02-02-cold-vs-hot.md`:
```markdown
## Pitfall

Using a cold Observable for a WebSocket or SSE connection in a service. Every component that subscribes opens its own connection. The service should create the connection once (hot producer) and expose it via `share()` or `shareReplay()` — not expose the cold Observable directly.
```

`02-03-the-five-subscription-phases.md`:
```markdown
## Pitfall

Relying on the `complete` phase to run cleanup. Subjects and interval-based Observables never emit `complete` on their own. Use `finalize()` for unconditional teardown — it fires on complete, error, and manual unsubscribe, making it the only reliable cleanup hook.
```

`02-04-two-graphs-every-pipeline-builds.md`:
```markdown
## Pitfall

Subscribing without storing the returned `Subscription` object. Without a reference to the subscription, `unsubscribe()` is impossible — the subscription tree stays alive forever. Always store the subscription: `const sub = obs$.subscribe(...)` and call `sub.unsubscribe()` in the component's destroy lifecycle.
```

`02-05-the-three-observable-variants.md`:
```markdown
## Pitfall

Using a plain `Subject` as a shared state container. `Subject` has no memory — late subscribers receive only future emissions, not the current value. Use `BehaviorSubject` when consumers need the current state immediately on subscribe, which is the case for virtually all state-sharing scenarios.
```

- [ ] **Step 3: Add pitfalls to Module 3**

`03-01-data-and-logic-are-separate.md`:
```markdown
## Pitfall

Passing an Observable into a function that immediately calls `.subscribe()` on it. The function should accept an Observable and return a transformed Observable — keeping logic in the operator chain. A function that subscribes is an exit point, not a transformation; it belongs at the boundary, not inside the pipeline.
```

`03-02-referential-transparency.md`:
```markdown
## Pitfall

Storing the result of `.subscribe()` and treating it as the Observable's value. A `Subscription` is a teardown handle, not a value — it cannot be composed, passed through operators, or subscribed to again. The Observable itself is the reusable blueprint; the Subscription is a one-time execution handle.
```

`03-03-subscribe-as-the-impure-boundary.md`:
```markdown
## Pitfall

Calling `.subscribe()` inside a `switchMap` or `mergeMap` callback. This is a nested subscription — a hidden inner execution with no teardown logic connected to the outer subscription tree. Flatten with the appropriate operator instead: `switchMap`, `mergeMap`, `concatMap`, or `exhaustMap`.
```

`03-04-tap-vs-map.md`:
```markdown
## Pitfall

Returning a value from a `tap` callback expecting it to change the emitted value. `tap` ignores its return value entirely — the original value passes through unchanged. Only `map` transforms the emitted value. If you need to both log and transform, use `tap` for logging followed by `map` for transformation, in separate operator slots.
```

`03-05-rxjs-as-a-dsl.md`:
```markdown
## Pitfall

Importing `switchMap` and `debounceTime` directly in component files. In the DSL model, components speak domain language (`searchOnQuery`, `waitForTypingPause`); RxJS operators are the compiler hidden inside domain operators. Direct RxJS imports in components break the abstraction boundary and make components unreadable to non-RxJS developers.
```

- [ ] **Step 4: Add pitfalls to Module 4**

`04-01-the-three-primitives.md`:
```markdown
## Pitfall

Using `reduce` instead of `scan` when intermediate values matter. `reduce` waits for the source to complete before emitting the final accumulation — on an infinite stream, it never emits at all. Use `scan` any time you need running state; reserve `reduce` for finite sources where only the final total is needed.
```

`04-02-scan-building-state.md`:
```markdown
## Pitfall

Mutating the accumulator inside `scan`. `scan((acc, val) => { acc.items.push(val); return acc; })` returns the same array reference each time — all downstream operators and subscribers see the same mutated object. Always return a new object: `scan((acc, val) => ({ ...acc, items: [...acc.items, val] }))`.
```

`04-03-the-monad-laws.md`:
```markdown
## Pitfall

Using `mergeMap` or `switchMap` with a callback that performs a side effect rather than returning an Observable. `flatMap(x => { sideEffect(); return of(x); })` technically works but breaks the second monad law (left identity): the mapping function is no longer a pure `T → Observable<T>` morphism, making refactoring unsafe.
```

`04-04-t-only-operators.md`:
```markdown
## Pitfall

Reaching for a time-based operator when a T-only operator is sufficient. `distinctUntilChanged` (T-only) is free of timer overhead; adding a custom `debounceTime(0)` to "flush" what distinctUntilChanged already handles is unnecessary. T-only operators are synchronous and scheduler-free — use the cheapest operator that solves the problem.
```

`04-05-operator-classification.md`:
```markdown
## Pitfall

Treating operator classification as fixed. `distinctUntilChanged` is T-only with the default comparator but becomes T+time if given an async comparator that calls an API. An operator's classification depends on its configuration, not just its name — always check what a specific invocation does before classifying it.
```

- [ ] **Step 5: Add pitfalls to Module 5**

`05-01-time-value-pairs.md`:
```markdown
## Pitfall

Treating two streams that emit the same values as equivalent because the values match. `of(1, 2, 3)` emits all three values synchronously at t=0; `interval(1000).pipe(take(3), map(i => i + 1))` emits them at t=1000, t=2000, t=3000. The value sequences are identical; the temporal sequences are completely different. Operators like `zip` and `combineLatest` produce different results for each.
```

`05-02-lossy-vs-lossless.md`:
```markdown
## Pitfall

Choosing a lossless operator (buffer, window) when the consumer cannot keep up with the buffered data. An unbounded `bufferTime(1000)` on a 1000 items/second source produces 1000-item arrays every second — if processing each array takes more than 1 second, memory grows without bound. Use lossy operators when the consumer is the bottleneck.
```

`05-03-throttle-and-debounce.md`:
```markdown
## Pitfall

Applying `debounceTime` to a button click that must always fire at least once per click. If the user holds the button down continuously, `debounceTime` never fires — silence never arrives. Use `throttleTime` with `{ leading: true }` for a button that should respond immediately and then enforce a cooldown, not wait for a pause.
```

`05-04-buffer-and-window.md`:
```markdown
## Pitfall

Subscribing to the outer `windowTime` Observable but forgetting to subscribe to each inner Observable it emits. `windowTime` emits `Observable<T>` values — each window is itself an Observable. If you only subscribe to the outer stream and ignore the inner Observables, you receive empty window containers and wonder why no values appear.
```

`05-05-rate-limiting-decision.md`:
```markdown
## Pitfall

Stacking multiple rate-limiting operators in the same `pipe`. `debounceTime(300)` followed by `throttleTime(500)` in the same chain produces behavior that is very difficult to reason about — the throttle silently swallows outputs that debounce already filtered. One rate-limiting operator per pipe chain is the rule; choose the one that fits the requirement, not multiple partial fits.
```

- [ ] **Step 6: Add pitfalls to Module 6**

`06-01-unicast-vs-multicast.md`:
```markdown
## Pitfall

Sharing the `Subscription` object between components thinking this shares the producer. A `Subscription` is a teardown handle — sharing it does not share the underlying producer. To share one producer across multiple consumers, the Observable itself must be multicast via `share()`, `shareReplay()`, or a `Subject`.
```

`06-02-subject-as-proxy.md`:
```markdown
## Pitfall

Exposing a `Subject` directly from a service. Any caller can call `subject.next()`, bypassing the service's encapsulation and injecting values from anywhere in the application. Always expose `subject.asObservable()` to consumers; only the service that owns the Subject should call `next()`.
```

`06-03-specialized-subject-variants.md`:
```markdown
## Pitfall

Initializing a `BehaviorSubject` with `null` and not filtering it downstream. `BehaviorSubject<User | null>(null)` emits `null` immediately to every new subscriber before the real value loads. Consumers that do not handle `null` crash or render empty states. Either initialize with a meaningful default or use `filter((v): v is User => v !== null)` downstream.
```

`06-04-share-and-sharereplay.md`:
```markdown
## Pitfall

Using `shareReplay(1)` (shorthand form) without `refCount: true`. The shorthand is equivalent to `shareReplay({ bufferSize: 1, refCount: false })` in RxJS 6, which keeps the internal subscription alive after all consumers unsubscribe. New subscribers then receive stale cached data instead of triggering a fresh execution. Always use `shareReplay({ bufferSize: 1, refCount: true })`.
```

`06-05-connectable.md`:
```markdown
## Pitfall

Calling `connect()` before any subscribers have attached. Emissions that occur between `connect()` and the first `subscribe()` are lost permanently — the connectable Observable has no buffer by default. Either use `shareReplay` if late subscribers need buffered values, or attach all subscribers before calling `connect()`.
```

- [ ] **Step 7: Add pitfalls to Module 7**

`07-01-map-to-observable-problem.md`:
```markdown
## Pitfall

Calling `.subscribe()` inside a `map` callback to "unwrap" an inner Observable. This creates a nested subscription — a hidden inner execution that has no teardown connected to the outer subscription tree. The outer subscription completes or errors independently of all inner subscriptions it created. Use a flattening operator instead.
```

`07-02-mergemap.md`:
```markdown
## Pitfall

Using `mergeMap` on a fast source without a concurrency limit. A mouse-move event at 60fps piped through `mergeMap(pos => expensiveRequest(pos))` opens 60 simultaneous requests per second. Use the second argument: `mergeMap(fn, 3)` to cap at 3 concurrent inner Observables, or switch to `exhaustMap` if only the latest matters.
```

`07-03-concatmap.md`:
```markdown
## Pitfall

Using `concatMap` on a source that emits much faster than the inner Observables complete. Each unprocessed emission joins an unbounded internal queue. A source emitting 100 items where each inner Observable takes 1 second to complete will take 100 seconds to drain — and hold all 100 items in memory throughout. Use `switchMap` or `exhaustMap` if old items should be discarded.
```

`07-04-switchmap.md`:
```markdown
## Pitfall

Using `switchMap` for a form save operation. If the user edits and submits twice in quick succession, `switchMap` cancels the first in-flight save when the second submit arrives. The server may never receive the first write, leaving data in an inconsistent state with no error in the console. Use `exhaustMap` (ignore while busy) or `concatMap` (queue) for write operations.
```

`07-05-exhaustmap.md`:
```markdown
## Pitfall

Using `exhaustMap` for a typeahead search. While the first search request is in-flight, every subsequent keystroke is silently dropped. The results panel appears frozen until the first search completes. Use `switchMap` for search — cancel-on-new, not ignore-while-busy.
```

- [ ] **Step 8: Add pitfalls to Module 8**

`08-01-temporal-alignment.md`:
```markdown
## Pitfall

Using `combineLatest` when `withLatestFrom` was the correct choice. If a secondary source emits frequently, `combineLatest` fires output on every secondary emission — flooding the pipeline with updates triggered by context changes rather than primary actions. Ask: should secondary emissions trigger output? If no, use `withLatestFrom`.
```

`08-02-combinelatest.md`:
```markdown
## Pitfall

Using `combineLatest` with sources that may be slow to emit their first value. `combineLatest` does not emit until all sources have emitted at least once. If one source is a slow HTTP call, the derived state is unavailable until that call completes. Add `startWith(defaultValue)` to slow sources to unblock the initial emission.
```

`08-03-withlatestfrom.md`:
```markdown
## Pitfall

Forgetting that `withLatestFrom` silently produces no output if the secondary source has not yet emitted. Primary emissions that arrive before the secondary has produced its first value are dropped with no error or warning. Guard with `startWith` on the secondary source when its first emission may be delayed.
```

`08-04-zip-and-forkjoin.md`:
```markdown
## Pitfall

Using `zip` with one infinite Observable and one finite Observable. When the finite source completes, `zip` completes immediately — all buffered values from the infinite source are silently discarded. `zip` is designed for finite, positionally-correlated sources. For parallel async operations where you only need the last value, use `forkJoin`.
```

`08-05-merge-concat-race.md`:
```markdown
## Pitfall

Using `concat` with an Observable that never completes as the first argument. `concat` subscribes to sources sequentially — the second source never subscribes until the first completes. An infinite first source means the second source is permanently blocked. Use `merge` if sources should run simultaneously, or `race` if the first-to-emit should win.
```

- [ ] **Step 9: Add pitfalls to Module 9**

`09-01-why-observables-terminate-on-error.md`:
```markdown
## Pitfall

Adding `catchError` expecting the original stream to resume after the catch. `catchError` replaces the terminated stream with a new Observable — the original producer is gone. If you need the stream to continue producing after a recoverable error, use `retry` (which resubscribes to the original source) or place `catchError` inside the inner Observable of a `switchMap` so the outer stream is never affected.
```

`09-02-catcherror.md`:
```markdown
## Pitfall

Placing `catchError` outside a `switchMap` instead of inside the inner Observable. An error inside `switchMap`'s inner Observable propagates to the outer stream, terminating the entire pipeline — including the typeahead that was listening for more keystrokes. Always wrap inner Observables: `switchMap(q => search(q).pipe(catchError(() => of([]))))`.
```

`09-03-retry.md`:
```markdown
## Pitfall

Using `retry()` with no argument, which retries infinitely. On a permanently failing endpoint — a server that is down, a URL that does not exist — `retry()` creates an infinite loop of HTTP requests until the browser tab is closed or crashes. Always bound retries with a count: `retry(3)` or `retry({ count: 3 })`.
```

`09-04-timeout-and-finalize.md`:
```markdown
## Pitfall

Using `tap({ complete: () => hideSpinner() })` for cleanup logic. `tap.complete` only fires on graceful completion — it is silently skipped on error and on manual `unsubscribe()`. Use `finalize(() => hideSpinner())` instead: it fires on every termination path, making it the only reliable place for cleanup that must always run.
```

`09-05-error-handling-decision-tree.md`:
```markdown
## Pitfall

Placing `catchError` before `retry` in the pipe chain. `catchError` intercepts the error first, returning a fallback Observable — `retry` never sees the error and never retries. The correct order is always `retry` first, `catchError` last: `pipe(retry({ count: 3 }), catchError(() => of(fallback)))`.
```

- [ ] **Step 10: Add pitfalls to Module 10**

`10-01-alias-and-wrap-pattern.md`:
```markdown
## Pitfall

Naming the wrapper function the same as the RxJS operator it wraps. `export const switchMap = (apiFn) => rxjsSwitchMap(...)` shadows the imported RxJS `switchMap` in any file that imports both, causing confusing "not a function" errors. Domain operator names must be distinct from the RxJS operators they wrap — that naming distinction is the entire point of the pattern.
```

`10-02-hexagonal-architecture.md`:
```markdown
## Pitfall

Importing `switchMap` or `debounceTime` directly in a component "just for this one case". Every RxJS import in a component file breaks the hexagonal boundary — the component now has knowledge of the infrastructure layer. Extract even single-use RxJS logic into a named domain operator; the naming forces you to think about what the operation means in domain terms.
```

`10-03-with-telemetry.md`:
```markdown
## Pitfall

Implementing telemetry inline with `tap` inside each operator rather than as a `withTelemetry` wrapper. Inline `tap` telemetry cannot be toggled (you cannot disable logging in tests without modifying each operator), cannot be reused across operators, and cannot be tested in isolation. The wrapper pattern is not premature abstraction — it is the minimum viable separation for cross-cutting concerns.
```

`10-04-testscheduler-and-marbles.md`:
```markdown
## Pitfall

Using `setTimeout`, `Date.now()`, or `setInterval` inside a `TestScheduler.run()` block. Real timers run in wall-clock time, not virtual time — they never fire inside the virtual scheduler's synchronous execution. All time in marble tests must come from RxJS schedulers (the ones `TestScheduler` replaces). If your operator uses a non-RxJS timer, marble testing cannot control it.
```

`10-05-the-four-layer-model-as-architecture.md`:
```markdown
## Pitfall

Diagnosing a Layer 3 (Sharing) problem as a Layer 1 (Values) bug. `shareReplay` serving a stale cached value looks exactly like a wrong value from a transformation error — the value is wrong, but the map/filter operators are correct. Checking Layer 3 first (is this shared? is the cache stale?) would have found the bug immediately. Apply the 4-Layer diagnostic in order.
```

- [ ] **Step 11: Commit**

```bash
git add scripts/
git commit -m "feat: add Pitfall section to all 50 lesson scripts"
```

---

## Task 3 — Enhancement 1: Exercise files, Modules 1–5

Create one `.exercise.md` file per lesson for Modules 1–5 (25 files total).

- [ ] **Step 1: Write Module 1 exercises**

`scripts/module-01/01-01-from-haskell-to-linq.exercise.md`:
```markdown
---
module: 1
lesson: "1.1"
title: From Haskell to LINQ — the intellectual lineage of RxJS
exercise: Identify the LINQ-to-RxJS operator equivalents and explain what changed in the translation.
difficulty: beginner
---

## Scenario

A team is debating whether to use RxJS or write custom async utility functions. A developer argues: "RxJS operators are just utility functions — we could write the same things ourselves." You need to explain why the operator vocabulary is a mathematical consequence of duality, not an arbitrary API.

## Starter Code

```typescript
// These are "equivalent" pairs — match each LINQ method to its RxJS counterpart
// and fill in what changed in the translation from pull to push

const linqToRxjs: Array<{ linq: string; rxjs: string; whatChanged: string }> = [
	{ linq: 'Select',   rxjs: '???',  whatChanged: '???' },
	{ linq: 'Where',    rxjs: '???',  whatChanged: '???' },
	{ linq: 'Aggregate',rxjs: '???',  whatChanged: '???' },
	{ linq: 'SelectMany',rxjs: '???', whatChanged: '???' },
	{ linq: 'Take',     rxjs: '???',  whatChanged: '???' },
	{ linq: 'Zip',      rxjs: '???',  whatChanged: '???' },
];
```

## Task

1. Fill in the `rxjs` field for each row with the correct RxJS operator name.
2. Fill in `whatChanged` — describe in one sentence how the semantics shift from synchronous pull to asynchronous push.
3. Add one row for a RxJS operator that has **no direct LINQ equivalent** (hint: it involves time) and explain why LINQ could not have it.

## Hint

The operators are the same because the structure is dual — the names survive the flip of arrows. The time-based operators are new because IEnumerable has no temporal dimension.
```

`scripts/module-01/01-02-the-mathematical-dual.exercise.md`:
```markdown
---
module: 1
lesson: "1.2"
title: The Mathematical Dual — how IEnumerable became IObservable
exercise: Write the IObservable interface by dualizing the IEnumerable interface.
difficulty: intermediate
---

## Scenario

Understanding that `Observable` is a mathematical dual of `Iterable` is the fastest path to understanding why RxJS's subscribe method looks the way it does. This exercise makes the duality concrete.

## Starter Code

```typescript
// The pull-based Iterable/Iterator pair (simplified)
interface MyIterator<T> {
	next(): { value: T; done: boolean };
}

interface MyIterable<T> {
	[Symbol.iterator](): MyIterator<T>;
}

// EXERCISE: Write the push-based dual of the above.
// Rules:
//   1. Flip every arrow: producer calls consumer instead of consumer calling producer
//   2. The three outcomes of Iterator (value, done=false), (value, done=true), (throw)
//      become the three callbacks of Observer: next, complete, error
//   3. The factory method that returns an iterator becomes the subscribe method

interface MyObserver<T> {
	// ??? fill in the three callbacks
}

interface MyObservable<T> {
	// ??? fill in the subscribe method signature
	// What does subscribe return? (hint: something that lets you stop listening)
}
```

## Task

1. Complete `MyObserver<T>` with the three callback methods derived from the dual of `MyIterator`.
2. Complete `MyObservable<T>` with the `subscribe` method signature.
3. Write a type alias `Unsubscribe` for what `subscribe` should return, and explain why the dual of "requesting the next value" is "telling the producer to stop".

## Hint

In the pull model, the consumer requests values by calling `next()`. In the dual push model, the producer notifies the consumer — the consumer registers callbacks once and waits. The return value of `subscribe` is the dual of the `done` flag: a way to signal termination from the consumer side.
```

`scripts/module-01/01-03-iterator-plus-observer.exercise.md`:
```markdown
---
module: 1
lesson: "1.3"
title: Iterator + Observer — the two GoF patterns RxJS fuses
exercise: Label which pattern each code fragment belongs to, then combine them into an Observable.
difficulty: beginner
---

## Scenario

The code below has two independent pieces of async infrastructure — one using the Iterator pattern, one using the Observer pattern. Your job is to identify which is which, then fuse them using RxJS.

## Starter Code

```typescript
// Fragment A
class NumberSequence {
	private current = 0;
	next(): { value: number; done: boolean } {
		if (this.current >= 5) return { value: 0, done: true };
		return { value: this.current++, done: false };
	}
}

// Fragment B
type Callback<T> = (value: T) => void;
class EventBus<T> {
	private listeners: Callback<T>[] = [];
	subscribe(cb: Callback<T>): void { this.listeners.push(cb); }
	emit(value: T): void { this.listeners.forEach(l => l(value)); }
}

// EXERCISE: Using RxJS, write a single Observable that combines both patterns:
// - It produces a finite sequence of numbers (Iterator behaviour)
// - It notifies subscribers when each number is ready (Observer behaviour)
import { Observable } from 'rxjs';

const numbers$: Observable<number> = /* ??? */;
```

## Task

1. Label Fragment A as "Iterator pattern" or "Observer pattern" and explain why.
2. Label Fragment B as "Iterator pattern" or "Observer pattern" and explain why.
3. Implement `numbers$` using `new Observable(subscriber => { ... })` that emits 0 through 4, then completes — combining both patterns.

## Hint

The Iterator pattern defines the sequence structure (what values, in what order, when to stop). The Observer pattern defines the delivery mechanism (push notifications to registered listeners). RxJS fuses them: the Observable defines the sequence; subscribe is the delivery.
```

`scripts/module-01/01-04-the-unified-type.exercise.md`:
```markdown
---
module: 1
lesson: "1.4"
title: The Unified Type — why Observable absorbs Arrays, Promises, and Events
exercise: Rewrite four different async sources as Observables using the correct creation operator for each.
difficulty: beginner
---

## Scenario

A codebase uses four different patterns to handle async data. Your task is to unify them all under a single Observable type so they can share the same operator pipeline.

## Starter Code

```typescript
import { /* ??? */ } from 'rxjs';

// Source 1: A static array of user IDs
const userIds: number[] = [1, 2, 3, 4, 5];
const userIds$: Observable<number> = /* ??? */;

// Source 2: A Promise from a fetch call
const fetchUser = (id: number): Promise<User> =>
	fetch(`/api/users/${id}`).then(r => r.json());
const user1$: Observable<User> = /* ??? */;

// Source 3: A DOM button click event
const button = document.getElementById('submit') as HTMLButtonElement;
const clicks$: Observable<MouseEvent> = /* ??? */;

// Source 4: A value that should emit once immediately
const config = { theme: 'dark', lang: 'en' };
const config$: Observable<Config> = /* ??? */;

interface User { id: number; name: string; }
interface Config { theme: string; lang: string; }
```

## Task

1. Fill in each `???` with the correct RxJS creation operator.
2. For each source, write one sentence explaining what the Observable does that the original type could not: what was impossible with `number[]`, `Promise<User>`, `addEventListener`, and a plain object?
3. Write a single `pipe()` chain that combines `clicks$` and `user1$` — on each click, fetch user 1 and log the result.

## Hint

The unified type absorbs all four by treating each as a push source that emits zero or more values over time. The operators work identically regardless of which creation operator was used.
```

`scripts/module-01/01-05-the-three-step-workflow.exercise.md`:
```markdown
---
module: 1
lesson: "1.5"
title: The 3-Step Workflow — enter, transform, exit
exercise: Refactor this mixed-zone code so all side effects live in the exit zone.
difficulty: intermediate
---

## Scenario

The code below was written by a developer who mixed side effects into the transformation zone. It works, but it is impure, untestable, and has a subtle bug that only shows up when the Observable is subscribed to more than once.

## Starter Code

```typescript
import { fromEvent } from 'rxjs';
import { map, filter, debounceTime } from 'rxjs/operators';

const input = document.getElementById('search') as HTMLInputElement;

const results$ = fromEvent(input, 'input').pipe(
	map((e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		console.log('[search] query changed:', value);   // BUG: side effect in transform zone
		document.getElementById('spinner')!.style.display = 'block'; // BUG: DOM mutation in transform zone
		return value;
	}),
	filter(v => v.length > 2),
	debounceTime(300),
	map(query => {
		const result = `Searching for: ${query}`;
		localStorage.setItem('lastQuery', query);  // BUG: side effect in transform zone
		return result;
	}),
);

results$.subscribe(result => {
	document.getElementById('spinner')!.style.display = 'none';
	document.getElementById('results')!.textContent = result;
});
```

## Task

1. Identify the three side effects in the transformation zone.
2. Rewrite the pipeline moving all side effects into `tap()` operators or into the `subscribe()` callback.
3. Explain why hiding the spinner inside `map` creates a bug when `results$` is subscribed to twice.

## Hint

The pure zone must contain only pure functions that transform values without touching the outside world. Use `tap` to declare side effects in the pipe — they run at the right time without escaping the pure zone's contract.
```

- [ ] **Step 2: Write Module 2 exercises**

`scripts/module-02/02-01-what-really-happens-when-you-subscribe.exercise.md`:
```markdown
---
module: 2
lesson: "2.1"
title: What really happens when you subscribe
exercise: Fix a service that fires duplicate HTTP requests because two components subscribe to the same cold Observable.
difficulty: intermediate
---

## Scenario

A `UserService` exposes a `currentUser$` Observable that fetches the logged-in user. Two components subscribe to it. The network tab shows two identical GET requests firing on page load. Fix the service so exactly one HTTP request fires regardless of subscriber count.

## Starter Code

```typescript
import { Injectable } from '@angular/core'; // or plain class — no framework required
import { ajax } from 'rxjs/ajax';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface User { id: number; name: string; role: string; }

// BUG: every subscribe() call fires a new HTTP request
class UserService {
	readonly currentUser$: Observable<User> = ajax
		.getJSON<User>('/api/me')
		.pipe(map(user => ({ ...user, role: user.role.toUpperCase() })));
}

// Two components both subscribe:
const service = new UserService();
service.currentUser$.subscribe(user => console.log('Header:', user.name));
service.currentUser$.subscribe(user => console.log('Sidebar:', user.role));
// Result: two GET /api/me requests fire
```

## Task

1. Explain in one sentence why two requests fire.
2. Fix `UserService` so exactly one request fires and both subscribers receive the same value.
3. Ensure late subscribers (ones that subscribe after the HTTP response arrives) also receive the user value without triggering a new request.

## Hint

Each `subscribe()` creates a new producer execution. To share one execution, the Observable must be multicast — look at `shareReplay` and what its `bufferSize` and `refCount` options do.
```

`scripts/module-02/02-02-cold-vs-hot.exercise.md`:
```markdown
---
module: 2
lesson: "2.2"
title: Cold vs Hot — the producer behavior distinction
exercise: Classify five Observables as hot or cold, and convert one cold Observable to hot.
difficulty: beginner
---

## Scenario

Before choosing a sharing strategy, you must correctly classify the producer. Misclassifying a hot Observable as cold leads to missed events; misclassifying a cold Observable as hot leads to unexpected sharing.

## Starter Code

```typescript
import { Observable, Subject, interval, fromEvent, of, BehaviorSubject } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// Classify each as HOT or COLD, and explain why in one sentence

const a$ = interval(1000);
// Classification: ???  Reason: ???

const b$ = fromEvent(document, 'click');
// Classification: ???  Reason: ???

const c$ = ajax.getJSON('/api/data');
// Classification: ???  Reason: ???

const d$ = new BehaviorSubject<number>(0);
// Classification: ???  Reason: ???

const e$ = of(1, 2, 3);
// Classification: ???  Reason: ???

// EXERCISE: The Observable below creates a new WebSocket per subscriber.
// Convert it to hot so all subscribers share one WebSocket.
const createWebSocket$ = new Observable<MessageEvent>(subscriber => {
	const ws = new WebSocket('wss://example.com/feed');
	ws.onmessage = e => subscriber.next(e);
	ws.onerror = e => subscriber.error(e);
	ws.onclose = () => subscriber.complete();
	return () => ws.close();
});

const sharedWebSocket$: Observable<MessageEvent> = /* ??? */;
```

## Task

1. Fill in the classification and reason for each of `a$` through `e$`.
2. Implement `sharedWebSocket$` so all subscribers share one WebSocket connection.
3. What happens to late subscribers of `sharedWebSocket$` — do they receive messages that arrived before they subscribed? Explain why.

## Hint

Cold = producer created per subscriber. Hot = producer already running before subscribe. The difference is inside the subscribe function — does it create the source, or just listen to it?
```

`scripts/module-02/02-03-the-five-subscription-phases.exercise.md`:
```markdown
---
module: 2
lesson: "2.3"
title: The five subscription phases
exercise: Add proper teardown logic to an Observable that leaks resources through all five phases.
difficulty: intermediate
---

## Scenario

The Observable below starts a polling interval and registers a DOM event listener. It has no teardown logic — when the subscription is unsubscribed, the interval and event listener keep running forever.

## Starter Code

```typescript
import { Observable } from 'rxjs';

interface PositionUpdate { x: number; y: number; timestamp: number; }

// BUG: no teardown — interval and event listener leak on unsubscribe
const position$ = new Observable<PositionUpdate>(subscriber => {
	let lastPosition = { x: 0, y: 0 };

	document.addEventListener('mousemove', (e: MouseEvent) => {
		lastPosition = { x: e.clientX, y: e.clientY };
	});

	const intervalId = setInterval(() => {
		subscriber.next({ ...lastPosition, timestamp: Date.now() });
	}, 100);

	// Missing: teardown logic
});

const sub = position$.subscribe(pos => console.log(pos));
setTimeout(() => sub.unsubscribe(), 3000); // teardown should run here — but doesn't
```

## Task

1. Add teardown logic (return a cleanup function from the subscriber function) that removes the event listener and clears the interval.
2. Identify which of the five subscription phases (Setup, Running, Error, Complete, Teardown) each line of the subscriber function corresponds to.
3. Rewrite using `fromEvent` and `interval` from RxJS with the proper operator to combine them, eliminating the manual resource management entirely.

## Hint

The subscriber function's return value is the teardown function — it runs during the Teardown phase (unsubscribe, error, or complete). Return a function that reverses every side effect the Setup phase created.
```

`scripts/module-02/02-04-two-graphs-every-pipeline-builds.exercise.md`:
```markdown
---
module: 2
lesson: "2.4"
title: Two graphs every pipeline builds
exercise: Draw the dependency graph and subscription graph for a pipeline, then identify which nodes leak if unsubscribed incorrectly.
difficulty: advanced
---

## Scenario

Understanding the two-graph model is essential for diagnosing memory leaks. This exercise makes both graphs explicit for a real pipeline.

## Starter Code

```typescript
import { fromEvent, interval } from 'rxjs';
import { switchMap, share, take } from 'rxjs/operators';

const button$ = fromEvent(document.getElementById('start')!, 'click');
const timer$ = interval(1000).pipe(take(10));
const shared$ = button$.pipe(switchMap(() => timer$), share());

const sub1 = shared$.subscribe(v => console.log('A:', v));
const sub2 = shared$.subscribe(v => console.log('B:', v));

// Question: if sub1.unsubscribe() is called, what happens to sub2?
// Question: if both unsubscribe, does the button event listener get removed?
```

## Task

1. Draw the **dependency graph**: boxes for each Observable (`button$`, `timer$`, `shared$`), arrows showing value flow. Label each edge with the operator that connects them.
2. Draw the **subscription graph**: boxes for `sub1`, `sub2`, the `share()` internal subscription, and the source subscriptions. Arrows show teardown propagation (who tells whom to stop).
3. Answer: if only `sub1.unsubscribe()` is called, does the `button$` event listener get removed? Why or why not?

## Hint

The dependency graph is static — it describes value flow and is built at pipe-time. The subscription graph is dynamic — it describes teardown propagation and is built at subscribe-time. `share()` creates a single internal subscription to the source, shared across all external subscribers.
```

`scripts/module-02/02-05-the-three-observable-variants.exercise.md`:
```markdown
---
module: 2
lesson: "2.5"
title: The three Observable variants
exercise: Choose the correct Observable variant for three scenarios and justify each choice.
difficulty: intermediate
---

## Scenario

A real-time dashboard needs three different types of shared data. For each, choose between Standard Observable, ConnectableObservable (`connectable()`), and Subject variants.

## Starter Code

```typescript
import { Observable, Subject, BehaviorSubject, connectable } from 'rxjs';
import { ajax } from 'rxjs/ajax';

// Scenario A: A WebSocket feed of stock prices.
// Multiple dashboard panels subscribe at different times.
// Late-joining panels should see current price immediately.
// The WebSocket should open once and stay open as long as any panel is subscribed.
const stockFeed$: /* ??? */ = /* ??? */;

// Scenario B: A one-time page initialisation.
// Load user config, permissions, and preferences in parallel.
// Start loading only when an explicit .connect() is called after all consumers are registered.
// (Use connectable() here)
const initData$ = /* ??? */;
const connectableInit$ = /* ??? */;

// Scenario C: An event bus for UI actions (button clicks, form submissions).
// Components dispatch events imperatively via .next().
// Other components listen reactively.
// No initial value needed — consumers only care about future events.
const uiActions$: /* ??? */ = /* ??? */;
```

## Task

1. Implement `stockFeed$` using the correct variant. Justify: why not a plain Subject? Why not a standard cold Observable?
2. Implement `connectableInit$` using `connectable()`. Show the line of code that starts execution.
3. Implement `uiActions$` using the correct Subject variant. Justify: why not `BehaviorSubject`? Why not a standard Observable?

## Hint

Standard Observable: cold, one producer per subscriber. ConnectableObservable: controlled start, shared producer. Subject: hot, imperative dispatch. BehaviorSubject: hot, with current value for late subscribers.
```

- [ ] **Step 3: Write Module 3–5 exercises (abbreviated directives — agent writes full content)**

For each file below, write a complete `.exercise.md` using the template. The scenario, starter code, task, and hint must be fully written out — no placeholders.

`03-01-data-and-logic-are-separate.exercise.md`:
Scenario: A function that mixes Observable transformation with `.subscribe()` calls internally. Task: separate the data (Observable) from the logic (returned pipeline) without subscribing inside the function.

`03-02-referential-transparency.exercise.md`:
Scenario: Two Observable definitions — one referentially transparent, one that calls an external API at definition time. Task: identify which violates referential transparency and fix it so the API call is deferred to subscribe time.

`03-03-subscribe-as-the-impure-boundary.exercise.md`:
Scenario: Component code with `.subscribe()` calls scattered in three different methods (constructor, event handler, lifecycle hook). Task: consolidate all subscribe calls into one place at the component boundary using `takeUntil(destroy$)`.

`03-04-tap-vs-map.exercise.md`:
Scenario: A pipeline where logging is done via `map(v => { console.log(v); return v; })`. Task: replace with `tap`, and add a transformation that `map` should handle — making the responsibility of each operator clear.

`03-05-rxjs-as-a-dsl.exercise.md`:
Scenario: A search pipeline written with raw RxJS operators. Task: wrap each operator in a domain-named function so the pipeline reads as business language: `query$.pipe(waitForUserPause(), ignoreRepeatQuery(), searchProducts(), handleSearchError())`.

`04-01-the-three-primitives.exercise.md`:
Scenario: Implement `distinctUntilChanged`, `takeWhile`, and `pairwise` using only `filter`, `map`, and `flatMap` (no importing the actual operators). Task: prove these operators are compositions of the three primitives.

`04-02-scan-building-state.exercise.md`:
Scenario: A todo list where actions are dispatched as an Observable stream (`AddTodo`, `RemoveTodo`, `ToggleTodo`). Task: use `scan` to build a running `Todo[]` state from the action stream without any mutable variables outside the pipe.

`04-03-the-monad-laws.exercise.md`:
Scenario: Verify the three monad laws hold for a custom `of`-based Observable by writing assertions. Task: write code that checks left identity, right identity, and associativity — and explain what would break if any law failed.

`04-04-t-only-operators.exercise.md`:
Scenario: A pipeline for processing form field values that uses `debounceTime(0)` in three places where `distinctUntilChanged` would suffice. Task: identify which `debounceTime(0)` calls can be replaced with T-only operators and explain the performance difference.

`04-05-operator-classification.exercise.md`:
Scenario: Classify 8 operator invocations (including some with custom config) as T-only, T+time, or time-only, and explain how to test each class differently. Task: for each classification, describe the testing strategy (synchronous, marble diagram, or real-time).

`05-01-time-value-pairs.exercise.md`:
Scenario: Two Observables emit `[1, 2, 3]` — one synchronously, one with 1-second delays. Task: use `zip` to combine them and observe that the output timing is controlled by the slower source. Explain what `zip` reveals about the time dimension.

`05-02-lossy-vs-lossless.exercise.md`:
Scenario: A sensor emitting 50 readings/second connected to a chart that renders at 10 frames/second. Task: implement both a lossy strategy (throttle to 10/sec) and a lossless strategy (buffer into 100ms windows), and explain when each is appropriate.

`05-03-throttle-and-debounce.exercise.md`:
Scenario: An autocomplete input and a "Save Draft" button. Task: apply `debounceTime` to the input (explain why) and `throttleTime` with `{ leading: true }` to the save button (explain why debounce would be wrong for the button).

`05-04-buffer-and-window.exercise.md`:
Scenario: A stream of click coordinates that should be grouped into 500ms batches for batch processing. Task: implement with `bufferTime(500)` and with `windowTime(500)` — show that `windowTime` requires subscribing to inner Observables.

`05-05-rate-limiting-decision.exercise.md`:
Scenario: Four UI interactions: (a) scroll position updates, (b) window resize handler, (c) a "Submit Payment" button, (d) an autocomplete search field. Task: choose the correct rate-limiting operator for each and justify the choice using the two-question decision framework from the lesson.

- [ ] **Step 4: Commit Module 1–5 exercises**

```bash
git add scripts/module-01/ scripts/module-02/ scripts/module-03/ scripts/module-04/ scripts/module-05/
git commit -m "feat: add exercise files for Modules 1–5"
```

---

## Task 4 — Enhancement 1: Exercise files, Modules 6–10

Create one `.exercise.md` per lesson for Modules 6–10 (25 files total). Same format as Task 3.

- [ ] **Step 1: Write Module 6 exercises**

`06-01-unicast-vs-multicast.exercise.md`:
Scenario: A `NotificationService` that exposes a cold Observable. Three components subscribe. Task: identify why three independent producers run, then fix it to unicast (one producer, three consumers) without changing the consumer API.

`06-02-subject-as-proxy.exercise.md`:
Scenario: A `ChatService` that exposes its internal `Subject` directly. A rogue component calls `subject.next(fakeMessage)`. Task: refactor the service to expose `asObservable()` and provide a `sendMessage(msg)` method as the only public write path.

`06-03-specialized-subject-variants.exercise.md`:
Scenario: Three requirements: (A) a loading-state flag that new subscribers see immediately, (B) a log of the last 5 events for a debug panel, (C) a single result value needed only after an async operation finishes. Task: match each to `BehaviorSubject`, `ReplaySubject(5)`, and `AsyncSubject`.

`06-04-share-and-sharereplay.exercise.md`:
Scenario: The bug: `shareReplay(1)` without `refCount: true` caches a user profile. After logout and re-login, the new subscriber receives the previous user's profile. Task: diagnose why, fix with `shareReplay({ bufferSize: 1, refCount: true })`, and explain the difference.

`06-05-connectable.exercise.md`:
Scenario: A data export pipeline that must not start until all three downstream processors have registered their subscriptions. Task: implement using `connectable()`, attach three subscribers, then call `connect()` and show that all three receive every emission.

- [ ] **Step 2: Write Module 7 exercises**

`07-01-map-to-observable-problem.exercise.md`:
Scenario: Code that uses `map(id => ajax.getJSON('/api/user/' + id))` and wonders why the result is `Observable<Observable<User>>`. Task: fix it with the correct flattening operator (the scenario implies parallel independent requests — use `mergeMap`).

`07-02-mergemap.exercise.md`:
Scenario: A file upload queue where up to 3 files may upload simultaneously. Task: implement with `mergeMap(uploadFile, 3)` — the concurrency argument. Show what happens with concurrency=1 (serial) and concurrency=Infinity (unlimited) to illustrate why the limit matters.

`07-03-concatmap.exercise.md`:
Scenario: An animation sequence — three animations must play in order, each triggered by the same button. Task: implement with `concatMap` so the second animation only starts after the first completes. Add a warning comment showing what `mergeMap` would do instead.

`07-04-switchmap.exercise.md`:
Scenario: A broken save button implemented with `switchMap` — rapid clicks cancel in-flight saves. Task: (1) reproduce the bug, (2) explain why `switchMap` is wrong for saves, (3) fix with `exhaustMap`, (4) explain when a user would experience the `exhaustMap` behavior as a feature vs. a problem.

`07-05-exhaustmap.exercise.md`:
Scenario: A login button that should prevent double-submit. Task: implement with `exhaustMap` so clicking twice fires only one login request. Compare with `switchMap` (would cancel the first) and `concatMap` (would queue both) to justify the choice.

- [ ] **Step 3: Write Module 8 exercises**

`08-01-temporal-alignment.exercise.md`:
Scenario: Three combining operators applied to the same two sources produce three different outputs. Task: predict the output of `combineLatest([a$, b$])`, `withLatestFrom(b$)` (triggered by `a$`), and `zip([a$, b$])` given specific marble sequences. Verify by running in a `TestScheduler`.

`08-02-combinelatest.exercise.md`:
Scenario: A dashboard with three slow-loading data sources (user, permissions, config). `combineLatest` never emits because one source hasn't loaded yet. Task: fix by adding `startWith(null)` to each source, then filter the combined output to only render when all three are non-null.

`08-03-withlatestfrom.exercise.md`:
Scenario: A "Add to Cart" button click that should capture the current selected product. The product Observable hasn't emitted yet when the first click fires. Task: guard with `startWith(null)` on the product Observable and filter null results, so early clicks are silently dropped rather than crashing.

`08-04-zip-and-forkjoin.exercise.md`:
Scenario: Page initialization needs to load user profile, permissions, and feature flags — three independent HTTP calls. Task: implement with `forkJoin` and add individual `catchError` handlers so one failed call doesn't prevent the other two from completing.

`08-05-merge-concat-race.exercise.md`:
Scenario: A data-fetching strategy that should try the cache first and fall back to the network if the cache is empty. Task: implement using `race([cache$, network$])` where the cache emits immediately if populated, and the network always resolves eventually. Show that the losing Observable is unsubscribed.

- [ ] **Step 4: Write Module 9 exercises**

`09-01-why-observables-terminate-on-error.exercise.md`:
Scenario: Code that calls `observer.error(new Error('oops'))` and then `observer.next(42)` expecting both to arrive. Task: run the code and show the `next(42)` is silently dropped. Explain which part of the RxJS internals enforces this (SafeSubscriber). Rewrite to produce both the error and the value by using two separate Observables.

`09-02-catcherror.exercise.md`:
Scenario: A typeahead search where one failed HTTP request kills the entire search stream. Task: add inner `catchError` inside `switchMap` so a failed search returns `[]` instead of terminating the typeahead Observable.

`09-03-retry.exercise.md`:
Scenario: An HTTP GET for dashboard data with no retry logic — one network hiccup kills the dashboard. Task: add `retry({ count: 3, delay: (_, attempt) => timer(Math.pow(2, attempt) * 1000) })` for exponential backoff, followed by `catchError(() => of([])))` as the final fallback.

`09-04-timeout-and-finalize.exercise.md`:
Scenario: A loading spinner that stays visible if the HTTP request takes longer than 10 seconds or the component is destroyed mid-flight. Task: add `timeout({ each: 10000 })` with `catchError` for timeout handling, and `finalize(() => setLoading(false))` for guaranteed spinner dismissal.

`09-05-error-handling-decision-tree.exercise.md`:
Scenario: Four different errors: (A) network timeout on a GET request, (B) 401 Unauthorized on a POST, (C) malformed JSON response, (D) user rate-limit exceeded with `Retry-After` header. Task: apply the three-strategy decision tree to each — which gets retry, recover, or rethrow? Implement (A) and (D) in code.

- [ ] **Step 5: Write Module 10 exercises**

`10-01-alias-and-wrap-pattern.exercise.md`:
Scenario: A raw pipeline using `switchMap`, `debounceTime(300)`, `distinctUntilChanged`, and `catchError(() => of([]))`. Task: wrap each operator in a domain-named function for a product search context: `searchProducts(api)`, `waitForQueryPause()`, `ignoreRepeatSearch()`, `handleSearchFailure()`. The final pipeline should read as pure domain language.

`10-02-hexagonal-architecture.exercise.md`:
Scenario: A component file that imports `switchMap`, `combineLatest`, `shareReplay`, and `catchError` directly. Task: extract all RxJS logic into a domain facade file. The component after refactoring should have zero RxJS imports — only domain operator imports.

`10-03-with-telemetry.exercise.md`:
Scenario: A `searchOnQuery` operator that needs logging, error tracking, and duration metrics added. Task: implement `withTelemetry` that wraps any `OperatorFunction<T, T>` with `tap` (entry), `tap` (success), `catchError` (error rethrow + log), and `finalize` (duration). Apply it to `searchOnQuery`.

`10-04-testscheduler-and-marbles.exercise.md`:
Scenario: A `debounceTime(300)` pipeline needs a marble test. Task: write a `TestScheduler.run()` block with a hot input marble (`--a--b-----c|`) and assert the debounced output marble. Then add a test for the `timeout({ each: 5000 })` operator.

`10-05-the-four-layer-model-as-architecture.exercise.md`:
Scenario: A broken dashboard with two bugs: (A) values appear in the wrong format, (B) after refreshing the auth token, the dashboard shows stale data. Task: diagnose each bug using the 4-Layer framework — identify the layer, name the operator to inspect, and describe the fix without looking at implementation details first.

- [ ] **Step 6: Commit Module 6–10 exercises**

```bash
git add scripts/module-06/ scripts/module-07/ scripts/module-08/ scripts/module-09/ scripts/module-10/
git commit -m "feat: add exercise files for Modules 6–10"
```

---

## Task 5 — Enhancement 4: Module intro and outro scripts

Create `00-intro.md` and `06-outro.md` for all 10 modules (20 files total).

- [ ] **Step 1: Write Module 1–5 intros and outros**

`scripts/module-01/00-intro.md`:
```markdown
---
module: 1
type: intro
title: Module 1 — The DNA of RxJS
---

## What You Already Know

You know how to handle async JavaScript — callbacks, Promises, event listeners. Each works for its narrow use case but has no common API, no composition story, and no cancellation. This module explains why RxJS exists and where it came from.

## What This Module Covers

- **1.1** From Haskell to LINQ — the 30-year intellectual journey behind the operator library
- **1.2** The Mathematical Dual — how flipping arrows on IEnumerable yields IObservable
- **1.3** Iterator + Observer — the two design patterns RxJS fuses into one
- **1.4** The Unified Type — why Observable subsumes Arrays, Promises, and Events
- **1.5** The 3-Step Workflow — enter RxJS, transform, exit with side effects

## Why It Matters

Every conceptual struggle with RxJS traces back to not knowing what it fundamentally *is*. This module answers that question. Once you see Observable as the mathematical dual of Iterable — not an arbitrary API — the 100+ operators stop feeling like a list to memorize and start feeling like a vocabulary you already know.
```

`scripts/module-01/06-outro.md`:
```markdown
---
module: 1
type: outro
title: Module 1 Recap — The DNA of RxJS
---

## What You Learned

- RxJS operators are not invented — they are ported from LINQ via the IEnumerable/IObservable mathematical duality
- Observable is the push-based dual of Iterable: the producer calls the consumer instead of the consumer pulling from the producer
- RxJS fuses the Iterator pattern (sequence structure) with the Observer pattern (push delivery)
- Observable is the unified type for all async sources — Arrays, Promises, Events, and WebSockets are all special cases
- Every RxJS program has three zones: impure entry, pure transformation, impure exit — side effects belong only in the exit zone

## Bridge to Module 2

You now know *what* an Observable is conceptually. But what exactly happens at the moment you call `.subscribe()`? Does the code in the pipe run immediately? Is the same code run for each subscriber? Module 2 opens the Observable and shows you the mechanics.
```

`scripts/module-02/00-intro.md`:
```markdown
---
module: 2
type: intro
title: Module 2 — The Observable Contract
---

## What You Already Know

From Module 1: Observable is the push-based dual of Iterable, fusing the Iterator and Observer patterns. You know the three-zone workflow and why the operator vocabulary comes from LINQ.

## What This Module Covers

- **2.1** What really happens when you subscribe — each subscribe creates a new producer execution
- **2.2** Cold vs Hot — producer behavior determines whether subscriptions share or isolate
- **2.3** The five subscription phases — Setup, Running, Error, Complete, Teardown
- **2.4** Two graphs every pipeline builds — dependency graph vs subscription graph
- **2.5** The three Observable variants — Standard, Connectable, Subject

## Why It Matters

Most RxJS bugs — duplicate HTTP requests, memory leaks, stale data — come from misunderstanding what `.subscribe()` does and how producers are shared. This module gives you the precise mental model that prevents the entire category.
```

`scripts/module-02/06-outro.md`:
```markdown
---
module: 2
type: outro
title: Module 2 Recap — The Observable Contract
---

## What You Learned

- Each `.subscribe()` call creates a new, independent producer execution — not a listener on a shared stream
- Cold Observables create a fresh producer per subscriber; Hot Observables share one already-running producer
- A Subscription has five phases: Setup, Running, Error, Complete, Teardown — only one Error or Complete ever fires
- Every pipeline builds two graphs: a static dependency graph (value flow) and a dynamic subscription graph (teardown propagation)
- Three Observable variants differ on when the producer starts: Standard (per subscribe), Connectable (on connect()), Subject (already running)

## Bridge to Module 3

You know the mechanics. Now: what does it mean for RxJS code to be *correct*? Module 3 introduces the functional programming principles that separate RxJS code that is safe to refactor from code that looks fine but breaks in subtle ways.
```

`scripts/module-03/00-intro.md`:
```markdown
---
module: 3
type: intro
title: Module 3 — Functional RxJS
---

## What You Already Know

From Modules 1–2: Observable is the mathematical dual of Iterable. Each subscribe creates a new execution. Five lifecycle phases, two graphs, three variants.

## What This Module Covers

- **3.1** Data and Logic are separate — Observable is the data; operators encode the logic
- **3.2** Referential transparency — the Observable as a reusable, side-effect-free blueprint
- **3.3** subscribe() as the single impure boundary — where functional purity ends
- **3.4** tap vs map — declaring side effects without corrupting the pipeline
- **3.5** RxJS as a DSL for time-varying values — operators as a grammar, not a toolbox

## Why It Matters

Functional purity is not an abstract virtue — it is the property that makes RxJS pipelines safe to test, refactor, and compose. This module explains the rules that keep pipelines pure and shows exactly where impurity is permitted.
```

`scripts/module-03/06-outro.md`:
```markdown
---
module: 3
type: outro
title: Module 3 Recap — Functional RxJS
---

## What You Learned

- Observable is the data; operators are the logic — the architecture enforces functional separation automatically
- An Observable is referentially transparent until `.subscribe()` — it is a blueprint, not an execution
- `subscribe()` is the single impure boundary — the only place side effects are permitted
- `tap` declares a side effect that runs at the right time without mutating the emitted value; `map` must be pure
- RxJS is a DSL for time-varying values — like SQL for tables, with operators as the grammar

## Bridge to Module 4

The 4-Layer Model begins here. Layer 1 — Values — is about operators that transform the *value* dimension of a stream: `map`, `filter`, `scan`, and their family. Module 4 shows you how the entire value-transformation landscape is built from three primitives.
```

`scripts/module-04/00-intro.md`:
```markdown
---
module: 4
type: intro
title: Module 4 — Layer 1: Values
---

## What You Already Know

From Module 3: the pure transformation zone, referential transparency, tap vs map, RxJS as a DSL.

## What This Module Covers

- **4.1** The three primitives — map, filter, flatMap derive all value operators
- **4.2** scan — accumulating state from a stream without mutable variables
- **4.3** The monad laws — why Observable composition is always safe
- **4.4** T-only operators — the purely value-based, scheduler-free family
- **4.5** Operator classification — T-only vs T+time vs time-only

## Why It Matters

Layer 1 operators are the cheapest and most composable in the entire framework. Knowing which operators are T-only tells you: no timers, no schedulers, no buffers — testable synchronously, safe to use anywhere.
```

`scripts/module-04/06-outro.md`:
```markdown
---
module: 4
type: outro
title: Module 4 Recap — Layer 1: Values
---

## What You Learned

- `map`, `filter`, and `flatMap` are the three primitives — every other value operator is a composition of these
- `scan` is the stream equivalent of `reduce` but emits every intermediate accumulation — the natural reactive state primitive
- Observable obeys the monad laws, guaranteeing that operator chains compose correctly regardless of nesting order
- T-only operators are purely value-based — synchronous, scheduler-free, and independently testable
- Classifying an operator as T-only, T+time, or time-only tells you its cost, testability, and which diagnostic layer to inspect

## Bridge to Module 5

You can now operate on the *value* dimension of a stream. But Observable carries a second dimension — time. The same value emitted at t=0 vs t=1000ms is a fundamentally different signal. Module 5 adds the temporal layer.
```

`scripts/module-05/00-intro.md`:
```markdown
---
module: 5
type: intro
title: Module 5 — Layer 2: Time
---

## What You Already Know

From Module 4: the three value primitives, scan for state, monad laws, T-only operator classification.

## What This Module Covers

- **5.1** Observables as (time, value) pairs — the temporal dimension is always present
- **5.2** Lossy vs lossless — the binary choice behind every time operator
- **5.3** The throttle and debounce families — leading/trailing/silence-based rate limiting
- **5.4** The buffer and window families — collecting values without losing them
- **5.5** Choosing the right rate-limiting operator — the two-question decision framework

## Why It Matters

Time is what makes streams fundamentally different from arrays. Layer 2 operators exist because the *when* of a value is as important as the *what*. Get the temporal operator wrong and you ship a broken interaction — the button that never fires, the search that feels frozen.
```

`scripts/module-05/06-outro.md`:
```markdown
---
module: 5
type: outro
title: Module 5 Recap — Layer 2: Time
---

## What You Learned

- An Observable is a sequence of `(time, value)` pairs — time is always a dimension, even when ignored
- Every time operator makes one binary choice: drop values (lossy) or group values (lossless)
- `throttle` gives immediate response then blocks; `debounce` waits for silence then emits — confusing them ships visibly broken UIs
- `buffer` and `window` collect all values into arrays or inner Observables — lossless alternatives when every value matters
- The two-question decision framework: can data be lost? do I need leading, trailing, or periodic behavior?

## Bridge to Module 6

Layers 1 and 2 operate on a single stream. Layer 3 — Sharing — asks: what happens when multiple consumers need the same stream? One producer or many? Module 6 answers this with the unicast/multicast model.
```

- [ ] **Step 2: Write Module 6–10 intros and outros**

`scripts/module-06/00-intro.md`:
Module 6 — Layer 3: Sharing. Prior knowledge: Layers 1–2, cold/hot distinction from Module 2. Covers: unicast vs multicast axes, Subject as proxy, three Subject variants, share/shareReplay mechanics, connectable for manual control. Why it matters: most data-sharing bugs (duplicate requests, stale caches, missed events for late subscribers) are Layer 3 problems.

`scripts/module-06/06-outro.md`:
Recap: hot/cold is about the producer; unicast/multicast is about the consumer. Subject is Observer + Observable. BehaviorSubject = current value; ReplaySubject = history; AsyncSubject = final value. shareReplay(1) without refCount leaks. connectable() exposes lifecycle control. Bridge: Layer 3 shares one producer's output. Layer 4 — Flattening — handles when each emission IS a new producer. Module 7.

`scripts/module-07/00-intro.md`:
Module 7 — Layer 4: Flattening. Prior knowledge: flatMap from Module 4, all three prior layers. Covers: the Observable<Observable<T>> problem, mergeMap (parallel), concatMap (serial), switchMap (cancel-on-new), exhaustMap (ignore-while-busy). Why it matters: every async operation triggered by user input is a Layer 4 problem. Choose wrong and you ship race conditions, data loss, or double-submits.

`scripts/module-07/06-outro.md`:
Recap: flattening exists because map to an async operation produces Observable<Observable<T>>. Four operators, four concurrency policies: parallel/unbounded, serial/ordered, cancel-on-new, ignore-while-busy. switchMap for search; exhaustMap for buttons; concatMap for animations; mergeMap for independent parallel work. Bridge: Layers 1–4 operate on individual streams. Module 8 — Combining Streams — shows how multiple independent streams are temporally aligned.

`scripts/module-08/00-intro.md`:
Module 8 — Combining Streams. Prior knowledge: all four layers. Covers: temporal alignment question, combineLatest (reactive derived state), withLatestFrom (actions with context), zip/forkJoin (positional/parallel), merge/concat/race (timing combiners). Why it matters: real apps have multiple data sources that must be combined correctly — the combining operator determines when output fires and which values are used.

`scripts/module-08/06-outro.md`:
Recap: every combining operator answers two questions — when to emit, which values to use. combineLatest = emit on any, use all latest. withLatestFrom = emit on primary only, sample secondaries. zip = pair by position. forkJoin = wait for all completions. merge/concat/race = timing, not value combination. Bridge: streams work correctly until they fail. Module 9 — Error Handling — covers what happens when the Observable contract is broken.

`scripts/module-09/00-intro.md`:
Module 9 — Error Handling & Resilience. Prior knowledge: the Observable contract (Module 2), five subscription phases, finalize. Covers: why error terminates permanently, catchError recovery strategies, retry and the resilience ladder, timeout/finalize for lifecycle, the three-strategy decision tree. Why it matters: production code fails. The question is whether failure kills the stream permanently or triggers a recovery that keeps the user experience intact.

`scripts/module-09/06-outro.md`:
Recap: error is terminal — the Observable contract requires it. catchError returns a replacement, not a resumption. retry resubscribes from scratch — safe for idempotent reads, dangerous for writes. timeout detects frozen streams; finalize cleans up on any termination. Three strategies: recover, retry, rethrow. Bridge: you can now build resilient individual streams. Module 10 — Domain Facades — shows how to compose these patterns into production architecture.

`scripts/module-10/00-intro.md`:
Module 10 — Domain Facades, Testing & Architecture. Prior knowledge: all 9 prior modules. Covers: Alias+Wrap pattern, hexagonal architecture with RxJS, withTelemetry (AOP), TestScheduler/marble diagrams, the 4-Layer Model as a complete diagnostic framework. Why it matters: this module turns operator knowledge into architecture. The patterns here make reactive codebases readable, testable, and maintainable by teams, not just the original author.

`scripts/module-10/06-outro.md`:
Recap: Alias+Wrap gives operators domain names with test seams. Hexagonal architecture puts RxJS inside domain operators, keeping components pure. withTelemetry adds cross-cutting concerns without modifying operator logic. TestScheduler makes time-based tests deterministic. The 4-Layer Model is a diagnostic compass: wrong value → Layer 1, wrong time → Layer 2, wrong sharing → Layer 3, wrong concurrency → Layer 4. Final note: you now have a complete framework for understanding, designing, debugging, and testing reactive systems.

- [ ] **Step 3: Commit intro/outro scripts**

```bash
git add scripts/
git commit -m "feat: add module intro and outro scripts for all 10 modules"
```

---

## Task 6 — Enhancement 3: Marble diagram files

Create 12 marble diagram files in `diagrams/`. Each file contains an ASCII marble diagram with a brief explanation, followed by a concrete TypeScript snippet showing the operator in action.

- [ ] **Step 1: Create diagrams directory and write core flattening diagrams**

`diagrams/switchmap.md`:
```markdown
# switchMap — cancel on new

```ascii
outer$:   --a---------b----c---------|
           switchMap(x => inner$(x))

inner$(a): ----A1--A2--A3
inner$(b):           ----B1--B2--B3
inner$(c):                ----C1--C2--|

output$:  ----A1--A2--X----B1--X----C1--C2--|
```
X = cancelled (inner unsubscribed when next outer arrives)

**Read it:** When `b` arrives, `inner$(a)` is unsubscribed — A3 never emits. When `c` arrives, `inner$(b)` is unsubscribed — B2, B3 never emit. Only the inner Observable started by the *most recent* outer value runs to completion.

**Use when:** the latest outer value makes previous inner results irrelevant — typeahead search, live profile loading, navigation route changes.
```

`diagrams/exhaustmap.md`: Show outer emissions while an inner is running being silently dropped. Use button clicks as the scenario.

`diagrams/concatmap.md`: Show inner Observables queuing — second inner doesn't start until first completes. Show the queue growing.

`diagrams/mergemap.md`: Show all inner Observables running simultaneously. Show the output interleaving.

`diagrams/debounce-vs-throttle.md`: Side-by-side comparison: same input stream, different output. debounce = emit only after silence. throttle = emit at leading edge, block for duration.

`diagrams/combinelatest.md`: Show multiple sources; output fires whenever any source emits, always using the latest from all.

`diagrams/withlatestfrom.md`: Show primary source triggering output; secondary source only sampled, never triggers.

`diagrams/zip-vs-forkjoin.md`: Side-by-side: zip emits progressively by index position; forkJoin waits for all to complete.

`diagrams/merge-concat-race.md`: Three-way comparison: merge = interleave all; concat = sequential subscription; race = first wins, rest unsubscribed.

`diagrams/cold-vs-hot.md`: Two subscribes to a cold Observable — two independent producer timelines. Two subscribes to a hot Observable — single timeline, late subscriber misses early values.

`diagrams/share-vs-sharereplay.md`: Three subscribes at different times: share = late subscriber gets nothing from before subscribe. shareReplay(1) = late subscriber gets the buffered last value.

`diagrams/buffer-vs-window.md`: Same input; buffer emits `T[]` arrays; window emits `Observable<T>` — subscriber must subscribe to each inner.

- [ ] **Step 2: Commit marble diagrams**

```bash
git add diagrams/
git commit -m "feat: add marble diagram files for 12 key operator comparisons"
```

---

## Task 7 — Enhancement 2: Companion project scaffold

Create a Vite/TypeScript app in `companion/` that implements a search UI evolving through all 10 module milestones.

- [ ] **Step 1: Create project files**

`companion/package.json`:
```json
{
	"name": "rxjs-course-companion",
	"version": "1.0.0",
	"type": "module",
	"scripts": {
		"dev": "vite",
		"build": "tsc && vite build",
		"preview": "vite preview"
	},
	"dependencies": {
		"rxjs": "^7.8.0"
	},
	"devDependencies": {
		"typescript": "^5.0.0",
		"vite": "^5.0.0"
	}
}
```

`companion/tsconfig.json`:
```json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "ESNext",
		"moduleResolution": "bundler",
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"lib": ["ES2022", "DOM"]
	},
	"include": ["src"]
}
```

`companion/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
	root: '.',
	build: { outDir: 'dist' },
});
```

`companion/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<title>RxJS Course Companion</title>
	<style>
		body { font-family: monospace; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
		#search { width: 100%; padding: 0.5rem; font-size: 1rem; }
		#status { color: #666; font-size: 0.85rem; margin: 0.5rem 0; }
		#results { list-style: none; padding: 0; }
		#results li { padding: 0.4rem 0; border-bottom: 1px solid #eee; }
		#error { color: red; }
	</style>
</head>
<body>
	<h1>RxJS Search</h1>
	<input id="search" type="text" placeholder="Search..." autocomplete="off" />
	<div id="status"></div>
	<div id="error"></div>
	<ul id="results"></ul>
	<script type="module" src="/src/main.ts"></script>
</body>
</html>
```

`companion/src/types.ts`:
```typescript
export interface SearchResult {
	id: number;
	title: string;
	category: string;
}

export interface AppState {
	query: string;
	results: SearchResult[];
	loading: boolean;
	error: string | null;
}

export type Action =
	| { type: 'QUERY_CHANGED'; query: string }
	| { type: 'SEARCH_STARTED' }
	| { type: 'SEARCH_SUCCESS'; results: SearchResult[] }
	| { type: 'SEARCH_ERROR'; error: string }
	| { type: 'SEARCH_CLEARED' };
```

`companion/src/ui.ts`:
```typescript
import type { AppState } from './types';

const searchInput = document.getElementById('search') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLDivElement;
const errorEl = document.getElementById('error') as HTMLDivElement;
const resultsEl = document.getElementById('results') as HTMLUListElement;

export function getSearchInput(): HTMLInputElement {
	return searchInput;
}

export function render(state: AppState): void {
	statusEl.textContent = state.loading ? 'Searching…' : '';
	errorEl.textContent = state.error ?? '';
	resultsEl.innerHTML = state.results
		.map(r => `<li><strong>${r.title}</strong> <em>(${r.category})</em></li>`)
		.join('');
}
```

`companion/src/state.ts`:
```typescript
import { BehaviorSubject, Subject } from 'rxjs';
import { scan, startWith, shareReplay } from 'rxjs/operators';
import type { Action, AppState } from './types';

const initialState: AppState = {
	query: '',
	results: [],
	loading: false,
	error: null,
};

function reducer(state: AppState, action: Action): AppState {
	switch (action.type) {
		case 'QUERY_CHANGED':  return { ...state, query: action.query };
		case 'SEARCH_STARTED': return { ...state, loading: true, error: null };
		case 'SEARCH_SUCCESS': return { ...state, loading: false, results: action.results };
		case 'SEARCH_ERROR':   return { ...state, loading: false, error: action.error };
		case 'SEARCH_CLEARED': return { ...state, results: [], loading: false };
		default: return state;
	}
}

export const action$ = new Subject<Action>();

export const state$ = action$.pipe(
	scan(reducer, initialState),
	startWith(initialState),
	shareReplay({ bufferSize: 1, refCount: true }),
);
```

`companion/src/operators/search-on-query.ts`:
```typescript
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import type { SearchResult } from '../types';

// Simulated API — replace with real fetch in a production app
function mockSearch(query: string): Observable<SearchResult[]> {
	if (!query.trim()) return of([]);
	return new Observable<SearchResult[]>(subscriber => {
		const timer = setTimeout(() => {
			const results: SearchResult[] = [
				{ id: 1, title: `${query} result 1`, category: 'docs' },
				{ id: 2, title: `${query} result 2`, category: 'api' },
			];
			subscriber.next(results);
			subscriber.complete();
		}, 400);
		return () => clearTimeout(timer);
	});
}

export function searchOnQuery(
	apiFn: (query: string) => Observable<SearchResult[]> = mockSearch,
) {
	return (source$: Observable<string>): Observable<SearchResult[]> =>
		source$.pipe(
			switchMap(query =>
				apiFn(query).pipe(catchError(() => of([] as SearchResult[]))),
			),
		);
}
```

`companion/src/app.ts`:
```typescript
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { action$, state$ } from './state';
import { searchOnQuery } from './operators/search-on-query';
import { getSearchInput, render } from './ui';
import type { Action } from './types';

const input = getSearchInput();

// Layer 1+2: value transformation + time-based rate limiting
const query$ = fromEvent<Event>(input, 'input').pipe(
	map(e => (e.target as HTMLInputElement).value.trim()),
	debounceTime(300),
	distinctUntilChanged(),
);

// Layer 4: flatten search requests with cancel-on-new semantics
query$.pipe(
	tap(query => {
		const a: Action = query
			? { type: 'SEARCH_STARTED' }
			: { type: 'SEARCH_CLEARED' };
		action$.next(a);
	}),
	searchOnQuery(),
).subscribe(results => action$.next({ type: 'SEARCH_SUCCESS', results }));

// Layer 3: shared state drives the UI
state$.subscribe(render);
```

`companion/src/main.ts`:
```typescript
import './app';
```

- [ ] **Step 2: Write milestone documentation files**

`companion/milestones/module-01.md`: What the app demonstrates at Module 1 — creation operators, the three-zone workflow, why `fromEvent` is the entry point. What is not yet in the app and why.

`companion/milestones/module-02.md`: What subscribe creates; the cold Observable that becomes hot via shareReplay in state$; the five phases visible in the mock API Observable's teardown (clearTimeout).

`companion/milestones/module-03.md`: The pure transformation zone in app.ts; side effects exclusively in tap and subscribe; state.ts as the referentially transparent data layer.

`companion/milestones/module-04.md`: scan as the state primitive in state.ts; the reducer as a pure T-only function; map and filter in the query pipeline.

`companion/milestones/module-05.md`: debounceTime(300) for the query pause; distinctUntilChanged to prevent duplicate searches; the lossy/lossless choice made explicit.

`companion/milestones/module-06.md`: shareReplay on state$ for shared derived state; action$ as a Subject (hot, imperative dispatch); BehaviorSubject alternative explained.

`companion/milestones/module-07.md`: switchMap in searchOnQuery for cancel-on-new; why exhaustMap would be wrong for search; inner catchError preventing outer stream termination.

`companion/milestones/module-08.md`: How to extend the app with combineLatest for derived state (e.g., a "results count" derived from state.results.length and state.loading); withLatestFrom for an "export results" button that samples current results.

`companion/milestones/module-09.md`: catchError inside switchMap already present; where to add retry for network resilience; finalize for loading spinner cleanup; timeout for stalled requests.

`companion/milestones/module-10.md`: searchOnQuery as the Alias+Wrap pattern in action; how to add withTelemetry to searchOnQuery; the hexagonal boundary (app.ts has zero RxJS operator imports); how to add a TestScheduler test for the debounce pipeline.

- [ ] **Step 3: Commit companion project**

```bash
git add companion/
git commit -m "feat: add companion Vite/TypeScript project with 10-module milestone docs"
```

---

## Self-Review Checklist

- [ ] All 50 scripts have `related:` frontmatter — Task 1 coverage
- [ ] All 50 scripts have `## Pitfall` section — Task 2 coverage
- [ ] 50 exercise files exist, one per lesson — Tasks 3–4 coverage
- [ ] 20 intro/outro files exist, two per module — Task 5 coverage
- [ ] 12 marble diagram files exist in `diagrams/` — Task 6 coverage
- [ ] Companion project builds (`npm run build` in `companion/`) — Task 7 coverage
- [ ] No exercise file contains placeholder text ("???", "TBD", "fill in")
- [ ] All TypeScript in companion project compiles with `strict: true`
- [ ] Each pitfall is specific to its lesson's key insight — no generic "don't make mistakes" text
