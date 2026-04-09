---
title: The Observable disguised as an IO Monad
tags:
  - "Programming/Functional Programming"
createdAt: Tue Jan 06 2026 04:59:44 GMT+0100 (Central European Standard Time)
updatedAt: Tue Jan 06 2026 05:00:05 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Monads and Their Interface
- The concept of monads is introduced as an algebraic data type that follows a certain interface or protocol, with a unit function, a mapping function, and a flatMap function, which can be used to lift regular functions and work over values in a container.
- A monad interface is defined with three key functions: of(a) to place a value into the monad container, map(a -> b) to lift regular functions, and flatMap(a -> M) to lift a monad-returning function and flatten its result into a single structure.
- Concrete monad classes implement this interface and must abide by certain mathematical laws, allowing for easy switching between different types of monads, and each monad has its own unique extended behavior, such as the Maybe monad's fromNullable function or the Try monad's isSuccess and isFailure methods.

## The IO Monad and Side Effect Management
- The [[IO monad]] is introduced as a monad that specializes in threading together a sequence of side effects, allowing them to be run in a sequential and predictable manner, and it is used to create a referentially transparent program specification made up of functions that may produce side effects.
- The IO monad is explained to be a simple monad that implements a modified version of the abstract interface, wrapping a side effect function () -> a instead of a value, and it is demonstrated with an example of a program that rotates a DIV on an HTML page using a deferred function and partial evaluation.

## Overview of the Observable Monad
- The Observable monad is mentioned as another powerful monad that will be discussed, which has built-in logic to thread together a sequence of asynchronous computations, allowing them to be treated like synchronous functions, and it will be explored in more detail later in the post.
- The use of monads in functional programming is highlighted as a way to express impure operations, such as state mutations, I/O, error handling, and reading input from the user, which cannot be expressed with pure functions, and the IO and Observable monads are presented as two examples of monads that specialize in different types of impure operations.

## Implementation Details of the IO Monad
- The [[IO monad]] is a class that allows for the creation of a lazy program description of a side effect, which can be executed immediately or in the future, and it has methods such as `of`, `map`, `flatmap`, and `run` to handle effects and operations.
- The `IO` class is used to map operations over effects and `flatmap` to bring in other IO sequences of operations, and it provides a standard interface for handling side effects, with the `run` method being used to execute the chain of side effects.
- The `doNIntervals` function is used to perform a series of iterations that spawn functions that execute in interval milliseconds, and it is used to carry out an animation effect by rotating a DIV, but it is a manual implementation because IO does not support this out-of-the-box.

## Observable Monad Features and Capabilities
- The Observable monad, which can be worked with using RxJS, is a more powerful and feature-rich monad than IO, and it allows for the performance of regular IO as well as asynchronous IO, making the notion of time a first-class citizen.
- The Observable monad has methods such as `interval`, `map`, `take`, and `subscribe`, which can be used to manipulate sequences of events over time, and it provides a simpler and more elegant way to handle animations and other asynchronous operations.

## Lazy Execution and Execution Triggers
- Both IO and Observable monads are lazy, meaning that they will not begin executing until their respective `run` or `subscribe` methods are called, and they provide a way to keep sequences of operations "pure" by delaying their execution until necessary.
- The `run` method in IO and the `subscribe` method in Observable serve similar purposes, as they both cause the chain of side effects to propagate and flush out any pending IO operations, and they receive any events propagated from the streams and perform any necessary IO operations.

## Author's Analysis of Observable and IO Relationship
- The author of the document, Luis Atencio, discusses the similarity between the Observable and the [[IO monad | IO Monad]], suggesting that they share a similar basic structure and a method to initiate their functionality.
- In a pure Functional Reactive Programming (FRP) observable chain, all side effects are propagated downstream to the subscribers, which is a key characteristic of the Observable.
- The author proposes that the Observable can be viewed as a specialized form of the IO monad, specifically the AsyncIO monad, with built-in timer and async operators, leading to the conclusion that the Observable is essentially an IO monad in disguise.

## Theoretical Foundations and References
- This idea is supported by the definition of an Observable as a newtype, `newtype Observable a = S (IO a)`, which derives Functor, Applicative, and Monad properties, further solidifying the connection between the Observable and the IO monad.
- The author, Luis Atencio, mentions that they were able to verify this concept after reading "Efficient and Compositional Higher-Order Streams", and they have written about this topic in their works, including "Functional Programming in [[JavaScript]]" and "RxJS in Action".




## Sources
- [website](https://medium.com/@luijar/the-observable-disguised-as-an-io-monad-c89042aa8f31)
