---
module: 9
lesson: "9.1"
title: Why Observables Terminate on Error
exercise: Demonstrate that post-error emissions are silently dropped, then redesign the pipeline to recover using a replacement Observable.
difficulty: intermediate
---

## Scenario

A custom Observable emits a value, then errors, then tries to emit two more values. The developer expects to receive all three values across the error boundary. Understanding why only two events arrive — and which two — is the foundation for every error-handling pattern in this module.

## Starter Code

```typescript
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

// Observable that emits, errors, then tries to emit again
const broken$ = new Observable<number>(subscriber => {
	subscriber.next(1);
	subscriber.error(new Error('Something failed'));
	subscriber.next(2);  // EXERCISE: will this arrive? Why or why not?
	subscriber.next(3);  // EXERCISE: will this arrive? Why or why not?
});

broken$.subscribe({
	next: (v: number) => console.log('next:', v),
	error: (e: unknown) => console.log('error:', (e as Error).message),
	complete: () => console.log('complete'),
});
```

## Task

1. Run the code mentally — which values does the subscriber receive? Explain why in terms of the Observable contract `next* (error|complete)?`.
2. Rewrite using `catchError` to recover from the error by switching to `of(-1)` as a fallback Observable.
3. Show that the values after the error (2, 3) are still never received even with `catchError` — and explain why that is the correct behaviour per the contract.

## Hint

The Observable contract guarantees that after `error` fires, the subscription is permanently closed. `catchError` provides a replacement Observable — not a resumption of the original.
