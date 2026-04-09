---
title: AsyncGenerator - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:47:58 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:48:04 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The [[AsyncGenerator]] constructor does not have a direct [[JavaScript]] entity, and instances of AsyncGenerator must be returned from async generator functions, which are often stylized as AsyncGenerator.prototype to make it look like a class.
- The AsyncGenerator.prototype is a hidden object that is the prototype object shared by all objects created by async generator functions, and it is more appropriately called AsyncGeneratorFunction.prototype.prototype because AsyncGeneratorFunction is an actual JavaScript entity.
- The instance properties of AsyncGenerator are defined on AsyncGenerator.prototype and shared by all AsyncGenerator instances, including AsyncGenerator.prototype.constructor, which is the constructor function that created the instance object, and AsyncGenerator.prototype[Symbol.toStringTag], which has an initial value of the string "AsyncGenerator".
- AsyncGenerator instances do not store a reference to the async generator function that created them, and they inherit instance methods from their parent AsyncIterator, including AsyncGenerator.prototype.next(), which returns a Promise that will be resolved with the given value yielded by the yield expression.
- The AsyncGenerator.prototype.return() method acts as if a return statement is inserted in the generator's body at the current suspended position, allowing the generator to perform any cleanup tasks when combined with a try...finally block, while the AsyncGenerator.prototype.throw() method acts as if a throw statement is inserted in the generator's body at the current suspended position, informing the generator of an error condition and allowing it to handle the error or perform cleanup and close itself.
- The async generator iteration can be performed using a for await...of loop, which automatically resolves Promises yielded by the async generator, and examples of async generator iteration can be found in the documentation, along with specifications and browser compatibility information.
- The [[AsyncGenerator]] is related to other concepts such as function*, async function*, function* expression, Generator Function, and Async Generator Function, and more information can be found in the Iterators and generators guide.
- The specification for AsyncGenerator objects can be found in the [[JavaScript | ECMAScript]] 2026 Language Specification, and additional resources and information are available in the documentation and related links.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AsyncGenerator)
