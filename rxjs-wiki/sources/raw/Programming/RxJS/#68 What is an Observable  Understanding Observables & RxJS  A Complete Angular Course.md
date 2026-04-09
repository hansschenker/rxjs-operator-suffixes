---
title: #68 What is an Observable | Understanding Observables & RxJS | A Complete Angular Course
tags:
  - "Programming/RxJS"
createdAt: Mon Sep 29 2025 10:06:18 GMT+0200 (Central European Summer Time)
updatedAt: Mon Sep 29 2025 10:06:33 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Introduction [(00:00:01)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=1s)
- This section of the course aims to explain what an observable is, where and when it is used, starting with a basic understanding of the concept, which can be simply stated as using observables to handle asynchronous data [(00:00:19)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=19s).
- Observables are used to handle asynchronous data, but it is also possible to use promises, a built-in [[JavaScript]] feature, to achieve the same goal, allowing for asynchronous data handling in [[Angular (web framework) | Angular]] using either observables or promises [(00:00:27)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=27s).
- Asynchronous operations are an important concept to understand before proceeding further with observables, as both observables and promises can be used to handle asynchronous data in Angular [(00:00:40)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=40s).
- The course will cover the basics of observables, including their usage and application in handling asynchronous data, providing a comprehensive understanding of the concept and its role in Angular [(00:00:01)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=1s).

## What is Asynchronous Operation [(00:00:52)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=52s)
- JavaScript is a single-threaded programming language, meaning that code is executed line by line in the order it is defined, and the next line of code will only be executed after the previous one is complete, which can cause delays if a task takes a long time to execute [(00:00:52)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=52s).
- Synchronous code is blocking in nature, meaning that the next line of code will only be executed after the previous code has finished executing, such as when making an HTTP request to a server, which can take time to complete [(00:01:19)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=79s).
- Asynchronous programming allows code to be executed in the background, without blocking the main thread, enabling non-blocking and more efficient execution of time-consuming tasks, such as network requests [(00:01:52)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=112s).
- Asynchronous code does not get executed in the single thread provided by [[JavaScript]], but instead runs in the background, allowing the main thread to continue executing the next lines of code without delay [(00:02:06)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=126s).
- When using asynchronous programming, the next line of code after an HTTP request will be executed immediately in the main thread, without waiting for the response from the server, preventing the request from blocking the execution of the next line of code [(00:02:21)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=141s).
- Asynchronous code returns data after some time, requiring a way to handle the data once it becomes available, which can be achieved using either a promise or an observable [(00:02:48)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=168s).
- To understand the difference between a promise and an observable, it is necessary to first understand what streaming is, which will help in comprehending the distinction between these two concepts [(00:03:04)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=184s).

## Streaming of Data [(00:03:09)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=189s)
- When creating an [[Angular (web framework) | Angular]] application, an HTTP request can be made to the server to retrieve data, which may be a huge amount of data that needs to be sent back to the client through an HTTP response [(00:03:09)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=189s).
- The server can send the data to the client in two ways: by sending all the data at once or by dividing the data into small chunks and sending each chunk at a time to the client [(00:03:38)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=218s).
- For example, in a video streaming app like Netflix or YouTube, when a user requests a video file, the server can send the video file to the client, but instead of sending the complete 1GB file at once, it can be divided into small packets and sent to the client one after the other [(00:04:07)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=247s).
- By sending the data in small packets, the user does not have to wait for the complete file to be downloaded and can start watching the video as soon as the first packet arrives [(00:05:02)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=302s).
- This approach of sending data in small chunks instead of sending it all at once is called streaming of data, where a huge file is streamed into small chunks to the client [(00:05:15)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=315s).
- Streaming of data allows for a more efficient way of sending large amounts of data, such as video files, by breaking them down into smaller packets and sending them to the client one after the other [(00:05:21)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=321s).

## Promise vs Observable [(00:05:38)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=338s)
- A promise returns data over a period of time, which can be actual data or an error, and it will return the response data if everything is okay or an error object if something went wrong, such as a network issue [(00:05:38)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=338s).
- The main difference between a promise and an observable is that a promise cannot handle a stream of data, and it will resolve as soon as the first chunk of data arrives, whereas an observable can handle a stream of data and return multiple values [(00:06:13)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=373s).
- A promise will return data even if there is no code using that data, but an observable will only provide the data if there is someone to use it, making it more efficient in certain situations [(00:06:56)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=416s).
- Observables are not native to [[JavaScript]], but are instead provided by the RxJS library, which uses the Observer pattern, and an observable can be thought of as a wrapper around an ordinary data stream [(00:07:38)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=458s).
- The RxJS library provides the functionality for observables, allowing developers to convert ordinary data streams into observable ones, and it is an important tool for handling asynchronous data in applications [(00:07:45)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=465s).
- In contrast to promises, observables will not send data if there is no code using that data, making them a more flexible and efficient option for handling certain types of data [(00:07:16)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=436s).

## Observable Pattern [(00:08:13)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=493s)
- The Observable pattern involves an observable, also known as an eventer, which emits events, and an observer, also known as an event listener or subscriber, that listens for these events and handles them using event handlers when they occur [(00:08:13)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=493s).
- In the Observable pattern, the observer waits for an event to happen and once it happens, the observer can handle the event by executing some logic with the help of event handlers, and the observable can be referred to as an eventer that emits events [(00:08:29)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=509s).
- An observable in RxJS emits events such as next, error, or completion events, and an observer subscribes to these events, listening for them and handling them when they occur by executing code and passing next, error, or completion functions as callback functions to the Subscribe method [(00:09:05)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=545s).
- The Observer pattern is used when working with observables, where an observable emits an event when something happens, and the observer or subscriber listens for the event and handles it by executing functions when the event happens [(00:09:55)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=595s).
- Observables are not native to [[JavaScript]] or [[Angular (web framework) | Angular]], but are provided by the RxJS library, which stands for Reactive Extension library for JavaScript and allows working with asynchronous data streams [(00:10:16)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=616s).
- The RxJS library provides methods to work with observables and manipulate the data emitted by them, and these methods will be discussed in further lectures, including how to create an observable using the RxJS library and work with it in an Angular application [(00:10:31)](https://www.youtube.com/watch?v=SmDDEaglAd4&t=631s).




## Sources
- [website](https://www.youtube.com/watch?v=SmDDEaglAd4)
