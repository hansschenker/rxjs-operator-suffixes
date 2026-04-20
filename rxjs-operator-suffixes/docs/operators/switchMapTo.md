---
operator: switchMapTo
family: Transformation
lossy: true
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `switchMapTo<T>(innerObservable: ObservableInput<T>)` *(deprecated)*

> Projects every source value to the **same** static inner Observable (ignoring the source value) and switches to it, cancelling the previous inner — a fixed-target shorthand for `switchMap`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — switching is driven by new source values arriving, not by timing |
| **Value-sensitive** | No — the source value is completely ignored; all emissions switch to the same inner Observable |
| **Lossy** | Yes — any remaining emissions from the cancelled previous inner are silently discarded |
| **Completion required** | No — emits inner values as they arrive; switches on every new source value |

**Completion behaviour** — identical to `switchMap`: does not complete until the source completes AND the last active inner completes. Each new source value cancels the previous inner and starts a fresh subscription to `innerObservable`.

**Lossy behaviour** — lossy in the same way as `switchMap`. Emissions from the cancelled previous inner are permanently discarded.

---

#### Marble Diagram

```
source:     --a--------b--------|
innerObs$:  ---1--2--3...
            switchMapTo(innerObs$)
output:     ----1--2-----1--2---|
```

When `b` arrives, the subscription started by `a` is cancelled — value `3` is never emitted.

---

#### Signature

```typescript
/** @deprecated Use switchMap(() => innerObservable) instead — will be removed in v8 */
switchMapTo<T, R, O extends ObservableInput<unknown>>(
	innerObservable: O
): OperatorFunction<T, ObservedValueOf<O>>
```

**RxJS 7 note:** `switchMapTo` is deprecated in RxJS 7 and will be removed in RxJS 8. The direct replacement is `switchMap(() => innerObservable)`.

---

#### When to Use

- **Avoid in new code** — prefer `switchMap(() => inner$)` which is equally concise and not deprecated.
- When migrating RxJS 6 codebases, identify and replace all `switchMapTo` calls during the upgrade.

---

#### Code Example

```typescript
// Deprecated — do not use in new code
import { fromEvent } from 'rxjs'
import { switchMapTo } from 'rxjs/operators'

const result$ = fromEvent(document.getElementById('refresh')!, 'click').pipe(
	switchMapTo(fetchData$())
)

// Preferred replacement
import { fromEvent } from 'rxjs'
import { switchMap } from 'rxjs/operators'

const result$ = fromEvent(document.getElementById('refresh')!, 'click').pipe(
	switchMap(() => fetchData$())
)
```

---

#### Gotchas

1. **Deprecated in RxJS 7, removed in RxJS 8** — do not use in new code. Migrate all existing uses to `switchMap(() => inner$)`.

2. **Cold inner creates a fresh execution per switch** — if `innerObservable` is cold (e.g. an HTTP request), each source emission cancels the previous execution and starts a new one. If it is hot (e.g. a shared `Subject`), all switches connect to the same stream — the cancellation only stops delivery to this pipeline, not the upstream source.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `switchMap` | Projects each source value to a (potentially different) inner Observable | New code — always prefer this |
| `mergeMapTo` | Also deprecated; maps to same inner but keeps all running concurrently | Avoid — use `mergeMap(() => inner$)` |
| `concatMapTo` | Also deprecated; maps to same inner but serialises | Avoid — use `concatMap(() => inner$)` |

---

#### Decision Rule

> Do **not** use `switchMapTo` in new code. Replace all occurrences with `switchMap(() => innerObservable)`.
