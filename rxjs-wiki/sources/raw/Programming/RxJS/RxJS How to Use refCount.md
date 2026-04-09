---
title: RxJS: How to Use refCount
tags:
  - "Programming/RxJS"
createdAt: Sun Sep 28 2025 07:07:19 GMT+0200 (Central European Summer Time)
updatedAt: Sun Sep 28 2025 07:07:25 GMT+0200 (Central European Summer Time)
---


Concise summary

- The `refCount` operator in [[rxjs | RxJS]] maintains a reference count of subscribers and automates the unsubscription of the subject from the source observable when the reference count drops to zero.
- `refCount` can be used with `publish`, `publishBehavior`, `publishReplay`, and `publishLast` to automate unsubscription and re-subscription to source observables.
- When using `refCount` with source observables that complete, `publishReplay` and `publishLast` behave as expected, while `publish` and `publishBehavior` do not behave in a useful manner for late subscriptions.
- The `shareReplay` operator is similar to `pipe(publishReplay(), refCount())`, but has different behavior in certain situations, such as when the reference count drops to zero and the subject has not completed.




## Sources
- [website](https://ncjamieson.com/how-to-use-refcount/)
