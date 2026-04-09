---
title: 100+ JavaScript Concepts you Need to Know
tags:
  - "Programming/JavaScript"
createdAt: Tue Feb 10 2026 08:52:02 GMT+0100 (Central European Standard Time)
updatedAt: Tue Feb 10 2026 08:52:14 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to JavaScript
- [[JavaScript]] is a programming language that can be both wonderful and horrible to learn for beginners, as it allows for building almost anything and getting a job anywhere with mastery, but is also surrounded by a complex landscape of frameworks and libraries [(00:00:00)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=0s).
- The language was created in 1993 by [[Brendan Eich]] at [[Netscape]], with the goal of making websites interactive, and has since become arguably the most popular language in the world, with its standard implementation being called [[ECMAScript]] [(00:00:40)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=40s).
- JavaScript is a scripting language that can be executed on the fly, and is interpreted line by line, but is also converted to machine code by the V8 engine in browsers, making it run extremely fast [(00:01:27)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=87s).
- To use JavaScript on a web page, an HTML document is needed, with a script tag that can contain code directly or reference an external file, and the console.log function can be used to print output to the standard output [(00:01:56)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=116s).

## Variables and Data Types
- Variables in [[JavaScript]] can be defined using let, const, or var, with let being the most common method today, and the language is dynamically typed, meaning no data type annotations are necessary [(00:02:19)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=139s).
- The language has seven primitive data types, including numbers, and variables can be reassigned later without needing to specify a data type, with undefined being the default value if no assignment is made [(00:02:25)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=145s).
- Semicolons are technically optional in JavaScript, as the parser will add them automatically if they are left out, but their use is a topic of debate among developers [(00:03:01)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=181s).
- Const is used for variables that cannot be reassigned later, and var is the original way to declare a variable, but its use is not recommended [(00:03:18)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=198s).
- JavaScript has various ways to define variables, which is related to the lexical environment that determines the scope of variables, including Global scope, where variables are available everywhere, and local scope, where variables are defined inside a function and cannot be used outside of it [(00:03:35)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=215s).
- Variables can also be scoped inside a block or statement, such as an if condition, unless the VAR keyword is used, which is not block scope and can cause variables to be hoisted up into the local scope [(00:03:45)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=225s).

## Functions and Scope
- Functions are one of the main building blocks in [[JavaScript]], and they work by taking an input or argument and optionally returning a value that can be used somewhere else, and they can be used as expressions, allowing them to be used as variables or to construct higher-order functions [(00:04:01)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=241s).
- Functions can be nested to create a closure that encapsulates data and logic from the rest of the program, and when a closure is created, the inner function can still access variables in the outer function even after the initial function call [(00:04:26)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=266s).

## The 'this' Keyword and Function Arguments
- The "this" keyword references an object based on how a function is called, and it can be manually bound to an object using the bind method, but arrow functions do not have their own "this" value and are always anonymous [(00:05:00)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=300s).
- When passing arguments to a function, primitive values are passed by value, while objects are passed by reference, which means multiple parts of the code might be mutating the same object [(00:05:28)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=328s).

## Objects and Object-Oriented Programming
- Objects can be defined using the object literal syntax or created with a constructor using the new keyword, and they contain a collection of key-value pairs or properties and values, with the ability to inherit properties from each other through the prototype chain [(00:05:46)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=346s).
- [[JavaScript]] supports object-oriented programming with a class keyword, but classes are just syntactic sugar for prototypal inheritance and objects, and they can define a constructor, properties, and methods, as well as create getters and setters to access properties [(00:06:21)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=381s).

## Data Structures in JavaScript
- JavaScript has built-in data structures such as arrays for holding dynamic collections of indexed items, sets for holding collections of unique items, and maps for holding key-value pairs, which can be more easily looped over than objects [(00:06:51)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=411s).
- JavaScript is garbage collected, meaning it automatically deallocates objects from memory when they are no longer referenced, but maps and sets can prevent this if all properties are always referenced, which is where weak maps and weak sets come in to reduce memory usage [(00:07:03)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=423s).

## The Event Loop and Asynchronous Programming
- The non-blocking event Loop is one of JavaScript's most interesting features, allowing synchronous code to run in a separate threadpool while the rest of the application continues to execute, which is important for modern websites with multiple tasks running at the same time [(00:07:25)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=445s).
- The event Loop enables asynchronous code, which is necessary for multitasking, and can be demonstrated using set timeout, which takes a function as an argument and calls it back later when it's ready to execute on the main thread [(00:07:31)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=451s).
- Callback functions are common in asynchronous code, but can lead to "callback hell" when overused and deeply nested, which is where promises come in as a wrapper for unknown values that will resolve to a value in the future [(00:08:04)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=484s).
- Promises can be used with methods like then and catch to handle possible outcomes, and async functions can be defined to automatically return a promise, allowing for readable code with the await keyword to wait for other promises to resolve [(00:08:20)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=500s).

## Modules, Package Managers, and Code Organization
- Error handling can be implemented using try-catch blocks, and as code grows in complexity, modules can be used to share code between files, with default exports and import statements allowing for code reuse [(00:08:44)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=524s).
- [[JavaScript]] package managers like [[Npm | npm]] allow for the installation of packages and management of dependencies, with the [[Node.js | node]] modules folder and package Json file keeping track of dependencies used in a project [(00:09:27)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=567s).

## DOM Manipulation and Front-End Development
- When building a website, the code runs in the browser, which is based on the document object model, representing the UI as a tree of HTML elements or nodes, with the document object providing APIs to interact with these nodes, including the query selector method [(00:09:44)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=584s).
- JavaScript returns an instance of the element class when using the same class name, ID, or tag name, which has various properties and methods to get information or change its behavior [(00:10:10)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=610s).
- Multiple elements can be grabbed at the same time using querySelectorAll, and events that happen to elements can be listened to with addEventListener, allowing a function to be assigned that will be called when the event takes place [(00:10:21)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=621s).
- Much of web development involves listening to events and updating the UI accordingly, but many developers dislike vanilla [[JavaScript]] because it results in imperative code, leading them to use front-end frameworks that produce declarative code [(00:10:31)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=631s).

## Front-End Frameworks and Declarative UI
- Front-end frameworks like React encapsulate JavaScript, HTML, and CSS into components, forming a component tree to represent the UI, and data inside a component is reactive, allowing the UI to be updated automatically when data changes [(00:10:48)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=648s).

## JavaScript Bundling and Performance Optimization
- After building a complete [[JavaScript]] app, a module bundler like [[Webpack]] is needed to combine all JavaScript files into a single bundle, but this can result in a large file that affects page load performance [(00:11:07)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=667s).
- The JavaScript bundle can be split into multiple files and used with Dynamic Imports to only import the necessary code when it is needed, improving page load performance [(00:11:29)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=689s).

## Server-Side JavaScript and Full-Stack Development
- JavaScript can run on the server using [[Node.js]], allowing for the execution of JavaScript code and the creation of full-stack desktop apps with frameworks like [[Electron (software framework) | Electron]], or iOS and Android apps with [[React Native]] [(00:11:40)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=700s).

## Tools for Code Quality and Static Analysis
- Tools like [[TypeScript]] or ESLint can be used to improve code quality by performing static analysis, making it easier to work with [[JavaScript]] [(00:11:58)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=718s).


Detailed summary


## Introduction to JavaScript
- [[JavaScript]] is a programming language that can be both wonderful and horrible to learn for beginners, as it allows for building almost anything and getting a job anywhere with mastery, but is also surrounded by a complex landscape of frameworks and libraries [(00:00:00)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=0s).
- The language was created in 1993 by [[Brendan Eich]] at [[Netscape]], with the goal of making websites interactive, and has since become arguably the most popular language in the world, with its standard implementation being called [[ECMAScript]] [(00:00:40)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=40s).
- JavaScript is a scripting language that can be executed on the fly, and is interpreted line by line, but is also converted to machine code by the V8 engine in browsers, making it run extremely fast [(00:01:27)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=87s).
- To use JavaScript on a web page, an HTML document is needed, with a script tag that can contain code directly or reference an external file, and the console.log function can be used to print output to the standard output [(00:01:56)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=116s).

## Variables and Data Types
- Variables in [[JavaScript]] can be defined using let, const, or var, with let being the most common method today, and the language is dynamically typed, meaning no data type annotations are necessary [(00:02:19)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=139s).
- The language has seven primitive data types, including numbers, and variables can be reassigned later without needing to specify a data type, with undefined being the default value if no assignment is made [(00:02:25)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=145s).
- Semicolons are technically optional in JavaScript, as the parser will add them automatically if they are left out, but their use is a topic of debate among developers [(00:03:01)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=181s).
- Const is used for variables that cannot be reassigned later, and var is the original way to declare a variable, but its use is not recommended [(00:03:18)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=198s).
- JavaScript has various ways to define variables, which is related to the lexical environment that determines the scope of variables, including Global scope, where variables are available everywhere, and local scope, where variables are defined inside a function and cannot be used outside of it [(00:03:35)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=215s).
- Variables can also be scoped inside a block or statement, such as an if condition, unless the VAR keyword is used, which is not block scope and can cause variables to be hoisted up into the local scope [(00:03:45)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=225s).

## Functions and Scope
- Functions are one of the main building blocks in [[JavaScript]], and they work by taking an input or argument and optionally returning a value that can be used somewhere else, and they can be used as expressions, allowing them to be used as variables or to construct higher-order functions [(00:04:01)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=241s).
- Functions can be nested to create a closure that encapsulates data and logic from the rest of the program, and when a closure is created, the inner function can still access variables in the outer function even after the initial function call [(00:04:26)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=266s).

## The 'this' Keyword and Function Arguments
- The "this" keyword references an object based on how a function is called, and it can be manually bound to an object using the bind method, but arrow functions do not have their own "this" value and are always anonymous [(00:05:00)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=300s).
- When passing arguments to a function, primitive values are passed by value, while objects are passed by reference, which means multiple parts of the code might be mutating the same object [(00:05:28)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=328s).

## Objects and Object-Oriented Programming
- Objects can be defined using the object literal syntax or created with a constructor using the new keyword, and they contain a collection of key-value pairs or properties and values, with the ability to inherit properties from each other through the prototype chain [(00:05:46)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=346s).
- [[JavaScript]] supports object-oriented programming with a class keyword, but classes are just syntactic sugar for prototypal inheritance and objects, and they can define a constructor, properties, and methods, as well as create getters and setters to access properties [(00:06:21)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=381s).

## Data Structures in JavaScript
- JavaScript has built-in data structures such as arrays for holding dynamic collections of indexed items, sets for holding collections of unique items, and maps for holding key-value pairs, which can be more easily looped over than objects [(00:06:51)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=411s).
- JavaScript is garbage collected, meaning it automatically deallocates objects from memory when they are no longer referenced, but maps and sets can prevent this if all properties are always referenced, which is where weak maps and weak sets come in to reduce memory usage [(00:07:03)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=423s).

## The Event Loop and Asynchronous Programming
- The non-blocking event Loop is one of JavaScript's most interesting features, allowing synchronous code to run in a separate threadpool while the rest of the application continues to execute, which is important for modern websites with multiple tasks running at the same time [(00:07:25)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=445s).
- The event Loop enables asynchronous code, which is necessary for multitasking, and can be demonstrated using set timeout, which takes a function as an argument and calls it back later when it's ready to execute on the main thread [(00:07:31)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=451s).
- Callback functions are common in asynchronous code, but can lead to "callback hell" when overused and deeply nested, which is where promises come in as a wrapper for unknown values that will resolve to a value in the future [(00:08:04)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=484s).
- Promises can be used with methods like then and catch to handle possible outcomes, and async functions can be defined to automatically return a promise, allowing for readable code with the await keyword to wait for other promises to resolve [(00:08:20)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=500s).

## Modules, Package Managers, and Code Organization
- Error handling can be implemented using try-catch blocks, and as code grows in complexity, modules can be used to share code between files, with default exports and import statements allowing for code reuse [(00:08:44)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=524s).
- [[JavaScript]] package managers like [[Npm | npm]] allow for the installation of packages and management of dependencies, with the [[Node.js | node]] modules folder and package Json file keeping track of dependencies used in a project [(00:09:27)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=567s).

## DOM Manipulation and Front-End Development
- When building a website, the code runs in the browser, which is based on the document object model, representing the UI as a tree of HTML elements or nodes, with the document object providing APIs to interact with these nodes, including the query selector method [(00:09:44)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=584s).
- JavaScript returns an instance of the element class when using the same class name, ID, or tag name, which has various properties and methods to get information or change its behavior [(00:10:10)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=610s).
- Multiple elements can be grabbed at the same time using querySelectorAll, and events that happen to elements can be listened to with addEventListener, allowing a function to be assigned that will be called when the event takes place [(00:10:21)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=621s).
- Much of web development involves listening to events and updating the UI accordingly, but many developers dislike vanilla [[JavaScript]] because it results in imperative code, leading them to use front-end frameworks that produce declarative code [(00:10:31)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=631s).

## Front-End Frameworks and Declarative UI
- Front-end frameworks like React encapsulate JavaScript, HTML, and CSS into components, forming a component tree to represent the UI, and data inside a component is reactive, allowing the UI to be updated automatically when data changes [(00:10:48)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=648s).

## JavaScript Bundling and Performance Optimization
- After building a complete [[JavaScript]] app, a module bundler like [[Webpack]] is needed to combine all JavaScript files into a single bundle, but this can result in a large file that affects page load performance [(00:11:07)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=667s).
- The JavaScript bundle can be split into multiple files and used with Dynamic Imports to only import the necessary code when it is needed, improving page load performance [(00:11:29)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=689s).

## Server-Side JavaScript and Full-Stack Development
- JavaScript can run on the server using [[Node.js]], allowing for the execution of JavaScript code and the creation of full-stack desktop apps with frameworks like [[Electron (software framework) | Electron]], or iOS and Android apps with [[React Native]] [(00:11:40)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=700s).

## Tools for Code Quality and Static Analysis
- Tools like [[TypeScript]] or ESLint can be used to improve code quality by performing static analysis, making it easier to work with [[JavaScript]] [(00:11:58)](https://www.youtube.com/watch?v=lkIFF4maKMU&t=718s).




## Sources
- [website](https://www.youtube.com/watch?v=lkIFF4maKMU)
