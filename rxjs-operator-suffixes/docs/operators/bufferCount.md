---
operator: bufferCount
family: Grouping
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `bufferCount<T>(bufferSize: number, startBufferEvery?: number)`

> Collects source values into fixed-size arrays and emits each array when it reaches `bufferSize` — optionally creating overlapping or skip-gapped windows via `startBufferEvery`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Grouping |
| **Time-sensitive** | No — boundaries are count-based, not time-based |
| **Value-sensitive** | No — does not inspect value content |
| **Lossy** | No — all source values appear in at least one buffer |
| **Completion required** | No — emits each time a buffer fills; works correctly on infinite sources |

**Completion behaviour** — `bufferCount` accumulates source values and emits a complete array whenever `bufferSize` values have been collected. When the source completes, any remaining buffered values (fewer than `bufferSize`) are emitted as a final partial array before the completion signal. If the source never completes, `bufferCount` runs indefinitely, emitting batches of exactly `bufferSize`.

**Lossy behaviour** — not lossy without `startBufferEvery`. With `startBufferEvery > bufferSize`, values between the end of one buffer and the start of the next are skipped (excluded from both windows) — those skipped values are the only values that do not appear in any emitted buffer.

---

#### Marble Diagram

Non-overlapping (`bufferSize = 3`):
```
source:  --a--b--c--d--e--f--g--|
         bufferCount(3)
output:  ----------[a,b,c]------[d,e,f]--[g]|
```

Overlapping (`bufferSize = 3, startBufferEvery = 1` — sliding window):
```
source:  --a--b--c--d--|
         bufferCount(3, 1)
output:  --------[a,b,c]--[b,c,d]--|
```

Skip-gapped (`bufferSize = 2, startBufferEvery = 3`):
```
source:  --a--b--c--d--e--f--|
         bufferCount(2, 3)
output:  ------[a,b]--------[d,e]--[f]|
         (c skipped — not in any buffer)
```

---

#### Signature

```typescript
bufferCount<T>(
	bufferSize: number,
	startBufferEvery?: number  // default: bufferSize (non-overlapping)
): OperatorFunction<T, T[]>
```

- `startBufferEvery < bufferSize` → overlapping (sliding) windows
- `startBufferEvery = bufferSize` → non-overlapping (default)
- `startBufferEvery > bufferSize` → skip-gapped windows (some values excluded)

---

#### When to Use

- Process events in fixed-size batches (e.g. send data to an API in chunks of 100 records).
- Implement a sliding-window average or moving median over the last N values with `startBufferEvery = 1`.
- Paginate an Observable stream into fixed-size pages for display.
- Detect double-clicks or N-click patterns by buffering click events and checking array length.
- Generate overlapping N-gram sequences from a token stream for text processing.

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { bufferCount, mergeMap } from 'rxjs/operators'
import { ajax } from 'rxjs/ajax'

interface Record {
	id: number
	data: string
}

interface BulkResponse {
	inserted: number
}

// Batch upload — send 50 records per API call
const records$ = from(largeRecordArray as Record[])

const upload$ = records$.pipe(
	bufferCount(50),
	mergeMap((batch: Record[]) =>
		ajax.post<BulkResponse>('/api/bulk', { records: batch })
	)
)

upload$.subscribe((res) => console.log(`Inserted: ${res.response.inserted}`))
```

Sliding window average over the last 3 values:

```typescript
import { interval } from 'rxjs'
import { bufferCount, map } from 'rxjs/operators'

// Moving average of last 3 sensor readings
const sensor$ = interval(500).pipe(
	map((): number => Math.random() * 100),
	bufferCount(3, 1),
	map((window: number[]): number =>
		window.reduce((sum, v) => sum + v, 0) / window.length
	)
)

sensor$.subscribe((avg: number) => console.log(`Moving avg: ${avg.toFixed(2)}`))
```

---

#### Gotchas

1. **Partial final buffer on source completion** — when the source completes and fewer than `bufferSize` values remain, a partial array is emitted. If you need only complete full-size batches, filter with `.pipe(filter(b => b.length === bufferSize))`.

2. **`startBufferEvery > bufferSize` drops values** — this is the only case where `bufferCount` is lossy. Values that fall in the gap between a buffer end and the next buffer start do not appear in any emitted array.

3. **`bufferCount(1)` is equivalent to `map(v => [v])`** — wrapping each value in a single-element array. This is technically valid but rarely useful; prefer `map` for clarity.

4. **Sliding window memory** — with `startBufferEvery = 1` (maximum overlap), N−1 values are retained in memory across consecutive buffers. On very large `bufferSize` with a high-frequency source, this can accumulate significant memory.

5. **`bufferCount` vs `windowCount`** — `bufferCount` collects all values into an array before emitting; `windowCount` emits an inner Observable that can be processed with operators while values are still arriving. Use `windowCount` when you need streaming access; use `bufferCount` when you need the complete array.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `bufferTime` | Time-based window, not count-based | Windows should close after N milliseconds |
| `buffer` | External event-driven closing notifier | The window boundary is an external signal |
| `bufferWhen` | Factory function provides closing Observable per window | Each window has a different closing condition |
| `windowCount` | Emits inner Observables for each window | You need streaming (operator-composable) access to each batch |
| `pairwise` | Emits `[previous, current]` — equivalent to `bufferCount(2, 1)` | You only need the last two values as a pair |

---

#### Decision Rule

> Use `bufferCount` when you need **fixed-size batches** of source values. Use `startBufferEvery` for overlapping (sliding) windows. Use `bufferTime` for time-based batches and `buffer` for event-driven batch boundaries.
