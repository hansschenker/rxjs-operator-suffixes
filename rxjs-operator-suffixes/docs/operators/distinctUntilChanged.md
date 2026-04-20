---
operator: distinctUntilChanged
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `distinctUntilChanged<T>(comparator?: (previous: T, current: T) => boolean)`

> Suppresses consecutive duplicate emissions — only forwards a value when it is different from the immediately preceding value, using strict equality (`===`) by default or a custom comparator.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — comparison is between consecutive values, not based on timing |
| **Value-sensitive** | Yes — compares the content of each value against the previous one |
| **Lossy** | Yes — consecutive duplicate values are silently dropped |
| **Completion required** | No — emits immediately on each distinct value; works correctly on infinite sources |

**Completion behaviour** — `distinctUntilChanged` evaluates each incoming value against the last emitted value synchronously. It does not buffer. If the source never completes, `distinctUntilChanged` runs indefinitely — this is the normal, intended use.

**Lossy behaviour** — consecutive duplicates are dropped. Non-consecutive duplicates (the same value appearing again after a different value in between) are forwarded normally. Only the immediately preceding emitted value is compared.

---

#### Marble Diagram

```
source:  --a--a--b--b--b--a--c--|
         distinctUntilChanged()
output:  --a-----b-----------a--c--|
```

Non-consecutive repeats pass through:
```
source:  --a--b--a--b--|
         distinctUntilChanged()
output:  --a--b--a--b--|   (all pass — no two consecutive are equal)
```

---

#### Signature

```typescript
distinctUntilChanged<T>(): MonoTypeOperatorFunction<T>

distinctUntilChanged<T>(
	comparator: (previous: T, current: T) => boolean
): MonoTypeOperatorFunction<T>

// Key selector overload (use distinctUntilKeyChanged for cleaner syntax)
distinctUntilChanged<T, K>(
	comparator: (previous: K, current: K) => boolean,
	keySelector: (value: T) => K
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Prevent redundant re-renders or API calls when a `BehaviorSubject`-backed state emits the same value multiple times.
- Suppress no-op state transitions in an MVU reducer (same state in, same state out).
- Avoid duplicate HTTP requests when a search input re-emits the same term.
- Filter out unchanged form field values in a reactive form pipeline.
- Deduplicate rapid consecutive sensor readings before processing.

---

#### Code Example

```typescript
import { BehaviorSubject } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'

interface AppState {
	count: number
	label: string
}

const state$ = new BehaviorSubject<AppState>({ count: 0, label: 'idle' })

// Only re-render the count when it actually changes
const count$ = state$.pipe(
	map((s: AppState) => s.count),
	distinctUntilChanged()
)

count$.subscribe((count: number) => renderCount(count))

state$.next({ count: 0, label: 'updated' })  // count unchanged — no render
state$.next({ count: 1, label: 'updated' })  // count changed — renders
state$.next({ count: 1, label: 'done' })     // count unchanged — no render
```

With a custom comparator for object state:

```typescript
import { Subject } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'

interface Position {
	x: number
	y: number
}

const position$ = new Subject<Position>()

// Suppress positions that haven't moved more than 5px
const significant$ = position$.pipe(
	distinctUntilChanged(
		(prev: Position, curr: Position) =>
			Math.abs(curr.x - prev.x) < 5 && Math.abs(curr.y - prev.y) < 5
	)
)
```

**MVU context** — essential for deriving sub-state slices without unnecessary downstream emissions:

```typescript
import { shareReplay, map, distinctUntilChanged } from 'rxjs/operators'

// Each selector only emits when its specific slice changes
const userName$ = state$.pipe(
	map((s) => s.user.name),
	distinctUntilChanged(),
	shareReplay(1)
)
```

---

#### Gotchas

1. **Default comparison is `===` (reference equality)** — for objects and arrays, two different references with identical content are considered distinct. Always provide a custom comparator (or use `distinctUntilKeyChanged`) when comparing objects by value.

2. **Only suppresses *consecutive* duplicates** — `distinctUntilChanged` is not a set-based deduplication. The same value can appear multiple times in the output as long as a different value appears in between. Use `distinct` for global deduplication.

3. **The first value always passes through** — there is no "previous" value for the first emission, so it is always forwarded regardless of content.

4. **Comparator returning `true` means "same" (suppress)** — the comparator's return value is `true` when values are considered equal (i.e. suppress). This is the opposite of the sort comparator convention. A common mistake is to return `true` when values differ, which inverts the filtering logic.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `distinct` | Global deduplication using a set — never re-emits any previously seen value | You want to suppress all duplicates, not just consecutive ones |
| `distinctUntilKeyChanged` | Shorthand for comparing a single named key on an object | You only need to compare one property |
| `filter` | General-purpose predicate filtering | You need arbitrary conditional suppression, not equality comparison |
| `debounceTime` | Suppresses rapid emissions by time window | You want to suppress based on timing, not value equality |

---

#### Decision Rule

> Use `distinctUntilChanged` when you want to **suppress consecutive emissions of the same value** — especially on state streams derived from `BehaviorSubject`. Provide a custom comparator for object comparison; use `distinct` for global deduplication across the entire stream lifetime.
