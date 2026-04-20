---
operator: windowCount
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `windowCount<T>(windowSize: number, startWindowEvery?: number)`

> Emits a new **inner Observable** every `startWindowEvery` values and closes the current one after `windowSize` values — the streaming counterpart of `bufferCount`, with optional overlapping windows.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | No — boundaries are count-based, not time-based |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — all source values appear in at least one window |
| **Completion required** | No — emits windows on count boundaries; works correctly on infinite sources |

**Completion behaviour** — `windowCount` opens the first window immediately. It closes the current window and opens a new one after `windowSize` values have been emitted. With `startWindowEvery`, a new window opens every `startWindowEvery` values (creating overlap). When the source completes, the current open window(s) complete. If the source never completes, `windowCount` runs indefinitely.

**Lossy behaviour** — not lossy without `startWindowEvery`. With `startWindowEvery > windowSize`, values in the gap are not forwarded to any window — those are the only dropped values.

---

#### Marble Diagram

Non-overlapping (`windowSize = 3`):
```
source:   --a--b--c--d--e--f--|
          windowCount(3)
output:   w1---w2---w3--------w4|
          w1: --a--b--c|
          w2:          --d--e--f|
          w3:                   (empty, source completes)
```

Overlapping (`windowSize = 3, startWindowEvery = 1` — sliding window):
```
source:   --a--b--c--d--|
          windowCount(3, 1)
output:   w1-w2-w3-w4---|
          w1: --a--b--c|
          w2:    --b--c--d|
          w3:       --c--d|
          w4:          --d|
```

---

#### Signature

```typescript
windowCount<T>(
	windowSize: number,
	startWindowEvery?: number  // default: windowSize (non-overlapping)
): OperatorFunction<T, Observable<T>>
```

- `startWindowEvery < windowSize` → overlapping (sliding) windows
- `startWindowEvery = windowSize` → non-overlapping (default)
- `startWindowEvery > windowSize` → skip-gapped (some values excluded)

---

#### When to Use

- Apply operators to fixed-size batches of values as live streams (e.g. `reduce` or `max` per page of results).
- Implement a sliding-window calculation (moving average, N-gram generation) with `startWindowEvery = 1`.
- Rate-limit in groups — allow exactly N events per window then drop the rest (`take(N)` per window).
- Paginate an infinite stream and process each page with operator pipelines.

---

#### Code Example

```typescript
import { range } from 'rxjs'
import { windowCount, mergeMap, reduce } from 'rxjs/operators'

// Sum values in non-overlapping groups of 5
const numbers$ = range(1, 20)

const groupSums$ = numbers$.pipe(
	windowCount(5),
	mergeMap((win$: Observable<number>) =>
		win$.pipe(reduce((acc: number, v: number) => acc + v, 0))
	)
)

groupSums$.subscribe((sum: number) => console.log('Group sum:', sum))
// → 15, 40, 65, 90
```

Sliding window moving average:

```typescript
import { interval } from 'rxjs'
import { windowCount, mergeMap, reduce, map } from 'rxjs/operators'

// Moving average of last 3 values using overlapping windows
const sensor$ = interval(500).pipe(
	map((): number => Math.round(Math.random() * 100))
)

const movingAvg$ = sensor$.pipe(
	windowCount(3, 1),
	mergeMap((win$: Observable<number>) =>
		win$.pipe(
			reduce((acc: { sum: number; count: number }, v: number) =>
				({ sum: acc.sum + v, count: acc.count + 1 }), { sum: 0, count: 0 })
		)
	),
	map((r: { sum: number; count: number }) => r.sum / r.count)
)

movingAvg$.subscribe((avg: number) => console.log('Moving avg:', avg.toFixed(2)))
```

---

#### Gotchas

1. **`windowCount` vs `bufferCount`** — `bufferCount` emits complete arrays; `windowCount` emits inner Observables. Use `windowCount` when you need to apply operators to each window's stream; use `bufferCount` when you only need the array.

2. **Must subscribe to or flatten each inner Observable** — same as `window`: always use a flattening operator (`mergeMap`, `concatMap`) to process inner windows. Unsubscribed windows lose their values.

3. **`mergeMap` processes windows concurrently** — with overlapping windows (`startWindowEvery < windowSize`), multiple inner Observables are open simultaneously. `mergeMap` handles this correctly; `concatMap` will queue and may lag.

4. **Partial final window on source completion** — the last window may complete with fewer than `windowSize` values if the source completes mid-window. Operators like `reduce` will still fire for the partial window.

5. **`startWindowEvery > windowSize` skips values** — values between window-end and the next window-start are not forwarded to any window. This is the only lossy case.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferCount` | Emits complete arrays | You need the final array, not streaming access |
| `window` | Event-driven boundary notifier | The window boundary is an external signal |
| `windowTime` | Time-based windows | Windows should close after N milliseconds |
| `windowToggle` | Separate open/close notifiers; overlapping | Opening is event-driven, windows can overlap differently |
| `pairwise` | Emits `[prev, curr]` — equivalent to `windowCount(2, 1)` as arrays | Only the last two values as a pair |

---

#### Decision Rule

> Use `windowCount` when you need to **apply operator pipelines to fixed-size batches as live streams**. Use `bufferCount` when a complete array per batch is sufficient. Use `startWindowEvery = 1` for sliding windows.
