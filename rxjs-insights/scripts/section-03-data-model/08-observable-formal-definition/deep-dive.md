# What an Observable Actually Is — Deep Dive

**Section:** The Data Model
**Insight:** Observable formal definition [{T,a}…]
**Lesson type:** Deep Dive
**Estimated duration:** 5 min

---

Let's go deeper on the formal definition of an Observable as a sequence of {T, a} pairs, because each component of that definition has real consequences for how you write and debug RxJS code.

Start with T — the time dimension. T isn't always a wall-clock timestamp. It's a position on a timeline controlled by a Scheduler. By default, RxJS uses the platform's native timer APIs — setTimeout and setInterval — so T really does correspond to real elapsed milliseconds. But when you write marble tests with TestScheduler, T becomes virtual. You're running in a fake time environment where you declare that emissions happen at frame 10, frame 30, frame 50, and the scheduler steps through those frames without actually waiting. The formal definition accommodates both cases because it says T is just a point in time — it doesn't say which kind of time.

Now look at a — the value dimension. The a can be anything. A primitive number. A string. A plain JavaScript object. A DOM event. And critically, a can itself be an Observable. That last case is the foundation of higher-order operators. When you have an Observable whose a dimension contains Observables — an Observable of Observables — you need a flattening operator like switchMap, concatMap, or mergeMap to project that inner Observable into a flat output sequence. The entire higher-order operator problem is really just a question of what to do when a is itself a sequence with a T dimension of its own.

Now, "lazy." When we say an Observable is lazy, we mean the subscribeFn — the function passed to the Observable constructor — is not called until subscribe() is invoked. Each call to subscribe() creates a brand new execution context. The subscribeFn runs fresh. If it makes an HTTP request, that request happens fresh. If it sets up an event listener, that listener is attached fresh. Two subscribers don't share state unless you explicitly opt into sharing with share() or shareReplay(). The Observable is, in effect, a factory for executions, not an execution itself.

"Potentially infinite" is the part that trips people up. Developers coming from Promises expect a terminal event — a Promise resolves once and it's done. Observables have no such requirement. interval(1000) never calls complete(). fromEvent(window, 'click') never calls complete(). These are perfectly valid Observables. The consequence is that if you subscribe to one of these and never set up a teardown, you're creating a subscription that lives forever. Operators like take(5) or takeUntil(destroy$) are how you impose a completion boundary. They add an artificial end to the sequence — they define a point in time after which no more {T, a} pairs will be emitted.

And that brings us to the practical payoff. Because T is an explicit first-class dimension, RxJS can reason about the timing of emissions in ways that a pure value-transformation system can't. delay() shifts T. throttleTime() filters out pairs whose T values are too close together. debounceTime() suppresses pairs unless a T gap exceeds a threshold. auditTime() and sampleTime() sample the latest a at a regular T interval. windowTime() groups pairs into sub-sequences by T boundaries. None of these operators would be expressible without T being a dimension of the data model. Time isn't a side effect in RxJS — it's a first-class axis that operators can read and manipulate just as freely as they manipulate values.

When you keep that picture in mind — every emission is a pair, T and a, on a potentially infinite sequence that doesn't start until you subscribe — the entire operator library starts to make sense as a coherent algebra rather than a grab-bag of utilities.
