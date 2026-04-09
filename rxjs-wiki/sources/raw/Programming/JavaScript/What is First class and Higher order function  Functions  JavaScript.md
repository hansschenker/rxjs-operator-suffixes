---
title: What is First class and Higher order function | Functions | JavaScript
tags:
  - "Programming/JavaScript"
createdAt: Tue Feb 10 2026 09:53:34 GMT+0100 (Central European Standard Time)
updatedAt: Tue Feb 10 2026 09:53:49 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Intro [(00:00:00)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=0s)
- First class functions and higher order functions are terms used to describe functions in [[JavaScript]] that behave differently than functions in other programming languages, with the key characteristic being that a function is treated like any other value [(00:00:00)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=0s).
- In JavaScript, a function is considered an object, allowing it to be created like any other value, which is a fundamental aspect of what makes a function a first class function [(00:00:24)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=24s).
- The concept of first class functions is based on the idea that functions can be treated as objects, enabling them to be created and used in a flexible manner, similar to other values in JavaScript [(00:00:32)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=32s).

## First class function [(00:00:43)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=43s)
- A programming language is said to have first-class functions if functions in that language are treated like any other value, allowing them to be assigned to a variable, passed as an argument to another function, and returned from another function, which is the case in JavaScript [(00:00:43)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=43s).
- In [[JavaScript]], a function is a first-class function, meaning it can be assigned to a variable, passed as an argument to another function, and returned from another function, similar to how other values are treated in the language [(00:01:16)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=76s).
- To demonstrate that a function is an object in JavaScript, an example is provided where a simple function called "greetings" is created, and then a property called "lang" is added to it, which can be logged to the console, proving that functions can have properties like other objects [(00:01:35)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=95s).
- Adding properties to a function object is possible in JavaScript, but it is considered a harmful practice and should be avoided, as it can lead to confusion and errors, and instead, separate objects should be used for storing additional data [(00:02:49)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=169s).
- The ability to add properties to a function and treat it like any other object is a key characteristic of first-class functions in JavaScript, and this concept will be further explored with examples [(00:02:56)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=176s).

## First class examples [(00:03:12)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=192s)
- In [[JavaScript]], a function can be assigned to a variable because it is treated as another value, and this is demonstrated through a function expression where an anonymous function is assigned to a variable [(00:03:12)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=192s).
- The syntax of assigning a function to a variable is referred to as a function expression, and it allows for the assignment of an anonymous function to a variable, which has already been discussed [(00:03:25)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=205s).
- An example is provided with the `getResultArray` function and the `calculateEdge` function, where the `calculateEdge` function is passed as an argument to the `getResultArray` function, showcasing that a function can be passed as an argument to another function [(00:03:40)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=220s).
- This is possible because in JavaScript, a function is a first-class function, meaning it can be treated like any other value, allowing it to be passed as an argument to another function [(00:03:58)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=238s).
- As a result of being a first-class function, a function can not only be passed as an argument to another function but also returned as a value from another function, similar to how other values are passed or returned [(00:04:06)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=246s).

## Return from within a function [(00:04:18)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=258s)
- In [[JavaScript]], a function can return another function from within it, as demonstrated by the `interviewQuestion` function, which returns an anonymous function, and this is possible because JavaScript functions are first-class functions, meaning they are treated as values [(00:04:18)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=258s).
- Since functions in JavaScript are first-class functions, they can be assigned to a variable, passed as an argument, and returned from within a function, just like any other value, as shown in the example where the `discrete` function is assigned to the `message` variable [(00:04:50)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=290s).
- When a function is created, its definition is stored in the heap memory because functions are reference types, and the name given to the function acts as an identifier that stores a reference to the memory address where the function definition is stored, as explained in the example with the `discrete` function [(00:05:30)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=330s).
- When a function is assigned to a variable, the variable stores a reference to the memory address where the function definition is stored, allowing the function to be executed when parentheses are used on the variable, as demonstrated with the `message` variable [(00:06:16)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=376s).
- Functions can be passed as arguments to other functions, and when this happens, the reference stored in the identifier of the passed function is assigned to a new identifier in the receiving function, enabling the passed function to be executed within the receiving function, as shown in the example with the `getResult` and `calculateAge` functions [(00:06:54)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=414s).
- A function can return an anonymous function, which is stored in the heap memory, and the reference to this anonymous function is stored in a variable, allowing the anonymous function to be executed when parentheses are used on the variable, as demonstrated with the `greet` function [(00:08:11)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=491s).
- The concept of higher-order functions is introduced, which will be discussed further, but the key point is that functions in [[JavaScript]] are reference types that get stored in heap memory, and when a function is stored in a variable, the variable stores the reference to the memory address where the function is stored [(00:09:39)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=579s).

## Higher order function [(00:09:44)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=584s)
- A higher order function is a function that operates on other functions, either by taking them as an argument or by returning them, and this definition applies to functions that receive a function as an argument or return a function as output, or do both [(00:09:44)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=584s).
- The `get_result_array` function is an example of a higher order function because it takes another function, `calculate_h`, as its parameter, demonstrating that when a function takes another function as its argument, it is considered a higher order function [(00:10:08)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=608s).
- A function can also be considered a higher order function when it returns another function from within itself, as seen in the `interview_question` function, which returns an anonymous function, making it a higher order function [(00:10:35)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=635s).
- Assigning a function to a variable does not make the function a higher order function, as a function is only considered a higher order function when it takes a function as its argument or returns a function from within itself, or does both [(00:11:04)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=664s).
- To be classified as a higher order function, a function must meet specific criteria, such as taking a function as an argument or returning a function, and simply assigning a function to a variable does not meet these criteria [(00:11:16)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=676s).

## Summary [(00:11:31)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=691s)
- Higher-order functions are possible due to the presence of first-class functions in a programming language, meaning that if a language supports first-class functions, it also supports higher-order functions [(00:11:31)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=691s).
- Examples of higher-order functions in [[JavaScript]] include filter, reduce, map, and forEach, as they take another function as an argument, and these functions will be explored in detail to demonstrate how they take a callback function as an argument [(00:11:48)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=708s).
- First-class functions and higher-order functions are not the same thing, with first-class functions being a concept that a programming language either supports or does not, while higher-order functions are a more practical approach that is supported by a language if it supports first-class functions [(00:12:15)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=735s).
- The presence of first-class functions implies the presence of higher-order functions, but the presence of higher-order functions does not necessarily imply the presence of first-class functions, and higher-order functions have the added ability to receive and return other functions as arguments and output [(00:12:33)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=753s).
- In future lectures, the topics of passing a function as an argument to another function and returning a function from within another function will be covered [(00:13:06)](https://www.youtube.com/watch?v=RIlfITk-xKw&t=786s).




## Sources
- [website](https://www.youtube.com/watch?v=RIlfITk-xKw)
