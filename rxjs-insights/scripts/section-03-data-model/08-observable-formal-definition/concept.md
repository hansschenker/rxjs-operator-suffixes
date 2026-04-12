# What an Observable Actually Is

**Section:** The Data Model
**Insight:** Observable formal definition [{T,a}…]
**Lesson type:** Concept
**Estimated duration:** 2 min

---

Most introductions to RxJS describe an Observable as "a stream of events" or "like a Promise but for multiple values." Those analogies are useful for getting started, but they don't give you the precision you need to reason about what operators actually do. So let's use the formal definition instead.

An Observable is a lazy, potentially infinite sequence of pairs. Each pair is a point in time, which we'll call T, and a value at that point in time, which we'll call a. We write the whole sequence as [{T, a}…], where the ellipsis means the sequence may never end.

Every emission from an Observable carries both of those dimensions simultaneously. You don't get just a value — you get a value at a particular moment. That's what separates an Observable from a plain array or a list. An array has values with positions. An Observable has values with timestamps.

Now, the word "lazy" is critical here. The sequence doesn't exist until you subscribe. The subscribe call is what creates a new execution context. Before that, you have a description of a computation, not the computation itself. Two subscribers to the same cold Observable get two entirely separate executions with their own independent timelines.

The phrase "potentially infinite" means there's no guarantee of a terminal event. interval() emits forever. fromEvent() on a button click emits forever. These Observables are valid — they just don't happen to have a completion boundary built in. Operators like take() or takeUntil() add that boundary artificially.

Here's why this formal definition matters in practice. If an Observable is a sequence of {T, a} pairs, then RxJS operators are functions that transform that sequence. Some operators touch only a — the value. Some touch only T — the timing. Some touch both. That distinction becomes your primary diagnostic tool when something in a pipeline behaves unexpectedly. We'll build on it in the next two lessons.
