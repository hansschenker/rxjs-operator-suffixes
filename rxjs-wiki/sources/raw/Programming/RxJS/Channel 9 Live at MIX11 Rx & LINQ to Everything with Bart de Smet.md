---
title: Channel 9 Live at MIX11 Rx & LINQ to Everything with Bart de Smet
tags:
  - "Programming/RxJS"
createdAt: Fri Dec 12 2025 11:51:53 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 12 2025 11:53:33 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Reactive Extensions and LINQ
- [[ReactiveX | Reactive Extensions]] (Rx) is a technology for event processing, allowing users to subscribe to an observable sequence, such as stock exchange data or Twitter data, and receive callbacks with new values, with the ability to write queries on top of it [(00:00:52)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=52s).
- Rx can be referred to as LINQ to events or LINQ to event streams, as it abstracts over event streams, making it compositional and allowing for LINQ queries to be written on top of it [(00:01:37)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=97s).

## Concurrency and Scheduling in Rx
- The implementation of Rx in [[JavaScript]] has a significantly reduced code size compared to the C# implementation, mainly due to the lack of need for locking and concurrency management in JavaScript [(00:02:28)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=148s).
- In JavaScript, timers are used to create concurrency, which is necessary for event stream processing to prevent blocking and allow for independent event raising [(00:03:24)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=204s).
- Concurrency is essential in Rx to enable event stream processing, as it allows data sources to raise events independently of the receiver, without blocking the system [(00:03:43)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=223s).
- The use of timers in JavaScript simplifies the implementation of Rx, as it eliminates the need for complex concurrency management, such as locking, which is required in the C# implementation [(00:03:30)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=210s).
- [[ReactiveX | Reactive Extensions]] allow applications to react to events triggered by the system, and in .NET, there are various ways to achieve this, including the use of schedulers such as the thread pool, task pool, and WPF dispatcher, with the abstraction called IScheduler that can be used on top of these [(00:04:09)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=249s).
- In JavaScript, scheduling is typically done using timers, and Reactive Extensions use this timer infrastructure to schedule events, although it has limitations compared to .NET due to the lack of threading in JavaScript [(00:04:51)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=291s).

## LINQ's Power and Implementations
- LINQ is a powerful abstraction that provides a fluent interface for querying and manipulating data, allowing developers to write expressive code that can be translated into various domains, including event handling and query operations [(00:06:11)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=371s).
- The power of LINQ lies in its ability to provide a consistent and expressive syntax for various data sources, including IEnumerable and IObservable, and its ability to interpret the execution of queries, making it a versatile and powerful tool [(00:07:01)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=421s).
- There are implementations of LINQ for [[JavaScript]], such as LINQ.js, which provide similar functionality to the .NET version, although the speaker has not had much experience with it, and notes that languages like JavaScript are well-suited for fluent interfaces [(00:07:46)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=466s).
- Somebody has written a [[C++]] implementation using STL, which is similar to LINQ, by utilizing operator overloading and templates, and this implementation can be found by searching for "link C++" on Bing [(00:08:26)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=506s).

## The 'Link to Anything' Project
- The "link to anything" project is focused on providing people with more tools and capabilities to write providers, whether they are tied to enumerable or observable data sources, and aims to reduce common pain points and friction [(00:09:11)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=551s).
- The project is working on eliminating certain classes of problems that people run into when building providers, and only a small fraction of developers need to write providers, while most people need to consume them [(00:09:31)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=571s).
- The "link to anything" concept is not limited to specific domains, but rather can be applied to various domains that obey the laws of LINQ, such as nullable types, which can be used to implement the "maybe monad" [(00:10:54)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=654s).
- The use of monadic types and binding can provide tremendous power, as demonstrated by the ability to write code that propagates null values using the select many signature of LINQ, which is typically not its intended use [(00:11:20)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=680s).
- The main constraint for applying "link to anything" is that the domain needs to lend itself to the laws of LINQ, and there are many domains that can benefit from this approach, including those that involve nullable types and monadic binding [(00:11:42)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=702s).

## LINQ's Combination Capabilities
- The concept of LINQ allows for the combination of instances of the same type, enabling powerful mechanisms such as the "from" keyword in LINQ, which can be used to create queries that work with multiple data sources [(00:12:03)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=723s).
- Even without the full functionality of LINQ, such as multiple "from" clauses, it is still possible to achieve useful results with a single "from" and "select" statement, which can be considered a form of LINQ [(00:12:26)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=746s).

## RxJS vs Rx.NET Differences
- The main differences between RxJS and Rx.NET lie in the optimization of certain features to take advantage of the capabilities of each platform, with Rx.NET being the foundation and RxJS being adapted to work within the limitations of [[JavaScript]] [(00:12:47)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=767s).
- While RxJS and Rx.NET share many similarities in terms of operators, there are some differences due to the underlying platform, such as the use of Dynamic in C# and the lack of concurrency support in JavaScript [(00:13:10)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=790s).
- Syntactical differences also exist between RxJS and Rx.NET, such as the use of more descriptive method names in JavaScript and the overloading of methods in C#, which is not possible in JavaScript [(00:13:47)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=827s).

## RxJS Design and Developer Opinion
- The Subscribe method in RxJS has been designed to be flexible and allow for a lightweight syntax, where a callback function can be passed in without the need for a complete Observer object [(00:14:16)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=856s).
- The developer's opinion of [[JavaScript]] is positive, particularly with regards to its support for functions as first-class constructs, and the fact that RxJS can achieve similar results to Rx.NET is a testament to the power of the language [(00:15:30)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=930s).
- The goal is to have RXJS capable of doing everything that RX .NET can do, with the main difference being the handling of dispatchers and other .NET-specific features [(00:16:08)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=968s).

## Documentation Efforts
- There is a need for better documentation for RXJS, and the team is actively working on it, including using Doc Riders and people who can write clear sentences to improve the documentation [(00:16:45)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1005s).
- The team is also exploring the possibility of automatically generating documentation using code, and they are working on a mechanism for JavaScript comments that will provide intelligence in upcoming versions [(00:17:05)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1025s).
- Documentation is particularly important in an untyped world, where types cannot provide clues about how operators work, and the team recognizes the need for clear, plain English documentation [(00:17:59)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1079s).

## Future Plans and Experimental Features
- The team is also considering the semantics of error cases and other aspects of RXJS, and they are open to the idea of incorporating async functionality into [[JavaScript]] in the future [(00:18:26)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1106s).
- As for the current state of RX, the team is focusing on finalizing the API design, fixing bugs, and improving performance, with the goal of establishing a stable subset of features that will not change [(00:19:15)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1155s).
- The team values feedback from users and is actively working to provide support and documentation, recognizing that the community is growing and becoming more active [(00:19:40)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1180s).
- The development of Rx involves distinguishing between stable and experimental features, with the latter including support for observables and async lambdas that may change as underlying features are completed [(00:19:54)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1194s).

## Operator Design and Stabilization
- Experimental features, such as the generalization of operators, are being explored, and the team has found that the general case of buffering is equivalent to windowing, allowing for more powerful live analysis of data [(00:20:29)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1229s).
- The team initially considered removing buffer operators in favor of window operators but ultimately decided to rebuild buffer operators on top of window operators, providing users with both options and introducing a new operator called "to list" [(00:21:10)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1270s).
- The design principle is to establish the semantics of operators first and then focus on performance optimization and documentation, with the team now at the stage of refining and stabilizing the operators [(00:22:30)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1350s).

## Real-World Applications and Composability
- Rx is being used in the real world, particularly in the UI space for coordinating events and in the financial industry for analyzing streams of data, such as stock trade analysis [(00:23:01)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1381s).
- The usage patterns of Rx by external developers involve using it for asynchronous operations, such as web service calls or IO, and for composing APIs, with the team seeing increased adoption in various industries [(00:23:31)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1411s).
- RX provides a way to compose operators together to perform complex analysis, such as monitoring a system and sending out events when a server goes down, and allows for the computation of running averages and trends over time [(00:23:45)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1425s).
- The analysis of events and composition of operators is notoriously hard to do efficiently without making mistakes, especially when it comes to synchronization, but RX gives the blueprints for doing so [(00:24:18)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1458s).
- Composability is a key aspect of RX, allowing for the building of composable systems where lots of different things are going on, and enabling expressive reasoning about these systems [(00:25:12)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1512s).

## Technical Composition in RX
- The composition in RX is done on a technical level, allowing for the filtering of events, such as .NET events, and the creation of new events out of existing ones, which can be a hard thing to do without RX [(00:25:26)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1526s).
- RX provides composition on the observable space, allowing for the merging of two observables into a new observable of the same type, and also provides composition on the operator level, enabling the gluing of operators together [(00:27:21)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1641s).
- The use of RX simplifies the process of composing events and operators, making it easier to manage resources and unsubscribe from events, which can be problematic when done manually [(00:26:24)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1584s).
- RX enables the combination of multiple events and the composition of building blocks, whether it's function composition or the composition of events, making it a powerful tool for complex analysis and system monitoring [(00:26:36)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1596s).

## IDisposable and Composition
- The subscribe method of an observable returns an IDisposable, which allows for easy unsubscribe functionality without needing to remember the Observer, similar to how a magazine subscription works, where a subscription ID is provided to unsubscribe, [(00:27:33)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1653s).
- When subscribing to an observable sequence, the returned IDisposable can be used to unsubscribe, and if multiple sequences are subscribed to, such as with a Merge sequence, the disposables can be bundled together for easy unsubscription, demonstrating composition on IDisposable, [(00:28:42)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1722s).
- The concept of composition in this context refers to the ability to manage multiple subscriptions and unsubscribe from them efficiently, much like sending a bundle of subscription IDs to cancel multiple magazine subscriptions at once, [(00:28:55)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1735s).
- TPL Data Flow has been explored, and its closest approximation to RX is through subjects, which are publish-subscribe points that allow for efficient data passing, but these subjects do not compose well and require manual plumbing, [(00:29:27)](https://www.youtube.com/watch?v=X9WCSl8kTRo&t=1767s).




## Sources
- [website](https://www.youtube.com/watch?v=X9WCSl8kTRo)
