---
title: RxJS Patterns
tags:
  - "Programming/RxJS"
createdAt: Wed Dec 10 2025 12:19:40 GMT+0100 (Central European Standard Time)
updatedAt: Wed Dec 10 2025 12:58:50 GMT+0100 (Central European Standard Time)
---


Rxjs is the combination of the Iterator Pattern with the Subject/Observer Pattern

Message: # RxJS as a Combination of the Iterator Pattern and the Subject/Observer Pattern


## Overview
RxJS integrates two fundamental design patterns to handle asynchronous data streams effectively:

1. **Iterator Pattern:**
    - Represents a sequence of values that can be accessed one at a time.
    - Observables in RxJS act as producers of a sequence of future values or events, which observers consume.
2. **Subject/Observer Pattern:**
    - Involves a subject (or observable) that maintains a list of observers and notifies them of new data or events.
    - Subjects in RxJS act both as observers and observables, allowing multicasting of values to multiple subscribers.

## How RxJS Combines These Patterns
- **Observable as Iterator:**
    - An Observable produces a stream of values over time, similar to how an iterator produces a sequence of values on demand.
    - Observers subscribe to these streams to receive notifications such as `next`, `error`, and `complete` events. [(00:08:13)](https://www.youtube.com/watch?v=SmDDEaglAd4) ([[RxJS Patterns | RxJS Explained]])
- **Subject as Proxy and Multicaster:**
    - A Subject implements both the Observer and Observable interfaces.
    - It can subscribe to a source Observable (acting as an observer) and simultaneously expose itself as an Observable to multiple subscribers.
    - This allows it to multicast values from the source to many observers, effectively acting as a proxy.
    - Subjects maintain an internal list of observers and notify them when new data arrives. ([[RxJS Patterns | RxJS Explained]]), ([[Rxjs On The Subject Of Subjects (in RxJS) | On The Subject Of Subjects (in RxJS)]])

## Benefits of This Combination
- **Multicasting:**
    - Unlike plain Observables that create a new producer for each subscription, Subjects share a single producer among multiple subscribers.
- **Flexibility:**
    - Subjects allow converting cold Observables (which start producing data upon subscription) into hot Observables (which produce data regardless of subscriptions).
- **Statefulness:**
    - Subjects keep track of their subscribers, enabling manual pushing of values and control over the data flow.

## Summary
RxJS combines the Iterator Pattern’s concept of sequential data production with the Subject/Observer Pattern’s mechanism for managing multiple subscribers and multicasting, providing a powerful and flexible model for reactive programming. ([[RxJS Patterns | RxJS Explained]])





