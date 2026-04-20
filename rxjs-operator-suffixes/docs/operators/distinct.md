---
operator: distinct
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `distinct<T, K>(keySelector?: (value: T) => K, flushes?: ObservableInput<unknown>)`

> Suppresses **all previously seen values** for the lifetime of the stream — only forwards a value if it has never been emitted before, using an internal `Set` to track seen values.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — decisions are based on value history, not on when values arrive |
| **Value-sensitive** | Yes — inspects each value (or its key) to determine if it has been seen before |
| **Lossy** | Yes — any value that has been previously emitted is permanently dropped |
| **Completion required** | No — emits immediately on each unseen value; works on infinite sources (with memory caveats) |

**Completion behaviour** — `distinct` forwards each value synchronously if it has not been seen before, otherwise silently drops it. It does not buffer anything. If the source never completes, `distinct` runs indefinitely — but the internal `Set` grows unboundedly, which is a memory concern for long-running infinite streams.

**Lossy behaviour** — any value (or key) that has been emitted at any prior point in the stream's lifetime is dropped permanently. Unlike `distinctUntilChanged`, non-consecutive repetitions are also suppressed.

---

#### Marble Diagram

```
source:  --a--b--a--c--b--d--|
         distinct()
output:  --a--b-----c-----d--|
```

Both repeated `a` (position 3) and repeated `b` (position 5) are suppressed even though they are not consecutive.

With a `keySelector`:
```
source:  --{id:1}--{id:2}--{id:1}--{id:3}--|
         distinct(x => x.id)
output:  --{id:1}--{id:2}-----------{id:3}--|
```

---

#### Signature

```typescript
distinct<T, K>(
	keySelector?: (value: T) => K,
	flushes?: ObservableInput<unknown>
): MonoTypeOperatorFunction<T>
```

- **`keySelector`** — optional function to extract the comparison key from each value. If omitted, the whole value is used as the key.
- **`flushes`** — optional Observable; when it emits, the internal `Set` is cleared and all values are treated as unseen again.

---

#### When to Use

- Deduplicate a stream of IDs where the same ID may appear multiple times across the stream lifetime (e.g. WebSocket events for the same entity).
- Filter out repeated items in a paginated list stream where the same item might appear on multiple pages.
- Ensure a one-time action is only triggered once per unique value (e.g. show a notification once per unique error code).
- Use with `flushes` to reset the seen-set periodically (e.g. clear deduplication every hour on a long-running stream).

---

#### Code Example

```typescript
import { from } from 'rxjs'
import { distinct } from 'rxjs/operators'

interface Event {
	id: number
	type: string
}

// Deduplicate events by id — each event id only processed once
const events$ = from([
	{ id: 1, type: 'click' },
	{ id: 2, type: 'hover' },
	{ id: 1, type: 'click' },  // duplicate id — suppressed
	{ id: 3, type: 'focus' },
	{ id: 2, type: 'hover' },  // duplicate id — suppressed
])

const uniqueEvents$ = events$.pipe(
	distinct((e: Event) => e.id)
)

uniqueEvents$.subscribe((e: Event) => console.log(e))
// { id: 1, type: 'click' }
// { id: 2, type: 'hover' }
// { id: 3, type: 'focus' }
```

With `flushes` to reset the seen-set periodically:

```typescript
import { Subject, interval } from 'rxjs'
import { distinct } from 'rxjs/operators'

const events$ = new Subject<string>()

// Reset deduplication every 60 seconds
const flush$ = interval(60_000)

const deduplicated$ = events$.pipe(
	distinct((v: string) => v, flush$)
)
```

---

#### Gotchas

1. **Unbounded memory growth on infinite streams** — the internal `Set` accumulates every unique key seen since subscription (or the last flush). For long-running streams with high cardinality, this is a memory leak. Use `flushes` to periodically reset the set, or prefer `distinctUntilChanged` if only consecutive deduplication is needed.

2. **`distinct` vs `distinctUntilChanged`** — `distinct` is global (never re-emits any previously seen value); `distinctUntilChanged` is local (only suppresses consecutive repeats). Choose `distinctUntilChanged` for state streams where revisiting a prior value is valid; choose `distinct` when a value must genuinely appear only once.

3. **Default key is the whole value via `===`** — for objects, two distinct references with identical content are treated as different keys. Always provide a `keySelector` when working with objects.

4. **`flushes` emitting does not emit a value** — flushing the set is a side effect only; it does not cause the operator to emit anything. The next unique value after a flush will pass through as if it had never been seen.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `distinctUntilChanged` | Suppresses only consecutive duplicates; constant memory | Values may legitimately repeat later in the stream |
| `distinctUntilKeyChanged` | Consecutive deduplication by a single named key | You want consecutive deduplication on one object property |
| `filter` | Arbitrary predicate filtering | You need more complex suppression logic than equality |

---

#### Decision Rule

> Use `distinct` when a value must **never appear more than once in the output for the lifetime of the stream**. Prefer `distinctUntilChanged` when the same value may validly reappear after a different value, or when unbounded memory growth is a concern.
