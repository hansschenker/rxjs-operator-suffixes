---
operator: windowTime
family: Grouping
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-27
---

### `windowTime(windowTimeSpan, windowCreationInterval?, maxWindowSize?, scheduler?)`

> Splits the source into a new inner Observable every `windowTimeSpan` milliseconds, forwarding all source values that arrive during each window as a live stream rather than a collected array.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping / Windowing |
| **Time-sensitive** | Yes — window boundaries are driven entirely by time |
| **Value-sensitive** | No — all values pass through; time alone determines window membership |
| **Lossy** | No — every source value is forwarded into the current window Observable |
| **Completion required** | No — emits a new window Observable on each boundary regardless of source completion |

**Completion behaviour** — `windowTime` opens a new window Observable on a fixed schedule and emits it downstream immediately. Values are forwarded into the currently open window as they arrive. When the source completes, the current window Observable is completed and then the outer Observable completes. If the source never completes, `windowTime` runs indefinitely, opening and closing windows on schedule — this is the normal use case.

**Lossy behaviour** — `windowTime` is non-lossy. Every value emitted by the source is forwarded into the currently open window. The distinction from `bufferTime` is that window Observables are live streams, not arrays — values can be processed incrementally as they arrive within the window rather than waiting for the window to close.

---

#### Marble Diagram

Basic (`windowTimeSpan` only):

```
source:   --a--b--c--d--e--f--g--|
          windowTime(40ms)
          [w1------][w2------][w3-]

outer:    w1--------w2--------w3--|
w1:       --a--b--c-|
w2:       --d--e--f-|
w3:       --g--|
```

With `windowCreationInterval` (overlapping windows, `windowCreationInterval < windowTimeSpan`):

```
source:   --a--b--c--d--e--|
          windowTime(60ms, 30ms)   // new window every 30ms, each lasts 60ms

          [w1-----------]
               [w2-----------]
                    [w3----------]

outer:    w1---w2---w3--|
w1 emits: a, b, c, d
w2 emits: b, c, d, e
w3 emits: c, d, e
```

With `maxWindowSize`:

```
source:   --a--b--c--d--|
          windowTime(60ms, null, 2)  // max 2 values per window

          [w1: a,b|][w2: c,d|]
outer:    w1--------w2--------|
```

---

#### Signature

```typescript
// Overload 1: fixed windows, no overlap
windowTime<T>(
  windowTimeSpan: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>

// Overload 2: overlapping/non-overlapping windows with creation interval
windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>

// Overload 3: window creation interval + max size cap
windowTime<T>(
  windowTimeSpan: number,
  windowCreationInterval: number | null,
  maxWindowSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, Observable<T>>
```

The outer Observable emits `Observable<T>` — each window is a live stream, not an array.

---

#### When to Use

- Process real-time log events in sliding time windows to detect anomalies or spikes within each interval.
- Implement a sliding-window rate limiter that tracks how many requests arrived in each overlapping time bucket.
- Build a rolling chart where each window Observable feeds a separate sub-pipeline that computes statistics incrementally.
- Group a WebSocket message stream into time-bound segments for batch processing without waiting for all data.
- Apply different downstream operators to each window's stream (e.g. `take(1)` to get the first value of each window, or `count()` to size each window).

---

#### Code Example

```typescript
import { fromEvent, Observable } from 'rxjs';
import { windowTime, mergeMap, count } from 'rxjs/operators';

// Scenario: detect click bursts — count clicks in each 1-second window
// and flag windows with more than 5 clicks as "rapid clicking"

const click$ = fromEvent<MouseEvent>(document, 'click');

const clickRate$ = click$.pipe(
	windowTime(1000),
	mergeMap((window$: Observable<MouseEvent>) =>
		window$.pipe(
			count(),
		)
	),
);

clickRate$.subscribe((clicksInWindow: number) => {
	if (clicksInWindow > 5) {
		console.warn('Rapid clicking detected:', clicksInWindow, 'clicks/sec');
	}
});
```

Overlapping windows for a sliding-window average of sensor data:

```typescript
import { interval, Observable } from 'rxjs';
import { map, windowTime, mergeMap, toArray, filter } from 'rxjs/operators';

interface SensorReading {
	value: number;
	ts: number;
}

const sensor$: Observable<SensorReading> = interval(100).pipe(
	map((i): SensorReading => ({ value: Math.random() * 100, ts: Date.now() })),
);

// Overlapping 2-second windows created every 500ms — sliding average
const slidingAverage$ = sensor$.pipe(
	windowTime(2000, 500),
	mergeMap((window$: Observable<SensorReading>) =>
		window$.pipe(
			toArray(),
			filter((readings): readings is SensorReading[] => readings.length > 0),
			map((readings: SensorReading[]): number =>
				readings.reduce((sum, r) => sum + r.value, 0) / readings.length
			),
		)
	),
);

slidingAverage$.subscribe((avg: number) => {
	console.log('Sliding average:', avg.toFixed(2));
});
```

---

#### Gotchas

1. **Each window is a hot-ish Observable — you must subscribe to it** — `windowTime` emits Observable references downstream. If you use `mergeMap`/`switchMap` to process each window, you're fine. If you accidentally `tap` or `filter` the outer stream without subscribing to each inner window, those windows are never consumed and source values are buffered indefinitely, leaking memory.

2. **`windowTime` vs `bufferTime` — streaming vs array** — `bufferTime` collects values into arrays and emits the complete array when each window closes. `windowTime` emits an Observable immediately when the window opens, so you can react to values *within* the window as they arrive. Use `bufferTime` when you need the full collection; use `windowTime` when you need incremental processing or want to apply further operators to the sub-stream.

3. **`mergeMap` vs `switchMap` on the outer stream** — almost always use `mergeMap` to process window Observables. `switchMap` would cancel the previous window's Observable the moment a new window opens, discarding any in-flight processing of that window's values. Only use `switchMap` if you explicitly want to abandon the previous window.

4. **Overlapping windows with `windowCreationInterval < windowTimeSpan` share source values** — in sliding-window mode, a single source value will appear in multiple window Observables simultaneously. This is intentional (it's why you use this overload), but it can surprise you if you expected each value to appear in exactly one window.

5. **`maxWindowSize` closes the window early** — the third overload closes a window as soon as it reaches `maxWindowSize` values, even if the time span hasn't elapsed yet. A new window then opens immediately. This is useful to cap memory, but it means your windows are no longer purely time-bounded.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferTime(ms)` | Emits completed arrays instead of live Observables; window closes then array is emitted | You need the full collected array to process at once, not a stream |
| `window(notifier$)` | Window boundaries defined by an external Observable, not a fixed clock | You need event-driven boundaries (e.g. a user action closes each window) |
| `windowCount(n)` | Windows close after `n` values, not after a time span | You want count-based grouping, not time-based |
| `groupBy(key)` | Groups values by a key function into persistent per-key Observables | You want to partition by value content, not by time |
| `sampleTime(ms)` | Emits only the *last* value in each period — lossy, no inner Observable | You only need a periodic snapshot, not all values |

---

#### Decision Rule

> Use `windowTime` when you need **all source values grouped into live time-bounded sub-streams** so you can apply further operators within each window. Prefer `bufferTime` instead when you only need the **complete array of values** after each window closes and don't need incremental processing within the window.
