---
title: combineLatest Policy Specification: Complete RxJS Guide
tags:
  - "Programming/RxJS"
createdAt: Fri Dec 19 2025 10:17:33 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 19 2025 10:17:52 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction and Policy 1: Start
- The combineLatest policy specification is a comprehensive document that defines the behavior of combineLatest across all lifecycle phases and scenarios, including policies such as Start, Combination, Canceling One of Two Sources, One Source Errors, and One Source Completes.
- Policy 1, also known as Start, states that when a subscriber subscribes to combineLatest, the operator must immediately subscribe to all source observables simultaneously, regardless of their readiness state, as outlined in Rule 1.1, which requires immediate multi-subscription to all sources.
- The subscription order is deterministic, as specified in Rule 1.2, which means that the subscriptions occur in a specific order, and the internal state is initialized with values, hasEmitted, hasCompleted, hasErrored, and subscriberCount, as described in Rule 1.3.
- According to Rule 1.4, there is no immediate emission when the subscription completes, and the operator waits for Policy 2, also known as Combination, to be satisfied, which requires that combineLatest must not emit any value until every source observable has emitted at least one value.

## Policy 1: Subscription Rules and Examples
- The policy specification includes examples, such as Example 1.1, which demonstrates immediate subscription to all sources, and Example 1.2, which shows that the subscription order is deterministic, as well as a marble diagram that illustrates the subscription event and the result.
- Policy violations, such as delayed subscription and conditional subscription, are also discussed, and examples of incorrect implementations, marked as ❌ WRONG, are provided to illustrate what not to do, such as subscribing to sources one at a time or only subscribing if a condition is met.
- The combineLatest policy specification is a crucial guide for implementing the combineLatest operator correctly, and it provides a detailed and comprehensive overview of the expected behavior, including additional policies, such as Policy 3, Policy 4, Policy 5, and Policy 6, as well as an implementation examples section and a policy interaction matrix.

## Policy 2: Synchronization Phase and Combination Rules
- The "synchronization phase" or "initial combination phase" is a critical period in the combineLatest policy, during which the operator waits for all source observables to emit at least one value before emitting the combined values to the subscriber.
- The detailed rules for this phase include Rule 2.1, which states that emission is allowed only when all source observables have emitted at least one value, and Rule 2.2, which specifies that values from sources that have emitted are stored in a buffer and not emitted to the subscriber until all sources have emitted.
- Rule 2.3 states that when the last remaining source emits its first value, the stored values are emitted to the subscriber, and the operator transitions to the "active" state, at which point Policy 6 applies.
- During the synchronization phase, the operator stores exactly one value per source that has emitted, overwriting any previous values from the same source, as specified in Rule 2.4.
- The examples provided, including Example 2.1 and Example 2.2, demonstrate how the combineLatest operator works during the synchronization phase, including waiting for all sources to emit and overwriting values during the buffer phase.
- The marble diagram illustrates the buffering and active phases, showing how the operator emits values only after both sources have emitted, and the state transition rule specifies when the operator transitions from the buffering state to the active state.
- Edge cases, such as Edge Case 2.1, which involves an empty observable, and Edge Case 2.2, which involves all sources being synchronous, are also discussed, highlighting how the combineLatest operator handles these scenarios.
- Policy violations, such as emitting before all sources have emitted, are also addressed, emphasizing the importance of adhering to the combineLatest policy to ensure correct behavior.

## Policy 3: Cancellation and Unsubscription Rules
- Finally, Policy 3 states that when a subscription to combineLatest is unsubscribed, all source subscriptions must be immediately cancelled, with no partial cancellation of sources allowed.
- The combineLatest policy specification outlines the rules for unsubscribing from sources, including the requirement for full unsubscription, where calling subscriber.unsubscribe() will unsubscribe from all sources, as stated in Rule 3.1.
- The unsubscription order is specified in Rule 3.2, which dictates that unsubscription should occur in reverse order of subscription to ensure proper resource cleanup, with the rationale being that resources should be cleaned up in the reverse order of their acquisition.
- When unsubscribe() is called, the combineLatest operator will stop all source subscriptions immediately, release all stored values, clear internal state, and will not emit any final value or send a completion signal, as outlined in Rule 3.3.
- The policy also states that combineLatest does not support partial unsubscription, meaning that unsubscribing from individual sources, selective source cancellation, or source removal during operation is not allowed, as specified in Rule 3.4.
- The examples provided demonstrate the complete cleanup of sources when unsubscribe() is called, as well as the fact that no emissions occur after unsubscription, with the timeline and output illustrating the immediate effect of unsubscription.
- The marble diagram illustrates the unsubscription process, showing that both sources are unsubscribed and no completion signal is sent, with the result being that no further emissions occur after unsubscription.

## Policy 4: Error Handling and Propagation
- The resource cleanup is implemented in the CombineLatestImplementation class, which subscribes to all sources and returns a teardown logic function that unsubscribes from all sources and performs cleanup when called.
- Policy violations are highlighted, including leaving sources active after unsubscription and emitting a final value on unsubscription, with examples provided to demonstrate the incorrect implementation.
- The policy also addresses the case where one source errors, stating that if any source observable emits an error, combineLatest must immediately propagate that error to subscribers, terminate the stream, and unsubscribe from all other sources, as outlined in Policy 4 and Rule 4.1.
- The combineLatest policy specification outlines the behavior of the combineLatest operator in the event of an error, which is a terminal state that prevents further emissions from the stream.
- According to Rule 4.2, if multiple sources error simultaneously, the first error encountered wins, typically the source with the lowest index, and other errors are ignored or swallowed.
- Rule 4.3 states that if an error occurs during the buffering phase, Rule 4.1 is applied immediately, no partial values are emitted, and buffered values are discarded.
- Rule 4.4 indicates that if an error occurs during the active phase, Rule 4.1 is applied immediately, the last emitted value is the final value, and no completion signal is sent.
- The combineLatest operator does not support automatic retry, error recovery, fallback values, or continuing with remaining sources, as stated in Rule 4.5, and any error is considered terminal.
- Examples are provided to demonstrate the behavior of combineLatest in the event of an error, including errors during the buffering and active phases, and marble diagrams are used to illustrate the scenarios.
- Error handling strategies are discussed, including catching errors per source and retrying on error, to prevent the combineLatest stream from terminating due to an error.
- Policy violations are highlighted, such as continuing to emit values after an error or sending a completion signal after an error, which violate the rules outlined in the combineLatest policy specification.

## Policy 5: Completion and Source Completion Rules
- The policy statement for Rule 5 indicates that when one source completes, combineLatest must continue operating normally, using the last emitted value from the completed source, and the stream completes only when all sources have completed.
- The combineLatest policy specification outlines several detailed rules, including Rule 5.1, which states that when a source, such as sourceᵢ, completes, it is marked as completed, its last value is stored in memory, and the combineLatest function continues emitting when other sources emit, using the stored value from the completed source for all future emissions.
- According to Rule 5.2, when a source, such as sourceᵢ, completes with a last value, denoted as v, this value is retained and used for all future emissions, and it is never overwritten, as indicated by the expression values[i] ← v, which is frozen.
- Rule 5.3 defines the final completion condition for the combineLatest function, which completes if and only if all sources, denoted as sourceᵢ, have completed, as formally expressed by the equation complete(combineLatest) = ∧ⁿᵢ₌₁ completed(sourceᵢ).
- Rule 5.4 specifies that the order in which the sources complete is irrelevant to the combineLatest function, and only the count of completed sources matters, meaning that the function's behavior is determined solely by the number of completed sources, regardless of the order in which they complete.
- The `combineLatest` policy requires exactly n completions to complete, where n is the number of sources, and if a source completes without emitting, `combineLatest` will never emit and will eventually complete when all sources complete.
- The `combineLatest` policy has several rules, including Rule 5.5, which states that if a source completes without emitting, `combineLatest` will never emit and will eventually complete when all sources complete, and Rule 5.1, which states that when a source completes, it should be marked as completed and its last value should be kept.
- The policy also includes edge cases, such as Edge Case 5.1, where all sources complete immediately, and Edge Case 5.2, where one source never completes, and policy violations, such as completing after the first source or discarding the last value.

## Policy 6: Active Emission and No Scheduling Rule
- The `combineLatest` policy also includes Policy 6, which states that after initial synchronization, when any source emits a new value, `combineLatest` must immediately emit an array containing the new value from the emitting source and the latest values from all other sources, as outlined in Rule 6.1 and Rule 6.2.
- The policy can be implemented using a state tracking system, such as the `CompletionState` interface, which keeps track of the completed sources, total sources, and last values, and the `onSourceComplete` function, which updates the state when a source completes.
- Examples of the `combineLatest` policy in action include Example 5.1, where one source completes early, and Example 5.2, where multiple sources complete at different times, and marble diagrams, such as Scenario 1 and Scenario 2, which illustrate the policy in different scenarios.
- The `combineLatest` policy is used in RxJS, a library for reactive programming in JavaScript, and is an important part of the library's functionality, allowing developers to combine multiple observables into a single observable that emits an array of values.
- The combineLatest policy specification, as outlined in the 'combineLatest Policy Specification: Complete RxJS Guide', has a key requirement that no scheduling or delay is permitted in its implementation.
- This policy is a part of the larger RxJS guide, which suggests that it is related to reactive programming and the management of asynchronous data streams.
- The specification explicitly states that scheduling or delay is not allowed, implying that all operations must be performed immediately or in real-time, without any intentional delays or scheduling of tasks.
- The importance of this rule is highlighted by its explicit mention in the policy specification, indicating that adherence to this requirement is crucial for the correct functioning of the combineLatest policy in the context of RxJS.

## Emission Behavior and Performance Characteristics
- The 'combineLatest Policy Specification: Complete RxJS Guide' document provides a comprehensive overview of the policy, including this critical aspect, to ensure that developers can effectively implement and utilize the combineLatest policy in their reactive programming applications.
- The combineLatest policy specification outlines the behavior of the combineLatest operator in RxJS, which combines the emissions from multiple source observables into a single observable that emits an array of values.
- The policy includes rules such as value overwriting, where each emission from a source overwrites its previous value, and other sources remaining unchanged when a source emits, ensuring that only the emitting source updates the state.
- The policy also specifies that multiple sequential emissions from a single source will result in multiple emissions from the combineLatest observable, with no coalescing or buffering occurring, as demonstrated in examples such as Example 6.1 and Example 6.2.
- The marble diagram and state transition visualization provide a visual representation of the policy in action, showing how the combineLatest observable emits values based on the emissions from the source observables.
- The performance characteristics of the combineLatest operator are also discussed, including the emission rate and emission count formula, which can be used to predict the behavior of the operator.
- Policy violations, such as buffering emissions and using stale values, are highlighted as incorrect implementations of the combineLatest policy, and additional policies, such as Policy 7, are mentioned as creating an independent execution context for each subscription to combineLatest.
- The emission rate of the combineLatest observable is equal to the sum of the emission rates of the source observables, and the emission count formula takes into account the synchronization phase, where the (n-1) subtraction accounts for the initial synchronization of the source observables.
- The examples provided, such as the alternating emissions and rapid emissions from one source, demonstrate the correct implementation of the combineLatest policy and highlight the importance of following the rules outlined in the policy specification.
- The `combineLatest` function in RxJS re-subscribes to source observables for each new subscriber, creating an independent execution context and state for each subscriber, as demonstrated by the rules that state when `subscriber₁` subscribes, an execution context₁ is created and subscribed to all sources, and when `subscriber₂` subscribes, an execution context₂ is created and subscribed to all sources again.

## Core Policies Overview and Implementation
- The example provided in [[TypeScript]] illustrates this concept, where two subscribers are subscribed to the `combined$` observable, which is created by combining the `clicks$` and `timer$` observables using `combineLatest`, and each subscriber has its own independent timer and click tracking, with the second subscriber being subscribed three seconds after the first one.
- According to Policy 8, `combineLatest` does not implement backpressure handling, which means that fast-emitting sources are not slowed down to match the pace of slower sources, and instead, `combineLatest` simply uses the latest values from each source without buffering or rate limiting, allowing fast sources to emit at full speed while slow sources emit at their own pace.
- The combineLatest policy specification is a comprehensive guide that outlines the behavior of the combineLatest operator in RxJS, which is used to combine multiple Observables into a single Observable that emits an array of the latest values from each source.
- The policy specification is defined by six core policies: Start, Combination, Cancellation, Error, Completion, and Active, which completely define the behavior of combineLatest in all scenarios, including initial subscription, source emissions, errors, completion, and unsubscribe.
- The Start policy states that all sources should be subscribed to immediately, with no immediate emission, and the subscription order is deterministic, as seen in the example with the fast$ and slow$ Observables, where the fast$ Observable emits 100 times, but only around 100 combineLatest emissions occur.
- The Combination policy dictates that no emission should occur until all sources have emitted at least once, and the first emission occurs when the last source emits, with values buffered correctly during synchronization, as implemented in the [[CombineLatestOperator]] class.
- The Cancellation policy requires that all sources should be unsubscribed when the combineLatest Observable is unsubscribed, with no emissions after unsubscribe, and resources should be cleaned up, as implemented in the execute method of the CombineLatestOperator class.
- The Error policy states that an error should propagate immediately, all sources should be unsubscribed when an error occurs, and no emissions should occur after an error, as implemented in the handleError method of the CombineLatestOperator class.
- The Completion policy specifies that the stream should continue after one source completes, the last value should be retained from the completed source, and the combineLatest Observable should complete only when all sources have completed, as implemented in the handleComplete method of the CombineLatestOperator class.
- The Active policy requires that the combineLatest Observable should emit on each source emission, use the latest values from other sources, and emissions should be synchronous, as implemented in the emitCombination method of the CombineLatestOperator class.

## Testing Checklist for Policy Compliance
- A testing checklist is provided to verify policy compliance, covering all six policies and ensuring correct combineLatest behavior in all scenarios, including initial subscription, source emissions, errors, completion, and unsubscribe.




## Sources
- [website](https://claude.ai/public/artifacts/8f69a362-1859-41fb-80f3-93576d0dc395)
