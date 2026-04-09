---
title: Iterator - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:41:07 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:41:13 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Introduction to Iterators
- The [[JavaScript]] language has several built-in iterators, including the Array [[Iterator]], String Iterator, Map Iterator, Set Iterator, RegExp String Iterator, Generator object, and Segments Iterator, each with its own distinct prototype object that defines the next() method used by the particular iterator.
- Web APIs can also return iterators, with some reusing core JavaScript iterators and others defining their own iterators, such as Array-Like objects like NodeList and Map-Like objects like Headers, which return their own iterator types like Headers Iterator.
- Each iterator prototype has a [Symbol.toStringTag] property with a unique value, such as "String Iterator" for StringIteratorPrototype, and all prototype objects inherit from Iterator.prototype, which provides a Symbol.iterator method that returns the iterator object itself.
- Iterator helper methods, such as Iterator.prototype.filter() and Iterator.prototype.map(), are provided by the Iterator class and can be used to work with iterators in a more efficient way, especially with infinite iterators, where converting the iterator to an array is not possible.

## Iterator Helper Methods and Objects
- The [[Iterator]] class provides several helper methods that are analogous to array methods, including Iterator.prototype.every(), Iterator.prototype.find(), Iterator.prototype.forEach(), Iterator.prototype.map(), Iterator.prototype.reduce(), and Iterator.prototype.some(), which can be used to perform common operations on iterators.
- Additionally, Iterator.prototype.drop() and Iterator.prototype.take() can be combined to achieve similar results to Array.prototype.slice(), allowing for more flexible and efficient iteration over iterators.
- Iterator helper objects are a separate concept from iterator helper methods and can be detected at runtime, providing a way to work with iterators in a more comprehensive and efficient manner.
- The Iterator helper in [[JavaScript]] refers to either an object or a method, depending on the context, and it is also an instance of the Iterator class, making its methods chainable, with methods like filter(), flatMap(), map(), drop(), and take() returning a new Iterator Helper object.
- The iterator helper objects inherit from a common prototype object that implements the iterator protocol, including the next() and return() methods, and share the same data source as the underlying iterator, meaning iterating the iterator helper causes the underlying iterator to be iterated as well.
- There are two kinds of iterators: objects that conform to the iterator protocol, which requires a next() method, and objects that inherit from the Iterator class, which provides helper methods, but does not automatically make an object an iterator, as it needs to define its own next() method.
- A proper [[Iterator | iterator]] is one that both conforms to the iterator protocol and inherits from the Iterator class, and most code expects iterators to be proper iterators and iterables to return proper iterators, which can be created by defining a class that extends Iterator or using the Iterator.from() method.

## Iterator Class and Related Topics
- The Iterator class has several static and instance methods, including Iterator.from(), which creates a new Iterator object from an iterator or iterable object, and instance methods like drop(), every(), filter(), find(), flatMap(), forEach(), map(), reduce(), some(), take(), and toArray(), which provide various ways to manipulate and interact with the iterator.
- The Iterator prototype has several properties, including constructor, which is the function that created the instance object, and Symbol.toStringTag, which is used in Object.prototype.toString() and has an initial value of "Iterator", and is writable for web compatibility reasons.
- The Iterator prototype also has several instance methods that implement the disposable protocol, such as Symbol.dispose(), which calls the return() method of the iterator, and Symbol.iterator(), which returns the iterator object itself, allowing it to be iterable.
- The section from the document '[[Iterator]] - [[JavaScript]] | MDN' provides information on the usage and specifications of iterators in JavaScript, including their compatibility with different browsers.
- It is mentioned that all built-in iterators are also iterable, which allows them to be used in a for...of loop, highlighting their versatility in various programming scenarios.
- The document references the ECMAScript 2026 Language Specification, specifically section 'sec-%iteratorprototype%-object', as a specification for iterators, indicating that the information is based on standardized guidelines.
- Additionally, the section points to resources for polyfills, including core-js and es-shims, which provide support for iterators and associated helpers in environments where they may not be natively supported.
- The document also mentions 'function*' and 'iteration protocols' as related topics, suggesting that these concepts are relevant to understanding and working with iterators in JavaScript.
- Furthermore, the section includes a note on browser compatibility, directing readers to a separate resource for information on how iterators are supported across different browsers, which is crucial for ensuring cross-browser compatibility in web development projects.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator)
