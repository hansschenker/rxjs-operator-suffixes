---
title: RxJS Streams Explained — Made with Oboe at oboe.com
tags:
  - "Technology/Programming"
  - "Programming/RxJS"
createdAt: Wed Dec 24 2025 15:03:02 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 24 2025 15:03:28 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to RxJS and Asynchronous Data Streams
- In modern web applications, data is often received asynchronously from various sources such as servers and user inputs, leading to complex management challenges often referred to as "callback hell."
- RxJS ([[ReactiveX | Reactive Extensions]] for JavaScript) is a library designed to simplify the handling of asynchronous data streams by using [[Observable | observable]] sequences, allowing developers to treat sequences of events as single collections or streams.
- The core concept of RxJS is that everything can be considered a stream of values, such as user clicks or network requests, which can be managed and manipulated using RxJS tools.
- RxJS provides several benefits, including simplifying complex code, avoiding deeply nested callbacks, and offering a rich library of operators to filter, combine, transform, and manage data streams.

## Core Concepts of RxJS
- Observables are the fundamental building blocks in RxJS, acting as blueprints for data streams that only start producing values when subscribed to, making them lazy by nature.
- The document includes a quiz section that highlights key concepts: RxJS addresses the problem of complex, nested callbacks; streams are the core idea for handling asynchronous data; operators are functions used to manipulate data within streams; and in the conveyor belt analogy, 'items' represent individual data values or events in a stream.
- The concept of Observables in RxJS can be understood by imagining a weekly newsletter subscription, where the publisher only sends the content when the subscriber explicitly requests it, and this is similar to how Observables work, where the [[Observable]] is the publisher and the subscriber is the one receiving the data.
- The [[Observable]] lifecycle consists of three types of notifications: next, error, and complete, where next delivers a value, error sends a notification that an error occurred and stops the Observable, and complete sends a notification that the Observable has finished sending values and also stops it.
- An Observable can either complete or error out, but not both, and once one of these occurs, the subscription is over, and no more values will be sent.

## Creating and Using Observables
- To create an Observable, the new Observable() constructor is used, which takes a function that runs when someone subscribes, and this function receives a subscriber object with the next(), error(), and complete() methods.
- The code inside the [[Observable]] constructor does not run until someone subscribes to it using the subscribe() method, which passes an object with three optional methods: next, error, and complete, that handle each type of notification from the Observable.
- The observer pattern is the pattern used by RxJS Observables, where the Observable's logic executes for each subscription independently, and if another subscriber comes along, the whole process starts over for them.

## Push vs. Pull Models
- RxJS is built around a push-based model, where the producer is in control and sends data as it becomes available, unlike the pull-based model, where the consumer actively requests the data from the producer.
- The push-based model is effective for modern applications, and it is different from the pull-based model, where the consumer is in control, such as when calling a function or iterating over an array, where the consumer pulls the data from the producer.
- The example code provided demonstrates how to create an [[Observable]] using the new [[Observable]]() constructor and how to subscribe to it using the subscribe() method, and it shows how the next, error, and complete handlers are used to handle each type of notification from the Observable.
- The document 'RxJS Streams Explained — Made with Oboe at oboe.com' discusses the difference between pull and push models in data delivery, where the pull model has the consumer dictating the pace and the push model has the producer sending data to the consumer whenever it's available.
- In a pull system, the consumer is active and initiates the data transfer, which is inefficient for handling asynchronous events and requires constant checking or polling to see if new data is available, whereas in a push system, the producer is active and sends data to the consumer as it becomes available.

## Practical Applications of Push Model
- RxJS Observables are producers in a push-based system that can push multiple values over time to any subscribed consumers, making them ideal for handling sequences of events like user clicks, web socket data, or responses to HTTP requests, and they can emit three types of notifications: a value, an error, or a completion signal.
- The push model used by RxJS is particularly powerful for handling asynchronous events, which are central to modern web applications, and it simplifies code, reduces resource consumption, and makes it easier to manage complex sequences of events, data from multiple sources, and real-time updates.
- A [[Futures and promises | Promise]] is a simple example of a push-based object that represents the eventual completion or failure of an asynchronous operation and its resulting value, but it is less powerful than an RxJS [[Observable]] because it can only emit one value and cannot be cancelled once initiated.
- The key difference between the pull and push models is that in the pull model, the flow starts with the consumer asking for data, whereas in the push model, the flow starts with the producer sending data, and RxJS chose the push model because it is more efficient and effective for handling asynchronous events.
- RxJS provides a robust framework for building reactive, responsive applications by embracing the push model, and its Observables are the foundation for reactive programming, making them perfect for managing sequences of events like user clicks, mouse movements, or real-time data from a server.
- The section discusses asynchronous events, which are events that occur at an unpredictable time, such as user input or network responses, and are handled most efficiently by a push-based system, allowing the application to simply listen and react whenever an event occurs, saving system resources.
- Practical examples of asynchronous events include mouse clicks, keyboard inputs, data arriving from an [[API]] call, or messages from a web socket, and RxJS and its push-based Observables excel at simplifying code for managing complex sequences of these events.
- The push model is generally more efficient for handling asynchronous user events like mouse clicks, as it allows the application to react to events as they occur, rather than constantly polling for updates, and RxJS Observables are powerful because they extend the push model to handle multiple values over time.

## Observables and Operators
- In a pull-based system, the consumer is in control of when data is requested, whereas in a push-based system, the producer sends data when it becomes available, and a classic example of a push-based system is a JavaScript [[Futures and promises | Promise]] that resolves with a value.
- RxJS uses the concept of Observers to manage data streams, and operators are pure functions that take an [[Observable]] as input and return a new [[Observable]] as output, with key operators including map, filter, and reduce, which can be used to transform, filter, and reduce the values emitted by an Observable.
- The map operator transforms each value from the source Observable, the filter operator emits only the values that pass a certain test, and the reduce operator applies a function against an accumulator and each value to reduce it to a single value, and these operators are essential for working with Observables in RxJS.
- The section also mentions that there are over a hundred operators in RxJS, but a small handful, including map, filter, and reduce, are used for most work, and that operators don't change the incoming stream, they create a new, modified stream, leaving the original Observable untouched.
- The reduce operator in RxJS is used to accumulate a value from a source Observable and emits a single value once the source Observable is complete, making it useful for tasks such as summing a list of numbers or combining objects into one.
- The .pipe() method is used to chain multiple operators together in a specific sequence, allowing for the creation of a pipeline of operations where the output of one operator becomes the input of the next, and it takes any number of operators as arguments.
- By combining operators with the .pipe() method, you can create powerful, declarative, and easy-to-read code for handling complex asynchronous events, such as taking only the odd numbers from a stream, squaring them, and then adding them all up.
- The primary role of an RxJS operator is to create a new, modified [[Observable]] stream from a source stream, and examples of operators include filter, map, and reduce, each serving a distinct purpose such as filtering out certain values, transforming values, or accumulating values.
- The reduce operator emits its final, accumulated value only after the source [[Observable]] completes, and the .pipe() method is used to chain multiple operators together, not to transform a single value, combine Observables, or execute an Observable.

## Advanced Operators and Chaining
- Subjects in RxJS are a special type of Observable that allows values to be multicasted to many Observers, making them useful for broadcasting the same stream of data to multiple listeners simultaneously, and they can be both subscribed to and pushed new values into using their next() method.
- The code example provided demonstrates how to use the .pipe() method to chain the filter, map, and reduce operators together to take only the odd numbers from a stream, square them, and then add them all up, resulting in a single emitted value of 35.
- The quiz questions and answers provided in the text help to reinforce understanding of key concepts, including the primary role of an RxJS operator, the purpose of the .pipe() method, and the behavior of the reduce operator, as well as the use of Subjects for multicasting values to multiple Observers.
- The RxJS Subject is a dual-role entity that acts as both an [[Observable]] and an Observer, making it a perfect hub for sharing information across different parts of an application, allowing values to be multicasted to many Observers simultaneously.
- There are different types of Subjects in RxJS, including Subject, BehaviorSubject, ReplaySubject, and AsyncSubject, each with a unique behavior for handling new subscribers, such as remembering the last value emitted, recording a specified number of recent values, or emitting the last value received after the stream completes.
- A Subject can be used to share a single subscription among multiple listeners, making it an efficient way to manage shared resources and state within a reactive application, and is particularly useful for handling expensive operations like [[WebSocket]] connections or [[API]] calls that return streaming data.

## Subjects in RxJS
- The BehaviorSubject is initialized with a starting value and remembers the last value that was emitted, sending it to any new subscriber immediately upon subscription, making it suitable for managing global application state, such as a user's profile or theme settings.
- The ReplaySubject records a specified number of the most recent values and replays them to any new subscriber, allowing new subscribers to receive a buffer of old values right away, before receiving any new ones.
- The AsyncSubject only emits the last value it received, and only after its stream completes, ignoring all values except the very last one, and sending nothing if it completes without receiving any values.
- The primary use case for Subjects is to share a single subscription among multiple listeners, and they are commonly used to manage shared resources and state within a reactive application, with the different types of Subjects providing various options for handling new subscribers and managing data streams.
- Multicasting is the practice of broadcasting a single stream of data from one source [[Observable]] to multiple subscribers at the same time, and Subjects are a key component of this process, allowing values to be shared efficiently among multiple parts of an application.
- Subjects are the primary mechanism for achieving multicasting in RxJS, allowing a single source to be shared among multiple subscribers, which is critical for performance and resource management by preventing multiple executions of expensive operations.
- There are several types of Subjects in RxJS, including BehaviorSubject, ReplaySubject, and AsyncSubject, each with its own unique characteristics and use cases, such as managing shared application state, providing recent history, and handling asynchronous operations.
- A BehaviorSubject is a type of Subject that stores the latest value and immediately emits it to any new subscriber, making it useful for managing shared application state, like a user's login status or theme settings, and it must be initialized with a starting value.
- A ReplaySubject is a type of Subject that records a specified number of recent values and replays them to new subscribers, which is useful for providing new subscribers with recent history, such as the last few chat messages in a conversation, and it can be configured with a buffer size to store a specific number of values.

## Subject Types and Use Cases
- An AsyncSubject is a type of Subject that only emits the last value it received, and only after the stream has completed, making it useful for asynchronous operations where you only care about the final result, such as an HTTP request, and it will not emit any values to subscribers if the complete method is never called.
- The key characteristic that distinguishes a Subject from a regular [[Observable]] in RxJS is that a Subject is both an [[Observable]] and an Observer, allowing it to multicast values to multiple subscribers.
- The primary benefit of using a Subject to share an expensive data source, like a [[WebSocket]] connection, among multiple components is that it allows a single subscription to be shared among all components, reducing the overhead of multiple subscriptions and improving performance.
- In the context of managing a user's theme preference, a BehaviorSubject is the best suited Subject because it immediately emits the current theme to new subscribers, allowing them to know the current theme without waiting for a change.
- When using a ReplaySubject, a new subscriber will receive the specified number of recent values immediately upon subscribing, such as the last two values if the ReplaySubject is configured with a buffer size of 2.
- The primary benefit of using a Subject to share an expensive data source, like a WebSocket connection, among multiple components is that it allows a single subscription to be shared, or multicasted, with all components, which is a powerful pattern for managing and sharing data streams efficiently in RxJS.

## Hot vs. Cold Observables
- In RxJS, Observables can be either "hot" or "cold", and this distinction is crucial because it determines how subscribers receive data, with the key difference lying in where the data producer is created, either inside or outside the [[Observable]].
- A cold [[Observable]] creates a new producer for each subscriber, similar to watching a movie on Netflix, where each viewer gets their own private stream of the movie, starting from the beginning, and this is why HTTP requests in Angular, which return Observables, are cold, as each subscription triggers a new execution of the function inside the Observable.
- On the other hand, a hot Observable's producer is created outside the Observable, and it multicasts values to all subscribers simultaneously, similar to a live radio broadcast, where everyone who is listening hears the same thing at the same time, and subscribers join an ongoing stream of events.
- The key differences between hot and cold Observables include the producer, subscription, data sharing, and common use cases, with cold Observables creating a new producer upon subscription, providing each subscriber with its own private data stream, and no sharing between subscribers, while hot Observables have a producer that exists outside the Observable, providing a single shared stream, and values are shared among all current subscribers.
- Understanding the distinction between hot and cold Observables helps anticipate how data streams will behave, and the choice between using a hot or cold Observable depends on what you want to achieve, with cold Observables suitable for providing each subscriber with its own full set of data from start to finish, such as an [[API]] call, and hot Observables suitable for multicasting values to all subscribers simultaneously, such as UI events or WebSockets.
- The primary factor that determines whether an RxJS Observable is considered "hot" or "cold" is where the data producer is created, either inside or outside the Observable, which is a crucial concept to grasp when working with RxJS Streams.
- A cold [[Observable]] creates a new data producer for each subscriber, providing a fresh and independent execution for every subscription, making it ideal for operations like HTTP requests in Angular, where each component needs its own complete data set from an API call.
- A hot [[Observable]], on the other hand, uses a single, shared data producer that exists outside the Observable, multicasting values to all current subscribers, making it suitable for shared event sources like user mouse clicks, [[WebSocket]] connections, or other real-time events that multiple parts of an app need to react to.

## Characteristics of Hot and Cold Observables
- The key behavior of hot Observables is that subscribers only receive values emitted after they have subscribed, missing any previously emitted values, which is similar to a live radio broadcast where listeners who tune in late miss the beginning and hear the same live content as everyone else.
- The data producer is the source of values within an Observable, which can be anything from a simple array, a web socket, to user input events, and its location is the key difference between hot and cold Observables.
- Multicasting is the process of broadcasting values from a single [[Observable]] execution to multiple subscribers simultaneously, which is the characteristic behavior of hot Observables, and special RxJS operators can be used to convert a cold Observable into a hot one, enabling multicasting behavior.
- When deciding whether to use a cold or hot [[Observable]], the choice depends on whether each subscriber needs a dedicated data stream or needs to share a single, ongoing stream, and the core question to ask is "Should every subscriber trigger a new execution, or should they all listen to the same ongoing one?"
- A common mistake to avoid is using a cold HTTP Observable for a shared resource without multicasting, causing redundant [[API]] calls across an application, and it is essential to understand the difference between hot and cold Observables to use them effectively in RxJS Streams.
- The primary factor that determines whether an RxJS Observable is considered "hot" or "cold" is where the data producer is created, either inside or outside the Observable, which dictates how data is produced and shared.

## Practical Applications of Hot Observables
- A new subscriber to a hot [[Observable]] will typically receive only the values emitted after the moment they subscribe, whereas a cold Observable generates a unique set of values for each subscriber.
- In a scenario where multiple components need to react to browser window resize events, a hot [[Observable]] is the most appropriate choice because the resize event source is shared and exists independently of the subscribers.
- RxJS provides powerful tools to manage complexity by combining multiple streams into one, allowing developers to react to different events in a coordinated and predictable way.

## Combining Observables
- The merge operator is used to combine multiple Observables into one, emitting values from any of the input streams as they arrive, making it perfect for reacting to events from multiple sources in the same way.
- The concat operator combines streams sequentially, subscribing to the first [[Observable]] and passing its values through, then subscribing to the second one after the first stream completes, guaranteeing a predictable and strictly ordered output.
- The combineLatest operator waits until every input [[Observable]] has emitted at least one value, then emits a new value whenever any of the input streams emit, providing an array containing the most recent value from each of the input streams.
- Choosing the right combination operator, such as merge, concat, or combineLatest, depends on the specific requirements of the application, including the need for values as they happen, in a strict order, or the latest combination of all values.
- The RxJS operators `concat`, `merge`, `forkJoin`, and `combineLatest` are essential for managing complex asynchronous events, and understanding their usage is crucial for building robust applications.

## Specific Combination Operators
- The `concat` operator ensures that the server request only begins after the cache stream completes, making it suitable for scenarios where sequential execution is necessary, such as loading user preferences from a local cache before fetching the latest user data from a server.
- The `combineLatest` operator waits for all input Observables to emit at least one value and then emits an array of the latest values from each source whenever any of the sources emit a new value, making it ideal for managing the state of multiple dropdowns, such as 'Color' and 'Size', to decide when to enable the 'Add to Cart' button.
- The `merge` operator does not guarantee the order of emitted values, and its usage should be carefully considered to avoid unexpected behavior.
- When using `concat` with two Observables, `streamA` and `streamB`, the output sequence will always be the values emitted by `streamA` followed by the values emitted by `streamB`, resulting in a sequence of 1, 2, 3, 4.

## Error Handling in RxJS
- Error handling is a critical aspect of building robust applications with RxJS, and the `catchError` operator is a fundamental tool for intercepting and handling errors, allowing developers to recover by returning a new, fallback [[Observable]] and preventing the application from becoming unresponsive.
- An unhandled error in an [[Observable]] stream will terminate the stream immediately, and using error handling operators like `catchError` is essential to keep the data flowing and ensure a robust application.
- The RxJS library provides several operators, such as `catchError` and [[retry]], to handle errors in Observable streams, allowing developers to recover from errors and provide a better user experience.
- The `catchError` operator can be used to catch errors in a stream and return a new Observable with a default value, enabling the stream to continue and complete successfully, as demonstrated in the example where a default user object is returned when a request for user data fails.
- The `retry` operator is useful for retrying an operation a specified number of times if it errors out, such as in the case of a network connection flickering or a server being briefly overloaded, and it can be used to automatically re-subscribe to the source Observable.
- Best practices for error handling in RxJS include handling errors as close to the source as possible, logging or notifying the user when an error is caught, and providing meaningful fallbacks, such as returning an empty array or a default configuration object, to allow the UI to render in a predictable state.
- The `catchError` block is a great place to log error details or send them to a logging service before returning a fallback value, and it is essential to avoid silently swallowing errors, as this can make it difficult to debug issues.
- The primary purpose of the `catchError` operator is not to re-subscribe to the source [[Observable]], but rather to catch and handle errors, whereas the `retry` operator is used to re-subscribe to the source [[Observable]] a specified number of times.

## Advanced Error Handling
- In terms of terminal notifications for an RxJS Observable stream, the correct answer is that `error` and `complete` are considered terminal notifications, meaning that no other notifications can be sent after one of them is emitted.
- The primary purpose of the catchError operator in RxJS is to intercept an error notification, prevent the stream from terminating, and allow for recovery, ensuring that an Observable always sends a complete notification, even if an error occurs.
- To allow the stream to recover and continue emitting values inside a catchError operator, a new, fallback Observable must be returned, which can be used to transform every next notification into an error notification for testing purposes.
- When an [[Observable]] emits an error notification and it is not handled by an operator like catchError, the stream terminates immediately, making it essential to handle errors properly to prevent stream termination.
- According to best practices, error handling operators like catchError should be placed as close to the source of the potential error as possible to effectively manage errors and prevent stream termination.
- The [[retry]] operator can be used to retry an [[Observable]] that errors, and if the source Observable errors on its first two attempts but succeeds on the third attempt, the subscriber will receive the successful value from the third attempt, followed by a complete notification.

## State Management with RxJS
- Modeling the entire application state as an Observable stream allows for the use of RxJS operators to manage how and when the state changes, providing a chronological record of how the state evolved, which is incredibly useful for debugging and managing transitions with operators like scan.
- The core idea behind managing application state with RxJS is to model the entire application state as a single [[Observable]] stream, which is updated by a stream of actions via a reducer function, providing a predictable and contained way to manage state transitions.
- The scan operator is used to create the state stream, taking two arguments: a reducer function and the initial state, where the reducer function is called for every action emitted by the actions stream, receiving the last known state and the new action, and returning the next state.
- In a real-world application, a central 'store' holds the state stream, and the actions stream is typically a Subject that actions are pushed into from various parts of the application, such as button clicks, form submissions, or server responses, allowing any part of the application that needs to display data to subscribe to the state stream and update automatically when a new state is emitted.
- The reducer function plays a crucial role in state management, as it receives the last known state and the new action, and returns the next state, making it easy to test and reason about the state logic, which becomes a collection of pure functions.
- Using RxJS for state management provides a powerful, flexible, and scalable way to handle application state, allowing developers to leverage the rich ecosystem of operators to manage complex state transitions with declarative and predictable code, and creating a clear, one-way data flow where actions flow in, and a new state flows out to the UI.
- The benefits of modeling state as a stream include creating a chronological, replayable history of every state change in the application, and popular state management libraries like Redux and NgRx are heavily inspired by or built with RxJS, demonstrating the effectiveness of this approach.

## Implementing State Management
- In a typical RxJS state management setup, UI components push new actions into a central Subject and also subscribe to the main state stream to receive updates, which is a true statement, highlighting the simplicity and elegance of this architecture.
- The scan operator is the RxJS operator most similar to the reduce method on arrays, making it ideal for creating a new state based on the previous state and a new action, and is a key component of the state management pattern described in the text.
- The RxJS operator most similar to the reduce method on arrays, and ideal for creating a new state based on the previous state and a new action, is the scan operator.
- The primary role of the reducer function when used with the scan operator for state management is to receive the last known state and the new action, and then return the next state.
- In a typical RxJS state management setup, UI components have a specific role, which is to push new actions into a central Subject and also subscribe to the main state stream in order to receive updates.
- One of the key benefits of modeling state as a stream is that it creates a chronological, replayable history of every state change in the application, which is a significant advantage.

## Benefits of State Management with RxJS
- By treating state as a stream, developers can unlock a powerful and reactive way to build applications, which is a key concept in RxJS state management, as discussed in the document titled 'RxJS Streams Explained — Made with Oboe at oboe.com'.




## Sources
- [website](https://oboe.com/print)
