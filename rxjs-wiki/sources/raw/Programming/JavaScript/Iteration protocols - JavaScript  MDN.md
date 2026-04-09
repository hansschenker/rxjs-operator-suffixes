---
title: Iteration protocols - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:40:32 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:40:34 GMT+0200 (Central European Summer Time)
---


Detailed summary


## The Iterable Protocol
- The iterable protocol in [[JavaScript]] allows objects to define or customize their iteration behavior, such as the values looped over in a for...of construct, and to be iterable, an object must implement the Symbol.iterator method.
- The Symbol.iterator method is a zero-argument function that returns an object conforming to the [[Iterator | iterator]] protocol, which is used to obtain the values to be iterated, and this function can be an ordinary function or a generator function that returns an iterator object when invoked.

## The Iterator Protocol
- The iterator protocol defines a standard way to produce a sequence of values, either finite or infinite, and potentially a return value when all values have been generated, and an object is an iterator when it implements a next() method with specific semantics.
- The next() method is a function that accepts zero or one argument and returns an object conforming to the IteratorResult interface, which has two properties: done, a boolean indicating whether the iterator has completed its sequence, and value, the JavaScript value returned by the iterator.
- The IteratorResult interface is used to represent the result of an iterator, and it must have the done and value properties, although in practice, neither property is strictly required, and if an object without either property is returned, it is equivalent to { done: false, value: undefined }.
- In addition to the next() method, an [[Iterator | iterator]] can also implement the return(value) and throw(exception) methods, which are used to perform cleanup actions when the caller is done with iterating the iterator, and the return() method is called with a value to indicate that the caller does not intend to make any more next() calls.
- The throw(exception) method is used to indicate an error condition, and it is typically called with an Error instance as an argument, and it is a special feature of generators that allows for symmetry with the return() method.
- The return() and throw() methods are expected to return an object conforming to the IteratorResult interface, typically with done equal to true, and these methods are not enforced on the language level, but they provide a way for iterators to perform cleanup actions when necessary.

## Iterator and Iterable
- The iterator protocol in [[JavaScript]] cannot be reflectively determined, meaning it is not possible to know whether an object implements the iterator protocol without actually calling the `next()` method and validating the returned result.
- To make an [[Iterator | iterator]] also iterable, it is necessary to implement a `[Symbol.iterator]()` method that returns `this`, resulting in an object called an iterable iterator, which allows it to be consumed by various syntaxes expecting iterables.
- Almost all syntaxes and APIs in JavaScript expect iterables, not iterators, and the generator object is an example of an iterable iterator, while built-in iterators inherit from `Iterator.prototype`, which implements the `[Symbol.iterator]()` method as returning `this`.

## Async Iteration
- The async iterator and async iterable protocols are used for async iteration and have similar interfaces to the iterable and iterator protocols, except that each return value from the iterator methods is wrapped in a promise, with an object implementing the async iterable protocol when it implements the `[Symbol.asyncIterator]()` method.
- An object implements the async iterator protocol when it implements the `next()`, `return(value)`, and `throw(exception)` methods, which return promises that fulfill to an object conforming to the `IteratorResult` interface.

## Language Support for Iterables and Iterators
- The language specifies APIs that produce or consume iterables and iterators, including built-in iterables such as `String`, `Array`, `TypedArray`, `Map`, `Set`, and `Segments`, as well as the `arguments` object and some DOM collection types like `NodeList`.
- There is no object in the core [[JavaScript]] language that is async iterable by default, but some web APIs like `ReadableStream` have the [[Symbol.asyncIterator]] method set by default, and generator functions return generator objects, which are iterable iterators, while async generator functions return async generator objects, which are async iterable iterators.
- The iterators returned from built-in iterables inherit from a common class [[Iterator]], which implements the `[Symbol.iterator]()` method, making them iterable iterators, and provides additional helper methods beyond the `next()` method required by the iterator protocol.
- Many APIs in JavaScript accept iterables, and the iterators returned from built-in iterables can be inspected by logging their prototype chain in a graphical console, revealing the shared prototype chain among all built-in iterators.
- The section from the document 'Iteration protocols - JavaScript | MDN' provides information on various examples of iterables, including Map(), WeakMap(), Set(), WeakSet(), Promise.all(), Promise.allSettled(), Promise.race(), Promise.any(), Array.from(), Object.groupBy(), and Map.groupBy(), which are all capable of being iterated over in JavaScript.
- Certain syntaxes in JavaScript expect iterables, such as for...of loops, array and parameter spreading, yield*, and array destructuring, and when these syntaxes are iterating an iterator, the return method will be called if present when the iteration is prematurely stopped, allowing the iterator to perform any necessary cleanup.

## Error Handling
- Error handling is an important aspect of iteration, as errors can occur in both the [[Iterator | iterator]] and the consumer, and built-in syntaxes may throw errors if the iterable breaks certain invariants, such as not producing a valid iterator or not having a callable next() method.
- Non-well-formed iterables can cause errors when attempting to acquire the iterator, and these errors can be prevented by validating the iterable before attempting to iterate over it, but it is generally rare and usually allowed to propagate to the caller.
- Errors can also occur during iteration, such as when stepping the iterator by calling next(), and the language invariant enforced here is that the next() method must return an object, otherwise a TypeError is thrown, and if an error occurs, the iteration is aborted without retrying or cleanup.
- If the caller decides to exit iteration prematurely, it should call the return() method on the iterator, if one exists, to allow the iterator to perform any cleanup, and the return() method must return an object, throwing a TypeError otherwise, and if it throws an error, the error is propagated to the caller.
- The caller typically implements error handling when working with iterables, allowing catch blocks to handle errors thrown when an iterable is not valid, when next() or return() throws an error, or when the for loop body throws an error.
- Most iterators are implemented with generator functions, which can handle errors by either propagating them to the caller or catching them within the generator function, with the option to continue yielding values or exit early.
- Generator functions often use a finally block to ensure that open resources are properly closed, regardless of whether an error occurs or the loop exits early.
- Built-in syntaxes, such as [[Iterator]].from(), iterator helper methods (map(), filter(), take(), drop(), and flatMap()), yield*, and async iteration (for await...of, Array.fromAsync), wrap an iterator into another iterator and are responsible for forwarding errors between the inner iterator and the caller.

## Custom Iterables and Iteration Behavior
- Wrapper iterators typically directly forward the next() and return() methods of the inner iterator, with some exceptions, such as iterator helpers, which may return { done: true, value: undefined } if the return() method doesn't exist on the inner iterator.
- Users can define their own iterables using various methods, including basic iterators, infinite iterators, and iterables defined with a generator or a class, and state encapsulation can be achieved using closures or private fields.
- Overriding built-in iterables is possible by supplying a custom Symbol.iterator method, which can change the iteration behavior of built-in constructs that use the iteration protocol.
- Concurrent modifications during iteration can lead to unexpected behavior, as most iterables do not copy the data at the start of iteration, but instead keep a pointer and move it around, so adding, deleting, or modifying elements can affect the iteration process.
- Certain iterable implementations, such as Map, avoid this issue by using "tombstone" values to prevent shifting of remaining values, and users can implement similar solutions to avoid concurrent modification problems.
- It is generally recommended to avoid modifying a collection while iterating over it, unless the iterable's implementation is well understood, as concurrent modifications can be bug-prone and confusing.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)
