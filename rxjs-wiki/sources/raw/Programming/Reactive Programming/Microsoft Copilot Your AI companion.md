---
title: Microsoft Copilot: Your AI companion
tags:
  - "Programming/Reactive Programming"
createdAt: Sun Jan 04 2026 09:18:13 GMT+0100 (Central European Standard Time)
updatedAt: Sun Jan 04 2026 09:18:33 GMT+0100 (Central European Standard Time)
---




Detailed summary


## Core Concepts and DSL Design
- The document section discusses the creation of a discrete-time animation DSL on top of RxJS, inspired by FRAN, with the goal of developing an "animation module" that can be integrated into rxjs-all-in-one.
- The proposed DSL aims to be behavior-like, expressing "value over time" rather than imperative steps, event-like, describing discrete triggers that start, stop, or compose animations, compositional, reusing RxJS operators, render-friendly, easily hooking into DOM, canvas, or WebGL, and honest, explicitly discrete-time, with no pretense of being continuous.
- The core semantic model defines a small set of abstractions, including AnimationClock, a stream of frame times, Behavior, a value that evolves over frame time, Event, discrete occurrences that can influence behaviors, and Animation, a Behavior focused on a finite interval or until some condition.

## Implementation and Development Process
- The implementation uses TypeScript and RxJS, defining types such as Time, Behavior, BehaviorStream, and Event, with the BehaviorStream being driven by animationFrames, and the Event being an Observable that can influence behaviors.
- The development process involves several steps, including creating a shared clock for animations, converting Behavior to BehaviorStream, and defining basic Behavior primitives, such as constant behavior, time behavior, and lift behavior.

## Key Features and Functions
- The DSL also includes features like tweening and easing behaviors, allowing for the creation of smooth transitions over time, and relative-time animations, which enable animations to start at a specific moment and run for a specified duration.
- The implementation provides functions like sampleBehavior, which samples a Behavior at each animation frame, and tween, which creates a Behavior that describes a transition over time with optional easing, demonstrating the potential of the proposed DSL for creating complex animations.

## FRAN Pattern and Event Handling
- The Microsoft Copilot document discusses the implementation of animations using a functional reactive animation (FRAN) pattern, which is based on the concept of behaviors, events, and animations, where behaviors define the animation's behavior over time, events trigger the start of an animation, and animations combine behaviors with a duration.
- The code defines an `Animation` interface, which consists of a `behavior` property that defines the animation's behavior over local time and a `duration` property that specifies the length of the animation, and provides a `runAnimation` function that takes an animation, a start event, and a clock observable to produce an observable that emits the animation's value at each frame.
- The document also introduces the concept of events, which are timestamped occurrences that can be derived from DOM events or other RxJS sources, and provides an example of creating an event stream from DOM clicks using the `domClicks` function.

## Practical Example
- A concrete example is given, where an animation is defined to move a div across the screen when a button is clicked, and the animation is run using the `runAnimation` function and rendered to the DOM using the `renderPosition` function.

## Animation Composition and Semantics Comparison
- The code also demonstrates how to compose animations using combinators like `andThen`, `loop`, `reverse`, and `mirror`, which allow for more complex animation sequences to be created, such as running one animation after another or repeating an animation forever.
- The implementation of the FRAN pattern in the code is compared to the original FRAN semantics, highlighting the differences between the two, such as the use of discrete sample times driven by `animationFrames()` instead of continuous time, and the use of timestamped observables instead of time-stamped discrete occurrences.

## Future Enhancements and Module Integration
- The document concludes by suggesting potential next steps, such as refining the type signatures to align with RxJS patterns, and invites the reader to explore this direction further.
- The section from the document 'Microsoft Copilot: Your AI companion' discusses the addition of various behaviors, including vector behaviors such as Behavior<Vec2> and Behavior<{ x: number; y: number }>, to enhance functionality.
- It also suggests adding physics-inspired behaviors, including velocity, acceleration, and damping, to create more realistic interactions.
- Furthermore, the section proposes the implementation of operator-like composition using keywords such as over, until, and when, to enable more complex and conditional behaviors.
- The integration of these behaviors with the signal/store layer is also recommended, allowing for a unified approach to animations and state management, and a draft of a real module can be created based on the user's preferred TypeScript style, including strictness level and functional helpers.




## Sources
- [website](https://copilot.microsoft.com/chats/tjPF3yizwwgf34thc9DdR)
