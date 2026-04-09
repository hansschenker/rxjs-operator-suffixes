---
title: Iterators and generators - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:46:23 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:46:32 GMT+0200 (Central European Summer Time)
---


Detailed summary

- In [[JavaScript]], an iterator is an object that defines a sequence and a potential return value when it terminates, and it must implement the Iterator protocol by having a next() method that returns an object with two properties: value and done.
- The value property represents the next value in the iteration sequence, while the done property is true if the last value in the sequence has already been consumed, and if a value is present alongside done, it is the iterator's return value.
- Iterators can be iterated over explicitly by repeatedly calling the next() method, but iterating over an iterator is said to consume it, and it is generally only possible to do once, after which additional calls to next() will continue to return {done: true}.
- The most common iterator in JavaScript is the Array iterator, which returns each value in the associated array in sequence, but iterators can express sequences of unlimited size, such as the range of integers between 0 and Infinity.
- Generator functions provide a powerful alternative to custom iterators, allowing you to define an iterative algorithm by writing a single function whose execution is not continuous, and they are written using the function* syntax.
- When called, generator functions return a special type of iterator called a Generator, which executes until it encounters the yield keyword when a value is consumed by calling the generator's next method.
- An object is iterable if it defines its iteration behavior, such as what values are looped over in a for...of construct, and it must implement the Symbol.iterator method to be iterable.
- Iterables can be iterated over more than once or only once, depending on their implementation, and built-in types like Array, Map, and Set are all iterables because their prototype objects have a Symbol.iterator method.
- User-defined iterables can be created by implementing the Symbol.iterator method, and they can be used in for...of loops or the spread syntax like built-in iterables.
- Advanced generators can compute their yielded values on demand, allowing them to efficiently represent sequences that are expensive to compute or even infinite sequences, and the next() method can also accept a value to modify the internal state of the generator.
- Generators have a throw() method that can be used to force a generator to throw an exception, and a return() method that returns a given value and finishes the generator itself, and a value passed to the first invocation of next() is always ignored.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_generators)
