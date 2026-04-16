---
module: 5
lesson: "5.2"
title: Lossy vs lossless
exercise: Implement both a lossy and a lossless strategy for a 50/sec sensor stream consumed at 10/sec, and explain when each is appropriate.
difficulty: intermediate
---

## Scenario

An IoT dashboard receives temperature sensor readings at 50 per second but the UI can only meaningfully update 10 times per second. A naive `subscribe` processes every reading, causing CPU spikes and jank. You need to implement two strategies — lossy (keep only recent readings, discard the rest) and lossless (collect all readings, process in batches) — then decide which is appropriate for a live gauge display vs a data-logging export feature.

## Starter Code

```typescript
import { interval } from 'rxjs';
import { take, map, throttleTime, bufferTime } from 'rxjs/operators';

interface SensorReading { reading: number; time: number; }

// Source: 50 readings per second (one every 20ms), runs for 2 seconds (100 readings total)
const sensor$ = interval(20).pipe(
	take(100),
	map((i: number): SensorReading => ({ reading: i, time: Date.now() })),
);

// EXERCISE: implement lossy strategy — keep only ~1 per 100ms window
const lossy$  = sensor$.pipe(/* ??? */);

// EXERCISE: implement lossless strategy — collect all readings per 100ms window
const lossless$ = sensor$.pipe(/* ??? */);

// Counters to compare throughput
let lossyCount    = 0;
let losslessTotal = 0;
let losslessBatches = 0;

lossy$.subscribe((r: SensorReading) => {
	lossyCount++;
});

lossless$.subscribe((batch: SensorReading[]) => {
	losslessTotal += batch.length;
	losslessBatches++;
});

// After 2.5 seconds, log results
setTimeout(() => {
	console.log(`Lossy received:    ${lossyCount} individual readings`);
	console.log(`Lossless received: ${losslessTotal} readings in ${losslessBatches} batches`);
}, 2500);
```

## Task

1. Implement `lossy$` using `throttleTime(100)` and explain what happens to the readings between the throttle windows.
2. Implement `lossless$` using `bufferTime(100)` and explain why the total reading count across all batches should equal 100.
3. Explain in two sentences which strategy is correct for (a) a live temperature gauge showing the current value, and (b) a CSV export that must include every data point. Name the operator for each.

## Hint

`throttleTime` is lossy: it emits the first value in each window and silently discards the rest. `bufferTime` is lossless: it collects every value in each window into an array, so the total count is preserved across all batches. Choose based on whether the consumer needs recency (lossy) or completeness (lossless).
