---
title: RXJS Operators Explained with Examples: switchMap, map + More
tags:
  - "Programming/RxJS"
createdAt: Mon Sep 29 2025 10:50:56 GMT+0200 (Central European Summer Time)
updatedAt: Mon Sep 29 2025 10:51:05 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Introduction to Observables and Operators
- The concept of observables and operators in reactive programming can be understood through a metaphor, where people listening to a radio station to hear the weather report represent the observers, and the radio station, weather report, meteorologist, and instruments all play a role in the process of providing the weather information [(00:00:00)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=0s).
- In this metaphor, there are at least five observables involved, including the instruments, weather station, meteorologist, radio announcer, and radio, and each of these observables can be considered as either a source or output observable depending on the scope [(00:01:16)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=76s).
- The source and output observables are connected through the pipe function, which takes the source observable, performs operations on it, and provides an output observable, with all operations happening inside and dealing with observables themselves [(00:01:38)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=98s).
- When an observable performs an action, it is said to emit a value, and these emissions can follow one after the other, but not always, as the meteorologist will only emit a new update if she determines that the data is sufficient to require an update [(00:02:25)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=145s).

## Understanding Higher-Order Observables
- The weather station is an example of a higher-order observable, which is an observable of observables, consisting of multiple first-order observables, such as a barometer, wind gauge, and thermometer, which are also considered inner observables [(00:03:04)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=184s).
- The instruments on the weather station are not themselves the weather, but rather evidence of the weather, and they provide data that is interpreted by the meteorologist to produce a weather update [(00:03:15)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=195s).
- The process of converting actual wind into a reading involves a series of steps or operations done to the original source observable, which are referred to as operators, and includes a project function, source observable, output observable, higher order observable, first order observable, inner observable, and a chain of events that ultimately gets converted to sound coming from a radio [(00:03:43)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=223s).

## Operators and Their Functions
- The instruments in this process can be compared to the map operator, as it applies a given project function to each value emitted by the source observable and emits the resulting values as an observable [(00:04:29)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=269s).
- The weather station can be represented by the combined latest operator, which combines multiple observables to create an observable whose values are calculated from the latest values of each of its input observables [(00:04:41)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=281s).
- The meteorologist can be compared to the with latest from operator, as it combines the source observable with other observables to create an observable whose values are calculated from the latest values of each, but only when the source emits [(00:04:56)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=296s).
- The radio announcer's behavior determines which operator he represents, and if he stops reading the first report and begins to read the new report as soon as it arrives, he is doing a switch map, but if he doesn't begin a new report until the first one is finished, he is doing a concat map [(00:05:36)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=336s).
- The radio announcer can also be represented by the merge map operator if he reads both reports at the same time when a new report comes in while he is still reading, or by the throttle operator if he reads the latest weather report every hour on the hour and is observing another source like a clock [(00:06:35)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=395s).

## Advanced Concepts and Operators
- The radio announcer can also be seen as an observable of observables if he is observing the reports for all cities and reading the latest report for each city, as the latest report for each city is an observable [(00:07:39)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=459s).
- The mergeAll operator converts a higher-order observable into a first-order observable, which concurrently delivers all values emitted by the inner observables, with the example given being a stream of cities [(00:07:50)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=470s).

## Conclusion and Introduction to the Content Creator
- There are approximately 100 RXJS operators, but only a subset of these have been defined using metaphors to aid understanding, focusing on the most commonly used vocabulary [(00:08:09)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=489s).
- A particular style of explanation is used, which involves using stories to explain complex concepts rather than delving into detailed code explanations, in an effort to create content that is distinct from other coding videos [(00:08:32)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=512s).
- The creator of the content, Ben, is an entrepreneur who produces videos about innovation on a weekly basis and encourages viewers to provide feedback in the form of likes and subscriptions to inform future content creation [(00:08:56)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=536s).
- Ben also responds to comments and invites viewers to subscribe for more content, with the goal of creating more videos that cater to the interests of his audience [(00:09:01)](https://www.youtube.com/watch?v=lM16-E-uCWc&t=541s).




## Sources
- [website](https://www.youtube.com/watch?v=lM16-E-uCWc)
