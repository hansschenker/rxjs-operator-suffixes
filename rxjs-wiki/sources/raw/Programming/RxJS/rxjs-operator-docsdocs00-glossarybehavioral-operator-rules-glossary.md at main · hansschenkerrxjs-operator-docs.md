---
title: rxjs-operator-docs/docs/00-glossary/behavioral-operator-rules-glossary.md at main · hansschenker/rxjs-operator-docs
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 17 2025 12:09:46 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 17 2025 12:10:08 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Behavioral Operator Rules and Suffix Family Rule
- The document discusses the global vocabulary of RxJS operators, specifically focusing on the Behavioral Operator Rules Glossary, which aims to make the input "type-shape" explicit in user-friendly terms, including BehaviorShape.SimpleValues and BehaviorShape.NestedObservables.
- The Suffix Family Rule is introduced, which includes the Shape-Driven Flatten Suffix Rule, stating that if the shape is NestedObservables, the user should choose the "All" suffix, such as [[mergeAll]], concatAll, switchAll, or exhaustAll, and if the shape is SimpleValues, the user should choose the "Map" suffix, such as mergeMap, concatMap, switchMap, or exhaustMap.
- The Accumulation Extension is discussed, including the AsyncScan Specialization Rule, which states that if the reducer returns plain state, the user should use the scan operator, and if the reducer returns observable state, the user should choose a flatten policy, such as [[mergeScan]] for allowing overlap or switchScan for latest-only.
- The document also explains various conceptual policy names, including mapInstantly, mapQueue, mapLatest, and mapFirst, which correspond to specific RxJS operators, such as mergeMap, concatMap, switchMap, and exhaustMap, and defines the algebra law XMap(f) ≡ map(f) |> XAll() for X ∈ { merge, concat, switch, exhaust }.

## Accumulation Extension and AsyncScan Specialization
- Additionally, the document covers various other topics, including the meaning and precision notes for different operators, such as merge, concat, switch, exhaust, race, combineLatest, withLatestFrom, and zip, which are used for interleave outputs, transform into async work, build a queue, cancel previous work, and keep a running state.
- The document provides a comprehensive overview of the RxJS operator families, including the corresponding ShapeTags, and aims to unify many concepts and provide a mental model for understanding the operators, with a focus on precision and accuracy in the underlying typing and operator usage.
- The document discusses various behavioral operator rules in RxJS, including keeping state with async state steps, where the state evolution returns an Observable of the next state, and choosing a policy for overlapping state transitions, such as allowing overlap with [[mergeScan]] or giving priority to the latest value with `switchScan`.

## Conceptual Policy Names and Algebra Law
- The governing behavior is AsyncScan, with merge and switch being specializations, and there are additional governing families that expand the meaning of the first part of an operator name beyond basic behavior and policy, including selecting a subset of values based on count, position, or stopping rules, such as `take`, `takeLast`, [[SKIP | skip]], `skipLast`, `elementAt`, `takeWhile`, `skipWhile`, `takeUntil`, `skipUntil`, `first`, `last`, and `single`.
- The document also covers keeping or discarding values by a rule, such as using predicates with `filter`, uniqueness rules with `distinct`, `distinctUntilChanged`, and `distinctUntilKeyChanged`, or discarding everything with `ignoreElements`, and notes that the governing logic is keep/drop, not transformation, with a shape of SimpleValues in/out.
- Grouping values into containers is another topic, where values are collected into buffers or windows according to a boundary rule, using operators such as `bufferCount`, `bufferTime`, `bufferWhen`, `bufferToggle`, `windowCount`, `windowTime`, `windowWhen`, `windowToggle`, and `toArray`, with buffers emitting arrays and windows emitting nested observables.

## Core Operators and Their Uses
- Controlling timing and rate is also discussed, where time governs when values are allowed through, using operators such as `debounceTime`, `throttleTime`, `auditTime`, `sampleTime`, `delay`, `delayWhen`, `timeout`, and `timeoutWith`, which typically preserve the value type but impose a time policy on emission.
- The document covers recovering from failure, where the operator defines how to continue or retry after an error, using `catchError`, `retry`, `retryWhen`, `repeat`, and `repeatWhen`, and notes that these are control-flow governors that may be modeled explicitly as Result values instead.
- Choosing the execution context is another topic, where the operator binds the scheduling of subscription or notifications, using `subscribeOn` and `observeOn`, which do not change values but change when/where the work runs.

## Operator Families Overview
- Sharing work and caching values is also discussed, where the operator defines the subscription topology and caching for multiple subscribers, using `share` and `shareReplay`, which governs hot/cold behavior and caching semantics, crucial for performance and correctness.
- Inspecting and reacting to the lifecycle is another topic, where the operator observes values or lifecycle without changing the main value shape, using `tap` and `finalize`, which are instrumentation/lifecycle hooks that should keep side effects at the subscribe boundary in production code unless intentionally logging/telemetry.
- Finally, the document mentions join phrases, where the name begins with a join concept rather than a pure verb, such as symmetric snapshot join with `combineLatestWith`, asymmetric sampling join with `withLatestFrom`, and pairing join with `zipWith`, which encode the governing join relationship.

## Flattening/Joining and Selection Families
- The RxJS Operator Handbook provides a comprehensive guide to understanding the different types of operators available in RxJS, including behavioral operator rules, decision maps, and various operator families such as Transform, Flatten/Join, Select, Time, Error, Share, Schedule, Collect, and Inspect.
- The handbook categorizes operators into several families, including Flattening and Joining, Selection, State, Timing, Collection/Windowing, Error Handling, Sharing and Caching, Scheduling, and Inspection and Lifecycle, each with its own set of rules and operators.
- The Flattening and Joining family includes operators such as merge, switch, concat, exhaust, and race, which are used to combine multiple observables into a single observable, while the Selection family includes operators such as take, [[SKIP | skip]], first, last, and single, which are used to select a subset of values from an observable.

## State, Timing, Collection/Windowing Families
- The State family includes operators such as scan, [[mergeScan]], and switchScan, which are used to keep a running state or accumulate values over time, and the Timing family includes operators such as debounce, throttle, audit, and sample, which are used to control the timing of observable emissions.
- The Collection/Windowing family includes operators such as buffer, window, and toArray, which are used to collect values into arrays or windows, while the Error Handling family includes operators such as catchError, retry, and repeat, which are used to handle errors in observables.
- The Sharing and Caching family includes operators such as share and shareReplay, which are used to share observables among multiple subscribers, and the Scheduling family includes operators such as subscribeOn and observeOn, which are used to control the scheduling of observable emissions.

## Error Handling, Sharing, Scheduling, Inspection
- The Inspection and Lifecycle family includes operators such as tap and finalize, which are used to inspect or react to the lifecycle of observables, and the handbook provides a decision map to help choose the correct operator for a given use case.
- The handbook also provides a glossary of terms, including ShapeTag vocabulary, core algebra rules, and mental models, to help understand the underlying concepts and principles of RxJS operators.
- The Selection operators are almost always applied to simple values, and they can be completion-sensitive, meaning they may need the source to complete to decide what to emit, and the handbook provides a flowchart to help choose the correct Selection operator based on the rule type and use case.

## Selection Operators Overview
- The handbook provides a comprehensive overview of the different operator families and their corresponding operators, and it provides a decision map and flowchart to help choose the correct operator for a given use case, making it a valuable resource for developers working with RxJS.
- The `take` operator is a behavioral operator that selects a subset of values from a source, keeping the first N values, and is governed by the tag "Select a subset — keep first N".
- The `take` operator subscribes to the source when downstream subscribes, emits the first count values from the source, maintains a counter of how many values have been emitted, completes immediately after emitting count values or when the source completes if fewer were emitted, and unsubscribes from the source after count values are emitted.

## takeUntil Operator Details
- The `takeUntil` operator is a behavioral operator that selects a subset of values from a source, keeping values until a notifier emits its first value, and is governed by the tag "Select a subset — keep until notifier".
- The `takeUntil` operator subscribes to the source and the notifier when downstream subscribes, mirrors source values until the notifier emits its first value, tracks whether the stop signal has occurred, completes as soon as the notifier emits or when the source completes first, and unsubscribes from both source and notifier on completion.
- The `takeWhile` operator is a behavioral operator that selects a subset of values from a source, keeping values while a predicate holds, and is governed by the tag "Select a subset — keep while predicate holds".

## takeWhile Operator and Decision Tree
- The `takeWhile` operator subscribes to the source when downstream subscribes, emits values while the predicate is true, tracks whether the predicate has failed, completes immediately when the first value fails the predicate or when the source completes, and unsubscribes from the source when completing early due to predicate failure.
- Use cases for these operators include taking the first N values from a source, running a stream until a component is destroyed, stopping polling when a stop signal arrives, collecting events until a timer fires, and keeping values while a certain condition is met.
- The decision tree for choosing the correct operator involves determining the intent to keep or [[SKIP | skip]] values, the rule type (count, notifier, or predicate), and the specific operator to use (take, takeUntil, or takeWhile).

## takeWhile, skipWhile, skip Operators
- The document discusses various behavioral operator rules in RxJS, including the `takeWhile`, `skipWhile`, `skip`, `skipLast`, `skipUntil`, and `takeUntil` operators, which are used to select a subset of values from an observable sequence.
- The `takeWhile` operator completes as soon as the predicate fails, and is used in scenarios such as reading values until a sentinel appears, keeping events while a feature flag is true, and stopping when a threshold is crossed.
- The `skip` operator ignores the first count values and then emits all subsequent values, and is used in scenarios such as ignoring initial warm-up values, skipping a header prefix in a stream, and dropping the first emission that is a default seed.

## skipUntil Operator and Decision Tree
- The `skipUntil` operator suppresses source values until a notifier emits its first value, and then mirrors the source, and is used in scenarios such as ignoring events until initialization finishes, suppressing input until a user logs in, and starting processing only after a timer fires.
- The document also provides a decision tree to help choose the correct operator based on the use case, including selecting intent, predicate rule, and notifier rule.
- The `skipWhile` operator is used to [[SKIP | skip]] values while a predicate is true, and the `takeUntil` operator is used to take values until a notifier emits a value.

## skipWhile and takeUntil Combinations
- The operators can be used in various combinations to achieve complex selection logic, and the document provides examples and flowcharts to illustrate their usage.
- The document also notes that `skipUntil` is the canonical "gate opens on signal" selector, and provides guidance on when to use each operator based on the specific requirements of the use case.
- The `first` operator is a behavioral operator that selects a subset of values from the source, specifically the first match, and it can be used with or without a predicate to filter the values.

## first Operator Details
- The `first` operator has several use cases, including getting the first click event and stopping, getting the first matching item and erroring if none is found, and getting the first matching item with a default value if none is found, and it is strict on empty sources unless a default value is supplied.
- The `last` operator is another behavioral operator that selects a subset of values from the source, specifically the last match, and it can be used with or without a predicate to filter the values, and it waits for the source to complete before emitting the stored last match.
- The `last` operator has several use cases, including getting the final emitted value when the stream completes, getting the last matching value, and getting the last matching value or a default value, and it cannot emit until the source completes.

## last Operator Details
- The `elementAt` operator is a behavioral operator that selects a subset of values from the source based on a specified zero-based index, and it emits the value at the specified index, completes immediately after emitting the indexed value, and unsubscribes after emitting the indexed value.
- The `first`, `last`, and `elementAt` operators all have error handling mechanisms, including erroring if no matching element is found and no default value is provided, and erroring if the source errors, and they can be used in various scenarios to select specific values from the source.
- The operators can be used with a decision tree to determine which operator to use based on the specific use case, and the `first` and `last` operators can be used with a predicate to filter the values, while the `elementAt` operator uses an index to select the value.

## elementAt and Alternatives
- The `take(1)` operator can be used as an alternative to `first()` if you do not want an error on empty sources, and the `last()` operator cannot be used to get the first match, as it waits for the source to complete before emitting the stored last match.
- The provided text discusses various behavioral operator rules in RxJS, including the `elementAt`, `single`, and `takeLast` operators, which are used to select a subset of values from a stream based on specific rules and conditions.
- The `elementAt` operator is used to pick a value at a specific index, and it errors when out of range unless a default value is supplied, as seen in the example `elementAt(2)` or `elementAt(2, defaultValue)`.

## single and takeLast Operators
- The `single` operator is used to assert that exactly one item exists in a stream, and it errors if no matching value exists or if more than one matching value exists, with use cases including asserting exactly one item exists in a stream, asserting exactly one match exists, and guarding against duplicates.
- The `takeLast` operator is used to keep the last N values of a stream, and it emits these values only after the source completes, with use cases including keeping the last N log lines after completion, emitting the tail of a finite stream, and post-processing batch results at the end.
- The `skipLast` operator is used to [[SKIP | skip]] the last N values of a stream, and it emits values as soon as it can while ensuring the last count values are not emitted, with a governing tag of "Select a subset — skip last N" and edge tags including "Shape.SimpleValues", "Rule.Count", "Skip.LastN", and "Completion.Sensitive".

## skipLast and skipWhile Operators
- The decision trees and flowcharts provided in the text help to illustrate the different use cases and operator choices, such as the "Use Case Explorer and Specialization Decision Tree" for `elementAt` and `single`, and the "Count keep" decision tree for `take` and `takeLast`.
- Each operator has its own set of rules and behaviors, such as subscribing to the source when downstream subscribes, emitting values based on specific conditions, tracking state, and handling completion and cancellation, as outlined in the "TagSpec" sections for each operator.
- The document discusses various behavioral operator rules in RxJS, including the `skipLast` and `skipWhile` operators, which are used to skip a specified number of values from the end of a stream or skip values while a predicate is true, respectively.

## mergeAll Operator and Behavior
- The `skipLast` operator buffers up to a specified count of values to determine what must be dropped at the end, completes when the source completes after dropping buffered tail values, and unsubscribes if the downstream unsubscribes, while also erroring if the source errors.
- The `skipWhile` operator subscribes to the source when the downstream subscribes, suppresses values while the predicate is true, and emits values once the predicate returns false, tracking whether the predicate has failed at least once and completing when the source completes.
- Both operators have specific use cases, such as dropping a known footer suffix, ignoring trailing sentinel values, removing last N noisy events, ignoring leading defaults, dropping values until a threshold is reached, and skipping a warm-up phase of a metrics stream.

## Decision Trees and Tags
- The document also mentions the [[mergeAll]] operator, which subscribes to each inner observable as it is emitted by the outer stream, forwards values from all active inner observables, and completes when the outer completes and all active inners complete.
- The operators are governed by specific tags, such as `Select a subset — [skip](edb7a352-bab8-4a9e-8cfb-d25433981a7a) while predicate holds` for `skipWhile` and `Flatten.merge` for `mergeAll`, and have specific edge tags, such as `Rule.Predicate` and `Shape.NestedObservables`.
- The document provides a decision tree for choosing the correct operator based on the use case, with nodes such as `q_count` and `q_pred` representing the choice between skipping first N or last N values, or keeping while or skipping while a predicate is true.

## Use Case Explorer and Decision Tree
- The operators have specific leaf notes, such as `skipLast` needing a buffer of size N, which can delay emissions by up to N items, and `skipWhile` gating the stream open permanently once the predicate first fails.
- The Use Case Explorer and Specialization Decision Tree is a tool used to determine the appropriate operator to use in a given scenario, with options including [[mergeAll]], mergeMap, concatAll, switchAll, exhaustAll, concatMap, switchMap, and exhaustMap.
- When dealing with a stream that emits simple values, the decision tree asks if an inner observable is created per value, and if so, it prompts the user to choose a flatten policy for the projected inners, with options including mergeMap, concatMap, switchMap, and exhaustMap.

## Flatten Policies: mergeAll and mergeMap
- The mergeAll operator is best used when concurrency is desired and ordering across inners is not required, and it subscribes to projected inners and forwards their values concurrently, completing when the source completes and all active inners complete.
- The mergeMap operator is used when overlapping inner work is acceptable or desired, and it projects each source value to an observable, subscribes to the projected inners, and forwards their values concurrently, completing when the source completes and all active inners complete.
- The concatAll operator is used when sequential inner execution is needed, and it subscribes to the projected inners one after another, completing when the source completes and all active inners complete.

## Flatten Policies: switchAll and switchMap
- The switchAll operator is used when only the latest inner observable is of interest, and it subscribes to the outer stream, forwards values from the currently active inner, and cancels the previous inner subscription on each new inner.
- The switchMap operator is used when only the latest request is kept, and it projects each source value to an observable, subscribes to the projected inner, and forwards its values, completing when the source completes and the active inner completes.
- The concatMap operator is used when requests need to be run strictly one after another, and it projects each source value to an observable, subscribes to the projected inners one after another, and forwards their values, completing when the source completes and all active inners complete.

## Flatten Policies: concatMap and exhaustMap
- The exhaustMap operator is used when inner observables should be ignored while the previous one is still busy, and it projects each source value to an observable, subscribes to the projected inner, and forwards its values, completing when the source completes and the active inner completes.
- The Use Case Explorer and Specialization Decision Tree is a tool used to determine the appropriate operator to use in a given scenario, with options including switchAll, [[mergeAll]], concatAll, and exhaustAll for handling nested observables, and switchMap, mergeMap, concatMap, and exhaustMap for handling simple values.
- When dealing with nested observables, the choice of operator depends on the policy intent, with switchAll used when only the latest request should be active, mergeAll used when all requests should run, concatAll used when requests should be queued, and exhaustAll used when requests should be ignored while a previous request is still active.

## Use Case Explorer for Nested Observables
- For simple values, the choice of operator also depends on the policy intent, with switchMap used when only the latest request should complete, mergeMap used when all requests should finish, concatMap used when requests should be executed one after another, and exhaustMap used when user actions should be ignored while a request is running.
- The switchAll operator is used to choose when stale inner streams must be cancelled in favor of the latest, and it subscribes to the source when the downstream subscribes, emitting values only from the most recently created inner and cancelling the previous inner subscription on each new source value.
- The switchMap operator is used to choose when cancelling stale inner work is the primary requirement, and it subscribes to the source when the downstream subscribes, emitting values only from the most recently created inner and cancelling the previous inner subscription on each new source value.

## switchAll and switchMap Operators
- The concatAll operator is used to subscribe to inner streams one at a time in arrival order, forwarding values from the current inner and maintaining a queue of pending inners, with completion occurring when the outer completes and the active inner and queued inners complete.
- The governing tags and edge tags for each operator provide additional information about their behavior, such as Shape.SimpleValues, Projection.MapToInnerObservable, and Cancellation.LatestOnly for switchMap, and Shape.NestedObservables, Projection.None, and Concurrency.Sequential for concatAll.
- The Use Case Explorer and Specialization Decision Tree is a tool used to determine the appropriate operator to use in a given scenario, with options including concatAll, [[mergeAll]], concatMap, mergeMap, switchAll, switchMap, exhaustAll, and exhaustMap.

## concatAll and concatMap Operators
- When dealing with nested observables, the choice of operator depends on the policy intent, with options including one after another, allow overlap, latest only, and ignore while busy, and the corresponding operators are concatAll, mergeAll, switchAll, and exhaustAll.
- For simple values, the choice of operator also depends on the policy intent, with options including one after another, allow overlap, latest only, and ignore while busy, and the corresponding operators are concatMap, mergeMap, switchMap, and exhaustMap.
- The concatAll operator is used when ordering must be preserved and concurrency must be prevented, and it projects each source value to an inner observable, queues the projected inners, and runs them one after another.

## exhaustAll and exhaustMap Operators
- The concatMap operator is used when serialization of inner work is required, and it projects each source value to an inner observable, queues the projected inners, and runs them one after another.
- The exhaustAll operator is used when the "first wins until completion" policy is required, and it subscribes to the first inner and forwards its values, while ignoring new inners until the active inner completes.
- The [[mergeAll]] operator is used when all tasks can run concurrently, and it allows overlap between the tasks.

## mergeAll and switchAll Operators
- The switchAll operator is used when the latest task should cancel the previous one, and it only considers the latest inner observable.
- The exhaustMap operator is used when the "first wins until completion" policy is required for simple values, and it subscribes to the first inner and forwards its values, while ignoring new inners until the active inner completes.
- The switchMap operator is used when the latest task should cancel the previous one for simple values, and it only considers the latest inner observable.

## exhaustMap Details
- The `exhaustMap` operator is a behavioral operator that projects each source value to an inner observable and subscribes to the first projected inner, while ignoring new source values until the active inner completes.
- The `exhaustMap` operator completes when the source completes and the active inner completes, and any error from the source or active inner will error the output, making it suitable for use cases where re-entrancy must be blocked until completion.
- In contrast, the `scan` operator is used for synchronous state evolution, applying a reducer to each source value and emitting the intermediate states, and it completes when the source completes, with downstream unsubscribe canceling the source.

## scan and mergeScan Operators
- The [[mergeScan]] operator is similar to `scan`, but it applies a reducer that returns an observable state, and it subscribes to the reducer-produced inner observables, emitting the resulting states, with completion occurring when the source and active inner subscriptions complete.
- The choice between these operators depends on the specific use case, such as preventing double-submit while a request is in-flight, using the latest submission and canceling previous ones, or maintaining state with async transitions, with the decision tree guiding the selection of the appropriate operator, including `mergeMap`, `concatMap`, `switchMap`, `exhaustMap`, `scan`, `mergeScan`, and `switchScan`.
- The operators have different governing tags, edge tags, and policies, such as `Flatten.exhaust`, `Accumulate.scan`, `Shape.SimpleValues`, `Modifier.Scan`, `Reducer.ReturnsPlainState`, and `FlattenPolicy.Merge`, which determine their behavior and usage.

## Choosing Operators Based on Use Cases
- The use case explorer and specialization decision tree provide a structured approach to selecting the correct operator based on the input shape, policy intent, and reducer output, ensuring that the chosen operator meets the specific requirements of the application.
- The Use Case Explorer and Specialization Decision Tree is a tool used to determine the appropriate operator to use in a given scenario, with two main options being [[mergeScan]] and switchScan, which are used for updating state via async work.
- The mergeScan operator is used when overlapping async transitions are acceptable, and it applies a reducer that returns an observable state, emitting states from all reducer-produced inner observables, and it completes when the source and all active inner observables complete.

## mergeScan and switchScan for Async State
- The switchScan operator, on the other hand, is used when only the latest async transition should remain active, and it applies a reducer that returns an observable state, emitting states only from the latest reducer-produced inner observable, and it cancels previous inner subscriptions when a new reducer inner is produced.
- The decision to use mergeScan or switchScan depends on the policy intent, with mergeScan allowing overlap and switchScan allowing only the latest transition, and both operators are used for simple values and observable state.


What is the Observer pattern


# Observer Pattern in the Context of RxJS

## What is the Observer Pattern?
The **Observer pattern** is a design pattern used to establish a one-to-many dependency between objects so that when one object (the subject) changes its state, all its dependents (observers) are notified and updated automatically.


## How It Applies to RxJS
RxJS ([[ReactiveX | Reactive Extensions]] for JavaScript) implements the Observer pattern to handle asynchronous data streams in a consistent and composable way.


### Key Concepts in RxJS Related to the Observer Pattern
- **Observable**: Represents the data source or the subject. It emits values over time.
- **Observer**: The consumer or subscriber that listens to the Observable and reacts to emitted values, errors, or completion signals.
- **Subscription**: The connection between an Observable and an Observer, which can be used to unsubscribe and stop receiving notifications.

### Behavior
- An Observable emits a sequence of values or events.
- Observers subscribe to the Observable to receive these values.
- When the Observable emits a new value, all subscribed Observers are notified.
- Observers can also be notified of errors or completion of the Observable stream.

### Benefits in RxJS
- **Asynchronous data handling**: Observers react to data as it arrives, enabling reactive programming.
- **Composability**: Observables can be transformed, combined, and manipulated using operators.
- **Decoupling**: Observers and Observables are loosely coupled, improving modularity and maintainability.

## Summary
In RxJS, the Observer pattern is the foundation for reactive programming, where Observables emit data streams and Observers subscribe to react to those streams, enabling powerful and flexible asynchronous data handling.





## Sources
- [website](https://github.com/hansschenker/rxjs-operator-docs/blob/main/docs/00-glossary/behavioral-operator-rules-glossary.md)
