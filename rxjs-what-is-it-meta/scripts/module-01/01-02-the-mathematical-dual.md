---
module: 1
lesson: "1.2"
title: The Mathematical Dual — how IEnumerable became IObservable
key_insight: IObservable is the mathematical dual of IEnumerable — flip the arrows on every method signature and you get push from pull, giving RxJS its entire operator vocabulary for free.
related: ["1.1", "1.3", "4.3"]
---

## Hook

Two data structures can look completely different on the surface — one has a `MoveNext()` method, the other has an `OnNext()` callback — and yet they can be the same structure with the arrows reversed. When Erik Meijer noticed this about iterables and observables, it was not a clever analogy. It was a mathematical proof, and it unlocked a decade of free operator design.

## Insight

Consider what `IEnumerable<T>` actually asks you to do. The consumer calls `GetEnumerator()`, then repeatedly calls `MoveNext()` to advance the cursor and reads `Current` to get the value. The consumer is in control — it decides when to ask for the next item. This is the pull model: values flow from producer to consumer only when the consumer requests them.

Now flip every arrow. Instead of the consumer calling the producer, the producer calls the consumer. `OnNext(value: T)` delivers a value. `OnError(err)` delivers a failure. `OnComplete()` signals the end of the sequence. The consumer registers these callbacks via `subscribe(observer)` and then waits. The producer is in control. This is the push model.

This flip is not a metaphor — it is the precise definition of a categorical dual from category theory. Every morphism (method call) that pointed from consumer to producer now points from producer to consumer. Because the duality is exact, every proof you have about an `IEnumerable` operator has a mirror proof for the corresponding `IObservable` operator. RxJS did not design its operator library. It derived it, one categorical dual at a time.

## Example

The table below makes the arrow flip visible. Read left to right and notice who calls whom, and what direction values travel.

```
┌──────────────────────────────┬──────────────────────────────┐
│  IEnumerable<T>  (Pull)      │  IObservable<T>  (Push)      │
├──────────────────────────────┼──────────────────────────────┤
│  getEnumerator()             │  subscribe(observer)         │
│  consumer → producer         │  producer → consumer         │
├──────────────────────────────┼──────────────────────────────┤
│  moveNext(): boolean         │  onNext(value: T): void      │
│  consumer asks "more?"       │  producer delivers value     │
├──────────────────────────────┼──────────────────────────────┤
│  current: T                  │  onError(err: unknown): void │
│  consumer reads value        │  producer signals failure    │
├──────────────────────────────┼──────────────────────────────┤
│  (iteration ends naturally)  │  onComplete(): void          │
│                              │  producer signals end        │
└──────────────────────────────┴──────────────────────────────┘
Same structure — arrows reversed.
```

Every RxJS operator you use (`map`, `filter`, `mergeMap`, `zip`) has a direct counterpart that was proven correct for `IEnumerable` first. The Observable version is structurally guaranteed to be correct by the duality.

## Summary

- Duality is a mathematical proof, not an analogy — every `IEnumerable` operator has a structurally correct `IObservable` mirror
- Pull: the consumer controls when values arrive; Push: the producer controls when values arrive
- This proof is why RxJS shipped with 100+ operators from day one — they were derived from LINQ, not invented from scratch

## Pitfall

Confusing duality with symmetry. IEnumerable and IObservable are mathematical duals — arrows flipped — not mirrors. `map` on an array is synchronous and pull-based; `map` on an Observable is asynchronous and push-based. The names are the same because the structure is dual, not because the execution model is identical.
