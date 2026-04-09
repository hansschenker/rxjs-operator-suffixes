---
title: FRP - A Short Primer by Gergely Patai at Helsinki FRP Meetup April 1, 2015
tags:
  - "Programming/Functional Reactive Programming"
createdAt: Tue Jan 20 2026 08:41:37 GMT+0100 (Central European Standard Time)
updatedAt: Tue Jan 20 2026 08:42:13 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Introduction to Functional Reactive Programming (FRP)
- The topic of discussion is [[Functional reactive programming | functional reactive programming]], and it is noted that the audience is mostly unfamiliar with it, coming from a non-functional programming background [(00:00:14)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=14s).
- Functional programming is based on the concept of referential transparency, which means that any expression can be extracted into a definition or inlined without changing the behavior of the program, and this property is a prerequisite for the freedom of side effects [(00:01:18)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=78s).
- The term "reactive" was first introduced in the late 1980s and referred to programs that were embedded in an environment and had their speed determined by the environment, in contrast to interactive programs that control their own speed [(00:02:24)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=144s).
- Reactive programming, as originally conceived, is a broad term that encompasses programs that respond to their environment, and when combined with functional programming, it involves data flow and data dependencies [(00:03:17)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=197s).
- Functional reactive programming, as conceived in the mid-1990s, is based on the idea that a program with internal state and no side effects can be represented as a value that changes over time, allowing for interesting ways of composing programs [(00:03:44)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=224s).
- The original formulation of functional reactive programming distinguishes between two types of entities: behaviors and events, with behaviors being time-varying entities that are available at all times [(00:04:57)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=297s).
- Behaviors are time-varying entities that can be thought of as a type with a parameter, and they are available at all times, allowing for the composition of programs in a functional and reactive way [(00:05:12)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=312s).

## Core Concepts: Behaviors and Events
- Behaviors can be thought of as functions from time to a value, allowing for the formation of a mental model of behaviors at any point in time, where a behavior tells you what value it yielded at that time [(00:05:31)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=331s).
- A dual of behavior is an event, which is a time-varying quantity that is only present at certain discrete points of time, and can be thought of as a stream of time-stamped values [(00:05:59)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=359s).
- Examples of behaviors and events include a microphone as a behavior of type float, and a keyboard as an event of key codes, where the keyboard only gives occasional input [(00:06:24)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=384s).
- A simple program can be written to describe the behavior of a ball in a window, where the ball teleports to the mouse position when the mouse is clicked, using primitives such as snapshot and hold to combine behaviors and events [(00:06:58)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=418s).
- The snapshot primitive takes an event and a behavior, and yields an event with the same occurrences as the original event, but with values replaced by the samplings of the behavior at those times [(00:07:31)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=451s).
- The hold primitive converts an event into a behavior that always yields the last value that the event gave us, allowing for the creation of a continuous behavior from an event [(00:07:53)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=473s).
- These primitives can be defined in a generic way, allowing for the creation of complex behaviors and events, such as a ball that follows the mouse position as if connected by a spring, using integration and recursion [(00:08:42)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=522s).

## State Management and Side Effects in FRP
- The definition of such behaviors can be recursive, where the ball position is defined in terms of itself, and can be represented as a feedback loop in a data flow view [(00:09:48)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=588s).
- [[Functional reactive programming | Functional Reactive Programming]] (FRP) systems often require the introduction of explicit delays in feedback loops to produce well-defined results, and constants can be considered as a special case of behaviors that are always the same, but can also be made to depend on external inputs, such as microphone input, to create dynamic systems [(00:10:25)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=625s).
- FRP allows for the combination of stateful entities and various inputs and outputs in a straightforward manner, and it provides a lightweight way of defining stateful entities without introducing new variables or polluting the state space of the program [(00:11:21)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=681s).
- The use of FRP enables complex event handling without the need for callback hell, and it allows for the direct definition of data flow and timely behavior of programs, making it more concise and easier to understand, with explicit delays and event handling [(00:12:58)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=778s).
- FRP systems respect the property of referential transparency, which means that the system is transactional, and event propagation is atomic, ensuring that the system state is never observed in an inconsistent state, and the results are always well-defined and explicitly defined by the programmer [(00:13:45)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=825s).
- The functional programming paradigm underlying FRP ensures that there are no implicit side effects, and any state mutations must be explicitly described, with no surprises, and all dependencies must be rigorously defined, taking the principles of functional programming to the next level [(00:14:52)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=892s).

## Design Space and Building Blocks of FRP Systems
- [[Functional reactive programming | FRP]] inherits the principles of functional programming, requiring that all dependencies be explicitly mentioned, and there is no way to define an interface that would allow external mutation of internal state, instead, the logic of reconciling all dependencies must be explicitly defined [(00:15:06)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=906s).
- The design space for FRP systems has two main aspects: the choices for the main building blocks and the means of combining them, with no surprises in these aspects [(00:16:38)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=998s).
- There are two main approaches to building FRP systems: one that takes reactive values, such as events and behaviors, as the first-class elements, and another that takes transformations between these values as the basic building blocks [(00:17:01)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1021s).
- The decision between these two approaches does not affect expressiveness, but rather the suitability of the solution in certain application areas, with the value-oriented approach being more natural for textual languages and the transformer-oriented approach being more suitable for visual languages [(00:17:49)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1069s).
- In the value-oriented approach, events and behaviors are explicitly defined as types in the system, and functions combine these reactive values into new reactive values that represent a bigger program [(00:18:06)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1086s).
- The transformer-oriented approach uses a type, such as "trans", with two type variables, alpha and beta, to represent the input and output of a processing unit, and combines these transformers using functions that create new transformers [(00:19:23)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1163s).
- The two most basic combinators for combining transformers are serial combination and parallel composition, which allow for the creation of new transformers with matching input and output types [(00:19:54)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1194s).

## Testability and Dynamic Data Flow in FRP
- Testability is an interesting aspect of [[Functional reactive programming | FRP]] systems, as time-varying quantities are just values, allowing for the writing of quick check style tests for behavior over time, and the definition of invariance in terms of a verification function that returns true or false [(00:15:54)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=954s).
- Hcal arrows are a family of abstract abstractions that fit the concept of FRP, and Hcal provides syntax sugar to embed a visual graph description language, allowing for a more humanly possible way to work with these functions [(00:20:57)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1257s).
- The combination of building blocks, such as values or transformers of values, can be done in a spectrum ranging from static to dynamic, with static systems being analyzable and optimizable at compile time, but limited in their ability to change during runtime [(00:22:08)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1328s).
- Dynamic data flow, on the other hand, offers more expressiveness but may lose the ability to perform analysis and execute efficiently, and there are also hybrid solutions like Yampa that allow for some dynamism while still being predetermined [(00:22:53)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1373s).

## Dynamic Systems and Combinators in FRP
- To add dynamism to a system, higher-order combinators are needed, such as the "switch" combinator in a value-oriented approach, which gives a behavior that changes its internal structure when an event occurs [(00:23:49)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1429s).
- In a transformer-oriented approach, a combinator like "switcher" can be used, which takes a transformer and a stream as inputs, executes the transformer on the stream, and pipes its output to its own output, allowing for the definition of arbitrary dynamic graph structures [(00:24:33)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1473s).
- When defining an [[Functional reactive programming | FRP]] system, it is recommended to think about how to implement these combinators and to restrict the system as much as possible to gain extra analysis capabilities [(00:25:24)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1524s).

## Applications and Flexibility of FRP
- FRP can be thought of as a way of organizing state and state management, providing an explicit way of doing so [(00:25:49)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1549s).
- Functional Reactive Programming (FRP) can be applied in various ways, depending on the application area, and there is no one "pure" way of doing it, as it involves many design choices [(00:26:06)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1566s).
- FRP can be applied in a high-level orchestration manner, where small applications cooperate, or in a more extreme case, defining a small component in a static FRP language to get its benefits, or simply using it to inform design decisions [(00:26:29)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1589s).

## Current State and Limitations of FRP Systems
- There are no large-scale [[Functional reactive programming | FRP]] systems available, and designing software in an FRP manner is still an open question, with a recommendation to try implementing one's own system to learn from the experience [(00:27:10)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1630s).
- Concurrency and parallelism are important considerations for larger FRP systems, but many existing FRP systems are single-threaded, and managing consistency would require defining a custom runtime [(00:28:12)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1692s).
- The largest FRP systems are not well-documented, but some financial institutions are rumored to be using them, and measuring the complexity of such systems can be done using lines of code [(00:29:24)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1764s).

## Comparison with Reactive Extensions (RX) and Concurrency
- [[ReactiveX | Reactive Extensions]] (RX) are used in some applications, which is similar to FRP, but not the same, and managing the composition of multiple streams and events is a challenge in larger systems [(00:30:38)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1838s).
- The use of event buses or other mechanisms to manage event flows is necessary in larger systems, and while RX is not [[Functional reactive programming | FRP]], it is still a useful tool for reactive programming [(00:31:04)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1864s).
- The concurrency question is solved by RX, but not in a way that uses Functional Reactive Programming (FRP), and instead, it is left up to the programmer to solve these problems, particularly those related to streams or events and how the state evolves [(00:31:31)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1891s).

## Time Assumptions and Practical Implications in FRP
- Kono Elliot emphasizes the importance of behaviors being continuous, based on a time assumption, but an alternative perspective is that this is not crucial, and behaviors can be treated as discrete time values [(00:32:10)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1930s).
- In practice, using reactive programming often results in using it in a discrete time manner, despite the potential benefits of continuous time behaviors, which can provide simpler mental models [(00:32:39)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1959s).
- There is a connection between continuous time behaviors and event streams, with the possibility of having an analog of continuous time behaviors by using a ticker that is always present, and this concept is related to linear temporal logic [(00:33:14)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=1994s).
- The concepts of behaviors and events can be linked, with always occurring events being similar to behaviors, and there are analogs of events as well, but a more in-depth discussion of this topic would be too lengthy [(00:33:22)](https://www.youtube.com/watch?v=_BICQhz6tkM&t=2002s).




## Sources
- [website](https://www.youtube.com/watch?v=_BICQhz6tkM)
