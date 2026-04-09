---
title: Learning Observable By Building Observable
tags:
  - "Programming/RxJS"
createdAt: Sun Sep 28 2025 11:39:53 GMT+0200 (Central European Summer Time)
updatedAt: Sun Sep 28 2025 11:40:14 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Understanding Observables
- The concept of observables in RxJS is often misunderstood, with people comparing them to promises, which can be misleading as observables are more different from promises than they are similar, with promises always being multicast and having async resolution and rejection, whereas observables are sometimes multicast and usually async.
- Observables can be better understood by writing one, which is not as hard as it sounds, and involves creating a function that takes an observer and returns a function, with the purpose of connecting the observer to a producer and returning a means to tear down that connection.
- The shape of an [[Observable | observable]] involves a function that accepts an observer, an object with `next`, `error`, and `complete` methods, and returns a cancellation function, as seen in the basic implementation example provided, which includes setting up a datasource and handling events.
- Observers are the workhorse of reactive programming, staying active and listening for events from producers, and can be any Plain-Old [[JavaScript]] Object (POJO) with `next`, `error`, and `complete` methods, but in RxJS 5, guarantees are provided to ensure safe observer implementation.

## Observer Guarantees
- The observer guarantees in RxJS 5 include ensuring that if an observer does not have all methods implemented, it will still work, and that calls to `complete` and `error` will call unsubscription logic, and if a handler throws an exception, unsubscription logic will be called to prevent resource leaks.
- To accomplish these guarantees, a "SafeObserver" is used to wrap the anonymous observer provided, enforcing the guarantees and ensuring safe and reliable operation, with `next`, `error`, and `complete` being optional and allowing for handling of one or two of these events.
- The implementation of an [[Observable | observable]] requires tracking whether `complete` or `error` have been called, as well as handling the unsubscription logic, which can be achieved by using a SafeObserver to wrap the observer and provide better ergonomics for the developer-user.

## Implementing Observables
- Having observables as a class or object enables the easy application of a SafeObserver to passed anonymous observers and handler functions, allowing observables to be defined in a simple way, as seen in the example of `const myObservable = new Observable((observer) => { ... });`.
- Operators in RxJS are essentially functions that take a source observable and return a new observable that will subscribe to the source observable when subscribed to, and can be implemented as standalone functions, such as the `map` operator, which takes a source observable and a project function and returns a new observable.

## Operators and Operator Chains
- Building operator chains involves creating a template for wiring observers together on subscription, and while implementing operators as standalone functions can lead to unreadable code when chaining multiple operators, using a class-based approach with methods like `map` can provide a more natural and readable way of chaining operators, such as `myObservable.map(x => x + 1).map(x => x + 2)`.
- The use of a class-based approach for observables and operators allows for a more ergonomic and readable implementation, although it may come at the cost of adding complexity to the prototype with many operators, and alternative approaches like using a `pipe` implementation can also be used to reduce the complexity of operator chaining.
- The map operator is added to the [[Observable]] implementation's prototype, allowing for a nicer syntax, as demonstrated by the code `Observable.prototype.map = function (project) { return new Observable((observer) => { const mapObserver = { next: (x) => observer.next(project(x)), error: (err) => observer.error(err), complete: () => observer.complete() }; return this.subscribe(mapObserver); });}`.

## Benefits and Best Practices
- This approach has additional benefits, such as enabling the creation of subclasses of Observable for specific types of observables, like those wrapping a Promise or a set of static values, and allowing for optimizations by overriding operators for those subclasses.
- Observables are essentially functions that take an observer and return a function, with their behavior depending on the implementation, and they should be treated as function references rather than stateful objects.
- When building operator chains, the process involves composing a function that sets up a chain of linked observers, which pass values through to the final observer.
- The example [[Observable]] implementations provided return functions, whereas RxJS and the es-observable spec return Subscription objects, which are considered a better design, but were not used in the examples to keep them simple.




## Sources
- [website](https://benlesh.medium.com/learning-observable-by-building-observable-d5da57405d87)
