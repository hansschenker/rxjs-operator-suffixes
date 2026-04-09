---
title: Hot vs Cold Observables
tags:
  - "Programming/RxJS"
createdAt: Sun Sep 28 2025 11:21:09 GMT+0200 (Central European Summer Time)
updatedAt: Sun Sep 28 2025 11:22:33 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Introduction to Hot and Cold Observables
- The concept of "hot" vs "cold" observables refers to the way an observable creates and manages its underlying producer, which is the source of values for the observable, and can be anything from a web socket to DOM events or an iterator.
- A "cold" observable is one where the producer is created and activated during subscription, meaning that a new producer is created every time the observable is subscribed to, resulting in a unicast scenario where each subscriber gets its own producer instance.
- In contrast, a "hot" observable is one where the producer is created or activated outside of subscription, allowing multiple subscribers to share the same producer instance and resulting in a multicast scenario.
- The key difference between hot and cold observables lies in when and where the producer is created, with cold observables creating the producer inside the subscriber function and hot observables creating it outside, before the observable is even created.

## Making a Hot Observable
- To make a "hot" observable, the producer should be created outside of the observable, and then the observable can be created to share the same producer instance among multiple subscribers, which is useful when dealing with scarce resources like web socket connections.
- The reason for making an observable "hot" is to avoid creating multiple instances of the producer, such as a web socket connection, every time the observable is subscribed to, which can be problematic when subscribing to an observable multiple times.
- Observables are essentially functions that tie an observer to a producer, setting up the observer to listen to the producer and returning a teardown mechanism to remove the listener, and the act of subscription is equivalent to calling the observable like a function and passing it an observer.

## Understanding Hot and Cold Observables
- The notion of "hot" vs "cold" observables is important because it determines how the observable manages its producer and handles multiple subscriptions, with hot observables being more suitable for scenarios where multiple subscribers need to share the same producer instance.
- The concept of "hot" and "cold" observables is discussed, with the goal of understanding how to make a "cold" observable "hot" using Rx Subjects and functional programming.

## Using Rx Subjects to Make Cold Observables Hot
- Rx Subjects are introduced, which have several key properties: they are observables, observers, multicast, and pass values through themselves, but cannot be reused after being unsubscribed, completed, or errored.
- A `makeHot` function is created to make any "cold" observable "hot" by using a subject that is shared by the resulting observable, and a `makeHotRefCounted` function is also developed to add reference counting and unsubscribe from the cold source observable when all subscriptions are ended.

## Using RxJS Operators to Make Cold Observables Hot
- However, it is recommended to use operators like `publish()` and `share()` in RxJS instead of the `makeHot` functions, as they provide efficient and concise ways to make a cold observable hot, such as the `share()` operator in RxJS 5, which makes a hot, refCounted observable that can be retried on failure or repeated on success.
- The `share()` operator is also able to recycle dead subjects to enable resubscription to the resulting observable, and an example is provided using a JSBin to demonstrate its usage.

## Advanced Topics and Conclusion
- Finally, the concept of a "warm" observable is touched upon, suggesting that an observable could potentially be both "hot" and "cold" if it observes two producers, although this is generally not recommended and may be necessary only in rare cases.
- The concept of "hot" and "cold" observables is primarily related to the producer, where an observable is considered "hot" if it closes over a shared reference to a producer, and "cold" if it creates a new producer.
- A "hot" observable typically has its producer created and activated outside of the subscription, and it is often multicast, allowing multiple listeners to share the same producer.
- However, there are cases where a "hot" observable may be listening to a producer that only supports one listener at a time, which can make the distinction between "hot" and "cold" observables somewhat fuzzy.
- In situations where an observable is doing both, creating a new producer and closing over a shared reference, it can be referred to as "warm", although this term is not as clearly defined.
- The distinction between "hot" and "cold" observables is important, as illustrated by the example of a multiplexed web socket, which must share a socket but send its own subscription and filter out a data stream.
- For further learning, resources such as RxJS workshops at RxWorkshop.com are available for those who want to delve deeper into the topic of "hot" and "cold" observables.


what is a hot observable


### What is a Hot Observable in RxJS?
A **hot observable** is an observable that shares a single underlying producer (source of data/events) among all its subscribers. This means:

- The **producer is created or activated outside of the subscription** process.
- Multiple subscribers share the **same producer instance**.
- It usually results in a **multicast** scenario, where all subscribers receive the same emitted values.
- The observable does **not create a new producer for each subscription**; instead, it "closes over" an existing producer.

### Key Characteristics
- **Producer created outside subscription:** The data source (like a WebSocket, DOM event, or timer) is set up before any subscriber subscribes.
- **Shared data source:** All subscribers listen to the same stream of data.
- **Efficient resource usage:** Useful when the producer is a scarce resource (e.g., a WebSocket connection) that should not be duplicated.
- **Multicast behavior:** Values are broadcasted to all subscribers simultaneously.

### Example
```javascript
const socket = new WebSocket('ws://someurl');

const hotObservable = new Observable((observer) => {
  socket.addEventListener('message', (event) => observer.next(event));
});
```

Here, the WebSocket connection is created **outside** the observable, so all subscribers to `hotObservable` share the same WebSocket instance.


### Why Use Hot Observables?
- To avoid creating multiple instances of expensive or limited resources.
- To share a single data stream among multiple subscribers.
- To multicast events like user interactions or live data feeds.

### Summary
A **hot observable** shares a single, externally created producer among all subscribers, enabling efficient multicasting of data streams in RxJS.



a Subject is a Proxy between an Observable and an Observer

Message: ### The Role of an RxJS Subject as a Proxy Between an Observable and an Observer

An **RxJS Subject** acts as a **proxy** that bridges the gap between an **Observable** and an **Observer** by combining their roles:

- **It is both an Observable and an Observer**:
    - As an **Observer**, it can subscribe to a source Observable and receive values.
    - As an **Observable**, it can have multiple subscribers (Observers) that listen to the values it emits.

### How the Subject Works as a Proxy
- When a Subject subscribes to a cold Observable, it **receives the emitted values** from that source.
- The Subject then **multicasts** (forwards) those values to all its own subscribers.
- This allows multiple Observers to share the same data stream from a single source, effectively **proxying** the data from the source Observable to many Observers.

### Key Benefits
- **Multicasting:** Unlike a regular Observable that creates a new producer for each subscription, a Subject shares a single producer among multiple subscribers.
- **Control:** You can manually push values into a Subject using its `next()` method, acting as an Observer.
- **Flexibility:** Subjects enable converting cold Observables into hot Observables by acting as an intermediary.

### Summary
An RxJS Subject serves as a **proxy** by subscribing to an Observable (acting as an Observer) and simultaneously exposing itself as an Observable to multiple subscribers, thus bridging and multicasting data between the source and observers.





## Sources
- [website](https://benlesh.medium.com/hot-vs-cold-observables-f8094ed53339)
