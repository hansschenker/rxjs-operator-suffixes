---
title: RxJS Hot Cold
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:24:41 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 12:59:36 GMT+0100 (Central European Standard Time)
---


Hot and Cold are terms for an Observable producer function being in execution context (cold) or not in execution context (hot) of an Observable


# Difference Between Hot and Cold RxJS Observable Producer Functions in Terms of Execution Context

## Cold Observables
- The producer function is **created and activated inside the subscription**.
- Each subscription creates a **new producer instance** and its own execution context.
- This means every subscriber gets its **own independent data stream**.
- The observable is **lazy** and starts producing values only when subscribed to.
- Typical behavior is **unicast** (one producer per subscriber).
- Example: Creating a new WebSocket connection inside the subscription function.
- Execution context: The producer runs **within** the subscription call.
- ([[Hot vs Cold Observables]])
- ([[Hot vs Cold Observables]])

## Hot Observables
- The producer function is **created or activated outside the subscription**.
- Multiple subscribers share the **same producer instance** and execution context.
- The observable is **already running** regardless of subscriptions.
- Typical behavior is **multicast** (one producer shared among subscribers).
- Example: A WebSocket connection created outside the observable and shared by all subscribers.
- Execution context: The producer runs **independently** of subscription calls.
- ([[Hot vs Cold Observables]])
- ([[Hot vs Cold Observables]])

## Summary
- **Cold Observable:** Producer function is in the execution context of the subscription; each subscription triggers a new producer.
- **Hot Observable:** Producer function is outside the subscription execution context; subscriptions share the same producer.
- This distinction affects resource usage, multicasting behavior, and when data production starts.
- ([[Hot vs Cold Observables]])
- ([[Hot vs Cold Observables]])




