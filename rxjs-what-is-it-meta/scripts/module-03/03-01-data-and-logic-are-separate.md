---
module: 3
lesson: "3.1"
title: Data and Logic are separate
key_insight: In RxJS, Observable is the data and operators are the logic — the architecture enforces the functional programming separation of concerns whether you intend it or not.
related: ["1.5", "3.2"]
---

## Hook

The hardest discipline in functional programming is keeping data and logic separate. Most codebases conflate the two the moment complexity grows. RxJS enforces the separation structurally — not by convention or linting rules, but by the design of its type system.

## Insight

In functional programming, data is inert — a description of values — and logic is a pure transformation applied to that data. RxJS maps onto this dichotomy precisely. The Observable is inert data: a description of a value sequence that holds no state and performs no work until subscribed. Operators are pure logic: functions that accept an Observable and return a new Observable, without modifying the original or producing side effects. The `pipe()` chain is where logic is composed over data.

This separation is not merely aesthetic. It carries three concrete benefits. First, testability: the same operator works on any Observable regardless of its source, so you can test the logic independently from the data producer. Second, composability: operators chain without coupling, because each one honours the same contract — `Observable<T>` in, `Observable<R>` out. Third, reusability across domains: `debounceTime(300)` behaves identically whether its source emits mouse events, WebSocket messages, or GPS coordinates. The logic is unaware of where the data comes from. That unawareness is a feature, not a limitation. It is what makes the same operator library applicable to every async domain in a JavaScript application.

## Example

Consider a price-update stream from a WebSocket source. The operators `filter`, `map`, and `distinctUntilChanged` are composed over it. Then, for a unit test, the source is swapped for a static `of(10, 20, 10, 30)` — the operators remain untouched and behave identically, proving that logic and data are truly decoupled.

```typescript
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import { of } from 'rxjs';

const priceLogic = pipe(
	filter((price: number) => price > 0),
	map((price: number) => Math.round(price * 100) / 100),
	distinctUntilChanged(),
);

// Production: data is a live WebSocket stream
const livePrice$ = webSocket<number>('wss://prices.example.com').pipe(priceLogic);

// Test: swap the source — logic is unchanged
const testPrice$ = of(10, 20, 10, 30).pipe(priceLogic);
```

Swapping the source for a test is only possible because data and logic were never coupled in the first place.

## Summary

- Observable = inert data description; operators = pure logic that transforms it
- `pipe()` composes logic over data without coupling the two
- Swapping the data source for testing is only possible because data and logic are genuinely separate
