---
title: Demystifying RxJS, Part III: Building our own Schedulers
tags:
  - "Programming/RxJS"
createdAt: Fri Jan 30 2026 07:47:38 GMT+0100 (Central European Standard Time)
updatedAt: Fri Jan 30 2026 07:47:53 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to the Article and Series Context
- The article is the third and final part of a series called Demystifying RxJS, where the author builds a miniature version of RxJS to gain a deep understanding of how it works, and in this part, the focus is on schedulers, which provide fine-grained control over when values from an Observable are emitted.
- The author explains that schedulers are particularly important when designing APIs that return Observables, as they can help prevent unintended behavior, such as triggering the release of a "demonic hell spawn" by inadvertently emitting values at the wrong time.
- The author provides an example of an Observable-based API service that fetches data from an endpoint and caches it in-memory, using the `of()` function to return cached values synchronously, and the `http.get()` function to fetch new data asynchronously.
- The author demonstrates how using the `of()` function can lead to inconsistent behavior, as it emits values synchronously, whereas the `from()` function emits values asynchronously, which can cause problems when subscribing to Observables.

## Problem with Synchronous Emissions and Inconsistent Behavior
- The example shows how the order of console logs changes between the first and second subscriptions to the API service, due to the synchronous emission of values by the `of()` function, which can make it difficult to predict the behavior of the API.
- The author suggests that understanding schedulers and how they work can help resolve issues related to the timing of Observable emissions, and provide more insight into how RxJS works, especially for developers who are struggling with timing-related problems in their code.

## Audience and Concept of Zalgo in Asynchronous APIs
- The article is intended for developers who have read the previous parts of the series, but also provides links to CodeSandbox examples that allow readers to follow along and experiment with the code, including a completed code example from Part II and a complete miniature library.
- The article discusses the importance of preventing the release of [[Zalgo]], a concept introduced by Isaac Schlueter in his article "Designing APIs for Asynchrony", which occurs when an API's callback is sometimes called immediately and other times at a later point, making the code impossible to reason about.

## Implementation of Schedulers and Scheduler Interface
- To address this issue, the article suggests implementing schedulers, which provide better control over when emissions of data are scheduled, and introduces the concept of building a basic version of schedulers, including two schedulers: one that emits values immediately and one that emits values asynchronously using setTimeout.
- The article outlines the implementation of a Scheduler interface, similar to the one found in RxJS, but simpler, which has a single function, schedule(), that accepts a work callback to be executed at the scheduler's discretion, and creates two concrete instances of this interface: a syncScheduler and an asyncScheduler.

## Modifying Observables to Support Schedulers
- The Observable class is modified to support schedulers, with changes to the constructor and subscribe() method, allowing for the use of different schedulers within Observables, and an observeOn operator is introduced, which creates a new Observable equivalent to the source observable but using the specified scheduler.
- The observeOn operator is implemented as a method that can be used as an argument to .pipe(), allowing for a nicer API and enabling the resulting observable to use the correct scheduler, and a test program is written to demonstrate the effectiveness of this implementation.

## External Resources and Key Takeaways on Schedulers
- The article references external resources, including Isaac Schlueter's article and John Resig's article on JS Timers, to provide additional context and information on the topics discussed, and highlights the importance of controlling the timing of emissions from observables to prevent the release of [[Zalgo]] and ensure predictable and reasonable code behavior.
- The key takeaway from the discussion on schedulers is that they provide fine-grained control over when observable subscription logic is executed, allowing for precise specification of how an event should arrive.

## Practical Application of Schedulers in APIs
- Schedulers can be utilized to ensure consistent API subscription timing by passing a specific scheduler, such as the asapScheduler, as an argument to the of() function, as seen in the example code return of(cache.get(endpoint) as T, asapScheduler).
- By building the core components of RxJS, including schedulers, developers can gain a foundational understanding of the primitive mechanisms in RxJS and effectively use the library.

## Further Learning and Contributions to RxJS
- To further explore RxJS, it is suggested to check out the official documentation, specifically the guide on subjects at [https://rxjs.dev/guide/subject](https://rxjs.dev/guide/subject) and the developer guide on schedulers.
- The experience of building a custom version of RxJS can be a valuable learning experience, and for those interested in contributing to the real version of RxJS, contributions are welcomed by the development team.




## Sources
- [website](https://medium.com/@traviskaufman/demystifying-rxjs-part-iii-building-our-own-schedulers-7cdee270215e)
