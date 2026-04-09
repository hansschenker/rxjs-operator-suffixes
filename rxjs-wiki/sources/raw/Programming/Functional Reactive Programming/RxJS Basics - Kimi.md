---
title: RxJS Basics - Kimi
tags:
  - "Programming/Functional Reactive Programming"
createdAt: Thu Mar 26 2026 06:15:47 GMT+0100 (Central European Standard Time)
updatedAt: Thu Mar 26 2026 06:15:55 GMT+0100 (Central European Standard Time)
---




Detailed summary

- The conversation about RxJS Basics by Kimi reveals several meta-takeaways that extend beyond RxJS to the understanding and architecture of complex software systems, including the importance of finding the right abstraction, which can change everything and make implementation details more understandable.
- Mathematical purity is highlighted as a key concept that enables practical power, with the example of Haskell comprehensions, [[Language Integrated Query | LINQ]], and RxJS demonstrating how monadic composition creates uniformity across domains, and the insight that algebra stays constant while the model changes.
- The concept of time is discussed as a parameter that can be controlled and virtualized via Schedulers in RxJS, allowing for testability, determinism, and composition, and the lesson is that ambient context should be made explicit, and if something cannot be tested synchronously, it means the temporal dependency has not been abstracted properly.
- The distinction between Cold, Connectable, and Hot Observables in RxJS is used to illustrate the importance of resource lifecycle management as a first-class architectural concern, and the insight that sharing semantics determine system behavior, with the application being to always ask about the sharing contract when designing data flows.
- The Duality Principle is introduced, which states that Observables are the categorical dual of Iterables, suggesting that many problems have opposite solutions that are equally valid but differently optimized, and the lesson is to look for dualities and try the opposite solution if a problem is hard in one semantics.
- The concept of pragmatism through type theory is discussed, with RxJS being acknowledged as not being true FRP but rather discrete event-based FRP, which sacrifices mathematical purity for operational pragmatism, and the insight is that abstractions leak by design, and RxJS meets the web platform where it is while providing the interface of functional reactivity.
- The importance of composition requiring explicit scopes is highlighted, with the Subscription object as a disposable token teaching that composition must include de-composition, and the lesson is that if something cannot be torn down cleanly, it has not been composed properly, and lifecycle management should be structural, not ad-hoc.
- The meta-meta point is that understanding RxJS deeply requires reconstructing the intellectual history that created it, including tracing how Haskell's monads became [[Language Integrated Query | LINQ]] queries, and how continuous animations became discrete streams, and the insight is that understanding the why makes the how obvious, and this approach can be applied to learning any framework by asking what the mathematical object is before asking what the methods are.




## Sources
- [website](https://www.kimi.com/chat/19d1b85c-be42-8d3d-8000-0979467182d6?chat_enter_method=history)
