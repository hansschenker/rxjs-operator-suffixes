---
operator: skipLast
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `skipLast<T>(skipCount: number)`

> Emits all source values except the last `skipCount` — effectively a sliding delay that withholds the most recent N values until it knows they are not the final ones.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — skipping is count-based, not time-based |
| **Value-sensitive** | No — does not inspect value content; skips by trailing position |
| **Lossy** | Yes — the last `skipCount` values are permanently discarded |
| **Completion required** | No — emits as values arrive (with a delay of `skipCount` positions); but the last `skipCount` values are only known to be "last" at source completion |

**Completion behaviour** — `skipLast` maintains an internal ring buffer of size `skipCount`. As the source emits, it forwards the oldest buffered value (i.e. each new value displaces the oldest, which is emitted). The last `skipCount` values in the buffer at the time the source completes are discarded. If the source never completes, values are still forwarded with a lag of `skipCount` positions — the trailing values simply accumulate in the buffer indefinitely.

**Lossy behaviour** — the last `skipCount` values emitted by the source are permanently discarded. All others are forwarded (with a positional delay of `skipCount`).

---

#### Marble Diagram

```
source:  --a--b--c--d--e--|
         skipLast(2)
output:  ----------a--b--c--|
```

Values `d` and `e` (the last 2) are discarded. Each value is delayed by 2 positions before appearing in output.

```
source:  --a--b--|   (only 2 values, skipCount = 2)
         skipLast(2)
output:  --------|   (nothing emitted — all values are in the "last 2")
```

---

#### Signature

```typescript
skipLast<T>(skipCount: number): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Drop trailing sentinel or summary records from a data stream (e.g. a CSV where the last row is a total).
- Discard the final N items from a finite list stream before processing.
- Implement a sliding window where you always want to withhold the most recent N items until confirmed they are not the tail.

---

#### Code Example

```typescript
import { of } from 'rxjs'
import { skipLast } from 'rxjs/operators'

// Stream of CSV rows where the last row is a summary — discard it
const rows$ = of(
	'Alice,100',
	'Bob,200',
	'Charlie,150',
	'TOTAL,450'   // trailing summary — should be skipped
)

const dataRows$ = rows$.pipe(skipLast(1))

dataRows$.subscribe((row: string) => processRow(row))
// 'Alice,100'
// 'Bob,200'
// 'Charlie,150'
// 'TOTAL,450' is discarded
```

---

#### Gotchas

1. **Emits with a lag even on infinite streams** — `skipLast(n)` introduces a buffer of depth `n`. On an infinite stream that never completes, it behaves like a delay of `n` positions: value `k` is emitted when value `k+n` arrives. The buffer never flushes the tail values, but the rest of the stream still flows through.

2. **`skipLast(n)` where n ≥ stream length emits nothing** — if the source emits fewer or equal values than `skipCount`, the entire output is empty (all values end up as the "last n").

3. **Not the same as buffering the tail** — `skipLast` discards the tail; it does not expose it. If you need the tail values for something else, use `takeLast` on a shared stream.

4. **Memory** — the internal buffer always holds `skipCount` values. For large `skipCount` on high-frequency streams, memory usage scales linearly.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `skip` | Discards the first N values | You want to drop leading, not trailing values |
| `takeLast` | Keeps only the last N values (requires completion) | You want the tail, not everything except the tail |
| `take` | Keeps the first N values and completes | You want the head of the stream |
| `skipWhile` | Skips while a predicate is true | The skip condition depends on value content |

---

#### Decision Rule

> Use `skipLast(n)` when you need to **discard the trailing N values** of a stream. Prefer `skip(n)` to discard leading values, and `takeLast(n)` when you want only the tail.
