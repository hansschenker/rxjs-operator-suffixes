---
operator: distinctUntilKeyChanged
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `distinctUntilKeyChanged<T, K extends keyof T>(key: K, compare?: (x: T[K], y: T[K]) => boolean)`

> Suppresses consecutive duplicate emissions by comparing a **single named property** of each object — a focused shorthand for `distinctUntilChanged` with a key selector.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — comparison is between consecutive values, not based on timing |
| **Value-sensitive** | Yes — inspects a specific property of each value to determine equality |
| **Lossy** | Yes — values where the specified key has not changed since the last emission are dropped |
| **Completion required** | No — emits immediately on each distinct value; works correctly on infinite sources |

**Completion behaviour** — identical to `distinctUntilChanged`: evaluates the key synchronously on each emission, no buffering, runs indefinitely on infinite sources.

**Lossy behaviour** — drops consecutive emissions where `current[key] === previous[key]` (or the custom comparator returns `true`). All other properties of the object are irrelevant to the comparison.

---

#### Marble Diagram

```
source:  --{a:1,b:'x'}--{a:1,b:'y'}--{a:2,b:'y'}--|
         distinctUntilKeyChanged('a')
output:  --{a:1,b:'x'}----------------{a:2,b:'y'}--|
```

The second emission (`{a:1,b:'y'}`) is suppressed because `a` did not change, even though `b` did.

---

#### Signature

```typescript
distinctUntilKeyChanged<T, K extends keyof T>(
	key: K
): MonoTypeOperatorFunction<T>

distinctUntilKeyChanged<T, K extends keyof T>(
	key: K,
	compare: (x: T[K], y: T[K]) => boolean
): MonoTypeOperatorFunction<T>
```

TypeScript enforces that `key` is a valid property of `T` — misspelled keys are caught at compile time.

---

#### When to Use

- Re-render a component only when a specific field of a state object changes (e.g. only when `user.name` changes, ignoring other state updates).
- Deduplicate route navigation events based on the `path` property.
- Suppress repeated API calls when the relevant query parameter has not changed.
- Filter WebSocket messages where the `type` field is unchanged from the previous message.

---

#### Code Example

```typescript
import { BehaviorSubject } from 'rxjs'
import { distinctUntilKeyChanged, map } from 'rxjs/operators'

interface User {
	id: number
	name: string
	avatar: string
}

interface AppState {
	user: User
	theme: string
}

const state$ = new BehaviorSubject<AppState>({
	user: { id: 1, name: 'Alice', avatar: 'a.png' },
	theme: 'light'
})

// Only emit when user.name changes — ignore theme changes and avatar changes
const userName$ = state$.pipe(
	map((s: AppState) => s.user),
	distinctUntilKeyChanged('name')
)

userName$.subscribe((user: User) => renderUserName(user.name))

state$.next({ ...state$.value, theme: 'dark' })
// theme changed — userName$ does NOT emit (user.name unchanged)

state$.next({ ...state$.value, user: { ...state$.value.user, avatar: 'b.png' } })
// avatar changed — userName$ does NOT emit (name unchanged)

state$.next({ ...state$.value, user: { ...state$.value.user, name: 'Bob' } })
// name changed — userName$ DOES emit
```

With a custom comparator for case-insensitive comparison:

```typescript
import { Subject } from 'rxjs'
import { distinctUntilKeyChanged } from 'rxjs/operators'

interface SearchEvent {
	query: string
	page: number
}

const search$ = new Subject<SearchEvent>()

// Treat queries as equal regardless of case
const distinct$ = search$.pipe(
	distinctUntilKeyChanged(
		'query',
		(prev: string, curr: string) => prev.toLowerCase() === curr.toLowerCase()
	)
)
```

---

#### Gotchas

1. **Default comparison is `===` on the key value** — for keys whose values are objects or arrays, two different references with identical content are considered distinct. Provide a custom comparator for deep equality on nested objects.

2. **Only the specified key is compared** — all other properties are ignored for the purpose of suppression. The full object is still forwarded when the key does change; `distinctUntilKeyChanged` does not project or transform the value.

3. **TypeScript key safety** — the `key` parameter is `keyof T`, so TypeScript enforces valid property names at compile time. This is a significant advantage over using `distinctUntilChanged` with a manual key selector.

4. **Same consecutive-only caveat as `distinctUntilChanged`** — suppresses only consecutive duplicates. The same key value can appear multiple times in the output if a different value appears in between.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `distinctUntilChanged` | Compares the whole value or uses a key selector + comparator | You need to compare computed values, multiple keys, or non-property logic |
| `distinct` | Global deduplication — never re-emits a previously seen key value | You want to suppress all occurrences of a key value, not just consecutive ones |
| `filter` | General predicate filtering | You need arbitrary conditional suppression beyond equality |
| `map` + `distinctUntilChanged` | Explicit projection then deduplication | You need to project to a derived value before comparing |

---

#### Decision Rule

> Use `distinctUntilKeyChanged` when you want to **suppress consecutive emissions where a single named property has not changed** — it is the cleanest, most type-safe way to deduplicate state slices by one key. Use `distinctUntilChanged` with a custom comparator when comparing multiple keys or computed values.
