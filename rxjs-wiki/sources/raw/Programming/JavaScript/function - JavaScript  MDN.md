---
title: function* - JavaScript | MDN
tags:
  - "Programming/JavaScript"
createdAt: Tue Sep 30 2025 12:40:24 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 12:40:27 GMT+0200 (Central European Summer Time)
---


Detailed summary

- The function* declaration in [[JavaScript]] creates a GeneratorFunction object, which returns a new Generator object conforming to the iterator protocol every time it is called, allowing for the creation of multiple generators simultaneously, each maintaining its own execution context.
- A generator function's execution is suspended at a specific point, initially at the beginning of the function body, and control flow can be transferred between the generator function and its caller using methods such as next(), throw(), and return(), as well as yield and yield* expressions.
- When the generator's next() method is called, the function body is executed until a yield expression is encountered, at which point the next() method returns an object with a value property containing the yielded value and a done property set to false.
- The yield* expression is used to delegate to another iterator, and any future calls to next() on the generator are equivalent to calling next() on the delegated iterator until it is finished.
- A return statement or the end of the control flow in a generator function results in the next() method returning an object with a value property containing the returned value and a done property set to true, indicating that the generator is finished.
- The throw() and return() methods of a generator can be used to insert a throw or return statement at the current suspended position in the generator's body, usually finishing the generator unless caught by a try...catch...finally block.
- Generators were previously used for asynchronous programming, but have largely been replaced by async functions and Promises, and are now primarily used for defining iterators and other tasks, such as generating sequences or cooperating with other coroutines.
- Function* declarations behave similarly to function declarations, being hoisted to the top of their scope and callable anywhere within that scope, and can be redeclared in certain contexts, but generators are not constructable and cannot be used with the new keyword.
- Examples of using generators include basic usage, yield* expressions, passing arguments into generators, return statements in generators, and using generators as object properties or methods, demonstrating their versatility and utility in a variety of situations.
- The [[JavaScript | ECMAScript]] 2026 Language Specification provides the official definition of generator function definitions, and browser compatibility information is available for developers to ensure cross-browser support.
- Additional resources, such as the Functions guide, Iterators and generators guide, and related specifications, provide further information and examples for working with generators in JavaScript, including Regenerator on GitHub, Promises and Generators presentations, and Task.js on GitHub, as well as the book "You Don't Know JS: Async & Performance" by Kyle Simpson.




## Sources
- [website](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*)
