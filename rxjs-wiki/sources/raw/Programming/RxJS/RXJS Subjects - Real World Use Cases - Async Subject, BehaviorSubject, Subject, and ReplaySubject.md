---
title: RXJS Subjects - Real World Use Cases - Async Subject, BehaviorSubject, Subject, and ReplaySubject
tags:
  - "Programming/RxJS"
createdAt: Mon Jan 26 2026 07:32:47 GMT+0100 (Central European Standard Time)
updatedAt: Mon Jan 26 2026 07:33:12 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction and Initial Discussion on RXJS Subjects
- The discussion starts with a casual conversation about singing and a song, with mentions of "Don't Stop Believin'" by Journey, before transitioning to the topic of RXJS subjects [(00:00:01)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1s).
- The Async Subject is briefly mentioned as storing one value until it completes, similar to a promise, but its specific use case is unclear and it is not commonly used [(00:02:50)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=170s).
- The conversation touches on the idea that some operators, like the Async Subject, are not removed from RXJS because they are still used by other people, and removing them would break existing code [(00:03:58)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=238s).
- The topics of BehaviorSubject, ReplaySubject, and Subject are introduced as important subjects to discuss, with a focus on finding real-world use cases for these subjects [(00:04:15)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=255s).

## Core Concepts of Subjects and Multicasting
- The concept of multicasting is mentioned as a key use case for subjects, relating to the observer pattern, where the same subject can be shared among multiple observers [(00:05:20)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=320s).
- The goal is to explore real-world use cases for these subjects, including BehaviorSubject and ReplaySubject, in a concise manner [(00:05:07)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=307s).
- A subject is an interface that extends both observer and observable, allowing it to maintain a list of observers and notify them of new values, with methods such as notify, register, and unregister, and it can be used to multicast values to multiple observers [(00:05:43)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=343s).
- In RxJS, a subject is an observable that is also an observer, and it can be used to subscribe to an observable and then share the values with multiple observers, allowing for multicasting and avoiding the need to create a new subscription every time [(00:07:32)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=452s).
- The primary use case for subjects is to enable multicasting, where a single observable can be shared among multiple observers, and this is achieved by subscribing to the subject instead of the original observable, which allows the subject to register the observers and notify them of new values [(00:08:18)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=498s).

## Subject Mechanics and Subscription Management
- Subjects can be used to solve problems where observables are frequently created, such as when an observable is created every time a subscriber is added, and instead, a subject can be used to share the values with multiple subscribers, avoiding the need to create a new observable every time [(00:09:39)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=579s).
- By using a subject, the subscription function is only called once, and the subject takes care of notifying all the registered observers, making it a useful tool for managing multiple subscriptions and avoiding unnecessary computations [(00:10:05)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=605s).
- The subject's observers can be accessed and modified, but it is not recommended to do so, as it can lead to unexpected behavior, and instead, the subject's methods should be used to manage the observers and subscriptions [(00:11:05)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=665s).

## Types of Subjects and Their Use Cases
- The different types of subjects, such as AsyncSubject, BehaviorSubject, Subject, and ReplaySubject, can be used in various scenarios to achieve specific behaviors, such as sharing values, caching values, or handling errors, and they will be discussed in more detail [(00:05:43)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=343s).
- Subjects in RXJS have an internal list of subscribers created from functions that were passed, and every time a value is sent to the subject using the `next` method, it notifies those subscribers, which is the primary use case for using subjects due to their multi-casting capability [(00:12:00)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=720s).
- The secondary use case for subjects is in situations like [[Angular (web framework) | Angular]] or React, where they can be used to create an observable from user events, such as button clicks, and update the state of a component based on those events [(00:12:45)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=765s).
- To create an observable from user events, a subject can be used, and the `next` method can be called on the subject to send values to the observable, which can then be subscribed to and used to update the state of a component [(00:14:32)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=872s).

## Anti-Patterns and Best Practices in Subject Usage
- Subjects can be used to derive new observables from existing ones, and can be used with operators like the `scan` operator to update state and pull in new values [(00:15:07)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=907s).
- A common anti-pattern when using subjects is to create a subject unnecessarily, such as when creating a WebSocket, and using the subject to create an iterable from the WebSocket data, when instead, a subject could be used more effectively to create an observable from the WebSocket data [(00:16:39)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=999s).
- Subjects can be used to create an observable from user events, and can be used in any framework, including [[Angular (web framework) | Angular]] and React, to get an observable out of user events and update the state of a component based on those events [(00:16:00)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=960s).
- Creating a subject and using the `next` method to push values into it is not the best approach, as it can lead to losing the benefits of observables, such as guaranteed teardown and memory management, and is generally considered an anti-pattern [(00:18:02)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1082s).
- A better approach would be to wrap the code in an observable, which would allow for the creation of the WebSocket only when subscribed to, and closing it when unsubscribed, thus providing better memory management [(00:18:28)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1108s).
- Using a subject directly is not always the best solution, and in many cases, it would be better to use an observable instead, as it provides more features and benefits, such as guaranteed teardown and memory management [(00:20:14)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1214s).

## BehaviorSubject, ReplaySubject, and AsyncSubject Specifics
- The AsyncSubject is not commonly used and has limited use cases, as it holds on to the last value and waits for the complete event to fire before broadcasting it to subscribers, a functionality that can be achieved with other operators like the replay operator [(00:21:09)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1269s).
- BehaviorSubject can be useful in certain scenarios, such as when you want to provide an initial value, and it can solve problems like having to start a subject with a value, but it should be used judiciously and with a clear understanding of its benefits and limitations [(00:22:13)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1333s).
- ReplaySubject can be used to achieve similar functionality to AsyncSubject, and it is often a better choice, as it provides more features and flexibility, such as the ability to replay a specified number of values to new subscribers [(00:21:57)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1317s).
- Using a Subject in certain scenarios can be problematic because it doesn't retain any information when it's toggled off and on again, resulting in the loss of previous values [(00:23:05)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1385s).
- A BehaviorSubject can be used to address this issue, as it starts with an initial value and immediately emits the previous value when subscribed to, ensuring that there's always a value present [(00:24:22)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1462s).
- If the goal is to remember the state of the Subject even after it's been toggled off and on, a ReplaySubject or the shareReplay operator can be used, which caches the previous values and replays them when the Subject is subscribed to again [(00:25:03)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1503s).

## Advanced Operators and Reference Counting (shareReplay)
- The shareReplay operator is often preferred over using a ReplaySubject directly, as it provides a simpler and more convenient way to achieve the same functionality, and it uses a ReplaySubject under the hood [(00:25:23)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1523s).
- The implementation of shareReplay involves creating a new ReplaySubject when the first subscription is made, and then subscribing to it in a way that pumps values through the ReplaySubject without killing it, using reference counting to manage subscriptions [(00:27:49)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1669s).
- The reference counting mechanism in shareReplay increments a counter when a new subscription is made and decrements it when a subscription is cancelled, and if the counter reaches zero, it unsubscribes from the underlying observable [(00:28:20)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1700s).
- The default behavior of a subject is that it doesn't die just because all subscribers go down to 0, it will maintain the subscription until it completes because it's trying to make sure that it gets the value, and this behavior can be configured to stop if everyone unsubscribes [(00:28:52)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1732s).

## Configuration and Lifecycle of Subjects
- The subject can be configured to kill itself based on reference count, allowing it to stop and go cold after all subscribers have unsubscribed, requiring the data to be resupplied afterwards [(00:29:07)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1747s).
- The basic implementation of share replay is discussed, and it's mentioned that it's a cool feature, but the explanation is rushed due to time constraints [(00:29:25)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1765s).

## Casual Wrap-Up and Personal Anecdotes
- The conversation takes a turn to a more casual tone, discussing personal topics such as working out, wearing gym clothes to work, and favorite socks, before eventually wrapping up the conversation [(00:31:21)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1881s).
- The conversation ends with a lighthearted tone, discussing lifting chips and drinking, before saying goodbye to the Internet [(00:32:11)](https://www.youtube.com/watch?v=p6LjHxHvKi0&t=1931s).




## Sources
- [website](https://www.youtube.com/watch?v=p6LjHxHvKi0)
