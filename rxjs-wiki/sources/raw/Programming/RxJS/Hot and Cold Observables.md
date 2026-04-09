---
title: Hot and Cold Observables
tags:
  - "Programming/RxJS"
createdAt: Tue Sep 30 2025 06:24:55 GMT+0200 (Central European Summer Time)
updatedAt: Tue Sep 30 2025 06:25:08 GMT+0200 (Central European Summer Time)
---


Detailed summary


## Introduction to Hot and Cold Observables
- The topic of hot and cold observables is explored in depth, with the goal of providing a comprehensive analysis and answering questions such as what makes an observable hot or cold, why it matters, how to determine the temperature of an observable, and how to change its temperature.
- Hot observables are described as "live" sequences that happen regardless of whether they are observed or not, and they broadcast notifications to all observers, with the canonical example being converting an event into an observable using FromEventPattern.
- Cold observables, on the other hand, are "generated" sequences that can produce different notifications for every observer, and they only generate notifications when an observer subscribes, with the canonical example being the Range operator that generates a range of numbers whenever an observer subscribes.
- The common sense understanding of hot and cold observables is that hot observables are always running and broadcast notifications to all observers, while cold observables generate notifications for each observer, but this understanding is more like a symptom rather than a definition.

## Understanding Hot and Cold Observables
- The concept of side effects is introduced as a primitive concept to reduce the ideas of hot and cold observables, and it is intended to provide a well-defined term based primarily on side effects.
- The possibility of an observable being both hot and cold, or changing its temperature dynamically, is explored, and it is revealed that the answer to these questions is yes, with certain Rx operators such as Replay and RefCount implementing these behaviors.
- The article also touches on the idea that an observable can change its temperature after an observer subscribes, or for the same observer after it subscribes, and that specialized subscription behaviors can cause an observable to behave like it's hot until all observers unsubscribe and then become cold again for a subsequent subscription.
- The concept of hot and cold observables is complex, and the behavior of an observable can change depending on the time of subscription and the connectability of operators like Replay, which can offer strange combinations of always running, broadcast, and generate behaviors.
- The example of calling O.Replay() to get an IConnectableObservable, assigning it to C, and then calling C.Subscribe(J) and C.Subscribe(K) illustrates how C can be considered hot or warm because it broadcasts notifications to J and K, even though notifications won't arrive until Connect is called.
- When C.Connect() is called, it may cause J and K to observe notifications from O, and regardless of whether O is hot or cold, C is considered hot at this point because of its broadcasting behavior alone, but for a new subscriber L, C can transition from cold to hot after replaying missed notifications.
- The behavior of Replay is influenced by the temperature of the source observable O and the presence of a race condition, which can result in different behaviors, such as being hot, warm, or transitioning from cold to hot, depending on the timing of subscriptions and the calls to Connect.
- The concepts of always running, broadcast, and generate are relative and depend on the time of subscription, which can lead to confusing combinations of behaviors, such as an observable being always running without broadcasting or generating while broadcasting.
- The common sense definitions of hot and cold observables are diluted by their differences in relation to the time of subscription and the connectability of operators like Replay, making it hard to categorize observables as purely hot or cold based on a single definition.
- Ultimately, the behavior of an observable like Replay can be seen as a combination of symptoms, including always running, broadcasting, and generating, rather than a single definition, and it can transition between different behaviors depending on the context and timing of subscriptions.

## Side Effects and Observables
- The terms "hot" and "cold" observables are not precisely defined in common sense, so they are often ignored in favor of focusing on side effects, which are crucial for observers to understand the behavior of an observable.
- A side effect is defined as any effect that is not the primary effect of subscribing to an observable, which is to register an observer for callbacks, add the observer to the observable's internal list of observers, and create a disposable for unsubscription.
- The primary effect of subscribing to an observable also includes the compositional nature of Rx, which allows operators to form subscription chains, where subscribing to the outer-most operator's observable causes it to subscribe to the previous operator's observable, and so on.
- Subscription side effects can be inherited from inner subscriptions, meaning that if any inner subscriptions cause side effects, the outer-most subscription will also cause them, and these side effects are implicitly included in the definition of subscription side effects.
- A simplified definition of a subscription side effect is any effect beyond an observable's subscription mechanism, which can include examples such as calling Schedule, OnNext, OnError, OnCompleted, GetEnumerator, or MoveNext, mutating a field, creating an object in memory, running a CPU-intensive computation, sending a web request, or reading a file.
- The concept of duality between observables and enumerables is also discussed, where replacing certain character sequences can help illustrate the similarities between the two, such as replacing "asynchronous" with "synchronous", "observable" with "enumerable", and "subscription" with "enumeration".
- The text also mentions that the definition of side effects is relative and can vary depending on the context, but for the purpose of this discussion, a side effect is considered to be any effect that is not the primary effect of subscribing to an observable.

## Defining Hot and Cold Observables
- The concept of hot and cold observables is defined, where hot observables are always running and broadcast notifications to all observers, while cold observables generate notifications for each observer, which is related to the concept of subscription side effects.
- Subscription side effects refer to any effect beyond an observable's subscription mechanism, and in the case of cold observables, generating notifications for each observer is an example of a subscription side effect, as it involves calling OnNext, OnError, or OnCompleted when Subscribe is called.
- Hot observables, on the other hand, do not necessarily cause subscription side effects when an observer subscribes, as the act of subscribing merely enables the observer to receive notifications that would have occurred anyway, and the primary effect of subscribing is all that is needed to begin receiving notifications asynchronously.
- The concept of broadcast in Rx means that an observable is not responsible for generating notifications itself, but instead broadcasts notifications on behalf of some underlying observable, and this broadcasting does not cause subscription side effects, but rather defers them until connection if the underlying observable is cold.
- Connecting to a cold observable is necessary to ensure that observers do not miss notifications before they have subscribed to the broadcasting observable, and this connection behavior exposes the subscription side effects of the underlying observable, which are then referred to as connection side effects instead.
- The pattern that emerges is that subscription side effects are not expected in hot observables, including the case where a hot observable broadcasts notifications for a cold observable, as the subscription side effects are deferred until connection, and connectability may be hidden from observers.
- The AsObservable operator can be used to hide the connectability of subjects and IConnectableObservable, allowing them to retain their hot behavior even when observers are unaware of their underlying connectability.

## Broadcasting and Connection Side Effects
- Hot observables do not cause subscription side effects, instead, they may cause connection side effects, which are beyond the observer's control when connectability has been hidden, and some stateful behaviors in Rx use connection side effects to separate notifications from other kinds of subscription side effects.
- Certain operators, such as Replay, PublishLast, and overloads of Publish, broadcast all subscription side effects, including notifications, to observers who subscribe before connection or after connection but before the underlying observable generates notifications, and they also broadcast future notifications to observers who have missed notifications, but generate missed notifications specifically for the particular observer who missed them.
- These operators demonstrate that hot and cold are relative terms with regard to different kinds of subscription side effects, and they can separate missed notifications from other kinds of subscription side effects to return a relatively cold observable or a relatively hot observable, respectively.
- The ability of observables to transition from cold to hot is no longer important, as the focus is on subscription side effects, and an observable either causes subscription side effects or it does not, making terms like "warm" unnecessary to describe the behavior of connectables.
- A connectable observable is always hot before it's connected and generally hot afterwards, but some operators apply special behavior to missed notifications to ensure they aren't actually missed, returning an observable that is cold with regard to missed notifications for a particular observer and hot with regard to other kinds of subscription side effects.
- The new understanding of temperature with regard to subscription side effects defines hot and cold as relative terms with regard to the time of subscription and different kinds of subscription side effects, where hot observables do not cause subscription side effects and cold observables rely on subscription side effects.

## Relative Temperature and Subscription Side Effects
- The definition of observable temperature refers to the propensity of an observable to cause subscription side effects, which can include notifications, and this definition is useful for understanding the behavior of hot and cold observables.
- Cold observables are those that cause subscription side effects, such as generating notifications when an observer subscribes, sending a web request, or asynchronously reading from a file, and these side effects are not limited to just generating notifications.
- The new definition of cold observables encompasses not only generating notifications but also other types of subscription side effects, like tracking the number of observers subscribed to an observable or subscription logging for diagnostic purposes, which may cause a file to be updated on disk every time an observer subscribes.
- The RefCount operator is an example of an operator that exhibits similar behavior to tracking the number of observers subscribed to an observable, and it demonstrates how subscription side effects can be more general than just generating notifications.
- Hot observables, on the other hand, are those that do not cause subscription side effects, and they can be either always running or broadcasting, which defers subscription side effects into connection side effects.
- The common sense definition of cold observables is limited to generating notifications, but the new definition provides a more comprehensive understanding of subscription side effects and how they relate to the temperature of an observable.

## Importance of Subscription Side Effects
- The importance of subscription side effects lies in the composition of observables using LINQ operators, which can lead to multiple subscriptions to the same observable, and understanding whether an observable is hot or cold is crucial for predicting the behavior of these compositions.
- Operators like Retry have the semantics of multiple subscriptions without multiple references, and in such cases, it is desirable to duplicate subscription side effects, such as retrying a web request every time the operator re-subscribes to the observable.
- The new definition of temperature, which focuses on subscription side effects, provides a elegant and diametrically opposed concept that covers the common sense definition of hot and cold observables, and it nicely ties together the two orthogonal concepts that make up the common sense definition of hot.
- The important factor in dealing with observables is subscription side effects, which can either be duplicated or broadcasted, depending on the situation, and this is not necessarily about generating notifications, but about executing the side effects that are often responsible for generating the notifications.
- In some cases, an observable is referenced multiple times without allowing duplicate subscription side effects, and instead, broadcast behavior is desired, which is essentially the same as sharing subscription side effects among multiple observers.

## Temperature Conversion and Assumptions
- When composing custom operators, the temperature of the observable parameters is not typically defined, and making assumptions about the temperature can lead to incorrect behavior, such as assuming all observables are hot when they are actually cold, or vice versa.
- Defining temperature contracts on operators can be problematic, as it would require callers to explicitly change the temperature of observables before calling the operator, which can change the declarative nature of the operator and introduce unnecessary complexity.
- The Retry operator, for example, wants to duplicate subscription side effects, while other operators may want to broadcast them, and the Zip operator can subscribe to an observable twice, but may not want to create two subscriptions to the original observable.
- Temperature conversion is an important consideration, and the [[IObservable]] type is immutable, so changing its temperature means applying a unary operator to create a new observable with the desired temperature.
- The decision to assume that all observable parameters are hot or cold can have significant consequences, and the best approach depends on the specific requirements of the operator and the observables being used, and conversion between hot and cold observables is a key factor in determining the optimal assumption.
- The concept of "changing" an observable's temperature refers to the application of operators and the assignment of the result into a new variable, which holds a different observable with the desired temperature, and this is possible because IObservable is immutable.

## Operators for Temperature Conversion
- The Publish operator can be used to change a cold observable into a hot observable, and it has overloads that project the observable into a selector function as a hot observable, as well as overloads that return a connectable observable that defers subscription side effects until connection.
- The Defer operator, on the other hand, makes a hot observable cold by adding subscription side effects to it, and it can also be used to convert invocation side effects into subscription side effects, allowing for the creation of a cold observable from a hot function.
- Combining a hot observable with a cold observable in certain ways, such as using the Concat or Merge operators, can also result in a cold observable, because the subscription side effects of the cold observable are preserved in the resulting observable.
- Converting from cold to hot is a simple process that adds broadcasting behavior, but converting from hot to cold requires the addition of subscription side effects, which is a more complex process.

## Best Practices for Dealing with Observables
- When dealing with observables of unknown temperature, it is safest to assume that they are cold, because assuming they are hot and being wrong can result in duplicated subscription side effects, which can break the semantics of a query, whereas assuming they are cold and being wrong will simply have no effect if the Publish operator is applied.
- Assuming that observables are cold is the best approach, because it allows for easy broadcasting of subscription side effects when necessary, but it is impossible to reverse broadcasting once it has occurred, and there is no way to force a broadcasting observable's Subscribe method to cause subscription side effects that were already broadcast.
- The definitions of hot and cold observables have been revised to account for the possibility of unknown [[IObservable]] instances, with hot observables being defined as those that do not cause subscription side effects, and cold observables being defined as those that may cause subscription side effects.

## Classification of Subscription Side Effects
- A subscription side effect can be classified into several categories, including synchronous and asynchronous notifications, out-of-band effects, composition, and computation, which can occur when subscribing to an observable.
- Synchronous subscription side effects include notifications, such as directly calling OnNext, OnError, or OnCompleted, as well as out-of-band effects, such as assigning a field or executing a CPU-intensive computation.
- Asynchronous subscription side effects include notifications, such as using an async mechanism to schedule calls to OnNext, OnError, or OnCompleted, as well as out-of-band effects, such as making a web request or reading a file on disc.
- Composition subscription side effects occur when subscribing to another cold observable that causes its own subscription side effects, either synchronously or asynchronously.
- Computation subscription side effects refer to any effects beyond an observable's subscription and notification mechanisms that occur for each notification, and are considered a type of subscription side effect because they do not occur until an observer subscribes.
- The classification of subscription side effects can be useful when documenting operators, such as the Range, Interval, Defer, and Select operators, to provide information about the potential subscription side effects that may occur when using these operators.

## Active and Passive Observables
- The documentation for operators can include information about the potential subscription side effects, such as synchronous or asynchronous notification, composition, and computation, to help users understand the potential behavior of the operators.
- The concept of hot and cold observables is related to the notion of side effects, which can be separated into subscription side effects and computation side effects, allowing for a more accurate definition of these terms.
- A subscription side effect is defined as any effect beyond an observable's subscription mechanism, such as calling Schedule, OnNext, OnError, OnCompleted, GetEnumerator, or MoveNext, mutating a field, creating an object in memory, running a CPU-intensive computation, sending a web request, or reading a file.
- Hot observables do not cause subscription side effects, while cold observables may cause subscription side effects, and it is assumed that any observable with an unknown temperature is cold.
- The temperature of an observable is relative to the time of subscription and the kind of subscription side effect, and some observables can change their temperature over time, resulting in different temperatures for different observers.
- Computation side effects, on the other hand, refer to any effect beyond an observable's subscription and notification mechanisms that occurs for each notification, and can be significant or insignificant depending on the context.
- The terms active and passive are introduced to describe observables based on their computation side effects, where passive observables do not cause significant computation side effects, and active observables do cause significant computation side effects, with examples of active observables including those returned by operators such as Select and Do.

## Determining Observable Temperature
- The significance of computation side effects is relative to the operation, query, or application, and what is significant in one context may be insignificant in another, allowing for the terms active and passive to be context-sensitive.
- The temperature of an observable, whether it is hot or cold, is determined by its propensity to cause subscription side effects, with hot observables not causing these side effects and cold observables potentially causing them.
- In addition to the hot and cold observable concepts, there are also passive and active observables, where passive observables do not cause significant computation side effects and active observables do cause significant computation side effects.
- It is essential to be aware of whether subscribing to an observable multiple times will duplicate side effects, which is typically the case with cold observables, and to broadcast notifications among operators to ensure they observe the same notifications, which is usually desired with hot observables.
- When defining a query that references the same observable multiple times, it is crucial to consider whether duplicate subscription side effects are desired, such as when using the Retry operator, which aims to duplicate these side effects until one succeeds.
- To determine if an observable is hot or cold, one must look at the documentation or source code, as there is no way to be sure from an observer's point of view, and when in doubt, it is safest to assume that an unknown observable is cold.
- The Rx generator methods, such as Return, Range, Timer, Interval, Generate, and Create, return observables that are cold by definition, while the Rx built-in conversion operators for [[.NET]] events, like FromEvent and FromEventPattern, typically return hot observables.
- Certain operators, including Replay, Publish, and PublishLast, can return either hot or cold observables depending on their overloads and parameters, and it is essential to understand their behavior to avoid unexpected side effects in queries.

## Temperature of Rx Operators
- Operators like FromAsyncPattern and ToAsync return functions that act like parameterized connectable observables, and it is safest to assume that the observable returned by these functions is cold, similar to PublishLast.
- The Start operator returns a cold observable, similar to ToAsync and PublishLast, as it is not connectable, and the same applies to the ToObservable conversion of Task and Task, which return an observable similar to PublishLast.
- Defer returns a cold observable, but its behavior depends on whether it causes subscription side effects or not, which can be uncertain when deferring an unknown function that returns an observable, and StartWith, Sample, and Using return cold observables that cause subscription side effects.
- All remaining operators, except for a few, inherit temperatures from their source observables, and operators like Select, Do, Aggregate, and Scan may cause significant computation side effects due to their delegate parameters being invoked for some or all notifications.
- The temperature of an observable can be changed using various methods, including subscription side effects, such as using Publish to make a cold observable hot, and Defer to add subscription side effects and convert invocation side effects into subscription side effects.

## Changing Observable Temperature
- Complex conversions, such as using a Subject as an observer or employing operators like Replay, PublishLast, and Publish with an initialValue parameter, can also change the temperature of an observable, making a cold observable hot in terms of all subscription side effects except for missed notifications.
- Computation side effects can be added or broadcasted using operators like Publish, Select, and Do, which can be useful depending on the significance of the computation side effects with respect to resource usage and performance, and serial behavior is described in the Rx Design Guidelines document.
- Operators like Publish, PublishLast, and Replay have convenient overloads that accept a selector function, allowing callers to avoid dealing with connection themselves, and the temperature of an observable returned by these overloads is cold because it publishes and connects as a subscription side effect.
- The implementation of Publish in Rx could potentially be optimized to detect whether an observable is a Subject or is hidden by the AsObservable operator, which would allow it to avoid introducing another subject unnecessarily.

## Conclusion
- This potential optimization would be an internal improvement and would not change the fact that publishing a hot observable likely has no significant performance impact in most programs.
- The terms used to describe this concept are informal and were created by the author, who is open to replacing them with formal terms if provided by someone in the comments, specifically in the context of the document titled 'Hot and Cold Observables'.




## Sources
- [website](https://davesexton.com/blog/post/Hot-and-Cold-Observables.aspx)
