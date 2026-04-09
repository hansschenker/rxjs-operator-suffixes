---
title: RxJS Subscriber Responsibilities
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:26:53 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 13:00:40 GMT+0100 (Central European Standard Time)
---


What are the responsibilities of a Subscriber


# Responsibilities of an RxJS Subscriber (Observer)

## Core Responsibilities
- **Consume Data Streams:**
A Subscriber acts as a consumer of data emitted by an Observable. It listens to the stream of values or events produced.
- **Implement Handlers for Notifications:**
The Subscriber provides functions or methods to handle three types of notifications from the Observable:
    - `next(value)`: Processes each emitted value.
    - `error(err)`: Handles any error that occurs during the stream.
    - `complete()`: Handles the completion of the stream.
- **Subscribe to Observables:**
The Subscriber subscribes to an Observable to start receiving data. This subscription sets up the connection between the producer (Observable) and the consumer (Subscriber).
- **Stay Active Until Termination:**
The Subscriber remains active and listens for events until the Observable either completes or errors out.
- **Manage Unsubscription:**
The Subscriber can unsubscribe to stop receiving notifications and to clean up resources, preventing memory leaks.

## Additional Details
- Subscribers can be plain JavaScript objects with `next`, `error`, and `complete` methods.
- RxJS internally wraps Subscribers with a SafeObserver to ensure safe and reliable operation, even if some handlers are missing or throw exceptions.
- Subscribers handle asynchronous data pushed by Observables, enabling reactive programming patterns. [(00:08:13)](https://www.youtube.com/watch?v=SmDDEaglAd4) ([[Learning Observable By Building Observable]])


---

In summary, a Subscriber in RxJS is responsible for consuming data streams by implementing handlers for emitted values, errors, and completion signals, managing the subscription lifecycle, and reacting appropriately to the asynchronous data flow from Observables.





