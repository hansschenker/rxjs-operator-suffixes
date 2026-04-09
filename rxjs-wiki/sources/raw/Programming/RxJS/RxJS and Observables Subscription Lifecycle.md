---
title: RxJS and Observables: Subscription Lifecycle
tags:
  - "Programming/RxJS"
createdAt: Mon Sep 29 2025 09:52:46 GMT+0200 (Central European Summer Time)
updatedAt: Mon Sep 29 2025 09:52:53 GMT+0200 (Central European Summer Time)
---


Detailed summary

- An observable does not perform any actions on its own and simply contains stored logic, which can range from simple, such as emitting static values, to complex, such as retrieving values from an external server, and the interface and set of notifications emitted by the observable remains the same regardless of its complexity [(00:00:10)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=10s).
- When an observable is subscribed to, the code inside the observable is executed, creating a new subscription, and the observable can emit notifications, including the next notification, which is used to emit values and is passed to the observer's handler for the next notifications [(00:00:54)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=54s).
- The observable's code will continue to run and emit values until it is stopped by emitting an error or complete notification, at which point the subscription will be closed, and the teardown logic provided by the observable will be run to clean up resources [(00:01:26)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=86s).
- If an error is emitted, the error handler for the provided observer will be called, and if the complete notification is emitted, the observer's complete handler will be called, after which the observable will not be able to emit any more values [(00:01:40)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=100s).
- There are three ways a subscription can end: the observable can error, the observable can complete, or the unsubscribe method can be used, and regardless of the way the subscription ends, the teardown logic will always be run if it was provided by the observable [(00:02:44)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=164s).
- Some observables, such as an infinite interval counter, may never complete or error, requiring the use of the unsubscribe method to stop the subscription and release any resources being used [(00:02:36)](https://www.youtube.com/watch?v=bELqpDqU-z4&t=156s).




## Sources
- [website](https://www.youtube.com/watch?v=bELqpDqU-z4)
