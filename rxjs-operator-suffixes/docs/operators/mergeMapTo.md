---
operator: mergeMapTo
family: Transformation
lossy: false
completionRequired: false
timeSensitive: false
valueSensitive: false
date: 2026-03-29
---

### `mergeMapTo<T>(innerObservable: ObservableInput<T>, concurrent?: number)` *(deprecated)*

> Projects every source value to the **same** static inner Observable (ignoring the source value) and merges all resulting subscriptions concurrently — a fixed-target shorthand for `mergeMap`.

---

#### Classification

| Property | Value |
|----------|-------|
| **Family** | Transformation |
| **Time-sensitive** | No — subscribes immediately regardless of timing |
| **Value-sensitive** | No — the source value is completely ignored; all emissions map to the same inner Observable |
| **Lossy** | No — a new inner subscription is started for each source value; all inner emissions are forwarded |
| **Completion required** | No — emits on every inner emission; completes when the source completes and all inner subscriptions finish |

**Completion behaviour** — identical to `mergeMap`: does not complete until the source completes AND all active inner subscriptions have completed.

**Lossy behaviour** — not lossy. Every source value triggers a new subscription to the inner Observable, and all emissions from all inner subscriptions are forwarded.

---

#### Marble Diagram

```
source:     --a--------b--------|
innerObs$:  ---1--2--|
            mergeMapTo(innerObs$)
output:     ----1--2-----1--2---|
```

Each source emission starts a fresh subscription to `innerObs$`.

---

#### Signature

```typescript
/** @deprecated Use mergeMap(() => innerObservable) instead — will be removed in v8 */
mergeMapTo<T, R, O extends ObservableInput<unknown>>(
	innerObservable: O,
	concurrent?: number
): OperatorFunction<T, ObservedValueOf<O>>
```

**RxJS 7 note:** `mergeMapTo` is deprecated in RxJS 7 and will be removed in RxJS 8. The direct replacement is `mergeMap(() => innerObservable)`.

---

#### When to Use

- **Avoid in new code** — prefer `mergeMap(() => inner$)` which is equally concise and not deprecated.
- When migrating RxJS 6 codebases, be aware of this operator and replace it during the upgrade.

---

#### Code Example

```typescript
// Deprecated — do not use in new code
import { fromEvent } from 'rxjs'
import { mergeMapTo } from 'rxjs/operators'

const refresh$ = fromEvent(document.getElementById('refresh')!, 'click').pipe(
	mergeMapTo(fetchData$())
)

// Preferred replacement
import { fromEvent } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

const refresh$ = fromEvent(document.getElementById('refresh')!, 'click').pipe(
	mergeMap(() => fetchData$())
)
```

---

#### Gotchas

1. **Deprecated in RxJS 7, removed in RxJS 8** — do not use in new code. Migrate all existing uses to `mergeMap(() => inner$)`.

2. **Cold vs hot inner Observable** — if `innerObservable` is cold (e.g. an HTTP Observable), each source emission creates a new, independent execution. If it is hot (e.g. a `Subject`), all subscriptions share the same stream — behaviour differs significantly.

---

#### Related Operators

| Operator | Key difference | Choose when |
|----------|---------------|-------------|
| `mergeMap` | Projects each source value to a (potentially different) inner Observable | New code — always prefer this |
| `switchMapTo` | Also deprecated; maps to same inner but cancels the previous | Avoid — use `switchMap(() => inner$)` |
| `concatMapTo` | Also deprecated; serialises inner subscriptions | Avoid — use `concatMap(() => inner$)` |

---

#### Decision Rule

> Do **not** use `mergeMapTo` in new code. Replace all occurrences with `mergeMap(() => innerObservable)`.
