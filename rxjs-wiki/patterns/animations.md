---
title: "Animations Pattern"
category: patterns
tags: [patterns, animations, animationFrameScheduler, scheduler, tween, easing, defer, velocity, duration]
related: [../core/Scheduler.md, ../core/Observable.md, ../core/operators.md, state-management.md]
sources: 1
updated: 2026-04-08
---

# Animations Pattern

> Animations are sets of values over time — the same shape as an Observable. The key challenge is controlling *frame rate* (requestAnimationFrame) and *time math* (velocity vs duration).

*From Ben Lesh's talk "Advanced RxJS: State Management and Animations" (Google/Netflix).*

## Animations Are Streams

An animation is a sequence of positions at successive points in time:

```
position: [0, 10, 20, 30, ..., 300]
   time:  [f1, f2, f3, f4, ..., fn]
```

This maps directly to an Observable:

```typescript
// Each emission is a position at a frame boundary
animation$.subscribe(position => {
	element.style.transform = `translateX(${position}px)`;
});
```

Two elements of time matter:
1. **Frame rate** — when do we update? (answer: `animationFrameScheduler`)
2. **Duration or velocity** — how far do we move per frame?

## animationFrameScheduler

RxJS wraps `requestAnimationFrame` with `animationFrameScheduler`. Use it with `interval`:

```typescript
import { interval } from 'rxjs';
import { animationFrameScheduler } from 'rxjs';

// Emits frame numbers at display refresh rate (typically 60fps)
const frames$ = interval(0, animationFrameScheduler);
```

This gives one emission per browser paint cycle, synchronized with the display.

## Velocity-Based Animation

**Velocity** = movement per unit time (e.g. pixels per second). Duration is unbounded — use for infinite animations (spinners, games).

```typescript
import { defer, interval } from 'rxjs';
import { map, animationFrameScheduler } from 'rxjs';

// Returns elapsed milliseconds per animation frame — lazy via defer
function msElapsed(scheduler = animationFrameScheduler) {
	return defer(() => {
		const start = scheduler.now();
		return interval(0, scheduler).pipe(
			map(() => scheduler.now() - start),
		);
	});
}

// Velocity animation: move `pxPerSec` pixels every second
function animateByVelocity(pxPerSec: number, scheduler = animationFrameScheduler) {
	return msElapsed(scheduler).pipe(
		map(ms => (ms / 1000) * pxPerSec),
	);
}

// 50 pixels per second
animateByVelocity(50).subscribe(x => {
	ball.style.left = `${x}px`;
});
```

**Why `defer`?** The start timestamp must be captured *at subscription time*, not when the Observable is declared. `defer` creates the Observable lazily per subscriber — the factory runs at `subscribe()`.

## Duration-Based Animation

**Duration** = fixed time window. Represent progress as a percentage: `0 → 1` over the specified duration.

```typescript
import { defer, interval } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { animationFrameScheduler } from 'rxjs';

// Emits values from 0 to 1 over `durationMs` milliseconds
function duration(durationMs: number, scheduler = animationFrameScheduler) {
	return defer(() => {
		const start = scheduler.now();
		return interval(0, scheduler).pipe(
			map(() => (scheduler.now() - start) / durationMs),
			takeWhile(t => t <= 1),
		);
	});
}
```

**Key property:** Duration is always 0 → 1, regardless of the actual duration in ms. This makes it composable with any easing function or distance calculation.

### Moving Over a Distance

Multiply the 0–1 progress by the target distance:

```typescript
// Move 300px over 2 seconds
duration(2000).pipe(
	map(t => t * 300),
).subscribe(x => {
	ball.style.left = `${x}px`;
});
```

## Easing Functions

Easing transforms the linear 0 → 1 progress into a curve before multiplying by distance:

```typescript
// Apply easing BEFORE multiplying by distance
// (easing expects 0–1 input, distance would change the scale)
function elasticOut(t: number): number {
	// Rob Penner's elastic-out easing
	return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}

duration(2000).pipe(
	map(t => elasticOut(t)),    // apply easing first
	map(t => t * 300),          // then scale to distance
).subscribe(x => {
	ball.style.left = `${x}px`;
});
```

The order matters: `easing → distance`, never `distance → easing`.

## Reusable Animation Functions (Higher-Order)

Higher-order functions keep animations reusable and prevent hardcoding:

```typescript
// Returns an Observable — caller subscribes and provides teardown
function moveBall(
	element: HTMLElement,
	distancePx: number,
	durationMs: number,
): Observable<number> {
	return duration(durationMs).pipe(
		map(t => t * distancePx),
		tap(x => {
			element.style.left = `${x}px`;
		}),
	);
}

// Animate multiple balls sequentially with concatMap
from(balls).pipe(
	concatMap((ball, i) =>
		moveBall(ball, 300, 500 + i * 100),
	),
).subscribe();
```

## The Tween Pattern

A **tween** smoothly interpolates between successive state values:

```typescript
import { pairwise, switchMap } from 'rxjs/operators';

// Produces [prevValue, currValue] pairs from a stream
function withPrevious<T>(): OperatorFunction<T, [T, T]> {
	return pipe(
		pairwise(),
	);
}

// Tween: interpolate between consecutive values of a stream
function tween(
	durationMs: number,
	easingFn: (t: number) => number = (t) => t,
): OperatorFunction<number, number> {
	return pipe(
		withPrevious(),
		switchMap(([prev, curr]) => {
			const delta = curr - prev;
			return duration(durationMs).pipe(
				map(t => prev + easingFn(t) * delta),
			);
		}),
	);
}

// Apply tween to any stream of numbers
clockDegrees$.pipe(
	tween(300, elasticOut),
).subscribe(deg => {
	secondHand.style.transform = `rotate(${deg}deg)`;
});
```

**Why `switchMap`?** Each new state value cancels the in-progress tween and starts a new one toward the new target. This prevents animations from stacking or completing after the state has already moved on.

## Marble Diagram

```
state$:    ──0────────90────────180──────►
tween():   ──0.1─0.5─0.9─89─89.5─90─...─►
                                 └ new tween starts
```

## Scheduler Injection for Testing

Pass the scheduler as a parameter to make animations testable with `TestScheduler`:

```typescript
function duration(durationMs: number, scheduler: SchedulerLike = animationFrameScheduler) {
	return defer(() => {
		const start = scheduler.now();
		return interval(0, scheduler).pipe(
			map(() => (scheduler.now() - start) / durationMs),
			takeWhile(t => t <= 1),
		);
	});
}

// In tests: pass TestScheduler
const testScheduler = new TestScheduler(...);
const result$ = duration(1000, testScheduler);
```

See [TestScheduler](../testing/TestScheduler.md) for the full TestScheduler pattern.

## Summary

```
1. Frames    → interval(0, animationFrameScheduler)
2. Time      → defer + scheduler.now() (lazy timestamp per subscription)
3. Velocity  → map(ms => (ms / 1000) * pxPerSec)
4. Duration  → map(ms => ms / durationMs), takeWhile(t <= 1)
5. Easing    → map(t => easingFn(t)) before distance multiplication
6. Distance  → map(t => t * distancePx)
7. Tween     → pairwise() + switchMap(duration)
8. Reuse     → higher-order functions accepting durationMs, distance, easing
```

## Related

- [Scheduler](../core/Scheduler.md) — Scheduler types; animationFrameScheduler; virtual time for testing
- [operators](../core/operators.md) — `defer`, `switchMap`, `pairwise`, `takeWhile`, `tap`
- [TestScheduler](../testing/TestScheduler.md) — testing time-based streams with virtual time
- [state-management](state-management.md) — combining animated values with application state
