---
title: Understanding Functional Reactive Programming With Plumbing, N1, & Email
tags:
  - "Programming/RxJS"
createdAt: Thu Aug 14 2025 10:02:55 GMT+0200 (Central European Summer Time)
updatedAt: Thu Aug 14 2025 10:03:44 GMT+0200 (Central European Summer Time)
---


Concise summary


## Intro [(00:00:00)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=0s)
- The topic of discussion is building declarative functional reactive programming, with the goal of demystifying related concepts and explaining their benefits [(00:00:23)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=23s)
- The discussion is based on the experience of building an email client called N1 [(00:00:37)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=37s)
- The talk aims to provide an intuition about functional reactive programming and its applications [(00:00:31)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=31s)

## What is N1 [(00:00:37)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=37s)
- N1 is an email client written entirely in [[JavaScript]], designed to be extensible and fully open source [(00:00:46)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=46s)
- The design patterns used in N1 can be found online due to its open-source nature [(00:01:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=61s)

## What is an event [(00:01:06)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=66s)
- An event is compared to a bell, where a callback is bound to it, and this callback might have another callback, leading to a series of actions [(00:01:35)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=95s)
- The concept of promises is used to help chain these callbacks together [(00:01:50)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=110s)

## Pipelines [(00:02:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=153s)
- Pipelines represent abstract functions with inputs, processing, and outputs, which can be composed together [(00:02:40)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=160s)
- These pipelines do not leak and have no side effects, making them strictly functional [(00:02:54)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=174s)

## Declarative [(00:03:12)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=192s)
- Declarative programming involves declaring how pieces are connected instead of coding the process of data change [(00:03:20)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=200s)
- This approach is similar to how Excel works, where cells are functions of other cells, and updates are automatic [(00:03:42)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=222s)

## Applications [(00:03:56)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=236s)
- The concept of pipelines and declarative programming can be applied to various fields, including signal processing and aerospace engineering [(00:04:12)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=252s)
- It is argued that this way of thinking is natural and intuitive, especially when building complex applications [(00:04:36)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=276s)

## Frameworks [(00:05:10)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=310s)
- Frameworks like [[Redux (JavaScript library) | Redux]] and [[Elm (programming language) | Elm]] enforce the concepts of functional reactive programming, using reducers and update functions to structure apps [(00:05:50)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=350s)
- [[ReactiveX]] is another framework that uses observers and asynchronous data streams to process and [[React (software) | react]] to changing data [(00:06:48)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=408s)

## N1 Example [(00:07:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=453s)
- N1 is an email client built with [[JavaScript]], HTML, and CSS, using React for rendering, and has a large amount of data that is cached locally and updated frequently [(00:07:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=453s)
- The app uses a local SQLite database to store email data and allows third-party plugins to update the data, requiring a robust data model to keep the state and view in sync [(00:08:07)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=487s)
- The app combines the database with the Rx library to create an event emitter that processes data and triggers updates to the view whenever the data changes [(00:08:48)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=528s)

## Conclusion [(00:10:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=601s)
- Thinking declaratively helps to turn coding into a "plumbing problem" where the focus is on wiring things up correctly to get the data where it needs to be [(00:10:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=601s)
- Thinking functionally helps to keep unwanted side-effects at bay and ensures consistent inputs and outputs, which is helpful for building systems like N1 [(00:10:21)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=621s)
- Thinking reactively is essential for building apps that handle constantly changing data, and it's helpful to think of the system in terms of pipeline-driven data flows [(00:10:41)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=641s)


Detailed summary


## Intro [(00:00:00)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=0s)
- The presentation is given by Evan Morikawa, who will be discussing building declarative functional reactive programming, with a unique analogy of being a plumber, and also touching on building a mail client [(00:00:00)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=0s).
- The topic of discussion includes demystifying the concepts of declarative functional reactive programming and providing an intuition of what these terms mean [(00:00:10)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=10s).
- The presentation has two major goals: the first is to clarify the meaning of terms related to declarative functional reactive programming, and the second is to explain the benefits of using this pattern [(00:00:23)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=23s).
- Evan Morikawa aims to show the benefits of using declarative functional reactive programming, highlighting its advantages and why it is used [(00:00:31)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=31s).

## What is N1 [(00:00:37)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=37s)
- N1 is an email client built by Annihilus, and it is written entirely in [[JavaScript]], allowing it to run on desktop devices including Mac, Windows, or Linux [(00:00:37)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=37s).
- The N1 email client is designed to be extensible from the ground up, utilizing modern web technology to achieve this goal [(00:00:53)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=53s).
- The N1 email client is fully open source, making its design patterns publicly accessible online for reference and further development [(00:01:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=61s).

## What is an event [(00:01:06)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=66s)
- The concept of an event, such as a click event, can be imagined as a bell that triggers a response, and this response is typically handled by a callback that may have additional callbacks, leading to a series of actions [(00:01:06)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=66s).
- The use of callbacks to handle events can result in a complicated programming model, especially when dealing with multiple events, and this complexity can be mitigated with the help of promises to chain these callbacks together [(00:01:41)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=101s).
- As the number of events grows, the traditional programming model of listening to events and handling their actions can become increasingly complicated, particularly if the callbacks have side effects and mutate state, making it difficult to manage the pipeline [(00:02:05)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=125s).
- Instead of focusing on individual events and their callbacks, it's possible to think about the concept of pipelines, which can help simplify the handling of events and their associated actions [(00:02:27)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=147s).
- The traditional programming model of handling events with callbacks can lead to issues such as unintended side effects and state mutations, making it essential to consider alternative approaches to managing events and their consequences [(00:02:13)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=133s).

## Pipelines [(00:02:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=153s)
- Functions have an input, perform a specific operation, and produce an output, allowing them to be composed together to achieve more complex tasks, which is a fundamental concept in functional programming [(00:02:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=153s).
- The composition of functions is based on a strict contract, where the input and output of each function remain consistent, ensuring that the outcome is always the same, given the same input [(00:02:48)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=168s).
- These functions, represented as pipes, do not have side effects or leaks, meaning that they do not modify external state or produce unexpected results, making it possible to chain them together to build applications [(00:02:54)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=174s).
- The ability to wire up an application using a series of composed functions enables the creation of complex systems, relying on the predictable behavior of each individual function [(00:03:00)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=180s).

## Declarative [(00:03:12)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=192s)
- Declarative programming allows for the declaration of how inputs and outputs are connected in a system, rather than coding the exact process of data changes [(00:03:12)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=192s).
- This type of programming enables a declarative way of expressing connections between different pieces of a system, making it possible to connect and declare how everything is connected to each other [(00:03:20)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=200s).
- Declarative programming is a familiar concept that appears in various forms, including Excel, where cells can be defined as functions of other cells, and updates are automatic without the need for programming loops [(00:03:32)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=212s).
- In Excel, the declarative approach involves wiring a system together by specifying the relationships between cells, rather than coding the steps to achieve the desired result, allowing the system to update automatically as data changes [(00:03:42)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=222s).

## Applications [(00:03:56)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=236s)
- The basic concept of functional reactive programming can be applied to arbitrarily complex systems and has numerous applications beyond programming, including non-programming contexts such as aerospace engineering and signal processing [(00:03:56)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=236s).
- In signal processing, for example, function blocks are used to perform basic tasks without side effects, and they can be wired together to process signals and produce output, similar to how components are wired together in a circuit [(00:04:19)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=259s).
- The concept of wiring together individual functions to create complex systems is a natural way of thinking in the context of circuits, and it can also be extremely useful when building large, complex applications in a programming context [(00:04:46)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=286s).
- This approach to thinking about complex systems can be intuitive, even for those without a background in signal processing, and it can be applied to a wide range of fields, including MATLAB Simulink signal processing [(00:04:31)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=271s).
- The idea of breaking down complex systems into smaller, functional components that can be wired together to produce a desired output is a key aspect of functional reactive programming, and it can be used to create complex systems in a predictable and functional way [(00:04:53)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=293s).

## Frameworks [(00:05:10)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=310s)
- The concept of functional reactive programming is gaining traction in the [[JavaScript]] world, with frameworks like [[Redux (JavaScript library) | Redux]], which is commonly associated with [[React (software) | React]], taking these concepts to heart and bringing a state and an action through a set of functions called a reducer to produce a new state [(00:05:28)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=328s).
- Redux is entirely functional in nature, designed to structure apps in a way that is robust to changes, and is compared to other frameworks like [[Elm (programming language) | Elm]], which enforces these concepts at its core and compiles into JavaScript, HTML, and CSS [(00:05:50)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=350s).
- Elm has a similar fundamental concept to Redux, where a model is pushed through an update function to produce a new model that can be used to render a view, and is a strong inspiration for the creation of Redux [(00:06:18)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=378s).
- Another framework, [[ReactiveX]], a Microsoft project, uses the same basic concept, where asynchronous data streams, called observers, are processed to produce output that can be subscribed to, emphasizing the reactive concept due to the constantly changing nature of the data [(00:06:42)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=402s).
- ReactiveX's approach allows for a pipeline of data to be updated and flushed through as soon as new data is available, enabling the application to immediately react to changes, and is one of the pieces that help construct new types of applications [(00:07:00)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=420s).
- The frameworks mentioned, including Redux, Elm, and ReactiveX, all share the concept of taking input, processing it through a set of functions, and producing output, which is used to render a view or react to changes, and are designed to structure apps in a robust and reactive way [(00:05:10)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=310s).

## N1 Example [(00:07:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=453s)
- N1 is an email client that functions like a native desktop app but is actually built using [[JavaScript]], HTML, and CSS, with everything rendered by [[React (software) | React]] and running on JavaScript, allowing it to be built and extended like a JavaScript app, with a local large SQLite database backing the whole thing [(00:07:33)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=453s).
- The email client has a huge amount of data, including hundreds of thousands of threads and gigabytes of data, which is cached locally, and the data is updated frequently, making it necessary to have a data model that helps keep the data in check to avoid runtime errors due to state and view being out of sync [(00:08:07)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=487s).
- To keep the thread list in sync and scrolling, the email client combines the database with the Rx library, creating an event emitter that processes the data as needed, and at the bottom of the pipeline, there is a method that triggers every time the data changes, providing fresh data that is declaratively hooked up to the views [(00:08:41)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=521s).
- The pipeline gets run anytime the database changes, making the system extremely robust to changes when there is a lot of data changing quickly from different sources, including third-party packages that may be updating the data [(00:09:20)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=560s).
- The database is at the top of the pipeline, allowing data to be queried, sliced, sorted, filtered, and mapped, resulting in a robust data source that maps straight back to the views, making it easy to manage the large amount of data [(00:09:48)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=588s).

## Conclusion [(00:10:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=601s)
- Thinking declaratively can help turn coding into a plumbing problem, where the focus is on wiring things up correctly to get data to where it needs to be, rather than worrying about the state at all times [(00:10:01)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=601s).
- Thinking functionally is about keeping unwanted side-effects, such as prints, at bay, and keeping the inputs and outputs consistent, which helps build systems like this by preventing pipes from leaking [(00:10:21)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=621s).
- Thinking reactively forces developers to build systems that can handle constantly changing data, which is particularly helpful for apps that listen to changing data sources, such as sockets or databases [(00:10:41)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=641s).
- Considering the system in terms of pipeline-driven data flows, rather than event-driven data flows, can help keep the app growing and expanding, as it has done in this case [(00:11:03)](https://www.youtube.com/watch?v=Y0bN7WmMGmg&t=663s).




## Sources
- [website](https://www.youtube.com/watch?v=Y0bN7WmMGmg)
