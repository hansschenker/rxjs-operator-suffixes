---
title: Intro to Reactive Programming
tags:
  - "Programming"
createdAt: Thu Aug 14 2025 09:50:48 GMT+0200 (Central European Summer Time)
updatedAt: Thu Aug 14 2025 09:50:55 GMT+0200 (Central European Summer Time)
---


Concise summary

- Reactive programming is a relatively new concept in the programming world, and it helps to prevent complex issues in application development [(00:00:07)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=7s)
- Traditional object-oriented programming can be limiting when dealing with complex applications, and reactive programming offers a more efficient way to manage changes and updates [(00:01:05)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=65s)
- The concept of reactive programming is introduced as a solution to the increasing complexity of applications, which can lead to issues such as memory leaks and race conditions [(00:02:06)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=126s)


Detailed summary


## Introduction to Reactive Programming
- Reactive programming is a relatively new concept in the world of programming, and it has become increasingly important as applications have become more complex, with more features and integrations, over the past ten years [(00:00:00)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=0s).
- The complexity of applications has made it difficult to manage and maintain them, especially when combining multiple components and plugins, which can lead to a harder time understanding the total application at any point in time [(00:00:59)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=59s).
- The nature of certain server goals and the combination of various components can make it challenging to work with, and reactive programming can help prevent this complexity by indicating how to react to changes [(00:01:12)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=72s).
- One of the key aspects of reactive programming is the ability to manage complexity by breaking down the application into smaller, more manageable components, and this concept will be explored further in the discussion [(00:01:27)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=87s).
- The idea is to make it easier to reason about the application and its components, and to make it possible to manage the complexity of the application, even when there are many components and changes involved [(00:02:37)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=157s).
- In an object-oriented world, coordination between components can be challenging, but reactive programming provides a way to manage this complexity and make it easier to understand how the components interact with each other [(00:03:01)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=181s).
- As applications become more complex, it becomes increasingly important to have a way to manage the complexity, and reactive programming provides a solution to this problem by allowing developers to break down the application into smaller components and manage the flow of changes [(00:03:29)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=209s).
- The goal of reactive programming is to make it easier to develop and maintain complex applications, and to provide a way to manage the complexity of the application, even when there are many components and changes involved [(00:04:00)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=240s).

## Examples and Analogies
- Reactive programming can be done using simple object-oriented programming, but it is not very exciting and has its limitations, such as not being able to handle multiple changes at once [(00:04:15)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=255s).
- Spreadsheets have been used for decades to manage data and perform calculations, and they can be used to demonstrate the basics of reactive programming, with the value of a cell changing when the input changes [(00:05:37)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=337s).
- The use of spreadsheets can be compared to using a library like the one used by the Dutch national police, which can be used to manage and update data in real-time [(00:06:30)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=390s).
- Reactive programming can be used to notify the user of changes, such as when a value is updated, and it can be used to manage complex systems, like estate management [(00:07:20)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=440s).

## Benefits and Applications
- The use of reactive programming can help to prevent problems like memory leaks and race conditions, which can occur when using traditional programming methods [(00:08:16)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=496s).
- An example of a reactive programming application is a banking app that can be used to buy and sell items, and it can update the exchange rate in real-time using a remote service [(00:08:30)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=510s).
- The application can be used to demonstrate how reactive programming can be used to handle user input and update the data in real-time, making it a more efficient and effective way of managing complex systems [(00:08:48)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=528s).

## Implementing Reactive Programming
- The application in question involves handling exchange rates and making requests to a server, with the goal of fetching the latest exchange rate and handling potential errors or cancellations, all while ensuring reliable and efficient data processing [(00:09:14)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=554s).
- To approach this problem, it's essential to break down the application into its constituent parts, creating a map of the flow of data and identifying the key inputs and outputs, which can help simplify the implementation process [(00:10:37)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=637s).
- The application can be viewed as a series of inputs and outputs, with the goal of transforming the inputs into the desired outputs, and using operators to handle the flow of data and manage potential errors or cancellations [(00:10:52)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=652s).
- One approach to implementing this application is to use reactive programming libraries, which provide a range of operators for handling asynchronous data streams and managing the flow of data, such as the ReactiveX library [(00:12:43)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=763s).
- By using these libraries and operators, it's possible to create a robust and efficient implementation of the application, handling errors and cancellations in a straightforward and reliable way, and ensuring that the application remains responsive and performant [(00:12:56)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=776s).
- To demonstrate this approach, the application can be implemented using a reactive programming library, starting with a simple input field and stream of updates, and then using operators to transform the input data into the desired output, handling errors and cancellations as needed [(00:13:07)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=787s).
- The use of operators such as switchMap can help simplify the implementation process, allowing the application to handle complex data flows and error handling in a straightforward and efficient way [(00:13:54)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=834s).

## Conclusion and Further Learning
- The discussion begins with an introduction to reactive programming, mentioning a project that utilizes a multi-protection expression and listens to updates from a service, with the goal of managing and working with code in an application [(00:14:03)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=843s).
- The application is described as having various levels, including a Mikado level, and uses estate management and libraries to handle tasks and updates, with the speaker mentioning their name as Michael van der Linden [(00:14:09)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=849s).
- The speaker invites viewers to reach out on Twitter with questions and expresses interest in projects related to reactive programming and JavaScript, also mentioning touchpad management [(00:14:40)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=880s).
- The introduction to reactive programming is part of a larger view of supporting and managing resources, with the speaker thanking viewers for watching and encouraging them to enjoy the first few steps on the way to learning reactive programming [(00:14:56)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=896s).
- Michael van der Linden is mentioned as the person to contact for further information and discussion on reactive programming and related topics, with the speaker concluding the introduction and inviting viewers to continue learning [(00:15:05)](https://www.youtube.com/watch?v=Bme_RiT9CK4&t=905s).


What Software Patterns does Reactive Programming have


# Software Design Patterns Commonly Used in Reactive Programming
Reactive programming involves managing asynchronous data streams and handling changes efficiently. Several software design patterns are commonly employed to achieve this:


### 1. Observer Pattern
- **Description:** This is a fundamental pattern in reactive programming where components (observers) subscribe to data streams (observables) and get notified automatically when data changes.
- **Use:** It helps in managing updates and changes in real-time, similar to how spreadsheet cells update when input changes.

### 2. Publisher-Subscriber Pattern
- **Description:** Similar to the observer pattern but often used in distributed systems, where publishers emit events and subscribers listen to those events.
- **Use:** Enables decoupling of components and efficient event handling in complex applications.

### 3. Functional Reactive Programming (FRP) Patterns
- **Description:** These patterns involve using pure functions and immutable data streams to handle asynchronous events.
- **Use:** Helps in composing complex data flows and transformations using operators like `map`, `filter`, and `switchMap`.

### 4. Chain of Responsibility
- **Description:** This pattern allows passing data through a chain of processing steps (operators) where each step can handle or transform the data.
- **Use:** Used in reactive libraries to process streams through a series of operators.

### 5. State Management Patterns
- **Description:** Managing state reactively by breaking down the application into smaller components that react to state changes.
- **Use:** Helps in making complex applications easier to reason about and maintain.

### Additional Notes
- Reactive programming libraries like ReactiveX provide a rich set of operators that embody these patterns, enabling efficient handling of asynchronous data streams, error handling, and cancellation [(00:45:00)](https://www.youtube.com/watch?v=Bme_RiT9CK4).


---

If you want to explore these patterns further, focusing on the Observer and Publisher-Subscriber patterns is a good starting point, as they form the backbone of reactive programming.



what is the difference between the Subject/Observer pattern and the Publisher/Subscriber pattern

Message:


# Difference Between Subject/Observer Pattern and Publisher/Subscriber Pattern in Reactive Programming

### Subject/Observer Pattern
- **Description:** In this fundamental pattern, components called observers subscribe directly to a data source known as the subject (or observable). When the subject's data changes, it notifies all its subscribed observers automatically.
- **Use:** It is primarily used for managing updates and changes in real-time within a single application or system. Observers have a direct relationship with the subject and receive updates immediately when data changes [(00:45:00)](https://www.youtube.com/watch?v=Bme_RiT9CK4).

### Publisher/Subscriber Pattern
- **Description:** This pattern is similar to the observer pattern but is often used in distributed systems. Publishers emit events without knowledge of the subscribers, and subscribers listen to these events through an intermediary (like an event bus or message broker).
- **Use:** It enables decoupling of components, allowing publishers and subscribers to operate independently. This pattern is efficient for event handling in complex or distributed applications where components do not need to be directly aware of each other [(00:45:00)](https://www.youtube.com/watch?v=Bme_RiT9CK4).

### Summary of Differences
- **Direct vs Indirect Communication:** Observer pattern involves direct subscription to the subject, while Publisher/Subscriber uses an intermediary to decouple publishers and subscribers.
- **Scope:** Observer is typically used within a single application context; Publisher/Subscriber is suited for distributed or complex systems.
- **Coupling:** Observer pattern has tighter coupling between subject and observers; Publisher/Subscriber promotes loose coupling.
This distinction helps in choosing the appropriate pattern based on the application's architecture and complexity.





## Sources
- [website](https://www.youtube.com/watch?v=Bme_RiT9CK4)
