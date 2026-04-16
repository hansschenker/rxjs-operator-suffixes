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
