---
title: RxJS Unicast Multicast
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:26:00 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 12:59:54 GMT+0100 (Central European Standard Time)
---


Unicast and Multicast are terms for a Subscription being 1 producer to 1 consumer (unicast) and 1 producer to n consumers (multicast)

Message: # Unicast vs Multicast in RxJS Subscriptions


## Unicast (1 Producer to 1 Consumer)
- Each subscription creates a **new execution context** and a **new producer instance**.
- Every subscriber receives its **own independent data stream**.
- This means the producer is **not shared** among subscribers.
- Typical of **cold observables**, where the producer is created and activated inside the subscription.
- Example: A cold observable that generates a random number for each subscriber separately.
- Analogy: Like a movie on-demand, where each viewer starts fresh.
- 0b1fbaac-198a-45fa-8fd7-5f8460f8097f
- ([[Hot vs Cold Observables]])

## Multicast (1 Producer to N Consumers)
- A **single execution context** is shared among all subscribers.
- Multiple subscribers share the **same producer instance** and receive the **same emitted values**.
- Typical of **hot observables**, where the producer is created or activated outside the subscription.
- Enables **efficient resource usage** by avoiding duplication of expensive producers (e.g., WebSocket connections).
- Example: A Subject that multicasts values to multiple observers.
- Analogy: Like a live TV broadcast, where all viewers see the same content simultaneously.
- 0b1fbaac-198a-45fa-8fd7-5f8460f8097f
- ([[Rxjs On The Subject Of Subjects (in RxJS) | On The Subject Of Subjects (in RxJS)]])

## Summary
- **Unicast:** One producer per subscriber; independent streams; cold observable behavior.
- **Multicast:** One shared producer for all subscribers; shared streams; hot observable behavior.
- Understanding this distinction is crucial for managing resource usage and data flow in RxJS applications.




