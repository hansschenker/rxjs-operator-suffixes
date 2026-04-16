---
module: 1
lesson: "1.3"
title: Iterator + Observer — the two GoF patterns RxJS fuses
key_insight: RxJS is what you get when you fuse the Iterator pattern (sequence operators) with the Observer pattern (push delivery) — each pattern alone is incomplete; together they define reactive programming.
---

## Hook

The Gang of Four described both the Iterator and the Observer patterns in 1994. Both are in every developer's toolkit. Both solve real problems. But for fifteen years, nobody thought to combine them — and when Microsoft finally did, the result was something neither pattern could achieve alone: an async sequence you can query like an array.

## Insight

The Iterator pattern gives you sequence semantics. You call `.next()` on an iterator to pull the next value out of a collection, and you get back `{ value: T, done: boolean }`. This synchronous contract is the foundation for every operator you use on arrays — `map`, `filter`, `reduce`, `skip`, `take`. The consumer drives the iteration. The weakness: it is inherently synchronous. You cannot ask an HTTP response to deliver its next value on demand.

The Observer pattern gives you push delivery. A subject maintains a list of observers and notifies them via `update()` or `onNext()` whenever its state changes. This is the foundation for every event system. The weakness: there is no operator vocabulary. A raw `EventEmitter` can push values, but it cannot `filter` them, `map` them, or `take` only the first five.

RxJS fuses both. It takes the push delivery of the Observer pattern — the producer notifies the consumer — and adds the full sequence operator vocabulary of the Iterator pattern. It also contributes one concept that neither pattern has: a formal completion signal via `onComplete()` and `onError()`. The result is an asynchronous sequence that behaves like a collection. You subscribe to it like an Observer, and you transform it like an Iterator.

## Example

Compare a plain `EventEmitter` (Observer pattern alone) against an Observable (Iterator + Observer fused). Notice what you gain when both patterns are combined.

```typescript
import { EventEmitter } from 'events';
import { fromEvent } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';

// Observer pattern only — push delivery, but no operators, no completion
const emitter = new EventEmitter();
emitter.on('data', (value: unknown) => {
	console.log(value); // raw push, no transformation
});

// Iterator + Observer fused — push delivery AND operator vocabulary
const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
	filter((e: KeyboardEvent) => e.key !== ' '),
	map((e: KeyboardEvent) => e.key.toUpperCase()),
	take(5),
);

keydown$.subscribe((key: string) => console.log(key));
// Delivers at most 5 non-space keys, uppercase, then completes automatically
```

The `EventEmitter` pushes values, but you cannot compose it. The Observable pushes values and gives you a full query language — plus it knows how to complete.

## Summary

- Iterator = synchronous sequence operators (`map`, `filter`, `reduce`); Observer = async push delivery — each is incomplete alone
- Observable fuses both: push delivery + sequence operators + formal completion semantics (`onComplete` / `onError`)
- `EventEmitter` is Observer-only — no operators, no lazy evaluation, no built-in completion or cancellation
