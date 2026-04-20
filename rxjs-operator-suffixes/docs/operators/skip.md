---
operator: skip
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `skip<T>(count: number)`

> Ignores the first `count` emissions from the source and forwards everything after — the mirror image of `take`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — skipping is count-based, not time-based |
| **Value-sensitive** | No — does not inspect value content; skips by position only |
| **Lossy** | Yes — the first `count` values are permanently discarded |
| **Completion required** | No — emits from position `count+1` onwards; works correctly on infinite sources |

**Completion behaviour** — `skip` discards the first `count` values silently, then forwards all subsequent values until the source completes. It does not buffer anything. If the source never completes, `skip` runs indefinitely after the initial skip phase.

**Lossy behaviour** — the first `count` values are permanently discarded. Everything from position `count+1` onwards is forwarded unchanged.

---

#### Marble Diagram

```
source:  --a--b--c--d--e--|
         skip(2)
output:  ----------c--d--e--|
```

---

#### Signature

```typescript
skip<T>(count: number): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Skip the initial seed/replay value from a `BehaviorSubject` when you only want new emissions, not the current state.
- Skip a known header or metadata record at the start of a data stream.
- Discard warmup emissions from an interval or timer before processing begins.
- Skip the first N results of a paginated stream when resuming from an offset.

---

#### Code Example

```typescript
import { BehaviorSubject } from 'rxjs'
import { skip } from 'rxjs/operators'

interface AppState {
	count: number
}

const state$ = new BehaviorSubject<AppState>({ count: 0 })

// BehaviorSubject replays the current value on subscription — skip it
// to only react to future state changes, not the initial value
const changes$ = state$.pipe(skip(1))

changes$.subscribe((state: AppState) => {
	console.log('State changed:', state)
})

state$.next({ count: 1 })  // logged
state$.next({ count: 2 })  // logged
// Initial { count: 0 } was skipped
```

---

#### Gotchas

1. **`skip(1)` on a `BehaviorSubject`** — the most common use case: `BehaviorSubject` always replays its current value on subscription. `skip(1)` discards that initial replay and only reacts to subsequent `.next()` calls. This is a well-established pattern but easy to forget.

2. **`skip` vs `skipWhile`** — `skip(n)` is count-based and unconditional; `skipWhile(predicate)` is condition-based and stops skipping as soon as the predicate returns false. Use `skip` when the number to skip is known up front.

3. **Skipped values are gone** — there is no way to retrieve skipped values after the fact. If you might need them, consider `share` + two pipelines, or buffer the stream before splitting.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `take` | Keeps the first N values and completes | You want the first N values, not everything after N |
| `skipWhile` | Skips values while a predicate is true | The number to skip is not fixed; depends on value content |
| `skipUntil` | Skips values until another Observable emits | Skipping is controlled by an external event |
| `skipLast` | Skips the last N values (requires source completion) | You want to drop trailing values, not leading ones |

---

#### Decision Rule

> Use `skip(n)` when you need to **discard a fixed number of leading values** by position. Prefer `skipWhile` when the skip condition depends on value content, and `skipUntil` when an external signal controls when to start emitting.
