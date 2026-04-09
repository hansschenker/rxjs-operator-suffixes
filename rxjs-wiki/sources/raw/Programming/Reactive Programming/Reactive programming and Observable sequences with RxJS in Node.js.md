---
title: Reactive programming and Observable sequences with RxJS in Node.js
tags:
  - "Programming/Reactive Programming"
createdAt: Mon Jan 19 2026 08:59:32 GMT+0100 (Central European Standard Time)
updatedAt: Mon Jan 19 2026 08:59:58 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Asynchronous Processing in Node.js
- The article "Reactive programming and [[Observable]] sequences with [[rxjs | RxJS]] in [[Node.js]]" by Enrico Piccinin discusses the benefits and complexities of dealing with asynchronous non-blocking processing in [[JavaScript]], particularly in the context of Node.js, a popular server-side JavaScript non-blocking environment.
- The benefits of asynchronous processing include an efficient use of resources, but it also increases complexity, which has led to the development of various solutions such as callbacks, Promise, Future, async, and await to reduce this complexity.
- Recently, [[ReactiveX]], with its various language implementations, including RxJS for JavaScript, has introduced a new powerful tool called the Observable, which can simplify code execution in Node.js.
- The article uses a simple use case, "Read, Transform, Write, and Log", to demonstrate the benefits of using Observables, where files are read from a source directory, transformed, written to a target directory, and logged.

## Challenges of Non-Blocking I/O and Callbacks
- A synchronous implementation of this use case is straightforward, but in an asynchronous non-blocking environment like [[Node.js]], the implementation becomes more complex, with Node.js not waiting for I/O or network operations to complete before moving on to the next line of code.
- The article shows how Node.js handles I/O operations, such as reading and writing files, in a non-blocking manner, using callbacks, and how this can lead to convoluted code with multiple levels of indentation.
- The use of [[JavaScript]] Promise is also demonstrated, which can make the code look more sequential and easier to read, without interfering with the asynchronous nature of Node.js, by using functions that return Promises for read and write operations.

## Promise-Based Solutions and Their Limitations
- The article highlights the importance of understanding the sequence of events in both synchronous and asynchronous environments, and how using Observables with [[rxjs | RxJS]] can simplify code execution in Node.js, making it easier to handle complex asynchronous operations.
- The provided text discusses the limitations of using Promises in [[Node.js]] when dealing with complex scenarios, such as processing multiple files in parallel, and introduces [[ReactiveX]] and RxJS as a solution to handle these situations more elegantly.

## Introduction to Observables and ReactiveX
- The text explains that Observables, a key concept in ReactiveX, model a stream of events and offer a "push" approach, as opposed to the "pull" approach of Iterables, allowing developers to transform streams of events using operators like map, filter, and skip, and apply functional programming styles.
- Observables provide a subscription interface that enables developers to apply side effects to events, perform specific actions when errors occur, or when the stream of events completes, making them a powerful tool for handling complex asynchronous operations.

## Practical Use Case: File Processing with Observables
- The text describes a use case where Observables are used to read a list of files from a directory, read the content of each file, and perform transformations on the content, demonstrating how Observables can be combined using operators like switchMap to implement complex workflows.
- The switchMap operator is highlighted as a key tool for combining Observables, allowing developers to switch from one [[Observable]] to another when a specific event occurs, such as when a directory has been read, and then read the contents of each file.
- The text provides examples of functions like readDirObservable and readFilesObservable, which return Observables that emit events when a directory has been read or a file has been read, respectively, and demonstrates how these Observables can be subscribed to and combined to implement a complex use case.

## Operators for Combining Observables
- The use of Observables and [[ReactiveX]] is presented as a solution to the limitations of Promises in handling complex asynchronous operations, providing a more elegant and efficient way to manage streams of events and perform transformations on data.
- The code example provided demonstrates the use of ReactiveX and [[rxjs | RxJS]] in [[Node.js]] to handle asynchronous operations, such as reading and writing files, in a non-blocking manner, utilizing the `switchMap` and `mergeMap` operators to manage Observable sequences.
- The `switchMap` operator is used to handle a stream of events representing the completion of a read operation, and its full power and capabilities are not fully explored in this simple use case, with a reference to an article that provides a detailed description of the `switchMap` operator.
- The `mergeMap` operator, also known as `flatMap`, is used to merge multiple Observables into a new [[Observable]] that emits when any of the individual Observables emit, allowing for the handling of multiple asynchronous operations, such as writing files, in a streamlined manner.

## Observable Functions and Code Structure
- The code example illustrates the use of `readDirObservable`, `readFilesObservable`, `writeFileObservable`, and `writeLogObservable` functions, which return Observables that emit when the corresponding operations are completed, and the `map` operator is used to transform the data emitted by these Observables.
- The `bindCallback` and `bindNodeCallback` functions provided by [[rxjs | RxJS]] are used to transform functions that accept callbacks into functions that return Observables, allowing for the creation of Observables from existing callback-based functions, such as those found in standard [[Node.js]] libraries.
- The resulting code is written in a functional style, with no indentations introduced by callbacks, and time flows along the vertical axis, making it easier to read and reason about the code line by line, demonstrating the benefits of using Observables in handling asynchronous operations.

## Binding Callbacks to Observables
- The subscriber of `obsBound` can define a function to process `cBInput`, which is similar to the callback function `cB(cBInput)`, and this function must be the last argument of `f` according to the convention applied.
- The `bindCallback` function transforms a regular function `f(x, cb)` into an [[Observable]], where the first argument of `f` becomes the value passed to the new function `fBound`, and the arguments used as parameters of the callback `cb` become the values emitted by the new Observable returned by `fBound`.
- `bindNodeCallback` is a variation of `bindCallback` that is based on the [[Node.js]] convention, where the callback function has an error parameter as the first parameter, and it can be used to create Observables from non-callback functions by wrapping the logic in a new function that expects a callback as the last argument.
- The `readLine` function can be transformed into an Observable using `bindCallback` by wrapping its logic in a new function `_readLines` that expects a callback as the last argument, allowing for the creation of an Observable that emits the lines read from a file.

## Comparative Analysis: Promises vs. Observables
- Asynchronous non-blocking processing can be complex, and while Promises and Futures have simplified some cases, they have limitations when dealing with event streams, making [[ReactiveX]] and Observables a powerful tool for handling such scenarios.
- The example use case can also be implemented using Promises, as shown in the provided code snippet, which demonstrates how to use `readDirPromise`, `readFilePromise`, and `writeLogPromise` to achieve the same result as the Observable-based implementation.




## Sources
- [website](https://www.freecodecamp.org/news/rxjs-and-node-8f4e0acebc7c/)
