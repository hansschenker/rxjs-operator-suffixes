---
title: Array.from() - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 13:11:48 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 13:11:59 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The [[Array.from()]] method in JavaScript is used to create a new Array instance from an iterable or array-like object, allowing for the conversion of various objects such as Map and Set into arrays.
- The method takes two parameters: the items parameter, which is the iterable or array-like object to be converted, and the optional mapFn parameter, which is a function that can be called on every element of the array to transform its values.
- When using the mapFn parameter, it is called with two arguments: the current element being processed and its index in the array, and it can also take an optional thisArg parameter to specify the value of this during the execution of the map function.
- Array.from() never creates a sparse array, meaning that if the items object is missing some index properties, the resulting array will have undefined values at those positions.
- The method has the same signature as TypedArray.from() and is implemented as a generic factory method, allowing it to be inherited by subclasses of Array and to return instances of the subclass instead of Array instances.
- Array.from() can be used to convert various types of objects to arrays, including strings, Sets, Maps, NodeLists, and array-like objects, and it can also be used with arrow functions to create arrays in a concise way.
- The method can be called on any constructor function that accepts a single argument representing the length of the new array, and if the this value is not a constructor function, a plain Array object is returned.
- The [[Array.from()]] method is specified in the [[ECMAScript]] 2026 Language Specification and is supported by most modern browsers, with polyfills available for older browsers that do not support the method.
- Related methods and functions include Array.fromAsync(), Array.prototype.map(), TypedArray.from(), and the Array() and Array.of() constructors, which can be used in conjunction with Array.from() to create and manipulate arrays in JavaScript.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from)
