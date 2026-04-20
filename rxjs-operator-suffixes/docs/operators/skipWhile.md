---
operator: skipWhile
family: Filtering
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: true
date: 2026-03-29
---

### `skipWhile<T>(predicate: (value: T, index: number) => boolean)`

> Ignores source values as long as the predicate returns `true`, then forwards **all** subsequent values unconditionally once it returns `false` for the first time — skipping stops permanently on the first failing value.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Filtering |
| **Time-sensitive** | No — skipping is predicate-based, not time-based |
| **Value-sensitive** | Yes — the predicate inspects each value to decide whether to continue skipping |
| **Lossy** | Yes — all values emitted while the predicate holds true are permanently discarded |
| **Completion required** | No — emits from the first value that fails the predicate onwards; works on infinite sources |

**Completion behaviour** — `skipWhile` evaluates the predicate on each incoming value. Once the predicate returns `false`, all subsequent values (including that first failing value) are forwarded unconditionally — the predicate is never evaluated again. If the source never emits a value that fails the predicate, `skipWhile` discards all values and the output is empty.

**Lossy behaviour** — all values emitted before (and not including) the first predicate failure are permanently discarded. The first failing value and everything after it are forwarded.

---

#### Marble Diagram

```
source:  --1--2--3--4--3--2--1--|
         skipWhile(x => x < 4)
output:  ----------4--3--2--1--|
```

Once `4` arrives (first value failing `x < 4`), all subsequent values pass through — including `3`, `2`, `1` which would have been skipped initially.

---

#### Signature

```typescript
skipWhile<T>(
	predicate: (value: T, index: number) => boolean
): MonoTypeOperatorFunction<T>
```

---

#### When to Use

- Skip loading/initialising states at the start of a stream before the app is ready (e.g. skip while `status === 'loading'`).
- Discard values from a stream until a threshold is first crossed (e.g. skip sensor readings below a minimum).
- Skip replayed historical values from a `ReplaySubject` until the stream catches up to "live" data.
- Gate a pipeline until an initial condition is satisfied, then let everything through.

---

#### Code Example

```typescript
import { BehaviorSubject } from 'rxjs'
import { skipWhile, distinctUntilChanged } from 'rxjs/operators'

type AppStatus = 'initialising' | 'loading' | 'ready' | 'error'

interface AppState {
	status: AppStatus
	data: string[]
}

const state$ = new BehaviorSubject<AppState>({ status: 'initialising', data: [] })

// Only start reacting to state once the app has finished initialising
const ready$ = state$.pipe(
	skipWhile((s: AppState) => s.status === 'initialising' || s.status === 'loading'),
	distinctUntilChanged()
)

ready$.subscribe((state: AppState) => renderApp(state))

state$.next({ status: 'loading', data: [] })        // skipped
state$.next({ status: 'ready', data: ['item1'] })   // forwarded — gate opens
state$.next({ status: 'ready', data: ['item2'] })   // forwarded (gate stays open)
```

---

#### Gotchas

1. **The gate opens permanently on the first failure** — once `skipWhile` stops skipping, it never re-evaluates the predicate. Even if later values would have matched the original skip condition, they pass through. If you need repeated conditional filtering, use `filter` instead.

2. **`skipWhile` vs `filter`** — `skipWhile` is a one-way gate (skip until condition fails, then let everything through). `filter` re-evaluates the predicate on every value throughout the stream's lifetime. Use `filter` when the condition must be checked continuously.

3. **If predicate never returns `false`, output is empty** — if all source values satisfy the predicate, `skipWhile` discards them all and the output stream completes empty (or runs forever empty on infinite sources).

4. **The first failing value is forwarded** — the value that causes the gate to open is included in the output. This is correct and intentional but occasionally surprises people who expect a "skip until" with the trigger value excluded.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `skip` | Skips a fixed count unconditionally | The number to skip is known and constant |
| `skipUntil` | Skips until an external Observable emits | The gate is controlled by a separate event stream |
| `filter` | Re-evaluates predicate on every emission | You need continuous conditional filtering, not a one-way gate |
| `takeWhile` | Mirror image — forwards while predicate is true, then completes | You want the leading values, not everything after a threshold |

---

#### Decision Rule

> Use `skipWhile` when you need a **one-way gate that discards leading values until a condition is first met**, then lets everything through unconditionally. Use `filter` when the condition must be re-evaluated on every emission throughout the stream.
