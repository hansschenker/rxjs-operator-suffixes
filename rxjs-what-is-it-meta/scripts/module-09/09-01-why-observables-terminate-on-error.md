---
module: 9
lesson: "9.1"
title: Why Observables terminate on error — and why that is correct
key_insight: When an Observable errors, it terminates permanently. This is not a limitation — it is a guarantee. An error is a definitive end state, and Observables that keep emitting after an error are undefined behavior.
related: ["2.3", "9.2"]
---

## Hook

Many developers add `catchError` expecting the stream to keep running, then reach for workarounds when it does not. The surprise reveals a misread of the Observable contract: errors are not exceptions you catch and continue past — they are a terminal signal that closes the stream permanently. Understanding why this is correct, not inconvenient, changes how you design error handling entirely.

## Insight

The Observable contract is precisely described as `(next)* (error | complete)?`. Zero or more `next` emissions, followed by at most one terminal event — either `error` or `complete` — and never both, and never anything after. This is not an implementation detail; it is the definition of the type.

When a producer calls `observer.error(err)`, it is declaring: "I cannot continue. The state of this execution is undefined from this point forward." Allowing further `next` emissions after an error would mean the subscriber receives values from a producer that has already admitted it failed. Those values would have no valid provenance. RxJS enforces this contract at the `SafeSubscriber` level — any call to `observer.next()` after `observer.error()` is silently dropped, regardless of what the producer attempts.

The key insight for recovery is this: `catchError` does not resume the errored stream. It subscribes to a completely new Observable that you return from the handler. The original stream is gone — closed and cleaned up. The replacement stream is a fresh execution, starting from its own initial state. This is clean separation, not a workaround. Recovery is always a new Observable, because a stream that has errored has nothing left to offer.

This model also makes error handling compositional. Each operator in a pipeline can be reasoned about independently because the error signal is always unambiguous and always final.

## Example

The following custom Observable attempts to emit a value after calling `observer.error()`. The value is silently dropped because `SafeSubscriber` has already closed the subscription:

```typescript
import { Observable } from 'rxjs';

const unsafe$: Observable<number> = new Observable<number>((observer) => {
	observer.next(1);
	observer.error(new Error('something failed'));
	observer.next(2); // silently ignored — subscription is already closed
});

unsafe$.subscribe({
	next: (v: number) => console.log('next', v),     // logs: next 1
	error: (e: Error) => console.log('error', e.message), // logs: error something failed
	complete: () => console.log('complete'),           // never called
});
// Output: next 1 → error something failed
// The second next(2) call never reaches the subscriber.
```

The `SafeSubscriber` wrapper enforces the contract for you, but the right response is to design producers that honour it intentionally — not to rely on silent dropping.

## Summary

- The Observable contract is `next* (error | complete)?` — error and complete are both permanent terminal states
- A producer that emits after erroring is in undefined behavior territory; `SafeSubscriber` silently drops those emissions
- Recovery is always a new Observable — `catchError` terminates the old stream and starts the replacement
- This is not a limitation but a guarantee: error handling becomes compositional because error is always unambiguous and always final
