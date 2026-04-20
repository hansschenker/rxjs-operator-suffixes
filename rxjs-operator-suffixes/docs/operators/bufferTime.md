---
operator: bufferTime
family: Grouping
lossy: false
completionRequired: false
timeSensitive: true
valueSensitive: false
date: 2026-03-27
---

### `bufferTime(bufferTimeSpan, bufferCreationInterval?, maxBufferSize?, scheduler?)`

> Collects all source values emitted during a fixed time window into an array, then emits that array when the window closes — repeating on a configurable schedule.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping / Buffering |
| **Time-sensitive** | Yes — buffer boundaries are driven entirely by time |
| **Value-sensitive** | No — all values are collected regardless of content |
| **Lossy** | No — every source value is captured in exactly one buffer array |
| **Completion required** | No — emits a buffer array on each window boundary regardless of source completion |

**Completion behaviour** — `bufferTime` emits arrays on its own periodic schedule, independent of source completion. When the source completes mid-window, the currently open buffer is emitted immediately (possibly as an empty array if nothing arrived) and then the outer Observable completes. If the source never completes, `bufferTime` runs indefinitely — which is the normal use case for continuous event streams.

**Lossy behaviour** — `bufferTime` is non-lossy. Every source value lands in exactly one buffer array (or multiple arrays in overlapping-window mode). Empty arrays are emitted for windows where the source was silent — this distinguishes it from `sampleTime` which skips silent periods entirely.

---

#### Marble Diagram

Basic (`bufferTimeSpan` only) — non-overlapping windows:

```
source:  --a--b--c-----d--e--f--|
         bufferTime(40ms)
         [......][......][......]

output:  -------[a,b,c]---------[d,e,f]--|
         // empty array emitted if source is silent during a window
```

With `bufferCreationInterval` (overlapping windows, `bufferCreationInterval < bufferTimeSpan`):

```
source:  --a--b--c--d--e--|
         bufferTime(60ms, 30ms)

         [buf1-----------]
              [buf2-----------]
                   [buf3----------]

output:  ---[a,b,c,d]---[b,c,d,e]---[c,d,e]--|
```

With `maxBufferSize` — buffer closes early when cap is reached:

```
source:  --a--b--c--d--e--|
         bufferTime(100ms, null, 2)  // max 2 values per buffer

output:  ----[a,b]--[c,d]--[e]--|
```

---

#### Signature

```typescript
// Overload 1: fixed, non-overlapping windows
bufferTime<T>(
  bufferTimeSpan: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>

// Overload 2: overlapping or non-overlapping windows with creation interval
bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>

// Overload 3: creation interval + max size cap
bufferTime<T>(
  bufferTimeSpan: number,
  bufferCreationInterval: number | null,
  maxBufferSize: number,
  scheduler?: SchedulerLike
): OperatorFunction<T, T[]>
```

Output type is always `T[]` — a plain array, never an Observable.

---

#### When to Use

- Batch DOM events (e.g. keystrokes, clicks) into arrays for periodic processing instead of handling each individually.
- Collect incoming WebSocket messages into fixed-time batches before sending to an API or writing to a database.
- Implement a micro-batch write strategy — accumulate records for 500 ms and then flush them in one request.
- Build a rolling-window analytics snapshot that counts or aggregates events per time period.
- Reduce render frequency for a live feed — process all messages that arrived in the last 200 ms as a single update rather than re-rendering on every message.

---

#### Code Example

```typescript
import { Subject } from 'rxjs';
import { bufferTime, filter, switchMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface LogEntry {
	level: 'info' | 'warn' | 'error';
	message: string;
	timestamp: number;
}

// Scenario: client-side log batching — accumulate log events for 2 seconds,
// then POST the batch to a logging endpoint in one request.

const logEvent$ = new Subject<LogEntry>();

const batchedLogs$ = logEvent$.pipe(
	bufferTime(2000),
	filter((batch: LogEntry[]): batch is LogEntry[] => batch.length > 0),
	switchMap((batch: LogEntry[]) =>
		ajax({
			url: '/api/logs',
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: { entries: batch },
		})
	),
);

batchedLogs$.subscribe({
	next: () => { /* batch acknowledged */ },
	error: (err: unknown) => console.error('Log batch failed:', err),
});

// Emit log entries from anywhere in the app
logEvent$.next({ level: 'info', message: 'Page loaded', timestamp: Date.now() });
```

Overlapping windows for a sliding event-rate monitor:

```typescript
import { fromEvent } from 'rxjs';
import { bufferTime, map } from 'rxjs/operators';

// Count clicks in overlapping 3-second windows sampled every 1 second
// to produce a rolling clicks-per-3-seconds metric

const clickRate$ = fromEvent<MouseEvent>(document, 'click').pipe(
	bufferTime(3000, 1000),
	map((clicks: MouseEvent[]): number => clicks.length),
);

clickRate$.subscribe((rate: number) => {
	console.log(`Clicks in last 3s: ${rate}`);
});
```

---

#### Gotchas

1. **Empty arrays are emitted for silent windows** — unlike `sampleTime` (which skips silent periods), `bufferTime` always emits an array at each window boundary, even if it's `[]`. Forgetting to `filter(batch => batch.length > 0)` before processing will send empty batches to your API or reducer — a very common bug.

2. **`bufferTime` vs `windowTime` — arrays vs streams** — both collect values by time window, but `bufferTime` emits a closed `T[]` array after each window ends, while `windowTime` emits a live `Observable<T>` when each window opens. Use `bufferTime` when you need the complete collection at once; use `windowTime` when you need to react to values incrementally within the window.

3. **Overlapping windows with `bufferCreationInterval < bufferTimeSpan` duplicate values** — in sliding-window mode a single source value appears in multiple output arrays. This is intentional for rolling-window analytics, but if you're batching for a write operation you almost certainly want non-overlapping windows (omit `bufferCreationInterval` or set it equal to `bufferTimeSpan`).

4. **`maxBufferSize` closes the buffer early on count** — when the third overload is used, a buffer closes and a new one opens as soon as `maxBufferSize` values are collected, even if the time span hasn't elapsed. This means buffers are no longer purely time-bounded and you can get more than one buffer per nominal time window during high-throughput bursts.

5. **Scheduler injection for tests** — `bufferTime` uses `asyncScheduler` by default. In Vitest marble tests, pass the virtual `TestScheduler` as the final argument, otherwise tests will run in real time and be brittle.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `windowTime(ms)` | Emits live `Observable<T>` windows instead of closed arrays | You need incremental processing *within* the window as values arrive |
| `bufferCount(n)` | Closes buffer after `n` values, not after elapsed time | You want count-based batching, not time-based |
| `buffer(notifier$)` | Buffer boundaries defined by an external Observable | You need event-driven boundaries (e.g. flush on button click) |
| `sampleTime(ms)` | Emits only the single most recent value at each tick — lossy | You only need the latest value periodically, not the full batch |
| `throttleTime(ms)` | Lets through the first value in each window, drops the rest | You want rate-limited individual values, not batched arrays |

---

#### Decision Rule

> Use `bufferTime` when you need to **batch all source values into arrays** over a fixed time span for bulk processing (API writes, batch renders, analytics). Prefer `windowTime` instead when you need **a live sub-stream per window** so you can apply further operators inside each window incrementally.
