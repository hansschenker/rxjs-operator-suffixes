---
title: Claude
tags:
  - "Programming/Functional Programming"
createdAt: Fri Mar 13 2026 14:39:39 GMT+0100 (Central European Standard Time)
updatedAt: Fri Mar 13 2026 14:40:02 GMT+0100 (Central European Standard Time)
---




Detailed summary

- The theoretical spine of functional programming is built around three key abstractions: Functor, Applicative, and Monad, which provide a hierarchy of power for handling contexts and computations.
- A Functor is the simplest useful abstraction, which supports mapping a function over a value in a context, preserving the context while changing the value, and is characterized by two laws: fmap id = id and fmap (f . g) = fmap f . fmap g.
- The Applicative abstraction handles functions inside contexts, allowing for the combination of independent effects, and introduces two key operations: pure, which lifts a plain value into a context, and <*> , which applies a wrapped function to a wrapped value.
- The Monad abstraction handles sequential dependency, where the second computation depends on the result of the first, and is characterized by the >>= operation, also known as flatMap, which allows for the decision of the next context based on the unwrapped value.
- The hierarchy of Functor, Applicative, and Monad forms a spectrum of power, where each level strictly extends the previous one, and every Monad is an Applicative is a Functor, but not the reverse.
- This hierarchy maps perfectly onto Observables in RxJS, where fmap corresponds to the map operator, pure corresponds to the of operator, <*> corresponds to combineLatest or zip, and >>= corresponds to flatMap or switchMap.
- Understanding this hierarchy and the underlying abstractions is crucial for teaching and learning RxJS, as it provides a structural framework for understanding the different operators and concurrency strategies, rather than just memorizing them.




## Sources
- [website](https://claude.ai/chat/6a1b80cc-bc12-4fdb-ad71-561e84bbe1a5)
