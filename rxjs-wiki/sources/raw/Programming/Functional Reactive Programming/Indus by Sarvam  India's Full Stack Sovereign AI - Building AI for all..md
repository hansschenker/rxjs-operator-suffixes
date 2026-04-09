---
title: Indus by Sarvam | India's Full Stack Sovereign AI - Building AI for all.
tags:
  - "Programming/Functional Reactive Programming"
createdAt: Mon Apr 06 2026 09:34:59 GMT+0200 (Central European Summer Time)
updatedAt: Mon Apr 06 2026 09:35:09 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The connection between the theoretical world of Functional Reactive Programming (FRP) and the practical implementation of reactive programming in libraries like RxJS is incredibly insightful, and it is conceptually accurate to view an RxJS Observable as a lazy, potentially infinite list of pairs of time and value.
- The nuance between an Observable and a list of pairs of time and value, denoted as [..], lies in the fact that an RxJS Observable is a lazy, push-based collection of values, and the time is not part of the emitted value by default, but can be added using the timestamp() operator to create a  structure.
- The  object created with the timestamp() operator can be seen as a sampled result from a continuous Signal function T -> a, where the Signal is a continuous, smooth function, and the Observable is a stream of discrete events that can be visualized as marking points on a graph with X-coordinates representing time and Y-coordinates representing the emitted value.
- The practical implications of this connection include the distinction between pull-based and push-based paradigms, where FRP Signals are pull-based functions that allow querying at any time, and RxJS Observables are push-based streams that only provide values at specific emission times.
- The key difference between FRP Signals and RxJS Observables lies in their fundamental nature, time semantics, and API, where FRP Signals are continuous and theoretically defined for all real numbers, and RxJS Observables are discrete and only have values at specific emission times.
- The distinction between FRP and RxJS matters because it affects how you reason about the behavior between events, where FRP allows querying at any time, and RxJS only allows reasoning about the values that were actually emitted.
- Using operators like bufferTime() or windowTime() in RxJS can help group a series of  samples into discrete frames, which can make it feel more like observing the state of a signal over an interval.
- The connection between FRP Signals and RxJS Observables is a powerful mental model that bridges the gap between the theory and the practice, and it shows a deep understanding of the semantics behind the code.
- The FRP Signal represents the perfect, complete mathematical description, while the RxJS Observable represents the real-world data that can actually be observed and reacted to.
- Thinking about RxJS Observables as sampled signals is an excellent way to understand the relationship between the theoretical and practical aspects of reactive programming, and it highlights the importance of considering the deep semantics behind the code.




## Sources
- [website](https://indus.sarvam.ai/?session=01KNGTDAZ64PSKRFPMBV1JZYKE)
