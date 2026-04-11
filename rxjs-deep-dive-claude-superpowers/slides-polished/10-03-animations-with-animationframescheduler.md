---
marp: true
theme: uncover
title: "Animations with animationFrameScheduler"
---

# Animations with animationFrameScheduler
> Without a scheduler, animation timing drifts, start timestamps go stale, and frame-rate logic becomes untestable.

---

## Core Concept

- **Animations are Observables** — a sequence of positions over time, identical in shape to any stream
- **`animationFrameScheduler`** wraps `requestAnimationFrame`, synchronizing emissions with the browser paint cycle (≈60fps)
- **`defer` is mandatory** — the start timestamp must be captured *at subscription time*, not when the Observable is declared
- **Velocity** = pixels per second (unbounded); **Duration** = progress `0 → 1` over a fixed ms window (completes)
- > "Apply easing **before** distance multiplication — easing expects a 0–1 input; distance would destroy the scale"

---

## How It Works

```typescript
// duration(): emits 0 → 1 over durationMs, one tick per animation frame
function duration(durationMs: number, scheduler = animationFrameScheduler) {
  return defer(() => {                              // factory runs at subscribe()
    const start = scheduler.now();                  // timestamp captured HERE
    return interval(0, scheduler).pipe(             // one emission per frame
      map(() => (scheduler.now() - start) / durationMs), // progress: 0 → 1
      takeWhile(t => t <= 1),                       // auto-completes at 100%
    );
  });
}

// Marble: input frames, output progress
// frames$:    ──f1──f2──f3──f4── ... ──fN─|
// duration(): ──0.1─0.2─0.3─0.4─ ... ──1.0─|
```

---

## Common Mistake

```typescript
// ❌ Capturing the start timestamp at declaration time
const start = Date.now(); // runs when the module loads — already stale

const animation$ = interval(0, animationFrameScheduler).pipe(
  map(() => (Date.now() - start) / 2000),
  takeWhile(t => t <= 1),
);

// Why it fails: if animation$ is stored and subscribed later
// (e.g. on button click), `start` is seconds old.
// Progress skips past 0 immediately — the animation is already
// "in progress" before it even begins.
// Reusing animation$ for a second click makes it worse:
// `start` never resets, so the second animation starts at t > 1.
```

---

## The Right Way

```typescript
import { defer, interval, pipe } from 'rxjs';
import { animationFrameScheduler } from 'rxjs';
import { map, pairwise, switchMap, takeWhile, tap } from 'rxjs/operators';

// ✅ defer wraps the factory — fresh start timestamp per subscription
function duration(durationMs: number, scheduler = animationFrameScheduler) {
  return defer(() => {
    const start = scheduler.now();            // captured lazily, per subscriber
    return interval(0, scheduler).pipe(
      map(() => (scheduler.now() - start) / durationMs),
      takeWhile(t => t <= 1),               // completes cleanly; no manual unsub
    );
  });
}

// ✅ Tween: interpolate between consecutive state values
function tween(durationMs: number, easingFn = (t: number) => t) {
  return pipe(
    pairwise<number>(),                      // emit [prev, curr] on each change
    switchMap(([prev, curr]) =>              // cancel old tween, start new one
      duration(durationMs).pipe(
        map(t => prev + easingFn(t) * (curr - prev)), // easing first, then distance
      ),
    ),
  );
}

// Usage: plug into any number stream
clockDegrees$.pipe(tween(300, elasticOut))
  .subscribe(deg => (hand.style.transform = `rotate(${deg}deg)`));
```

---

## Key Rule

> **Always wrap animation time math in `defer` — the start timestamp belongs to the subscription, not the declaration.**