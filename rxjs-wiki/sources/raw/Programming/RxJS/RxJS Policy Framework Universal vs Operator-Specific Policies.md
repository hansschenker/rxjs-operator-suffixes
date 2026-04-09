---
title: RxJS Policy Framework: Universal vs Operator-Specific Policies
tags:
  - "Programming/RxJS"
createdAt: Fri Dec 19 2025 10:22:29 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 19 2025 10:22:38 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Overview of the RxJS Policy Framework and Key Findings
- The RxJS Policy Framework document discusses the policies created for combination operators, such as combineLatest, and how they can be partially reused across operators, but each operator also requires additional specialized policies based on its unique combination strategy.
- The key finding of the document is that approximately 40% of the policies are universal, applying to all combination operators, while around 60% are operator-specific, highlighting the need for customized policies for each operator.
- Policy 1, Start (Subscription), was initially thought to be universal, but it was found that it is not, as different operators have varying subscription policies, such as combineLatest, merge, and zip subscribing to all sources immediately, while concat only subscribes to the first source and waits for it to complete.
- Policy 3, Cancellation, is mostly universal, applying to all operators, and states that when unsubscribe() is called, all active source subscriptions should be unsubscribed, resources should be released, and no final emission should occur.

## Universal and Operator-Specific Policies
- Policy 4, Error Propagation, is universal across all combination operators, stating that when any source emits an error, the error should be propagated immediately to subscribers, all other sources should be unsubscribed, and the stream should be terminated, with exceptions for operators with explicit error handling like catchError and retry.
- Policy 2, Combination Logic, is operator-specific and is the core differentiator between operators, with each operator having its own unique combination policy, such as combineLatest waiting for all sources, zip pairing by index, and merge emitting as received.
- Policy 5, Completion Logic, is partially universal but varies significantly by operator, with some operators requiring all sources to complete, while others require only one source to complete, or have a specific completion logic.
- Policy 6, Active Phase Emission, is completely operator-specific, and is where operators differ the most in terms of their emission policies.

## Three-Tier Policy Framework Structure
- The document concludes that the policy framework can be classified into tiers, with Tier 1 being universal policies that apply to all operators, such as resource management on unsubscription, and Tier 2 being operator-specific policies that require customized implementation for each operator.
- The RxJS Policy Framework is a comprehensive set of rules that govern the behavior of RxJS operators, and it is divided into three tiers: Universal Policies, Category-Specific Policies, and Operator-Specific Policies.

## Detailed Policy Tiers and Categories
- The Universal Policies, which include UP-1, UP-2, and UP-3, apply to all operators and define fundamental behaviors such as error propagation, multiple subscriber independence, and resource management on unsubscription.
- The Category-Specific Policies, such as CP-1, CP-2, and CP-3, apply to groups of similar operators and define behaviors like initial synchronization, all-complete completion, and sequential processing.
- The Operator-Specific Policies, which are unique to each operator, define the core behavior of individual operators, such as combineLatest, zip, and concat, and include policies like latest value retention, any-source emission trigger, and index-based pairing.
- The proposed taxonomy for documenting all operators includes three levels: Level 1 for Universal Policies, Level 2 for Category Policies, and Level 3 for Operator-Specific Policies, providing a comprehensive framework for understanding the behavior of RxJS operators.
- The Category Policies are further divided into categories like Synchronization, Completion, Processing, and Memory, each with its own set of policies, such as initial synchronization required, all-complete semantics, parallel processing, and single value storage.

## Operator-Specific Policy Implementation
- Each operator has 2-5 specific policies that define its unique behavior, and understanding these policies is essential for effectively using RxJS operators in applications.
- The policies framework is designed to provide a clear and consistent understanding of how RxJS operators behave, making it easier to use and combine them to build complex asynchronous data processing pipelines.
- The RxJS Policy Framework document outlines policy specifications for 12 combination operators, including combineLatest, combineAll, concat, concatAll, forkJoin, merge, mergeAll, pairwise, race, startWith, withLatestFrom, and zip, with each operator having its own set of universal, category, and specific policies.

## Policy Documentation Strategy and Taxonomy
- The universal policies, such as UP-1, UP-2, and UP-3, are applicable to all operators and include resource management, error propagation, and multiple subscribers, and it is recommended to document these policies once in a "Universal RxJS Operator Policies" document.
- Category policies, such as CP-S-1, CP-C-1, and CP-M-1, are grouped into categories like synchronization policies, completion policies, processing policies, and memory management policies, and should be documented by group.
- Each operator has its own set of specific policies, such as OS-CL-1, OS-CL-2, and OS-CL-3 for combineLatest, which define unique behaviors for that operator and should be documented in detail, referencing universal and category policies as applicable.

## Policy Matrix and Framework Applicability
- The policy documentation strategy recommends creating a detailed policy specification for each operator, including applicable universal and category policies, and defining only unique behaviors, with an example documentation structure provided for the combineLatest operator.
- A policy matrix summary is provided, outlining the policies for each operator, including subscription, cancellation, error, completion, emission trigger, synchronization, and memory, with legends indicating whether policies are fully universal, partially universal, or completely operator-specific.
- The answer to the question of whether these policies can be applied to every operator is implied to be yes, as the framework provides a comprehensive set of policies that can be applied to all 12 combination operators, with variations and specific behaviors documented for each operator.

## Policy Framework Composition and Benefits
- The RxJS Policy Framework does not have a direct universal policy application, but it can be achieved with modifications, as approximately 30% of policies are universal, 30% are category-specific, and 40% are operator-specific.
- A recommended approach to organizing policies includes creating a Universal Policy Framework that consists of three policies, Category Policy Libraries with around 10 policies, and Operator-Specific Policies with 2-5 policies per operator.
- The benefits of this approach include reducing documentation duplication, highlighting similarities between operators, making the learning curve gentler by progressing from universal to category to specific policies, and enabling a policy-based testing framework.

## Implementation Roadmap and Flexibility
- The next steps for implementation involve creating various documents and frameworks, including a complete Universal Policy Framework document, Category Policy documents for each category, operator-specific policy specs for all 12 operators, a policy-based testing framework, and a decision tree showing which policies apply to which operators.
- The direction of these next steps depends on the most valuable approach for teaching, and the content is user-generated and unverified, allowing for flexibility in the implementation of the RxJS Policy Framework.




## Sources
- [website](https://claude.ai/public/artifacts/5aecb9ad-15c5-4636-9fd7-e486e37ef705)
