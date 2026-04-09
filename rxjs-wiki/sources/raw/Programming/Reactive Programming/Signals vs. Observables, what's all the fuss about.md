---
title: Signals vs. Observables, what's all the fuss about? 
tags:
  - "Programming/Reactive Programming"
createdAt: Sat Jan 31 2026 09:16:16 GMT+0100 (Central European Standard Time)
updatedAt: Sat Jan 31 2026 09:16:26 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Signals and Observables
- The discussion around signals and observables in frameworks has led to questions about the differences between the two, with the goal of understanding how they work and their implications.
- A value is a basic concept, represented by a simple assignment, such as `const answer = 42`, whereas a signal is created using a function like `useSignal(42)`, and an observable is created using a function like `from([42])`.
- The key difference between signals and observables lies in how their values are accessed, with signals allowing direct access to their current value using `answer.value`, and observables requiring a subscription and a callback function to receive new values over time.
- An analogy is used to illustrate the difference, where a value is like a simple reference, a signal is like a bucket that contains a value and can be read or updated, and an observable is like a pipe that delivers new values over time.

## Reactivity and Temporal Characteristics
- Signals are reactive, meaning they can notify observers when their value changes, whereas values are not reactive, and observables deliver values over time, making them inherently time-based.
- The concept of time is core to observables, whereas signals do not have a concept of time, and this difference has significant implications for how they are used and interacted with in applications.

## Access Patterns and Complexity
- Passing a container, such as a signal or observable, allows for setting up the "plumbing" of a system before the actual value is passed, and this is particularly important for observables, which are containers of values over time.
- Accessing the value of a reference, signal, or observable differs, with values being straightforward, signals requiring a getter execution, and observables requiring a subscription and callback function to receive new values.
- The fundamental choices for accessing values are invoking a function or accessing a property, which indirectly invokes the getter function, as seen in the examples `const signalValue = signal()` and `const signalValue = signal.value`.
- Accessing a value of an observable is more complicated and requires registering a callback function, which has implications such as not getting called immediately with the last value, whereas signals allow for getting a current value synchronously.

## Pull vs Push Models and Subscription Mechanisms
- Signals are pull-based, meaning the code can read the signal value synchronously, whereas observables are push-based, delivering the value to the callback when a new value shows up, highlighting a key difference between the two.
- Subscription to observables is explicit, involving invoking the subscribe method and passing in a callback, while signals often rely on implicit subscriptions, as seen in the example using `useComputed$()` and `useSignal()`.

## Execution Models and Reactivity Graphs
- Signals have a synchronous execution model, allowing for synchronous reads and writes, and often have effect APIs for processing async code, whereas observables are inherently async, with a hybrid model that combines sync and async callbacks.
- The reactivity graph in observables is typically set up during a setup phase and remains static, whereas signals have very dynamic graphs, as illustrated in the example with `location`, `zipCode`, and `preference` signals.

## Trade-offs and Spectrum of Abstractions
- The choice between signals and observables depends on the problem domain, with observables being suitable for values over time and signals being a better choice when the time component is not necessary, as using observables can bring unnecessary complexity.
- The concept of signals and observables can be thought of as a spectrum, with values on one extreme, observables on the other, and signals in the middle, each representing a tradeoff between complexity and expressivity.
- Values are simple but lack expressivity, while observables are powerful but have complex APIs, and signals offer a balance between the two, being less powerful than observables but more straightforward.

## Practical Applications and Future Outlook
- The choice between values, signals, and observables depends on the specific problem domain, and it is essential to select the right tool for the task at hand.
- When it comes to building user interfaces, or UIs, observables are often considered overkill, and signals are generally sufficient, making them a preferable choice due to their smaller API surface.
- Signals are considered the future of web frameworks because they offer the right tradeoff for most UI-related tasks, providing a more straightforward approach compared to observables, which can be too complex for many use cases.




## Sources
- [website](https://www.builder.io/blog/signals-vs-observables)
