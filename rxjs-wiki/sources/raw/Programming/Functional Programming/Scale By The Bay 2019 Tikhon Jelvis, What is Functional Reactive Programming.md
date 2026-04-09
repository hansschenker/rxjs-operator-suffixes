---
title: Scale By The Bay 2019: Tikhon Jelvis, What is Functional Reactive Programming?
tags:
  - "Programming/Functional Programming"
  - "Functional Reactive Programming"
createdAt: Fri Dec 26 2025 17:51:37 GMT+0100 (Central European Standard Time)
updatedAt: Fri Dec 26 2025 17:51:43 GMT+0100 (Central European Standard Time)
---




Concise summary


## Intro [(00:00:01)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1s)
- [[Functional reactive programming]] is a beautiful idea that helps maintain a functional style while solving a wider range of problems [(00:00:42)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=42s)
- It is an abstraction that is hard to find good introductory resources for, making it difficult to build up an intuition for what it is [(00:00:27)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=27s)
- Functional reactive programming is one of the best answers for how functional programming can solve a wider range of problems [(00:00:42)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=42s)

## What is Functional Reactive Programming [(00:00:49)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=49s)
- Functional reactive programming is an abstraction that is very abstract, making it hard to find good introductory resources [(00:00:57)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=57s)
- To understand it, one needs to answer two questions: what the abstraction is and how it is used [(00:01:46)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=106s)
- The abstraction needs to be defined clearly, and its meaning and purpose need to be understood [(00:01:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=119s)

## What is Reactive Programming [(00:03:41)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=221s)
- Reactive programming means writing programs that can change over time and interact with events happening elsewhere in the code or outside the program [(00:04:02)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=242s)
- It is about programming with time and responding to events and changes over time [(00:04:41)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=281s)

## What does Functional mean [(00:04:50)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=290s)
- [[Functional reactive programming]] is a functional style abstraction, built along the same ideas as functional programming [(00:05:21)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=321s)
- It has three key points: it is explicit, composable, and declarative, making time and changes over time more explicit [(00:05:46)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=346s)

## Functional Reactive Programming [(00:07:36)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=456s)
- Functional reactive programming provides abstractions for working with time-varying values, including behaviors and events, to represent changing values over time [(00:07:46)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=466s)
- Behaviors represent continuously changing values, such as the mouse position, while events represent discrete points in time, like a mouse click [(00:08:17)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=497s)
- The combination of behaviors and events allows for explicit expression of logic, similar to imperative programming with mutable state and callbacks [(00:10:24)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=624s)

## Why Functional Programming [(00:11:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=719s)
- [[Functional reactive programming]] is an answer to the question of whether functional programming can handle reactive programming, providing a way to write code that interacts with the world [(00:12:39)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=759s)
- Functional programming can do reactive programming, and functional reactive programming is a way to achieve this [(00:13:00)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=780s)

## Examples [(00:13:09)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=789s)
- Functional reactive code typically follows a pattern of inputs (events and behaviors), combinators to combine them, and output functions to interact with the real world [(00:13:43)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=823s)
- The inputs, combinators, and outputs can be applied to various domains, including UI code, robotics, and simulation, with the same underlying abstractions [(00:14:40)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=880s)

## Combinators [(00:16:20)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=980s)
- Combinators are used to build up values in code, with examples including the "when" Combinator, which filters events based on a behavior, and the "map" Combinator, which applies a function to a behavior [(00:16:20)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=980s)
- The "when" Combinator is useful for expressing relationships between events, such as detecting a shift-click [(00:16:51)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1011s)
- The "map" Combinator is useful for encoding logical business rules, such as warning the user if the audio level gets too loud [(00:17:48)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1068s)

## Example [(00:19:53)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1193s)
- A simple [[Conway's Game of Life | game of life]] is used as an example to demonstrate how to use Combinators and outputs in [[Functional reactive programming | functional reactive programming]] [(00:19:53)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1193s)
- The game of life example involves creating a grid, a pause button, and handling user input to modify the grid [(00:20:08)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1208s)
- The example uses a stream of events to represent updates to the game state, and folds these events into a behavior that represents the current state of the game [(00:22:21)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1341s)

## UI [(00:25:30)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1530s)
- The UI behavior is factored into a high-level representation, allowing for easy expression of various UI elements, such as a pause button that switches icons based on the game's state [(00:25:30)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1530s)
- A relatively small amount of code can encode a large number of features, including animation, pause button, and user control, making it easy to manage interactions [(00:26:24)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1584s)
- [[Functional reactive programming | Functional Reactive Programming]] (FRP) makes it easy to add new features without significantly changing existing code, such as adding a generation counter or new controls [(00:26:51)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1611s)

## Introduction to FRP [(00:28:26)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1706s)
- FRP is a functional style programming paradigm that deals with programming over time, allowing for a high-level representation of behaviors and interactions [(00:28:26)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1706s)
- The term "functional" in FRP can be misleading, but understanding it as a functional style programming paradigm is enough to get started with learning [(00:28:34)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1714s)
- FRP enables easy addition of new features and controls without requiring significant changes to existing code, making it a powerful programming paradigm [(00:28:40)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1720s)


Detailed summary


## Intro [(00:00:01)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1s)
- [[Functional reactive programming]] is a topic that will be explored, with the goal of providing a clear answer to the question of what it is [(00:00:01)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1s).
- The question of what functional reactive programming is has been asked repeatedly, including on the internet, Stack Overflow, and in person, but a good introductory resource is surprisingly hard to find [(00:00:11)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=11s).
- Despite the lack of introductory resources, functional reactive programming is considered a beautiful idea and a key solution for maintaining a functional style while solving a wider range of problems in functional programming [(00:00:42)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=42s).

## What is Functional Reactive Programming [(00:00:49)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=49s)
- Functional reactive programming is an abstraction, and its abstract nature explains why it is challenging to find introductory resources and build an intuition for the concept [(00:00:49)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=49s).
- The difficulty in teaching abstract concepts, including [[Functional reactive programming | functional reactive programming]], monads, and category theory, lies in presenting clear answers to what the abstraction is and how it is used, as abstractions do not directly map to familiar ideas [(00:01:24)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=84s).
- To understand functional reactive programming, it is essential to define it and provide enough detail, but also to explain why it is interesting and what it is trying to accomplish, as humans cannot think about formal rules without additional context [(00:01:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=119s).
- The definition of functional reactive programming must be accompanied by an explanation of its purpose and meaning, as merely defining it is not enough to link the details to its actual use or thought process [(00:02:32)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=152s).
- Understanding the components of functional reactive programming, such as the meaning of "reactive," is crucial, and the term "reactive" has become a buzzword, but its definition as "tending to react" is not useful in this context [(00:03:18)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=198s).
- A comprehensive understanding of functional reactive programming requires addressing both the formal definition and the context in which it is used, as well as providing a clear explanation of its purpose and how it is applied [(00:03:03)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=183s).

## What is Reactive Programming [(00:03:41)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=221s)
- Reactive programming is a specific context of programming jargon and cannot be looked up in the dictionary, and in the context of [[Functional reactive programming | functional reactive programming]], it means writing programs that can change over time [(00:03:41)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=221s).
- Reactive programming involves writing programs that care about their behavior over time and how they interact with other components over time, which may include responding to events happening elsewhere in the code or outside the program [(00:04:02)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=242s).
- The program may need to respond to events or changes occurring outside of the program, potentially even in the real world, highlighting the importance of time in reactive programming [(00:04:24)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=264s).
- Functional reactive programming is an abstraction for thinking about and programming with time, allowing developers to handle time-related aspects of their programs in a more structured way [(00:04:41)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=281s).

## What does Functional mean [(00:04:50)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=290s)
- The term "functional" has no clear or concise definition, and in the context of [[Functional reactive programming | functional reactive programming]], it refers to a style of abstraction that is built on ideas similar to those found in functional programming, with key characteristics that define it as a functional style abstraction [(00:04:50)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=290s).
- A functional style abstraction is defined by three main points: it is explicit, meaning that all salient parts of the abstraction are defined within the abstraction itself, without relying on implicit features of the language, and in the case of functional reactive programming, time and how things change over time are fundamental parts of the abstraction [(00:05:29)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=329s).
- Functional reactive programming makes time and how things change over time more explicit, unlike imperative programming, which often works with time implicitly by relying on the current state of mutable variables, and this explicitness is similar to how functional programming makes connections between data more explicit [(00:06:11)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=371s).
- Functional reactive programming is designed to be composable, allowing users to write reactive systems out of small, reusable parts and build larger systems from these parts, with the goal of creating a modular and flexible system [(00:06:34)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=394s).
- Functional reactive programming needs to be declarative, providing a way to talk about behavior over time without needing to specify all the details of how it is executed, and instead abstracting over the specific details of what happens in the actual machine [(00:06:52)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=412s).
- The goal of functional reactive programming is to abstract over the specific details of how information is processed and transmitted between the program and the outside world, allowing users to focus on the high-level behavior of the system rather than the low-level details [(00:07:09)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=429s).

## Functional Reactive Programming [(00:07:36)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=456s)
- [[Functional reactive programming]] provides specific abstractions for working with time-varying values, allowing for the representation of values that change over time, such as a number that can continuously change, with two main abstractions being behaviors and events [(00:07:36)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=456s).
- Behaviors, such as the position of a mouse, represent values that can change continuously over time, making it easier to express certain concepts without being limited by discrete events, and can be thought of as functions from time to a value [(00:08:06)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=486s).
- Events, on the other hand, represent discrete points in time, such as a mouse click or key press, and can be thought of as a list of time-value pairs, providing a way to capture specific events that occur at specific points in time [(00:09:50)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=590s).
- The combination of behaviors and events allows for the explicit expression of logic that would otherwise be written using mutable state, callbacks, and event handlers in an imperative setting, providing a more declarative approach to programming [(00:10:24)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=624s).
- A key idea in functional reactive programming is to have a simple model for what a behavior and an event is, with behaviors being functions from time to a value and events being discrete points in time, allowing for a powerful mental model for how behaviors behave and can be composed [(00:10:46)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=646s).
- The use of behaviors and events provides a declarative approach to programming, with clearly defined semantics that can be used to think about the abstractions, making it easier to reason about and compose behaviors and events [(00:11:25)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=685s).

## Why Functional Programming [(00:11:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=719s)
- [[Functional reactive programming]] involves programming with time-varying abstractions, including behaviors and events, which sets the stage for exploring its potential [(00:11:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=719s).
- One of the main reasons for using functional reactive programming is that it addresses a limitation of functional programming, which is not well-suited for handling certain tasks without abstraction, such as reactive programming [(00:12:14)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=734s).
- Some people believe that functional programming is not capable of handling certain tasks, such as input/output operations, and that it requires an imperative or object-oriented approach, but functional reactive programming provides an alternative solution [(00:12:22)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=742s).
- The concept of monads is sometimes cited as a hack that supposedly disproves the effectiveness of functional programming, but functional reactive programming offers a more comprehensive answer to the question of whether functional programming can handle reactive programming tasks [(00:12:33)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=753s).
- The goal is to demonstrate that functional programming can, in fact, handle various tasks, including reactive programming, and provide a positive answer to the question of whether it can write code that actively interacts with the world [(00:12:55)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=775s).
- Functional reactive programming enables functional programming to write code that interacts with the world, providing a affirmative response to the question of its capability [(00:13:05)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=785s).

## Examples [(00:13:09)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=789s)
- Functional reactive code and its supporting frameworks typically follow a simple pattern, where a series of inputs, including events and behaviors, are combined using a set of combinators provided by the library to build a model of the domain being worked on [(00:13:09)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=789s).
- The combinators are used to express semantically meaningful constructs in the code, in terms of the inputs, and once a semantically rich model of the system is built, it is fed to the real world via a set of output functions [(00:13:43)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=823s).
- The inputs and outputs vary depending on the domain in which the reactive code is being programmed, but the events, behaviors, and combinators can remain the same across different domains [(00:14:18)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=858s).
- In the context of UI code, inputs are often driven by user interactions, such as mouse position, mouse clicks, and keyboard input, which can be represented as behaviors and events [(00:14:40)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=880s).
- [[Functional reactive programming]] is not limited to UI code and can be applied to other domains, such as robotics, where inputs can come from sensors, like cameras, which can be wrapped into behaviors [(00:15:15)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=915s).
- Another application of functional reactive programming is simulation, where it can be used to model complex systems, such as supply chains, over time, and the inputs can come from external sources, like configuration and schedules [(00:15:40)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=940s).
- In simulation, functional reactive programming provides an expressive way to write code that models the behavior of the system being simulated, allowing for the combination of inputs and behaviors to build a rich model of the system [(00:15:55)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=955s).

## Combinators [(00:16:20)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=980s)
- Combinators are used to build up values that make sense in code, and they were the main thing that got people interested in functional reactive programming because they allow expressing relationships that are difficult to write with event handlers and state [(00:16:20)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=980s).
- The "when" Combinator is used to filter events based on a behavior that can be either true or false, and it is a great example of how [[Functional reactive programming | functional reactive programming]] can be declarative, as it allows defining what it means to perform a certain action without having to write complex logic [(00:16:51)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1011s).
- The "map" Combinator is a powerful tool that allows encoding logical business rules, such as warning the user if the audio level gets too loud, and it is used to transform raw inputs into more semantically meaningful values [(00:17:48)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1068s).
- Combinators can be used to go from raw inputs to more meaningful values, and this is incredibly powerful in functional reactive programming, as it allows separating the simulation logic into parts that affect the state and parts that are purely observations [(00:18:32)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1112s).
- The output of Combinators can vary depending on the framework being used, and it can range from drawing images to the screen in a UI to passing a voltage to a motor in a robot controller, and in simulations, it can be used to calculate observations and metrics [(00:18:49)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1129s).
- The use of Combinators in simulations allows for a clean separation of simulation logic and observation calculations, which makes the simulation simpler and more maintainable [(00:19:31)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1171s).

## Example [(00:19:53)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1193s)
- The goal is to implement a simple [[Conway's Game of Life | game of life]], which involves creating a system with a grid to display the game's state, a button to pause or run the game, and the ability for users to edit the grid by clicking on it to flip the state of a cell [(00:20:22)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1222s).
- To achieve this, an implementation of the game of life is needed, which includes primitives such as creating a blank grid, evolving the grid step by step according to the game's rules, and modifying the grid by changing the state of a cell at a particular location [(00:20:47)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1247s).
- The system follows a pattern of inputs, combinators, and outputs, where inputs include a stream of events representing the next frame, mouse position, and mouse clicks, as well as events from the pause button [(00:21:17)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1277s).
- These events can be folded into behaviors, allowing the system to keep track of state, such as whether the game is paused or not, and to handle modifications to the grid by creating a stream of updates [(00:22:21)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1341s).
- The system uses a powerful pattern where instead of starting with a state, it starts with a stream of updates, and each event in the stream is a diff to the state, allowing for efficient and declarative handling of changes [(00:23:23)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1403s).
- The system combines streams of events, such as updates to the grid and steps in the game, and uses a clause to only execute steps when the game is not paused, resulting in a declarative and efficient implementation [(00:24:18)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1458s).
- Finally, the system takes the combined stream of events and turns it into a behavior that represents the actual value of the grid, decoupling the state itself from the set of updates and making it easy to source updates from different places and execute them in the right order [(00:25:07)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1507s).

## UI [(00:25:30)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1530s)
- The UI is factored into the behavior of the game, where [[Conway's Game of Life | the game of life]] is drawn on a canvas, and other UI elements can be expressed in a high-level way, such as the pause button, which switches icons when pressed [(00:25:30)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1530s).
- The pause button's behavior is defined by a function that maps the paused behavior to the icon display, allowing for a small amount of code to encode a large number of features, including animation, pause button, and user control [(00:25:51)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1551s).
- The code to manage the interaction is relatively small, around 20 lines, and is made possible by using [[Functional reactive programming | Functional Reactive Programming]] (FRP), which makes it easy to add new features without significantly changing existing code [(00:26:31)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1591s).
- Adding new features, such as a generation counter, can be done by folding the steps behavior stream, which is already defined in terms of whether the game is paused or not, allowing the counter to update correctly when the game is running [(00:26:59)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1619s).
- New controls, such as a button to clear the grid, can be added by creating a stream of grid-to-grid functions that ignores the existing grid and clears it, and then adding it to the union of changes, without needing to change unrelated code [(00:27:38)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1658s).
- The use of FRP allows for a functional style of programming over time, making it easy to add new features and controls without modifying existing code, and this concept is enough to get started with learning FRP [(00:28:26)](https://www.youtube.com/watch?v=ePgWU3KZvfQ&t=1706s).




## Sources
- [website](https://www.youtube.com/watch?v=ePgWU3KZvfQ)
