---
title: combineLatest Formal Rules: Complete RxJS Operator Guide
tags:
  - "Programming/RxJS"
createdAt: Fri Dec 19 2025 10:07:03 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 19 2025 10:07:14 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Core Rules of combineLatest
- The `combineLatest` operator in [[rxjs | RxJS]] has a formal specification that defines its behavior, which can be broken down into four core rules: Initial Synchronization Requirement, Emission Trigger Condition, Latest Value Retention, and Completion Condition.
- The Initial Synchronization Requirement, also known as Rule 1, states that no emissions occur until all source observables have emitted at least once, which can be formally stated as `∀i ∈ [1, n]: sourceᵢ must emit at least one value before combineLatest emits anything`.
- The Emission Trigger Condition, or Rule 2, specifies that after initial synchronization, any source emission triggers a new `combineLatest` emission, which can be implemented in code using a state machine view with a `canEmit` function that checks if all sources have emitted.
- The Latest Value Retention rule, or Rule 3, states that each source maintains exactly one current value at any time, with new emissions overwriting the previous value, and this can be achieved using a `LatestValues` buffer that stores the current values from each source.
- The Completion Condition, or Rule 4, states that `combineLatest` completes if and only if all source observables have completed, which ensures that the resulting observable only completes when all input observables have finished emitting values.

## Implementation Mechanics
- The `combineLatest` operator can be implemented using a state machine that maintains a `values` map, a `hasEmitted` set, and a `sourceCount` number, and uses functions like `canEmit` and `onSourceEmit` to manage the emission of values based on the rules specified.
- The behavior of `combineLatest` can be illustrated using examples, such as waiting for all sources to emit, and using a truth table to show the relationship between source emissions and `combineLatest` emissions, and a memory model that demonstrates how the latest values are retained for each source.

## Formal Completion Conditions
- The `combineLatest` operator completes when all of its source observables have completed, as defined by the formal statement `combineLatest completes ⟺ ∀i ∈ [1, n]: completed(sourceᵢ) = true`, which means that every source must have sent a complete signal for `combineLatest` to complete.
- The logical expression for `combineLatest` completion is given by `complete(combineLatest) = complete(source₁) ∧ complete(source₂) ∧ ... ∧ complete(sourceₙ)`, indicating that all sources must be complete for `combineLatest` to be considered complete.

## State Transitions and Completion Handling
- The state transition for `combineLatest` completion is managed by a function `onSourceComplete` that updates the `CompletionState` object, which tracks the total number of sources and the set of completed sources, and signals completion to subscribers when all sources have completed.
- The examples provided demonstrate the behavior of `combineLatest` in different scenarios, including when all sources complete, when one source never completes, and when an empty observable is used, highlighting the rule that prevents emission if any source does not emit a value.

## Error Propagation and State Diagram
- Rule 5 of `combineLatest` states that if any source emits an error, `combineLatest` immediately errors and unsubscribes from all sources, as formalized by the statement `If ∃i: sourceᵢ emits error(eᵢ) Then: 1. combineLatest emits error(eᵢ) 2. ∀j ≠ i: unsubscribe(sourceⱼ) 3. combineLatest terminates`.
- The state diagram for `combineLatest` illustrates the different phases of its operation, including buffering, emitting, completion, and error handling, and an example is provided to demonstrate how `combineLatest` errors immediately when one of its sources emits an error.

## Emission Count and Memory Complexity
- The derived properties and behaviors of `combineLatest` include the emission count relationship, which states that the number of emissions from `combineLatest` can vary widely depending on the emission patterns of its source observables.
- The `combineLatest` operator has specific bounds for the number of emissions, with a lower bound of 0 and an upper bound of the sum of emissions from all sources minus the initial synchronization, and the typical case is approximately one output per input after synchronization.
- The operator has a memory complexity of O(n), where n is the number of sources, as it stores exactly one value per source, and this is in contrast to other operators like `zip` which has a space complexity of O(n × m) and `merge` which has a space complexity of O(1).

## Synchronous Emissions and State Machine Representation
- The `combineLatest` emissions are synchronous with source emissions after the initial synchronization, meaning that if a source emits at time t, the `combineLatest` operator will also emit at time t, with no additional delay or scheduling.
- The operator can be represented as a state machine with states such as `INITIAL`, `BUFFERING`, `ACTIVE`, `COMPLETED`, and `ERROR`, and transitions between these states are based on the emissions and completions of the source observables.

## Pseudo-code Implementation
- A pseudo-code implementation of the `combineLatest` operator is provided, which includes methods for handling next values, checking if an emission is possible, getting the output, handling completions, and handling errors.

## Decision Framework and Common Pitfalls
- The decision to use `combineLatest` can be based on a rule-based decision tree, which considers factors such as whether all sources need to drive emissions, whether intermediate or final values are needed, and whether the stream should complete when any source completes.
- Common pitfalls and edge cases to watch out for when using `combineLatest` include the cold observable trap, empty observables, and late subscriber problems, and solutions to these issues are provided, such as using `shareReplay` or `BehaviorSubject`.

## Mathematical Properties and Laws
- The `combineLatest` operator has specific mathematical properties, including commutativity, associativity, and the lack of an identity element, which can affect the order and timing of emissions.
- The `combineLatest` operator in [[rxjs | RxJS]] has specific formal rules that define its behavior, including the Initial Synchronization Law, which states that there is no emission until all sources have emitted at least once.
- The Any-Source Trigger Law, Latest Value Law, All-Complete Law, and Error Propagation Law are the other four laws that govern the behavior of `combineLatest`, ensuring that any source emission triggers output after synchronization, only the most recent value from each source is remembered, the stream completes only when all sources complete, and any error immediately terminates the stream.

## Testing and Formal Verification
- The `combineLatest` operator can be tested using marble testing syntax, as demonstrated in the provided TypeScript code, which imports the `TestScheduler` from 'rxjs/testing' and uses it to verify that the operator behaves as expected, with the test scheduler running a test that checks the output of `combineLatest` against an expected result.
- A formal verification checklist is provided to ensure that the implementation of `combineLatest` follows the correct semantics, including checking for the initial phase where there are no emissions until all sources emit once, the active phase where every source emission produces output, memory that only stores one value per source, completion that waits for all sources to complete, error handling that terminates immediately, output that contains the latest value from each source, timing that is synchronous with source emissions, and subscription that subscribes to all sources immediately.

## Special Case: EMPTY Observable Behavior
- The `EMPTY` observable acts as an absorptive element, meaning that `combineLatest([A, EMPTY, B])` will never emit but will eventually complete, and there is no observable `I` such that `combineLatest([A, I])` behaves identically to `A`.


how are values combined when both have emitted once and one has emitted again but not the other

Message: ```markdown


# How combineLatest Combines Values When Sources Emit

## Scenario
- Two source observables: Source A and Source B.
- Both have emitted at least once (initial synchronization complete).
- One source (e.g., Source A) emits a new value again.
- The other source (Source B) has not emitted since its first emission.

## Behavior
- **combineLatest emits immediately when any source emits after initial synchronization.**
- The emitted value is an array containing:
    - The latest value from Source A (the new emission).
    - The latest value from Source B (the last known value, even if it hasn't changed).

## Example
| Time | Source A | Source B | combineLatest Output |
| --- | --- | --- | --- |
| t1 | A1 | - | (No output yet, waiting) |
| t2 | - | B1 | [A1, B1] |
| t3 | A2 | - | [A2, B1] |

- At time t3, Source A emits A2.
- Source B has not emitted since B1.
- combineLatest emits `[A2, B1]`, combining the new value from A with the latest from B.


---

**Summary:** After both sources have emitted once, any new emission from one source triggers combineLatest to emit an array of the latest values from all sources, including the unchanged latest values from other sources.

```

```





## Sources
- [website](https://claude.ai/public/artifacts/fa453fe6-a22b-4eeb-aad1-9d209ae9c73a)
