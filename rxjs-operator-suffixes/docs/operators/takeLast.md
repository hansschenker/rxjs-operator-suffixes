---
operator: takeLast
family: Filtering
lossy: true
completionRequired: true
timeSensitive: false
valueSensitive: false
date: 2026-03-24
---

### `takeLast<T>(count: number)`

> Buffer the last `count` values from the source and emit them all at once when the source completes — the mirror image of `take`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — position relative to completion, not timing |
| **Value-sensitive** | No — never inspects value content, only counts from the end |
| **Lossy** | Yes — all values except the last `count` are silently discarded |
| **Completion required** | Yes — emits nothing until the source completes |

**Completion behaviour** — `takeLast` buffers up to `count` values in a rolling internal queue throughout the source's lifetime. It emits nothing until the source completes, at which point it flushes the buffered values synchronously in arrival order, then completes itself. **If the source never completes, `takeLast` emits nothing and the buffer grows unboundedly** — never use `takeLast` on an infinite stream.

**Lossy behaviour** — `takeLast` is lossy for everything except the final `count` values. The internal buffer is a fixed-size sliding window: when full, the oldest entry is dropped on each new arrival.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--|
         takeLast(3)
output:  -----------------(c-d-e)|

// takeLast(1) — only the last value:
source:  --a--b--c--|
         takeLast(1)
output:  -----------(c)|

// Infinite source — never emits:
source:  --a--b--c--d-- (no completion)
         takeLast(2)
output:  (nothing ever emitted)
```

---

#### Signature

```typescript
takeLast<T>(count: number): MonoTypeOperatorFunction<T>
```

Throws `ArgumentOutOfRangeError` if `count < 0`. `takeLast(0)` completes immediately on source completion, emitting nothing.

---

#### When to Use

- Extract the last N items from a finite HTTP response or file read stream
- Get the final state snapshot(s) from a stream before it closes
- Collect the last N log lines from a command output Observable
- Use `takeLast(1)` as a lighter alternative to `last()` when you want no error on an empty stream

---

#### Code Example

```typescript
import { of, from } from 'rxjs'
import { takeLast, map, toArray } from 'rxjs/operators'

// Scenario: paginated API — fetch all pages, keep only the last 3 results

const pages$ = fetchAllPages()   // finite stream of Page objects

const lastThreePages$ = pages$.pipe(
	takeLast(3),
)

lastThreePages$.subscribe(page => renderPage(page))

// ---

// Scenario: get only the final accumulated state after a
// finite batch of actions replays through the reducer

const replayedActions$ = from(storedActions)   // finite array → Observable

const finalState$ = replayedActions$.pipe(
	scan(reducer, initialState),
	takeLast(1),   // emit only the final reduced state
)

finalState$.subscribe(state => hydratStore(state))
```

---

#### Gotchas

1. **Stalls forever on infinite sources** — This is the most dangerous gotcha. `interval()`, `fromEvent()`, `Subject` without explicit completion — any of these paired with `takeLast` will never emit and will leak memory as the buffer continues to receive values. Always ensure the source is finite or add a `take(n)` / `takeUntil` upstream.

2. **All buffered values emit synchronously on completion** — `takeLast(n)` does not spread the final emissions over time; they all fire in the same microtask. Downstream operators will process them synchronously one after another.

3. **`takeLast(1)` vs `last()`** — `last()` throws `EmptyError` if the source completes without emitting; `takeLast(1)` completes silently. Choose based on whether an empty source is an error in your domain.

4. **Memory: buffer size is unbounded in count terms** — The buffer holds exactly `count` values of type `T`. For large `count` values with heavy objects, this can be significant. The buffer is not released until source completion.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `take(n)` | Takes the **first** n values — no completion required | You need the head of a stream, not the tail |
| `last(predicate?)` | Emits one value, throws on empty | You need exactly the last value and empty is an error |
| `skipLast(n)` | Emits everything **except** the last n values | You want to trim the tail rather than keep it |
| `toArray()` | Collects **all** values into one array on completion | You need every value, not just the last n |
| `reduce(acc, seed)` | Folds all values into a single result on completion | You need a computed summary, not the raw last values |

---

#### Decision Rule

> Use `takeLast(n)` when you need the **last n values of a finite stream** emitted together on completion. Never use it on infinite streams — add `take(n)` or `takeUntil` first to guarantee completion.
