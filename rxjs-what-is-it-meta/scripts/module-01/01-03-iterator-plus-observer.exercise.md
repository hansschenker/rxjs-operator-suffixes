---
module: 1
lesson: "1.3"
title: Iterator + Observer — the two GoF patterns RxJS fuses
exercise: Label each code fragment as Iterator or Observer pattern, then fuse them into a single Observable.
difficulty: beginner
---

## Scenario

The code below has two independent pieces of async infrastructure — one using the Iterator pattern, one using the Observer pattern. Your job is to identify which is which, then combine them using RxJS into a single Observable that has both properties.

## Starter Code

```typescript
// Fragment A
class NumberSequence {
	private current: number = 0;
	next(): { value: number; done: boolean } {
		if (this.current >= 5) return { value: 0, done: true };
		return { value: this.current++, done: false };
	}
}

// Fragment B
type Callback<T> = (value: T) => void;
class EventBus<T> {
	private listeners: Callback<T>[] = [];
	on(cb: Callback<T>): void { this.listeners.push(cb); }
	emit(value: T): void { this.listeners.forEach(l => l(value)); }
}

// EXERCISE: Combine both patterns into one Observable
import { Observable } from 'rxjs';

const numbers$: Observable<number> = /* ??? */;
```

## Task

1. Label Fragment A as "Iterator pattern" or "Observer pattern" and explain why in one sentence.
2. Label Fragment B as "Iterator pattern" or "Observer pattern" and explain why in one sentence.
3. Implement `numbers$` using `new Observable(subscriber => { ... })` that emits 0 through 4 then completes — combining Iterator sequence structure with Observer push delivery.

## Hint

The Iterator pattern defines the sequence (what values, in what order, when to stop). The Observer pattern defines delivery (push notifications to registered listeners). RxJS fuses them: the Observable defines the sequence; `subscribe` is the delivery mechanism.
