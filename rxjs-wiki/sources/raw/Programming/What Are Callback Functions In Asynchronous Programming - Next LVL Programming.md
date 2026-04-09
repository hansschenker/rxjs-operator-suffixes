---
title: What Are Callback Functions In Asynchronous Programming? - Next LVL Programming
tags:
  - "Programming"
createdAt: Mon Sep 29 2025 10:02:43 GMT+0200 (Central European Summer Time)
updatedAt: Mon Sep 29 2025 10:02:51 GMT+0200 (Central European Summer Time)
---


Detailed summary

- Callback functions in asynchronous programming are functions that are passed as arguments to other functions, expected to be executed at a certain point, usually after a specific task is completed, such as fetching data from a server or reading files, which is especially common in programming languages like [[JavaScript]] and [[TypeScript]] [(00:00:23)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=23s).
- In synchronous programming, each line of code runs one after the other, which means that if one line takes a long time, the whole program waits, but asynchronous programming changes this by allowing the code to keep running while waiting for those longer tasks to finish, with callbacks being essential for managing these asynchronous operations [(00:00:44)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=44s).
- When using a callback, the program is essentially told what to do once an operation is finished, such as getting user data from a server, where a function is written to initiate the request and another function is passed as an argument to be called when the data is ready [(00:01:13)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=73s).
- An example of using a callback function can be seen in JavaScript, where a function called "fetchData" is used to simulate a delay, like waiting for a network request, and after the delay, the callback function provided will run, allowing the fetched data to be worked with [(00:01:28)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=88s).
- Callbacks are also widely used in event handling, such as when a user clicks a button, and are useful for fail operations and database queries where waiting for a result without stopping the program is necessary, but using many nested callbacks can make the code hard to read, leading to a situation often referred to as "callback hell" [(00:02:19)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=139s).
- To make asynchronous code more manageable, newer programming patterns like promises and async/await have become popular in JavaScript and TypeScript, helping to structure the code more clearly and avoid the complexity of nested callbacks [(00:02:42)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=162s).
- Understanding callback functions is key to mastering asynchronous programming in languages like [[JavaScript]] and [[TypeScript]], where handling user interactions and network requests is a common task, and callback functions allow specifying actions that occur after an operation completes [(00:03:12)](https://www.youtube.com/watch?v=67DTSIhN8lU&t=192s).


A callback function is like the toke you get from the barita at the desk that takes orders from the clients and hands these orders to the backoffice

Message: ### Analogy: Callback Function as a Token from a Barista

A **callback function** can be compared to the token you receive from a barista when you place an order at a coffee shop:

- **Barista (Front Desk):** Takes the customer's order and gives them a token.
- **Token (Callback Function):** Represents the promise that the order will be processed and fulfilled.
- **Back Office (Calling System):** Receives the token and processes the order in the background.
- **When the order is ready,** the back office uses the token to notify the customer or deliver the order.
In this analogy:

- The token is like the callback function you pass to an asynchronous operation.
- The barista initiates the process (starts the asynchronous task).
- The back office processes the task (performs the operation).
- When the task is complete, the callback function (token) is "called back" to handle the result or notify that the task is done.
This helps explain how callbacks allow programs to continue running without waiting, and then respond once the task finishes.

This analogy is explained at timestamp [(00:06:00)](https://www.youtube.com/watch?v=67DTSIhN8lU).





## Sources
- [website](https://www.youtube.com/watch?v=67DTSIhN8lU)
