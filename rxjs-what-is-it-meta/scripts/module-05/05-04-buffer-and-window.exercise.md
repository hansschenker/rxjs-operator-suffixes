---
module: 5
lesson: "5.4"
title: Buffer and window
exercise: Implement a click-coordinate batch processor using both bufferTime and windowTime — and show why windowTime requires subscribing to inner Observables.
difficulty: intermediate
---

## Scenario

A collaborative drawing canvas tracks mouse clicks and must process them in 500ms batches: computing the centroid of each batch to smooth out jitter. You will implement this with both `bufferTime` and `windowTime` and discover a key structural difference: `bufferTime` hands you a completed array, while `windowTime` hands you a live inner Observable that you must subscribe to yourself.

## Starter Code

```typescript
import { fromEvent, Observable } from 'rxjs';
import { map, bufferTime, windowTime, mergeMap, toArray, filter } from 'rxjs/operators';

interface Point { x: number; y: number; }
interface Centroid { x: number; y: number; count: number; }

const clicks$ = fromEvent<MouseEvent>(document, 'click').pipe(
	map((e: MouseEvent): Point => ({ x: e.clientX, y: e.clientY })),
);

function computeCentroid(points: Point[]): Centroid {
	if (points.length === 0) return { x: 0, y: 0, count: 0 };
	const x = points.reduce((sum, p) => sum + p.x, 0) / points.length;
	const y = points.reduce((sum, p) => sum + p.y, 0) / points.length;
	return { x: Math.round(x), y: Math.round(y), count: points.length };
}

// APPROACH 1: bufferTime — emits Point[] arrays
const buffered$ = clicks$.pipe(
	bufferTime(500),
	/* ??? filter out empty arrays, then compute centroid */
);

// APPROACH 2: windowTime — emits Observable<Point> windows
// This requires subscribing to each inner Observable to collect its points
const windowed$ = clicks$.pipe(
	windowTime(500),
	/* ??? mergeMap each window to collect points, then compute centroid */
);

buffered$.subscribe((c: Centroid) => console.log('buffered centroid:', c));
windowed$.subscribe((c: Centroid) => console.log('windowed centroid:', c));
```

## Task

1. Complete `buffered$` by adding `filter` to skip empty batches and `map` to call `computeCentroid`.
2. Complete `windowed$` using `mergeMap(window$ => window$.pipe(toArray()))` to collect each window's points into an array, then `filter` and `map` to compute the centroid. Explain why `toArray()` is needed inside the `mergeMap`.
3. Explain in two sentences the fundamental structural difference between `bufferTime` and `windowTime` — specifically what type each emits, and when that difference matters in practice.

## Hint

`bufferTime` is an Array operator: it waits for the window to close, collects all values into an array, and emits the array as a single value. `windowTime` is an Observable operator: it emits an inner Observable for each window, which you must subscribe to (via `mergeMap`) to process the values as they arrive. Use `bufferTime` when you need the completed collection; use `windowTime` when you need to react to values within the window in real time.
