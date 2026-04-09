---
title: Generator - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:39:31 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:39:40 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The Generator constructor in [[JavaScript]] does not have a corresponding entity, and instances of Generator must be returned from generator functions, with all objects created by generator functions sharing a hidden prototype object often referred to as Generator.prototype.
- Generator instances have several properties defined on Generator.prototype, including Generator.prototype.constructor, which is the constructor function that created the instance object, and Generator.prototype[Symbol.toStringTag], which has an initial value of the string "Generator" used in Object.prototype.toString().
- Generator instances also have several methods, including Generator.prototype.next(), which returns a value yielded by the yield expression, Generator.prototype.return(), which acts as if a return statement is inserted in the generator's body at the current suspended position, and Generator.prototype.throw(), which acts as if a throw statement is inserted in the generator's body at the current suspended position.
- Generator instances inherit instance methods from their parent Iterator, and they do not store a reference to the generator function that created them, with their prototype chain being understood through [[GeneratorFunction]].prototype.prototype.
- The use of generator functions allows for the definition of potentially infinite data structures, as values are not evaluated until they are needed, making generators useful for creating infinite iterators.
- The Generator object is specified in the ECMAScript 2026 Language Specification, and its compatibility can be checked in different browsers, with related topics including function*, function* expression, GeneratorFunction, and iteration protocols.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
