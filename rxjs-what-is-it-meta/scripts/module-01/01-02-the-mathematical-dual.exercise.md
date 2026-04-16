---
module: 1
lesson: "1.2"
title: The Mathematical Dual — how IEnumerable became IObservable
exercise: Write the IObservable interface by dualising the IEnumerable interface arrow by arrow.
difficulty: intermediate
---

## Scenario

Understanding that `Observable` is the mathematical dual of `Iterable` is the fastest path to understanding why RxJS's subscribe method looks the way it does. This exercise makes the duality concrete by deriving the Observable interface from first principles.

## Starter Code

```typescript
// The pull-based pair (simplified)
interface MyIterator<T> {
	next(): { value: T; done: boolean };
}

interface MyIterable<T> {
	[Symbol.iterator](): MyIterator<T>;
}

// EXERCISE: Write the push-based dual.
// Rules:
//   1. Flip every arrow — producer calls consumer instead of consumer calling producer
//   2. The three Iterator outcomes (value+done=false, value+done=true, throw)
//      become three Observer callbacks: next, complete, error
//   3. The factory method that returns an iterator becomes the subscribe method

interface MyObserver<T> {
	// ??? fill in the three callbacks
}

interface MyObservable<T> {
	// ??? fill in subscribe — what does it return?
}
```

## Task

1. Complete `MyObserver<T>` with the three callback methods derived from dualising `MyIterator`.
2. Complete `MyObservable<T>` with the `subscribe` method signature, including its return type.
3. Write a type alias `Unsubscribe` for the return type of `subscribe` and explain in one sentence why it is the dual of the `done` flag.

## Hint

In the pull model the consumer requests values; in the dual push model the producer notifies the consumer. The return value of `subscribe` is the dual of the `done` flag: a way for the consumer to signal termination back to the producer.
